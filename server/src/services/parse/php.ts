import { ClassDeclaration } from '../../php/structure'
import { Visitor, ChainVisitor } from '../../visitor';
import { Services, Service, containerCompleteClass } from '../service'
import { Range, Position } from 'vscode-languageserver';

export class ContainerVisitor implements Visitor {
    private classDeclaration: ClassDeclaration;
    private services: Services;
    constructor(classDeclaration: ClassDeclaration, services: Services) {
        this.classDeclaration = classDeclaration;
        this.services = services;
    }
    visit(node) {
        if (node.kind === 'namespace') {
            node.children.forEach(item => {
                this.visit(item);
            });
        }
        if (node.kind === 'class' || node.kind == 'trait') {
            if (node.body) {
                node.body.forEach(item => {
                    this.visit(item);
                });
            }
        }
        if (node.kind == 'method') {
            if (node.body) {
                let visitor = new CallVisitor(this.classDeclaration, this.services, node.name);
                node.body.children.forEach(item => {
                    visitor.visit(item);
                });
            }
        }
    }
}
//temporary solution
class CallVisitor implements Visitor {
    private classDeclaration: ClassDeclaration;
    private name: string;
    private services: Services;
    constructor(classDeclaration: ClassDeclaration, services: Services, name: string) {
        this.classDeclaration = classDeclaration;
        this.name = name;
        this.services = services;
    }
    visit(node) {
        if (node.kind !== 'call') {
            return;
        }
        let func = this.classDeclaration.getFunctionByName(this.name);
        if (!func) {
            return;
        }
        if (node.what.kind == 'propertylookup') {
            if (node.what.what.kind == "variable") {
                let name = node.what.what.name;
                let type = func.getVariableType(name);
                let fqn = this.classDeclaration.getFQNFromName(type);
                if (fqn && fqn == containerCompleteClass.containerBuilder) {
                    let funcName = node.what.offset.name;
                    if (funcName == 'setDefinition') {
                        let start = Position.create(node.loc.start.line, node.loc.start.offset)
                        if (node.arguments[0].kind == 'string') {
                            this.services.addService(
                                node.arguments[0].value,
                                new Service(node.arguments[0].value, this.classDeclaration.getFqnName(), start, this.classDeclaration.getPath())
                            );
                        }
                        if (node.arguments[0].kind == 'variable') {
                            let variable = func.getVariable(node.arguments[0].name);
                            if (variable.getValue()) {
                                this.services.addService(
                                    variable.getValue(),
                                    new Service(variable.getValue(), this.classDeclaration.getFqnName(), start, this.classDeclaration.getPath())
                                );
                                //  this.serices.addService(variable.getValue());
                            }
                        }
                    }
                    if (funcName == 'setParameter') {
                        if (node.arguments[0].kind == 'string') {
                            this.services.addParameter(node.arguments[0].value, null);
                        }
                    }
                }
            }
        }
    }
}