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
    provideCompletionItems(document, position) {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(wordAtPosition);
        if (helper.isService(this.classStorage, document.uri, lineText, position, currentWord)) {
            return completion.serviceArgumentCompletion(this.services, currentWord);
        }
        if (helper.isParameter(this.classStorage, document.uri, lineText, position, currentWord)) {
            return completion.parameterArgumentCompletion(this.services, currentWord);
        }
        return helper.getServiceMethods(this.classStorage, document.uri, lineText, this.services, currentWord);
    }
}
exports.CompletionPHPItemProvider = CompletionPHPItemProvider;
//# sourceMappingURL=completionPhp.js.map