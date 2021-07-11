"use strict";
const { close, open, read, writeBuffer, fstat, ftruncate, FSReqCallback } = process.binding('fs');
const { S_IFMT, S_IFREG } = require("fs").constants;
const oRdwrCreat = function loadAppendCreat() {
    const { O_RDWR, O_CREAT } = require("fs").constants;
    return O_RDWR | O_CREAT;
}();
const { toNamespacedPath } = require("path");
const QueueCallback = require("ca11back-queue");
let openFiles = {};
let removePrivate = null;
function queueOpenFileFd(next, filepath) {
    const req = new FSReqCallback();
    req.oncomplete = openFileFdAfterOpen;
    req.file = this;
    req.next = next;
    open(toNamespacedPath(filepath), oRdwrCreat, 0o666, req);
};
function openFileFdAfterOpen(error, fd) {
    if (error) throw error;
    this.file.fd = fd;
    this.next();
};
function queueReadFile(next, overwrite) {
    if (this.hasRead === true) return next();
    let req = new FSReqCallback();
    req.oncomplete = readAfterStats;
    req.context = {
        file: this,
        next,
        overwrite
    };
    fstat(this.fd, false, req);
};
function readAfterStats(error, stats) {
    if (error) throw error;
    const size = (stats[1] & S_IFMT) === S_IFREG ? stats[8] : 0;
    if (size === 0) {
        this.context.file.hasRead = true;
        return this.context.next();
    }
    this.context.buffer = Buffer.allocUnsafe(size);
    this.context.file.readFile(this.context);
};
function readFileAfterRead(error, bytesRead) {
    if (error) throw error;
    const context = this.context;
    context.file.parseReadContent(context.buffer, context.overwrite, context.next)
};
function queueWriteFile(next, buffer) {
    buffer = buffer ?? Buffer.from(this.public.$stringify(this.public));
    const req = new FSReqCallback();
    req.fd = this.fd;
    req.next = next;
    req.oncomplete = writeFileAfterWritebuffer;
    writeBuffer(this.fd, buffer, 0, buffer.length, 0, req);
};
function writeFileAfterWritebuffer(error, bytesWritten) {
    if (error) throw error;
    const req = new FSReqCallback();
    req.oncomplete = this.next;
    ftruncate(this.fd, bytesWritten, req)
};
function queueCloseFile(next, callback) {
    if (--this.connections === 0) {
        const req = new FSReqCallback();
        req.oncomplete = closeFileAfterCloseFd;
        req.context = { file: this, callback };
        return close(this.fd, req);
    }
    context.callback(false);
    next();
};
function closeFileAfterCloseFd(error) {
    if (error) throw error;
    const { file, callback } = this.context;
    delete (openFiles[file.filepath]);
    removePrivate.call(file.public);
    file.queue.destroy();
    file.queue = null;
    file.public = null;
    callback(true);
};
function queueCallback(next, callback) {
    callback(this.public)
    next();
};
function queueSaveAndDestroy(next, { log, callback } = context) {
    removePrivate.call(this.public);
    this.queue.destroy();
    this.public = null;
    log("saved " + this.filepath);
    callback();
};
class PrivateFileOperator {
    connections = 1;
    hasRead = false;
    filepath = null;
    queue = null;
    fd = null;
    constructor(_public, filepath) {
        this.public = _public;
        this.filepath = filepath;
        this.queue = new QueueCallback(this);
        this.queue.push(queueOpenFileFd, filepath);
    };
    readFile(context) {
        const req = new FSReqCallback();
        req.oncomplete = readFileAfterRead;
        req.context = context;
        read(this.fd, context.buffer, 0, context.buffer.length, 0, req);
    };
    parseReadContent(buffer, overwrite, next) {
        const _public = this.public;
        const source = _public.$parse(buffer.toString());
        if (overwrite === true)
            for (const prop in source)
                _public[prop] = _public[prop] || source[prop];
        else
            for (const prop in source)
                if (!_public[prop])
                    _public[prop] = source[prop];
        this.hasRead = true;
        next();
    };
    saveAndDestroy(log, callback) {
        this.public.$write(true);
        this.queue.push(queueSaveAndDestroy, { log, callback });
        return this;
    };
};
/**@callback onClose @param {boolean} isClosed*/
/**@callback onReady @param {FileOperator} self*/
/**@callback logOnSaved @param {string} filepath*/
class FileOperator {
    #private;
    #removePrivate() {
        this.#private = null;
    };
    /**Module for asynchronous reading and writing to a small configuration file.
     * @param {String} filepath*/
    constructor(filepath) {
        if (openFiles[filepath]) {
            openFiles[filepath].connections++;
            return openFiles[filepath].public;
        }
        this.#private = openFiles[filepath] = new PrivateFileOperator(this, filepath);
        if (removePrivate) removePrivate = this.#removePrivate;
    };
    /**Reads the file, parses the read content and then stores it in the fileOperator. If overwrite is true the content's properties overwrite the fileOperator's properties.
     * @param {boolean} overwrite*/
    $read(overwrite) {
        this.#private.queue.push(queueReadFile, overwrite);
        return this;
    };
    /**Stringifies the data and overwrites the file with the new string. If wait is true, data is not stringifying immediately but when it's write's turn in the queue.
     * @param {boolean} wait*/
    $write(wait) {
        this.#private.queue.push(queueWriteFile, wait === true ? null : Buffer.from(this.$stringify(this)));
        return this;
    };
    /**Passes over false to callback if another fileOperator is connected.
     * @param {onClose} callback*/
    $close(callback) {
        this.#private.queue.push(queueCloseFile, callback);
    };
    /**This method pushes the callback onto the queue. This callback is invoked only when all method calls prior to this callback have finished.
     * @param {onReady} callback*/
    $onReady(callback) {
        this.#private.queue.push(queueCallback, callback);
        return this;
    };
    /**When reading file content this method is invoked to parse the content. Default: return JSON.parse(data)
     * @param {srting} data @returns {*} parsed object*/
    $parse(data) {
        return JSON.parse(data);
    };
    /**When writing to the file this method is invoked to stringify the data. Default: return JSON.stringify(data)
     * @param {object} data @returns {string} stringified content of the data property*/
    $stringify(data) {
        return JSON.stringify(data);
    };
    get $filepath() {
        return this.#private.filepath;
    };
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
            file.saveAndDestroy(log, awaitCounter);
        }
    };
    /**Shows a list of all fileOperators in memory.*/
    static get list() {
        const list = [];
        for (const filepath in openFiles)
            list.push(openFiles[filepath].public);
        return list;
    };
};
module.exports = FileOperator;