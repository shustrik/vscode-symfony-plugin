import { ParsedDocument } from './parsedDocument';
import * as resolver from './variableResolver';

export class ProjectVariables {
    private variables: ClassVariables[];
    private types: Type[];
    public resoveDocument(document: ParsedDocument) {
        this.variables = [];
        let className = document.getClassName();
        this.variables[className] = document.traverseTree(resolver.resolve);
    }
}

class ClassVariables {
    private class;
    private variables: Type[];

}

class Type {
    private class;
    private parents: String[];
}