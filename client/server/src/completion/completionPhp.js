/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const helper = require("../php/completionHelper");
const completion = require("./completion");
class CompletionPHPItemProvider {
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
        let currentWord = document.getText(wordAtPosition);
        if (helper.isService(this.classStorage, document.fileName, lineText, position, currentWord)) {
            return completion.serviceArgumentCompletion(this.services, currentWord);
        }
        if (helper.isParameter(this.classStorage, document.fileName, lineText, position, currentWord)) {
            return completion.parameterArgumentCompletion(this.services, currentWord);
        }
        return Promise.resolve([]);
    }
}
exports.CompletionPHPItemProvider = CompletionPHPItemProvider;
//# sourceMappingURL=completionPhp.js.map