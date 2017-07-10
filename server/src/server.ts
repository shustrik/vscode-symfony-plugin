'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, DidSaveTextDocumentParams,
	InitializeParams, InitializeResult, TextDocumentIdentifier, TextDocumentPositionParams,
	CompletionItem, CompletionItemKind, RequestType, Position,
	SignatureHelp, SignatureInformation, ParameterInformation, Definition, DidChangeWatchedFilesParams
} from 'vscode-languageserver';
import { CompletionYamlItemProvider } from './completion/completionYaml';
import { CompletionXMLItemProvider } from './completion/completionXML';
import { CompletionPHPItemProvider } from './completion/completionPhp';
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
let completionPhp: CompletionPHPItemProvider;
let completionYaml: CompletionYamlItemProvider;
let completionXml: CompletionXMLItemProvider;
let definition: DefinitionProvider;
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
const parseFile = new RequestType<{ text: string, path: string }, void, void, void>('parseFile');
const deleteFile = new RequestType<{ text: string, path: string }, void, void, void>('deleteFile');
const changeFile = new RequestType<{ text: string, path: string }, void, void, void>('changeFile');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
connection.onInitialize((params): InitializeResult => {
	services = new Services();
	classStorage = new ClassStorage();
	documentStore = new DocumentStore();
	completionPhp = new CompletionPHPItemProvider(services, classStorage);
	completionXml = new CompletionXMLItemProvider(services, classStorage);
	completionYaml = new CompletionYamlItemProvider(services, classStorage);
	definition = new DefinitionProvider(services, classStorage);
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
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

connection.onRequest(changeFile, (params) => {
	parseRequestFile(params.path, params.text);
});

connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
	let extension = textDocumentPosition.textDocument.uri.split('.').pop();
	let fileName = textDocumentPosition.textDocument.uri.replace("file://", "");
	if (extension == 'php') {
		return completionPhp.provideCompletionItems(
			documentStore.get(fileName),
			textDocumentPosition.position);
	}
	if (extension == 'yml' || extension == 'yaml') {
		return completionYaml.provideCompletionItems(
			documentStore.get(fileName),
			textDocumentPosition.position);
	}
	if (extension == 'xml') {
		return completionXml.provideCompletionItems(
			documentStore.get(fileName),
			textDocumentPosition.position);
	}

	return [];
});

connection.onWorkspaceSymbol((params) => {
	return [];
});

connection.onDefinition((textDocumentPosition: TextDocumentPositionParams): Definition => {
	let extension = textDocumentPosition.textDocument.uri.split('.').pop();
	let fileName = textDocumentPosition.textDocument.uri.replace("file://", "");
	let result = definition.provideDefinition(documentStore.get(fileName), textDocumentPosition.position);

	return result;
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