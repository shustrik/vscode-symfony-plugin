/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const completion = require("./completion");
class CompletionXMLItemProvider {
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
        if (lineText.match(/^(\s)*(class|id)(\s)+/)) {
            return completion.classCodeCompletion(this.services, this.classStorage, currentWord);
        }
        if (lineText.match(/^(\s)*(argument)*(\s)+/)) {
            if (lineText.includes('service')) {
                return completion.serviceArgumentCompletion(this.services, currentWord.substring(1));
            }
            if (currentWord.includes('%')) {
                return completion.parameterArgumentCompletion(this.services, currentWord.substring(1));
            }
            return Promise.resolve([]);
        }
        if (lineText.match(/^(\s)*(tag)(\s)+/)) {
            return completion.tagsCompletion(this.services, currentWord);
        }
        return Promise.resolve([]);
    }
}
exports.CompletionXMLItemProvider = CompletionXMLItemProvider;
//# sourceMappingURL=completionXML.js.map