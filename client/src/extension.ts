/* Copyright (c) Ben Robert Mewburn 
 * Licensed under the ISC Licence.
 */
'use strict';

import * as path from 'path';

import * as vscode from 'vscode';
import * as fs from 'fs';
import { workspace, Disposable, ExtensionContext, commands, FileSystemWatcher, TextDocument } from "vscode";
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind, RequestType } from "vscode-languageclient";


let maxFileSizeBytes = 10000000;
let discoverMaxOpenFiles = 10;
let languageClient: LanguageClient;


export function activate(context: ExtensionContext) {
	let serverModule = context.asAbsolutePath(path.join("server", "server.js"));
	let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };

	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	}

	let clientOptions: LanguageClientOptions = {
		documentSelector: ["php", "yaml", "xml"],
		synchronize: {
			configurationSection: "languageServerExample",
		}
	}

	// Create the language client and start the client.
	languageClient = new LanguageClient("Symfony completion Server", serverOptions, clientOptions);
	let disposable = languageClient.start();

	let phpWatcher = workspace.createFileSystemWatcher('**/*.php');
	let xmlWatcher = workspace.createFileSystemWatcher('**/*.xml');
	let yamlWatcher = workspace.createFileSystemWatcher('**/*.yaml');
	let ymlWatcher = workspace.createFileSystemWatcher('**/*.yml');
	phpWatcher.onDidDelete(onDidDelete);
	phpWatcher.onDidCreate(onDidCreate);
	xmlWatcher.onDidDelete(onDidDelete);
	xmlWatcher.onDidCreate(onDidCreate);
	yamlWatcher.onDidDelete(onDidDelete);
	yamlWatcher.onDidCreate(onDidCreate);
	ymlWatcher.onDidDelete(onDidDelete);
	ymlWatcher.onDidCreate(onDidCreate);

	let ready = languageClient.onReady();

	if (workspace.rootPath) {
		ready.then(() => {
			readFiles(['*.yaml', '*.yml'], (uriArray: vscode.Uri[]) => {
				onWorkspaceFindFiles(uriArray, parseFile, 'yaml')
			});
		}).then(() => {
			readFiles(['*.xml'], (uriArray: vscode.Uri[]) => {
				onWorkspaceFindFiles(uriArray, parseFile, 'xml')
			});
		}).then(() => {
			readFiles(['*.php'], (uriArray: vscode.Uri[]) => {
				onWorkspaceFindFiles(uriArray, parseFile, 'php')
			});
		});
	}
	context.subscriptions.push(
		vscode.languages.setLanguageConfiguration('yaml', {
			wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g
		}));

	context.subscriptions.push(
		vscode.languages.setLanguageConfiguration('xml', {
			wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g
		}));
	context.subscriptions.push(
		vscode.languages.setLanguageConfiguration('php', {
			wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g
		}));
	//push disposables
	context.subscriptions.push(disposable, phpWatcher, yamlWatcher, xmlWatcher, ymlWatcher);
}

function readFiles(associations: Array<string>, callback) {
	if (vscode.workspace.rootPath) {
		vscode.workspace.findFiles(`**/{${associations.join(',')}}`, '**/{Tests, tests, Fixtures}/**').then(callback);
	}
}

function onWorkspaceFindFiles(uriArray: vscode.Uri[], callable, type: string) {
	languageClient.info('Parse files start: ' + type);
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
		languageClient.info(
			[
				'Workspace files discovery ended: ' + type,
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
			callback(uri, onSuccess);
		} catch (e) {
			onFailure();
			return;
		}
	})

}
function parseFile(uri: vscode.Uri, onSuccess?: () => void) {
	languageClient.sendRequest(
		"parseFile",
		{ text: fs.readFileSync(uri.fsPath, 'utf8'), path: uri.fsPath }
	).then(() => { onSuccess(); });
};

function onDidDelete(uri: vscode.Uri) {
	languageClient.sendRequest(
		"deleteFile",
		{ path: uri.fsPath }
	);
}

function onDidCreate(uri: vscode.Uri) {
	languageClient.sendRequest(
		"parseFile",
		{ text: fs.readFileSync(uri.fsPath, 'utf8'), path: uri.fsPath }
	);
}