"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("./structure");
const walker_1 = require("./walker");
const php_1 = require("../services/parse/php");
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
function parseEval(text) {
    return parserInst.parseEval(text);
}
exports.parseEval = parseEval;
function parse(code, path, classStorage, services) {
    let classDeclaration = new structure_1.ClassDeclaration(path);
    let parsedAst = parserInst.parseCode(code);
    if (parsedAst.errors.length > 0) {
        throw new SyntaxError('Error parse file');
    }
    let ast = new AST(parsedAst, path);
    let visitor = new walker_1.ClassDeclarationVisitors(classDeclaration);
    ast.visit(visitor);
    classStorage.add(path, classDeclaration);
    ast.visit(new php_1.ContainerVisitor(classDeclaration, services));
}
exports.parse = parse;
class AST {
    constructor(ast, path) {
        this.ast = ast;
        this.path = path;
    }
    visit(visitor) {
        if (Array.isArray(this.ast.children)) {
            this.ast.children.forEach(element => {
                visitor.visit(element);
            });
        }
    }
}
//# sourceMappingURL=parser.js.map