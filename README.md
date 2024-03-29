# file-operator
<pre><code>npm i file-operator</code></pre>

```javascript
const FileOperator = require("file-operator");
```
<div>
    <h2>Class: <code>FileOperator</code></h2>
    <div>
        The fileOperator offers reading and writing to files asynchronously and offers customizable stringifying- and parsing methods. The purpose is to read and save configurations files. All asynchronous methods can be invoked synchronously because of a <a href="https://www.npmjs.com/package/ca11back-queue">CallbackQueue</a>.
    </div>
</div>

<div>
    <h3><code>new FileOperator(filepath)</code></h3>
    <ul>
        <details>
            <summary>
                <code>filepath</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
            </summary>
            <div>
                Before creating the file at filepath first recursively creates directories that do not exist yet.
            </div>
        </details>
    </ul>
    <div>
        Creating the first fileOperator is an asynchronous operation because the dirpath must be created and then a file descriptor must be opened. When opening more than one FileOperators that have the same filepath the first fileOperators instance is returned and a certain connections counter is incremented.
    </div>
</div>

<div>
    <h3><code>fileOperator.&#36;read(overwrite)</code></h3>
    <ul>
        <details>
            <summary>
                <code>overwrite</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type">&lt;boolean&gt;</a> Default: <code>false</code>
            </summary>
            <div>
                When overwrite is <code>true</code> all properties from fileOperator are overwritten with the parsed object's properties. When <code>false</code> the already defined properties of the fileOperator are are not overwritten from the parsed object.
            </div>
        </details>
    </ul>
    <div>
        Reading the content from the file is an asynchronous operation. The read content must be parsed into an object and the properties copied into the fileOperator. If the fileOperator has already read the content it does not read again.
    </div>
</div>

<div>
    <h3><code>fileOperator.&#36;write(wait)</code></h3>
    <ul>
        <details>
            <summary>
                <code>wait</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type">&lt;boolean&gt;</a> Default: <code>false</code>
            </summary>
            <div>
                When wait is <code>true</code> all properties from fileOperator are stringified during it's turn in the callback queue. When <code>false</code> it's properties are stringified immediately
            </div>
        </details>
    </ul>
    <div>
        Writing content to the file is an asynchronous operation. It must first stringify all properties of fileOperator and then writes that to te file.
    </div>
</div>

<div>
    <h3><code>fileOperator.&#36;close(callback)</code></h3>
    <ul>
        <details>
            <summary>
                <code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
            </summary>
            <div><b><code>function callback(filepath) {}</code></b></div>
            <div>
                If the connections counter did not reach <code>0</code> the parameter filepath is <code>null</code>. However if the connections did reach <code>0</code> and after the file descriptor has closed the filepath is the filepath.
            </div>
        </details>
    </ul>
    <div>
        Closing the last fileOperator decrements The connections counter. When the connections counter reaches 0 an asynchronous operation that closes the file descriptor. When the last fileOperator has closed make sure all refrences to the instance are removed so it can be garbage collected.
    </div>
</div>

<div>
    <h3><code>fileOperator.&#36;onReady(callback[, ...args])</code></h3>
    <ul>
        <details>
            <summary>
                <code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
            </summary>
            <b><code>function callback(fileOperator[, ...args]) {}</code></b>
            <div>
                The first argument of the callback the fileOperator. When arguments were passed into onReady they can be captured in args.
            </div>
        </details>
        <details>
            <summary>
                <code>args</code> optional
            </summary>
            <div>
                The arguments are passed over to the callback.
            </div>
        </details>
    </ul>
    <div>
        Allows synchronously invoking a callback untill all previous asynchronous operations have finished.
    </div>
</div>

<div>
    <h3><code>fileOperator.&#36;parse(data)</code></h3>
    <ul>
        <details>
            <summary>
                <code>data</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
            </summary>
            <div>
                This data parameter is the read content from the file after having read the content from the file.
            </div>
        </details>
    </ul>
    <div>
        The default parser from this method is <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse">&#74;&#83;&#79;&#78;.parse()</a>.
    </div>
</div>

<div>
    <h3><code>fileOperator.&#36;stringify(data)</code></h3>
    <ul>
        <details>
            <summary>
                <code>data</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
            </summary>
            <div>
                The data parameter is the fileOperator.
            </div>
        </details>
    </ul>
    <div>
        The default stringifier from this method is <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">&#74;&#83;&#79;&#78;.stringify()</a>.
    </div>
</div>

<div>
    <h3><code>fileOperator.filepath</code></h3>
    <div>
        Readable property that return the filepath of a fileOperators.
    </div>
</div>

<div>
    <h3><code>fileOperator.connections</code></h3>
    <div>
        Readable property that return the connection counter of a fileOperators.
    </div>
</div>

<div>
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
                    <div>
                        When a fileOperator is closed the message <code>"saved &#36;{fileOperator.filepath}"</code> is passed through the log function.
                    </div>
                </details>
                <details>
                    <summary>
                        <code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
                    </summary>
                    <div>
                        When all fileOperators have closed this function is invoked.
                    </div>
                </details>
            </ul>
        </details>
    </ul>
    <div>
        This static method that saves and closes all fileOperators and destroys them.
    </div>
</div>

<div>
    <h3><code>FileOperator.list</code></h3>
    <div>
        Readable property that return an array of all fileOperators.
    </div>
</div>

<div>
    <h2>Example</h2>
</div>

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