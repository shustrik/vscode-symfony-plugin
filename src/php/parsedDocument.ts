/* Copyright (c) Ben Robert Mewburn
 * Licensed under the ISC Licence.
 */

'use strict';

import {
    Phrase, Token, NamespaceName, MemberName, TokenType,
    PhraseType, NamespaceDefinition, Parser, SimpleVariable,
    ScopedMemberName
} from 'php7parser';
import * as lsp from 'vscode-languageserver-types';

export class ParsedDocument {

    private text: String;
    private fileUri: String;
    private parseTree: Phrase;

    constructor(uri: string, text: string) {
        this.parseTree = Parser.parse(text);
        this.text = text;
        this.fileUri = uri;
    }

    get tree() {
        return this.parseTree;
    }

    get uri() {
        return this.fileUri;
    }

    traverseTree(visitor) {
        this._traverse(this.parseTree, visitor)
    }
    textAtOffset(offset, length) {
        return this.text.substr(offset, length);
    }
    _traverse(node: Phrase | Token, visitor) {
        visitor(node, this);
        if (isPhrase(node)) {
            for (let n = 0, l = (<Phrase>node).children.length; n < l; ++n) {
                this._traverse((<Phrase>node).children[n], visitor);
            }
        }
    }
    getClassName(): string {
        return "test";
    }
    tokenText(t: Token) {
        return isToken(t) ? this.textAtOffset(t.offset, t.length) : '';
    }
}

export function isToken(node: Phrase | Token, types?: TokenType[]) {
    return node && (<Token>node).tokenType !== undefined &&
        (!types || types.indexOf((<Token>node).tokenType) > -1);
}

export function isPhrase(node: Phrase | Token, types?: PhraseType[]) {
    return node && (<Phrase>node).phraseType !== undefined &&
        (!types || types.indexOf((<Phrase>node).phraseType) > -1);
}
