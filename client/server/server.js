'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_languageserver_1 = require("vscode-languageserver");
const completion_1 = require("./completion");
const definition_1 = require("./definition");
const service_1 = require("./services/service");
const documents_1 = require("./documents");
const php_parser = require("./php/parser");
const xml_parser = require("./services/parse/xmlParser");
const yaml_parser = require("./services/parse/yamlParser");
const phpStructure_1 = require("./php/phpStructure");
let maxFileSizeBytes = 10000000;
let discoverMaxOpenFiles = 100;
let services;
let classStorage;
let documentStore;
let completion;
let definition;
let waiter;
let connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
const parseFile = new vscode_languageserver_1.RequestType('parseFile');
const deleteFile = new vscode_languageserver_1.RequestType('deleteFile');
connection.onInitialize((params) => {
    services = new service_1.Services();
    classStorage = new phpStructure_1.ClassStorage();
    documentStore = new documents_1.DocumentStore();
    completion = new completion_1.CompletionProvider(services, classStorage);
    definition = new definition_1.DefinitionProvider(services, classStorage);
    return {
        capabilities: {
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Full,
            workspaceSymbolProvider: true,
            definitionProvider: true,
            completionProvider: {
                triggerCharacters: ['$', '>', ':', '\'']
            }
        }
    };
});
connection.listen();
connection.onRequest(parseFile, (params) => {
    parseRequestFile(params.path, params.text);
});
connection.onRequest(deleteFile, (params) => {
    documentStore.remove(params.path);
    services.removePathDeps(params.path);
});
connection.onCompletion((textDocumentPosition) => {
    return waitHandler(() => {
        try {
            let extension = textDocumentPosition.textDocument.uri.split('.').pop();
            let fileName = textDocumentPosition.textDocument.uri.replace("file://", "");
            if (extension == 'php') {
                return completion.provideCompletionPHPItems(documentStore.get(fileName), textDocumentPosition.position);
            }
            if (extension == 'yml' || extension == 'yaml') {
                return completion.provideCompletionYAMLItems(documentStore.get(fileName), textDocumentPosition.position);
            }
            if (extension == 'xml') {
                return completion.provideCompletionXMLItems(documentStore.get(fileName), textDocumentPosition.position);
            }
            return [];
        }
        catch (e) {
            console.error(e);
        }
    });
});
connection.onWorkspaceSymbol((params) => {
    return [];
});
connection.onDefinition((textDocumentPosition) => {
    try {
        let extension = textDocumentPosition.textDocument.uri.split('.').pop();
        let fileName = textDocumentPosition.textDocument.uri.replace("file://", "");
        let result = null;
        if (extension == 'php') {
            result = definition.providePHPDefinition(documentStore.get(fileName), textDocumentPosition.position);
        }
        if (extension == 'yml' || extension == 'yaml') {
            result = definition.provideYamlDefinition(documentStore.get(fileName), textDocumentPosition.position);
        }
        if (extension == 'xml') {
            result = definition.provideXmlDefinition(documentStore.get(fileName), textDocumentPosition.position);
        }
        return result;
    }
    catch (e) {
        console.error(e);
    }
});
connection.onDidChangeTextDocument((params) => {
    return waitHandler(() => {
        let extension = params.textDocument.uri.split('.').pop();
        let fileName = params.textDocument.uri.replace("file://", "");
        parseRequestFile(fileName, params.contentChanges.pop().text);
    });
});
function parseRequestFile(path, body) {
    let extension = path.split('.').pop();
    if (extension == 'php') {
        let document = new documents_1.ExtensionTextDocument(body, path, 'php');
        documentStore.push(path, document);
        php_parser.parse(body, path, classStorage);
    }
    if (extension == 'yml' || extension == 'yaml') {
        let document = new documents_1.ExtensionTextDocument(body, path, 'yaml');
        documentStore.push(path, document);
        yaml_parser.parse(body, path, services);
    }
    if (extension == 'xml') {
        let document = new documents_1.ExtensionTextDocument(body, path, 'xml');
        documentStore.push(path, document);
        xml_parser.parse(body, path, services);
    }
}
function waitHandler(callback) {
    let result = callback();
    return result;
}
//# sourceMappingURL=server.js.map