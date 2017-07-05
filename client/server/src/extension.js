'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_languageserver_1 = require("vscode-languageserver");
let maxFileSizeBytes = 10000000;
let discoverMaxOpenFiles = 100;
let services;
let classStorage;
let connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
connection.onInitialize((params) => {
    console.log('sdf');
    return {
        capabilities: {
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Incremental,
            documentSymbolProvider: true,
            workspaceSymbolProvider: true,
            completionProvider: {
                triggerCharacters: ['$', '>', ':']
            },
            signatureHelpProvider: {
                triggerCharacters: ['(', ',']
            },
            definitionProvider: true,
            documentFormattingProvider: true,
            documentRangeFormattingProvider: true
        }
    };
});
function onDidDelete(uri) {
    //forgetRequest(uri);
}
function onDidChange(uri) {
    console.log('asfd');
}
function onDidCreate(uri) {
    onDidChange(uri);
}
// function parseYaml(uri: vscode.Uri) {
//     yaml_parser.parse(fs.readFileSync(uri.fsPath, 'utf8'), services);
// }
// function parseXml(uri: vscode.Uri) {
//     xml_parser.parse(fs.readFileSync(uri.fsPath, 'utf8'), services);
// };
// function parsePhp(uri: vscode.Uri) {
//     try{
//     var classInfo = php_parser.parse(fs.readFileSync(uri.fsPath, 'utf8'), uri.fsPath, classStorage);
//     }catch(exception){
//         console.log(exception);
//     }
// };
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map