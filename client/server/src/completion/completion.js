"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function classCodeCompletion(services, classStorage, currentWord) {
    return new Promise((resolve, reject) => {
        let suggest = [];
        classStorage.getFqnClasses().forEach(element => {
            if (element.match(currentWord.trim())) {
                let packageItem = new vscode.CompletionItem(element);
                packageItem.kind = vscode.CompletionItemKind.Keyword;
                packageItem.insertText = element;
                packageItem.label = element;
                suggest.push(packageItem);
            }
        });
        resolve(suggest);
    });
}
exports.classCodeCompletion = classCodeCompletion;
function parameterArgumentCompletion(services, currentWord) {
    return new Promise((resolve, reject) => {
        let suggest = [];
        services.getParameters().forEach(element => {
            if (element.match(currentWord)) {
                let packageItem = new vscode.CompletionItem(element);
                packageItem.kind = vscode.CompletionItemKind.Keyword;
                packageItem.insertText = element;
                packageItem.label = element;
                suggest.push(packageItem);
            }
        });
        resolve(suggest);
    });
}
exports.parameterArgumentCompletion = parameterArgumentCompletion;
function serviceArgumentCompletion(services, currentWord) {
    return new Promise((resolve, reject) => {
        let suggest = [];
        services.getServicesIds().forEach(element => {
            if (element.match(currentWord)) {
                let packageItem = new vscode.CompletionItem(element);
                packageItem.kind = vscode.CompletionItemKind.Keyword;
                packageItem.insertText = element;
                packageItem.label = element;
                suggest.push(packageItem);
            }
        });
        resolve(suggest);
    });
}
exports.serviceArgumentCompletion = serviceArgumentCompletion;
function tagsCompletion(services, currentWorld) {
    return new Promise((resolve, reject) => { resolve([]); });
}
exports.tagsCompletion = tagsCompletion;
//# sourceMappingURL=completion.js.map