// Sorts roles within a company, and companies themselves, so the most
// recent role/company always appears first (current/ongoing roles first,
// then most recently ended, etc).

function roleSortKey(role) {
  // Ongoing roles (no endDate) should always outrank finished ones.
  // Fall back to startDate if endDate is missing entirely.
  const end = role.endDate ? new Date(role.endDate).getTime() : Infinity;
  return end;
}

export function sortRolesLatestFirst(roles = []) {
  return [...roles].sort((a, b) => {
    const diff = roleSortKey(b) - roleSortKey(a);
    if (diff !== 0) return diff;
    // tie-break on start date, latest start first
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
}

export function sortExperienceLatestFirst(items = []) {
  return [...items]
    .map(item => ({ ...item, roles: sortRolesLatestFirst(item.roles) }))
    .sort((a, b) => {
      const aMostRecent = a.roles[0] ? roleSortKey(a.roles[0]) : -Infinity;
      const bMostRecent = b.roles[0] ? roleSortKey(b.roles[0]) : -Infinity;
      return bMostRecent - aMostRecent;
    });
}
