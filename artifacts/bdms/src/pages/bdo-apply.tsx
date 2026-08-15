import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Lock } from 'lucide-react';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';

const TOTAL_STEPS = 4;

const STEP_LABELS = [
  'Personal Information',
  'Business & Experience',
  'KYC & Declaration',
  'Banking Information',
];

const TITLES = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof', 'Engr', 'Other'];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const NIGERIAN_BANKS = [
  'Access Bank','Citibank','EcoBank','Fidelity Bank','First Bank','First City Monument Bank (FCMB)',
  'GTBank','Heritage Bank','Keystone Bank','Polaris Bank','Providus Bank','Stanbic IBTC',
  'Standard Chartered','Sterling Bank','SunTrust Bank','Union Bank','United Bank for Africa (UBA)',
  'Unity Bank','Wema Bank','Zenith Bank','Kuda','Opay','Palmpay','Moniepoint','Carbon','Other',
];

const EDUCATION_LEVELS = [
  'Primary','Secondary (WAEC/NECO)','OND/NCE','HND/BSc','MSc/MBA','PhD','Other',
];

export default function BdoApply() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [refId, setRefId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Step 1 — Personal Information
    title: '',
    fullName: '',
    dob: '',
    address: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    // Step 2 — Business & Experience
    coverageAreas: '',
    hasOffice: '',
    officeAddress: '',
    officeCurrentUse: '',
    wantsVerjSticker: '',
    occupation: '',
    employerName: '',
    hasSalesExperience: '',
    previousSalesDetail: '',
    salesExperience: '',
    education: '',
    // Step 3 — KYC & Declaration
    referralSource: '',
    photoUrl: '',
    idDocumentUrl: '',
    declaration: false,
    // Step 4 — Banking
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const update = (key: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title) e.title = 'Required';
      if (!formData.fullName.trim()) e.fullName = 'Required';
      if (!formData.dob) e.dob = 'Required';
      if (!formData.address.trim()) e.address = 'Required';
      if (!formData.phone.trim()) e.phone = 'Required';
      if (!formData.email.trim()) e.email = 'Required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    }
    if (step === 2) {
      if (!formData.coverageAreas.trim()) e.coverageAreas = 'Required';
      if (!formData.hasOffice) e.hasOffice = 'Required';
      if (formData.hasOffice === 'Yes' && !formData.officeAddress.trim()) e.officeAddress = 'Required';
      if (!formData.occupation.trim()) e.occupation = 'Required';
      if (!formData.hasSalesExperience) e.hasSalesExperience = 'Required';
      if (!formData.salesExperience) e.salesExperience = 'Required';
      if (!formData.education) e.education = 'Required';
    }
    if (step === 3) {
      if (!formData.referralSource) e.referralSource = 'Required';
      if (!formData.photoUrl.trim()) e.photoUrl = 'Required';
      if (!formData.idDocumentUrl.trim()) e.idDocumentUrl = 'Required';
      if (!formData.declaration) e.declaration = 'You must accept the declaration';
    }
    if (step === 4) {
      if (!formData.bankName) e.bankName = 'Required';
      if (!formData.accountNumber.trim() || formData.accountNumber.length !== 10) e.accountNumber = 'Must be 10 digits';
      if (!formData.accountName.trim()) e.accountName = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
      const res = await fetch(`${BASE}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, declaration: formData.declaration ? 'true' : 'false' }),
      });
      const json = await res.json() as { ok?: boolean; refId?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Submission failed');
      setRefId(json.refId ?? '');
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const err = (key: string) =>
    errors[key] ? <p className="text-xs text-destructive mt-1">{errors[key]}</p> : null;

  const Header = () => (
    <div className="w-full bg-[#111] border-b shadow-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
        <img src={logoPath} alt="VERJ" className="h-8 object-contain flex-shrink-0"
          style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }} />
        <div>
          <div className="text-white font-black text-lg leading-none tracking-tight">BuDOM</div>
          <div className="text-white/50 text-[9px] font-semibold tracking-[0.15em] uppercase leading-none mt-0.5">by VERJ</div>
        </div>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-12 w-12 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Application Submitted!</h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Thank you, {formData.fullName}. Your application has been received. We will review your
                information and contact you at <span className="font-medium">{formData.email}</span> within 3–5 working days.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Application Reference</div>
              <div className="font-mono text-lg font-bold tracking-widest">{refId}</div>
              <div className="text-xs text-muted-foreground mt-1">Keep this reference for your records.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="w-full max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Become a VERJ BDO</h1>
          <p className="text-muted-foreground mt-1">Join VERJ as a Business Development Officer and redefine your limit.</p>
        </div>

        {/* Step progress */}
        <div className="mb-8 space-y-3">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}</span>
            <span>{Math.round(((step - 1) / TOTAL_STEPS) * 100)}% complete</span>
          </div>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="bg-muted/30 border-b pb-5">
            <CardTitle>{STEP_LABELS[step - 1]}</CardTitle>
            <CardDescription>Step {step} of {TOTAL_STEPS}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">

            {/* ─── STEP 1: Personal Information ─── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Select value={formData.title} onValueChange={v => update('title', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    {err('title')}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Full Name</Label>
                    <Input value={formData.fullName} onChange={e => update('fullName', e.target.value)} placeholder="As on your government ID" />
                    {err('fullName')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={formData.dob} onChange={e => update('dob', e.target.value)} />
                    {err('dob')}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={formData.phone} onChange={e => update('phone', e.target.value)} placeholder="+234 800 000 0000" />
                    {err('phone')}
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number <span className="text-muted-foreground font-normal text-xs">(if different)</span></Label>
                    <Input value={formData.whatsappNumber} onChange={e => update('whatsappNumber', e.target.value)} placeholder="+234 800 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" value={formData.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
                    {err('email')}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Residential Address</Label>
                  <Textarea value={formData.address} onChange={e => update('address', e.target.value)} placeholder="Full home address including street, city, and state" className="resize-none" rows={3} />
                  {err('address')}
                </div>
              </div>
            )}

            {/* ─── STEP 2: Business & Experience ─── */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">Business / Operating Information</h3>

                  <div className="space-y-2">
                    <Label>Which area(s) / state(s) would you be covering?</Label>
                    <Select value={formData.coverageAreas} onValueChange={v => update('coverageAreas', v)}>
                      <SelectTrigger><SelectValue placeholder="Select primary state" /></SelectTrigger>
                      <SelectContent>{NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Select your primary state. You can specify multiple areas in the notes during onboarding.</p>
                    {err('coverageAreas')}
                  </div>

                  <div className="space-y-2">
                    <Label>Do you have a shop or office space where you'll be operating from?</Label>
                    <Select value={formData.hasOffice} onValueChange={v => update('hasOffice', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Working on it">Working on it</SelectItem>
                      </SelectContent>
                    </Select>
                    {err('hasOffice')}
                  </div>

                  {formData.hasOffice === 'Yes' && (
                    <>
                      <div className="space-y-2">
                        <Label>Shop / Office Address</Label>
                        <Textarea value={formData.officeAddress} onChange={e => update('officeAddress', e.target.value)} placeholder="Full address of your shop or office" className="resize-none" rows={2} />
                        {err('officeAddress')}
                      </div>
                      <div className="space-y-2">
                        <Label>What is the shop/office currently being used for?</Label>
                        <Input value={formData.officeCurrentUse} onChange={e => update('officeCurrentUse', e.target.value)} placeholder="e.g. Electronics retail, Logistics, General merchandise" />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Would you like to receive a VERJ SOLAR flex or sticker to display at your location?</Label>
                    <Select value={formData.wantsVerjSticker} onValueChange={v => update('wantsVerjSticker', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">Employment & Experience</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Current Occupation</Label>
                      <Input value={formData.occupation} onChange={e => update('occupation', e.target.value)} placeholder="e.g. Sales Rep, Freelancer, Student" />
                      {err('occupation')}
                    </div>
                    <div className="space-y-2">
                      <Label>Name of Employer / Business Name <span className="text-muted-foreground font-normal text-xs">(if self-employed)</span></Label>
                      <Input value={formData.employerName} onChange={e => update('employerName', e.target.value)} placeholder="e.g. Dangote Group / Self-employed" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Do you have prior experience in Sales or Marketing?</Label>
                    <Select value={formData.hasSalesExperience} onValueChange={v => update('hasSalesExperience', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    {err('hasSalesExperience')}
                  </div>

                  {formData.hasSalesExperience === 'Yes' && (
                    <div className="space-y-2">
                      <Label>If yes, what did you sell?</Label>
                      <Input value={formData.previousSalesDetail} onChange={e => update('previousSalesDetail', e.target.value)} placeholder="e.g. Solar products, FMCG, Real estate, Insurance" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Level of Sales / Marketing Experience</Label>
                    <Select value={formData.salesExperience} onValueChange={v => update('salesExperience', v)}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No experience">No experience</SelectItem>
                        <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                        <SelectItem value="1–3 years">1–3 years</SelectItem>
                        <SelectItem value="3–5 years">3–5 years</SelectItem>
                        <SelectItem value="More than 5 years">More than 5 years</SelectItem>
                      </SelectContent>
                    </Select>
                    {err('salesExperience')}
                  </div>

                  <div className="space-y-2">
                    <Label>Highest Educational Qualification</Label>
                    <Select value={formData.education} onValueChange={v => update('education', v)}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>{EDUCATION_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                    {err('education')}
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 3: KYC & Declaration ─── */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">Application Source</h3>
                  <div className="space-y-2">
                    <Label>How did you hear about this opportunity?</Label>
                    <Select value={formData.referralSource} onValueChange={v => update('referralSource', v)}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        {['Social Media (Facebook / Instagram / TikTok)','Twitter / X','LinkedIn','WhatsApp','Friend or Family','Existing VERJ BDO','Google Search','VERJ Event / Exhibition','Radio / TV','Other'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {err('referralSource')}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">Identity Verification (KYC)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Upload your documents to Google Drive or Dropbox and paste the shareable links below.
                    Set sharing to <span className="font-medium">"Anyone with the link can view"</span> before pasting.
                  </p>

                  <div className="space-y-2">
                    <Label>Passport Photograph / Selfie (link)</Label>
                    <Input value={formData.photoUrl} onChange={e => update('photoUrl', e.target.value)} placeholder="https://drive.google.com/..." />
                    <p className="text-xs text-muted-foreground">Recent, clear, face-forward photo. No sunglasses or hats.</p>
                    {err('photoUrl')}
                  </div>

                  <div className="space-y-2">
                    <Label>Government-Issued ID (link)</Label>
                    <Input value={formData.idDocumentUrl} onChange={e => update('idDocumentUrl', e.target.value)} placeholder="https://drive.google.com/..." />
                    <p className="text-xs text-muted-foreground">NIN slip, International Passport, Driver's Licence, or Voter's Card.</p>
                    {err('idDocumentUrl')}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pb-1">Declaration</h3>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="declaration"
                      checked={formData.declaration}
                      onCheckedChange={v => update('declaration', !!v)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="declaration" className="font-medium cursor-pointer">I confirm and agree</Label>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                        I confirm that all information provided is true, accurate, and complete to the best of my knowledge.
                        I understand that false information may have negative consequences, including disqualification from the VERJ BDO programme.
                      </p>
                      {err('declaration')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 4: Banking Information ─── */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <Lock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-amber-800 leading-relaxed">
                    <span className="font-semibold block mb-0.5">Sensitive — Banking Information</span>
                    These details will be used for commission payments. Once you are onboarded, banking details become read-only.
                    Any changes must be requested and approved by the Chief Admin.
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Select value={formData.bankName} onValueChange={v => update('bankName', v)}>
                      <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                      <SelectContent>
                        {NIGERIAN_BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {err('bankName')}
                  </div>

                  <div className="space-y-2">
                    <Label>Bank Account Number</Label>
                    <Input
                      value={formData.accountNumber}
                      onChange={e => update('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit account number"
                      inputMode="numeric"
                    />
                    {err('accountNumber')}
                  </div>

                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      value={formData.accountName}
                      onChange={e => update('accountName', e.target.value)}
                      placeholder="Exact name on your bank account"
                    />
                    <p className="text-xs text-muted-foreground">Must match your bank records exactly.</p>
                    {err('accountName')}
                  </div>
                </div>
              </div>
            )}

          </CardContent>

          <CardFooter className="bg-muted/10 border-t flex justify-between p-6">
            <Button variant="outline" onClick={back} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < TOTAL_STEPS ? (
              <Button onClick={next}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {submitError && <p className="text-xs text-destructive">{submitError}</p>}
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? <><span className="mr-2 h-4 w-4 animate-spin inline-block border-2 border-current border-t-transparent rounded-full" />Submitting…</>
                    : <><Send className="h-4 w-4 mr-2" />Submit Application</>}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
