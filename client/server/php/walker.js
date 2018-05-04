"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("./structure");
const vscode_languageserver_1 = require("vscode-languageserver");
const visitor_1 = require("../visitor");
class ClassDeclarationVisitors {
    constructor(classDeclaration) {
        this.visitor = new visitor_1.ChainVisitor([new NamespaceVisitor(classDeclaration, this),
            new UseVisitor(classDeclaration),
            new MethodVisitor(classDeclaration),
            new ClassVisitor(classDeclaration, this),
            new PropertyVisitor(classDeclaration),
            new TraitVisitor(this)
        ]);
    }
    visit(node) {
        this.visitor.visit(node);
    }
}
exports.ClassDeclarationVisitors = ClassDeclarationVisitors;
class NamespaceVisitor {
    constructor(classDeclaration, visitors) {
        this.classDeclaration = classDeclaration;
        this.visitors = visitors;
    }
    visit(node) {
        if (node.kind === 'namespace') {
            this.classDeclaration.setNamespace(node.name);
            node.children.forEach(item => {
                this.visitors.visit(item);
            });
        }
    }
}
class UseVisitor {
    constructor(classDeclaration) {
        this.classDeclaration = classDeclaration;
    }
    visit(node) {
        if (node.kind === 'usegroup') {
            node.items.forEach(item => {
                let use = new structure_1.Use(item.name);
                if (item.alias) {
                    use.setAlias(item.alias);
                }
                this.classDeclaration.addUse(use);
            });
        }
    }
}
class MethodVisitor {
    constructor(classDeclaration) {
        this.classDeclaration = classDeclaration;
    }
    visit(node) {
        if (node.kind !== 'method') {
            return;
        }
        let start = vscode_languageserver_1.Position.create(node.loc.start.line, node.loc.start.offset);
        let end = vscode_languageserver_1.Position.create(node.loc.end.line, node.loc.end.offset);
        let func = new structure_1.ClassFunction(node.name, start, end);
        if (node.visibility == 'public') {
            func.visible();
        }
        if (node.static) {
            func.static();
        }
        node.arguments.forEach(item => {
            let start = vscode_languageserver_1.Position.create(item.loc.start.line, item.loc.start.offset);
            let end = vscode_languageserver_1.Position.create(item.loc.end.line, item.loc.end.offset);
            let variable = new structure_1.Variable(item.name, start, end);
            if (item.type) {
                variable.setType(item.type.name);
            }
            func.addVariable(variable);
        });
        if (node.body) {
            let visitor = new visitor_1.ChainVisitor([new AssignVisitor(this.classDeclaration, func),
                new ReturnVisitor(this.classDeclaration, func)]);
            node.body.children.forEach(item => {
                visitor.visit(item);
            });
        }
        this.classDeclaration.addFunction(func);
    }
}
class ClassVisitor {
    constructor(classDeclaration, visitors) {
        this.classDeclaration = classDeclaration;
        this.visitors = visitors;
    }
    visit(node) {
        if (node.kind !== 'class') {
            return;
        }
        let start = vscode_languageserver_1.Position.create(node.loc.start.line, node.loc.start.offset);
        let end = vscode_languageserver_1.Position.create(node.loc.end.line, node.loc.end.offset);
        this.classDeclaration.setName(node.name);
        this.classDeclaration.setPosition(start, end);
        if (node.implements) {
            node.implements.forEach(item => {
                this.classDeclaration.addInterface(item);
            });
        }
        if (node.extends) {
            this.classDeclaration.setParent(node.extends.name);
        }
        if (node.isAbstract) {
            this.classDeclaration.abstract();
        }
        if (node.body) {
            node.body.forEach(item => {
                this.visitors.visit(item);
            });
        }
    }
}
class PropertyVisitor {
    constructor(classDeclaration) {
        this.classDeclaration = classDeclaration;
    }
    visit(node) {
        if (node.kind === 'property') {
            let start = vscode_languageserver_1.Position.create(node.loc.start.line, node.loc.start.offset);
            let end = vscode_languageserver_1.Position.create(node.loc.end.line, node.loc.end.offset);
            let variable = new structure_1.Variable(node.name, start, end);
            this.classDeclaration.addVariable(variable);
        }
    }
}
class TraitVisitor {
    constructor(visitors) {
        this.visitors = visitors;
    }
    visit(node) {
        if (node.kind === 'trait' && node.body) {
            this.visitors.visit(node.body);
        }
    }
}
class AssignVisitor {
    constructor(classDeclaration, classFunction) {
        this.classDeclaration = classDeclaration;
        this.classFunction = classFunction;
    }
    visit(node) {
        if (node.kind !== 'assign') {
            return;
        }
        if (node.left && node.left.kind == "propertylookup" &&
            node.left.what.name == 'this') {
            if (node.right.kind == 'variable') {
                let type = this.classFunction.getVariableType(node.right.name);
                if (type) {
                    this.classDeclaration.setPropertyType(node.left.offset.name, type);
                }
            }
        }
        if (node.left && node.left.kind == "variable") {
            let start = vscode_languageserver_1.Position.create(node.loc.start.line, node.loc.start.offset);
            let end = vscode_languageserver_1.Position.create(node.loc.end.line, node.loc.end.offset);
            let variable = new structure_1.Variable(node.left.name, start, end);
            if (node.right && node.right.kind == "new") {
                if (node.right.what && node.right.what.name) {
                    if (node.right.what.kind == "identifier") {
                        variable.setType(node.right.what.name);
                    }
                }
            }
            if (node.right.kind == "string") {
                variable.setValue(node.right.value);
            }
            this.classFunction.addVariable(variable);
        }
    }
}
class ReturnVisitor {
    constructor(classDeclaration, classFunction) {
        this.classDeclaration = classDeclaration;
        this.classFunction = classFunction;
    }
    visit(node) {
    }
}
//# sourceMappingURL=walker.js.map