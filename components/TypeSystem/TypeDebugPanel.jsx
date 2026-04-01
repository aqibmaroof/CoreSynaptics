import React, { useState } from 'react';

/**
 * TYPE DEBUG PANEL COMPONENT
 *
 * Shows current type system state for demonstration purposes.
 * Displays: project category, org type, selected types, validation status.
 *
 * @param {Object} props
 * @param {string} props.projectCategory - Current project category
 * @param {string} props.orgType - Current organization type
 * @param {string} props.selectedSiteType - Selected site type
 * @param {string} props.selectedZoneType - Selected zone type
 * @param {string} props.selectedAssetType - Selected asset type
 * @param {Array} props.availableTypes - Array of currently available types
 * @param {Object} props.validationResult - Current validation result
 * @param {Object} props.metadata - Current metadata
 */
export const TypeDebugPanel = ({
  projectCategory,
  orgType,
  selectedSiteType,
  selectedZoneType,
  selectedAssetType,
  availableTypes = [],
  validationResult = null,
  metadata = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mt-6 border-2 border-purple-300 rounded-lg bg-purple-50">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-bold text-purple-800 flex items-center">
          <span className="mr-2">🔧</span>
          Type System Debug Panel
        </h3>
        <button
          className="text-purple-600 hover:text-purple-800 font-bold text-xl"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Context Section */}
          <div className="bg-white rounded-md p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
              <span className="mr-2">📋</span>
              Current Context
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Project Category:</span>
                <div className={`mt-1 px-3 py-1 rounded inline-block ml-2 ${
                  projectCategory
                    ? 'bg-blue-100 text-blue-800 font-semibold'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {projectCategory || 'Not Set'}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Organization Type:</span>
                <div className={`mt-1 px-3 py-1 rounded inline-block ml-2 ${
                  orgType === 'GC'
                    ? 'bg-orange-100 text-orange-800 font-semibold'
                    : orgType === 'OEM'
                    ? 'bg-green-100 text-green-800 font-semibold'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {orgType || 'Not Set'}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Types Section */}
          <div className="bg-white rounded-md p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Selected Types (Hierarchy)
            </h4>
            <div className="space-y-2 text-sm">
              {/* Site Type */}
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24">Site:</span>
                <div className={`px-3 py-1 rounded ${
                  selectedSiteType
                    ? 'bg-indigo-100 text-indigo-800 font-mono'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {selectedSiteType || 'Not Selected'}
                </div>
              </div>

              {/* Zone Type */}
              <div className="flex items-start ml-6">
                <span className="font-medium text-gray-700 w-24">└─ Zone:</span>
                <div className={`px-3 py-1 rounded ${
                  selectedZoneType
                    ? 'bg-teal-100 text-teal-800 font-mono'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {selectedZoneType || 'Not Selected'}
                </div>
              </div>

              {/* Asset Type */}
              <div className="flex items-start ml-12">
                <span className="font-medium text-gray-700 w-24">└─ Asset:</span>
                <div className={`px-3 py-1 rounded ${
                  selectedAssetType
                    ? 'bg-pink-100 text-pink-800 font-mono'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {selectedAssetType || 'Not Selected'}
                </div>
              </div>
            </div>
          </div>

          {/* Available Types Section */}
          {availableTypes.length > 0 && (
            <div className="bg-white rounded-md p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
                <span className="mr-2">✓</span>
                Available Types ({availableTypes.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map((type) => (
                  <div
                    key={type.code}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono border border-gray-300"
                    title={type.description || type.displayName}
                  >
                    {type.code}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Status */}
          {validationResult && (
            <div className={`rounded-md p-4 border ${
              validationResult.isValid
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <h4 className={`font-semibold mb-2 flex items-center ${
                validationResult.isValid ? 'text-green-700' : 'text-red-700'
              }`}>
                <span className="mr-2">{validationResult.isValid ? '✅' : '❌'}</span>
                Validation Status
              </h4>
              {validationResult.errors && validationResult.errors.length > 0 && (
                <div className="space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div className="space-y-1 mt-2">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-700 flex items-start">
                      <span className="mr-2">⚠️</span>
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
              {validationResult.isValid && (
                <p className="text-sm text-green-700">All validations passed!</p>
              )}
            </div>
          )}

          {/* Metadata Preview */}
          {Object.keys(metadata).length > 0 && (
            <div className="bg-white rounded-md p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
                <span className="mr-2">📦</span>
                Metadata (Dynamic Fields)
              </h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto font-mono border border-gray-300">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 This panel demonstrates how the Type System controls the ERP:</strong>
              <br />
              • Different project categories → different available types
              <br />
              • GC vs OEM organizations → filtered type lists
              <br />
              • Parent-child relationships → hierarchy validation
              <br />
              • Dynamic metadata fields → type-specific data schemas
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeDebugPanel;
