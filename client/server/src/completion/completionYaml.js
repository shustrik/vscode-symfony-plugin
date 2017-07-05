/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const completion = require("./completion");
class CompletionYamlItemProvider {
    constructor(services, classStorage) {
        this.services = services;
        this.classStorage = classStorage;
    }
    provideCompletionItems(document, position, token) {
        let lineText = document.lineAt(position.line).text;
        let wordAtPosition = document.getWordRangeAtPosition(position);
        if (!wordAtPosition) {
            return Promise.resolve([]);
        }
        let currentWord = document.getText(new vscode.Range(document.positionAt(document.offsetAt(wordAtPosition.start) - 1), wordAtPosition.end));
        if (lineText.match(/^(\s)*(class:)(\s)+/)) {
            return completion.classCodeCompletion(this.services, this.classStorage, currentWord);
        }
        if (lineText.match(/^(\s)*(parent:)(\s)+/)) {
            return completion.serviceArgumentCompletion(this.services, currentWord.substring(1));
        }
        let prevLineNumber = 1;
        while (!lineText.match(/^(\s)*(class:)(\s)+/)) {
            if (lineText.match(/^(\s)*(arguments:)*(\s)+/)) {
                if (currentWord.includes('@')) {
                    return completion.serviceArgumentCompletion(this.services, currentWord.substring(1));
                }
                if (currentWord.includes('%')) {
                    return completion.parameterArgumentCompletion(this.services, currentWord.substring(1));
                }
                return Promise.resolve([]);
            }
            lineText = document.lineAt(position.line - prevLineNumber).text;
            prevLineNumber++;
        }
        while (!lineText.match(/^(\s)*(class:)(\s)+/)) {
            if (lineText.match(/^(\s)*(tags:)(\s)+/)) {
                return completion.tagsCompletion(this.services, currentWord);
            }
            lineText = document.lineAt(position.line - prevLineNumber).text;
            prevLineNumber++;
        }
        return Promise.resolve([]);
    }
}
exports.CompletionYamlItemProvider = CompletionYamlItemProvider;
//# sourceMappingURL=completionYaml.js.map