import React from 'react';

/**
 * TYPE VALIDATION MESSAGE COMPONENT
 *
 * Displays validation errors and warnings from the type system.
 *
 * @param {Object} props
 * @param {Object} props.validation - Validation result from backend
 * @param {boolean} props.validation.isValid - Is validation passed
 * @param {Array} props.validation.errors - Array of error messages
 * @param {Array} props.validation.warnings - Array of warning messages
 * @param {boolean} props.showWhen - When to show (e.g., only after validation attempt)
 */
export const TypeValidationMessage = ({
  validation,
  showWhen = true,
}) => {
  if (!showWhen || !validation) {
    return null;
  }

  const { isValid, errors = [], warnings = [] } = validation;

  // Don't show if valid and no warnings
  if (isValid && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 my-4">
      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Validation Failed ({errors.length} error{errors.length !== 1 ? 's' : ''})
              </h3>
              <div className="mt-2 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Warning{warnings.length !== 1 ? 's' : ''}
              </h3>
              <div className="mt-2 text-sm text-yellow-700 space-y-1">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {isValid && errors.length === 0 && warnings.length === 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                ✓ Type validation passed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeValidationMessage;
