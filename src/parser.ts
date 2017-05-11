export namespace Parser {
    const table: [RegExp, (TokenType | LexerAction)][][] = [
        [/^class(?=\b)/, TokenType.Class],
        [/^interface(?=\b)/, TokenType.Interface],
        [/^trait(?=\b)/, TokenType.Trait],
        [/^extends(?=\b)/, TokenType.Extends],
        [/^implements(?=\b)/, TokenType.Implements],
        [/^\$[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.VariableName],
        [/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*/, TokenType.Name],
    ];
    export function parse(text: String) {
        
    }
}