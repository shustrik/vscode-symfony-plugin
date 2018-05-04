import * as services from '../services/service'
import { ClassStorage, ClassDescriptionBuilder, ClassFunction, Variable, Use } from './structure'
import { Position } from 'vscode-languageserver';
import { ClassDeclarationVisitors } from './walker';
import { Visitor } from '../visitor';
import { ContainerVisitor } from '../services/parse/php';

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
export function parse(code, path: string, classStorage: ClassStorage, services: services.Services) {
    let builder = new ClassDescriptionBuilder(path);
    let parsedAst = parserInst.parseCode(code)
    if (parsedAst.errors.length > 0) {
        throw new SyntaxError('Error parse file');
    }
    let ast = new AST(parsedAst, path);
    let visitor = new ClassDeclarationVisitors(builder);
    ast.visit(visitor);
    let classDescription = builder.build();
    classStorage.add(path, classDescription);
    ast.visit(new ContainerVisitor(classDescription, services));
}

class AST {
    private ast;
    private path;
    constructor(ast, path: string) {
        this.ast = ast;
        this.path = path;
    }
    visit(visitor: Visitor) {
        if (Array.isArray(this.ast.children)) {
            this.ast.children.forEach(element => {
                visitor.visit(element);
            });
        }
    }
}