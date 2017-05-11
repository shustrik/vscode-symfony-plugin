import { Services } from './services/services';
import * as vscode from 'vscode';

export function classCodeCompletion(services: Services, currentWorld: String): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => { resolve([]) });
}

export function parameterArgumentCompletion(services: Services, currentWorld: String): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
        let suggest = [];
        let searchWorld = currentWorld.substring(1);
        services.getParameters().forEach(element => {
            if (element.match(searchWorld)) {
                let packageItem = new vscode.CompletionItem(element);
                packageItem.kind = vscode.CompletionItemKind.Keyword;
                packageItem.insertText = element;
                packageItem.label = element;
                suggest.push(packageItem);
            }
        });
        resolve(suggest);
    });
}
export function serviceArgumentCompletion(services: Services, currentWorld: String): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
        let suggest = [];
        let searchWorld = currentWorld.substring(1);
        services.getServicesIds().forEach(element => {
            if (element.match(searchWorld)) {
                let packageItem = new vscode.CompletionItem(element);
                packageItem.kind = vscode.CompletionItemKind.Keyword;
                packageItem.insertText = element;
                packageItem.label = element;
                suggest.push(packageItem);
            }
        });
        resolve(suggest);
    });
}
export function tagsCompletion(services: Services, currentWorld: String): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => { resolve([]) });
}
