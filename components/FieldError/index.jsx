"use client";

// Tiny shared inline-error primitives so every form surfaces validation the
// same way: a red message directly under the field, announced to screen readers.
//
// Usage:
//   <input {...fieldA11y("email", errors)} className={...} />
//   <FieldError name="email" errors={errors} />

export default function FieldError({ name, errors, className = "" }) {
  const msg = errors?.[name];
  if (!msg) return null;
  return (
    <p
      id={`${name}-error`}
      role="alert"
      className={`mt-1.5 text-xs text-red-400 ${className}`}
    >
      {msg}
    </p>
  );
}

// Spread onto an input/select to wire accessibility to its FieldError.
export function fieldA11y(name, errors) {
  const invalid = Boolean(errors?.[name]);
  return {
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `${name}-error` : undefined,
  };
}
