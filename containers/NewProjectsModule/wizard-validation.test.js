import { describe, it, expect } from "vitest";
import {
  required,
  requiredSelection,
  numeric,
  collectErrors,
  validateEmail,
  validatePhone,
  validatePersonName,
  NAME_PATTERN,
  lengthBetween,
  dateOrder,
  notDuplicate,
} from "../../Utils/validation.js";

const ALLOWED_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "dwg"];
function validateDocFile(name, sizeBytes) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return "Unsupported file type.";
  if (sizeBytes > 25 * 1024 * 1024) return "File exceeds 25 MB.";
  return "";
}

function sanitizeQty(val) {
  let v = String(val).replace(/[^\d]/g, "");
  if (v === "" || Number(v) < 1) v = v === "" ? "" : "1";
  return v;
}

const IDENTITY_KEYS = [
  ["projectName", "Project Name"], ["projectCode", "Project Code"], ["owner", "Owner / Customer"],
  ["location", "Location"], ["gc", "General Contractor"], ["ec", "Electrical Contractor (EC)"],
  ["mc", "Mechanical Contractor (MC)"], ["bms", "Controls / BMS Contractor"],
  ["fire", "Fire / Life-Safety Contractor"], ["neta", "Testing Agency (NETA)"], ["cxa", "Commissioning Agent (CXA)"],
];
function validateIdentity(identity) {
  return collectErrors(Object.fromEntries(IDENTITY_KEYS.map(([k, label]) => [k, required(identity[k], label)])));
}
function validateFacility(f) {
  return collectErrors({
    criticalCapacity: numeric(f.criticalCapacity, { label: "Critical IT Capacity", min: 0 }),
    whiteSpace: numeric(f.whiteSpace, { label: "White Space", min: 0 }),
    dataHalls: numeric(f.dataHalls, { label: "Data Halls / Pods", allowDecimal: false, min: 0 }),
    pue: numeric(f.pue, { label: "Design PUE", min: 0 }),
    redundancy: required(f.redundancy, "Redundancy"),
    uptime: required(f.uptime, "Uptime Target"),
    cooling: required(f.cooling, "Cooling Type"),
    voltages: requiredSelection(f.voltages, "Voltage class"),
  });
}
function validateStakeholderRow(row) {
  return collectErrors({
    name: required(row.name, "Name"),
    role: required(row.role, "Role"),
    email: row.email ? validateEmail(row.email) : "",
    phone: row.phone ? validatePhone(row.phone, "Phone number") : "",
  });
}
function validateTeamMember(u) {
  return (
    validateEmail(u.email) ||
    required(u.firstName, "First name") ||
    validatePersonName(u.firstName, "First name", NAME_PATTERN) ||
    (u.lastName ? validatePersonName(u.lastName, "Last name", NAME_PATTERN) : "") ||
    required(u.roleId, "Role") || ""
  );
}

describe("Identity step (TC_ID_016..026)", () => {
  it("flags every field empty; passes when filled; flags one missing", () => {
    expect(Object.keys(validateIdentity({})).sort()).toEqual(IDENTITY_KEYS.map(([k]) => k).sort());
    const full = Object.fromEntries(IDENTITY_KEYS.map(([k]) => [k, "x"]));
    expect(validateIdentity(full)).toEqual({});
    delete full.gc;
    expect(validateIdentity(full).gc).toMatch(/required/i);
  });
});

describe("Facility step (ORP-FAC)", () => {
  const base = { criticalCapacity: "36", whiteSpace: "120000", dataHalls: "2", pue: "1.3", redundancy: "2N", uptime: "Tier III", cooling: "Chilled Water", voltages: ["480/277V"] };
  it("passes valid; rejects alphabets/special; whole-number; voltage min-1", () => {
    expect(validateFacility(base)).toEqual({});
    expect(validateFacility({ ...base, criticalCapacity: "36MW" }).criticalCapacity).toMatch(/number/i);
    expect(validateFacility({ ...base, pue: "1.3$" }).pue).toMatch(/number/i);
    expect(validateFacility({ ...base, dataHalls: "2.5" }).dataHalls).toMatch(/whole number/i);
    expect(validateFacility({ ...base, voltages: [] }).voltages).toMatch(/must be selected/i);
  });
});

describe("Asset qty (TC_AR_011-013)", () => {
  it("strips alphabets, clamps 0/negatives", () => {
    expect(sanitizeQty("12a")).toBe("12");
    expect(sanitizeQty("abc")).toBe("");
    expect(sanitizeQty("0")).toBe("1");
    expect(sanitizeQty("7")).toBe("7");
  });
});

describe("Stakeholder row (TC_STK_005/006)", () => {
  const ok = { name: "Jane", role: "Owner", email: "j@x.com", phone: "+1 469 555 0123" };
  it("passes valid; flags bad email/phone/missing", () => {
    expect(validateStakeholderRow(ok)).toEqual({});
    expect(validateStakeholderRow({ ...ok, email: "bad" }).email).toMatch(/valid email/i);
    expect(validateStakeholderRow({ ...ok, phone: "abc" }).phone).toMatch(/valid/i);
    expect(validateStakeholderRow({ name: "", role: "", email: "", phone: "" }).name).toMatch(/required/i);
  });
});

describe("Add team member (TC_TEAM_013-046)", () => {
  const ok = { email: "j@x.com", firstName: "Jane", lastName: "Doe", roleId: "r1" };
  it("passes valid; flags email/name/role", () => {
    expect(validateTeamMember(ok)).toBe("");
    expect(validateTeamMember({ ...ok, email: "bad" })).toMatch(/valid email/i);
    expect(validateTeamMember({ ...ok, firstName: "Jane2" })).toMatch(/only contain letters/i);
    expect(validateTeamMember({ ...ok, roleId: "" })).toMatch(/required/i);
  });
});

describe("Scope & Documents & Baseline", () => {
  it("Scope requires level + sampling (TC_SL_020)", () => {
    expect(requiredSelection([], "Commissioning level")).toMatch(/must be selected/i);
    expect(required("", "Sampling rate")).toMatch(/required/i);
  });
  it("Doc file type/size (DC_009/010)", () => {
    expect(validateDocFile("malware.exe", 1000)).toMatch(/unsupported/i);
    expect(validateDocFile("plan.pdf", 1000)).toBe("");
    expect(validateDocFile("big.pdf", 26 * 1024 * 1024)).toMatch(/25 MB/i);
  });
  it("Baseline date order + ref length + dup (TC_BM)", () => {
    expect(dateOrder("2026-06-01", "2026-05-01", { label: "Milestone" })).toMatch(/on or after/i);
    expect(lengthBetween("x".repeat(101), { max: 100, label: "Reference" })).toMatch(/exceed 100/i);
    expect(notDuplicate("Freeze A", ["freeze a"], "Freeze window")).toMatch(/already exists/i);
  });
});
