import * as services from '../services/service'
import vscode = require('vscode');

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

export function parse(code, path: string, classStorage: ClassStorage) {
    let classDeclaration = new ClassDeclaration();
    let ast = parserInst.parseCode(code);
    branchProcess(ast, classDeclaration);
    classStorage.add(path, classDeclaration);
    console.log(classDeclaration);
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

            // case "trait":
            //     this.buildTrait(branch, tree.traits, parent);
            //     break;

        }
        if (branch.children) {
            branchProcess(branch.children, classDeclaration);
        }
    }

    return false;
}
function methodProcess(node, func: ClassFunction, classDeclaration: ClassDeclaration) {
    switch (node.kind) {
        case "assign":
            assignment(node, func, classDeclaration);
            break;
    }
}
function classProperty(node, classDeclaration: ClassDeclaration) {
    let variable = new Variable(node.name);
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
        let variable = new Variable(node.left.name);
        if (node.right && node.right.kind == "new") {
            if (node.right.what && node.right.what.name) {
                if (node.right.what.kind == "identifier") {
                    variable.setType(node.right.what.name);
                }
            }
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
    node.arguments.forEach(item => {
        let variable = new Variable(item.name);
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
    getCompletionHelper(fileName: string, lineText, position: vscode.Position): CompletionHelper {
        return null;
    }
}
class CompletionHelper {
    isService() {

    }
    isParameter() {

    }
}

class ClassDeclaration {
    name: string
    variables: VariableStorage
    functions: Array<ClassFunction>
    namespace: string
    using: Array<Use>
    parent: string
    isAbstract: boolean
    constructor() {
        this.using = new Array<Use>();
        this.functions = new Array<ClassFunction>();
        this.variables = {};
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
    setPropertyType(name: string, type: string) {
        if (this.variables[name]) {
            this.variables[name].setType(type);
        }
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
    constructor(name: string, start: Position, end: Position) {
        this.name = name;
        this.start = start;
        this.end = end;
        this.variables = {};
    }
    addVariable(variable: Variable) {
        this.variables[variable.getName()] = variable;
    }
    getVariableType(name: string) {
        if (this.variables[name]) {
            return this.variables[name].getType();
        }
        return false;
    }
}
class Variable {
    name: string
    type: string
    isContainerCompletion: boolean
    constructor(name: string) {
        this.name = name;
        this.isContainerCompletion = false;
    }
    setType(type: string) {
        this.type = type;
        if (type == services.containerCompleteClass.container ||
            type == services.containerCompleteClass.reference ||
            type == services.containerCompleteClass.decorator
        ) {
            this.isContainerCompletion = true;
        }
    }
    getType() {
        return this.type;
    }
    getName() {
        return this.name;
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
