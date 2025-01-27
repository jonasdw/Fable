import { FSharpRef } from "./Types.js";

export type int8 = number;
export type uint8 = number;
export type int16 = number;
export type uint16 = number;
export type int32 = number;
export type uint32 = number;
// export type int64 = Long;
// export type uint64 = Long;
export type float32 = number;
export type float64 = number;
// export type decimal = Decimal;

export enum NumberStyles {
  // None = 0x00000000,
  // AllowLeadingWhite = 0x00000001,
  // AllowTrailingWhite = 0x00000002,
  // AllowLeadingSign = 0x00000004,
  // AllowTrailingSign = 0x00000008,
  // AllowParentheses = 0x00000010,
  // AllowDecimalPoint = 0x00000020,
  // AllowThousands = 0x00000040,
  // AllowExponent = 0x00000080,
  // AllowCurrencySymbol = 0x00000100,
  AllowHexSpecifier = 0x00000200,

  // Integer = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign,
  // HexNumber = AllowLeadingWhite | AllowTrailingWhite | AllowHexSpecifier,
  // Number = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign |
  //          AllowTrailingSign | AllowDecimalPoint | AllowThousands,
  // Float = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign |
  //         AllowDecimalPoint | AllowExponent,
  // Currency = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign | AllowTrailingSign |
  //            AllowParentheses | AllowDecimalPoint | AllowThousands | AllowCurrencySymbol,
  // Any = AllowLeadingWhite | AllowTrailingWhite | AllowLeadingSign | AllowTrailingSign |
  //       AllowParentheses | AllowDecimalPoint | AllowThousands | AllowCurrencySymbol | AllowExponent,
}

function validResponse(regexMatch: RegExpExecArray, radix: number) {
  const [/*all*/, sign, prefix, digits] = regexMatch;
  return {
    sign: sign || "",
    prefix: prefix || "",
    digits,
    radix,
  };
}

function getRange(unsigned: boolean, bitsize: number): [number, number] {
  switch (bitsize) {
    case 8: return unsigned ? [0, 255] : [-128, 127];
    case 16: return unsigned ? [0, 65535] : [-32768, 32767];
    case 32: return unsigned ? [0, 4294967295] : [-2147483648, 2147483647];
    default: throw new Error("Invalid bit size.");
  }
}

function getInvalidDigits(radix: number): RegExp {
  switch (radix) {
    case 2: return /[^0-1]/;
    case 8: return /[^0-7]/;
    case 10: return /[^0-9]/;
    case 16: return /[^0-9a-fA-F]/;
    default:
      throw new Error("Invalid Base.");
  }
}

function getRadix(prefix: string, style: number) {
  if (style & NumberStyles.AllowHexSpecifier) {
    return 16;
  } else {
    switch (prefix) {
      case "0b": case "0B": return 2;
      case "0o": case "0O": return 8;
      case "0x": case "0X": return 16;
      default: return 10;
    }
  }
}

export function isValid(str: string, style: number, radix?: number) {
  const integerRegex = /^\s*([\+\-])?(0[xXoObB])?([0-9a-fA-F]+)\s*$/;
  const res = integerRegex.exec(str.replace(/_/g, ""));
  if (res != null) {
    const [/*all*/, /*sign*/, prefix, digits] = res;
    radix = radix || getRadix(prefix, style);
    const invalidDigits = getInvalidDigits(radix);
    if (!invalidDigits.test(digits)) {
      return validResponse(res, radix);
    }
  }
  return null;
}

export function parse(str: string, style: number, unsigned: boolean, bitsize: number, radix?: number): number {
  const res = isValid(str, style, radix);
  if (res != null) {
    let v = Number.parseInt(res.sign + res.digits, res.radix);
    if (!Number.isNaN(v)) {
      const [umin, umax] = getRange(true, bitsize);
      if (!unsigned && res.radix !== 10 && v >= umin && v <= umax) {
        v = v << (32 - bitsize) >> (32 - bitsize);
      }
      const [min, max] = getRange(unsigned, bitsize);
      if (v >= min && v <= max) {
        return v;
      }
    }
  }
  throw new Error("Input string was not in a correct format.");
}

export function tryParse(str: string, style: number, unsigned: boolean, bitsize: number, defValue: FSharpRef<number>): boolean {
  try {
    defValue.contents = parse(str, style, unsigned, bitsize);
    return true;
  } catch {
    return false;
  }
}

export function op_UnaryNegation_Int8(x: number) {
  return x === -128 ? x : -x;
}

export function op_UnaryNegation_Int16(x: number) {
  return x === -32768 ? x : -x;
}

export function op_UnaryNegation_Int32(x: number) {
  return x === -2147483648 ? x : -x;
}

export function divRem(x: number, y: number): [number, number];
export function divRem(x: number, y: number, out: FSharpRef<number>): number;
export function divRem(x: number, y: number, out?: FSharpRef<number>): number | [number, number] {
  const div = ~~(x / y);
  const rem = x % y;
  if (out === void 0) {
    return [div, rem];
  } else {
    out.contents = rem;
    return div;
  }
}
