import * as services from '../services/service'
import { ClassStorage, ClassDeclaration, Position, ClassFunction, Variable, Use}from './phpStructure'

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

