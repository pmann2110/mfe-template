import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@repo/ui';
import type { User, CreateUserRequest, UpdateUserRequest } from '@repo/api-contracts';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  formData: CreateUserRequest;
  isSubmitting: boolean;
  isFormValid: boolean;
  onFormDataChange: (data: CreateUserRequest) => void;
  onSubmit: () => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  formData,
  isSubmitting,
  isFormValid,
  onFormDataChange,
  onSubmit,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? 'Update the user information below.'
              : 'Fill in the details to create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
              placeholder="Enter full name"
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                onFormDataChange({ ...formData, email: e.target.value })
              }
              placeholder="user@example.com"
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold">
              Role *
            </Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) =>
                onFormDataChange({ ...formData, role: e.target.value })
              }
              placeholder="admin, manager, viewer"
              className="transition-all focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Common roles: admin, manager, viewer
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="hover:bg-accent"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={isSubmitting || !isFormValid}
            className="gap-2 shadow-md"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editingUser ? 'Update User' : 'Create User'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
