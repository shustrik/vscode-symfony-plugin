'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, DidSaveTextDocumentParams,
	InitializeParams, InitializeResult, TextDocumentIdentifier, TextDocumentPositionParams,
	CompletionItem, CompletionItemKind, RequestType, Position,
	SignatureHelp, SignatureInformation, ParameterInformation, Definition, DidChangeWatchedFilesParams, DidChangeTextDocumentParams
} from 'vscode-languageserver';
import { CompletionProvider } from './completion';
import { DefinitionProvider } from './definition';
import { Services } from './services/service';
import { DocumentStore, ExtensionTextDocument } from './documents';
import * as fs from 'fs';
import * as php_parser from './php/parser';
import * as xml_parser from './services/parse/xmlParser';
import * as yaml_parser from './services/parse/yamlParser';
import { ClassStorage } from './php/phpStructure'

let maxFileSizeBytes = 10000000;
let discoverMaxOpenFiles = 100;
let services: Services;
let classStorage: ClassStorage;
let documentStore: DocumentStore;
let completion: CompletionProvider;
let definition: DefinitionProvider;
let waiter: Promise<string>;
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
const parseFile = new RequestType<{ text: string, path: string }, void, void, void>('parseFile');
const deleteFile = new RequestType<{ text: string, path: string }, void, void, void>('deleteFile');

connection.onInitialize((params): InitializeResult => {
	services = new Services();
	classStorage = new ClassStorage();
	documentStore = new DocumentStore();
	completion = new CompletionProvider(services, classStorage);
	definition = new DefinitionProvider(services, classStorage);
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			workspaceSymbolProvider: true,
			definitionProvider: true,
			completionProvider: {
				triggerCharacters: ['$', '>', ':', '\'']
			}
		}
	}
});

connection.listen();

connection.onRequest(parseFile, (params) => {
	parseRequestFile(params.path, params.text);
});

connection.onRequest(deleteFile, (params) => {
	documentStore.remove(params.path);
	services.removePathDeps(params.path);
});

connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
	return waitHandler(() => {
		try {
			let extension = textDocumentPosition.textDocument.uri.split('.').pop();
			let fileName = textDocumentPosition.textDocument.uri.replace("file://", "");
			if (extension == 'php') {
				return completion.provideCompletionPHPItems(
					documentStore.get(fileName),
					textDocumentPosition.position);
			}
			if (extension == 'yml' || extension == 'yaml') {
				return completion.provideCompletionYAMLItems(
					documentStore.get(fileName),
					textDocumentPosition.position);
			}
			if (extension == 'xml') {
				return completion.provideCompletionXMLItems(
					documentStore.get(fileName),
					textDocumentPosition.position);
			}

			return [];
		} catch (e) {
			console.error(e);
		}
	});
});

connection.onWorkspaceSymbol((params) => {
	return [];
});

connection.onDefinition((textDocumentPosition: TextDocumentPositionParams): Definition => {
	try {
		let extension = textDocumentPosition.textDocument.uri.split('.').pop();
		let fileName = textDocumentPosition.textDocument.uri.replace("file://", "");
		let result = null;
		if (extension == 'php') {
			result = definition.providePHPDefinition(documentStore.get(fileName), textDocumentPosition.position)
		}
		if (extension == 'yml' || extension == 'yaml') {
			result = definition.provideYamlDefinition(documentStore.get(fileName), textDocumentPosition.position)
		}
		if (extension == 'xml') {
			result = definition.provideXmlDefinition(documentStore.get(fileName), textDocumentPosition.position)
		}

		return result;
	} catch (e) {
		console.error(e);
	}
});

connection.onDidChangeTextDocument((params: DidChangeTextDocumentParams) => {
	return waitHandler(() => {
		let extension = params.textDocument.uri.split('.').pop();
		let fileName = params.textDocument.uri.replace("file://", "");
		parseRequestFile(fileName, params.contentChanges.pop().text);
	});
});

function parseRequestFile(path: string, body: string) {
	let extension = path.split('.').pop();
	if (extension == 'php') {
		let document = new ExtensionTextDocument(body, path, 'php')
		documentStore.push(path, document);
		php_parser.parse(body, path, classStorage);
	}
	if (extension == 'yml' || extension == 'yaml') {
		let document = new ExtensionTextDocument(body, path, 'yaml')
		documentStore.push(path, document);
		yaml_parser.parse(body, path, services);
	}
	if (extension == 'xml') {
		let document = new ExtensionTextDocument(body, path, 'xml')
		documentStore.push(path, document);
		xml_parser.parse(body, path, services);
	}
}
function waitHandler<T>(callback: () => T) {
	let result = callback();
	return result;
}