/**
 * Committee Member Role Management
 * Handles role validation, sorting, and classification
 */

// Allowed committee roles
export const COMMITTEE_ROLES = {
  LEAD: 'Lead',
  CO_LEAD: 'Co-Lead',
  MANAGER: 'Manager',
  MEDIA_MANAGER: 'Media Manager',
  COMMITTEE_MEMBER: 'Committee Member',
};

// Core team roles (in priority order)
export const CORE_TEAM_ROLES = [
  COMMITTEE_ROLES.LEAD,
  COMMITTEE_ROLES.CO_LEAD,
  COMMITTEE_ROLES.MANAGER,
  COMMITTEE_ROLES.MEDIA_MANAGER,
];

// Non-core roles
export const NON_CORE_ROLES = [COMMITTEE_ROLES.COMMITTEE_MEMBER];

// All allowed roles
export const ALL_ALLOWED_ROLES = [...CORE_TEAM_ROLES, ...NON_CORE_ROLES];

/**
 * Validates if a role is allowed
 * @param {string} role - The role to validate
 * @returns {boolean} - True if role is valid
 */
export const isValidRole = (role) => {
  return ALL_ALLOWED_ROLES.includes(role);
};

/**
 * Checks if a role is a core team role
 * @param {string} role - The role to check
 * @returns {boolean} - True if role is core team
 */
export const isCoreTeamRole = (role) => {
  return CORE_TEAM_ROLES.includes(role);
};

/**
 * Gets the role priority (lower number = higher priority)
 * @param {string} role - The role
 * @returns {number} - Priority index
 */
export const getRolePriority = (role) => {
  const priority = CORE_TEAM_ROLES.indexOf(role);
  return priority >= 0 ? priority : CORE_TEAM_ROLES.length; // Non-core roles at end
};

/**
 * Sorts and organizes committee members by role
 * Core Team (by level) → Committee Members
 * @param {Array} members - Array of committee member objects
 * @returns {Object} - Organized members: { coreTeam: [], committeeMembers: [] }
 */
export const organizeMembersByRole = (members) => {
  if (!Array.isArray(members)) {
    console.warn('organizeMembersByRole: Invalid input, expected array');
    return { coreTeam: [], committeeMembers: [] };
  }

  const coreTeam = [];
  const committeeMembers = [];

  members.forEach((member) => {
    const role = member.role || '';

    // Validate role
    if (!isValidRole(role)) {
      console.warn(`Invalid role "${role}" for member ${member.name}. Skipping.`);
      return;
    }

    if (isCoreTeamRole(role)) {
      coreTeam.push(member);
    } else {
      committeeMembers.push(member);
    }
  });

  // Sort core team by role priority
  coreTeam.sort((a, b) => getRolePriority(a.role) - getRolePriority(b.role));

  // Sort committee members by name (no hierarchy)
  committeeMembers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return {
    coreTeam,
    committeeMembers,
  };
};

/**
 * Groups core team members by role level
 * Useful for displaying with visual hierarchy
 * @param {Array} coreTeamMembers - Sorted core team members
 * @returns {Object} - Grouped members: { [role]: [...members] }
 */
export const groupCoreTeamByLevel = (coreTeamMembers) => {
  const grouped = {};

  CORE_TEAM_ROLES.forEach((role) => {
    grouped[role] = coreTeamMembers.filter((member) => member.role === role);
  });

  return grouped;
};

/**
 * Get counts of core roles
 * @param {Array} coreTeamMembers
 * @returns {Object} counts per role
 */
export const getCoreRoleCounts = (coreTeamMembers) => {
  const counts = {};
  CORE_TEAM_ROLES.forEach((role) => (counts[role] = 0));
  (coreTeamMembers || []).forEach((m) => {
    if (CORE_TEAM_ROLES.includes(m.role)) counts[m.role] = (counts[m.role] || 0) + 1;
  });
  return counts;
};

/**
 * Decide whether to use level-wise display (Rule B)
 * Use level-wise ONLY when ALL core roles have 2 or more members
 * @param {Array} coreTeamMembers
 * @returns {boolean}
 */
export const shouldUseLevelWiseDisplay = (coreTeamMembers) => {
  const counts = getCoreRoleCounts(coreTeamMembers);
  return CORE_TEAM_ROLES.every((role) => (counts[role] || 0) >= 2);
};

/**
 * Validates committee members array
 * Checks for valid roles and required fields
 * @param {Array} members - Array of committee members
 * @returns {Object} - { isValid: boolean, errors: [] }
 */
export const validateCommitteeMembers = (members) => {
  const errors = [];

  if (!Array.isArray(members)) {
    errors.push('Members must be an array');
    return { isValid: false, errors };
  }

  members.forEach((member, index) => {
    // Check for required fields
    if (!member.name) {
      errors.push(`Member at index ${index} is missing "name" field`);
    }

    if (!member.role) {
      errors.push(`Member at index ${index} (${member.name}) is missing "role" field`);
    } else if (!isValidRole(member.role)) {
      errors.push(
        `Member at index ${index} (${member.name}) has invalid role "${member.role}". ` +
        `Allowed roles: ${ALL_ALLOWED_ROLES.join(', ')}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
