"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services = require("../services/service");
var engine = require('php-parser');
var parserInst = new engine({
    parser: {
        extractDoc: false,
        suppressErrors: true
    },
    ast: {
        withPositions: true
    }
});
function parseEval(text) {
    return parserInst.parseEval(text);
}
exports.parseEval = parseEval;
function parse(code, path, classStorage) {
    let classDeclaration = new ClassDeclaration();
    let ast = parserInst.parseCode(code);
    branchProcess(ast, classDeclaration);
    classStorage.add(path, classDeclaration);
}
exports.parse = parse;
function branchProcess(branch, classDeclaration) {
    if (Array.isArray(branch)) {
        branch.forEach(element => {
            branchProcess(element, classDeclaration);
        });
    }
    else {
        switch (branch.kind) {
            case "namespace":
                namespace(branch, classDeclaration);
                break;
            case "usegroup":
                use(branch, classDeclaration);
                break;
            case "method":
                method(branch, classDeclaration);
                break;
            case "class":
                classInstruction(branch, classDeclaration);
                break;
            case "property":
                classProperty(branch, classDeclaration);
                break;
            case "trait":
                buildTrait(branch, classDeclaration);
                break;
        }
        if (branch.children) {
            branchProcess(branch.children, classDeclaration);
        }
    }
    return false;
}
function buildTrait(node, classDeclaration) {
    if (node.body) {
        branchProcess(node.body, classDeclaration);
    }
}
function methodProcess(node, func, classDeclaration) {
    switch (node.kind) {
        case "call":
            call(node, func, classDeclaration);
            break;
        case "assign":
            assignment(node, func, classDeclaration);
            break;
        case "return":
            methodReturn(node, func, classDeclaration);
            break;
    }
}
function methodReturn(node, func, classDeclaration) {
    //console.log(node);
}
function call(node, func, classDeclaration) {
    if (node.what.kind == 'propertylookup') {
        if (node.what.what.name == 'this') {
        }
        if (node.what.what.kind == "variable") {
            let name = node.what.what.name;
            let type = func.getVariableType(name);
            let fqn = classDeclaration.getFQNFromName(type);
            if (fqn && fqn == services.containerCompleteClass.containerBuilder) {
                let funcName = node.what.offset.name;
                if (funcName == 'setDefinition') {
                    if (node.arguments[0].kind == 'string') {
                        classDeclaration.addService(node.arguments[0].value);
                    }
                    if (node.arguments[0].kind == 'variable') {
                        let variable = func.getVariable(node.arguments[0].name);
                        if (variable.getValue()) {
                            classDeclaration.addService(variable.getValue());
                        }
                    }
                }
                if (funcName == 'setParameter') {
                    if (node.arguments[0].kind == 'string') {
                        classDeclaration.addParameter(node.arguments[0].value);
                    }
                }
            }
        }
    }
}
function classProperty(node, classDeclaration) {
    let start = new Position(node.loc.start.line, node.loc.start.column, node.loc.start.offset);
    let end = new Position(node.loc.end.line, node.loc.end.column, node.loc.end.offset);
    let variable = new Variable(node.name, start, end);
    classDeclaration.addVariable(variable);
}
function assignment(node, func, classDeclaration) {
    if (node.left && node.left.kind == "propertylookup" &&
        node.left.what.name == 'this') {
        if (node.right.kind == 'variable') {
            let type = func.getVariableType(node.right.name);
            if (type) {
                classDeclaration.setPropertyType(node.left.offset.name, type);
            }
        }
    }
    if (node.left && node.left.kind == "variable") {
        let start = new Position(node.left.loc.start.line, node.left.loc.start.column, node.left.loc.start.offset);
        let end = new Position(node.left.loc.end.line, node.left.loc.end.column, node.left.loc.end.offset);
        let variable = new Variable(node.left.name, start, end);
        if (node.right && node.right.kind == "new") {
            if (node.right.what && node.right.what.name) {
                if (node.right.what.kind == "identifier") {
                    variable.setType(node.right.what.name);
                }
            }
        }
        if (node.right.kind == "string") {
            variable.setValue(node.right.value);
        }
        func.addVariable(variable);
    }
}
function namespace(node, classDeclaration) {
    classDeclaration.setNamespace(node.name);
}
function use(node, classDeclaration) {
    node.items.forEach(item => {
        let use = new Use(item.name);
        if (item.alias) {
            use.setAlias(item.alias);
        }
        classDeclaration.addUse(use);
    });
}
function classInstruction(node, classDeclaration) {
    classDeclaration.setName(node.name);
    if (node.implements) {
        node.implements.forEach(item => {
            classDeclaration.addInterface(item);
        });
    }
    if (node.extends) {
        classDeclaration.setParent(node.extends.name);
    }
    if (node.isAbstract) {
        classDeclaration.abstract();
    }
    if (node.body) {
        branchProcess(node.body, classDeclaration);
    }
}
function method(node, classDeclaration) {
    let start = new Position(node.loc.start.line, node.loc.start.column, node.loc.start.offset);
    let end = new Position(node.loc.end.line, node.loc.end.column, node.loc.end.offset);
    let func = new ClassFunction(node.name, start, end);
    node.arguments.forEach(item => {
        let start = new Position(item.loc.start.line, item.loc.start.column, item.loc.start.offset);
        let end = new Position(item.loc.end.line, item.loc.end.column, item.loc.end.offset);
        let variable = new Variable(item.name, start, end);
        if (item.type) {
            variable.setType(item.type.name);
        }
        func.addVariable(variable);
    });
    if (node.body) {
        node.body.children.forEach(item => {
            methodProcess(item, func, classDeclaration);
        });
    }
    classDeclaration.addFunction(func);
}
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
            if (classDeclaration.getName() == name) {
                return classDeclaration;
            }
        }
        return null;
    }
    getFileClass(fileName) {
        return this.classes[fileName];
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
    addParameter(parameter) {
        this.parameters.push(parameter);
    }
    setPropertyType(name, type) {
        if (this.variables[name]) {
            this.variables[name].setType(type);
        }
    }
    classIsConteinerCompletion(name) {
        let fqn = this.getFQNFromName(name);
        if (fqn == services.containerCompleteClass.decorator ||
            fqn == services.containerCompleteClass.reference) {
            return true;
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
    }
    addVariable(variable) {
        this.variables[variable.getName()] = variable;
    }
    getVariable(name) {
        return this.variables[name];
    }
    getVariableType(name) {
        if (this.variables[name]) {
            return this.variables[name].getType();
        }
        return null;
    }
}
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
class Position {
    constructor(line = 0, column = 0, offset = 0) {
        this.line = line;
        this.column = column;
        this.offset = offset;
    }
}
exports.Position = Position;
//# sourceMappingURL=parser.js.map