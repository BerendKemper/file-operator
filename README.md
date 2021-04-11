# file-operator
This module reads and writes to files asynchronously. The read content is parsed and the written content is stringified. The default parser and stringifier are JSON.
<pre><code>npm i files-json</code></pre>

```javascript
const FileOperator = require("file-operator");
```
<h2>Class: <code>FileOperator</code></h2>
All methods from the <code>fileOperator</code> are asynchronous under the hood because all asynchronous functions are queued in a callback queue. The callback queue prevents the collision of invoking multiple asynchronous methods, such as <code>$read</code> and <code>$write</code>, from two or more <code>fileOperators</code> with the same <code>filepath</code>.
<h3><code>new FileOperator(filepath)</code></h3>
<ul>
	<details>
		<summary>
			<code>filepath</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
		</summary>
		When <code>fileOperator</code> has openend a <code>filepath</code> it is cached. When opening more of the same <code>filepaths</code> are openend the cached <code>fileOperators</code> is returned and the connections counter is incremented. 
	</details>
</ul>
<h3><code>fileOperator.$read(overwrite)</code></h3>
<ul>
	<details>
		<summary>
			<code>overwrite</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type">&lt;boolean&gt;</a> Default: <code>false</code>
		</summary>
		When <code>overwrite</code> is <code>true</code> <code>fileOperator</code>'s properties are overwritten with the parsed object's properties. When <code>false</code> <code>fileOperator</code>'s already defined properties are are not copied from the parsed object and undefined properties are copied. 
	</details>
</ul>
Reads the content from the file, parses that with <code>fileOperator</code>'s <code>parse</code> method and copies the parsed object's properties into <code>fileOperator</code>. If the <code>fileOperator</code> has already read the content it does not read again. 
<h3><code>fileOperator.$write(wait)</code></h3>
<ul>
	<details>
		<summary>
			<code>wait</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type">&lt;boolean&gt;</a> Default: <code>false</code>
		</summary>
		When <code>wait</code> is <code>true</code> <code>fileOperator</code>'s properties are stringified during it's turn in the callback queue. When <code>false</code> it's properties are stringified immediately 
	</details>
</ul>
Strigifies <code>fileOperator</code>'s properties with <code>fileOperator</code>'s <code>stringify</code> method and writes that to te file. 
<h3><code>fileOperator.$close(callback)</code></h3>
<ul>
	<details>
		<summary>
			<code>calback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
		</summary>
		The <code>callback</code> is going to be invoked, if it was not a function an error is thrown.
	</details>
</ul>
Closing a <code>fileOperator</code> decrements the connections counter. When the connections counter reaches 0 the cached <code>fileOperator</code> is removed from the cache. 
<h3><code>fileOperator.$onReady(callback)</code></h3>
<ul>
	<details>
		<summary>
			<code>calback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
		</summary>
		<ul>
			<details>
				<summary>
					<code>fileOperator</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a> 
				</summary>
				Invokes <code>callback</code> with the <code>fileOperator</code> as parameter, usefull for chaining methods.
			</details>
		</ul>
		The <code>callback</code> is going to be invoked, if it was not a function an error is thrown.
	</details>
</ul>
When all queued asynchronous methods, that were called before invoking <code>fileOperator</code>'s <code>onReady</code> method, have finished then the <code>callback</code> is invoked.
<h3><code>fileOperator.$parse(data)</code></h3>
<ul>
	<details>
		<summary>
			<code>data</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
		</summary>
		This <code>data</code> parameter is the read content from the file after having invoked <code>fileOperator</code>'s <code>read</code> method.
	</details>
</ul>
When <code>fileOperator</code>'s <code>read</code> method is used the read content is parsed by this method. The default parser from this method is <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse">JSON.parse()</a>. 
<h3><code>fileOperator.$stringify(data)</code></h3>
<ul>
	<details>
		<summary>
			<code>data</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
		</summary>
		this <code>data</code> parameter is the object at <code>fileOperator</code>.data property.
	</details>
</ul>
When <code>fileOperator</code>'s <code>write</code> method is used the object at <code>fileOperator</code>.data property is stringified by this method. The default stringifier from this method is <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">JSON.stringify()</a>.
<h3><code>FileOperator.saveAndExitAll(options)</code></h3>
<ul>
	<details>
		<summary>
			<code>options</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
		</summary>
		<ul>
			<details>
				<summary>
					<code>log</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a> Default: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Console/log">console.log</a>
				</summary>
				When a <code>fileOperator</code> has closed the message <code>"saved ${fileOperator.filepath}"</code> is passed through the <code>log</code> function. 
			</details>
			<details>
				<summary>
					<code>calback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
				</summary>
				When all <code>fileOperators</code> have closed this function is invoked.
			</details>
		</ul>
	</details>
</ul>
This static method that saves and closes all <code>fileOperators</code> and clears the cache. 
<h3><code>FileOperator.list</code></h3>
Readable property that return an array of all <code>fileOperators</code>.
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
// real example from https://github.com/BerendKemper/app
//
new FileOperator("./apis.json").$read(true).$onReady(apis => {
	app.loadApiRegister(apis);
	console.log("Registered Api endpoints:", app.apis);
	app.listen();
});
// ...
process.on("SIGINT", () => {
	logger.error("Node JS is now shutting down due to pressing ctrl + c");
	FileOperator.saveAndExitAll({
		log: logger.log, // filestream-logger
		callback() {
			let i = 0;
			const awaitExit = dirpath => {
				console.log("destroyed", dirpath);
				if (--i === 0) process.exit();
			};
			for (const type in logger)
				logger[type].destroy(awaitExit, i++);
		}
	});
});
```