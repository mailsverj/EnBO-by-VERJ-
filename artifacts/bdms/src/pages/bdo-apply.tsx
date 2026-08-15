import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, ChevronRight, ChevronLeft, Send } from 'lucide-react';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function BdoApply() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', gender: '', dob: '', state: '', lga: '', address: '',
    nin: '', bvn: '', bankName: '', accountNumber: '', accountName: '', guarantorName: '', guarantorPhone: '', guarantorRelationship: '', guarantorAddress: '',
    referralSource: '', salesExperience: '', statement: '', consent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Required';
      if (!formData.email) newErrors.email = 'Required';
      if (!formData.phone) newErrors.phone = 'Required';
      if (!formData.gender) newErrors.gender = 'Required';
      if (!formData.dob) newErrors.dob = 'Required';
      if (!formData.state) newErrors.state = 'Required';
      if (!formData.lga) newErrors.lga = 'Required';
      if (!formData.address) newErrors.address = 'Required';
    } else if (step === 2) {
      if (!formData.nin || formData.nin.length !== 11) newErrors.nin = 'Must be 11 digits';
      if (!formData.bvn || formData.bvn.length !== 11) newErrors.bvn = 'Must be 11 digits';
      if (!formData.bankName) newErrors.bankName = 'Required';
      if (!formData.accountNumber || formData.accountNumber.length !== 10) newErrors.accountNumber = 'Must be 10 digits';
      if (!formData.accountName) newErrors.accountName = 'Required';
      if (!formData.guarantorName) newErrors.guarantorName = 'Required';
      if (!formData.guarantorPhone) newErrors.guarantorPhone = 'Required';
      if (!formData.guarantorRelationship) newErrors.guarantorRelationship = 'Required';
      if (!formData.guarantorAddress) newErrors.guarantorAddress = 'Required';
    } else if (step === 3) {
      if (!formData.referralSource) newErrors.referralSource = 'Required';
      if (!formData.salesExperience) newErrors.salesExperience = 'Required';
      if (!formData.statement) newErrors.statement = 'Required';
      if (!formData.consent) newErrors.consent = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);
  const handleSubmit = () => {
    if (validateStep()) setSubmitted(true);
  };

  const updateForm = (key: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const err = (key: string) => errors[key] ? <p className="text-xs text-destructive mt-1">{errors[key]}</p> : null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center py-20 px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <CheckCircle2 className="h-12 w-12 text-amber-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Application Submitted!</h1>
          <p className="text-muted-foreground leading-relaxed">
            Thank you, {formData.fullName || 'Applicant'}. Your application has been received. 
            We will review your application and contact you at {formData.email || 'your email'} within 3-5 working days.
          </p>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm tracking-widest text-muted-foreground border">
            Application Reference: APP-{Math.floor(100000 + Math.random() * 900000)}
          </div>
          <Button asChild className="mt-8" size="lg">
            <a href="#">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center">
      <div className="w-full bg-[#111] border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <img
            src={logoPath}
            alt="VERJ"
            className="h-8 object-contain flex-shrink-0"
            style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }}
          />
          <div className="min-w-0">
            <div className="text-white font-black text-lg leading-none tracking-tight">BuDOM</div>
            <div className="text-white/50 text-[9px] font-semibold tracking-[0.15em] uppercase leading-none mt-0.5">by VERJ</div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl px-4 py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Become a BDO</h1>
          <p className="text-muted-foreground">Join VERJ as a Business Development Officer and redefine your limit.</p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
          ))}
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle>
              {step === 1 && "Personal Information"}
              {step === 2 && "Identity & Banking"}
              {step === 3 && "Experience & Declaration"}
            </CardTitle>
            <CardDescription>
              Step {step} of 3
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} placeholder="John Doe" />
                    {err('fullName')}
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="john@example.com" />
                    {err('email')}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+234..." />
                    {err('phone')}
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={formData.dob} onChange={e => updateForm('dob', e.target.value)} />
                    {err('dob')}
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={v => updateForm('gender', v)}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {err('gender')}
                  </div>
                  <div className="space-y-2">
                    <Label>State of Residence</Label>
                    <Select value={formData.state} onValueChange={v => updateForm('state', v)}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {err('state')}
                  </div>
                  <div className="space-y-2">
                    <Label>LGA</Label>
                    <Input value={formData.lga} onChange={e => updateForm('lga', e.target.value)} placeholder="Local Government Area" />
                    {err('lga')}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Home Address</Label>
                  <Textarea value={formData.address} onChange={e => updateForm('address', e.target.value)} placeholder="Full street address" className="resize-none" />
                  {err('address')}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Identification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>NIN</Label>
                      <Input value={formData.nin} onChange={e => updateForm('nin', e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="11-digit NIN" />
                      {err('nin')}
                    </div>
                    <div className="space-y-2">
                      <Label>BVN</Label>
                      <Input value={formData.bvn} onChange={e => updateForm('bvn', e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="11-digit BVN" />
                      {err('bvn')}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Banking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Select value={formData.bankName} onValueChange={v => updateForm('bankName', v)}>
                        <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                        <SelectContent>
                          {['Access Bank', 'GTBank', 'First Bank', 'Zenith Bank', 'UBA', 'Sterling Bank', 'Opay', 'Palmpay', 'Kuda', 'Other'].map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {err('bankName')}
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input value={formData.accountNumber} onChange={e => updateForm('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit account number" />
                      {err('accountNumber')}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Account Name</Label>
                      <Input value={formData.accountName} onChange={e => updateForm('accountName', e.target.value)} placeholder="Exact name on account" />
                      {err('accountName')}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Guarantor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Guarantor Full Name</Label>
                      <Input value={formData.guarantorName} onChange={e => updateForm('guarantorName', e.target.value)} placeholder="Guarantor's name" />
                      {err('guarantorName')}
                    </div>
                    <div className="space-y-2">
                      <Label>Guarantor Phone</Label>
                      <Input value={formData.guarantorPhone} onChange={e => updateForm('guarantorPhone', e.target.value)} placeholder="Guarantor's phone" />
                      {err('guarantorPhone')}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Relationship</Label>
                      <Select value={formData.guarantorRelationship} onValueChange={v => updateForm('guarantorRelationship', v)}>
                        <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                        <SelectContent>
                          {['Parent', 'Sibling', 'Spouse', 'Friend', 'Colleague', 'Other'].map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {err('guarantorRelationship')}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Guarantor Address</Label>
                      <Textarea value={formData.guarantorAddress} onChange={e => updateForm('guarantorAddress', e.target.value)} placeholder="Guarantor's full address" className="resize-none" />
                      {err('guarantorAddress')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>How did you hear about VERJ?</Label>
                    <Select value={formData.referralSource} onValueChange={v => updateForm('referralSource', v)}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        {['Social Media', 'Friend', 'Family', 'Google', 'Event', 'Other'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {err('referralSource')}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Do you have prior sales experience?</Label>
                    <Select value={formData.salesExperience} onValueChange={v => updateForm('salesExperience', v)}>
                      <SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes - less than 1 year">Yes - less than 1 year</SelectItem>
                        <SelectItem value="Yes - 1 to 3 years">Yes - 1 to 3 years</SelectItem>
                        <SelectItem value="Yes - more than 3 years">Yes - more than 3 years</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    {err('salesExperience')}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span>Why do you want to become a VERJ BDO?</span>
                      <span className="text-xs text-muted-foreground font-normal">{formData.statement.length}/500</span>
                    </Label>
                    <Textarea 
                      value={formData.statement} 
                      onChange={e => updateForm('statement', e.target.value.slice(0, 500))} 
                      placeholder="Brief statement..." 
                      className="resize-none h-32" 
                    />
                    {err('statement')}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="consent" 
                      checked={formData.consent} 
                      onCheckedChange={v => updateForm('consent', !!v)} 
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="consent" className="font-medium cursor-pointer">Declaration</Label>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        I confirm that the information provided is accurate and I agree to VERJ's terms and conditions. 
                        I understand that any false information may lead to disqualification.
                      </p>
                      {err('consent')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/10 border-t flex justify-between p-6">
            <Button variant="outline" onClick={prevStep} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={nextStep}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
                <Send className="h-4 w-4 mr-2" /> Submit Application
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}