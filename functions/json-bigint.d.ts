/**
 * The package doesn't ship with a type definition.
 * We will add the types of the functions we use here.
 */

declare module 'json-bigint' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parse: (jsonString: string) => any;
}
