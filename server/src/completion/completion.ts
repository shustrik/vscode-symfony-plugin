import { Services } from '../services/service';
import { ClassStorage } from '../php/phpStructure';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

export function classCodeCompletion(services: Services, classStorage: ClassStorage, currentWord: string): CompletionItem[] {
    let suggest = [];
    classStorage.getFqnClasses().forEach(element => {
        if (element.match(currentWord.trim())) {
            let packageItem = CompletionItem.create(element);
            packageItem.kind = CompletionItemKind.Keyword;
            packageItem.insertText = element;
            packageItem.label = element;
            suggest.push(packageItem);
        }
    });
    return suggest;
}

export function parameterArgumentCompletion(services: Services, currentWord: string): CompletionItem[] {
    let suggest = [];
    services.getParameters().forEach(element => {
        if (element.match(currentWord)) {
            let packageItem = CompletionItem.create(element);
            packageItem.kind = CompletionItemKind.Keyword;
            packageItem.insertText = element;
            packageItem.label = element;
            suggest.push(packageItem);
        }
    });
    return suggest;
}
export function serviceArgumentCompletion(services: Services, currentWord: string): CompletionItem[] {
    let suggest = [];
    services.getServicesIds().forEach(element => {
        if (element.match(currentWord)) {
            let packageItem = CompletionItem.create(element);
            packageItem.kind = CompletionItemKind.Keyword;
            packageItem.insertText = element;
            packageItem.label = element;
            suggest.push(packageItem);
        }
    });
    return suggest;
}
export function tagsCompletion(services: Services, currentWord: string): CompletionItem[] {
    let suggest = [];
    services.getTags().forEach(element => {
        console.log(element);
        if (element.match(currentWord)) {
            let packageItem = CompletionItem.create(element);
            packageItem.kind = CompletionItemKind.Keyword;
            packageItem.insertText = element;
            packageItem.label = element;
            suggest.push(packageItem);
        }
    });
    return suggest;
}
