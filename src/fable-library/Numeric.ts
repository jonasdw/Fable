import { IComparable } from "./Util.js";

export const symbol = Symbol("numeric");

export interface CustomNumeric extends IComparable<Numeric> {
    [symbol](): {
        multiply(y: Numeric): Numeric,
        toPrecision(sd?: number): string,
        toExponential(dp?: number): string,
        toFixed(dp?: number): string,
        toHex(): string,
    }
}

export type Numeric = number | CustomNumeric;

export function isNumeric(x: any) {
    return typeof x === "number" || x?.[symbol];
}

export function compare(x: Numeric, y: Numeric) {
    if (typeof x === "number") {
        return x < y ? -1 : (x > y ? 1 : 0);
    } else {
        return x.CompareTo(y);
    }
}

export function multiply(x: Numeric, y: number) {
    if (typeof x === "number") {
        return x * y;
    } else {
        return x[symbol]().multiply(y);
    }
}

export function toFixed(x: Numeric, dp?: number) {
    if (typeof x === "number") {
        return x.toFixed(dp);
    } else {
        return x[symbol]().toFixed(dp);
    }
}

export function toPrecision(x: Numeric, sd?: number) {
    if (typeof x === "number") {
        return x.toPrecision(sd);
    } else {
        return x[symbol]().toPrecision(sd);
    }
}

export function toExponential(x: Numeric, dp?: number) {
    if (typeof x === "number") {
        return x.toExponential(dp);
    } else {
        return x[symbol]().toExponential(dp);
    }
}

export function toHex(x: Numeric) {
    if (typeof x === "number") {
        return (Number(x) >>> 0).toString(16);
    } else {
        return x[symbol]().toHex();
    }
}