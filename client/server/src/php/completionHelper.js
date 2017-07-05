"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../php/parser");
const services = require("../services/service");
function isService(classStorage, fileName, text, position, currentWord) {
    let ast = parser_1.parseEval(text);
    let classDeclaration = classStorage.getFileClass(fileName);
    if (!ast.children || !classDeclaration) {
        return false;
    }
    if (walkAST(function (node, parent) { return isServiceConditions(classStorage, classDeclaration, position, currentWord, node, parent); }, ast)) {
        return true;
    }
    return false;
}
exports.isService = isService;
function isParameter(classStorage, fileName, text, position, currentWord) {
    let ast = parser_1.parseEval(text);
    let classDeclaration = classStorage.getFileClass(fileName);
    if (!ast.children || !classDeclaration) {
        return false;
    }
    if (walkAST(function (node, parent) { return isParameterConditions(classStorage, classDeclaration, position, currentWord, node, parent); }, ast)) {
        return true;
    }
    return false;
}
exports.isParameter = isParameter;
function isServiceConditions(classStorage, classDeclaration, position, currentWord, node, parent) {
    if (node.kind == 'new' &&
        classDeclaration.classIsConteinerCompletion(node.what.name) &&
        node.arguments.length > 0) {
        let arg = node.arguments[0];
        if (arg.value == currentWord) {
            return true;
        }
    }
    if (node.kind == 'propertylookup') {
        if (node.what.kind == 'variable') {
            let func = classDeclaration.findMethodByLine(position.line);
            let type = func.getVariable(node.what.name);
            if (type) {
                let fqn = classDeclaration.getFQNFromName(type.getType());
                if (fqn == services.containerCompleteClass.containerBuilder &&
                    node.offset.kind == 'constref' &&
                    (node.offset.name == 'getDefinition' || node.offset.name == 'hasDefinition')) {
                    if (parent && parent.arguments && parent.arguments[0].kind == 'string' && parent.arguments[0].value == currentWord) {
                        return true;
                    }
                }
            }
            if (node.offset.name == 'get') {
                let containerInterfaceClass = classDeclaration;
                while (containerInterfaceClass) {
                    if (containerInterfaceClass.hasInterface(services.containerCompleteClass.controllerContainer)) {
                        if (parent && parent.arguments && parent.arguments[0].kind == 'string' && parent.arguments[0].value == currentWord) {
                            return true;
                        }
                    }
                    containerInterfaceClass = classStorage.getClassByName(classDeclaration.getParent());
                }
            }
        }
    }
    return false;
}
function isParameterConditions(classStorage, classDeclaration, position, currentWord, node, parent) {
    if (node.kind == 'propertylookup') {
        if (node.what.kind == 'variable') {
            let func = classDeclaration.findMethodByLine(position.line);
            let type = func.getVariable(node.what.name);
            if (type) {
                let fqn = classDeclaration.getFQNFromName(type.getType());
                if (fqn == services.containerCompleteClass.containerBuilder &&
                    node.offset.kind == 'constref' &&
                    node.offset.name == 'getParameter') {
                    if (parent && parent.arguments && parent.arguments[0].kind == 'string' && parent.arguments[0].value == currentWord) {
                        return true;
                    }
                }
            }
            if (node.offset.name == 'getParameter') {
                let containerInterfaceClass = classDeclaration;
                while (containerInterfaceClass) {
                    if (containerInterfaceClass.hasInterface(services.containerCompleteClass.controllerContainer)) {
                        if (parent && parent.arguments && parent.arguments[0].kind == 'string' && parent.arguments[0].value == currentWord) {
                            return true;
                        }
                    }
                    containerInterfaceClass = classStorage.getClassByName(classDeclaration.getParent());
                }
            }
        }
    }
    return false;
}
function walkAST(callback, node, parent) {
    if (node.kind == 'assign') {
        return walkAST(callback, node.right, node);
    }
    if (node.kind == 'if') {
        return walkAST(callback, node.test, node);
    }
    if (node.kind == 'return') {
        return walkAST(callback, node.expr, node);
    }
    if (callback(node, parent)) {
        return true;
    }
    if (node.arguments && node.arguments.length > 0) {
        for (var index = 0; index < node.arguments.length; index++) {
            if (walkAST(callback, node.arguments[index], node)) {
                return true;
            }
        }
    }
    if (node.what) {
        return walkAST(callback, node.what, node);
    }
    if (node.children) {
        for (var index = 0; index < node.children.length; index++) {
            if (walkAST(callback, node.children[index])) {
                return true;
            }
        }
    }
}
//# sourceMappingURL=completionHelper.js.map