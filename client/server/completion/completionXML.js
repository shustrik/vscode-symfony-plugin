/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const completion = require("./completion");
class CompletionXMLItemProvider {
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
        let currentWord = document.getRangeText(wordAtPosition);
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
            return [];
        }
        if (lineText.match(/^(\s)*(tag)(\s)+/)) {
            return completion.tagsCompletion(this.services, currentWord);
        }
        return [];
    }
}
exports.CompletionXMLItemProvider = CompletionXMLItemProvider;
//# sourceMappingURL=completionXML.js.map