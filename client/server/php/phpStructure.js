"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClassStorage {
    constructor() {
        this.classes = {};
    }
    add(path, classDeclaration) {
        this.classes[path] = classDeclaration;
    }
    getFqnClasses() {
        let classes = [];
        Object.keys(this.classes).forEach(key => {
            if (this.classes[key].getName()) {
                classes.push(this.classes[key].getFqnName());
            }
        });
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
    getClassInFile(fileName) {
        return this.classes[fileName];
    }
    getClassFileName(className) {
        for (let path in this.classes) {
            let classDeclaration = this.classes[path];
            if (classDeclaration.getName() &&
                (classDeclaration.getName() == className || classDeclaration.getFqnName() == className)) {
                return path;
            }
        }
        return null;
    }
}
exports.ClassStorage = ClassStorage;
class ClassDeclaration {
    constructor() {
        this.using = new Array();
        this.parameters = new Array();
        this.interfaces = new Array();
        this.services = new Array();
        this.functions = new Array();
        this.variables = {};
    }
    hasInterface(interfaceName) {
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
    addInterface(interfaceName) {
        this.interfaces.push(interfaceName);
    }
    getName() {
        return this.name;
    }
    setNamespace(namespace) {
        this.namespace = namespace;
    }
    addUse(use) {
        this.using.push(use);
    }
    setName(name) {
        this.name = name;
    }
    setParent(parent) {
        this.parent = parent;
    }
    addFunction(func) {
        this.functions.push(func);
    }
    addVariable(variable) {
        this.variables[variable.getName()] = variable;
    }
    addService(service) {
        this.services.push(service);
    }
    getServices() {
        return this.services;
    }
    addParameter(parameter) {
        this.parameters.push(parameter);
    }
    setPropertyType(name, type) {
        if (this.variables[name]) {
            this.variables[name].setType(type);
        }
    }
    getFQNFromName(name) {
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
    findMethodByLine(line) {
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
    abstract() {
        this.isAbstract = true;
    }
}
exports.ClassDeclaration = ClassDeclaration;
class ClassFunction {
    constructor(name, start, end) {
        this.name = name;
        this.start = start;
        this.end = end;
        this.variables = {};
        this.isVisible == false;
        this.isStatic = false;
    }
    addVariable(variable) {
        this.variables[variable.getName()] = variable;
    }
    getVariable(name) {
        return this.variables[name];
    }
    getVariableType(name) {
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
exports.ClassFunction = ClassFunction;
class Variable {
    constructor(name, start, end) {
        this.name = name;
        this.start = start;
        this.end = end;
    }
    setType(type) {
        this.type = type;
    }
    setValue(value) {
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
exports.Variable = Variable;
class Use {
    constructor(name) {
        this.name = name;
    }
    setAlias(alias) {
        this.alias = alias;
    }
    isTypeOwning(name) {
        if (this.alias && this.alias.search(name)) {
            return this.name;
        }
        return this.name.search(name) > 0 ? this.name : false;
    }
}
exports.Use = Use;
class Position {
    constructor(line = 0, column = 0, offset = 0) {
        this.line = line;
        this.column = column;
        this.offset = offset;
    }
}
exports.Position = Position;
//# sourceMappingURL=phpStructure.js.map