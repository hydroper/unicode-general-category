package com.matheusdiasdesouzads.unicode {
    import flash.utils.Dictionary;
    import flash.utils.ByteArray;

    public final class GeneralCategory {
        [Embed(source='../../../../../../data/bin/basic.bin', mimeType='application/octet-stream')]
        private static var basicPlaneClass:Class;
        [Embed(source='../../../../../../data/bin/supplementary.bin', mimeType='application/octet-stream')]
        private static var supplementaryPlaneClass:Class;

        private static var basicPlane:ByteArray = ByteArray(new basicPlaneClass);
        private static var supplementaryPlane:ByteArray = ByteArray(new supplementaryPlaneClass);
        basicPlane.endian =
        supplementaryPlane.endian = 'littleEndian';

        private static const _valueOf:Dictionary = new Dictionary;
        private static const _fromString:Dictionary = new Dictionary;

        public static const UPPERCASE_LETTER:GeneralCategory = new GeneralCategory(0, 'Lu');
        public static const LOWERCASE_LETTER:GeneralCategory = new GeneralCategory(1, 'Ll');
        public static const TITLECASE_LETTER:GeneralCategory = new GeneralCategory(2, 'Lt');
        public static const MODIFIER_LETTER:GeneralCategory = new GeneralCategory(3, 'Lm');
        public static const OTHER_LETTER:GeneralCategory = new GeneralCategory(4, 'Lo');
        public static const NONSPACING_MARK:GeneralCategory = new GeneralCategory(5, 'Mn');
        public static const SPACING_COMBINING_MARK:GeneralCategory = new GeneralCategory(6, 'Mc');
        public static const ENCLOSING_MARK:GeneralCategory = new GeneralCategory(7, 'Me');
        public static const DECIMAL_DIGIT_NUMBER:GeneralCategory = new GeneralCategory(8, 'Nd');
        public static const LETTER_NUMBER:GeneralCategory = new GeneralCategory(9, 'Nl');
        public static const OTHER_NUMBER:GeneralCategory = new GeneralCategory(10, 'No');
        public static const CONNECTOR_PUNCTUATION:GeneralCategory = new GeneralCategory(11, 'Pc');
        public static const DASH_PUNCTUATION:GeneralCategory = new GeneralCategory(12, 'Pd');
        public static const OPEN_PUNCTUATION:GeneralCategory = new GeneralCategory(13, 'Ps');
        public static const CLOSE_PUNCTUATION:GeneralCategory = new GeneralCategory(14, 'Pe');
        public static const INITIAL_QUOTE_PUNCTUATION:GeneralCategory = new GeneralCategory(15, 'Pi');
        public static const FINAL_QUOTE_PUNCTUATION:GeneralCategory = new GeneralCategory(16, 'Pf');
        public static const OTHER_PUNCTUATION:GeneralCategory = new GeneralCategory(17, 'Po');
        public static const MATH_SYMBOL:GeneralCategory = new GeneralCategory(18, 'Sm');
        public static const CURRENCY_SYMBOL:GeneralCategory = new GeneralCategory(19, 'Sc');
        public static const MODIFIER_SYMBOL:GeneralCategory = new GeneralCategory(20, 'Sk');
        public static const OTHER_SYMBOL:GeneralCategory = new GeneralCategory(21, 'So');
        public static const SPACE_SEPARATOR:GeneralCategory = new GeneralCategory(22, 'Zs');
        public static const LINE_SEPARATOR:GeneralCategory = new GeneralCategory(23, 'Zl');
        public static const PARAGRAPH_SEPARATOR:GeneralCategory = new GeneralCategory(24, 'Zp');
        public static const CONTROL_OTHER:GeneralCategory = new GeneralCategory(25, 'Cc');
        public static const FORMAT_OTHER:GeneralCategory = new GeneralCategory(26, 'Cf');
        public static const SURROGATE_OTHER:GeneralCategory = new GeneralCategory(27, 'Cs');
        public static const PRIVATE_USE_OTHER:GeneralCategory = new GeneralCategory(28, 'Co');
        public static const NOT_ASSIGNED_OTHER:GeneralCategory = new GeneralCategory(29, 'Cn');

        private var _v:int;
        private var _s:String;

        public function GeneralCategory(value:int, str:String) {
            this._v = value;
            this._s = str;
            GeneralCategory._valueOf[value] = this;
            GeneralCategory._fromString[str] = this;
        }

        public static function valueOf(value:int):GeneralCategory {
            return GeneralCategory._valueOf[value] || null;
        }

        public static function fromString(value:String):GeneralCategory {
            return GeneralCategory._fromString[value] || null;
        }

        public static function from(codePoint:int):GeneralCategory {
            var compareCodePoint:int = 0, count:int = 0, categoryValue:int = 0;
            if (codePoint < 0x10000) {
                basicPlane.position = 0;
                while (Infinity) {
                    if (basicPlane.position == basicPlane.length) break;
                    categoryValue = basicPlane.readUnsignedByte();
                    count = basicPlane.readUnsignedShort();
                    compareCodePoint += count;
                    if (codePoint < compareCodePoint)
                        return GeneralCategory.valueOf(categoryValue);
                }
            } else {
                compareCodePoint = 0x10000;
                supplementaryPlane.position = 0;
                while (Infinity) {
                    if (supplementaryPlane.position == supplementaryPlane.length) break;
                    categoryValue = supplementaryPlane.readUnsignedByte();
                    count = ByteArray_readUnsignedInt24(supplementaryPlane);
                    compareCodePoint += count;
                    if (codePoint < compareCodePoint)
                        return GeneralCategory.valueOf(categoryValue);
                }
            }
            return GeneralCategory.NOT_ASSIGNED_OTHER;
        }

        public function valueOf():int {
            return this._v;
        }

        public function toString():String {
            return this._s;
        }

        public function get isLetter():Boolean {
            return this._v >= 0 && this._v <= 4;
        }

        public function get isMark():Boolean {
            return this._v >= 5 && this._v <= 7;
        }

        public function get isNumber():Boolean {
            return this._v >= 8 && this._v <= 10;
        }

        public function  get isPunctuation():Boolean {
            return this._v >= 11 && this._v <= 17;
        }

        public function get isSymbol():Boolean {
            return this._v >= 18 && this._v <= 21;
        }

        public function get isSeparator():Boolean {
            return this._v >= 22 && this._v <= 24;
        }

        public function get isOther():Boolean {
            return this._v >= 25 && this._v <= 29;
        }

        private static function ByteArray_readUnsignedInt24(ba:ByteArray):int {
            return ba.readUnsignedShort() | (ba.readUnsignedByte() << 16);
        }
    }
}