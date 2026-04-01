import sendRequest from "../instance/sendRequest";

/**
 * TYPE SYSTEM API SERVICE
 *
 * Provides integration with backend Type System Engine.
 * All type definitions, validation, and hierarchy queries.
 */

/**
 * Query type definitions with filters
 * @param {Object} params - Query parameters
 * @param {string} params.level - HierarchyLevel (SITE, ZONE, ASSET)
 * @param {string} params.projectCategory - ProjectCategory
 * @param {string} params.orgContext - OrgContext (GC, OEM, BOTH)
 * @param {string} params.parentTypeCode - Filter by parent type
 * @param {boolean} params.systemTypesOnly - Filter system types only
 * @param {boolean} params.activeOnly - Filter active types only
 * @returns {Promise<Array>} Array of type definitions
 */
export const queryTypes = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value != null)
    ).toString();

    const data = await sendRequest({
      url: `/v1/types${queryString ? `?${queryString}` : ""}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get types grouped by hierarchy level (sites, zones, assets)
 * @param {string} projectCategory - Project category
 * @param {string} orgType - Organization type (GC or OEM)
 * @returns {Promise<Object>} Grouped types {sites: [], zones: [], assets: []}
 */
export const getGroupedTypes = async (projectCategory, orgType) => {
  try {
    const data = await sendRequest({
      url: `/v1/types/grouped?projectCategory=${projectCategory}&orgType=${orgType}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get type hierarchy tree showing parent-child relationships
 * @param {string} projectCategory - Project category
 * @param {string} orgType - Organization type (GC or OEM)
 * @returns {Promise<Array>} Hierarchy tree
 */
export const getTypeHierarchy = async (projectCategory, orgType) => {
  try {
    const data = await sendRequest({
      url: `/v1/types/hierarchy?projectCategory=${projectCategory}&orgType=${orgType}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single type definition by code
 * @param {string} code - Type code (e.g., "UPS", "DATA_HALL")
 * @returns {Promise<Object>} Type definition with full details
 */
export const getTypeByCode = async (code) => {
  try {
    const data = await sendRequest({
      url: `/v1/types/${code}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get allowed child types for a parent type
 * @param {string} parentCode - Parent type code
 * @returns {Promise<Array>} Array of allowed child type definitions
 */
export const getAllowedChildTypes = async (parentCode) => {
  try {
    const data = await sendRequest({
      url: `/v1/types/${parentCode}/children`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate type usage in context
 * @param {Object} payload - Validation payload
 * @param {string} payload.typeCode - Type code to validate
 * @param {string} payload.projectId - Root project ID
 * @param {string} payload.organizationId - Organization ID
 * @param {string} [payload.parentTypeCode] - Parent type code
 * @param {string} [payload.level] - Hierarchy level
 * @param {Object} [payload.metadata] - Metadata to validate
 * @returns {Promise<Object>} Validation result {isValid, errors, warnings, context}
 */
export const validateTypeUsage = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/v1/types/validate`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get type system health status and statistics
 * @returns {Promise<Object>} Health status with statistics
 */
export const getTypeSystemHealth = async () => {
  try {
    const data = await sendRequest({
      url: `/v1/types/health`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Helper: Get available site types for a project category and org type
 * @param {string} projectCategory - Project category
 * @param {string} orgType - Organization type
 * @returns {Promise<Array>} Available site types
 */
export const getAvailableSiteTypes = async (projectCategory, orgType) => {
  return queryTypes({
    level: "SITE",
    projectCategory,
    activeOnly: true,
    systemTypesOnly: true,
  });
};

/**
 * Helper: Get available zone types for a project category and parent site type
 * @param {string} projectCategory - Project category
 * @param {string} parentSiteType - Parent site type code
 * @returns {Promise<Array>} Available zone types
 */
export const getAvailableZoneTypes = async (projectCategory, parentSiteType) => {
  return queryTypes({
    level: "ZONE",
    projectCategory,
    parentTypeCode: parentSiteType,
    activeOnly: true,
    systemTypesOnly: true,
  });
};

/**
 * Helper: Get available asset types for a project category and parent zone type
 * @param {string} projectCategory - Project category
 * @param {string} parentZoneType - Parent zone type code
 * @returns {Promise<Array>} Available asset types
 */
export const getAvailableAssetTypes = async (projectCategory, parentZoneType) => {
  return queryTypes({
    level: "ASSET",
    projectCategory,
    parentTypeCode: parentZoneType,
    activeOnly: true,
    systemTypesOnly: true,
  });
};
