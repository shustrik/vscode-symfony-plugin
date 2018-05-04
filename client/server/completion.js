"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const helper = require("./php/completionHelper");
class CompletionProvider {
    constructor(services, classStorage) {
        this.services = services;
        this.classStorage = classStorage;
    }
    provideCompletionPHPItems(document, position) {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(wordAtPosition);
        if (helper.isService(this.classStorage, document.uri, lineText, position, currentWord)) {
            return this.serviceArgumentCompletion(this.services, currentWord);
        }
        if (helper.isParameter(this.classStorage, document.uri, lineText, position, currentWord)) {
            return this.parameterArgumentCompletion(this.services, currentWord);
        }
        return helper.getServiceMethods(this.classStorage, document.uri, lineText, this.services, currentWord);
    }
    provideCompletionXMLItems(document, position) {
        let lineText = document.lineAt(position).trim();
        let wordAtPosition = document.getWordRangeAtPosition(position, /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(wordAtPosition);
        if (lineText.match(/^<(\s)*(class|id)(\s)+/)) {
            return this.classCodeCompletion(this.services, this.classStorage, currentWord);
        }
        if (lineText.match(/<(\s)*argument(\s)+/)) {
            if (lineText.includes('service')) {
                return this.serviceArgumentCompletion(this.services, currentWord.substring(1));
            }
            if (currentWord.includes('%')) {
                return this.parameterArgumentCompletion(this.services, currentWord.substring(1));
            }
            return [];
        }
        if (lineText.match(/^<(\s)*tag(\s)+/)) {
            return this.tagsCompletion(this.services, currentWord);
        }
        return [];
    }
    provideCompletionYAMLItems(document, position) {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position, /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(wordAtPosition.start.line, wordAtPosition.start.character - 1), wordAtPosition.end));
        if (lineText.match(/^(\s)*(class:)(\s)+/)) {
            return this.classCodeCompletion(this.services, this.classStorage, currentWord);
        }
        if (lineText.match(/^(\s)*(parent:)(\s)+/)) {
            return this.serviceArgumentCompletion(this.services, currentWord.substring(1));
        }
        if (lineText.match(/^(\s)*(tags:)(\s)+/)) {
            return this.tagsCompletion(this.services, currentWord);
        }
        let prevLineNumber = 1;
        while (!lineText.match(/^(\s)*(class:)(\s)+/)) {
            //bad regular expression
            if (lineText.match(/^(\s)*arguments:+/)) {
                if (currentWord.includes('@')) {
                    return this.serviceArgumentCompletion(this.services, currentWord.substring(1));
                }
                if (currentWord.includes('%')) {
                    return this.parameterArgumentCompletion(this.services, currentWord.substring(1));
                }
                return [];
            }
            if (lineText.match(/^(\s)*tags:+/)) {
                return this.tagsCompletion(this.services, currentWord);
            }
            lineText = document.lineAt(vscode_languageserver_1.Position.create(position.line - prevLineNumber, 0));
            prevLineNumber++;
        }
        return [];
    }
    classCodeCompletion(services, classStorage, currentWord) {
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
    parameterArgumentCompletion(services, currentWord) {
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
    serviceArgumentCompletion(services, currentWord) {
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
    tagsCompletion(services, currentWord) {
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
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completion.js.map