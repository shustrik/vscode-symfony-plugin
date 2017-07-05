/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';


import { CompletionItem, TextDocument, Position, Range } from 'vscode-languageserver';
import { Services } from '../services/service';
import { dirname, basename } from 'path';
import { ClassStorage } from '../php/parser';
import * as helper from '../php/completionHelper';
import { ExtensionTextDocument } from '../documents';
import * as completion from './completion';

export class CompletionPHPItemProvider {
	services: Services;
	classStorage: ClassStorage
	constructor(services: Services, classStorage: ClassStorage) {
		this.services = services;
		this.classStorage = classStorage;
	}

	public provideCompletionItems(document: ExtensionTextDocument, position: Position): CompletionItem[] {
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
