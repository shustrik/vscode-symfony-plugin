/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
class DefinitionProvider {
    constructor(services, classStorage) {
        this.services = services;
        this.classStorage = classStorage;
    }
    provideDefinition(document, position) {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(wordAtPosition);
        let service = this.services.getServiceClass(currentWord);
        if (service) {
            let filename = this.classStorage.getClassFileName(service);
            return vscode_languageserver_1.Location.create('file://' + filename, vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(4, 0), vscode_languageserver_1.Position.create(4, 10)));
        }
        return null;
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definition.js.map