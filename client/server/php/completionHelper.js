"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../php/parser");
const services = require("../services/service");
const vscode_languageserver_1 = require("vscode-languageserver");
function isService(classStorage, fileName, text, position, currentWord) {
    let ast = parser_1.parseEval(text);
    let classDeclaration = classStorage.getClassInFile(fileName);
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
    let classDeclaration = classStorage.getClassInFile(fileName);
    if (!ast.children || !classDeclaration) {
        return false;
    }
    if (walkAST(function (node, parent) { return isParameterConditions(classStorage, classDeclaration, position, currentWord, node, parent); }, ast)) {
        return true;
    }
    return false;
}
exports.isParameter = isParameter;
function getServiceMethods(classStorage, fileName, text, services, currentWord) {
    let ast = parser_1.parseEval(text);
    let classDeclaration = classStorage.getClassInFile(fileName);
    let result = walkAST(function (node, parent) {
        let service = findService(classStorage, classDeclaration, currentWord, node, parent);
        if (!service) {
            return false;
        }
        return getClassServiceMethods(services, classStorage, service, currentWord);
    }, ast);
    if (!result) {
        return [];
    }
    return result;
}
exports.getServiceMethods = getServiceMethods;
function getClassServiceMethods(services, classStorage, service, currentWord) {
    let serviceDefition = services.getService(service);
    if (!serviceDefition) {
        return [];
    }
    let classDeclaration = classStorage.getClassByName(serviceDefition.getClass());
    if (!classDeclaration) {
        return [];
    }
    let suggest = [];
    classDeclaration.getPublicFunctions().forEach(element => {
        if (element.getName().match(currentWord)) {
            let packageItem = vscode_languageserver_1.CompletionItem.create(element.getName());
            packageItem.kind = vscode_languageserver_1.CompletionItemKind.Method;
            packageItem.insertText = element.getName();
            packageItem.label = element.getName();
            suggest.push(packageItem);
        }
    });
    return suggest;
}
function findService(classStorage, classDeclaration, currentWord, node, parent) {
    if (node.kind == 'propertylookup') {
        if (node.what.kind == 'call') {
            if (node.what.what.kind == 'propertylookup') {
                if (node.what.what.offset.name == 'get') {
                    let containerInterfaceClass = classDeclaration;
                    while (containerInterfaceClass) {
                        if (containerInterfaceClass.hasInterface(services.containerCompleteClass.controllerContainer)) {
                            if (parent.kind == 'call' && parent.what.offset.name == currentWord && node.what.arguments[0].kind === 'string') {
                                return node.what.arguments[0].value;
                            }
                        }
                        containerInterfaceClass = classStorage.getClassByName(containerInterfaceClass.getParent());
                    }
                }
            }
        }
    }
    return false;
}
function isServiceConditions(classStorage, classDeclaration, position, currentWord, node, parent) {
    if (node.kind == 'new' &&
        conteinerCompletionType(classDeclaration.getFQNFromName(node.what.name)) &&
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
                    containerInterfaceClass = classStorage.getClassByName(containerInterfaceClass.getParent());
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
    if (!node) {
        return false;
    }
    if (node.kind == 'assign') {
        return walkAST(callback, node.right, node);
    }
    if (node.kind == 'if') {
        return walkAST(callback, node.test, node);
    }
    if (node.kind == 'return') {
        return walkAST(callback, node.expr, node);
    }
    let result = callback(node, parent);
    if (result) {
        return result;
    }
    if (node.arguments && node.arguments.length > 0) {
        for (var index = 0; index < node.arguments.length; index++) {
            let result = walkAST(callback, node.arguments[index], node);
            if (result) {
                return result;
            }
        }
    }
    if (node.what) {
        return walkAST(callback, node.what, node);
    }
    if (node.children) {
        for (var index = 0; index < node.children.length; index++) {
            let result = walkAST(callback, node.children[index]);
            if (result) {
                return result;
            }
        }
    }
    return false;
}
function conteinerCompletionType(type) {
    if (type == services.containerCompleteClass.container ||
        type == services.containerCompleteClass.reference ||
        type == services.containerCompleteClass.controllerContainer ||
        type == services.containerCompleteClass.decorator) {
        return true;
    }
    return false;
}
//# sourceMappingURL=completionHelper.js.map