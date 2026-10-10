/** An `IO.Error` of Lean: thrown by a Lean function, or by a host function to fail an `IO` extern. */
export class LeanIOError extends Error {
  constructor(message: string);
}

/** The error value of an `EIO ε` function; a host function of an `EIO ε` extern throws it. */
export class LeanError<E = unknown> extends Error {
  constructor(value: E);
  readonly value: E;
}

/** Arguments Lean cannot represent (a negative Nat, a number out of range, a closed value). */
export class MalformedError extends Error {}

export class Writer {
  constructor(program?: Program | null, result?: boolean);
  u8(v: number): void;
  u16(v: number): void;
  u32(v: number): void;
  u64(v: bigint): void;
  f64(v: number): void;
  f32(v: number): void;
  raw(bytes: Uint8Array): void;
  blob(bytes: Uint8Array): void;
  finish(): Uint8Array;
}

export class Reader {
  constructor(bytes: Uint8Array, program?: Program | null);
  u8(): number;
  u16(): number;
  u32(): number;
  u64(): bigint;
  f64(): number;
  f32(): number;
  count(unit?: number): number;
  blob(): Uint8Array;
  text(): string;
  finish(): void;
}

/** How JavaScript values of `T` cross the boundary as values of a Lean type. */
export class Type<T> {
  constructor(
    expr: Uint8Array,
    encode: (w: Writer, v: T) => void,
    decode: (r: Reader) => T,
    canBeNull?: boolean,
  );
  readonly expr: Uint8Array;
  readonly canBeNull: boolean;
  encode(w: Writer, v: T): void;
  decode(r: Reader): T;
}

export const MAX_FUNCTION_PARAMS: 15;

export const NAT: Type<bigint>;
export const INT: Type<bigint>;
export const BOOL: Type<boolean>;
export const UINT8: Type<number>;
export const UINT16: Type<number>;
export const UINT32: Type<number>;
export const UINT64: Type<bigint>;
export const USIZE: Type<bigint>;
export const INT8: Type<number>;
export const INT16: Type<number>;
export const INT32: Type<number>;
export const INT64: Type<bigint>;
export const ISIZE: Type<bigint>;
export const FLOAT: Type<number>;
export const FLOAT32: Type<number>;
/** `Char`: a string of one Unicode scalar value. */
export const CHAR: Type<string>;
export const STRING: Type<string>;
/** `Unit`, as `null`. */
export const UNIT: Type<null>;
export const BYTE_ARRAY: Type<Uint8Array>;
export const FLOAT_ARRAY: Type<number[]>;

/** A Lean value JavaScript does not represent, held by handle until closed or collected. */
export class Opaque {
  /** Releases the value. */
  close(): void;
}
export const OPAQUE: Type<Opaque>;

/** `some value` of an `Option` whose values can be `null` themselves. */
export class Some<T> {
  constructor(value: T);
  readonly value: T;
}

/** The JavaScript value of `Option α`: `null` or the value (`Some` when the value can be `null`). */
export type Option<T> = null | (null extends T ? Some<T> : T);

export function option<T>(t: Type<T>): Type<Option<T>>;
export function list<T>(t: Type<T>): Type<T[]>;
export function array<T>(t: Type<T>): Type<T[]>;
export function pair<A, B>(a: Type<A>, b: Type<B>): Type<[A, B]>;

/** `Except ε α`. */
export type Except<E, A> = { ok: true; value: A } | { ok: false; error: E };
export function except<E, A>(e: Type<E>, a: Type<A>): Type<Except<E, A>>;

export function inductiveExpr(index: number, ...args: Uint8Array[]): Uint8Array;

/** The type of Lean functions from `params` to `result`, as JavaScript functions. */
export function func<P extends unknown[], R>(
  params: { [K in keyof P]: Type<P[K]> },
  result: Type<R>,
): Type<(...args: P) => R>;

export interface Returns<T> {
  readonly kind: "value" | "io" | "eio" | "async";
}
export function value<T>(t: Type<T>): Returns<T>;
export function io<T>(t: Type<T>): Returns<T>;
export function eio<E, T>(e: Type<E>, t: Type<T>): Returns<T>;
/** An async program over the operations `op`, ending with a value of `t`. */
export function asyncProgram<O, T>(op: Type<O>, t: Type<T>): Returns<T>;

/** A call before the host provided a facility the program needs. */
export class MissingFacilityError extends Error {
  constructor(facility: string, operation: string);
  readonly facility: string;
  readonly operation: string;
}

/** Where a declaration is, relative to its Lake package. */
export interface AssuranceSource {
  readonly package: string;
  readonly file: string;
  readonly start: { readonly line: number; readonly column: number } | null;
  readonly end: { readonly line: number; readonly column: number } | null;
}

/** The code an export's proofs do not cover. */
export interface AssuranceTrust {
  readonly axioms: readonly string[];
  readonly depends_on_sorry: boolean;
  readonly unsafe_dependencies: readonly string[];
  readonly partial_dependencies: readonly string[];
  readonly extern_dependencies: readonly string[];
}

/** A theorem (its name is the claim's) proving that its subjects stand in a relation to its
 * specifications. */
export interface AssuranceClaim {
  readonly name: string;
  readonly relation: string;
  readonly subjects: readonly string[];
  readonly specifications: readonly string[];
  readonly statement: string;
  readonly status: "proved" | "incomplete";
  readonly evidence_trust: { readonly axioms: readonly string[]; readonly depends_on_sorry: boolean };
  /** What the claim assumes of the host, unproved. */
  readonly assumptions: readonly string[];
  readonly package: string | null;
  readonly fingerprint: string;
  readonly source: AssuranceSource | null;
}

/** A specification the program's claims cite. */
export interface AssuranceSpecification {
  readonly name: string;
  readonly kind: string;
  readonly statement: string;
  /** The body, as Lean prints it, when the declaration is a definition. */
  readonly definition: string | null;
  readonly package: string | null;
  readonly fingerprint: string;
  readonly source: AssuranceSource | null;
}

/** A facility the host provides. */
export interface AssuranceFacility {
  readonly name: string;
  readonly id: string;
  readonly form: "extern" | "async";
  readonly op_type: string | null;
  readonly operations: readonly { readonly name: string; readonly symbol: string | null; readonly fingerprint: string | null }[];
  readonly assumptions: readonly string[];
  readonly package: string | null;
  readonly fingerprint: string;
  readonly source: AssuranceSource | null;
}

/** A proposition assumed, never proved, of the host's implementation of a facility. */
export interface AssuranceAssumption {
  readonly name: string;
  readonly facility: string;
  readonly statement: string;
  /** The body, as Lean prints it, when the declaration is a definition. */
  readonly definition: string | null;
  readonly package: string | null;
  readonly fingerprint: string;
  readonly source: AssuranceSource | null;
}

/** What one export is, does and depends on. */
export interface AssuranceExport {
  readonly name: string;
  readonly module: string;
  readonly async: boolean;
  readonly trust: AssuranceTrust;
  readonly claims: readonly string[];
  readonly assumptions: readonly string[];
  readonly facilities: readonly string[];
  readonly roles: readonly string[];
  readonly source: AssuranceSource | null;
}

/** A program's assurance document (`assurance.json`). */
export interface Assurance {
  readonly schema_version: 1;
  readonly program: string;
  readonly provenance: {
    readonly lean_version: string;
    readonly lean_githash: string;
    readonly lungo_version: string;
    readonly bir_version: number;
    readonly runtime_abi: number;
  };
  readonly library: { readonly package: string; readonly schema_version: number } | null;
  readonly specifications: readonly AssuranceSpecification[];
  readonly facilities: readonly AssuranceFacility[];
  readonly assumptions: readonly AssuranceAssumption[];
  readonly claims: readonly AssuranceClaim[];
  readonly roles: readonly { readonly name: string; readonly role: string; readonly exported: boolean }[];
  readonly exports: readonly AssuranceExport[];
}

export const ASSURANCE_SCHEMA_VERSION: 1;
/** Checks an assurance document against its schema (every field, of its type, and no other)
 * and freezes it. */
export function parseAssurance(document: string | object): Assurance;

/** A WASI implementation for a program module. */
export interface Wasi {
  readonly wasiImport: WebAssembly.ModuleImports;
  initialize(instance: WebAssembly.Instance): void;
}

/** A generated program: its WebAssembly module instance. */
export class Program {
  static load(module: WebAssembly.Module | BufferSource, options?: { wasi?: Wasi }): Promise<Program>;
  types(symbol: string): number;
  invoke<T>(symbol: string, typeArgs: Type<unknown>[], args: [Type<any>, unknown][], returns: Returns<T>): T;
  driveAsync<T>(
    symbol: string,
    typeArgs: Type<unknown>[],
    args: [Type<any>, unknown][],
    returns: Returns<T>,
    perform: (op: any) => [Type<any>, unknown],
    signal?: AbortSignal,
  ): Promise<T>;
  /** The number of async programs waiting for an answer. */
  outstanding(): number;
  hostExtern(setSymbol: string, index: number, params: Type<any>[], returns: Returns<any>, f: (...args: any[]) => unknown): void;
  runMain(symbol: string, args: string[]): number;
}
