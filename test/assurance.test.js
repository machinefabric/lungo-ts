// The assurance document reader: it accepts the document lungo writes and refuses any other.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAssurance } from "../index.js";

const source = () => ({ package: "p", file: "P.lean", start: { line: 1, column: 1 }, end: null });
const document = () => ({
  schema_version: 1,
  program: "p",
  provenance: { lean_version: "4.34.1", lean_githash: "x", lungo_version: "1", bir_version: 3, runtime_abi: 2 },
  library: { package: "lungo", schema_version: 1 },
  specifications: [
    { name: "P.spec", kind: "lungo.model", statement: "Nat → Nat", definition: "fun n => n", package: "p", fingerprint: "f", source: source() },
  ],
  facilities: [],
  assumptions: [],
  claims: [
    {
      name: "P.ok",
      relation: "lungo.equals",
      subjects: ["P.f"],
      specifications: ["P.spec"],
      statement: "∀ n, P.f n = P.spec n",
      status: "proved",
      evidence_trust: { axioms: [], depends_on_sorry: false },
      assumptions: [],
      package: "p",
      fingerprint: "g",
      source: null,
    },
  ],
  roles: [],
  exports: [],
});

// TEST0346: the assurance reader refuses a document of another shape
test("TEST0346 the assurance reader refuses a document of another shape", () => {
  const a = parseAssurance(JSON.stringify(document()));
  assert.equal(a.claims[0].specifications[0], "P.spec");
  assert.ok(Object.isFrozen(a.specifications[0]));
  const changed = (edit) => {
    const d = document();
    edit(d);
    return () => parseAssurance(d);
  };
  assert.throws(changed((d) => (d.claims[0].extra = 1)), /claims\[0\] has the field extra/);
  assert.throws(changed((d) => delete d.specifications[0].definition), /specifications\[0\] lacks the field definition/);
  assert.throws(changed((d) => (d.claims[0].evidence_trust.depends_on_sorry = "no")), /depends_on_sorry is not a boolean/);
  assert.throws(changed((d) => (d.specifications[0].source.start.line = "1")), /start\.line is not a number/);
  assert.throws(changed((d) => (d.roles = {})), /roles is not an array/);
  assert.throws(changed((d) => (d.schema_version = 2)), /schema version 2/);
});
