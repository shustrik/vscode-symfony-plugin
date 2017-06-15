/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import vscode = require('vscode');
import { Services } from '../services/services';
import { dirname, basename } from 'path';
import { ClassStorage } from '../php/parser';
import * as completion from './completion';

export class CompletionPHPItemProvider implements vscode.CompletionItemProvider {
	services: Services;
	classStorage: ClassStorage
	constructor(services: Services, classStorage: ClassStorage) {
		this.services = services;
		this.classStorage = classStorage;
	}

	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
		let lineText = document.lineAt(position.line).text;
		let wordAtPosition = document.getWordRangeAtPosition(position);
		if (!wordAtPosition) {
			return Promise.resolve([]);
		}
		let currentWord = document.getText(wordAtPosition);
		let helper = this.classStorage.getCompletionHelper(document.fileName, lineText, position);
		if (!helper) {
			return Promise.resolve([]);
		}
		if (helper.isService()) {
			return completion.serviceArgumentCompletion(this.services, currentWord);
		}
		if (helper.isParameter()) {
			return completion.parameterArgumentCompletion(this.services, currentWord.substring(1));
		}

		return Promise.resolve([]);
	}

}
