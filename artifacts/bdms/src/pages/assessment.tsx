import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, XCircle, ChevronRight, ChevronLeft,
  BookOpen, Send, Loader2, AlertTriangle, LockKeyhole, Trophy,
} from 'lucide-react';
import logoOnDark from '@assets/enbo-verj-logo-dark.png';

interface Question {
  id: number;
  category: string;
  questionText: string;
  options: { label: string; value: string }[];
  marks: number;
}

interface QuestionsResponse {
  questions: Question[];
  applicantName: string;
  total: number;
  totalMarks: number;
  attemptNumber: number;
  attemptsRemaining: number;
  // error states
  error?: string;
  assessmentStatus?: string;
  locked?: boolean;
}

interface Result {
  score: number;
  totalMarks: number;
  passed: boolean;
  percentage: number;
  assessmentStatus: string;
  attemptsUsed: number;
  attemptsRemaining: number;
  locked: boolean;
  error?: string;
}

type Phase = 'entry' | 'loading' | 'instructions' | 'quiz' | 'submitting' | 'result' | 'locked' | 'already_passed' | 'error';

const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
const MAX_ATTEMPTS = 2;

export default function Assessment() {
  const params = new URLSearchParams(window.location.search);
  const refFromUrl = params.get('ref')?.toUpperCase() ?? '';

  const [ref, setRef] = useState(refFromUrl);
  const [refInput, setRefInput] = useState(refFromUrl);
  const [phase, setPhase] = useState<Phase>(refFromUrl ? 'loading' : 'entry');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [applicantName, setApplicantName] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [attemptsRemainingBefore, setAttemptsRemainingBefore] = useState(MAX_ATTEMPTS);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchQuestions = async (appRef: string) => {
    setPhase('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${BASE}/api/assessment/questions?ref=${encodeURIComponent(appRef)}`);
      const json = await res.json() as QuestionsResponse;

      if (!res.ok) {
        if (json.assessmentStatus === 'Passed') {
          setPhase('already_passed');
        } else if (json.locked) {
          setPhase('locked');
        } else {
          setErrorMsg(json.error ?? 'Unable to load assessment.');
          setPhase('error');
        }
        return;
      }

      setQuestions(json.questions ?? []);
      setApplicantName(json.applicantName ?? '');
      setTotalMarks(json.totalMarks ?? 100);
      setAttemptNumber(json.attemptNumber ?? 1);
      setAttemptsRemainingBefore(json.attemptsRemaining ?? MAX_ATTEMPTS);
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
      const json = await res.json() as Result;
      if (!res.ok) {
        if (json.locked) { setPhase('locked'); return; }
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
  const progress = questions.length ? Math.round(((currentQ + 1) / questions.length) * 100) : 0;

  // ── Shared header ──────────────────────────────────────────────────────────
  const Header = () => (
    <div className="w-full bg-[#111] border-b border-border shadow-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
        <img
          src={logoOnDark}
          alt="EnBO by VERJ"
          className="h-11 w-auto object-contain"
        />
      </div>
    </div>
  );

  // ── Entry ──────────────────────────────────────────────────────────────────
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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
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

  // ── Already passed ─────────────────────────────────────────────────────────
  if (phase === 'already_passed') return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Trophy className="h-12 w-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black">You've Already Passed!</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              You have already passed the VERJ BDO Competency Assessment. Our team will be in touch with the next steps in your onboarding journey.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Reference: {ref || refInput}</p>
        </div>
      </div>
    </div>
  );

  // ── Locked out ────────────────────────────────────────────────────────────
  if (phase === 'locked') return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <LockKeyhole className="h-12 w-12 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Assessment Locked</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              You have used all {MAX_ATTEMPTS} of your available attempts and did not meet the required score. Your application has been marked accordingly.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              If you believe this is an error or would like to request a review, please contact{' '}
              <a href="mailto:mails.verj@gmail.com" className="text-primary underline">mails.verj@gmail.com</a>.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Reference: {ref || refInput}</p>
        </div>
      </div>
    </div>
  );

  // ── Instructions ───────────────────────────────────────────────────────────
  if (phase === 'instructions') return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="w-full max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">BDO Competency Assessment</h1>
          <p className="text-muted-foreground mt-1">
            Welcome, <span className="font-semibold text-foreground">{applicantName}</span>. Please read the instructions carefully before you begin.
          </p>
        </div>

        {/* Attempt indicator */}
        {attemptNumber > 1 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-900">This is your final attempt</div>
              <p className="text-sm text-amber-800 mt-1">
                You did not pass on your first attempt. This is attempt {attemptNumber} of {MAX_ATTEMPTS}. You must score at least 70 out of 100 to pass.
              </p>
            </div>
          </div>
        )}

        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <BookOpen className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-900">Study the Training Workbook First</div>
                <p className="text-sm text-amber-800 mt-1">
                  Before starting, ensure you have reviewed the VERJ Solar BDO Training Workbook. The assessment covers: Solar Fundamentals, Sales & Marketing, VERJ Processes, Professional Conduct, and Customer Needs Assessment.
                </p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-black">{questions.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Questions</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-black">{totalMarks}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Marks</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-black text-green-600">70%</div>
                <div className="text-xs text-muted-foreground mt-1">Pass Mark</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-black">{attemptsRemainingBefore}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {attemptsRemainingBefore === 1 ? 'Attempt Left' : 'Attempts Left'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                '10 critical questions worth 4 marks each (40 marks total)',
                '20 standard questions worth 3 marks each (60 marks total)',
                'Score 70 or above out of 100 to pass',
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
              Begin Assessment — Attempt {attemptNumber} of {MAX_ATTEMPTS} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  // ── Quiz ───────────────────────────────────────────────────────────────────
  if ((phase === 'quiz' || phase === 'submitting') && q) return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{answeredCount} of {questions.length} answered</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{q.category}</span>
              <Badge variant={q.marks >= 4 ? 'default' : 'secondary'} className="text-xs">
                {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                {q.marks >= 4 && <span className="ml-1 opacity-75">· Critical</span>}
              </Badge>
            </div>
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
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                      selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`}>
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

  // ── Result ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const passMarkScore = Math.ceil(totalMarks * 0.7);
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-6">

            {/* Icon + headline */}
            <div className="text-center space-y-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-sm ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                {result.passed
                  ? <CheckCircle2 className="h-12 w-12 text-green-600" />
                  : <XCircle className="h-12 w-12 text-red-600" />}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  {result.passed ? 'Assessment Passed!' : 'Not Passed'}
                </h1>
                <p className="text-muted-foreground mt-2 leading-relaxed text-sm">
                  {result.passed
                    ? `Congratulations${applicantName ? `, ${applicantName}` : ''}! You have passed the VERJ BDO Competency Assessment. Our team will be in touch with the next steps.`
                    : result.locked
                      ? `You have used all ${MAX_ATTEMPTS} attempts. Your application has been updated. Please contact mails.verj@gmail.com if you wish to request a review.`
                      : `You did not meet the required score this time. You have ${result.attemptsRemaining} attempt${result.attemptsRemaining === 1 ? '' : 's'} remaining.`}
                </p>
              </div>
            </div>

            {/* Score card */}
            <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
              {/* Big percentage */}
              <div className="text-center">
                <div className={`text-6xl font-black ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                  {result.percentage}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.score} / {result.totalMarks} marks
                </div>
              </div>

              {/* Score bar */}
              <div className="space-y-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                  {/* Pass line marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                    style={{ left: '70%' }}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${result.passed ? 'bg-green-500' : 'bg-red-400'}`}
                    style={{ width: `${result.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="text-amber-600 font-medium">Pass: {passMarkScore}</span>
                  <span>{result.totalMarks}</span>
                </div>
              </div>

              {/* Breakdown grid */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold">{result.score}</div>
                  <div className="text-xs text-muted-foreground">Your score</div>
                </div>
                <div className="text-center border-x">
                  <div className="text-lg font-bold">{passMarkScore}</div>
                  <div className="text-xs text-muted-foreground">Pass mark</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                    {result.passed ? 'PASS' : 'FAIL'}
                  </div>
                  <div className="text-xs text-muted-foreground">Outcome</div>
                </div>
              </div>
            </div>

            {/* Attempt status (only on fail) */}
            {!result.passed && (
              <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                result.locked
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                {result.locked
                  ? <LockKeyhole className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                <div>
                  <div className={`font-semibold text-sm ${result.locked ? 'text-red-900' : 'text-amber-900'}`}>
                    {result.locked ? 'No attempts remaining — assessment locked' : `${result.attemptsRemaining} attempt remaining`}
                  </div>
                  <p className={`text-xs mt-1 ${result.locked ? 'text-red-800' : 'text-amber-800'}`}>
                    {result.locked
                      ? 'Contact mails.verj@gmail.com to request a review.'
                      : 'Review the training workbook, then return to this page with your reference number to try again.'}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground">Reference: {ref}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
