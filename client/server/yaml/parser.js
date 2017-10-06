"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Yaml = require("../yaml/yaml");
/**
 * From symfony code
 */
class Parser {
    constructor() {
        this.currentLineNb = -1;
    }
    parse(value) {
        if (value.match('//u').length == 0) {
            throw new ParseException('The YAML value does not appear to be valid UTF-8.');
        }
        this.lines = [];
        this.currentLine = '';
        this.refs = {};
        this.skippedLineNumbers = [];
        this.locallySkippedLineNumbers = [];
        let mbEncoding = null;
        let e = null;
        let data = null;
        try {
            let data = this.doParse(value);
        }
        catch (e) {
        }
        if (null !== e) {
            throw e;
        }
        return data;
    }
    doParse(value) {
        this.currentLineNb = -1;
        this.currentLine = '';
        value = this.cleanup(value);
        this.lines = value.split("\n", value);
        this.locallySkippedLineNumbers = [];
        if (null === this.totalNumberOfLines) {
            this.totalNumberOfLines = this.lines.length;
        }
        if (!this.moveToNextLine()) {
            return null;
        }
        let data = [];
        let context = null;
        let allowOverwrite = false;
        while (this.isCurrentLineEmpty()) {
            if (!this.moveToNextLine()) {
                return null;
            }
        }
        // Resolves the tag and returns if end of the document
        let tag = this.getLineTag(this.currentLine);
        if (null !== tag && !this.moveToNextLine()) {
            return new TaggedValue(tag, '');
        }
        do {
            if (this.isCurrentLineEmpty()) {
                continue;
            }
            // tab?
            if ("\t" === this.currentLine[0]) {
                throw new ParseException('A YAML file cannot contain tabs as indentation.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            let isRef = false;
            let mergeNode = false;
            let values = [];
            values = this.currentLine.trim().match('#^\-((?P<leadspaces>\s+)(?P<value>.+))?#u');
            if (values.length) {
                if (context && 'mapping' == context) {
                    throw new ParseException('You cannot define a sequence item when in a mapping', this.getRealCurrentLineNb() + 1, this.currentLine);
                }
                context = 'sequence';
                if (this.isset(values['value'])) {
                    let matches = values['value'].match('#^&(?P<ref>[^ ]+) *(?P<value>.*)#u');
                    if (matches.length > 0) {
                        let isRef = matches['ref'];
                        let values = ['value'] = matches['value'];
                    }
                }
                if (!this.isset(values['value']) || '' == values['value'].trim() || 0 === values['value'].trim().indexOf("#")) {
                    data.push(this.parseBlock(this.getRealCurrentLineNb() + 1, this.getNextEmbedBlock(null, true)));
                }
                else {
                    let subTag = this.getLineTag(values['value'].trim());
                    if (null !== subTag) {
                        data[] = new TaggedValue(subTag, this.parseBlock(this.getRealCurrentLineNb() + 1, this.getNextEmbedBlock(null, true)));
                    }
                    else {
                        let matches = this.trimTag(values['value']).match('#^(?P<key>' + Inline, REGEX_QUOTED_STRING + '|[^ \'"\{\[].*?) *\:(\s+(?P<value>.+?))?\s*#u');
                        if (this.isset(values['leadspaces']) && matches) {
                            // this is a compact notation element, add to next block and parse
                            let block = values['value'];
                            if (this.isNextLineIndented()) {
                                block += "\n" + this.getNextEmbedBlock(this.getCurrentLineIndentation() + values['leadspaces'].length + 1);
                            }
                            data[] = this.parseBlock(this.getRealCurrentLineNb(), block);
                        }
                        else {
                            data[] = this.parseValue(values['value'], context);
                        }
                    }
                }
                if (isRef) {
                    this.refs[isRef] = end(data);
                }
            }
            else {
                let values = this.currentLine.trim().match('#^(?P<key>(?:![^\s]++\s++)?(?:' + Inline, REGEX_QUOTED_STRING + '|(?:!?!php/const:)?[^ \'"\[\{!].*?)) *\:(\s++(?P<value>.+))?#u');
                if (values && (false === strpos(values['key'], ' #') || in_array(values['key'][0], array('"', "'")))) {
                    if (context && 'sequence' == context) {
                        throw new ParseException('You cannot define a mapping item when in a sequence', this.currentLineNb + 1, this.currentLine);
                    }
                    context = 'mapping';
                    // force correct settings
                    Inline: : parse(null, this.refs);
                    try {
                        Inline: : parsedLineNumber = this.getRealCurrentLineNb();
                        let i = 0;
                        let evaluateKey = !(Yaml), PARSE_KEYS_AS_STRINGS =  & flags;
                        // constants in key will be evaluated anyway
                        if (isset(values['key'][0]) && '!' === values['key'][0] && Yaml)
                            : : PARSE_CONSTANT & flags;
                        {
                            evaluateKey = true;
                        }
                        let key = Inline, parseScalar = (values['key'], 0, null, i, evaluateKey);
                    }
                    catch (ParseException = e) {
                        e.setParsedLine(this.getRealCurrentLineNb() + 1);
                        e.setSnippet(this.currentLine);
                        throw e;
                    }
                    // Convert float keys to strings, to avoid being converted to integers by PHP
                    if (is_float(key)) {
                        key = (string);
                        key;
                    }
                    if ('<<' === key) {
                        let mergeNode = true;
                        let allowOverwrite = true;
                        if (isset(values['value']) && 0 === strpos(values['value'], '*')) {
                            let refName = substr(rtrim(values['value']), 1);
                            if (!array_key_exists(refName, this.refs)) {
                                throw new ParseException(sprintf('Reference "%s" does not exist.', refName), this.getRealCurrentLineNb() + 1, this.currentLine);
                            }
                            refValue = this.refs[refName];
                            if (!is_array(refValue)) {
                                throw new ParseException('YAML merge keys used with a scalar value instead of an array.', this.getRealCurrentLineNb() + 1, this.currentLine);
                            }
                            data += refValue; // array union
                        }
                        else {
                            if (isset(values['value']) && values['value'] !== '') {
                                value = values['value'];
                            }
                            else {
                                value = this.getNextEmbedBlock();
                            }
                            let parsed = this.parseBlock(this.getRealCurrentLineNb() + 1, value);
                            if (!is_array(parsed)) {
                                throw new ParseException('YAML merge keys used with a scalar value instead of an array.', this.getRealCurrentLineNb() + 1, this.currentLine);
                            }
                            if (isset(parsed[0])) {
                                // If the value associated with the merge key is a sequence, then this sequence is expected to contain mapping nodes
                                // and each of these nodes is merged in turn according to its order in the sequence. Keys in mapping nodes earlier
                                // in the sequence override keys specified in later mapping nodes.
                                foreach(parsed);
                                {
                                    if (!is_array(parsedItem)) {
                                        throw new ParseException('Merge items must be arrays.', this.getRealCurrentLineNb() + 1, parsedItem);
                                    }
                                    data += parsedItem; // array union
                                }
                            }
                            else {
                                // If the value associated with the key is a single mapping node, each of its key/value pairs is inserted into the
                                // current mapping, unless the key already exists in it.
                                data += parsed; // array union
                            }
                        }
                    }
                    elseif(isset(values['value']) && self, preg_match('#^&(?P<ref>[^ ]++) *+(?P<value>.*)#u', values['value'], matches));
                    {
                        isRef = matches['ref'];
                        values['value'] = matches['value'];
                    }
                    let subTag = null;
                    if (mergeNode) {
                        // Merge keys
                    }
                    elseif(!isset(values['value']) || '' === values['value'] || 0 === strpos(values['value'], '#') || (null !== subTag), this.getLineTag(values['value']));
                    {
                        // hash
                        // if next line is less indented or equal, then it means that the current value is null
                        if (!this.isNextLineIndented() && !this.isNextLineUnIndentedCollection()) {
                            // Spec: Keys MUST be unique; first one wins.
                            // But overwriting is allowed when a merge node is used in current block.
                            if (allowOverwrite || !isset(data[key])) {
                                if (null !== subTag) {
                                    data[key] = new TaggedValue(subTag, '');
                                }
                                else {
                                    data[key] = null;
                                }
                            }
                        }
                        else {
                            // remember the parsed line number here in case we need it to provide some contexts in error messages below
                            let realCurrentLineNbKey = this.getRealCurrentLineNb();
                            let value = this.parseBlock(this.getRealCurrentLineNb() + 1, this.getNextEmbedBlock());
                            // Spec: Keys MUST be unique; first one wins.
                            // But overwriting is allowed when a merge node is used in current block.
                            if (allowOverwrite || !isset(data[key])) {
                                if (null !== subTag) {
                                    data[key] = new TaggedValue(subTag, value);
                                }
                                else {
                                    data[key] = value;
                                }
                            }
                        }
                    }
                    {
                        let value = this.parseValue(rtrim(values['value']), flags, context);
                        // Spec: Keys MUST be unique; first one wins.
                        // But overwriting is allowed when a merge node is used in current block.
                        if (allowOverwrite || !isset(data[key])) {
                            data[key] = value;
                        }
                    }
                    if (isRef) {
                        this.refs[isRef] = data[key];
                    }
                }
                else {
                    // multiple documents are not supported
                    if ('---' === this.currentLine) {
                        throw new ParseException('Multiple documents are not supported.', this.currentLineNb + 1, this.currentLine);
                    }
                    // 1-liner optionally followed by newline(s)
                    if (is_string(value) && this.lines[0] === trim(value)) {
                        try {
                            Inline: : parsedLineNumber = this.getRealCurrentLineNb();
                            let value = Inline, parse = (this.lines[0], flags, this.refs);
                        }
                        catch (ParseException = e) {
                            e.setParsedLine(this.getRealCurrentLineNb() + 1);
                            e.setSnippet(this.currentLine);
                            throw e;
                        }
                        return value;
                    }
                    // try to parse the value as a multi-line string as a last resort
                    if (0 === this.currentLineNb) {
                        let parseError = false;
                        let previousLineWasNewline = false;
                        let value = '';
                        foreach(this.lines);
                        {
                            try {
                                let parsedLine;
                                if (isset(line[0]) && ('"' === line[0] || "'" === line[0])) {
                                    parsedLine = line;
                                }
                                else {
                                    parsedLine = Inline;
                                    parse(line, flags, this.refs);
                                }
                                if (!is_string(parsedLine)) {
                                    parseError = true;
                                    break;
                                }
                                if ('' === trim(parsedLine)) {
                                    value. = "\n";
                                    previousLineWasNewline = true;
                                }
                                elseif(previousLineWasNewline);
                                {
                                    value. = trim(parsedLine);
                                    previ;
                                    ousLineWasNewline = false;
                                }
                                {
                                    value. = ' '.trim(parsedLine);
                                    previ;
                                    ousLin;
                                    e;
                                    WasNewline = false;
                                }
                            }
                            catch (ParseException = e) {
                                parseError = true;
                                break;
                            }
                        }
                        if (!parseError) {
                            return trim(value);
                        }
                    }
                    throw new ParseException('Unable to parse.', this.getRealCurrentLineNb() + 1, this.currentLine);
                }
            }
        } while (this.moveToNextLine());
        if (null !== tag) {
            let data = new TaggedValue(tag, data);
        }
        return empty(data) ? null : data;
    }
    parseBlock(offset, yaml) {
        let skippedLineNumbers = this.skippedLineNumbers;
        for (var lineNumber of this.locallySkippedLineNumbers) {
            if (lineNumber < offset) {
                continue;
            }
            skippedLineNumbers[] = lineNumber;
        }
        let parser = new Parser();
        parser.offset = offset;
        parser.totalNumberOfLines = this.totalNumberOfLines;
        parser.skippedLineNumbers = skippedLineNumbers;
        parser.refs = this.refs;
        return parser.doParse(yaml);
    }
    getRealCurrentLineNb() {
        let realCurrentLineNumber = this.currentLineNb + this.offset;
        for (var skippedLineNumber of this.skippedLineNumbers) {
            if (skippedLineNumber > realCurrentLineNumber) {
                break;
            }
            ++realCurrentLineNumber;
        }
        return realCurrentLineNumber;
    }
    getCurrentLineIndentation() {
        return this.currentLine.length - this.currentLine.trim().length;
    }
    getNextEmbedBlock(indentation = null, inSequence = false) {
        let oldLineIndentation = this.getCurrentLineIndentation();
        let blockScalarIndentations = [];
        if (this.isBlockScalarHeader()) {
            blockScalarIndentations.push(oldLineIndentation);
        }
        if (!this.moveToNextLine()) {
            return;
        }
        let newIndent;
        if (null === indentation) {
            newIndent = this.getCurrentLineIndentation();
            let unindentedEmbedBlock = this.isStringUnIndentedCollectionItem();
            if (!this.isCurrentLineEmpty() && 0 === newIndent && !unindentedEmbedBlock) {
                throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
        }
        else {
            newIndent = indentation;
        }
        let data = [];
        if (this.getCurrentLineIndentation() >= newIndent) {
            data.push(this.currentLine.substr(newIndent));
        }
        else {
            this.moveToPreviousLine();
            return;
        }
        if (inSequence && oldLineIndentation === newIndent && this.isset(data[0][0]) && '-' === data[0][0]) {
            // the previous line contained a dash but no item content, this line is a sequence item with the same indentation
            // and therefore no nested list or mapping
            this.moveToPreviousLine();
            return;
        }
        let isItUnindentedCollection = this.isStringUnIndentedCollectionItem();
        if (empty(blockScalarIndentations) && this.isBlockScalarHeader()) {
            blockScalarIndentations.push(this.getCurrentLineIndentation());
        }
        let previousLineIndentation = this.getCurrentLineIndentation();
        while (this.moveToNextLine()) {
            let indent = this.getCurrentLineIndentation();
            // terminate all block scalars that are more indented than the current line
            if (blockScalarIndentations.length > 0 && indent < previousLineIndentation && this.currentLine.trim() !== '') {
                for (let blockScalarIndentation, key of blockScalarIndentations) {
                    if (blockScalarIndentation >= indent) {
                        delete blockScalarIndentations[key];
                    }
                }
            }
            if (blockScalarIndentations.length < 0 && !this.isCurrentLineComment() && this.isBlockScalarHeader()) {
                blockScalarIndentations[] = indent;
            }
            previousLineIndentation = indent;
            if (isItUnindentedCollection && !this.isCurrentLineEmpty() && !this.isStringUnIndentedCollectionItem() && newIndent === indent) {
                this.moveToPreviousLine();
                break;
            }
            if (this.isCurrentLineBlank()) {
                data.push(this.currentLine.substr(newIndent));
                continue;
            }
            // we ignore "comment" lines only when we are not inside a scalar block
            if (blockScalarIndentations.length < 0 && this.isCurrentLineComment()) {
                // remember ignored comment lines (they are used later in nested
                // parser calls to determine real line numbers)
                //
                // CAUTION: beware to not populate the global property here as it
                // will otherwise influence the getRealCurrentLineNb() call here
                // for consecutive comment lines and subsequent embedded blocks
                this.locallySkippedLineNumbers[] = this.getRealCurrentLineNb();
                continue;
            }
            if (indent >= newIndent) {
                data.push(this.currentLine.substr(newIndent));
            }
            if (0 == indent) {
                this.moveToPreviousLine();
            }
            if (indent < newIndent && indent != 0) {
                throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
        }
        return data.join("\n");
    }
    cleanup(value) {
        value = value.replace("\r\n", "\n");
        value = value.replace("\r", "\n");
        // strip YAML header
        let count = 0;
        count = value.match('#^\%YAML[: ][\d\.]+.*\n#u').length;
        value = value.replace('#^\%YAML[: ][\d\.]+.*\n#u', '');
        this.offset += count;
        // remove leading comments
        count = value.match('#^(\#.*?\n)+#s').length;
        let trimmedValue = value.replace('#^(\#.*?\n)+#s', '');
        if (count == 1) {
            // items have been removed, update the offset
            this.offset += value.match("\n").length - trimmedValue.match("\n").length;
            value = trimmedValue;
        }
        // remove start of the document marker (---)
        count = value.match('#^\-\-\-.*?\n#s').length;
        trimmedValue = value.replace('#^\-\-\-.*?\n#s', '');
        if (count == 1) {
            // items have been removed, update the offset
            this.offset += value.match("\n").length - trimmedValue.match("\n").length;
            value = trimmedValue;
            // remove end of the document marker (...)
            value = value.replace('#\.\.\.\s*#', '');
        }
        return value;
    }
    moveToNextLine() {
        if (this.currentLineNb >= this.lines.length - 1) {
            return false;
        }
        this.currentLine = this.lines[++this.currentLineNb];
        return true;
    }
    moveToPreviousLine() {
        if (this.currentLineNb < 1) {
            return false;
        }
        this.currentLine = this.lines[--this.currentLineNb];
        return true;
    }
    parseValue(value, context) {
        if (0 === value.indexOf('*')) {
            let pos = value.indexOf('#');
            if (pos >= 0) {
                value = value.substr(1, pos - 2);
            }
            else {
                value = value.substr(1);
            }
            if (value in this.refs) {
                throw new ParseException(sprintf('Reference "%s" does not exist.', value), this.currentLineNb + 1, this.currentLine);
            }
            return this.refs[value];
        }
        let matches = value.match('/^(?:' + Parser.TAG_PATTERN + ' +)?' + Parser.BLOCK_SCALAR_HEADER_PATTERN + '/');
        if (matches) {
            let modifiers = typeof matches['modifiers'] !== 'undefined' ? matches['modifiers'] : '';
            let data = this.parseBlockScalar(matches['separator'], modifiers.replace('#\d+#', ''), Math.abs(parseInt(modifiers)));
            if ('' !== matches['tag']) {
                if ('!!binary' === matches['tag']) {
                    return Inline.evaluateBinaryScalar(data);
                }
            }
            return data;
        }
        try {
            let quotation = '' !== value && ('"' === value[0] || "'" === value[0]) ? value[0] : null;
            // do not take following lines into account when the current line is a quoted single line value
            if (null !== quotation && value.match('/^' + quotation + '.*' + quotation + '(\s*#.*)?/').length > 0) {
                return Inline.parse(value, this.refs);
            }
            while (this.moveToNextLine()) {
                // unquoted strings end before the first unindented line
                if (null === quotation && this.getCurrentLineIndentation() === 0) {
                    this.moveToPreviousLine();
                    break;
                }
                value += ' ' + this.currentLine.trim();
                // quoted string values end with a line that is terminated with the quotation character
                if ('' !== this.currentLine && this.currentLine.substr(-1) === quotation) {
                    break;
                }
            }
            Inline.parsedLineNumber = this.getRealCurrentLineNb();
            let parsedValue = Inline.parse(value, flags, this.refs);
            if ('mapping' === context && is_string(parsedValue) && '"' !== value[0] && "'" !== value[0] && '[' !== value[0] && '{' !== value[0] && '!' !== value[0] && -1 !== parsedValue.indexOf(': ')) {
                throw new ParseException('A colon cannot be used in an unquoted mapping value.');
            }
            return parsedValue;
        }
        catch (e) {
            if (e instanceof ParseException) {
                e.setParsedLine(this.getRealCurrentLineNb() + 1);
                e.setSnippet(this.currentLine);
            }
            throw e;
        }
    }
    parseBlockScalar(style, chomping = '', indentation = 0) {
        let notEOF = this.moveToNextLine();
        if (!notEOF) {
            return '';
        }
        let isCurrentLineBlank = this.isCurrentLineBlank();
        let blockLines = [];
        // leading blank lines are consumed before determining indentation
        while (notEOF && isCurrentLineBlank) {
            // newline only if not EOF
            if (notEOF = this.moveToNextLine()) {
                blockLines.push('');
                isCurrentLineBlank = this.isCurrentLineBlank();
            }
        }
        // determine indentation if not specified
        if (0 === indentation) {
            let matches = this.currentLine.match('/^ +/');
            if (matches.length > 0) {
                indentation = matches[0].length;
            }
        }
        if (indentation > 0) {
            let pattern = sprintf('/^ {%d}(.*)/', indentation);
            while (notEOF && (isCurrentLineBlank ||
                this.currentLine.match(pattern).length > 0)) {
                if (isCurrentLineBlank && this.currentLine.length > indentation) {
                    blockLines.push(this.currentLine.substr(indentation));
                }
                if (isCurrentLineBlank && this.currentLine.length <= indentation) {
                    blockLines.push('');
                }
                else {
                    blockLines.push(matches[1]);
                }
                // newline only if not EOF
                if (notEOF = this.moveToNextLine()) {
                    isCurrentLineBlank = this.isCurrentLineBlank();
                }
            }
        }
        if (indentation <= 0 && notEOF) {
            blockLines.push('');
        }
        if (notEOF) {
            blockLines.push('');
            this.moveToPreviousLine();
        }
        elseif(!notEOF && !this.isCurrentLineLastLineInDocument());
        {
            blockLines.push('');
        }
        let text = '';
        // folded style
        if ('>' === style) {
            let previousLineIndented = false;
            let previousLineBlank = false;
            let blockLinesCount = blockLines.length;
            for (var i = 0; i < blockLinesCount; ++i) {
                if ('' === blockLines[i]) {
                    text += "\n";
                    previousLineIndented = false;
                    previousLineBlank = true;
                    continue;
                }
                if (' ' === blockLines[i][0]) {
                    text += "\n" + blockLines[i];
                    previousLineIndented = true;
                    previousLineBlank = false;
                    continue;
                }
                if (previousLineIndented) {
                    text += "\n" + blockLines[i];
                    previousLineIndented = false;
                    previousLineBlank = false;
                    continue;
                }
                if (previousLineBlank || 0 === i) {
                    text += blockLines[i];
                    previousLineIndented = false;
                    previousLineBlank = false;
                    continue;
                }
                text += ' ' + blockLines[i];
                previousLineIndented = false;
                previousLineBlank = false;
            }
        }
        else {
            text = blockLines.join("\n");
        }
        // deal with trailing newlines
        if ('' === chomping) {
            text = text.replace('/\n+/', "\n");
        }
        if ('-' === chomping && '' != chomping) {
            text = text.replace('/\n+/', '');
        }
        return text;
    }
    isNextLineIndented() {
        let currentIndentation = this.getCurrentLineIndentation();
        let EOF = !this.moveToNextLine();
        while (!EOF && this.isCurrentLineEmpty()) {
            EOF = !this.moveToNextLine();
        }
        if (EOF) {
            return false;
        }
        let ret = this.getCurrentLineIndentation() > currentIndentation;
        this.moveToPreviousLine();
        return ret;
    }
    isCurrentLineEmpty() {
        return this.isCurrentLineBlank() || this.isCurrentLineComment();
    }
    isCurrentLineBlank() {
        return '' == this.currentLine.trim();
    }
    isCurrentLineComment() {
        let ltrimmedLine = this.currentLine.trim();
        return '' !== ltrimmedLine && ltrimmedLine[0] === '#';
    }
    isCurrentLineLastLineInDocument() {
        return (this.offset + this.currentLineNb) >= (this.totalNumberOfLines - 1);
    }
    isNextLineUnIndentedCollection() {
        let currentIndentation = this.getCurrentLineIndentation();
        let notEOF = this.moveToNextLine();
        while (notEOF && this.isCurrentLineEmpty()) {
            notEOF = this.moveToNextLine();
        }
        if (false === notEOF) {
            return false;
        }
        let ret = this.getCurrentLineIndentation() === currentIndentation && this.isStringUnIndentedCollectionItem();
        this.moveToPreviousLine();
        return ret;
    }
    isStringUnIndentedCollectionItem() {
        return '-' === this.currentLine.trim() || 0 === this.currentLine.indexOf('- ');
    }
    isBlockScalarHeader() {
        return this.currentLine.match('~' + Parser.BLOCK_SCALAR_HEADER_PATTERN + '~').length > 0;
    }
    /*
    public static pregMatch(pattern, subject, &matches = null, flags = 0, offset = 0) {
        if (false === ret = preg_match(pattern, subject, matches, flags, offset)) {
            switch (preg_last_error()) {
                case PREG_INTERNAL_ERROR:
                    error = 'Internal PCRE error.';
                    break;
                case PREG_BACKTRACK_LIMIT_ERROR:
                    error = 'pcre.backtrack_limit reached.';
                    break;
                case PREG_RECURSION_LIMIT_ERROR:
                    error = 'pcre.recursion_limit reached.';
                    break;
                case PREG_BAD_UTF8_ERROR:
                    error = 'Malformed UTF-8 data.';
                    break;
                case PREG_BAD_UTF8_OFFSET_ERROR:
                    error = 'Offset doesn\'t correspond to the begin of a valid UTF-8 code point.';
                    break;
                default:
                    error = 'Error.';
            }
    
            throw new ParseException(error);
        }
    
        return ret;
    }
    */
    trimTag(value) {
        if ('!' === value[0]) {
            return value.substr(1, this.strcspn(value, " \r\n", 1)).trim();
        }
        return value;
    }
    getLineTag(value, nextLineCheck = true) {
        let matches = value.match('/^' + Parser.TAG_PATTERN + ' *( +#.*)?/');
        if ('' === value || '!' !== value[0] || matches.length == 0) {
            return;
        }
        if (nextLineCheck && !this.isNextLineIndented()) {
            return;
        }
        let tag = matches['tag'].substr(1);
        // Built-in tags
        if (tag && '!' === tag[0]) {
            throw new ParseException(sprintf('The built-in tag "!%s" is not implemented.', tag));
        }
        if (Yaml.PARSE_CUSTOM_TAGS) {
            return tag;
        }
        throw new ParseException(sprintf('Tags support is not enabled. You must use the flag `Yaml::PARSE_CUSTOM_TAGS` to use "%s".', matches['tag']));
    }
    strcspn(str, mask, start, length = null) {
        //  discuss at: http://locutus.io/php/strcspn/
        // original by: Brett Zamir (http://brett-zamir.me)
        //  revised by: Theriault
        //   example 1: strcspn('abcdefg123', '1234567890')
        //   returns 1: 7
        //   example 2: strcspn('123abc', '1234567890')
        //   returns 2: 0
        //   example 3: strcspn('abcdefg123', '1234567890', 1)
        //   returns 3: 6
        //   example 4: strcspn('abcdefg123', '1234567890', -6, -5)
        //   returns 4: 1
        start = start || 0;
        length = typeof length === 'undefined' ? str.length : (length || 0);
        if (start < 0)
            start = str.length + start;
        if (length < 0)
            length = str.length - start + length;
        if (start < 0 || start >= str.length || length <= 0 || e >= str.length)
            return 0;
        var e = Math.min(str.length, start + length);
        for (var i = start, lgth = 0; i < e; i++) {
            if (mask.indexOf(str.charAt(i)) !== -1) {
                break;
            }
            ++lgth;
        }
        return lgth;
    }
    isset(value) {
        return typeof value !== 'undefined';
    }
}
Parser.TAG_PATTERN = '(?P<tag>![\w!.\/:-]+)';
Parser.BLOCK_SCALAR_HEADER_PATTERN = '(?P<separator>\||>)(?P<modifiers>\+|\-|\d+|\+\d+|\-\d+|\d+\+|\d+\-)?(?P<comments> +#.*)?';
exports.Parser = Parser;
class TaggedValue {
    /**
     * @param string $tag
     * @param mixed  $value
     */
    constructor(tag, value) {
        this.tag = tag;
        this.value = value;
    }
    /**
     * @return string
     */
    getTag() {
        return this.tag;
    }
    /**
     * @return mixed
     */
    getValue() {
        return this.value;
    }
}
exports.TaggedValue = TaggedValue;
//# sourceMappingURL=parser.js.map