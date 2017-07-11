"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
function classCodeCompletion(services, classStorage, currentWord) {
    let suggest = [];
    classStorage.getFqnClasses().forEach(element => {
        if (element.match(currentWord.trim())) {
            let packageItem = vscode_languageserver_1.CompletionItem.create(element);
            packageItem.kind = vscode_languageserver_1.CompletionItemKind.Keyword;
            packageItem.insertText = element;
            packageItem.label = element;
            suggest.push(packageItem);
        }
    });
    return suggest;
}
exports.classCodeCompletion = classCodeCompletion;
function parameterArgumentCompletion(services, currentWord) {
    let suggest = [];
    services.getParameters().forEach(element => {
        if (element.match(currentWord)) {
            let packageItem = vscode_languageserver_1.CompletionItem.create(element);
            packageItem.kind = vscode_languageserver_1.CompletionItemKind.Keyword;
            packageItem.insertText = element;
            packageItem.label = element;
            suggest.push(packageItem);
        }
    });
    return suggest;
}
exports.parameterArgumentCompletion = parameterArgumentCompletion;
function serviceArgumentCompletion(services, currentWord) {
    let suggest = [];
    services.getServicesIds().forEach(element => {
        if (element.match(currentWord)) {
            let packageItem = vscode_languageserver_1.CompletionItem.create(element);
            packageItem.kind = vscode_languageserver_1.CompletionItemKind.Keyword;
            packageItem.insertText = element;
            packageItem.label = element;
            suggest.push(packageItem);
        }
    });
    return suggest;
}
exports.serviceArgumentCompletion = serviceArgumentCompletion;
function tagsCompletion(services, currentWord) {
    let suggest = [];
    services.getTags().forEach(element => {
        if (element.match(currentWord.trim())) {
            let packageItem = vscode_languageserver_1.CompletionItem.create(element);
            packageItem.kind = vscode_languageserver_1.CompletionItemKind.Keyword;
            packageItem.insertText = element;
            packageItem.label = element;
            suggest.push(packageItem);
        }
    });
    return suggest;
}
exports.tagsCompletion = tagsCompletion;
//# sourceMappingURL=completion.js.map