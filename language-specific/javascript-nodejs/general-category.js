const FileSystem = require('fs');
const Path = require('path');
const currentDirectory = __dirname;

const basicPlane = FileSystem.readFileSync(Path.resolve(currentDirectory, '../../data/bin/basic.bin'));
const supplementaryPlane = FileSystem.readFileSync(Path.resolve(currentDirectory, '../../data/bin/supplementary.bin'));

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

    static from(codePoint) {
        let offset = 0, compareCodePoint = 0;
        if (codePoint < 0x10000) {
            while (Infinity) {
                if (offset == basicPlane.length) break;
                let count = basicPlane.readUInt16LE(offset + 1);
                compareCodePoint += count;
                if (codePoint < compareCodePoint)
                    return GeneralCategory.valueOf(basicPlane.readUInt8(offset));
                offset += 3;
            }
        } else {
            compareCodePoint = 0x10000;
            while (Infinity) {
                if (offset == supplementaryPlane.length) break;
                let count = Buffer_readUInt24LE(supplementaryPlane, offset + 1);
                compareCodePoint += count;
                if (codePoint < compareCodePoint)
                    return GeneralCategory.valueOf(supplementaryPlane.readUInt8(offset));
                offset += 4;
            }
        }
        return GeneralCategory.NOT_ASSIGNED_OTHER;
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

function Buffer_readUInt24LE(buffer, offset) {
    return (buffer.readUInt8(offset + 2) << 16) | buffer.readUInt16LE(offset);
}