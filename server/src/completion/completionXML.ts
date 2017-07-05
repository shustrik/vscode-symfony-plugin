/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import { CompletionItem, Position, TextDocument } from 'vscode-languageserver';
import { dirname, basename } from 'path';
import { Services } from '../services/service';
import * as completion from './completion';
import { ClassStorage } from '../php/parser';
import { ExtensionTextDocument } from '../documents';

export class CompletionXMLItemProvider {
    services: Services
    classStorage: ClassStorage
    constructor(services: Services, classStorage: ClassStorage) {
        this.services = services;
        this.classStorage = classStorage;
    }

    public provideCompletionItems(document: ExtensionTextDocument, position: Position): CompletionItem[] {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position,/(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g);
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
