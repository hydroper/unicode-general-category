const FileSystem = require('fs');
const Path = require('path');
const currentDirectory = __dirname;

class GeneralCategory {
    static _valueOf = new Map;
    static _fromString = new Map;

    static UPPERCASE_LETTER = new GeneralCategory(0, 'Lu');
    static LOWERCASE_LETTER = new GeneralCategory(1, 'Ll');
    static TITLECASE_LETTER = new GeneralCategory(2, 'Lt');
    static MODIFIER_LETTER = new GeneralCategory(3, 'Lm');
    static OTHER_LETTER = new GeneralCategory(4, 'Lo');
    static NONSPACING_MARK = new GeneralCategory(5, 'Mn');
    static SPACING_COMBINING_MARK = new GeneralCategory(6, 'Mc');
    static ENCLOSING_MARK = new GeneralCategory(7, 'Me');
    static DECIMAL_DIGIT_NUMBER = new GeneralCategory(8, 'Nd');
    static LETTER_NUMBER = new GeneralCategory(9, 'Nl');
    static OTHER_NUMBER = new GeneralCategory(10, 'No');
    static CONNECTOR_PUNCTUATION = new GeneralCategory(11, 'Pc');
    static DASH_PUNCTUATION = new GeneralCategory(12, 'Pd');
    static OPEN_PUNCTUATION = new GeneralCategory(13, 'Ps');
    static CLOSE_PUNCTUATION = new GeneralCategory(14, 'Pe');
    static INITIAL_QUOTE_PUNCTUATION = new GeneralCategory(15, 'Pi');
    static FINAL_QUOTE_PUNCTUATION = new GeneralCategory(16, 'Pf');
    static OTHER_PUNCTUATION = new GeneralCategory(17, 'Po');
    static MATH_SYMBOL = new GeneralCategory(18, 'Sm');
    static CURRENCY_SYMBOL = new GeneralCategory(19, 'Sc');
    static MODIFIER_SYMBOL = new GeneralCategory(20, 'Sk');
    static OTHER_SYMBOL = new GeneralCategory(21, 'So');
    static SPACE_SEPARATOR = new GeneralCategory(22, 'Zs');
    static LINE_SEPARATOR = new GeneralCategory(23, 'Zl');
    static PARAGRAPH_SEPARATOR = new GeneralCategory(24, 'Zp');
    static CONTROL_OTHER = new GeneralCategory(25, 'Cc');
    static FORMAT_OTHER = new GeneralCategory(26, 'Cf');
    static SURROGATE_OTHER = new GeneralCategory(27, 'Cs');
    static PRIVATE_USE_OTHER = new GeneralCategory(28, 'Co');
    static NOT_ASSIGNED_OTHER = new GeneralCategory(29, 'Cn');

    constructor(value, str) {
        this._v = value;
        this._s = str;
        GeneralCategory._valueOf.set(value, this);
        GeneralCategory._fromString.set(str, this);
    }

    static valueOf(value) {
        return GeneralCategory._valueOf.get(value) || null;
    }

    static fromString(value) {
        return GeneralCategory._fromString.get(value) || null;
    }

    valueOf() {
        return this._v;
    }

    toString() {
        return this._s;
    }

    get isLetter() {
        return this._v >= 0 && this._v <= 4;
    }

    get isMark() {
        return this._v >= 5 && this._v <= 7;
    }

    get isNumber() {
        return this._v >= 8 && this._v <= 10;
    }

    get isPunctuation() {
        return this._v >= 11 && this._v <= 17;
    }

    get isSymbol() {
        return this._v >= 18 && this._v <= 21;
    }

    get isSeparator() {
        return this._v >= 22 && this._v <= 24;
    }

    get isOther() {
        return this._v >= 25 && this._v <= 29;
    }
}

class DataRow {
    constructor() {
        this.kind = DataRowKind.EOF;
        this.codePoint = 0;
        this.category = GeneralCategory.NOT_ASSIGNED_OTHER;
    }

    assign(other) {
        this.kind = other.kind;
        this.codePoint = other.codePoint;
        this.category = other.category;
    }

    isSuccessorByOneOf(other) {
        return this.kind == DataRowKind.SINGLE &&
            this.category == other.category &&
            (other.codePoint + 1) == this.codePoint;
    }
}

class DataRowKind {
    static EOF = new DataRowKind('eof');
    static SINGLE = new DataRowKind('single');
    static RANGE_START = new DataRowKind('rangeStart');
    static RANGE_END = new DataRowKind('rangeEnd');

    constructor(str) {
        this._str = str;
    }

    toString() {
        return this._str;
    }
}

class Scanner {
    constructor(buffer) {
        this.row = new DataRow;
        this.previousRow = new DataRow;
        this._buffer = buffer;
        this._bufferLength = buffer.length;
        this._offset = 0;
    }

    next() {
        this.previousRow.assign(this.row);
        if (this._offset >= this._bufferLength) {
            this.row.kind = DataRowKind.EOF;
            return;
        }
        let b = this._buffer.readUInt8(this._offset);
        if (b == 0x0a || b == 0x0d) {
            this.row.kind = DataRowKind.EOF;
            ++this._offset;
            return;
        }

        let cpStart = this._offset;
        b = this._buffer.readUInt8(this._offset);
        while (b != 0x3b) {
            ++this._offset;
            b = this._buffer.readUInt8(this._offset);
        }
        let cpStr = this._buffer.slice(cpStart, this._offset).toString('utf8');
        this.row.codePoint = parseInt(cpStr, 16);
        ++this._offset;

        let titleStart = this._offset;
        b = this._buffer.readUInt8(this._offset);
        while (b != 0x3b) {
            ++this._offset;
            b = this._buffer.readUInt8(this._offset);
        }
        let title = this._buffer.slice(titleStart, this._offset).toString('utf8');
        ++this._offset;
        if (title.indexOf('First>') != -1) {
            this.row.kind = DataRowKind.RANGE_START;
        } else if (title.indexOf('Last>') != -1) {
            this.row.kind = DataRowKind.RANGE_END;
        } else {
            this.row.kind = DataRowKind.SINGLE;
        }

        let categoryName = this._buffer.slice(this._offset, this._offset + 2).toString('utf8');
        this.row.category = GeneralCategory.fromString(categoryName);

        for (;;) {
            if (this._offset >= this._bufferLength)
                break;
            b = this._buffer.readUInt8(this._offset);
            if (b == 0x0d || b == 0x0a) {
                ++this._offset;
                if (this._buffer.readUInt8(this._offset) == 0x0a)
                    ++this._offset;
                break;
            } else {
                ++this._offset;
            }
        }
    }
}

function processBasic() {
    const scanner = new Scanner(FileSystem.readFileSync(Path.resolve(currentDirectory, 'input-basic.txt')));
    const {row, previousRow} = scanner;
    let currentCodePoint = 0;
    let outputBinary = Buffer.alloc(1000000);
    let outputBinaryOffset = 0;

    scanner.next();

    for (;;) {
        if (row.kind == DataRowKind.EOF) break;

        while (currentCodePoint != row.codePoint) {
            ++currentCodePoint;
            let count = 1;
            while (currentCodePoint != row.codePoint) {
                ++currentCodePoint;
                ++count;;
            }
            outputBinary.writeUInt8(GeneralCategory.NOT_ASSIGNED_OTHER.valueOf(), outputBinaryOffset);
            outputBinary.writeUInt16LE(count, outputBinaryOffset + 1);
            outputBinaryOffset += 3;
        }

        if (row.kind == DataRowKind.SINGLE) {
            let count = 1;
            for (;;) {
                ++currentCodePoint;
                scanner.next();
                if (row.isSuccessorByOneOf(previousRow)) {
                    ++count;
                } else break;
            }
            outputBinary.writeUInt8(previousRow.category.valueOf(), outputBinaryOffset);
            outputBinary.writeUInt16LE(count, outputBinaryOffset + 1);
            outputBinaryOffset += 3;
        } else {
            // DataRowKind.RANGE_START
            scanner.next();
            outputBinary.writeUInt8(row.category.valueOf(), outputBinaryOffset);
            outputBinary.writeUInt16LE(row.codePoint - previousRow.codePoint + 1, outputBinaryOffset + 1);
            outputBinaryOffset += 3;
            currentCodePoint = row.codePoint + 1;
            scanner.next();
        }
    }

    outputBinary = outputBinary.slice(0, outputBinaryOffset);
    FileSystem.mkdirSync(Path.resolve(currentDirectory, './bin'), { recursive: true });
    FileSystem.writeFileSync(Path.resolve(currentDirectory, './bin/basic.bin'), outputBinary);
}

function processSupplementary() {
    const scanner = new Scanner(FileSystem.readFileSync(Path.resolve(currentDirectory, 'input-supplementary.txt')));
    const {row, previousRow} = scanner;
    let currentCodePoint = 0x10000;
    let outputBinary = Buffer.alloc(5000000);
    let outputBinaryOffset = 0;

    scanner.next();

    for (;;) {
        if (row.kind == DataRowKind.EOF) break;

        if (currentCodePoint != row.codePoint) {
            ++currentCodePoint;
            let count = 1;
            while (currentCodePoint != row.codePoint) {
                ++currentCodePoint;
                ++count;;
            }
            outputBinary.writeUInt8(GeneralCategory.NOT_ASSIGNED_OTHER.valueOf(), outputBinaryOffset);
            Buffer_writeUInt24LE(outputBinary, count, outputBinaryOffset + 1);
            outputBinaryOffset += 4;
        }

        if (row.kind == DataRowKind.SINGLE) {
            let count = 1;
            for (;;) {
                ++currentCodePoint;
                scanner.next();
                if (row.isSuccessorByOneOf(previousRow)) {
                    ++count;
                } else break;
            }
            outputBinary.writeUInt8(previousRow.category.valueOf(), outputBinaryOffset);
            Buffer_writeUInt24LE(outputBinary, count, outputBinaryOffset + 1);
            outputBinaryOffset += 4;
        } else {
            // DataRowKind.RANGE_START
            scanner.next();
            outputBinary.writeUInt8(row.category.valueOf(), outputBinaryOffset);
            Buffer_writeUInt24LE(outputBinary, row.codePoint - previousRow.codePoint + 1, outputBinaryOffset + 1);
            outputBinaryOffset += 4;
            currentCodePoint = row.codePoint + 1;
            scanner.next();
        }
    }

    outputBinary = outputBinary.slice(0, outputBinaryOffset);
    FileSystem.mkdirSync(Path.resolve(currentDirectory, './bin'), { recursive: true });
    FileSystem.writeFileSync(Path.resolve(currentDirectory, './bin/supplementary.bin'), outputBinary);
}

function Buffer_writeUInt24LE(buffer, value, offset) {
    buffer.writeUInt8(value >> 16, offset + 2);
    buffer.writeUInt16LE(value & 0xffff, offset);
}

processBasic();
processSupplementary();