"use strict";
const fs = require("fs");
const QueueCallback = require("ca11back-queue");
let fileOperators = {};
const accessKey = Symbol("File Operator Access Key");
class SmallDataFile {
	#connections = 1;
	#hasRead = false;
	#filepath;
	#data = {};
	#queue = new QueueCallback();
	/**
	 * Module for asynchronous reading and writing to a small configuration file.
	 * @param {String} filepath 
	 */
	constructor(filepath) {
		if (!fileOperators[filepath]) {
			fileOperators[filepath] = this;
			this.#filepath = filepath;
		}
		else
			return fileOperators[filepath].connect(accessKey);
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
			if (--this.#connections === 0)
				delete (fileOperators[this.#filepath]);
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
	/**
	 * @param {Symbol} key
	 */
	connect(key) {
		if (key !== accessKey)
			throw new Error("This method is not for developers to use.");
		this.#connections++;
		return this;
	};
	/**
	 * You shall not pass. muhahaha
	 * @param {Symbol} key
	 */
	disconnect(key, message, callback) {
		if (key !== accessKey)
			throw new Error("This method is not for developers to use.");
		this.#queue.push(() => {
			this.#queue.clear();
			this.#data = {};
			console.log(message, this.#filepath);
			callback();
		});
	};
	get filepath() {
		return this.#filepath;
	};
	get data() {
		return this.#data;
	};
	set data(object) {
		if (object instanceof Array === true)
			throw new TypeError("object cannot be an array.");
		if (object === null)
			throw new TypeError("object cannot be null.");
		if (typeof object !== "object")
			throw new TypeError(`object cannot be a ${typeof object}.`);
		this.#data = object;
	};
	/**
	 * Asynchronously saves and disconnects all existing FileOperator.
	 * @param {Object} options 
	 * @param {String} options.message 
	 * @param {Function} options.callback 
	 */
	static saveAndExitAll(options = {}) {
		const { message = "Saved and disconnected:", callback: finish = () => console.log("closed all fileOperators") } = options;
		let callback = () => {
			fileOperators = {};
			finish();
		};
		for (const filepath in fileOperators) {
			const fileOperator = fileOperators[filepath];
			const next = callback;
			callback = () => fileOperator.disconnect(accessKey, message, next, fileOperator.write());
		}
		callback();
	};
};
module.exports = SmallDataFile;