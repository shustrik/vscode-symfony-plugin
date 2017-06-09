export class Service {
    arguments: Array<Argument>;
    id: string
    class: string
    tags: {}
    isAbstract: boolean

    constructor(id: string, className: string) {
        this.id = id;
        this.class = className;
        this.isAbstract = false;
    }
    addArgument(key: number, argument: Argument) {
        this.arguments[key] = argument;
    }
    addArguments(args: Array<Argument>) {
        this.arguments = args;
    }
    abstract() {
        this.isAbstract = true;
    }
}

export class ServiceArgument implements Argument {
    value: String
    constructor(value: String) {
        this.value = value;
    }
}

export class TextArgument implements Argument {
    value: String
    constructor(value: String) {
        this.value = value;
    }
}

export class ParameterArgument implements Argument {
    value: String
    constructor(value: String) {
        this.value = value;
    }
}

export class CollectionArgument implements Argument {
    value: Array<Argument>
    constructor(value: Array<Argument>) {
        this.value = value;
    }
}

export interface Argument {
}