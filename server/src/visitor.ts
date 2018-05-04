export interface Visitor {
    visit(node);
}
export class ChainVisitor implements Visitor {
    private visitors;
    constructor(visitors: Visitor[]) {
        this.visitors = visitors;
    }
    visit(node) {
        this.visitors.forEach(visitor => {
            visitor.visit(node);
        });
    }
}