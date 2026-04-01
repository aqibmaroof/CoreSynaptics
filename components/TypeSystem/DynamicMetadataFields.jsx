import React from 'react';

/**
 * DYNAMIC METADATA FIELDS COMPONENT
 *
 * Renders form fields dynamically based on type's metadataSchema (JSON Schema).
 * Supports: number, string, enum (dropdown), boolean.
 *
 * @param {Object} props
 * @param {Object} props.typeDefinition - Full type definition with metadataSchema
 * @param {Object} props.metadata - Current metadata values
 * @param {Function} props.onChange - Callback when metadata changes
 * @param {Object} props.errors - Validation errors keyed by field name
 * @param {boolean} props.disabled - Are fields disabled
 */
export const DynamicMetadataFields = ({
  typeDefinition,
  metadata = {},
  onChange,
  errors = {},
  disabled = false,
}) => {
  if (!typeDefinition || !typeDefinition.metadataSchema) {
    return null;
  }

  const schema = typeDefinition.metadataSchema;
  const properties = schema.properties || {};
  const required = schema.required || typeDefinition.requiredFields || [];

  const handleFieldChange = (fieldName, value) => {
    const newMetadata = {
      ...metadata,
      [fieldName]: value,
    };
    onChange(newMetadata);
  };

  const renderField = (fieldName, fieldSchema) => {
    const isRequired = required.includes(fieldName);
    const value = metadata[fieldName] || '';
    const error = errors[fieldName];

    // Format field name for display
    const displayName = fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Render based on field type
    if (fieldSchema.enum) {
      // Dropdown for enum values
      return (
        <div key={fieldName} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {displayName}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
            required={isRequired}
          >
            <option value="">Select {displayName}</option>
            {fieldSchema.enum.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          {fieldSchema.description && !error && (
            <p className="mt-1 text-xs text-gray-500">{fieldSchema.description}</p>
          )}
        </div>
      );
    } else if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
      // Number input
      return (
        <div key={fieldName} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {displayName}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(fieldName, parseFloat(e.target.value) || null)}
            disabled={disabled}
            min={fieldSchema.minimum}
            max={fieldSchema.maximum}
            step={fieldSchema.type === 'integer' ? 1 : 'any'}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
            required={isRequired}
            placeholder={`Enter ${displayName.toLowerCase()}`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          {fieldSchema.description && !error && (
            <p className="mt-1 text-xs text-gray-500">{fieldSchema.description}</p>
          )}
        </div>
      );
    } else if (fieldSchema.type === 'boolean') {
      // Checkbox for boolean
      return (
        <div key={fieldName} className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            {displayName}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    } else {
      // Default: text input
      return (
        <div key={fieldName} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {displayName}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            disabled={disabled}
            maxLength={fieldSchema.maxLength}
            minLength={fieldSchema.minLength}
            pattern={fieldSchema.pattern}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
            required={isRequired}
            placeholder={`Enter ${displayName.toLowerCase()}`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          {fieldSchema.description && !error && (
            <p className="mt-1 text-xs text-gray-500">{fieldSchema.description}</p>
          )}
        </div>
      );
    }
  };

  const fieldNames = Object.keys(properties);

  if (fieldNames.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
        {typeDefinition.displayName} Specifications
      </h3>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These fields are dynamically generated based on the selected type.
          {required.length > 0 && ` Fields marked with * are required.`}
        </p>
      </div>
      {fieldNames.map((fieldName) => renderField(fieldName, properties[fieldName]))}
    </div>
  );
};

export default DynamicMetadataFields;
