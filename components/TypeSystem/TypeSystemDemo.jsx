import React, { useState, useEffect } from 'react';
import {
  TypeSelector,
  DynamicMetadataFields,
  TypeDebugPanel,
  TypeValidationMessage,
} from './index';
import { validateTypeUsage } from '../../services/TypeSystem';

/**
 * TYPE SYSTEM DEMO COMPONENT
 *
 * Complete example showing how to integrate all Type System components.
 * This demonstrates:
 * 1. Project category selection
 * 2. Dynamic type dropdowns
 * 3. Dynamic metadata fields
 * 4. Real-time validation
 * 5. Debug panel
 *
 * USE THIS AS A REFERENCE FOR INTEGRATION!
 */
export const TypeSystemDemo = ({
  projectId,
  organizationId,
  orgType,
  onSubmit,
}) => {
  // Form state
  const [projectCategory, setProjectCategory] = useState('');
  const [siteType, setSiteType] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteTypeDetails, setSiteTypeDetails] = useState(null);
  const [metadata, setMetadata] = useState({});

  // Validation state
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Available types for debug panel
  const [availableTypes, setAvailableTypes] = useState([]);

  // Reset form when project category changes
  useEffect(() => {
    setSiteType('');
    setSiteTypeDetails(null);
    setMetadata({});
    setValidation(null);
    setAttemptedSubmit(false);
  }, [projectCategory]);

  // Reset metadata when site type changes
  useEffect(() => {
    setMetadata({});
    setValidation(null);
  }, [siteType]);

  // Validate whenever key fields change
  useEffect(() => {
    if (siteType && projectCategory && attemptedSubmit) {
      handleValidation();
    }
  }, [siteType, projectCategory, metadata, attemptedSubmit]);

  const handleValidation = async () => {
    if (!siteType || !projectCategory) {
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateTypeUsage({
        typeCode: siteType,
        projectId,
        organizationId,
        metadata,
      });
      setValidation(result);
      return result;
    } catch (error) {
      console.error('Validation failed:', error);
      setValidation({
        isValid: false,
        errors: ['Failed to validate. Please check your connection and try again.'],
      });
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    // Validate before submit
    const validationResult = await handleValidation();

    if (!validationResult || !validationResult.isValid) {
      return;
    }

    // Prepare payload
    const payload = {
      projectId,
      name: siteName,
      type: siteType,
      metadata,
    };

    // Call parent submit handler
    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Type System Integration Demo
        </h2>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>This demo shows:</strong> How the Type System Engine dynamically controls
            form behavior based on project category and organization type.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Project Category Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Step 1: Select Project Category
            </h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Category *
            </label>
            <select
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select project category</option>
              <option value="DATA_CENTER">Data Center</option>
              <option value="CONSTRUCTION">Construction</option>
              <option value="MANUFACTURING">Manufacturing</option>
              <option value="HYBRID">Hybrid (GC + OEM)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              This controls which types are available for sites, zones, and assets.
            </p>
          </div>

          {/* Step 2: Site Type Selection (Dynamic) */}
          {projectCategory && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Step 2: Select Site Type (Dynamic)
              </h3>
              <TypeSelector
                level="SITE"
                projectCategory={projectCategory}
                orgType={orgType}
                value={siteType}
                onChange={setSiteType}
                onTypeDetails={(details) => {
                  setSiteTypeDetails(details);
                  // Store available types for debug panel
                  if (details) {
                    setAvailableTypes([details]);
                  }
                }}
                label="Site Type"
                placeholder="Select site type"
                required
              />
            </div>
          )}

          {/* Step 3: Basic Fields */}
          {siteType && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Step 3: Basic Information
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter site name"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: Dynamic Metadata Fields */}
          {siteTypeDetails && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Step 4: Type-Specific Fields (Dynamic)
              </h3>
              <DynamicMetadataFields
                typeDefinition={siteTypeDetails}
                metadata={metadata}
                onChange={setMetadata}
              />
            </div>
          )}

          {/* Validation Messages */}
          {attemptedSubmit && validation && (
            <TypeValidationMessage validation={validation} showWhen={true} />
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                // Reset form
                setProjectCategory('');
                setSiteType('');
                setSiteName('');
                setMetadata({});
                setValidation(null);
                setAttemptedSubmit(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isValidating}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                isValidating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isValidating ? 'Validating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>

      {/* Debug Panel */}
      <TypeDebugPanel
        projectCategory={projectCategory}
        orgType={orgType}
        selectedSiteType={siteType}
        availableTypes={availableTypes}
        validationResult={validation}
        metadata={metadata}
      />
    </div>
  );
};

export default TypeSystemDemo;
