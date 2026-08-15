import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, type Design } from '@/lib/api';
import { format, addHours, differenceInMinutes } from 'date-fns';
import { Lock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useLocation } from 'wouter';

export default function EngineeringQueue() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['designs'],
    queryFn: () => api.designs.list(),
  });

  const designs = data?.designs ?? [];

  const lockMutation = useMutation({
    mutationFn: (designRef: string) => api.designs.lock(designRef),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designs'] }),
  });

  const unlockMutation = useMutation({
    mutationFn: (designRef: string) => api.designs.unlock(designRef),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designs'] }),
  });

  const handleTakeOwnership = (designRef: string) => {
    lockMutation.mutate(designRef);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Revision Required': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderLockIndicator = (lockedById: number | null, lockStartedAt: string | null) => {
    if (!lockedById) return null;

    if (user && lockedById === user.id) {
      return (
        <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
          <Lock className="h-3 w-3 mr-1" /> You are working on this
        </div>
      );
    }

    if (lockStartedAt) {
      const expiry = addHours(new Date(lockStartedAt), 3);
      const minsLeft = differenceInMinutes(expiry, new Date());

      return (
        <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
          <Lock className="h-3 w-3 mr-1" /> Locked ({minsLeft > 0 ? `${minsLeft}m left` : 'Expired'})
        </div>
      );
    }

    return (
      <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
        <Lock className="h-3 w-3 mr-1" /> Locked
      </div>
    );
  };

  const renderTable = (data: Design[]) => (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Design ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Submission</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignment</TableHead>
            <TableHead className="text-right">Action</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(design => (
            <React.Fragment key={design.id}>
              <TableRow className="group">
                <TableCell className="font-mono text-xs">{design.designRef}</TableCell>
                <TableCell>
                  <div className="font-semibold text-sm">{design.customerName}</div>
                  <div className="text-xs text-muted-foreground">{design.customerId}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{design.sourceBdoId}</div>
                  <div className="text-xs text-muted-foreground">{design.leadRef}</div>
                </TableCell>
                <TableCell className="text-sm">{format(new Date(design.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(design.status)}>{design.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {design.assignedEngineerId ? (
                      <span className="text-sm font-medium">Eng. #{design.assignedEngineerId}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Unassigned</span>
                    )}
                    {renderLockIndicator(design.lockedById, design.lockStartedAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {design.status === 'Pending' && !design.lockedById && (
                    <Button size="sm" onClick={() => handleTakeOwnership(design.designRef)} disabled={lockMutation.isPending}>
                      Take Ownership
                    </Button>
                  )}
                  {user && design.lockedById === user.id && (
                    <Button size="sm" variant="secondary" onClick={() => setLocation(`/engineering/calculator?designId=${design.designRef}`)}>Open Design</Button>
                  )}
                  {design.lockedById && (!user || design.lockedById !== user.id) && (
                    <Badge variant="outline" className="opacity-50 cursor-not-allowed">Locked</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === design.designRef ? null : design.designRef)}>
                    {expandedId === design.designRef ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedId === design.designRef && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={8} className="p-4">
                    <h4 className="text-sm font-semibold mb-3 border-b pb-2">Design Details</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-muted-foreground">System Size:</span> <span className="font-medium">{design.systemSize ?? '-'}</span></div>
                      <div><span className="text-muted-foreground">PV kWp:</span> <span className="font-medium">{design.pvKwp ?? '-'}</span></div>
                      <div><span className="text-muted-foreground">Battery kWh:</span> <span className="font-medium">{design.batteryKwh ?? '-'}</span></div>
                      <div><span className="text-muted-foreground">Inverter kW:</span> <span className="font-medium">{design.inverterKw ?? '-'}</span></div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engineering Queue</h1>
          <p className="text-muted-foreground mt-1">Pending and in-progress design requests from leads.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="my">My Assignments</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {renderTable(designs)}
          </TabsContent>
          <TabsContent value="my">
            {renderTable(designs.filter(d => user && d.lockedById === user.id))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
