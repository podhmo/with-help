// for enfoce as-const assertion
export type EnsureLiteralArray<T> = T extends ReadonlyArray<string> ? string[] extends T // if T is not a literal type, return never[]
    ? never[]
  : T
  : never;

// for extract literal union
export type ExtractLiteralUnion<T extends readonly string[]> = readonly [] extends T ? never : (string extends T[number] ? never : T[number]);
