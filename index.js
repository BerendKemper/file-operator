"use strict";
const { close, open, read, writeBuffer, fstat, ftruncate, FSReqCallback } = process.binding('fs');
const { S_IFMT, S_IFREG } = require("fs").constants;
const oRdwrCreat = function loadAppendCreat() {
    const { O_RDWR, O_CREAT } = require("fs").constants;
    return O_RDWR | O_CREAT;
}();
const { toNamespacedPath } = require("path");
const CallbackQueue = require("ca11back-queue");
let openFiles = {};
/**@callback onClose @param {boolean} isClosed*/
/**@callback onReady @param {FileOperator} self*/
/**@callback logOnSaved @param {string} filepath*/
class FileOperator {
    #connections = null;
    #hasRead = null;
    #filepath = null;
    #queue = null;
    #fd = null;
    /**Module for asynchronous reading and writing to a small configuration file.
     * @param {String} filepath*/
    constructor(filepath) {
        if (openFiles[filepath])
            openFiles[filepath].#connections++;
        else {
            this.#hasRead = false;
            this.#connections = 1;
            this.#filepath = filepath;
            openFiles[filepath] = this;
            this.#queue = new CallbackQueue(this);
            this.#queue.push(this.#queueOpenFileFd, filepath);
        }
        return openFiles[filepath];
    }
    #queueOpenFileFd(next, filepath) {
        const req = new FSReqCallback();
        req.oncomplete = this.#openFileFdAfterOpen;
        req.file = this;
        req.next = next;
        open(toNamespacedPath(filepath), oRdwrCreat, 0o666, req);
    }
    #openFileFdAfterOpen(error, fd) {
        if (error)
            throw error;
        this.file.#fd = fd;
        this.next();
    }
    /**Reads the file, parses the read content and then stores it in the fileOperator. If overwrite is true the content's properties overwrite the fileOperator's properties.
     * @param {boolean} overwrite*/
    $read(overwrite) {
        this.#queue.push(this.#queueReadFile, overwrite);
        return this;
    }
    #queueReadFile(next, overwrite) {
        if (this.#hasRead === true)
            return next();
        let req = new FSReqCallback();
        req.oncomplete = this.#readAfterStats;
        req.context = {
            file: this,
            next,
            overwrite
        };
        fstat(this.#fd, false, req);
    }
    #readAfterStats(error, stats) {
        if (error)
            throw error;
        const size = (stats[1] & S_IFMT) === S_IFREG ? stats[8] : 0;
        if (size === 0) {
            this.context.file.#hasRead = true;
            return this.context.next();
        }
        this.context.buffer = Buffer.allocUnsafe(size);
        this.context.file.#readFile(this.context);
    }
    #readFile(context) {
        const req = new FSReqCallback();
        req.oncomplete = this.#parseReadContent;
        req.context = context;
        read(this.#fd, context.buffer, 0, context.buffer.length, 0, req);
    }
    #parseReadContent(error, bytesRead) {
        if (error)
            throw error;
        const { file, buffer, overwrite, next } = this.context;
        const source = file.$parse(buffer.toString());
        if (overwrite === true)
            for (const prop in source)
                file[prop] = file[prop] || source[prop];
        else
            for (const prop in source)
                if (!file[prop])
                    file[prop] = source[prop];
        file.#hasRead = true;
        next();
    }
    /**Stringifies the data and overwrites the file with the new string. If wait is true, data is not stringifying immediately but when it's write's turn in the queue.
     * @param {boolean} wait*/
    $write(wait) {
        this.#queue.push(this.#queueWriteFile, wait === true ? null : Buffer.from(this.$stringify(this)));
        return this;
    }
    #queueWriteFile(next, buffer) {
        buffer = buffer ?? Buffer.from(this.$stringify(this));
        const req = new FSReqCallback();
        req.fd = this.#fd;
        req.next = next;
        req.oncomplete = this.#writeFileAfterWritebuffer;
        writeBuffer(this.#fd, buffer, 0, buffer.length, 0, req);
    }
    #writeFileAfterWritebuffer(error, bytesWritten) {
        if (error)
            throw error;
        const req = new FSReqCallback();
        req.oncomplete = this.next;
        ftruncate(this.fd, bytesWritten, req)
    }
    /**Passes over false to callback if another fileOperator is connected.
     * @param {onClose} callback*/
    $close(callback) {
        this.#queue.push(this.#queueCloseFile, callback);
    }
    #queueCloseFile(next, callback) {
        if (--this.#connections === 0) {
            const req = new FSReqCallback();
            req.oncomplete = this.#closeFileAfterCloseFd;
            req.context = { file: this, callback };
            return close(this.#fd, req);
        }
        callback(false);
        next();
    }
    #closeFileAfterCloseFd(error) {
        if (error)
            throw error;
        const { file, callback } = this.context;
        openFiles[file.#filepath] = null;
        file.#queue.destroy();
        file.#queue = null;
        callback(true);
    }
    /**This method pushes the callback onto the queue. This callback is invoked only when all method calls prior to this callback have finished.
     * @param {onReady} callback*/
    $onReady(callback) {
        this.#queue.push(this.#queueCallback, callback);
        return this;
    }
    #queueCallback(next, callback) {
        callback(this)
        next();
    }
    /**When reading file content this method is invoked to parse the content. Default: return JSON.parse(data)
     * @param {srting} data @returns {*} parsed object*/
    $parse(data) {
        return JSON.parse(data);
    }
    /**When writing to the file this method is invoked to stringify the data. Default: return JSON.stringify(data)
     * @param {object} data @returns {string} stringified content of the data property*/
    $stringify(data) {
        return JSON.stringify(data);
    }
    get $filepath() {
        return this.#filepath;
    }
    /**Writes and closes all existing FileOperator
     * @param {{log:logOnSaved callback:function}} options*/
    static saveAndExitAll(options = {}) {
        const { log = console.log, callback = () => console.log("closed all fileOperators") } = options;
        if (typeof log !== "function")
            throw new TypeError("logMessage is not a function");
        if (typeof callback !== "function")
            throw new TypeError("callback is not a function");
        const awaitCounter = () => {
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
            file.#queue.push(file.#queueSaveAndDestroy, { log, callback: awaitCounter });
        }
    }
    #queueSaveAndDestroy(next, { log, callback } = context) {
        this.#queue.destroy();
        log("saved " + this.#filepath);
        callback();
    }
    /**@returns {FileOperator[]}*/
    static get list() {
        const list = [];
        for (const filepath in openFiles)
            list.push(openFiles[filepath]);
        return list;
    }
}
module.exports = FileOperator;