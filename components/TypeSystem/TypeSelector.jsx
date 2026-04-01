import React, { useState, useEffect } from 'react';
import { queryTypes } from '../../services/TypeSystem';

/**
 * TYPE SELECTOR COMPONENT
 *
 * Dynamic dropdown that fetches and displays available types based on context.
 * Automatically filters by project category, org context, and parent type.
 *
 * @param {Object} props
 * @param {string} props.level - Hierarchy level (SITE, ZONE, ASSET)
 * @param {string} props.projectCategory - Project category
 * @param {string} props.orgType - Organization type (GC or OEM)
 * @param {string} props.parentTypeCode - Parent type code (for hierarchy validation)
 * @param {string} props.value - Selected type code
 * @param {Function} props.onChange - Callback when type is selected
 * @param {Function} props.onTypeDetails - Callback to pass full type details
 * @param {string} props.label - Label for the dropdown
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Is this field required
 * @param {boolean} props.disabled - Is dropdown disabled
 * @param {string} props.error - Error message to display
 */
export const TypeSelector = ({
  level,
  projectCategory,
  orgType,
  parentTypeCode = null,
  value,
  onChange,
  onTypeDetails = null,
  label,
  placeholder = 'Select type',
  required = false,
  disabled = false,
  error = null,
}) => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    // Fetch types when context changes
    // Note: projectCategory is optional but recommended for proper type filtering
    const fetchTypes = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const params = {
          level,
          activeOnly: true,
          systemTypesOnly: true,
        };

        // Only add projectCategory if it's a valid non-empty value
        if (projectCategory) {
          params.projectCategory = projectCategory;
        }

        if (parentTypeCode) {
          params.parentTypeCode = parentTypeCode;
        }

        const data = await queryTypes(params);

        // Filter by org context (GC/OEM/BOTH)
        const filteredTypes = data.filter(type =>
          type.orgContext === 'BOTH' || type.orgContext === orgType
        );

        setTypes(filteredTypes);

        // If a type is selected, pass its full details to parent
        if (value && onTypeDetails) {
          const selectedType = filteredTypes.find(t => t.code === value);
          if (selectedType) {
            onTypeDetails(selectedType);
          }
        }
      } catch (error) {
        console.error('Failed to fetch types:', error);
        setFetchError('Failed to load types. Please try again.');
        setTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, [level, projectCategory, orgType, parentTypeCode]);

  const handleChange = (e) => {
    const selectedCode = e.target.value;
    onChange(selectedCode);

    // Pass full type details to parent
    if (onTypeDetails && selectedCode) {
      const selectedType = types.find(t => t.code === selectedCode);
      if (selectedType) {
        onTypeDetails(selectedType);
      }
    } else if (onTypeDetails && !selectedCode) {
      onTypeDetails(null);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || loading || !projectCategory}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        required={required}
      >
        <option value="">
          {loading ? 'Loading...' : placeholder}
        </option>
        {types.map((type) => (
          <option key={type.code} value={type.code}>
            {type.displayName}
            {type.description && ` - ${type.description.substring(0, 50)}`}
          </option>
        ))}
      </select>

      {/* Show number of available types */}
      {!loading && types.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          {types.length} type{types.length !== 1 ? 's' : ''} available
        </p>
      )}

      {/* Show error message */}
      {(error || fetchError) && (
        <p className="mt-1 text-sm text-red-600">
          {error || fetchError}
        </p>
      )}

      {/* Show helper text when no types available */}
      {!loading && types.length === 0 && !fetchError && (
        <p className="mt-1 text-sm text-yellow-600">
          {!projectCategory
            ? 'Project category not set. Please set projectCategory on the root project.'
            : `No types available for this context (${projectCategory}, ${orgType || 'unknown org'}).`}
          {parentTypeCode && ' Try selecting a different parent type.'}
        </p>
      )}
    </div>
  );
};

export default TypeSelector;
