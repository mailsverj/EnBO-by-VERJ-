import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, BookOpen, Send, Loader2, AlertTriangle } from 'lucide-react';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';

interface Question {
  id: number;
  category: string;
  questionText: string;
  options: { label: string; value: string }[];
  points: number;
}

interface Result {
  score: number;
  total: number;
  passed: boolean;
  percentage: number;
  assessmentStatus: string;
}

const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

export default function Assessment() {
  const params = new URLSearchParams(window.location.search);
  const refFromUrl = params.get('ref')?.toUpperCase() ?? '';

  const [ref, setRef] = useState(refFromUrl);
  const [refInput, setRefInput] = useState(refFromUrl);
  const [phase, setPhase] = useState<'entry' | 'loading' | 'instructions' | 'quiz' | 'submitting' | 'result' | 'error'>(
    refFromUrl ? 'loading' : 'entry'
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [applicantName, setApplicantName] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchQuestions = async (appRef: string) => {
    setPhase('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${BASE}/api/assessment/questions?ref=${encodeURIComponent(appRef)}`);
      const json = await res.json() as { questions?: Question[]; applicantName?: string; error?: string; assessmentStatus?: string };
      if (!res.ok) {
        if (json.assessmentStatus) {
          setResult({ score: 0, total: 0, passed: json.assessmentStatus === 'Passed', percentage: 0, assessmentStatus: json.assessmentStatus });
          setPhase('result');
        } else {
          setErrorMsg(json.error ?? 'Unable to load assessment.');
          setPhase('error');
        }
        return;
      }
      setQuestions(json.questions ?? []);
      setApplicantName(json.applicantName ?? '');
      setRef(appRef);
      setPhase('instructions');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setPhase('error');
    }
  };

  useEffect(() => {
    if (refFromUrl) fetchQuestions(refFromUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    const clean = refInput.trim().toUpperCase();
    if (!clean) return;
    fetchQuestions(clean);
  };

  const handleBeginQuiz = () => {
    setCurrentQ(0);
    setAnswers({});
    setPhase('quiz');
  };

  const selectAnswer = (qId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    setPhase('submitting');
    try {
      const res = await fetch(`${BASE}/api/assessment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref, answers }),
      });
      const json = await res.json() as Result & { error?: string };
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Submission failed. Please try again.');
        setPhase('error');
        return;
      }
      setResult(json);
      setPhase('result');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setPhase('error');
    }
  };

  const answeredCount = Object.keys(answers).length;
  const q = questions[currentQ];
  const isLast = currentQ === questions.length - 1;
  const progress = Math.round(((currentQ + 1) / questions.length) * 100);

  const Header = () => (
    <div className="w-full bg-[#111] border-b border-border shadow-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
        <img src={logoPath} alt="VERJ" className="h-8 object-contain flex-shrink-0"
          style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }} />
        <div className="min-w-0">
          <div className="text-white font-black text-lg leading-none tracking-tight">BuDOM</div>
          <div className="text-white/50 text-[9px] font-semibold tracking-[0.15em] uppercase leading-none mt-0.5">by VERJ</div>
        </div>
      </div>
    </div>
  );

  // Entry — ask for app reference
  if (phase === 'entry') return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>BDO Competency Assessment</CardTitle>
            <CardDescription>Enter your application reference number to begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Application Reference</Label>
              <Input
                value={refInput}
                onChange={e => setRefInput(e.target.value.toUpperCase())}
                placeholder="e.g. APP-001"
                onKeyDown={e => e.key === 'Enter' && handleStart()}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStart} className="w-full" disabled={!refInput.trim()}>
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  // Loading
  if (phase === 'loading') return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );

  // Error
  if (phase === 'error') return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-sm">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
          <h2 className="text-xl font-bold">Unable to Load Assessment</h2>
          <p className="text-muted-foreground text-sm">{errorMsg}</p>
          <Button variant="outline" onClick={() => setPhase('entry')}>Try Again</Button>
        </div>
      </div>
    </div>
  );

  // Instructions
  if (phase === 'instructions') return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="w-full max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">BDO Competency Assessment</h1>
          <p className="text-muted-foreground mt-1">Welcome, {applicantName}. Please read the instructions carefully before you begin.</p>
        </div>
        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <BookOpen className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-900">Study the Training Workbook First</div>
                <p className="text-sm text-amber-800 mt-1">
                  Before starting this assessment, ensure you have reviewed the VERJ Solar BDO Training Workbook provided to you. The assessment covers: Solar Fundamentals, Sales & Marketing, VERJ Processes, Professional Conduct, and Customer Needs Assessment.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                `${questions.length} multiple-choice questions`,
                'A score of 70% or above is required to pass',
                'You may not retake the assessment once submitted',
                'Answer independently — this is a monitored competency test',
                'There is no time limit, but complete it in one sitting',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button onClick={handleBeginQuiz} className="w-full" size="lg">
              Begin Assessment <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  // Quiz
  if ((phase === 'quiz' || phase === 'submitting') && q) return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-muted/30 border-b">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{q.category}</div>
            <CardTitle className="text-lg leading-relaxed">{q.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {(q.options as { label: string; value: string }[]).map(opt => {
                const selected = answers[q.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => selectAnswer(q.id, opt.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-3 ${
                      selected
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm leading-relaxed">{opt.value}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentQ(c => c - 1)} disabled={currentQ === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {!isLast ? (
              <Button onClick={() => setCurrentQ(c => c + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < questions.length || phase === 'submitting'}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {phase === 'submitting'
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
                  : <><Send className="h-4 w-4 mr-2" /> Submit Assessment</>}
              </Button>
            )}
          </CardFooter>
        </Card>

        {isLast && answeredCount < questions.length && (
          <p className="text-xs text-center text-amber-600">
            Please answer all {questions.length} questions before submitting. ({questions.length - answeredCount} remaining)
          </p>
        )}
      </div>
    </div>
  );

  // Result
  if (phase === 'result' && result) return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center space-y-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {result.passed
              ? <CheckCircle2 className="h-12 w-12 text-green-600" />
              : <XCircle className="h-12 w-12 text-red-600" />}
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {result.assessmentStatus === 'Passed' || result.passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
            </h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              {result.passed
                ? `Congratulations${applicantName ? `, ${applicantName}` : ''}! You have passed the VERJ BDO Competency Assessment. Our team will be in touch regarding the next steps.`
                : `Thank you for completing the assessment. Unfortunately you did not meet the required score this time. Our team will contact you regarding the next steps.`}
            </p>
          </div>

          {result.total > 0 && (
            <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
              <div className="text-5xl font-black">{result.percentage}%</div>
              <div className="text-sm text-muted-foreground">{result.score} / {result.total} correct</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-400'}`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">Pass mark: 70%</div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">Reference: {ref}</p>
        </div>
      </div>
    </div>
  );

  return null;
}
