// Utility to validate if a scanned QR value is a valid member_id from the list
export function validateMemberId(scanned: string, members: { member_id: string }[]): string | null {
  // Accept only if scanned value matches a member_id exactly
  const found = members.find(m => m.member_id === scanned);
  return found ? String(found.id) : null;
}
