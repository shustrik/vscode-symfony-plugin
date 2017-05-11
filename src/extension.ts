'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
    LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions,
    TransportKind, TextDocumentItem
} from 'vscode-languageclient';
import { Position } from 'vscode-languageserver-types';
import {
    Token, TokenType, Phrase, PhraseType, Parser,
    NamespaceName, ScopedExpression, ObjectAccessExpression,
    NamespaceUseDeclaration, NamespaceUseGroupClause, MethodDeclarationHeader,
    ClassBaseClause, InterfaceBaseClause, ClassInterfaceClause
} from 'php7parser';
import { CompletionYamlItemProvider } from './completionYaml';
import { CompletionPHPItemProvider } from './completion_php';
import { ParsedDocument } from './php/parsedDocument';
import { ProjectVariables } from './php/variables';
import { Services } from './services/services';
import * as fs from 'fs';
import * as xml from 'xml-js';
import * as yml from 'yaml-js';
import { Intelephense } from 'intelephense'

let maxFileSizeBytes = 10000000;
let discoverMaxOpenFiles = 10;
let languageClient: LanguageClient;
let services: Services;
let documents: ParsedDocument[];
let variables: ProjectVariables;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    services = new Services();
    variables = new ProjectVariables();
    documents = [];
    Intelephense.initialise();
    let fsWatcherYaml = vscode.workspace.createFileSystemWatcher('**/*.yaml');
    fsWatcherYaml.onDidDelete(onDidDelete);
    fsWatcherYaml.onDidCreate(onDidCreate);
    fsWatcherYaml.onDidChange(onDidChange);
    readFiles(['*.yaml', '*.yml'], (uriArray: vscode.Uri[]) => {
        onWorkspaceFindFiles(uriArray, parseYaml)
    });

    readFiles(['*.xml'], (uriArray: vscode.Uri[]) => {
        onWorkspaceFindFiles(uriArray, parseXml)
    });
    context.subscriptions.push(
        vscode.languages.setLanguageConfiguration('yaml', {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g
        }));

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider([{ language: 'yaml', scheme: 'file' }], new CompletionYamlItemProvider(services), '.', '\"'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider([{ language: 'php', scheme: 'file' }], new CompletionPHPItemProvider(), '.', '\"'));
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
    let parsed = yml.load(fs.readFileSync(uri.fsPath, 'utf8'));
    if (parsed.services && parsed.services instanceof Object) {
        for (let value of Object.keys(parsed.services)) {
            services.addService(value, parsed.services[value]);
        }
    }
    if (parsed.parameters && parsed.parameters instanceof Object) {
        for (let value of Object.keys(parsed.parameters)) {
            services.addParameter(value, parsed.parameters[value]);
        }
    }

}
function parseXml(uri: vscode.Uri) {
    let parsed = xml.xml2js(fs.readFileSync(uri.fsPath, 'utf8'), { compact: true });
    console.log(parsed);
    if (parsed.services && parsed.services instanceof Object) {
        for (let value of Object.keys(parsed.services)) {
            services.addService(value, parsed.services[value]);
        }
    }
    if (parsed.parameters && parsed.parameters instanceof Object) {
        for (let value of Object.keys(parsed.parameters)) {
            services.addParameter(value, parsed.parameters[value]);
        }
    }
};


// this method is called when your extension is deactivated
export function deactivate() {
}