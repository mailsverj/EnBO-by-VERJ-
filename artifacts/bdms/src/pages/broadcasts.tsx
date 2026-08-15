import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Send, Trash2, CheckCheck, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';

export default function Broadcasts() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const canSend = hasRole('Super Admin') || hasRole('Chief Admin') || hasRole('Management');

  const { data, isLoading } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => api.broadcasts.list(),
    refetchInterval: 30_000,
  });
  const broadcasts = data?.broadcasts ?? [];
  const unread = broadcasts.filter((b: any) => !b.readAt).length;

  const markReadMut = useMutation({
    mutationFn: (id: number) => api.broadcasts.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['broadcasts'] }),
  });
  const markAllReadMut = useMutation({
    mutationFn: () => api.broadcasts.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['broadcasts'] }),
  });
  const sendMut = useMutation({
    mutationFn: (d: { title: string; message: string; targetRoles: string }) => api.broadcasts.send(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['broadcasts'] });
      toast({ title: 'Broadcast sent!' });
      setComposeOpen(false);
      setForm({ title: '', message: '', targetRoles: 'all' });
    },
    onError: (e) => toast({ title: 'Failed to send', description: (e as Error).message, variant: 'destructive' }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.broadcasts.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['broadcasts'] }),
  });

  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetRoles: 'all' });
  const [selectedBroadcast, setSelectedBroadcast] = useState<any>(null);

  const targetLabel = (t: string) => {
    if (t === 'all') return 'Everyone';
    if (t === 'BDO') return 'All BDOs';
    if (t === 'Engineer') return 'All Engineers';
    return t;
  };
  const targetColor = (t: string) => {
    if (t === 'all') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (t === 'BDO') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (t === 'Engineer') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Megaphone className="h-7 w-7 text-primary" />
            Broadcasts
            {unread > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200">{unread} unread</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Send announcements to BDOs, engineers, or the entire team.</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <Button variant="outline" onClick={() => markAllReadMut.mutate()} disabled={markAllReadMut.isPending}>
              <CheckCheck className="h-4 w-4 mr-2" /> Mark All Read
            </Button>
          )}
          {canSend && (
            <Button onClick={() => setComposeOpen(true)}>
              <Send className="h-4 w-4 mr-2" /> New Broadcast
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && broadcasts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Megaphone className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <div className="text-sm">No broadcasts yet.</div>
            </div>
          )}
          {broadcasts.map((b: any) => (
            <div
              key={b.id}
              className={`flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${!b.readAt ? 'bg-primary/3' : ''}`}
              onClick={() => { setSelectedBroadcast(b); if (!b.readAt) markReadMut.mutate(b.id); }}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!b.readAt ? 'bg-primary' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${!b.readAt ? 'text-foreground' : 'text-muted-foreground'}`}>{b.title}</span>
                  <Badge variant="outline" className={`text-xs ${targetColor(b.targetRoles)}`}>{targetLabel(b.targetRoles)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{b.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(b.createdAt), 'MMM d, yyyy · h:mm a')}</span>
                  {b.sentByName && <span>· Sent by {b.sentByName}</span>}
                  {b.readAt && <span className="text-green-600">· Read</span>}
                </div>
              </div>
              {canSend && (
                <Button
                  variant="ghost" size="icon"
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={e => { e.stopPropagation(); deleteMut.mutate(b.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!selectedBroadcast} onOpenChange={o => !o && setSelectedBroadcast(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedBroadcast?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${targetColor(selectedBroadcast?.targetRoles ?? '')}`}>
                {targetLabel(selectedBroadcast?.targetRoles ?? '')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {selectedBroadcast?.createdAt && format(new Date(selectedBroadcast.createdAt), 'MMMM d, yyyy · h:mm a')}
              </span>
              {selectedBroadcast?.sentByName && (
                <span className="text-xs text-muted-foreground">· {selectedBroadcast.sentByName}</span>
              )}
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border">
              {selectedBroadcast?.message}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedBroadcast(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Broadcast</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject / Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Important: New pricing update" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Write your message here..."
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Send To</Label>
              <Select value={form.targetRoles} onValueChange={v => setForm(f => ({ ...f, targetRoles: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone (All Users)</SelectItem>
                  <SelectItem value="BDO">BDOs Only</SelectItem>
                  <SelectItem value="Engineer">Engineers Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This message will appear in the Broadcasts inbox of all matched users.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button
              onClick={() => sendMut.mutate(form)}
              disabled={!form.title.trim() || !form.message.trim() || sendMut.isPending}
            >
              {sendMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
