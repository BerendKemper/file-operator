"use strict";
const { mkdir, open, fstat, read, writeBuffer, close, ftruncate, FSReqCallback } = process.binding('fs');
const { S_IFMT, S_IFREG } = require("fs").constants;
const oRdwrCreat = function loadAppendCreat() {
    const { O_RDWR, O_CREAT } = require("fs").constants;
    return O_RDWR | O_CREAT;
}();
const path = require("path");
const CallbackQueue = require("ca11back-queue");
let openFiles = {};
class FileOperator {
    #connections = 1;
    #hasRead = false;
    #filepath = null;
    #queue = null;
    #fd = null;
    constructor(filepath) {
        if (openFiles[filepath])
            openFiles[filepath].#connections++;
        else {
            this.#filepath = filepath;
            openFiles[filepath] = this;
            this.#queue = new CallbackQueue(this);
            this.#queue.push(this.#queueOpenFile, filepath);
        }
        return openFiles[filepath];
    }
    #queueOpenFile(file, next, filepath) {
        const req = new FSReqCallback();
        req.oncomplete = file.#queueOpenFileAfterMkdir;
        req.context = { filepath, next, file };
        mkdir(path.toNamespacedPath(path.dirname(filepath)), 0o777, true, req);
    }
    #queueOpenFileAfterMkdir(error) {
        if (error)
            throw error;
        const { context } = this;
        const req = new FSReqCallback();
        req.oncomplete = context.file.#openFileFdAfterOpen;
        req.context = context;
        open(path.toNamespacedPath(context.filepath), oRdwrCreat, 0o666, req);
    }
    #openFileFdAfterOpen(error, fd) {
        if (error)
            throw error;
        this.context.file.#fd = fd;
        this.context.next();
    }
    $read(overwrite) {
        this.#queue.push(this.#queueReadFile, overwrite);
        return this;
    }
    #queueReadFile(file, next, overwrite) {
        if (file.#hasRead === true)
            return next();
        let req = new FSReqCallback();
        req.oncomplete = file.#readAfterStats;
        req.context = { file, next, overwrite };
        fstat(file.#fd, false, req);
    }
    #readAfterStats(error, stats) {
        if (error)
            throw error;
        const size = (stats[1] & S_IFMT) === S_IFREG ? stats[8] : 0;
        const { context } = this;
        const { file } = context;
        if (size === 0) {
            file.#hasRead = true;
            return context.next();
        }
        const buffer = context.buffer = Buffer.allocUnsafe(size);
        const req = new FSReqCallback();
        req.oncomplete = file.#parseReadContent;
        req.context = context;
        read(file.#fd, buffer, 0, buffer.length, 0, req);
    }
    #parseReadContent(error, bytesRead) {
        if (error)
            throw error;
        const { file, buffer, overwrite, next } = this.context;
        const source = file.$parse(buffer.toString());
        if (overwrite === true)
            for (const prop in source)
                file[prop] = source[prop];
        else
            for (const prop in source)
                if (!file.hasOwnProperty(prop))
                    file[prop] = source[prop];
        file.#hasRead = true;
        next();
    }
    $write(wait) {
        this.#queue.push(this.#queueWriteFile, wait === true ? null : Buffer.from(this.$stringify(this)));
        return this;
    }
    #queueWriteFile(file, next, buffer) {
        buffer = buffer ?? Buffer.from(file.$stringify(file));
        const req = new FSReqCallback();
        req.fd = file.#fd;
        req.next = next;
        req.oncomplete = file.#writeFileAfterWritebuffer;
        writeBuffer(file.#fd, buffer, 0, buffer.length, 0, req);
    }
    #writeFileAfterWritebuffer(error, bytesWritten) {
        if (error)
            throw error;
        const req = new FSReqCallback();
        req.oncomplete = this.next;
        ftruncate(this.fd, bytesWritten, req)
    }
    $close(callback) {
        this.#queue.push(this.#queueCloseFile, callback);
    }
    #queueCloseFile(file, next, callback) {
        if (--file.#connections === 0) {
            const req = new FSReqCallback();
            req.oncomplete = file.#closeFileAfterCloseFd;
            req.context = { file, callback };
            return close(file.#fd, req);
        }
        if (typeof callback === "function")
            callback(null);
        next();
    }
    #closeFileAfterCloseFd(error) {
        if (error)
            throw error;
        const { file, callback } = this.context;
        openFiles[file.#filepath] = null;
        file.#queue.destroy();
        file.#queue = null;
        if (typeof callback === "function")
            callback(file.#filepath);
    }
    $onReady(callback, ...args) {
        this.#queue.push(this.#queueCallback, callback, ...args);
        return this;
    }
    #queueCallback(file, next, callback, ...args) {
        callback(file, ...args);
        next();
    }
    $parse(data) {
        return JSON.parse(data);
    }
    $stringify(data) {
        return JSON.stringify(data);
    }
    get $filepath() {
        return this.#filepath;
    }
    get $connections() {
        return this.#connections;
    }
    static saveAndExitAll(options = {}) {
        const { log, callback } = options;
        if (typeof log !== "function")
            log = console.log;
        if (typeof callback !== "function")
            callback = () => console.log("closed all fileOperators")
        const awaitCounter = (filepath) => {
            log("saved " + filepath);
            if (--counter === 0) {
                openFiles = {};
                process.nextTick(callback);
            }
        };
        let counter = 0;
        for (const filepath in openFiles) {
            counter++;
            const file = openFiles[filepath];
            file.$write(true);
            file.#queue.push(file.#queueSaveAndDestroy, awaitCounter);
        }
    }
    #queueSaveAndDestroy(file, next, callback) {
        const req = new FSReqCallback();
        req.oncomplete = file.#closeFileAfterCloseFd;
        req.context = { file, callback };
        return close(file.#fd, req);
    }
    static get list() {
        return Object.values(openFiles);
    }
}
module.exports = FileOperator;