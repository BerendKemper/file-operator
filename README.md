# file operator

<pre><code>npm i file-operator</code></pre>

```javascript
const FileOperator = require("file-operator");
```

<h2>Class: <code>FileOperator</code></h2>
The fileOperator offers reading and writing to files asynchronously and offers customizable stringifying- and parsing methods. The purpose is to read and save configurations files. All asynchronous methods can be invoked synchronously because of a <a href="https://www.npmjs.com/package/ca11back-queue">CallbackQueue</a>.
<h3><code>new FileOperator(filepath)</code></h3>
<ul>
	<details>
		<summary>
			<code>filepath</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
		</summary>
        Before creating the file at <code>filepath</code> first recursively creates directories that do not exist yet.
	</details>
</ul>
Creating the first fileOperator is an asynchronous operation because the dirpath must be created and then a file descriptor must be opened. When opening more than one FileOperators that have the same <code>filepath</code> the first fileOperators instance is returned and a certain connections counter is incremented.
<h3><code>fileOperator.&#36;read(overwrite)</code></h3>
<ul>
	<details>
		<summary>
			<code>overwrite</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type">&lt;boolean&gt;</a> Default: <code>false</code>
		</summary>
		When <code>overwrite</code> is true all properties from fileOperator are overwritten with the parsed object's properties. When false the already defined properties of the fileOperator are are not overwritten from the parsed object.
	</details>
</ul>
Reading the content from the file is an asynchronous operation. The read content must be parsed into an object and the properties copied into the fileOperator. If the fileOperator has already read the content it does not read again.
<h3><code>fileOperator.&#36;write(wait)</code></h3>
<ul>
	<details>
		<summary>
			<code>wait</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type">&lt;boolean&gt;</a> Default: <code>false</code>
		</summary>
		When <code>wait</code> is true all properties from fileOperator are stringified during it's turn in the callback queue. When false it's properties are stringified immediately
	</details>
</ul>
Writing content to the file is an asynchronous operation. It must first stringify all properties of fileOperator and then writes that to te file.
<h3><code>fileOperator.&#36;close(callback)</code></h3>
<ul>
	<details>
		<summary>
			<code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
		</summary>
        <div><b><code>function callback(isClosed) {}</code></b></div>
		If the connections counter did not reach 0 the parameter <code>isClosed</code> is false. However if the connections did reach 0 and after the file descriptor has closed the <code>isClosed</code> is true.
	</details>
</ul>
Closing the last fileOperator decrements The connections counter. When the connections counter reaches 0 an asynchronous operation that closes the file descriptor. When the last fileOperator has closed make sure all refrences to the instance are removed so it can be garbage collected.
<h3><code>fileOperator.&#36;onReady(callback[, ...args])</code></h3>
<ul>
	<details>
		<summary>
			<code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
		</summary>
        <b><code>function callback(fileOperator[, ...args]) {}</code></b>
		The first argument of the <code>callback</code> the fileOperator itself. When arguments were passed into <code>onReady</code> they can be captured now.
	</details>
    <details>
        <summary>
            <code>args</code> optional
        </summary>
        The arguments are passed over to the <code>callback</code>.
    </details>
</ul>
Allows synchronously invoking a <code>callback</code> untill all previous asynchronous operations have finished.
<h3><code>fileOperator.&#36;parse(data)</code></h3>
<ul>
	<details>
		<summary>
			<code>data</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
		</summary>
		This <code>data</code> parameter is the read content from the file after having read the content from the file.
	</details>
</ul>
The default parser from this method is <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse">&#74;&#83;&#79;&#78;.parse()</a>.
<h3><code>fileOperator.&#36;stringify(data)</code></h3>
<ul>
	<details>
		<summary>
			<code>data</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
		</summary>
		this <code>data</code> parameter is the fileOperator itself.
	</details>
</ul>
The default stringifier from this method is <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">&#74;&#83;&#79;&#78;.stringify()</a>.
<h3><code>fileOperator.filepath</code></h3>
Readable property that return the filepath of a fileOperators.
<h3><code>fileOperator.connections</code></h3>
Readable property that return the connection counter of a fileOperators.
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
				When a fileOperator is closed the message <code>"saved &#36;{fileOperator.filepath}"</code> is passed through the <code>log</code> function.
			</details>
			<details>
				<summary>
					<code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
				</summary>
				When all fileOperators have closed this function is invoked.
			</details>
		</ul>
	</details>
</ul>
This static method that saves and closes all fileOperators and destroys them.
<h3><code>FileOperator.list</code></h3>
Readable property that return an array of all fileOperators.
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