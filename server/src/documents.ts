import { TextDocument, Position, Range } from 'vscode-languageserver';

export class DocumentStore {
    private documents: DocumentHash;
    constructor() {
        this.documents = {};
    }
    push(path: string, document: ExtensionTextDocument) {
        this.documents[path] = document;
    }
    get(path: string): ExtensionTextDocument {
        return this.documents[path];
    }
    remove(path) {
        if (this.documents[path]) {
            delete this.documents[path];
        }
    }
}
interface DocumentHash {
    [id: string]: ExtensionTextDocument
}

export class ExtensionTextDocument implements TextDocument {
    uri: string;
    languageId: string;
    version: number;
    lineCount: number;
    lines: string[];
    lineStarts: number[];
    static NL = '\n';
    constructor(text: string, uri: string, lnaguageId: string) {
        this.lines = text.split(ExtensionTextDocument.NL);
        this.uri = uri;
        this.languageId = lnaguageId;
        this.lineStarts = [];
        this.buildLineStarts();
    }
    getText(): string {
        return this.lines.join(ExtensionTextDocument.NL);
    }

    positionAt(offset: number): Position {
        offset = Math.floor(offset);
        offset = Math.max(0, offset);
        let out = this.lineStarts.findIndex(element => element > offset);

        return Position.create(out, offset - this.lineStarts[out]);
    }
    offsetAt(position: Position): number {
        return this.lineStarts[position.line] + position.character;
    }

    getRangeText(range: Range): string {
        if (range.start.line === range.end.line) {
            return this.lines[range.start.line].substring(range.start.character, range.end.character);
        }

        let startLineIndex = range.start.line,
            endLineIndex = range.end.line,
            resultLines: string[] = [];

        resultLines.push(this.lines[startLineIndex].substring(range.start.character));
        for (let i = startLineIndex + 1; i < endLineIndex; i++) {
            resultLines.push(this.lines[i]);
        }
        resultLines.push(this.lines[endLineIndex].substring(0, range.end.character));

        return resultLines.join(ExtensionTextDocument.NL);
    }

    getUri() {
        return this.uri;
    }

    lineAt(lineOrPosition: Position): string {

        let line: number;
        line = lineOrPosition.line;

        if (line < 0 || line >= this.lines.length) {
            throw new Error('Illegal value for `line`');
        }

        let result = this.lines[line];

        return result;
    }

    getWordRangeAtPosition(position: Position, regexp?: RegExp): Range {
        if (!regexp) {
            regexp = /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g;
        }
        let wordAtText = this.getWordAtText(
            this.lineAt(position),
            position.character,
            regexp
        );
        if (wordAtText) {
            return Range.create(position.line, wordAtText.start, position.line, wordAtText.length + wordAtText.start);
        }
        return undefined;
    }

    getWordAtText(text: string, offset: number, wordDefinition: RegExp) {
        let lineStart = offset;
        while (lineStart > 0 && !this.isNewlineCharacter(text.charCodeAt(lineStart - 1))) {
            lineStart--;
        }
        let offsetInLine = offset - lineStart;
        let lineText = text.substr(lineStart);
        // make a copy of the regex as to not keep the state
        let flags = wordDefinition.ignoreCase ? 'gi' : 'g';
        wordDefinition = new RegExp(wordDefinition.source, flags);

        let match = wordDefinition.exec(lineText);

        while (match && match.index + match[0].length < offsetInLine) {
            match = wordDefinition.exec(lineText);
        }
        if (match && match.index <= offsetInLine) {
            return { start: match.index + lineStart, length: match[0].length };
        }

        return { start: offset, length: 0 };
    }

    isNewlineCharacter(charCode: number) {
        return charCode === ExtensionTextDocument.NL.charCodeAt(0);
    }

    private buildLineStarts() {
        this.lineStarts.push(0);
        this.lines.forEach(line => {
            this.lineStarts.push(this.lineStarts[this.lines.length - 1] + line.length + ExtensionTextDocument.NL.length);
        });
    }
}