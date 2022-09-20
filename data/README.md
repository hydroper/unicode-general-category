# Data generator

Update `input-basic.txt` and `input-supplementary` conforming to `UnicodeData.txt` from https://unicode.org/Public. For example, https://unicode.org/Public/15.0.0/ucd.

Run `node generate.js` and it will output the following files at this directory:

- `bin/basic.bin`
  - Consists of multiple `{category:Byte, count:Short}` little-endian sequences.
- `bin/supplementary.bin`
  - Consists of multiple `{category:Byte, count:Int24}` little-endian sequences.
- **UNIMPLEMENTED:** `bin/basic-skip-points.txt`
  - Consists of new-line separated `codePointHex = zeroBasedOffset` sequences.