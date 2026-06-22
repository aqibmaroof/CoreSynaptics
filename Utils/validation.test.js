import { describe, it, expect } from "vitest";
import {
  NAME_PATTERN,
  PERSON_NAME_PATTERN,
  MAX_EMAIL,
  MAX_NAME,
  validateEmail,
  validatePersonName,
  validateAccessWindow,
  required,
  requiredSelection,
  lengthBetween,
  numeric,
  validatePhone,
  dateOrder,
  notDuplicate,
  collectErrors,
} from "./validation.js";

function validateForm(form, isEdit) {
  const errors = {};
  if (!isEdit) {
    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;
    if (!form.roleId) errors.roleId = "Please select a role.";
  }
  const firstErr = validatePersonName(form.firstName, "First name", NAME_PATTERN);
  if (firstErr) errors.firstName = firstErr;
  const lastErr = validatePersonName(form.lastName, "Last name", NAME_PATTERN);
  if (lastErr) errors.lastName = lastErr;
  return errors;
}

describe("validateEmail (TC_USER_014/015)", () => {
  it("accepts a valid email", () => {
    expect(validateEmail("jane.doe@company.com")).toBe("");
  });
  it("rejects empty / malformed / spaced", () => {
    expect(validateEmail("")).toMatch(/required/i);
    expect(validateEmail("not-an-email")).toMatch(/valid email/i);
    expect(validateEmail("jane doe@company.com")).toMatch(/space/i);
  });
  it("rejects an email over the max length (TC_USER_015)", () => {
    expect(validateEmail("a".repeat(MAX_EMAIL) + "@x.com")).toMatch(new RegExp(String(MAX_EMAIL)));
  });
});

describe("validatePersonName — user names (NAME_PATTERN)", () => {
  it("accepts letters, spaces, hyphens, apostrophes", () => {
    for (const n of ["Jane", "O'Brien", "Jean-Luc", "Mary Jane"]) {
      expect(validatePersonName(n, "First name", NAME_PATTERN)).toBe("");
    }
  });
  it("rejects digits and special characters", () => {
    expect(validatePersonName("Jane123", "First name", NAME_PATTERN)).toMatch(/only contain letters/i);
    expect(validatePersonName("Jane@", "First name", NAME_PATTERN)).toMatch(/only contain letters/i);
  });
  it("rejects empty and over-length", () => {
    expect(validatePersonName("", "First name", NAME_PATTERN)).toMatch(/required/i);
    expect(validatePersonName("A".repeat(MAX_NAME + 1), "First name", NAME_PATTERN)).toMatch(new RegExp(String(MAX_NAME)));
  });
});

describe("validatePersonName — TARF person names (TARF-009/010)", () => {
  it("accepts a name with a period", () => {
    expect(validatePersonName("James T. Holbrook", "Person name", PERSON_NAME_PATTERN)).toBe("");
  });
  it("rejects numeric-only and special chars", () => {
    expect(validatePersonName("12345", "Person name", PERSON_NAME_PATTERN)).toMatch(/only contain letters/i);
    expect(validatePersonName("John <x>", "Person name", PERSON_NAME_PATTERN)).toMatch(/only contain letters/i);
  });
});

describe("validateAccessWindow (TARF-027 / TARF-028)", () => {
  it("rejects end before start", () => {
    expect(validateAccessWindow("2026-05-15", "2026-05-01")).toMatch(/on or after/i);
  });
  it("accepts single-day and forward windows", () => {
    expect(validateAccessWindow("2026-05-10", "2026-05-10")).toBe("");
    expect(validateAccessWindow("2026-05-01", "2026-05-15")).toBe("");
  });
});

describe("validateForm (Users Add)", () => {
  const base = { email: "jane@company.com", firstName: "Jane", lastName: "Doe", roleId: "role-1" };
  it("passes a valid create form", () => {
    expect(validateForm(base, false)).toEqual({});
  });
  it("flags bad email + missing role on create", () => {
    const errs = validateForm({ ...base, email: "bad", roleId: "" }, false);
    expect(errs.email).toBeTruthy();
    expect(errs.roleId).toBeTruthy();
  });
  it("skips email/role in edit mode but validates names", () => {
    const errs = validateForm({ ...base, email: "", roleId: "", firstName: "J4ne" }, true);
    expect(errs.email).toBeUndefined();
    expect(errs.roleId).toBeUndefined();
    expect(errs.firstName).toBeTruthy();
  });
});

describe("required / requiredSelection", () => {
  it("flags empty/whitespace/undefined/empty-array", () => {
    expect(required("", "Project Name")).toMatch(/required/i);
    expect(required("   ", "Project Name")).toMatch(/required/i);
    expect(required(undefined, "Owner")).toMatch(/required/i);
    expect(required([], "Voltage")).toMatch(/required/i);
  });
  it("passes non-empty", () => {
    expect(required("DFW39", "Project Name")).toBe("");
  });
  it("requiredSelection flags empty multi-select", () => {
    expect(requiredSelection([], "Voltage class")).toMatch(/must be selected/i);
    expect(requiredSelection(["480/277V"], "Voltage class")).toBe("");
  });
});

describe("lengthBetween", () => {
  it("flags too short and too long", () => {
    expect(lengthBetween("a", { min: 2, label: "Name" })).toMatch(/at least 2/i);
    expect(lengthBetween("abcdef", { max: 3, label: "Code" })).toMatch(/exceed 3/i);
  });
  it("passes in range", () => {
    expect(lengthBetween("abc", { min: 1, max: 5 })).toBe("");
  });
});

describe("numeric (ORP-FAC reject alphabets/special)", () => {
  it("rejects alphabets, special chars, empty", () => {
    expect(numeric("12a", { label: "Capacity" })).toMatch(/must be a number/i);
    expect(numeric("12$", { label: "PUE" })).toMatch(/must be a number/i);
    expect(numeric("", { label: "Capacity" })).toMatch(/required/i);
  });
  it("accepts int/decimal, enforces whole + min/max", () => {
    expect(numeric("48", { label: "Capacity" })).toBe("");
    expect(numeric("1.25", { label: "PUE" })).toBe("");
    expect(numeric("1.5", { label: "Halls", allowDecimal: false })).toMatch(/whole number/i);
    expect(numeric("0", { label: "Capacity", min: 1 })).toMatch(/at least 1/i);
  });
});

describe("validatePhone (TC_STK_006)", () => {
  it("rejects junk, flags empty, accepts real", () => {
    expect(validatePhone("abc", "Phone number")).toMatch(/valid/i);
    expect(validatePhone("", "Phone number")).toMatch(/required/i);
    expect(validatePhone("+1 (469) 555-0123", "Phone number")).toBe("");
  });
});

describe("dateOrder (TC_014 / generic)", () => {
  it("rejects end before start; allows/forbids same-day per flag", () => {
    expect(dateOrder("2026-05-10", "2026-05-01", { label: "Expiry date" })).toMatch(/on or after/i);
    expect(dateOrder("2026-05-10", "2026-05-10")).toBe("");
    expect(dateOrder("2026-05-10", "2026-05-10", { allowSameDay: false })).toMatch(/after the start/i);
  });
});

describe("notDuplicate (TC_017 / TC_STK_008)", () => {
  it("flags case-insensitive duplicate, passes unique", () => {
    expect(notDuplicate("OSHA 30", ["osha 30", "First Aid"], "Certification")).toMatch(/already exists/i);
    expect(notDuplicate("CPR", ["OSHA 30"], "Certification")).toBe("");
  });
});

describe("collectErrors", () => {
  it("keeps only non-empty errors", () => {
    expect(collectErrors({ a: "bad", b: "", c: "nope" })).toEqual({ a: "bad", c: "nope" });
  });
});
