import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Pencil, Trash2, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  BookOpen, ClipboardList, Loader2, GripVertical, AlertTriangle, Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import type { AssessmentQuestion, TrainingChapter, ChapterBlock, ChapterSection } from '@/lib/api';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContentAdmin() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Editor</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage assessment questions and training chapter content.</p>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions" className="gap-2">
            <ClipboardList className="h-4 w-4" /> Assessment Questions
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-2">
            <BookOpen className="h-4 w-4" /> Training Chapters
          </TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="mt-6">
          <QuestionsTab />
        </TabsContent>
        <TabsContent value="training" className="mt-6">
          <TrainingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Questions Tab ────────────────────────────────────────────────────────────

function QuestionsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ open: boolean; question: AssessmentQuestion | null }>({ open: false, question: null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'questions'],
    queryFn: api.admin.questions.list,
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.admin.questions.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'questions'] }),
  });

  const deleteQ = useMutation({
    mutationFn: api.admin.questions.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
      setDeleteId(null);
      toast({ title: 'Question deleted' });
    },
  });

  const questions = data?.questions ?? [];
  const activeCount = questions.filter(q => q.active).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} questions &middot; <span className="text-green-600 font-medium">{activeCount} active</span>
        </p>
        <Button size="sm" className="gap-2" onClick={() => setModal({ open: true, question: null })}>
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm">Add your first assessment question above.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Question</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Marks</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Active</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {questions.map((q, i) => (
                <tr key={q.id} className={`hover:bg-muted/20 transition-colors ${!q.active ? 'opacity-50' : ''}`}>
                  <td className="p-3 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="p-3">
                    <div className="line-clamp-2 font-medium leading-snug">{q.questionText}</div>
                    <div className="md:hidden text-xs text-muted-foreground mt-0.5">{q.category} · {q.marks} marks</div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{q.marks}</td>
                  <td className="p-3">
                    <Switch
                      checked={q.active}
                      onCheckedChange={(active) => toggleActive.mutate({ id: q.id, active })}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        onClick={() => setModal({ open: true, question: q })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(q.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QuestionModal
        open={modal.open}
        question={modal.question}
        onClose={() => setModal({ open: false, question: null })}
      />

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete Question?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. The question will be permanently removed from the assessment.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteQ.mutate(deleteId)}>
              {deleteQ.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Question Add/Edit Modal ──────────────────────────────────────────────────

const BLANK_QUESTION = {
  category: '',
  questionText: '',
  optA: '', optB: '', optC: '', optD: '',
  correctOption: 'a',
  marks: 3,
  active: true,
};

function QuestionModal({ open, question, onClose }: {
  open: boolean;
  question: AssessmentQuestion | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = question !== null;

  const [form, setForm] = useState(BLANK_QUESTION);

  useEffect(() => {
    if (question) {
      const opts = question.options as { label: string; value: string }[];
      setForm({
        category: question.category,
        questionText: question.questionText,
        optA: opts.find(o => o.value === 'a')?.label ?? '',
        optB: opts.find(o => o.value === 'b')?.label ?? '',
        optC: opts.find(o => o.value === 'c')?.label ?? '',
        optD: opts.find(o => o.value === 'd')?.label ?? '',
        correctOption: question.correctOption,
        marks: question.marks,
        active: question.active,
      });
    } else {
      setForm(BLANK_QUESTION);
    }
  }, [question, open]);

  const save = useMutation({
    mutationFn: () => {
      const options = [
        { label: form.optA, value: 'a' },
        { label: form.optB, value: 'b' },
        { label: form.optC, value: 'c' },
        { label: form.optD, value: 'd' },
      ];
      const payload = {
        category: form.category,
        questionText: form.questionText,
        options,
        correctOption: form.correctOption,
        marks: form.marks,
        active: form.active,
      };
      return isEdit
        ? api.admin.questions.update(question!.id, payload)
        : api.admin.questions.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'questions'] });
      toast({ title: isEdit ? 'Question updated' : 'Question added' });
      onClose();
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const set = (key: keyof typeof form) => (val: string | number | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Question' : 'Add Question'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={form.category} onChange={e => set('category')(e.target.value)}
                placeholder="e.g. Solar Fundamentals" />
            </div>
            <div className="space-y-1.5">
              <Label>Marks</Label>
              <Input type="number" value={form.marks} min={1} max={20}
                onChange={e => set('marks')(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Question Text</Label>
            <Textarea value={form.questionText} rows={3}
              onChange={e => set('questionText')(e.target.value)}
              placeholder="Enter the question..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['A', 'B', 'C', 'D'] as const).map(letter => {
              const key = `opt${letter}` as 'optA' | 'optB' | 'optC' | 'optD';
              const value = letter.toLowerCase();
              return (
                <div key={letter} className={`space-y-1.5 p-3 rounded-lg border-2 transition-colors ${form.correctOption === value ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Option {letter}</Label>
                    <button
                      type="button"
                      onClick={() => set('correctOption')(value)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${form.correctOption === value ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {form.correctOption === value ? '✓ Correct' : 'Set correct'}
                    </button>
                  </div>
                  <Input value={form[key]} onChange={e => set(key)(e.target.value)}
                    placeholder={`Option ${letter} text`} className="text-sm" />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Switch checked={form.active} onCheckedChange={v => set('active')(v)} />
            <Label className="cursor-pointer">Active (included in assessments)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {isEdit ? 'Save Changes' : 'Add Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Training Tab ─────────────────────────────────────────────────────────────

function TrainingTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<TrainingChapter | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'training'],
    queryFn: api.admin.training.list,
  });

  const seed = useMutation({
    mutationFn: api.admin.training.seed,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin', 'training'] });
      toast({ title: `Seeded ${res.seeded} chapters` });
    },
    onError: (e: Error) => toast({ title: 'Seed failed', description: e.message, variant: 'destructive' }),
  });

  const chapters = data?.chapters ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{chapters.length} chapters</p>
        {chapters.length === 0 && (
          <Button size="sm" className="gap-2" onClick={() => seed.mutate()} disabled={seed.isPending}>
            {seed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Load Default Content
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No chapters in the database</p>
          <p className="text-sm mt-1">Click "Load Default Content" to populate all 8 chapters from the built-in content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((ch, i) => (
            <button
              key={ch.chapterId}
              onClick={async () => {
                const full = await api.admin.training.get(ch.chapterId);
                setEditing(full.chapter);
              }}
              className="text-left p-5 rounded-xl border hover:border-primary hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
              <div className="mt-3">
                <div className="font-semibold leading-snug">{ch.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{ch.subtitle}</div>
              </div>
              {ch.updatedAt && (
                <div className="text-xs text-muted-foreground/60 mt-3">
                  Updated {new Date(ch.updatedAt).toLocaleDateString()}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {editing && (
        <ChapterEditorDialog
          chapter={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ─── Chapter Editor Dialog ────────────────────────────────────────────────────

function ChapterEditorDialog({ chapter, onClose }: { chapter: TrainingChapter; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState(chapter.title);
  const [subtitle, setSubtitle] = useState(chapter.subtitle ?? '');
  const [sections, setSections] = useState<ChapterSection[]>(
    (chapter.content as { sections: ChapterSection[] }).sections ?? []
  );

  const save = useMutation({
    mutationFn: () =>
      api.admin.training.update(chapter.chapterId, { title, subtitle, content: { sections } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'training'] });
      qc.invalidateQueries({ queryKey: ['training'] });
      toast({ title: 'Chapter saved' });
      onClose();
    },
    onError: (e: Error) => toast({ title: 'Save failed', description: e.message, variant: 'destructive' }),
  });

  const updateSection = (idx: number, updated: ChapterSection) => {
    setSections(prev => prev.map((s, i) => i === idx ? updated : s));
  };

  const addSection = () => {
    setSections(prev => [...prev, { title: 'New Section', blocks: [{ type: 'paragraph', text: '' }] }]);
  };

  const removeSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setSections(next);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Edit Chapter</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label>Chapter Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="font-semibold" />
            </div>
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Sections ({sections.length})</Label>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={addSection}>
                <Plus className="h-3.5 w-3.5" /> Add Section
              </Button>
            </div>

            {sections.map((section, idx) => (
              <SectionEditor
                key={idx}
                section={section}
                index={idx}
                total={sections.length}
                onChange={(s) => updateSection(idx, s)}
                onRemove={() => removeSection(idx)}
                onMove={(dir) => moveSection(idx, dir)}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Save Chapter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Section Editor ───────────────────────────────────────────────────────────

function SectionEditor({ section, index, total, onChange, onRemove, onMove }: {
  section: ChapterSection;
  index: number;
  total: number;
  onChange: (s: ChapterSection) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(index === 0);

  const updateBlock = (bi: number, block: ChapterBlock) => {
    onChange({ ...section, blocks: section.blocks.map((b, i) => i === bi ? block : b) });
  };

  const addBlock = (type: ChapterBlock['type']) => {
    const newBlock = makeEmptyBlock(type);
    onChange({ ...section, blocks: [...section.blocks, newBlock] });
  };

  const removeBlock = (bi: number) => {
    onChange({ ...section, blocks: section.blocks.filter((_, i) => i !== bi) });
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Input
          value={section.title}
          onChange={e => onChange({ ...section, title: e.target.value })}
          className="h-7 text-sm font-medium flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
          placeholder="Section title"
        />
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onMove(-1)} disabled={index === 0}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onMove(1)} disabled={index === total - 1}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setOpen(v => !v)}>
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="px-4 py-3 space-y-3">
          {section.blocks.map((block, bi) => (
            <div key={bi} className="relative group">
              <BlockEditor block={block} onChange={b => updateBlock(bi, b)} />
              <button
                onClick={() => removeBlock(bi)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add block */}
          <AddBlockMenu onAdd={addBlock} />
        </div>
      )}
    </div>
  );
}

// ─── Block Editor ─────────────────────────────────────────────────────────────

function BlockEditor({ block, onChange }: { block: ChapterBlock; onChange: (b: ChapterBlock) => void }) {
  const typeBadge = <Badge variant="outline" className="text-xs mb-2">{block.type}</Badge>;

  if (block.type === 'paragraph') return (
    <div className="space-y-1">
      {typeBadge}
      <Textarea
        value={block.text}
        onChange={e => onChange({ ...block, text: e.target.value })}
        rows={3}
        placeholder="Paragraph text (use **bold** for emphasis)"
        className="text-sm"
      />
    </div>
  );

  if (block.type === 'callout') return (
    <div className="space-y-2">
      {typeBadge}
      <Select value={block.variant} onValueChange={v => onChange({ ...block, variant: v as 'tip' | 'warning' | 'key' })}>
        <SelectTrigger className="h-8 text-xs w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tip">💡 Tip</SelectItem>
          <SelectItem value="warning">⚠️ Warning</SelectItem>
          <SelectItem value="key">🔑 Key Concept</SelectItem>
        </SelectContent>
      </Select>
      <Textarea value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} rows={2} className="text-sm" />
    </div>
  );

  if (block.type === 'list') return (
    <div className="space-y-1">
      {typeBadge}
      <Textarea
        value={block.items.join('\n')}
        onChange={e => onChange({ ...block, items: e.target.value.split('\n') })}
        rows={Math.max(3, block.items.length + 1)}
        placeholder="One item per line"
        className="text-sm font-mono"
      />
      <p className="text-xs text-muted-foreground">One item per line</p>
    </div>
  );

  if (block.type === 'pipeline') return (
    <div className="space-y-1">
      {typeBadge}
      <Textarea
        value={block.items.join('\n')}
        onChange={e => onChange({ ...block, items: e.target.value.split('\n') })}
        rows={Math.max(3, block.items.length + 1)}
        placeholder="One step per line"
        className="text-sm font-mono"
      />
      <p className="text-xs text-muted-foreground">One step per line</p>
    </div>
  );

  if (block.type === 'formula') return (
    <div className="space-y-2">
      {typeBadge}
      <Input value={block.label} onChange={e => onChange({ ...block, label: e.target.value })}
        placeholder="Label (e.g. Battery Capacity Formula)" className="text-sm" />
      <Input value={block.formula} onChange={e => onChange({ ...block, formula: e.target.value })}
        placeholder="Formula (e.g. Total Load × 1.25)" className="text-sm font-mono" />
      <Textarea value={block.explanation} onChange={e => onChange({ ...block, explanation: e.target.value })}
        rows={2} placeholder="Explanation" className="text-sm" />
    </div>
  );

  if (block.type === 'cards') return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {typeBadge}
        <Select value={String(block.columns ?? 2)} onValueChange={v => onChange({ ...block, columns: Number(v) as 2 | 3 })}>
          <SelectTrigger className="h-7 text-xs w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 columns</SelectItem>
            <SelectItem value="3">3 columns</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        {block.items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 p-2 rounded border bg-muted/20 text-sm">
            <Input value={item.title} onChange={e => {
              const items = [...block.items];
              items[i] = { ...items[i], title: e.target.value };
              onChange({ ...block, items });
            }} placeholder="Title" className="h-7 text-xs" />
            <Input value={item.body} onChange={e => {
              const items = [...block.items];
              items[i] = { ...items[i], body: e.target.value };
              onChange({ ...block, items });
            }} placeholder="Body" className="h-7 text-xs" />
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => {
              onChange({ ...block, items: block.items.filter((_, j) => j !== i) });
            }}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => {
          onChange({ ...block, items: [...block.items, { title: '', body: '' }] });
        }}><Plus className="h-3 w-3" /> Add Card</Button>
      </div>
    </div>
  );

  if (block.type === 'keyterms') return (
    <div className="space-y-2">
      {typeBadge}
      {block.terms.map((t, i) => (
        <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
          <Input value={t.term} onChange={e => {
            const terms = [...block.terms];
            terms[i] = { ...terms[i], term: e.target.value };
            onChange({ ...block, terms });
          }} placeholder="Term" className="h-7 text-xs" />
          <Input value={t.def} onChange={e => {
            const terms = [...block.terms];
            terms[i] = { ...terms[i], def: e.target.value };
            onChange({ ...block, terms });
          }} placeholder="Definition" className="h-7 text-xs" />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => {
            onChange({ ...block, terms: block.terms.filter((_, j) => j !== i) });
          }}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => {
        onChange({ ...block, terms: [...block.terms, { term: '', def: '' }] });
      }}><Plus className="h-3 w-3" /> Add Term</Button>
    </div>
  );

  if (block.type === 'steps') return (
    <div className="space-y-2">
      {typeBadge}
      {block.items.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
          <Input value={s.label} onChange={e => {
            const items = [...block.items];
            items[i] = { ...items[i], label: e.target.value };
            onChange({ ...block, items });
          }} placeholder="Label" className="h-7 text-xs" />
          <Input value={s.desc} onChange={e => {
            const items = [...block.items];
            items[i] = { ...items[i], desc: e.target.value };
            onChange({ ...block, items });
          }} placeholder="Description" className="h-7 text-xs" />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => {
            onChange({ ...block, items: block.items.filter((_, j) => j !== i) });
          }}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => {
        onChange({ ...block, items: [...block.items, { label: '', desc: '' }] });
      }}><Plus className="h-3 w-3" /> Add Step</Button>
    </div>
  );

  if (block.type === 'objections') return (
    <div className="space-y-2">
      {typeBadge}
      {block.items.map((o, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
          <Textarea value={o.obj} onChange={e => {
            const items = [...block.items];
            items[i] = { ...items[i], obj: e.target.value };
            onChange({ ...block, items });
          }} placeholder="Objection" rows={2} className="text-xs" />
          <Textarea value={o.res} onChange={e => {
            const items = [...block.items];
            items[i] = { ...items[i], res: e.target.value };
            onChange({ ...block, items });
          }} placeholder="Response" rows={2} className="text-xs" />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => {
            onChange({ ...block, items: block.items.filter((_, j) => j !== i) });
          }}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => {
        onChange({ ...block, items: [...block.items, { obj: '', res: '' }] });
      }}><Plus className="h-3 w-3" /> Add Objection</Button>
    </div>
  );

  if (block.type === 'dodont') return (
    <div className="space-y-2">
      {typeBadge}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-green-600 font-semibold">✓ Do</Label>
          <Textarea value={block.dos.join('\n')} onChange={e => onChange({ ...block, dos: e.target.value.split('\n') })}
            rows={5} placeholder="One item per line" className="text-xs font-mono" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-red-600 font-semibold">✗ Don't</Label>
          <Textarea value={block.donts.join('\n')} onChange={e => onChange({ ...block, donts: e.target.value.split('\n') })}
            rows={5} placeholder="One item per line" className="text-xs font-mono" />
        </div>
      </div>
    </div>
  );

  if (block.type === 'table') return (
    <div className="space-y-1">
      {typeBadge}
      <div className="space-y-1">
        <Label className="text-xs">Headers (comma-separated)</Label>
        <Input value={block.headers.join(', ')} onChange={e => onChange({ ...block, headers: e.target.value.split(',').map(s => s.trim()) })}
          className="text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Rows (one row per line, cells comma-separated)</Label>
        <Textarea
          value={block.rows.map(r => r.join(', ')).join('\n')}
          onChange={e => onChange({ ...block, rows: e.target.value.split('\n').map(row => row.split(',').map(c => c.trim())) })}
          rows={Math.max(3, block.rows.length + 1)}
          className="text-xs font-mono"
        />
      </div>
    </div>
  );

  if (block.type === 'assessment_cta') return (
    <div className="space-y-1">
      {typeBadge}
      <div className="text-xs text-muted-foreground p-3 rounded bg-muted/30 border border-dashed">
        Assessment call-to-action button — no editable content
      </div>
    </div>
  );

  return (
    <div className="text-xs text-muted-foreground p-2 border rounded">Unknown block type: {(block as any).type}</div>
  );
}

// ─── Add Block Menu ───────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: ChapterBlock['type']; label: string }[] = [
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'callout', label: 'Callout' },
  { type: 'list', label: 'Bullet List' },
  { type: 'cards', label: 'Cards Grid' },
  { type: 'keyterms', label: 'Key Terms' },
  { type: 'formula', label: 'Formula' },
  { type: 'steps', label: 'Steps' },
  { type: 'pipeline', label: 'Pipeline' },
  { type: 'dodont', label: 'Do / Don\'t' },
  { type: 'table', label: 'Table' },
  { type: 'objections', label: 'Objections' },
  { type: 'assessment_cta', label: 'Assessment CTA' },
];

function AddBlockMenu({ onAdd }: { onAdd: (type: ChapterBlock['type']) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button size="sm" variant="dashed" className="w-full gap-1.5 h-8 text-xs text-muted-foreground border-dashed" onClick={() => setOpen(v => !v)}>
        <Plus className="h-3.5 w-3.5" /> Add Block
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 z-50 bg-popover border rounded-lg shadow-lg p-2 grid grid-cols-3 gap-1 min-w-[260px]">
          {BLOCK_TYPES.map(bt => (
            <button key={bt.type} onClick={() => { onAdd(bt.type); setOpen(false); }}
              className="text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors">
              {bt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function makeEmptyBlock(type: ChapterBlock['type']): ChapterBlock {
  switch (type) {
    case 'paragraph': return { type, text: '' };
    case 'callout': return { type, variant: 'tip', text: '' };
    case 'list': return { type, items: [''] };
    case 'pipeline': return { type, items: [''] };
    case 'cards': return { type, columns: 2, items: [{ title: '', body: '' }] };
    case 'keyterms': return { type, terms: [{ term: '', def: '' }] };
    case 'formula': return { type, label: '', formula: '', explanation: '' };
    case 'steps': return { type, items: [{ label: '', desc: '' }] };
    case 'objections': return { type, items: [{ obj: '', res: '' }] };
    case 'dodont': return { type, dos: [''], donts: [''] };
    case 'table': return { type, headers: ['Column 1', 'Column 2'], rows: [['', '']] };
    case 'assessment_cta': return { type };
    default: return { type: 'paragraph', text: '' };
  }
}
