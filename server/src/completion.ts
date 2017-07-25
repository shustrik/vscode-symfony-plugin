import { CompletionItem, CompletionItemKind, TextDocument, Position, Range } from 'vscode-languageserver';
import { Services } from './services/service';
import { dirname, basename } from 'path';
import { ClassStorage } from './php/phpStructure';
import * as helper from './php/completionHelper';
import { ExtensionTextDocument } from './documents';
import * as completion from './completion';

export class CompletionProvider {
    services: Services;
    classStorage: ClassStorage
    constructor(services: Services, classStorage: ClassStorage) {
        this.services = services;
        this.classStorage = classStorage;
    }

    provideCompletionPHPItems(document: ExtensionTextDocument, position: Position): CompletionItem[] {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(wordAtPosition);
        if (helper.isService(this.classStorage, document.uri, lineText, position, currentWord)) {
            return this.serviceArgumentCompletion(this.services, currentWord);
        }
        if (helper.isParameter(this.classStorage, document.uri, lineText, position, currentWord)) {
            return this.parameterArgumentCompletion(this.services, currentWord);
        }
        return helper.getServiceMethods(this.classStorage, document.uri, lineText, this.services, currentWord);
    }

    provideCompletionXMLItems(document: ExtensionTextDocument, position: Position): CompletionItem[] {
        let lineText = document.lineAt(position).trim();
        let wordAtPosition = document.getWordRangeAtPosition(position, /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(wordAtPosition);
        if (lineText.match(/^<(\s)*(class|id)(\s)+/)) {
            return this.classCodeCompletion(this.services, this.classStorage, currentWord);
        }
        if (lineText.match(/<(\s)*argument(\s)+/)) {
            if (lineText.includes('service')) {
                return this.serviceArgumentCompletion(this.services, currentWord.substring(1));
            }
            if (currentWord.includes('%')) {
                return this.parameterArgumentCompletion(this.services, currentWord.substring(1));
            }
            return [];
        }
        if (lineText.match(/^<(\s)*tag(\s)+/)) {
            return this.tagsCompletion(this.services, currentWord);
        }

        return [];
    }

    provideCompletionYAMLItems(document: ExtensionTextDocument, position: Position): CompletionItem[] {
        let lineText = document.lineAt(position);
        let wordAtPosition = document.getWordRangeAtPosition(position, /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g);
        if (!wordAtPosition) {
            return [];
        }
        let currentWord = document.getRangeText(Range.create(Position.create(wordAtPosition.start.line, wordAtPosition.start.character - 1), wordAtPosition.end));
        if (lineText.match(/^(\s)*(class:)(\s)+/)) {
            return this.classCodeCompletion(this.services, this.classStorage, currentWord);
        }
        if (lineText.match(/^(\s)*(parent:)(\s)+/)) {
            return this.serviceArgumentCompletion(this.services, currentWord.substring(1));
        }
        if (lineText.match(/^(\s)*(tags:)(\s)+/)) {
            return this.tagsCompletion(this.services, currentWord);
        }
        let prevLineNumber = 1;
        while (!lineText.match(/^(\s)*(class:)(\s)+/)) {
            //проблемная регулярка
            if (lineText.match(/^(\s)*arguments:+/)) {
                if (currentWord.includes('@')) {
                    return this.serviceArgumentCompletion(this.services, currentWord.substring(1));
                }
                if (currentWord.includes('%')) {
                    return this.parameterArgumentCompletion(this.services, currentWord.substring(1));
                }
                return [];
            }
            if (lineText.match(/^(\s)*tags:+/)) {
                return this.tagsCompletion(this.services, currentWord);
            }
            lineText = document.lineAt(Position.create(position.line - prevLineNumber, 0));
            prevLineNumber++;
        }
        return [];
    }

    private classCodeCompletion(services: Services, classStorage: ClassStorage, currentWord: string): CompletionItem[] {
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

    private parameterArgumentCompletion(services: Services, currentWord: string): CompletionItem[] {
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
    private serviceArgumentCompletion(services: Services, currentWord: string): CompletionItem[] {
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
    private tagsCompletion(services: Services, currentWord: string): CompletionItem[] {
        let suggest = [];
        services.getTags().forEach(element => {
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
}