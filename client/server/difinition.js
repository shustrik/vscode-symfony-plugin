/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class DifinitionProvider {
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
        let service = this.services.getServiceClass(currentWord);
        if (service) {
            this.classStorage.getClassFileName(service);
        }
    }
}
exports.DifinitionProvider = DifinitionProvider;
//# sourceMappingURL=difinition.js.map