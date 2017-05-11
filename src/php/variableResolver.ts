import  *  as Document from './parsedDocument';
let document: ParsedDocument;
export function resolve(node, odocument) {
    document = odocument;
    switch (node.phraseType) {
        case 85 /* FunctionDeclaration */:
            methodOrFunction(node, 64 /* Function */);
            return true;
        case 112 /* MethodDeclaration */:
            methodOrFunction(node, 32 /* Method */);
            return true;
        case 154 /* SimpleAssignmentExpression */:
        case 16 /* ByRefAssignmentExpression */:
            if (Document.isPhrase(node.left, [155 /* SimpleVariable */, 107 /* ListIntrinsic */])) {
                assignmentExpression(node);
                return false;
            }
            return true;
        case 77 /* ForeachStatement */:
            foreachStatement(node);
            return true;
        default:
            return false;
    }
}
function qualifiedNameList(node) {
    let fqns = [];
    for (let n = 0, l = node.elements.length; n < l; ++n) {
        fqns.push(this.nameResolver.namePhraseToFqn(node.elements[n], 1 /* Class */));
    }
    return new String(fqns.join('|'));
}
function listIntrinsic(node) {
    let elements = node.initialiserList.elements;
    let element;
    let varNames = [];
    let varName;
    for (let n = 0, l = elements.length; n < l; ++n) {
        element = elements[n];
        varName = simpleVariable(element.value.expr);
        if (varName) {
            varNames.push(varName);
        }
    }
    return varNames;
}
function parameterSymbolFilter(s) {
    return s.kind === 128 /* Parameter */;
}
function methodOrFunction(node, kind) {
//    this.variableTable.pushScope();
console.log(node);
    // console.log(node);
    if (false) {
        // let params = symbol.children.filter(this._parameterSymbolFilter);
        // let param;
        // console.log(params);
        // for (let n = 0, l = params.length; n < l; ++n) {
        //     param = params[n];
        //     console.log(param.type);
        //     this.variableTable.setType(param.name, param.type);
        // }
    }
}
function anonymousFunctionUseVariableSymbolFilter(s) {
    return s.kind === 256 /* Variable */ && (s.modifiers & 4096 /* Use */) > 0;
}
function anonymousFunctionCreationExpression(node) {
    let symbol = this._findSymbolForPhrase(node);
    let carry = [];
    if (symbol && symbol.children) {
        let useVariables = symbol.children.filter(this._anonymousFunctionUseVariableSymbolFilter);
        for (let n = 0, l = useVariables.length; n < l; ++n) {
            carry.push(useVariables[n].name);
        }
    }
    this.variableTable.pushScope(carry);
}
function simpleVariable(node) {
    return isNonDynamicSimpleVariable(node) ? document.tokenText(node.name) : '';
}
function isNonDynamicSimpleVariable(node) {
    return Document.isPhrase(node, [155 /* SimpleVariable */]) &&
        Document.isToken(node.name, [84 /* VariableName */]);
}

function assignmentExpression(node) {
    let lhs = node.left;
    let rhs = node.right;
    let exprTypeResolver = new ExpressionTypeResolver(this.nameResolver, this.symbolStore, this.variableTable);
    let type;
    if (Document.isPhrase(lhs, [155 /* SimpleVariable */])) {
        let varName = simpleVariable(lhs);
        console.log('assigments')
        console.log(rhs);
        type = exprTypeResolver.resolveExpression(rhs);
        console.log('!!!!!!!!!!!!!!!');
        this.variableTable.setType(varName, type);
    }
    else if (Document.isPhrase(node, [107 /* ListIntrinsic */])) {
        let varNames = this.listIntrinsic(rhs);
        this.variableTable.setTypeMany(varNames, exprTypeResolver.resolveExpression(rhs).arrayDereference());
    }
}
function foreachStatement(node) {
    let collection = node.collection;
    let value = node.value;
    let exprResolver = new ExpressionTypeResolver(this.nameResolver, this.symbolStore, this.variableTable);
    let type = exprResolver.resolveExpression(collection.expr).arrayDereference();
    if (Document.isPhrase(value.expr, [155 /* SimpleVariable */])) {
        let varName = this._simpleVariable(value.expr);
        console.log("foreach")
        this.variableTable.setType(varName, type);
    }
    else if (Document.isPhrase(value.expr, [107 /* ListIntrinsic */])) {
        let varNames = this.listIntrinsic(value.expr);
        console.log("foreach")
        this.variableTable.setTypeMany(varNames, type.arrayDereference());
    }
}
