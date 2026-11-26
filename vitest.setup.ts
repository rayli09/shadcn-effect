// The upstream Effect-TS/ui setup file: registers effect's equality testers
// so vitest's equality checks understand Schema / Equal values.
import { addEqualityTesters } from "@effect/vitest";

addEqualityTesters();
