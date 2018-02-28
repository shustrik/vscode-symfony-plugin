import * as services from '../services/service'
import { ClassStorage, ClassDeclaration, ClassFunction, Variable, Use } from './phpStructure'
import { Position } from 'vscode-languageserver';
import { AST, ClassDeclarationVisitors } from './visitor';

var engine = require('php-parser');
var parserInst = new engine({
    parser: {
        extractDoc: true,
        suppressErrors: true,
        php7: true
    },
    ast: {
        withPositions: true
    }
});
export function parseEval(text: string) {
    return parserInst.parseEval(text);
}
export function parse(code, path: string, classStorage: ClassStorage) {
    let classDeclaration = new ClassDeclaration(path);
    let parsedAst = parserInst.parseCode(code)
    if (parsedAst.errors.length > 0) {
        throw new SyntaxError('Error parse file');
    }
    let ast = new AST(parsedAst, path);
    let visitor = new ClassDeclarationVisitors(classDeclaration);
    ast.visit(visitor);
    classStorage.add(path, classDeclaration);
}
