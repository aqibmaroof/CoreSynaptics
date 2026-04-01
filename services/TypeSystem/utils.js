const PROJECT_CATEGORIES = [
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "DATA_CENTER", label: "Data Center" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "INFRA", label: "Infrastructure" },
  { value: "MANUFACTURING", label: "Manufacturing" },
];

export const getProjectCategoryOptions = () => PROJECT_CATEGORIES;

export const parseStoredJson = (key) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

export const getCurrentOrganizationContext = () => {
  const organization = parseStoredJson("organization");
  const user = parseStoredJson("user");

  const orgType =
    organization?.type ||
    organization?.organizationType ||
    user?.organizationType ||
    user?.platformRole;

  const organizationId = organization?.id || organization?.organizationId || null;

  return {
    orgType,
    organizationId,
    organization,
    user,
  };
};

export const sanitizeMetadata = (metadata = {}) =>
  Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === "string") {
        return value.trim() !== "";
      }

      return true;
    }),
  );

export const validateMetadataAgainstType = (typeDefinition, metadata = {}) => {
  const errors = {};

  if (!typeDefinition) {
    return errors;
  }

  const schema = typeDefinition.metadataSchema || {};
  const properties = schema.properties || {};
  const requiredFields =
    schema.required || typeDefinition.requiredFields || [];

  requiredFields.forEach((field) => {
    const value = metadata[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      errors[field] = "This field is required.";
    }
  });

  Object.entries(properties).forEach(([field, fieldSchema]) => {
    const value = metadata[field];

    if (value === undefined || value === null || value === "") {
      return;
    }

    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      errors[field] = `Allowed values: ${fieldSchema.enum.join(", ")}`;
      return;
    }

    if (
      (fieldSchema.type === "number" || fieldSchema.type === "integer") &&
      Number.isNaN(Number(value))
    ) {
      errors[field] = "Enter a valid number.";
      return;
    }

    const numericValue = Number(value);
    if (
      (fieldSchema.type === "number" || fieldSchema.type === "integer") &&
      fieldSchema.minimum !== undefined &&
      numericValue < fieldSchema.minimum
    ) {
      errors[field] = `Minimum value is ${fieldSchema.minimum}.`;
    }

    if (
      (fieldSchema.type === "number" || fieldSchema.type === "integer") &&
      fieldSchema.maximum !== undefined &&
      numericValue > fieldSchema.maximum
    ) {
      errors[field] = `Maximum value is ${fieldSchema.maximum}.`;
    }
  });

  return errors;
};

export const getFriendlyTypeSystemError = (error) => {
  const details = error?.message || error?.error || error?.details || "";

  if (!details) {
    return "The request could not be completed.";
  }

  const normalized = Array.isArray(details) ? details.join(", ") : String(details);

  if (normalized.includes("TYPE_NOT_ALLOWED_FOR_ORG")) {
    return "This type is not available for your organization.";
  }

  if (normalized.includes("TYPE_NOT_ALLOWED_FOR_CATEGORY")) {
    return "This type is not available for the current project category.";
  }

  if (normalized.includes("INVALID_PARENT_TYPE")) {
    return "This item cannot be created under the selected parent.";
  }

  if (normalized.includes("requires ancestor type")) {
    return "This type requires a different hierarchy path before it can be used.";
  }

  if (normalized.includes("Only one parent is allowed")) {
    return "Select exactly one parent for this task.";
  }

  return normalized;
};
