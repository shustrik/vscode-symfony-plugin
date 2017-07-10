/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';


import { CompletionItem, TextDocument, Position, Range, Definition, Location } from 'vscode-languageserver';
import { Services } from './services/service';
import { dirname, basename } from 'path';
import { ClassStorage } from './php/phpStructure';
import { ExtensionTextDocument } from './documents';

export class DefinitionProvider {
	services: Services;
	classStorage: ClassStorage
	constructor(services: Services, classStorage: ClassStorage) {
		this.services = services;
		this.classStorage = classStorage;
	}

	public provideDefinition(document: ExtensionTextDocument, position: Position): Definition {
		let lineText = document.lineAt(position);
		let wordAtPosition = document.getWordRangeAtPosition(position);
		if (!wordAtPosition) {
			return [];
		}
		let currentWord = document.getRangeText(wordAtPosition);
		let service = this.services.getServiceClass(currentWord);
		if (service) {
			let filename = this.classStorage.getClassFileName(service);
			return Location.create('file://' + filename, Range.create(Position.create(4, 0), Position.create(4, 10)));
		}
		return null
	}
}
