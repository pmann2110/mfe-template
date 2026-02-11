'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@repo/ui';
import { RolePermissionMatrix } from './RolePermissionMatrix';
import type { OrgRole } from '@repo/api-contracts';
import { buildOrgRolePermissions } from '@repo/rbac';

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: OrgRole | null;
  organizationId: string;
  onSubmit: (data: { name: string; slug: string; description?: string; permissions: string[] }) => Promise<void>;
}

export function RoleForm({
  open,
  onOpenChange,
  role,
  organizationId,
  onSubmit,
}: RoleFormProps) {
  const [name, setName] = useState(role?.name ?? '');
  const [slug, setSlug] = useState(role?.slug ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(role?.name ?? '');
      setSlug(role?.slug ?? '');
      setDescription(role?.description ?? '');
      setPermissions(role?.permissions ?? []);
    }
  }, [open, role]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName || !trimmedSlug) return;
    const validPerms = buildOrgRolePermissions(permissions);
    setSaving(true);
    try {
      await onSubmit({
        name: trimmedName,
        slug: trimmedSlug,
        description: description.trim() || undefined,
        permissions: validPerms,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit role' : 'Create role'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Member"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-slug">Slug</Label>
            <Input
              id="role-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. member"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-desc">Description (optional)</Label>
            <Input
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <RolePermissionMatrix
            selectedPermissions={permissions}
            onChange={setPermissions}
            disabled={saving}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !name.trim() || !slug.trim()}>
              {saving ? 'Saving…' : role ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
