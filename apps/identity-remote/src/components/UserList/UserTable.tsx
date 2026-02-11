'use client';

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DataTable,
  Button,
  Badge,
  Checkbox,
  type DataTableColumn,
} from '@repo/ui';
import type { User } from '@repo/api-contracts';
import { getRoleInOrg } from '../../data/mock-identity';
import { getRoleBadgeClassName } from '../../lib/role-badge';
import { EmptyState } from './EmptyState';

interface UserTableProps {
  users: User[];
  canWrite: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  /** When set, role column shows org role name from membership; otherwise fallback to user.role or "—". */
  organizationId?: string | null;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserTable({
  users,
  canWrite,
  onEdit,
  onDelete,
  onCreate,
  organizationId,
  selectedIds = [],
  onSelectionChange,
}: UserTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getRoleDisplay = (row: User) => {
    if (organizationId) {
      const roleInOrg = getRoleInOrg(row.id, organizationId);
      return roleInOrg?.roleName ?? '—';
    }
    return row.role || '—';
  };

  const sortedUsers = useMemo(() => {
    if (!sortColumn) return users;
    const sorted = [...users].sort((a, b) => {
      const aVal = sortColumn === 'name' ? a.name : sortColumn === 'email' ? a.email : getRoleDisplay(a);
      const bVal = sortColumn === 'name' ? b.name : sortColumn === 'email' ? b.email : getRoleDisplay(b);
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [users, sortColumn, sortDirection, organizationId]);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const toggleSelect = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === sortedUsers.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sortedUsers.map((u) => u.id));
    }
  };

  const columns: DataTableColumn<User>[] = useMemo(() => {
    const cols: DataTableColumn<User>[] = [];
    if (canWrite && onSelectionChange) {
      cols.push({
        id: 'select',
        header: 'Select',
        accessor: (row) => (
          <Checkbox
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleSelect(row.id)}
            aria-label={`Select ${row.name}`}
          />
        ),
        className: 'w-10',
      });
    }
    cols.push(
      {
        id: 'name',
        header: 'Name',
        sortable: true,
        accessor: (row) => (
          <Link
            to={`/users/${row.id}`}
            className="flex items-center gap-3 hover:text-primary transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary shadow-sm">
              {initials(row.name)}
            </div>
            <span className="hover:underline">{row.name}</span>
          </Link>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        sortable: true,
        accessor: (row) => row.email,
      },
      {
        id: 'role',
        header: 'Role',
        sortable: true,
        accessor: (row) => {
          const display = getRoleDisplay(row);
          const roleClassName = getRoleBadgeClassName(display);
          return (
            <Badge variant="secondary" className={roleClassName}>
              {display}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        accessor: (row) =>
          canWrite ? (
            <div className="flex gap-1 justify-end">
              <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(row.id)}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          ) : null,
      }
    );
    return cols;
  }, [canWrite, onSelectionChange, selectedIds, onEdit, onDelete, organizationId]);

  if (users.length === 0) {
    return <EmptyState canWrite={canWrite} onCreate={onCreate} />;
  }

  return (
    <div className="overflow-x-auto">
      <DataTable<User>
        columns={columns}
        data={sortedUsers}
        keyExtractor={(row) => row.id}
        pageSize={10}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No users match your filters."
      />
    </div>
  );
}
