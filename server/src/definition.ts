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

	public providePHPDefinition(document: ExtensionTextDocument, position: Position): Definition {
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
				return Location.create('file://' + service.getPath(), service.getRange());
			}
			return null;
		}
		let service = this.services.getService(currentWord);
		if (service) {
			let classDeclaration = this.classStorage.getClassByName(service.getClass());
			if (classDeclaration) {
				return Location.create('file://' + classDeclaration.getPath(), classDeclaration.getClassRange());
			}
		}
		return null
	}
	public provideYamlDefinition(document: ExtensionTextDocument, position: Position): Definition {
		let lineText = document.lineAt(position);
		let wordAtPosition = document.getWordRangeAtPosition(position, /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\|\;\:\'\"\,\<\>\?\s]+)/g);
		if (!wordAtPosition) {
			return [];
		}
		let currentWord = document.getRangeText(wordAtPosition);
		let classDeclaration = this.classStorage.getClassByName(currentWord);
		if (classDeclaration) {
			return Location.create('file://' + classDeclaration.getPath(), classDeclaration.getClassRange());
		}
		let service = this.services.getService(currentWord);
		if (service) {
			let classDeclaration = this.classStorage.getClassByName(service.getClass());
			return Location.create('file://' + classDeclaration.getPath(), classDeclaration.getClassRange());
		}
		return null;
	}
	public provideXmlDefinition(document: ExtensionTextDocument, position: Position): Definition {
		return null
	}
}
