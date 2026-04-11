"use client";

import { useState, useEffect } from "react";

/**
 * INSTRUCTIONS FOR INTEGRATION:
 * 
 * This is a PARTIAL code snippet showing ONLY the Company dropdown addition
 * to your existing Entity Modal. Follow these steps:
 * 
 * 1. In your existing Entity Modal component, find the section where you render
 *    entity type selection
 * 
 * 2. After the entity type selection, add this code block:
 * 
 * 3. The dropdown will ONLY show when entity type is "Project"
 * 
 * 4. Do NOT remove or disturb any existing entity modal code
 * 
 * 5. The company selection is UI-only in this version (see handleChange function)
 */

export function CompanyDropdownForProjects({
  entityType,
  selectedCompany,
  onCompanyChange,
  disabled = false,
}) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch companies when dropdown should be visible
  useEffect(() => {
    if (entityType === "Project") {
      fetchCompanies();
    }
  }, [entityType]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/company");
      if (!response.ok) throw new Error("Failed to fetch companies");
      const data = await response.json();
      setCompanies(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Only render if entity type is "Project"
  if (entityType !== "Project") {
    return null;
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-white mb-2">
        Company <span className="text-gray-400">(optional)</span>
      </label>
      <select
        value={selectedCompany}
        onChange={(e) => onCompanyChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all [&_option]:bg-gray-700 [&_option]:text-white disabled:opacity-50"
      >
        <option value="">
          {loading ? "Loading companies..." : "— Select Company —"}
        </option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name} ({company.type})
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

/**
 * USAGE IN YOUR ENTITY MODAL:
 * 
 * In your existing Entity Modal component, add this import:
 *   import { CompanyDropdownForProjects } from "@/components/CompanyDropdownForProjects";
 * 
 * Then in your form JSX, after your entity type selection, add:
 * 
 *   <CompanyDropdownForProjects
 *     entityType={selectedEntityType}
 *     selectedCompany={selectedCompany}
 *     onCompanyChange={setSelectedCompany}
 *     disabled={isLoading}
 *   />
 * 
 * And in your component state, add:
 *   const [selectedCompany, setSelectedCompany] = useState("");
 * 
 * That's it! The dropdown will automatically appear only for Project entity type
 */
