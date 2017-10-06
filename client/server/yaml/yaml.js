"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../yaml/parser");
exports.DUMP_OBJECT = 1;
exports.PARSE_EXCEPTION_ON_INVALID_TYPE = 2;
exports.PARSE_OBJECT = 4;
exports.PARSE_OBJECT_FOR_MAP = 8;
exports.DUMP_EXCEPTION_ON_INVALID_TYPE = 16;
exports.PARSE_DATETIME = 32;
exports.DUMP_OBJECT_AS_MAP = 64;
exports.DUMP_MULTI_LINE_LITERAL_BLOCK = 128;
exports.PARSE_CONSTANT = 256;
exports.PARSE_CUSTOM_TAGS = 512;
exports.DUMP_EMPTY_ARRAY_AS_SEQUENCE = 1024;
function parse(input) {
    let yaml = new parser_1.Parser();
    return yaml.parse(input);
}
exports.parse = parse;
//# sourceMappingURL=yaml.js.map