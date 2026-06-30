// Shared form-validation primitives, kept in one place so the rules stay in
// lock-step with the backend DTOs (CreateUserDto, CreateTarfDto) and so the
// same logic can be unit-tested without rendering a component.

// Letters (incl. accented), spaces, hyphens, apostrophes — e.g. O'Brien, Jean-Luc.
export const NAME_PATTERN = /^[\p{L}\s'-]+$/u;
// Person names additionally allow a period — e.g. "James T. Holbrook".
export const PERSON_NAME_PATTERN = /^[\p{L}\s'.-]+$/u;
// Standard email shape; also rejects embedded spaces.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Company names: letters, digits, spaces and business punctuation
// (& . , ' - ( ) /) — e.g. "AT&T", "Turner Construction, Inc.", "3M". Mirrors
// the backend COMPANY_NAME_PATTERN in create-company.dto.ts.
export const COMPANY_NAME_PATTERN = /^[\p{L}\p{N}\s&.,'()/-]+$/u;

export const MAX_EMAIL = 254;
export const MAX_NAME = 100;
export const MAX_COMPANY = 150;

// Returns an error string for a company/org name, or "" when valid. `required`
// defaults to false so optional company fields can pass when blank.
export function validateCompanyName(raw, label = "Company", required = false) {
  const name = (raw || "").trim();
  if (!name) return required ? `${label} is required.` : "";
  if (name.length > MAX_COMPANY)
    return `${label} cannot exceed ${MAX_COMPANY} characters.`;
  if (!COMPANY_NAME_PATTERN.test(name))
    return `${label} may only contain letters, numbers, spaces, and & . , ' - ( ) / characters.`;
  return "";
}

// Returns an error string for an email, or "" when valid.
export function validateEmail(raw) {
  const email = (raw || "").trim();
  if (!email) return "Email is required.";
  if (/\s/.test(raw || "")) return "Email cannot contain spaces.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  if (email.length > MAX_EMAIL)
    return `Email cannot exceed ${MAX_EMAIL} characters.`;
  return "";
}

// Returns an error string for a person/first/last name, or "" when valid.
// `pattern` lets callers pick the stricter NAME_PATTERN (user names) or the
// PERSON_NAME_PATTERN (TARF person names that may include a period).
export function validatePersonName(raw, label = "Name", pattern = PERSON_NAME_PATTERN) {
  const name = (raw || "").trim();
  if (!name) return `${label} is required.`;
  if (name.length > MAX_NAME) return `${label} cannot exceed ${MAX_NAME} characters.`;
  if (!pattern.test(name))
    return `${label} may only contain letters, spaces, hyphens, and apostrophes.`;
  return "";
}

// TARF access window: single-day access (start === end) is allowed; only an end
// strictly before the start is invalid. Returns "" when the window is valid.
export function validateAccessWindow(start, end) {
  if (start && end && end < start)
    return "End date must be on or after the start date";
  return "";
}

// ── Generic reusable validators ─────────────────────────────────────────────
// Every validator returns an error string, or "" when the value is valid. This
// keeps callers uniform: `const err = required(v, "Project Name");`.

// Non-empty (after trimming). Use for any mandatory text/select field.
export function required(raw, label = "This field") {
  const v = typeof raw === "string" ? raw.trim() : raw;
  if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0))
    return `${label} is required.`;
  return "";
}

// At least one option chosen from a multi-select (array of selected values).
export function requiredSelection(arr, label = "At least one option") {
  if (!Array.isArray(arr) || arr.length === 0)
    return `${label} must be selected.`;
  return "";
}

// Bounded text length. min/max are inclusive character counts.
export function lengthBetween(raw, { min = 0, max = Infinity, label = "This field" } = {}) {
  const v = (raw || "").trim();
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  if (v.length > max) return `${label} cannot exceed ${max} characters.`;
  return "";
}

// Numeric value (integer or decimal). Rejects alphabets and special characters.
// `allowDecimal` controls whether a fractional part is permitted. Optional
// fields should be checked for emptiness by the caller before calling this.
export function numeric(raw, { label = "This field", allowDecimal = true, min, max } = {}) {
  const v = (raw ?? "").toString().trim();
  if (v === "") return `${label} is required.`;
  const pattern = allowDecimal ? /^-?\d+(\.\d+)?$/ : /^-?\d+$/;
  if (!pattern.test(v))
    return allowDecimal
      ? `${label} must be a number.`
      : `${label} must be a whole number.`;
  const n = Number(v);
  if (min !== undefined && n < min) return `${label} must be at least ${min}.`;
  if (max !== undefined && n > max) return `${label} must be at most ${max}.`;
  return "";
}

// Loose phone check: digits, spaces, +, -, parentheses; 7–20 chars.
export function validatePhone(raw, label = "Phone number") {
  const v = (raw || "").trim();
  if (!v) return `${label} is required.`;
  if (!/^[+\d][\d\s().-]{6,19}$/.test(v))
    return `Enter a valid ${label.toLowerCase()}.`;
  return "";
}

// Generic "end must be on/after start" for date strings or Date objects.
export function dateOrder(start, end, { allowSameDay = true, label = "End date" } = {}) {
  if (!start || !end) return "";
  const bad = allowSameDay ? end < start : end <= start;
  if (bad)
    return allowSameDay
      ? `${label} must be on or after the start date.`
      : `${label} must be after the start date.`;
  return "";
}

// Case-insensitive duplicate check against existing values (e.g. dup email,
// dup certification, dup stakeholder). `existing` is an array of strings.
export function notDuplicate(raw, existing = [], label = "This value") {
  const v = (raw || "").trim().toLowerCase();
  if (!v) return "";
  if (existing.some((e) => (e || "").trim().toLowerCase() === v))
    return `${label} already exists.`;
  return "";
}

// Run an object of {field: errorStringOrEmpty} and return only the non-empty
// ones — a compact way to build a fieldErrors map in a component.
export function collectErrors(map) {
  const out = {};
  for (const [k, v] of Object.entries(map)) if (v) out[k] = v;
  return out;
}
