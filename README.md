# file-operator
This module reads and writes to files asynchronously. The read content is parsed and the written content is stringified. `JSON` is default parser and stringifier.

```
npm i file-operator
```

```javascript
const FileOperator = require("file-operator");
```

<h2>Class: `FileOperator`</h2>
All methods from the `fileOperator` are asynchronous under the hood because all asynchronous functions are queued in a callback queue. The callback queue prevents the collision of invoking multiple asynchronous methods, such as `$read` and `$write`, from two or more `fileOperators` with the same `filepath`.
<h3>`new FileOperator(filepath)`</h3>
<ul>
	<details>
		<summary>
			`filepath` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
		</summary>
		When `fileOperator` has openend a `filepath` it is cached. When opening more of the same `filepaths` are openend the cached `fileOperators` is returned and the connections counter is incremented.
	</details>
</ul>
<h3>`fileOperator.$read(overwrite)`</h3>
<ul>
	<details>
		<summary>
			`overwrite` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type">&lt;boolean&gt;</a> Default: `false`
		</summary>
		When `overwrite` is `true` `fileOperator`'s properties are overwritten with the parsed object's properties. When `false` `fileOperator`'s already defined properties are are not copied from the parsed object and undefined properties are copied.
	</details>
</ul>
Reads the content from the file, parses that with `fileOperator`'s `parse` method and copies the parsed object's properties into `fileOperator`. If the `fileOperator` has already read the content it does not read again.
<h3>`fileOperator.$write(wait)`</h3>
<ul>
	<details>
		<summary>
			`wait` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type">&lt;boolean&gt;</a> Default: `false`
		</summary>
		When `wait` is `true` `fileOperator`'s properties are stringified during it's turn in the callback queue. When `false` it's properties are stringified immediately
	</details>
</ul>
Strigifies `fileOperator`'s properties with `fileOperator`'s `stringify` method and writes that to te file.
<h3>`fileOperator.$close(callback)`</h3>
<ul>
	<details>
		<summary>
			`callback` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
		</summary>
		The `callback` is going to be invoked, if it was not a function an error is thrown.
	</details>
</ul>
Closing a `fileOperator` decrements the connections counter. When the connections counter reaches 0 the cached `fileOperator` is removed from the cache.
<h3>`fileOperator.$onReady(callback)`</h3>
<ul>
	<details>
		<summary>
			`callback` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
		</summary>
		<ul>
			<details>
				<summary>
					`fileOperator` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
				</summary>
				Invokes `callback` with the `fileOperator` as parameter, usefull for chaining methods.
			</details>
		</ul>
		The `callback` is going to be invoked, if it was not a function an error is thrown.
	</details>
</ul>
When all queued asynchronous methods, that were called before invoking `fileOperator`'s `onReady` method, have finished then the `callback` is invoked.
<h3>`fileOperator.$parse(data)`</h3>
<ul>
	<details>
		<summary>
			`data` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
		</summary>
		This `data` parameter is the read content from the file after having invoked `fileOperator`'s `read` method.
	</details>
</ul>
When `fileOperator`'s `read` method is used the read content is parsed by this method. The default parser from this method is <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse">JSON.parse()</a>.
<h3>`fileOperator.$stringify(data)`</h3>
<ul>
	<details>
		<summary>
			`data` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
		</summary>
		this `data` parameter is the object at `fileOperator`.data property.
	</details>
</ul>
When `fileOperator`'s `write` method is used the object at `fileOperator`.data property is stringified by this method. The default stringifier from this method is <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">JSON.stringify()</a>.
<h3>`FileOperator.saveAndExitAll(options)`</h3>
<ul>
	<details>
		<summary>
			`options` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
		</summary>
		<ul>
			<details>
				<summary>
					`log` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a> Default: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Console/log">console.log</a>
				</summary>
				When a `fileOperator` has closed the message `"saved ${fileOperator.filepath}"` is passed through the `log` function.
			</details>
			<details>
				<summary>
					`callback` <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
				</summary>
				When all `fileOperators` have closed this function is invoked.
			</details>
		</ul>
	</details>
</ul>
This static method that saves and closes all `fileOperators` and clears the cache.
<h3>`FileOperator.list`</h3>
Readable property that return an array of all `fileOperators`.
<h2>Example</h2>

```javascript
// const YAML = require("yamljs");
class MonkeyJSON extends FileOperator {
	constructor() {
		super("monkey.json");
	};
	$test() {
		this.says = "hoehoehaha";
		this["looks like"] = "🐵";
		this.is = "a monkey";
		this.lives = "in a tree";
		return this;
	};
	$count() {
		this.counter ? this.counter++ : this.counter = 1;
		return this;
	};
	/* optional
	$parse(data) {
		return YAML.parse(data);
	};
	$stringify(data) {
		return YAML.stringify(data);
	};
	//*/
};
new MonkeyJSON().$read().$test().$onReady(monkey => monkey.$count()).$write(true).$close(() => {
	console.log("closed monkey.json");
});
//
//
////////////////////////////////////////////////////////////////////
//
// An example from https://github.com/BerendKemper/app
//
new FileOperator("./apis.json").$read(true).$onReady(apis => {
	app.loadApiRegister(apis);
	console.log("Registered Api endpoints:", app.apis);
	app.listen();
});
// ...
process.on("SIGINT", () => {
	logger.error("Node JS is now shutting down due to pressing ctrl + c"); // filestream-logger
	FileOperator.saveAndExitAll({
		log: logger.log, // filestream-logger
		callback() {
			FilestreamLogger.destroyAll(() => process.exit());
		}
	});
});
```