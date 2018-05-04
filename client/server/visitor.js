"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChainVisitor {
    constructor(visitors) {
        this.visitors = visitors;
    }
    visit(node) {
        this.visitors.forEach(visitor => {
            visitor.visit(node);
        });
    }
}
exports.ChainVisitor = ChainVisitor;
//# sourceMappingURL=visitor.js.map