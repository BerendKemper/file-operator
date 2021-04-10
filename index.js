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
		this.fileOperator.write();
		return this;
	};
	destroy(message, callback) {
		this.queue.push(() => {
			this.queue.clear();
			console.log(message);
			callback();
		});
	};
};
let cache = {};
class FileOperator {
	#hasRead = false;
	#filepath;
	#data;
	#queue;
	/**
	 * Module for asynchronous reading and writing to a small configuration file.
	 * @param {String} filepath 
	 */
	constructor(filepath) {
		if (!cache[filepath]) {
			this.#data = {};
			this.#filepath = filepath;
			cache[filepath] = new CachedFileOp(this);
			this.#queue = cache[filepath].queue = new QueueCallback();
		}
		else
			return cache[filepath].connect();
	};
	/**
	 * Once read the content is parsed and stored in data.
	 */
	read() {
		this.#queue.push(callback => {
			if (this.#hasRead === true)
				return callback();
			fs.readFile(this.#filepath, (error, data) => {
				const _data = this.#data;
				data = data.toString();
				if (data.length > 2) {
					const source = this.parse(data);
					for (const prop in source)
						if (!_data[prop])
							_data[prop] = source[prop];
				}
				this.#hasRead = true;
				callback();
			});
		});
		return this;
	};
	/**
	 * Stringifies the data and overwrites the file with the new string.
	 */
	write() {
		const buffer = Buffer.from(this.stringify(this.#data));
		this.#queue.push(callback => fs.writeFile(this.#filepath, buffer, callback));
		return this;
	};
	/**
	 * If closed returns true. When false something else is using it.
	 */
	close() {
		this.#queue.push(callback => {
			if (--cache[this.#filepath].connections === 0)
				return this.#queue.clear(delete (cache[this.#filepath]));
			callback();
		});
		return this;
	};
	/**
	 * This method pushes the callback onto the callstack. This callback is invoked only
	 * when all method calls prior to this callback have finished.
	 * @param {*} callback 
	 */
	onReady(callback) {
		this.#queue.push(_callback => _callback(callback()));
		return this;
	};
	/**
	 * When reading file content this method is invoked to parse the content. 
	 * @param {Srting} data 
	 * @returns parsed object
	 */
	parse(data) {
		return JSON.parse(data);
	};
	/**
	 * When writing to the file this method is invoked to stringify the data.
	 * @param {Object} data 
	 * @returns stringified content of the data property
	 */
	stringify(data) {
		return JSON.stringify(data);
	};
	get filepath() {
		return this.#filepath;
	};
	get data() {
		return this.#data;
	};
	set data(data) {
		if (typeof data !== "object" || data === null || Array.isArray(data))
			throw new TypeError("data must be an object");
		this.#data = data;
	};
	/**
	 * Asynchronously saves and disconnects all existing FileOperator.
	 * @param {Object} options 
	 * @param {String} options.message 
	 * @param {Function} options.callback 
	 */
	static saveAndExitAll(options = {}) {
		const { message = "Saved:", callback: finish = () => console.log("closed all fileOperators") } = options;
		const awaitCounter = () => {
			if (--counter === 0) {
				cache = {};
				finish();
			}
		};
		let counter = 0;
		for (const filepath in cache)
			cache[filepath].write(counter++).destroy(message + " " + filepath, awaitCounter);
	};
};
module.exports = FileOperator;