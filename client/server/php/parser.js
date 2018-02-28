"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const phpStructure_1 = require("./phpStructure");
const visitor_1 = require("./visitor");
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
function parse(code, path, classStorage) {
    let classDeclaration = new phpStructure_1.ClassDeclaration(path);
    let parsedAst = parserInst.parseCode(code);
    if (parsedAst.errors.length > 0) {
        throw new SyntaxError('Error parse file');
    }
    let ast = new visitor_1.AST(parsedAst, path);
    let visitor = new visitor_1.ClassDeclarationVisitors(classDeclaration);
    ast.visit(visitor);
    classStorage.add(path, classDeclaration);
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map