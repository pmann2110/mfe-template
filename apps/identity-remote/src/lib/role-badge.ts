/**
 * Returns className for role-specific badge styling using design tokens.
 * Maps role display name to semantic role colors (admin/member) or falls back to secondary.
 */
export function getRoleBadgeClassName(roleName: string): string {
  const r = roleName.toLowerCase();
  if (r === 'admin' || r.includes('admin')) {
    return 'border-transparent bg-[hsl(var(--role-admin)/0.15)] text-[hsl(var(--role-admin))] dark:bg-[hsl(var(--role-admin)/0.25)] dark:text-[hsl(var(--role-admin-foreground))]';
  }
  if (r === 'member' || r === 'manager' || r.includes('member')) {
    return 'border-transparent bg-[hsl(var(--role-member)/0.15)] text-[hsl(var(--role-member))] dark:bg-[hsl(var(--role-member)/0.25)] dark:text-[hsl(var(--role-member-foreground))]';
  }
  return ''; // Use default/secondary variant
}
