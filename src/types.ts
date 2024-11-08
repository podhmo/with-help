/** for extract literal union
 * @internal */
export type ExtractLiteralUnion<T extends readonly string[]> = readonly [] extends T ? never : (string extends T[number] ? never : T[number]);
