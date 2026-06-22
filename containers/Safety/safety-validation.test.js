import { describe, it, expect } from "vitest";
import {
  required,
  validatePersonName,
  lengthBetween,
  dateOrder,
  notDuplicate,
  collectErrors,
  NAME_PATTERN,
} from "../../Utils/validation.js";

// Mirrors Safety's validateSafety() (TC_007..TC_043).
function validateSafety(form, items = [], tab = "CERTIFICATION") {
  const errs = collectErrors({
    projectId: required(form.projectId, "Project"),
    name: required(form.name, "Certification") || lengthBetween(form.name, { max: 120, label: "Certification" }),
    worker: required(form.worker, "Worker name") || validatePersonName(form.worker, "Worker name", NAME_PATTERN),
    company: required(form.company, "Company / trade"),
    issued: required(form.issued, "Issued date"),
    expires: required(form.expires, "Expiry date") || dateOrder(form.issued, form.expires, { label: "Expiry date" }),
  });
  if (!errs.name && !errs.worker) {
    const existing = items
      .filter((i) => i.category === tab && (i.worker || "").trim().toLowerCase() === form.worker.trim().toLowerCase())
      .map((i) => i.name);
    const dup = notDuplicate(form.name, existing, "Certification");
    if (dup) errs.name = dup;
  }
  return errs;
}

const valid = {
  projectId: "p1", name: "OSHA 30", worker: "Jane Doe",
  company: "Acme Electric", issued: "2026-01-01", expires: "2027-01-01",
};

describe("Safety certification add validation (TC_007..TC_043)", () => {
  it("passes a valid record", () => {
    expect(validateSafety(valid)).toEqual({});
  });
  it("flags every required field when empty (TC_007..TC_012)", () => {
    const errs = validateSafety({ projectId: "", name: "", worker: "", company: "", issued: "", expires: "" });
    for (const k of ["projectId", "name", "worker", "company", "issued", "expires"]) {
      expect(errs[k], k).toMatch(/required/i);
    }
  });
  it("rejects numbers/special chars in worker name (TC_020/021)", () => {
    expect(validateSafety({ ...valid, worker: "Jane2" }).worker).toMatch(/only contain letters/i);
    expect(validateSafety({ ...valid, worker: "Jane@" }).worker).toMatch(/only contain letters/i);
  });
  it("rejects expiry before issued (TC_014)", () => {
    expect(validateSafety({ ...valid, issued: "2027-01-01", expires: "2026-01-01" }).expires).toMatch(/on or after/i);
  });
  it("rejects a certification over the max length (TC_019)", () => {
    expect(validateSafety({ ...valid, name: "x".repeat(121) }).name).toMatch(/exceed 120/i);
  });
  it("flags a duplicate certification for the same worker (TC_017)", () => {
    const items = [{ category: "CERTIFICATION", worker: "Jane Doe", name: "OSHA 30" }];
    expect(validateSafety(valid, items, "CERTIFICATION").name).toMatch(/already exists/i);
  });
  it("does not flag the same cert for a different worker", () => {
    const items = [{ category: "CERTIFICATION", worker: "Other Person", name: "OSHA 30" }];
    expect(validateSafety(valid, items, "CERTIFICATION").name).toBeUndefined();
  });
});
