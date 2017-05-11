/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import vscode = require('vscode');
import { dirname, basename } from 'path';
import { Services } from './services/services';
import * as completion from './completion';

function vscodeKindFromGoCodeClass(kind: string): vscode.CompletionItemKind {
	switch (kind) {
		case 'const':
		case 'package':
		case 'type':
			return vscode.CompletionItemKind.Keyword;
		case 'func':
			return vscode.CompletionItemKind.Function;
		case 'var':
			return vscode.CompletionItemKind.Field;
		case 'import':
			return vscode.CompletionItemKind.Module;
	}
	return vscode.CompletionItemKind.Property; // TODO@EG additional mappings needed?
}

export class CompletionYamlItemProvider implements vscode.CompletionItemProvider {
	services: Services;
	constructor(services: Services) {
		this.services = services;
	}

	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
		let lineText = document.lineAt(position.line).text;
		let wordAtPosition = document.getWordRangeAtPosition(position);
		if (!wordAtPosition) {
			return Promise.resolve([]);
		}
		let currentWord = document.getText(new vscode.Range(document.positionAt(document.offsetAt(wordAtPosition.start)-1), wordAtPosition.end);
		if (lineText.match(/^(\s)*(class:)(\s)+/)) {
			return completion.classCodeCompletion(this.services, currentWord);
		}
		let prevLineNumber = 1;
		while (!lineText.match(/^(\s)*(class:)(\s)+/)) {
			if (lineText.match(/^(\s)*(arguments:)*(\s)+/)) {
				if (currentWord.includes('@')) {
					return completion.serviceArgumentCompletion(this.services, currentWord);
				}
				if (currentWord.includes('%')) {
					return completion.parameterArgumentCompletion(this.services, currentWord);
				}
				return Promise.resolve([]);
			}
			lineText = document.lineAt(position.line - prevLineNumber).text;
			prevLineNumber++;
		}

		while (!lineText.match(/^(\s)*(class:)(\s)+/)) {
			if (lineText.match(/^(\s)*(tags:)(\s)+/)) {
				return completion.tagsCompletion(this.services, currentWord);
			}
			lineText = document.lineAt(position.line - prevLineNumber).text;
			prevLineNumber++;
		}

		return Promise.resolve([]);
	}
}
