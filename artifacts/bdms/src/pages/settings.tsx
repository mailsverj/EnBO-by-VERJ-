import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Shield, Settings2, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api, type SafeUser } from '@/lib/api';

type Role = string;

const ALL_ROLES: Role[] = [
  'Chief Admin', 'Super Admin', 'Management', 'Recruitment/Admin',
  'Sales Admin', 'Technical Officer', 'Lead Technical Officer',
  'Finance', 'BDO', 'Engineer', 'Sales'
];

export default function Settings() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });
  const users = data?.users ?? [];

  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [tempRoles, setTempRoles] = useState<Role[]>([]);

  const handleEditClick = (u: SafeUser) => {
    setEditingUser(u);
    setTempRoles([...u.roles]);
  };

  const toggleRole = (role: Role, checked: boolean) => {
    if (checked) {
      setTempRoles([...tempRoles, role]);
    } else {
      setTempRoles(tempRoles.filter(r => r !== role));
    }
  };

  const saveRoles = () => {
    // In production this would call PATCH /api/users/:id
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Manage users, roles, and global configurations.</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="general">Global Config</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage access to the EnBO platform.</CardDescription>
              </div>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add User</Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Linked BDO</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">USR-{String(user.id).padStart(3, '0')}</TableCell>
                        <TableCell>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(r => (
                              <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{user.vbdoId || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground border-dashed">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-1">Role Configuration</h3>
              <p className="text-sm max-w-md mx-auto">RBAC (Role-Based Access Control) matrix is currently managed by Super Admin via backend console.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground border-dashed">
              <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-1">Global Configurations</h3>
              <p className="text-sm max-w-md mx-auto">System variables (VAT rate, default commission percentage) are locked in this environment.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="text-sm font-medium">{editingUser.name}</div>
              <div className="text-xs text-muted-foreground mb-4">Assign one or more roles to this user. They will inherit permissions from all assigned roles.</div>
              <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-auto border p-4 rounded-md">
                {ALL_ROLES.map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={tempRoles.includes(role)}
                      onCheckedChange={(checked) => toggleRole(role, checked as boolean)}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm cursor-pointer">{role}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={saveRoles}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
