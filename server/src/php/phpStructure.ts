import { Range, Position } from 'vscode-languageserver';
export class ClassStorage {
    classes: ClassStorageType
    constructor() {
        this.classes = {};
    }
    add(path: string, classDeclaration: ClassDeclaration) {
        this.classes[path] = classDeclaration;
    }
    getFqnClasses() {
        let classes = [];
        Object.keys(this.classes).forEach(key => {
            if (this.classes[key].getName()) {
                classes.push(this.classes[key].getFqnName());
            }
        })
        return classes;
    }
    getClassByName(name) {
        for (let path in this.classes) {
            let classDeclaration = this.classes[path];
            if (classDeclaration.getName() &&
                (classDeclaration.getName() == name || classDeclaration.getFqnName() == name)) {
                return classDeclaration;
            }
        }
        return null;
    }
    getClassInFile(fileName: string) {
        return this.classes[fileName];
    }
}
export class ClassDeclaration {
    name: string
    variables: VariableStorage
    functions: Array<ClassFunction>
    namespace: string
    using: Array<Use>
    parent: string
    isAbstract: boolean
    services: Array<String>
    parameters: Array<String>
    interfaces: Array<String>
    start: Position
    end: Position
    path: string
    constructor(path: string) {
        this.path = path;
        this.using = new Array<Use>();
        this.parameters = new Array<String>();
        this.interfaces = new Array<String>();
        this.services = new Array<String>();
        this.functions = new Array<ClassFunction>();
        this.variables = {};
    }
    setPosition(start: Position, end: Position) {
        this.start = start;
        this.end = end;
    }
    getClassRange() {
        return Range.create(this.start, this.end);
    }
    hasInterface(interfaceName: string) {
        for (var index = 0; index < this.interfaces.length; index++) {
            if (this.interfaces[index] = interfaceName) {
                return true;
            }
        }
        return false;
    }
    getFqnName() {
        return this.namespace + '\\' + this.name;
    }
    addInterface(interfaceName: string) {
        this.interfaces.push(interfaceName);
    }
    getName() {
        return this.name;
    }
    setNamespace(namespace: string) {
        this.namespace = namespace;
    }
    addUse(use: Use) {
        this.using.push(use);
    }
    setName(name: string) {
        this.name = name;
    }
    setParent(parent: string) {
        this.parent = parent;
    }
    addFunction(func: ClassFunction) {
        this.functions.push(func);
    }
    addVariable(variable: Variable) {
        this.variables[variable.getName()] = variable;
    }
    addService(service: string) {
        this.services.push(service);
    }
    getServices() {
        return this.services;
    }
    addParameter(parameter: string) {
        this.parameters.push(parameter);
    }
    setPropertyType(name: string, type: string) {
        if (this.variables[name]) {
            this.variables[name].setType(type);
        }
    }
    getFQNFromName(name: string) {
        for (var index = 0; index < this.using.length; index++) {
            var element = this.using[index];
            if (element.isTypeOwning(name)) {
                return element.name;
            }
        }
    }
    getPublicFunctions() {
        return this.functions;
    }
    findMethodByLine(line: number) {
        for (var index = 0; index < this.functions.length; index++) {
            var element = this.functions[index];
            if (element.start.line <= line && element.end.line >= line) {
                return element;
            }
        }
        return null;
    }
    getParent() {
        return this.parent;
    }
    getPath() {
        return this.path;
    }
    abstract() {
        this.isAbstract = true;
    }
}
export class ClassFunction {
    name: string
    variables: VariableStorage
    start: Position
    end: Position
    isVisible: boolean
    isStatic: boolean
    constructor(name: string, start: Position, end: Position) {
        this.name = name;
        this.start = start;
        this.end = end;
        this.variables = {};
        this.isVisible == false;
        this.isStatic = false;
    }
    addVariable(variable: Variable) {
        this.variables[variable.getName()] = variable;
    }
    getVariable(name: string) {
        return this.variables[name];
    }
    getVariableType(name: string): string {
        if (this.variables[name] && this.variables[name] instanceof Variable) {
            return this.variables[name].getType();
        }
        return null;
    }
    getName() {
        return this.name;
    }
    visible() {
        this.isVisible = true;
    }
    static() {
        this.isStatic = true;
    }
}
export class Variable {
    name: string
    type: string
    start: Position
    end: Position
    value: string
    constructor(name: string, start: Position, end: Position) {
        this.name = name;
        this.start = start;
        this.end = end;
    }
    setType(type: string) {
        this.type = type;
    }
    setValue(value: string) {
        this.value = value;
    }
    getType() {
        return this.type;
    }
    getName() {
        return this.name;
    }
    getValue() {
        return this.value;
    }
}

export class Use {
    name: string
    type: string
    alias: string
    constructor(name: string) {
        this.name = name;
    }
    setAlias(alias: string) {
        this.alias = alias;
    }
    isTypeOwning(name: string) {
        if (this.alias && this.alias.search(name)) {
            return this.name;
        }
        return this.name.search(name) > 0 ? this.name : false;
    }
}

interface VariableStorage {
    [id: string]: Variable
}
interface ClassStorageType {
    [id: string]: ClassDeclaration
}