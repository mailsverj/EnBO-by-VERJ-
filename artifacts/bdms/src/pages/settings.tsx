import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockUsers } from '@/data/mock';
import { Plus, Edit2, Shield, Settings2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings() {
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
                <CardDescription>Manage access to the BDMS platform.</CardDescription>
              </div>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add User</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Linked BDO</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-xs">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/30">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{user.vbdoId || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    </div>
  );
}
