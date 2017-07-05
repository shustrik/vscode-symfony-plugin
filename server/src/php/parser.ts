import * as services from '../services/service'

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
export function parseEval(text: string) {
    return parserInst.parseEval(text);
}
export function parse(code, path: string, classStorage: ClassStorage) {
    let classDeclaration = new ClassDeclaration();
    let ast = parserInst.parseCode(code);
    branchProcess(ast, classDeclaration);
    classStorage.add(path, classDeclaration);
}
function branchProcess(branch, classDeclaration: ClassDeclaration) {
    if (Array.isArray(branch)) {
        branch.forEach(element => {
            branchProcess(element, classDeclaration);
        });
    } else {
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
function buildTrait(node, classDeclaration: ClassDeclaration) {
    if (node.body) {
        branchProcess(node.body, classDeclaration);
    }
}
function methodProcess(node, func: ClassFunction, classDeclaration: ClassDeclaration) {
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
function methodReturn(node, func: ClassFunction, classDeclaration: ClassDeclaration) {
    //console.log(node);
}
function call(node, func: ClassFunction, classDeclaration: ClassDeclaration) {
    if (node.what.kind == 'propertylookup') {
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

function classProperty(node, classDeclaration: ClassDeclaration) {
    let start = new Position(node.loc.start.line, node.loc.start.column, node.loc.start.offset)
    let end = new Position(node.loc.end.line, node.loc.end.column, node.loc.end.offset)
    let variable = new Variable(node.name, start, end);
    classDeclaration.addVariable(variable);
}
function assignment(node, func: ClassFunction, classDeclaration: ClassDeclaration) {
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
        let start = new Position(node.left.loc.start.line, node.left.loc.start.column, node.left.loc.start.offset)
        let end = new Position(node.left.loc.end.line, node.left.loc.end.column, node.left.loc.end.offset)
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
function namespace(node, classDeclaration: ClassDeclaration) {
    classDeclaration.setNamespace(node.name);
}
function use(node, classDeclaration: ClassDeclaration) {
    node.items.forEach(item => {
        let use = new Use(item.name);
        if (item.alias) {
            use.setAlias(item.alias);
        }
        classDeclaration.addUse(use);
    });
}
function classInstruction(node, classDeclaration: ClassDeclaration) {
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
function method(node, classDeclaration: ClassDeclaration) {
    let start = new Position(node.loc.start.line, node.loc.start.column, node.loc.start.offset)
    let end = new Position(node.loc.end.line, node.loc.end.column, node.loc.end.offset)
    let func = new ClassFunction(node.name, start, end);
    if (node.visibility == 'public') {
        func.visible();
    }
    if (node.static) {
        func.static();
    }
    node.arguments.forEach(item => {
        let start = new Position(item.loc.start.line, item.loc.start.column, item.loc.start.offset)
        let end = new Position(item.loc.end.line, item.loc.end.column, item.loc.end.offset)
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
    getFileClass(fileName: string) {
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
    constructor() {
        this.using = new Array<Use>();
        this.parameters = new Array<String>();
        this.interfaces = new Array<String>();
        this.services = new Array<String>();
        this.functions = new Array<ClassFunction>();
        this.variables = {};
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
    abstract() {
        this.isAbstract = true;
    }
}
class ClassFunction {
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
class Variable {
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

class Use {
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
export class Position {
    constructor(line = 0, column = 0, offset = 0) {
        this.line = line;
        this.column = column;
        this.offset = offset;
    }

    public line: number;
    public column: number;
    public offset: number;
}

interface VariableStorage {
    [id: string]: Variable
}
interface ClassStorageType {
    [id: string]: ClassDeclaration
}
