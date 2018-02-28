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
let badPHPFiles: Array<string>;
let badYamlFiles: Array<string>;
let badXmlFiles: Array<string>;
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
const parseFile = new RequestType<{ text: string, path: string }, void, void, void>('parseFile');
const deleteFile = new RequestType<{ text: string, path: string }, void, void, void>('deleteFile');
const diagnosticInfo = new RequestType<{ text: string, path: string }, void, void, void>('diagnosticInfo');

connection.onInitialize((params): InitializeResult => {
	badPHPFiles = new Array<string>();
	badYamlFiles = new Array<string>();
	badXmlFiles = new Array<string>();
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

connection.onRequest(diagnosticInfo, () => {
	connection.console.log("Founded " + services.getServicesIds().length + " services");
	connection.console.log("Broken PHP files: " + badPHPFiles.length);
	connection.console.log("Broken Yaml files: " + badYamlFiles.length);
	connection.console.log("Broken XML files: " + badXmlFiles.length);
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
		try {
			php_parser.parse(body, path, classStorage);
		} catch (e) {
			badPHPFiles.push(path);
		}
	}
	if (extension == 'yml' || extension == 'yaml') {
		let document = new ExtensionTextDocument(body, path, 'yaml')
		documentStore.push(path, document);
		try {
			let result = yaml_parser.parse(body, path, services);
		} catch (e) {
			badYamlFiles.push(path);
		}
	}
	if (extension == 'xml') {
		let document = new ExtensionTextDocument(body, path, 'xml')
		documentStore.push(path, document);
		try {
			let result = xml_parser.parse(body, path, services);
		} catch (e) {
			badXmlFiles.push(path);
		}
	}
}
function waitHandler<T>(callback: () => T) {
	let result = callback();
	return result;
}