'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_languageserver_1 = require("vscode-languageserver");
const completionYaml_1 = require("./completion/completionYaml");
const completionXML_1 = require("./completion/completionXML");
const completionPhp_1 = require("./completion/completionPhp");
const service_1 = require("./services/service");
const documents_1 = require("./documents");
const php_parser = require("./php/parser");
const xml_parser = require("./services/parse/xmlParser");
const yaml_parser = require("./services/parse/yamlParser");
const parser_1 = require("./php/parser");
let maxFileSizeBytes = 10000000;
let discoverMaxOpenFiles = 100;
let services;
let classStorage;
let documentStore;
let completionPhp;
let completionYaml;
let completionXml;
let connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
const parseFile = new vscode_languageserver_1.RequestType('parseFile');
const deleteFile = new vscode_languageserver_1.RequestType('deleteFile');
const changeFile = new vscode_languageserver_1.RequestType('changeFile');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
connection.onInitialize((params) => {
    services = new service_1.Services();
    classStorage = new parser_1.ClassStorage();
    documentStore = new documents_1.DocumentStore();
    completionPhp = new completionPhp_1.CompletionPHPItemProvider(services, classStorage);
    completionXml = new completionXML_1.CompletionXMLItemProvider(services, classStorage);
    completionYaml = new completionYaml_1.CompletionYamlItemProvider(services, classStorage);
    return {
        capabilities: {
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Incremental,
            documentSymbolProvider: true,
            workspaceSymbolProvider: true,
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
connection.onRequest(changeFile, (params) => {
    parseRequestFile(params.path, params.text);
});
connection.onCompletion((textDocumentPosition) => {
    let extension = textDocumentPosition.textDocument.uri.split('.').pop();
    let fileName = textDocumentPosition.textDocument.uri.replace("file://", "");
    if (extension == 'php') {
        return completionPhp.provideCompletionItems(documentStore.get(fileName), textDocumentPosition.position);
    }
    if (extension == 'yml' || extension == 'yaml') {
        return completionYaml.provideCompletionItems(documentStore.get(fileName), textDocumentPosition.position);
    }
    if (extension == 'xml') {
        return completionXml.provideCompletionItems(documentStore.get(fileName), textDocumentPosition.position);
    }
    return [];
});
connection.onWorkspaceSymbol((params) => {
    return [];
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
//# sourceMappingURL=server.js.map