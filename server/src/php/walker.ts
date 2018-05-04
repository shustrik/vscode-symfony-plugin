import { ClassStorage, ClassDescriptionBuilder, ClassFunction, Variable, Use } from './structure'
import { Position } from 'vscode-languageserver';
import { Visitor, ChainVisitor } from '../visitor';
export class ClassDeclarationVisitors implements Visitor {
    private visitor: ChainVisitor;
    constructor(builder: ClassDescriptionBuilder) {
        this.visitor = new ChainVisitor(
            [new NamespaceVisitor(builder, this),
            new UseVisitor(builder),
            new MethodVisitor(builder),
            new ClassVisitor(builder, this),
            new PropertyVisitor(builder),
            new TraitVisitor(this)
            ]
        );
    }
    visit(node) {
        this.visitor.visit(node);
    }
}

class NamespaceVisitor implements Visitor {
    private builder: ClassDescriptionBuilder;
    private visitors: ClassDeclarationVisitors;
    constructor(classDeclaration: ClassDescriptionBuilder, visitors: ClassDeclarationVisitors) {
        this.builder = classDeclaration;
        this.visitors = visitors;
    }
    visit(node) {
        if (node.kind === 'namespace') {
            this.builder.setNamespace(node.name);
            node.children.forEach(item => {
                this.visitors.visit(item);
            });
        }
    }
}
class UseVisitor implements Visitor {
    private builder: ClassDescriptionBuilder;
    constructor(classDeclaration: ClassDescriptionBuilder) {
        this.builder = classDeclaration;
    }
    visit(node) {
        if (node.kind === 'usegroup') {
            node.items.forEach(item => {
                let use = new Use(item.name);
                if (item.alias) {
                    use.setAlias(item.alias);
                }
                this.builder.addUse(use);
            });
        }
    }
}
class MethodVisitor implements Visitor {
    private builder: ClassDescriptionBuilder;
    constructor(classDeclaration: ClassDescriptionBuilder) {
        this.builder = classDeclaration;
    }
    visit(node) {
        if (node.kind !== 'method') {
            return;
        }
        let start = Position.create(node.loc.start.line, node.loc.start.offset)
        let end = Position.create(node.loc.end.line, node.loc.end.offset)
        let func = new ClassFunction(node.name, start, end);
        if (node.visibility == 'public') {
            func.visible();
        }
        if (node.static) {
            func.static();
        }
        node.arguments.forEach(item => {
            let start = Position.create(item.loc.start.line, item.loc.start.offset)
            let end = Position.create(item.loc.end.line, item.loc.end.offset)
            let variable = new Variable(item.name, start, end);
            if (item.type) {
                variable.setType(item.type.name);
            }
            func.addVariable(variable);
        });
        if (node.body) {
            let visitor = new ChainVisitor(
                [new AssignVisitor(this.builder, func),
                new ReturnVisitor(this.builder, func)]
            );
            node.body.children.forEach(item => {
                visitor.visit(item);
            });
        }
        this.builder.addFunction(func);
    }
}
class ClassVisitor implements Visitor {
    private builder: ClassDescriptionBuilder;
    private visitors: ClassDeclarationVisitors;
    constructor(builder: ClassDescriptionBuilder, visitors: ClassDeclarationVisitors) {
        this.builder = builder;
        this.visitors = visitors;
    }
    visit(node) {
        if (node.kind !== 'class') {
            return;
        }
        this.builder.setPositions(node.loc.start.line, node.loc.start.offset, node.loc.end.line, node.loc.end.offset);
        this.builder.setName(node.name);
        if (node.implements) {
            node.implements.forEach(item => {
                this.builder.addInterface(item);
            });
        }
        if (node.extends) {
            this.builder.setParent(node.extends.name);
        }
        this.builder.setAbstract(node.isAbstract);
        if (node.body) {
            node.body.forEach(item => {
                this.visitors.visit(item);
            });
        }
    }
}
class PropertyVisitor implements Visitor {
    private builder: ClassDescriptionBuilder;
    constructor(classDeclaration: ClassDescriptionBuilder) {
        this.builder = classDeclaration;
    }
    visit(node) {
        if (node.kind === 'property') {
            let start = Position.create(node.loc.start.line, node.loc.start.offset)
            let end = Position.create(node.loc.end.line, node.loc.end.offset)
            let variable = new Variable(node.name, start, end);
            this.builder.addVariable(variable);
        }
    }
}
class TraitVisitor implements Visitor {
    private visitors: ClassDeclarationVisitors;
    constructor(visitors: ClassDeclarationVisitors) {
        this.visitors = visitors;
    }
    visit(node) {
        if (node.kind === 'trait' && node.body) {
            this.visitors.visit(node.body);
        }
    }
}

class AssignVisitor implements Visitor {
    private builder: ClassDescriptionBuilder;
    private classFunction: ClassFunction;
    constructor(builder: ClassDescriptionBuilder, classFunction: ClassFunction) {
        this.builder = builder;
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
                    this.builder.setPropertyType(node.left.offset.name, type);
                }
            }
        }
        if (node.left && node.left.kind == "variable") {
            let start = Position.create(node.loc.start.line, node.loc.start.offset)
            let end = Position.create(node.loc.end.line, node.loc.end.offset)
            let variable = new Variable(node.left.name, start, end);
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
class ReturnVisitor implements Visitor {
    private builder: ClassDescriptionBuilder;
    private classFunction: ClassFunction;
    constructor(builder: ClassDescriptionBuilder, classFunction: ClassFunction) {
        this.builder = builder;
        this.classFunction = classFunction;
    }
    visit(node) {

    }
}
