"use strict";
const fs = require("fs");
const QueueCallback = require("ca11back-queue");
class CachedFileOp {
	connections = 1;
	constructor(fileOperator) {
		this.fileOperator = fileOperator;
	};
	connect() {
		this.connections++;
		return this.fileOperator;
	};
	write() {
		this.fileOperator.$write();
		return this;
	};
	destroy(log, callback) {
		this.queue.push(() => {
			this.queue.clear();
			log("saved " + this.filepath);
			callback();
		});
	};
};
let cache = {};
class FileOperator {
	#hasRead = false;
	#filepath;
	#queue;
	/**
	 * Module for asynchronous reading and writing to a small configuration file.
	 * @param {String} filepath 
	 */
	constructor(filepath) {
		if (!cache[filepath]) {
			cache[filepath] = new CachedFileOp(this);
			this.#filepath = cache[filepath].filepath = filepath;
			this.#queue = cache[filepath].queue = new QueueCallback();
		}
		else
			return cache[filepath].connect();
	};
	/**
	 * Once read the content is parsed and stored in data.
	 * @param {*} overwrite 
	 */
	$read(overwrite) {
		this.#queue.push(callback => {
			if (this.#hasRead === true)
				return callback();
			fs.readFile(this.#filepath, (error, data) => {
				if (error)
					return callback(this.#hasRead = true);
				data = data.toString();
				if (data.length > 2) {
					const source = this.$parse(data);
					if (overwrite === true) {
						for (const prop in source)
							this[prop] = source[prop];
					}
					else
						for (const prop in source)
							this[prop] = this[prop] || source[prop];
				}
				this.#hasRead = true;
				callback();
			});
		});
		return this;
	};
	/**
	 * Stringifies the data and overwrites the file with the new string. If wait is true,
	 * data is not stringifying immediately but when it's write's turn in the queue.
	 * @param {Boolean} wait 
	 */
	$write(wait) {
		let buffer;
		if (wait !== true)
			buffer = Buffer.from(this.$stringify(this));
		this.#queue.push(callback => {
			fs.writeFile(this.#filepath, buffer || Buffer.from(this.$stringify(this)), callback);
		});
		return this;
	};
	/**
	 * If closed returns true. When false something else is using it.
	 */
	$close(callback) {
		this.#queue.push(_callback => {
			if (--cache[this.#filepath].connections === 0) {
				delete (cache[this.#filepath]);
				this.#queue.clear();
				return callback();
			}
			callback();
			_callback();
		});
		return this;
	};
	/**
	 * This method pushes the callback onto the callstack. This callback is invoked only
	 * when all method calls prior to this callback have finished.
	 * @param {*} callback 
	 */
	$onReady(callback) {
		this.#queue.push(_callback => {
			callback(this);
			_callback();
		});
		return this;
	};
	/**
	 * When reading file content this method is invoked to parse the content. 
	 * @param {Srting} data 
	 * @returns parsed object
	 */
	$parse(data) {
		return JSON.parse(data);
	};
	/**
	 * When writing to the file this method is invoked to stringify the data.
	 * @param {Object} data 
	 * @returns stringified content of the data property
	 */
	$stringify(data) {
		return JSON.stringify(data);
	};
	/**
	 * Asynchronously saves and disconnects all existing FileOperator.
	 * @param {Object} options 
	 * @param {Function} options.log 
	 * @param {Function} options.callback 
	 */
	static saveAndExitAll(options = {}) {
		const { log = console.log, callback: finish = () => console.log("closed all fileOperators") } = options;
		if (typeof log !== "function")
			throw new TypeError("logMessage is not a function");
		if (typeof finish !== "function")
			throw new TypeError("finish is not a function");
		const awaitCounter = () => {
			if (--counter === 0) {
				cache = {};
				finish();
			}
		};
		let counter = 0;
		for (const filepath in cache)
			cache[filepath].write(counter++).destroy(log, awaitCounter);
	};
	static get list() {
		const list = [];
		for (const filepath in cache)
			list.push(cache[filepath].fileOperator);
		return list;
	};
};
module.exports = FileOperator;