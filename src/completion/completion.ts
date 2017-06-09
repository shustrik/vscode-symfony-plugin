import { Services } from '../services/services';
import * as vscode from 'vscode';

export function classCodeCompletion(services: Services, currentWorld: String): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => { resolve([]) });
}

export function parameterArgumentCompletion(services: Services, currentWord: string): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
        let suggest = [];
        services.getParameters().forEach(element => {
            if (element.match(currentWord)) {
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
export function serviceArgumentCompletion(services: Services, currentWord: string): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
        let suggest = [];
        services.getServicesIds().forEach(element => {
            if (element.match(currentWord)) {
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
