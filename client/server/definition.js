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
    providePHPDefinition(document, position) {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(wordAtPosition);
        let classDeclaration = this.classStorage.getClassByName(currentWord);
        if (classDeclaration && classDeclaration.getPath() == document.getUri()) {
            let service = this.services.getServiceByClass(classDeclaration.getFqnName());
            if (service) {
                return vscode_languageserver_1.Location.create('file://' + service.getPath(), service.getRange());
            }
            return null;
        }
        let service = this.services.getService(currentWord);
        if (service) {
            let classDeclaration = this.classStorage.getClassByName(service.getClass());
            if (classDeclaration) {
                return vscode_languageserver_1.Location.create('file://' + classDeclaration.getPath(), classDeclaration.getClassRange());
            }
        }
        return null;
    }
    provideYamlDefinition(document, position) {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position, /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\|\;\:\'\"\,\<\>\?\s]+)/g);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(wordAtPosition);
        let classDeclaration = this.classStorage.getClassByName(currentWord);
        if (classDeclaration) {
            return vscode_languageserver_1.Location.create('file://' + classDeclaration.getPath(), classDeclaration.getClassRange());
        }
        let service = this.services.getService(currentWord);
        if (service) {
            let classDeclaration = this.classStorage.getClassByName(service.getClass());
            return vscode_languageserver_1.Location.create('file://' + classDeclaration.getPath(), classDeclaration.getClassRange());
        }
        return null;
    }
    provideXmlDefinition(document, position) {
        return null;
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definition.js.map