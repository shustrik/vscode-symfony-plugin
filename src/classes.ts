export class Class {
    className: String;
    file: String;
    arguments: Argument[];
    interfaces: {};
    extends: {};
    constructor(className: String, file: String) {
        this.className = className;
        this.file = file;
    }
    addArgument(argument: Argument) {
        this.arguments.push(argument);
    }
}

export interface Argument {
    type: string;
    name: string;
}