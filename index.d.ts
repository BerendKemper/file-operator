declare class FileOperator {
    /**Module for asynchronous reading and writing to a small configuration file.*/
    constructor(filepath: string)/**Reads the file, parses the read content and then stores it in the fileOperator. If overwrite is true the content's properties overwrite the fileOperator's properties.*/
    $read(overwrite: boolean): this
    /**Stringifies the data and overwrites the file with the new string. If wait is true, data is not stringifying immediately but when it's write's turn in the queue.*/
    $write(wait: boolean): this
    /**Passes over false to callback if another fileOperator is connected.*/
    $close(callback: (filepath: string) => void): void
    /**This method pushes the callback onto the queue. This callback is invoked only when all method calls prior to this callback have finished.*/
    $onReady(callback: (self: this) => void, ...args): this
    /**When reading file content this method is invoked to parse the content. Default: return JSON.parse(data)*/
    $parse(data: string): object
    /**When writing to the file this method is invoked to stringify the data. Default: return JSON.stringify(data)*/
    $stringify(data: object): string
    $filepath: string
    $connections: number
    /**Writes and closes all existing FileOperator*/
    static saveAndExitAll(options: Options): void
    static get list(): FileOperator[]
}
interface Options {
    log(filepath: string): void
    callback(): void
}
export = FileOperator;