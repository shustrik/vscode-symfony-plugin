'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
    Token, TokenType, Phrase, PhraseType, Parser,
    NamespaceName, ScopedExpression, ObjectAccessExpression,
    NamespaceUseDeclaration, NamespaceUseGroupClause, MethodDeclarationHeader,
    ClassBaseClause, InterfaceBaseClause, ClassInterfaceClause
} from 'php7parser';
import { CompletionYamlItemProvider } from './completion/completionYaml';
import { CompletionXMLItemProvider } from './completion/completionXML';
import { CompletionPHPItemProvider } from './completion/completionPhp';
import { Services } from './services/service';
import * as fs from 'fs';
import * as php_parser from './php/parser';
import * as xml_parser from './services/parse/xmlParser';
import * as yaml_parser from './services/parse/yamlParser';
import { ClassStorage } from './php/parser'

let maxFileSizeBytes = 10000000;
let discoverMaxOpenFiles = 10;
let services: Services;
let classStorage: ClassStorage;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    services = new Services();
    classStorage = new ClassStorage();
    // readFiles(['*.yaml', '*.yml'], (uriArray: vscode.Uri[]) => {
    //     onWorkspaceFindFiles(uriArray, parseYaml)
    // });

    // readFiles(['*.xml'], (uriArray: vscode.Uri[]) => {
    //     onWorkspaceFindFiles(uriArray, parseXml)
    // });

    readFiles(['*.php'], (uriArray: vscode.Uri[]) => {
        onWorkspaceFindFiles(uriArray, parsePhp)
    });
    context.subscriptions.push(
        vscode.languages.setLanguageConfiguration('yaml', {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g
        }));

    context.subscriptions.push(
        vscode.languages.setLanguageConfiguration('xml', {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g
        }));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider([{ language: 'yaml', scheme: 'file' }], new CompletionYamlItemProvider(services, classStorage), '.', '\"'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider([{ language: 'xml', scheme: 'file' }], new CompletionXMLItemProvider(services,classStorage), '.', '\"'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider([{ language: 'php', scheme: 'file' }], new CompletionPHPItemProvider(services, classStorage), '.', '\"'));
}


function readFiles(associations: Array<string>, callback) {
    if (vscode.workspace.rootPath) {
        //discover workspace symbols
        vscode.workspace.findFiles(`**/{${associations.join(',')}}`, '**/{Tests, tests, Fixtures}/**').then(callback);
    }
}

function onDidDelete(uri: vscode.Uri) {
    //forgetRequest(uri);
}

function onDidChange(uri: vscode.Uri) {

    console.log('asfd');
    // discoverRequest(uri);
}

function onDidCreate(uri: vscode.Uri) {
    onDidChange(uri);
}

function onWorkspaceFindFiles(uriArray: vscode.Uri[], callable) {
    let fileCount = uriArray.length;
    let remaining = fileCount;
    let discoveredFileCount = 0;
    let start = process.hrtime();
    let nActive = 0;

    uriArray = uriArray.reverse();
    if (nActive > 100) {
        return;
    }
    let batchDiscover = () => {
        let uri: vscode.Uri;
        while (nActive < discoverMaxOpenFiles && (uri = uriArray.pop())) {
            ++nActive;
            proccessFile(uri, callable, onSuccess, onFailure);
        }

    }
    let onAlways = () => {
        --remaining;
        --nActive;
        if (remaining > 0) {
            batchDiscover();
            return;
        }
        let elapsed = process.hrtime(start);
        console.info(
            [
                'Workspace symbol discovery ended',
                `${discoveredFileCount}/${fileCount} files`,
                `${elapsed[0]}.${Math.round(elapsed[1] / 1000000)} seconds`
            ].join(' | ')
        );
    }

    let onSuccess = () => {
        ++discoveredFileCount;
        onAlways();
    }

    let onFailure = () => {
        onAlways();
    }

    batchDiscover();
}
function proccessFile(
    uri: vscode.Uri,
    callback,
    onSuccess?: () => void,
    onFailure?: () => void) {

    fs.stat(uri.fsPath, (statErr, stats) => {
        if (statErr) {
            if (onFailure) {
                onFailure();
            }
            return;
        }

        if (stats.size > maxFileSizeBytes) {
            if (onFailure) {
                onFailure();
            }
            return;
        }
        try {
            callback(uri);
        } catch (e) {
            onFailure();
            return;
        }

        onSuccess();
    })

}
function parseYaml(uri: vscode.Uri) {
    yaml_parser.parse(fs.readFileSync(uri.fsPath, 'utf8'), services);
}
function parseXml(uri: vscode.Uri) {
    xml_parser.parse(fs.readFileSync(uri.fsPath, 'utf8'), services);
};
function parsePhp(uri: vscode.Uri) {
    var classInfo = php_parser.parse(fs.readFileSync(uri.fsPath, 'utf8'), uri.fsPath, classStorage);
};


// this method is called when your extension is deactivated
export function deactivate() {
}