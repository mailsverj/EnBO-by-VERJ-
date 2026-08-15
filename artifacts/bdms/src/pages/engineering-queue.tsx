import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDesigns } from '@/data/mock';
import { format, addHours, differenceInMinutes } from 'date-fns';
import { Lock, FileDigit, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useLocation } from 'wouter';

export default function EngineeringQueue() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [designs, setDesigns] = useState(mockDesigns);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleTakeOwnership = (id: string) => {
    setDesigns(designs.map(d => 
      d.id === id 
        ? { ...d, lockedBy: user.id, assignedEngineer: user.id, lockStartedAt: new Date().toISOString(), status: 'In Progress' }
        : d
    ));
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

  const renderLockIndicator = (lockedBy: string | null, lockStartedAt: string | null) => {
    if (!lockedBy) return null;
    
    if (lockedBy === user.id) {
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

  const renderTable = (data: typeof designs) => (
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
                <TableCell className="font-mono text-xs">{design.id}</TableCell>
                <TableCell>
                  <div className="font-semibold text-sm">{design.customerName}</div>
                  <div className="text-xs text-muted-foreground">{design.customerId}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{design.sourceBdo}</div>
                  <div className="text-xs text-muted-foreground">{design.leadId}</div>
                </TableCell>
                <TableCell className="text-sm">{format(new Date(design.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(design.status)}>{design.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {design.assignedEngineer ? (
                      <span className="text-sm font-medium">{design.assignedEngineer}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Unassigned</span>
                    )}
                    {renderLockIndicator(design.lockedBy, design.lockStartedAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {design.status === 'Pending' && !design.lockedBy && (
                    <Button size="sm" onClick={() => handleTakeOwnership(design.id)}>Take Ownership</Button>
                  )}
                  {design.lockedBy === user.id && (
                    <Button size="sm" variant="secondary" onClick={() => setLocation(`/engineering/calculator?designId=${design.id}`)}>Open Design</Button>
                  )}
                  {design.lockedBy && design.lockedBy !== user.id && (
                    <Badge variant="outline" className="opacity-50 cursor-not-allowed">Locked</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === design.id ? null : design.id)}>
                    {expandedId === design.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedId === design.id && design.engineeringHistory && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={8} className="p-4">
                    <h4 className="text-sm font-semibold mb-3 border-b pb-2">Engineering History</h4>
                    <div className="space-y-3">
                      {design.engineeringHistory.map((hist, i) => (
                        <div key={i} className="flex gap-4 text-sm">
                          <div className="w-[150px] text-muted-foreground">{format(new Date(hist.startedAt), 'MMM d, h:mm a')}</div>
                          <div className="w-[200px] font-medium">{hist.engineer}</div>
                          <div className="flex-1">{hist.action}</div>
                        </div>
                      ))}
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

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="my">My Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {renderTable(designs)}
        </TabsContent>
        <TabsContent value="my">
          {renderTable(designs.filter(d => d.assignedEngineer === user.id))}
        </TabsContent>
      </Tabs>
    </div>
  );
}