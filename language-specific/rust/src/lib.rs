#![allow(unused_assignments)]

use bytes::{Bytes, Buf};
use num_enum::TryFromPrimitive;

static BASIC_PLANE: &'static [u8] = include_bytes!("./data/basic.bin");
static SUPPLEMENTARY_PLANE: &'static [u8] = include_bytes!("./data/supplementary.bin");

#[derive(Copy, Clone, PartialEq, TryFromPrimitive)]
#[repr(u8)]
pub enum GeneralCategory {
    UppercaseLetter = 0,
    LowercaseLetter = 1,
    TitlecaseLetter = 2,
    ModifierLetter = 3,
    OtherLetter = 4,
    NonspacingMark = 5,
    SpacingCombiningMark = 6,
    EnclosingMark = 7,
    DecimalDigitNumber = 8,
    LetterNumber = 9,
    OtherNumber = 10,
    ConnectorPunctuation = 11,
    DashPunctuation = 12,
    OpenPunctuation = 13,
    ClosePunctuation = 14,
    InitialQuotePunctuation = 15,
    FinalQuotePunctuation = 16,
    OtherPunctuation = 17,
    MathSymbol = 18,
    CurrencySymbol = 19,
    ModifierSymbol = 20,
    OtherSymbol = 21,
    SpaceSeparator = 22,
    LineSeparator = 23,
    ParagraphSeparator = 24,
    ControlOther = 25,
    FormatOther = 26,
    SurrogateOther = 27,
    PrivateUseOther = 28,
    NotAssignedOther = 29,
}

impl GeneralCategory {
    pub fn is_letter(self) -> bool {
        self as u8 <= 4
    }
    pub fn is_mark(self) -> bool {
        self as u8 >= 5 && self as u8 <= 7
    }
    pub fn is_number(self) -> bool {
        self as u8 >= 8 && self as u8 <= 10
    }
    pub fn is_punctuation(self) -> bool {
        self as u8 >= 11 && self as u8 <= 17
    }
    pub fn is_symbol(self) -> bool {
        self as u8 >= 18 && self as u8 <= 21
    }
    pub fn is_separator(self) -> bool {
        self as u8 >= 22 && self as u8 <= 24
    }
    pub fn is_other(self) -> bool {
        self as u8 >= 25 && self as u8 <= 29
    }
}

impl<'a> TryFrom<&'a str> for GeneralCategory {
    type Error = ();
    fn try_from(value: &'a str) -> Result<Self, Self::Error> {
        use GeneralCategory as C;
        (match value {
            "Lu" => Ok(C::UppercaseLetter),
            "Ll" => Ok(C::LowercaseLetter),
            "Lt" => Ok(C::TitlecaseLetter),
            "Lm" => Ok(C::ModifierLetter),
            "Lo" => Ok(C::OtherLetter),
            "Mn" => Ok(C::NonspacingMark),
            "Mc" => Ok(C::SpacingCombiningMark),
            "Me" => Ok(C::EnclosingMark),
            "Nd" => Ok(C::DecimalDigitNumber),
            "Nl" => Ok(C::LetterNumber),
            "No" => Ok(C::OtherNumber),
            "Pc" => Ok(C::ConnectorPunctuation),
            "Pd" => Ok(C::DashPunctuation),
            "Ps" => Ok(C::OpenPunctuation),
            "Pe" => Ok(C::ClosePunctuation),
            "Pi" => Ok(C::InitialQuotePunctuation),
            "Pf" => Ok(C::FinalQuotePunctuation),
            "Po" => Ok(C::OtherPunctuation),
            "Sm" => Ok(C::MathSymbol),
            "Sc" => Ok(C::CurrencySymbol),
            "Sk" => Ok(C::ModifierSymbol),
            "So" => Ok(C::OtherSymbol),
            "Zs" => Ok(C::SpaceSeparator),
            "Zl" => Ok(C::LineSeparator),
            "Zp" => Ok(C::ParagraphSeparator),
            "Cc" => Ok(C::ControlOther),
            "Cf" => Ok(C::FormatOther),
            "Cs" => Ok(C::SurrogateOther),
            "Co" => Ok(C::PrivateUseOther),
            "Cn" => Ok(C::NotAssignedOther),
            _ => Err(()),
        }).to_owned()
    }
}

impl ToString for GeneralCategory {
    fn to_string(&self) -> String {
        use GeneralCategory as C;
        (match self {
            C::UppercaseLetter => "Lu",
            C::LowercaseLetter => "Ll",
            C::TitlecaseLetter => "Lt",
            C::ModifierLetter => "Lm",
            C::OtherLetter => "Lo",
            C::NonspacingMark => "Mn",
            C::SpacingCombiningMark => "Mc",
            C::EnclosingMark => "Me",
            C::DecimalDigitNumber => "Nd",
            C::LetterNumber => "Nl",
            C::OtherNumber => "No",
            C::ConnectorPunctuation => "Pc",
            C::DashPunctuation => "Pd",
            C::OpenPunctuation => "Ps",
            C::ClosePunctuation => "Pe",
            C::InitialQuotePunctuation => "Pi",
            C::FinalQuotePunctuation => "Pf",
            C::OtherPunctuation => "Po",
            C::MathSymbol => "Sm",
            C::CurrencySymbol => "Sc",
            C::ModifierSymbol => "Sk",
            C::OtherSymbol => "So",
            C::SpaceSeparator => "Zs",
            C::LineSeparator => "Zl",
            C::ParagraphSeparator => "Zp",
            C::ControlOther => "Cc",
            C::FormatOther => "Cf",
            C::SurrogateOther => "Cs",
            C::PrivateUseOther => "Co",
            C::NotAssignedOther => "Cn",
        }).to_owned()
    }
}

impl From<char> for GeneralCategory {
    fn from(code_point: char) -> Self {
        let code_point = code_point as usize;
        let mut compare_code_point: usize = 0;
        let mut count: usize = 0;
        let mut category_value: u8 = 0;
        if code_point < 0x10000 {
            let mut plane = Bytes::from_static(BASIC_PLANE);
            loop {
                if !plane.has_remaining() {
                    break;
                }
                category_value = plane.get_u8();
                count = plane.get_u16_le() as usize;
                compare_code_point += count;
                if code_point < compare_code_point {
                    return GeneralCategory::try_from(category_value).unwrap();
                }
            }
        } else {
            let mut plane = Bytes::from_static(SUPPLEMENTARY_PLANE);
            loop {
                if !plane.has_remaining() {
                    break;
                }
                category_value = plane.get_u8();
                count = bytes_get_u24_le(&mut plane);
                compare_code_point += count;
                if code_point < compare_code_point {
                    return GeneralCategory::try_from(category_value).unwrap();
                }
            }
        }
        GeneralCategory::NotAssignedOther
    }
}

fn bytes_get_u24_le(bytes: &mut Bytes) -> usize {
    (bytes.get_u16_le() as usize) | ((bytes.get_u8() as usize) << 16)
}