/**
 * Organization Management Utility
 *
 * Centralized organization management for handling multiple organizations.
 * User can have multiple organizations and switch between them.
 */

const ORG_ID_KEY = "org_id";
const ORG_LIST_KEY = "org_list";
const CURRENT_ORG_KEY = "current_org";

export interface Organization {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get the current organization ID
 * @returns The current organization ID or null if not set
 */
export const getOrgId = (): string | null => {
  return localStorage.getItem(ORG_ID_KEY);
};

/**
 * Set the current organization ID
 * @param orgId - The organization ID to set as current
 */
export const setOrgId = (orgId: string): void => {
  localStorage.setItem(ORG_ID_KEY, orgId);
  console.log("[ORG] Set current organization:", orgId);
};

/**
 * Get the current organization details
 * @returns The current organization object or null
 */
export const getCurrentOrg = (): Organization | null => {
  const orgData = localStorage.getItem(CURRENT_ORG_KEY);
  if (!orgData) return null;

  try {
    return JSON.parse(orgData);
  } catch (error) {
    console.error("[ORG] Failed to parse current organization:", error);
    return null;
  }
};

/**
 * Set the current organization details
 * @param org - The organization object to set as current
 */
export const setCurrentOrg = (org: Organization): void => {
  localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(org));
  setOrgId(org.id);
  console.log("[ORG] Set current organization details:", org.name);
};

/**
 * Get all organizations for the current user
 * @returns Array of organizations or empty array
 */
export const getOrgList = (): Organization[] => {
  const orgListData = localStorage.getItem(ORG_LIST_KEY);
  if (!orgListData) return [];

  try {
    return JSON.parse(orgListData);
  } catch (error) {
    console.error("[ORG] Failed to parse organization list:", error);
    return [];
  }
};

/**
 * Set the list of organizations for the current user
 * @param orgs - Array of organizations
 */
export const setOrgList = (orgs: Organization[]): void => {
  localStorage.setItem(ORG_LIST_KEY, JSON.stringify(orgs));
  console.log("[ORG] Saved organization list:", orgs.length, "organizations");

  // If there's no current org set and we have orgs, set the first one as current
  if (orgs.length > 0 && !getOrgId()) {
    setCurrentOrg(orgs[0]);
  }
};

/**
 * Switch to a different organization
 * @param orgId - The organization ID to switch to
 * @returns True if switch was successful, false if organization not found
 */
export const switchOrg = (orgId: string): boolean => {
  const orgs = getOrgList();
  const org = orgs.find((o) => o.id === orgId);

  if (!org) {
    console.warn("[ORG] Organization not found:", orgId);
    return false;
  }

  setCurrentOrg(org);
  console.log("[ORG] Switched to organization:", org.name);

  // Trigger a storage event to notify other tabs/components
  window.dispatchEvent(new Event("organization-changed"));

  return true;
};

/**
 * Clear all organization data (used during logout)
 */
export const clearOrgData = (): void => {
  localStorage.removeItem(ORG_ID_KEY);
  localStorage.removeItem(ORG_LIST_KEY);
  localStorage.removeItem(CURRENT_ORG_KEY);
  console.log("[ORG] Cleared all organization data");
};

/**
 * Check if user has multiple organizations
 * @returns True if user has more than one organization
 */
export const hasMultipleOrgs = (): boolean => {
  return getOrgList().length > 1;
};

/**
 * Get organization by ID from the list
 * @param orgId - The organization ID to find
 * @returns The organization or null if not found
 */
export const getOrgById = (orgId: string): Organization | null => {
  const orgs = getOrgList();
  return orgs.find((o) => o.id === orgId) || null;
};

/**
 * Hook to listen for organization changes across tabs/components
 * @param callback - Function to call when organization changes
 * @returns Cleanup function to remove the listener
 */
export const onOrganizationChanged = (callback: () => void): (() => void) => {
  const handleChange = () => callback();
  window.addEventListener("organization-changed", handleChange);

  // Also listen to storage events for cross-tab synchronization
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === ORG_ID_KEY || e.key === CURRENT_ORG_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener("organization-changed", handleChange);
    window.removeEventListener("storage", handleStorageChange);
  };
};
