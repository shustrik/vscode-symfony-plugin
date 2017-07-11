/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import { CompletionItem, TextDocument, Position, Range } from 'vscode-languageserver';
import { dirname, basename } from 'path';
import { Services } from '../services/service';
import * as completion from './completion';
import { ClassStorage } from '../php/phpStructure';
import { ExtensionTextDocument } from '../documents';


export class CompletionYamlItemProvider {
	services: Services;
	classStorage: ClassStorage
	constructor(services: Services, classStorage: ClassStorage) {
		this.services = services;
		this.classStorage = classStorage;
	}

	public provideCompletionItems(document: ExtensionTextDocument, position: Position): CompletionItem[] {
		let lineText = document.lineAt(position);
		let wordAtPosition = document.getWordRangeAtPosition(position, /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g);
		if (!wordAtPosition) {
			return [];
		}
		let currentWord = document.getRangeText(Range.create(Position.create(wordAtPosition.start.line, wordAtPosition.start.character - 1), wordAtPosition.end));
		if (lineText.match(/^(\s)*(class:)(\s)+/)) {
			return completion.classCodeCompletion(this.services, this.classStorage, currentWord);
		}
		if (lineText.match(/^(\s)*(parent:)(\s)+/)) {
			return completion.serviceArgumentCompletion(this.services, currentWord.substring(1));
		}
		if (lineText.match(/^(\s)*(tags:)(\s)+/)) {
			return completion.tagsCompletion(this.services, currentWord);
		}
		let prevLineNumber = 1;
		while (!lineText.match(/^(\s)*(class:)(\s)+/)) {
			//проблемная регулярка
			if (lineText.match(/^(\s)*arguments:+/)) {
				if (currentWord.includes('@')) {
					return completion.serviceArgumentCompletion(this.services, currentWord.substring(1));
				}
				if (currentWord.includes('%')) {
					return completion.parameterArgumentCompletion(this.services, currentWord.substring(1));
				}
				return [];
			}
			if (lineText.match(/^(\s)*tags:+/)) {
				return completion.tagsCompletion(this.services, currentWord);
			}
			lineText = document.lineAt(Position.create(position.line - prevLineNumber, 0));
			prevLineNumber++;
		}
		return [];
	}
}
