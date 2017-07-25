"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
class DocumentStore {
    constructor() {
        this.documents = {};
    }
    push(path, document) {
        this.documents[path] = document;
    }
    get(path) {
        return this.documents[path];
    }
    remove(path) {
        if (this.documents[path]) {
            delete this.documents[path];
        }
    }
}
exports.DocumentStore = DocumentStore;
class ExtensionTextDocument {
    constructor(text, uri, lnaguageId) {
        this.lines = text.split(ExtensionTextDocument.NL);
        this.uri = uri;
        this.languageId = lnaguageId;
        this.lineStarts = [];
        this.buildLineStarts();
    }
    getText() {
        return this.lines.join(ExtensionTextDocument.NL);
    }
    positionAt(offset) {
        offset = Math.floor(offset);
        offset = Math.max(0, offset);
        let out = this.lineStarts.findIndex(element => element > offset);
        return vscode_languageserver_1.Position.create(out, offset - this.lineStarts[out]);
    }
    offsetAt(position) {
        return this.lineStarts[position.line] + position.character;
    }
    getRangeText(range) {
        if (range.start.line === range.end.line) {
            return this.lines[range.start.line].substring(range.start.character, range.end.character);
        }
        let startLineIndex = range.start.line, endLineIndex = range.end.line, resultLines = [];
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
    lineAt(lineOrPosition) {
        let line;
        line = lineOrPosition.line;
        if (line < 0 || line >= this.lines.length) {
            throw new Error('Illegal value for `line`');
        }
        let result = this.lines[line];
        return result;
    }
    getWordRangeAtPosition(position, regexp) {
        if (!regexp) {
            regexp = /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\<\>\/\?\s]+)/g;
        }
        let wordAtText = this.getWordAtText(this.lineAt(position), position.character, regexp);
        if (wordAtText) {
            return vscode_languageserver_1.Range.create(position.line, wordAtText.start, position.line, wordAtText.length + wordAtText.start);
        }
        return undefined;
    }
    getWordAtText(text, offset, wordDefinition) {
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
    isNewlineCharacter(charCode) {
        return charCode === ExtensionTextDocument.NL.charCodeAt(0);
    }
    buildLineStarts() {
        this.lineStarts.push(0);
        this.lines.forEach(line => {
            this.lineStarts.push(this.lineStarts[this.lines.length - 1] + line.length + ExtensionTextDocument.NL.length);
        });
    }
}
ExtensionTextDocument.NL = '\n';
exports.ExtensionTextDocument = ExtensionTextDocument;
//# sourceMappingURL=documents.js.map