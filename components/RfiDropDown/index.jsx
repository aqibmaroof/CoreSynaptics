"use client";

import { useEffect, useState } from "react";
import { getRFIs } from "@/services/RFI";
/**
 * RFI Dropdown Component for Projects Entity Modal
 * This is a UI-only component. No API calls.
 * Used in Projects modal to display RFIs for the selected project
 */

export function RFIDropdown({ projectId, selectedRFIs, onRFISelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [Rfis, setRfis] = useState([]);
  // Mock RFI data - In real implementation, this would come from props or API

  useEffect(() => {
    // Simulate an API call to fetch RFIs for the selected project
    const fetchRFIs = async () => {
      // Replace this with your actual API call
      const RFIS = await getRFIs(projectId);
      setRfis(RFIS);
    };

    fetchRFIs();
  }, []);



  const isSelected = (rfiId) => selectedRFIs?.includes(rfiId);

  const toggleRFI = (rfiId) => {
    if (isSelected(rfiId)) {
      onRFISelect(selectedRFIs.filter((id) => id !== rfiId));
    } else {
      onRFISelect([...(selectedRFIs || []), rfiId]);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "text-red-400";
      case "High":
        return "text-orange-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-white mb-2">
        Associated RFIs
      </label>

      {/* Dropdown Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between hover:border-blue-500 transition-all focus:outline-none focus:border-blue-500"
        >
          <span className="text-gray-400">
            {selectedRFIs && selectedRFIs.length > 0
              ? `${selectedRFIs.length} RFI${selectedRFIs.length !== 1 ? "s" : ""} selected`
              : "Select RFIs..."}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-xl">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-600">
              <input
                type="text"
                placeholder="Search RFIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* RFI List */}
            <div className="max-h-64 overflow-y-auto">
              {Rfis.length > 0 ? (
                Rfis.map((rfi) => (
                  <div
                    key={rfi.id}
                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-0 transition-colors"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected(rfi.id)}
                        onChange={() => toggleRFI(rfi.id)}
                        className="w-4 h-4 bg-gray-600 border border-gray-500 rounded cursor-pointer"
                      />

                      {/* RFI Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">
                            {rfi.rfi_number}
                          </span>
                          <span
                            className={`text-xs font-medium ${getPriorityColor(rfi.priority)}`}
                          >
                            {rfi.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {rfi.subject}
                        </p>
                      </div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-gray-400 text-sm">
                  No RFIs found
                </div>
              )}
            </div>

            {/* Clear Selection */}
            {selectedRFIs && selectedRFIs.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-600 bg-gray-800">
                <button
                  type="button"
                  onClick={() => onRFISelect([])}
                  className="w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected RFIs Tags */}
      {selectedRFIs && selectedRFIs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRFIs.map((rfiId) => {
            const rfi = Rfis.find((r) => r.id === rfiId);
            return (
              <div
                key={rfiId}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-700/30 rounded-full text-sm"
              >
                <span className="text-blue-300 font-medium">
                  {rfi?.rfi_number}
                </span>
                <button
                  type="button"
                  onClick={() => toggleRFI(rfiId)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-gray-400">
        Select RFIs that are related to this project. This is for organizational
        purposes only.
      </p>
    </div>
  );
}

/**
 * Usage in Projects Entity Modal:
 *
 * import { RFIDropdown } from "@/components/RFIDropdown";
 *
 * In your modal form:
 *
 * const [selectedRFIs, setSelectedRFIs] = useState([]);
 *
 * <RFIDropdown
 *   projectId={formData.project_id}
 *   selectedRFIs={selectedRFIs}
 *   onRFISelect={setSelectedRFIs}
 * />
 *
 * Note: This component does NOT make API calls.
 * It's purely for UI selection and display.
 */
