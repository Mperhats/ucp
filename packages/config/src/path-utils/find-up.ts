import { existsSync } from "node:fs";
import { resolve } from "node:path";

export function findUp(options: findUp.Options): findUp.ReturnType {
  const { marker, from, maxDepth = 128 } = options;
  let current = resolve(from);

  for (let depth = 0; depth <= maxDepth; depth++) {
    if (existsSync(resolve(current, marker))) return current;

    const parent = resolve(current, "..");
    if (parent === current) break;
    current = parent;
  }

  return null;
}

export namespace findUp {
  export interface Options {
    marker: string;
    from: string;
    maxDepth?: number;
  }

  export type ReturnType = string | null;
}
