/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const completion = require("./completion");
class CompletionYamlItemProvider {
    constructor(services, classStorage) {
        this.services = services;
        this.classStorage = classStorage;
    }
    provideCompletionItems(document, position) {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position, /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(wordAtPosition.start.line, wordAtPosition.start.character - 1), wordAtPosition.end));
        if (lineText.match(/^(\s)*(class:)(\s)+/)) {
            return completion.classCodeCompletion(this.services, this.classStorage, currentWord);
        }
        if (lineText.match(/^(\s)*(parent:)(\s)+/)) {
            return completion.serviceArgumentCompletion(this.services, currentWord.substring(1));
        }
        if (lineText.match(/^(\s)*(tags:)(\s)+/)) {
            return completion.tagsCompletion(this.services, currentWord);
        }
        let prevLineNumber = 1;
        while (!lineText.match(/^(\s)*(class:)(\s)+/)) {
            //проблемная регулярка
            if (lineText.match(/^(\s)*(arguments:)*(\s)+/)) {
                if (currentWord.includes('@')) {
                    return completion.serviceArgumentCompletion(this.services, currentWord.substring(1));
                }
                if (currentWord.includes('%')) {
                    return completion.parameterArgumentCompletion(this.services, currentWord.substring(1));
                }
                return [];
            }
            if (lineText.match(/^(\s)*(tags:)*(\s)+/)) {
                return completion.tagsCompletion(this.services, currentWord);
            }
            lineText = document.lineAt(vscode_languageserver_1.Position.create(position.line - prevLineNumber, 0));
            prevLineNumber++;
        }
        return [];
    }
}
exports.CompletionYamlItemProvider = CompletionYamlItemProvider;
//# sourceMappingURL=completionYaml.js.map