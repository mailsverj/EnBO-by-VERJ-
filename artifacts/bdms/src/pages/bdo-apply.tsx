import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Lock, Camera, Upload, X, IdCard } from 'lucide-react';
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

const LGAS_BY_STATE: Record<string, string[]> = {
  'Abia': ['Aba North','Aba South','Arochukwu','Bende','Ikwuano','Isiala Ngwa North','Isiala Ngwa South','Isuikwuato','Obi Ngwa','Ohafia','Osisioma','Ugwunagbo','Ukwa East','Ukwa West','Umuahia North','Umuahia South','Umu Nneochi'],
  'Adamawa': ['Demsa','Fufure','Ganye','Gayuk','Gombi','Grie','Hong','Jada','Lamurde','Madagali','Maiha','Mayo Belwa','Michika','Mubi North','Mubi South','Numan','Shelleng','Song','Toungo','Yola North','Yola South'],
  'Akwa Ibom': ['Abak','Eastern Obolo','Eket','Esit Eket','Essien Udim','Etim Ekpo','Etinan','Ibeno','Ibesikpo Asutan','Ibiono-Ibom','Ika','Ikono','Ikot Abasi','Ikot Ekpene','Ini','Itu','Mbo','Mkpat-Enin','Nsit-Atai','Nsit-Ibom','Nsit-Ubium','Obot Akara','Okobo','Onna','Oron','Oruk Anam','Udung-Uko','Ukanafun','Uruan','Urue-Offong/Oruko','Uyo'],
  'Anambra': ['Aguata','Anambra East','Anambra West','Anaocha','Awka North','Awka South','Ayamelum','Dunukofia','Ekwusigo','Idemili North','Idemili South','Ihiala','Njikoka','Nnewi North','Nnewi South','Ogbaru','Onitsha North','Onitsha South','Orumba North','Orumba South','Oyi'],
  'Bauchi': ['Alkaleri','Bauchi','Bogoro','Damban','Darazo','Dass','Gamawa','Ganjuwa','Giade','Itas/Gadau','Jama\'are','Katagum','Kirfi','Misau','Ningi','Shira','Tafawa Balewa','Toro','Warji','Zaki'],
  'Bayelsa': ['Brass','Ekeremor','Kolokuma/Opokuma','Nembe','Ogbia','Sagbama','Southern Ijaw','Yenagoa'],
  'Benue': ['Ado','Agatu','Apa','Buruku','Gboko','Guma','Gwer East','Gwer West','Katsina-Ala','Konshisha','Kwande','Logo','Makurdi','Obi','Ogbadibo','Ohimini','Oju','Okpokwu','Otukpo','Tarka','Ukum','Ushongo','Vandeikya'],
  'Borno': ['Abadam','Askira/Uba','Bama','Bayo','Biu','Chibok','Damboa','Dikwa','Gubio','Guzamala','Gwoza','Hawul','Jere','Kaga','Kala/Balge','Konduga','Kukawa','Kwaya Kusar','Mafa','Magumeri','Maiduguri','Marte','Mobbar','Monguno','Ngala','Nganzai','Shani'],
  'Cross River': ['Abi','Akamkpa','Akpabuyo','Bakassi','Bekwarra','Biase','Boki','Calabar Municipal','Calabar South','Etung','Ikom','Obanliku','Obubra','Obudu','Odukpani','Ogoja','Yakuur','Yala'],
  'Delta': ['Aniocha North','Aniocha South','Bomadi','Burutu','Ethiope East','Ethiope West','Ika North East','Ika South','Isoko North','Isoko South','Ndokwa East','Ndokwa West','Okpe','Oshimili North','Oshimili South','Patani','Sapele','Udu','Ughelli North','Ughelli South','Ukwuani','Uvwie','Warri North','Warri South','Warri South West'],
  'Ebonyi': ['Abakaliki','Afikpo North','Afikpo South','Ebonyi','Ezza North','Ezza South','Ikwo','Ishielu','Ivo','Izzi','Ohaozara','Ohaukwu','Onicha'],
  'Edo': ['Akoko-Edo','Egor','Esan Central','Esan North-East','Esan South-East','Esan West','Etsako Central','Etsako East','Etsako West','Igueben','Ikpoba-Okha','Orhionmwon','Oredo','Ovia North-East','Ovia South-West','Owan East','Owan West','Uhunmwonde'],
  'Ekiti': ['Ado Ekiti','Efon','Ekiti East','Ekiti South-West','Ekiti West','Emure','Gbonyin','Ido/Osi','Ijero','Ikere','Ikole','Ilejemeje','Irepodun/Ifelodun','Ise/Orun','Moba','Oye'],
  'Enugu': ['Aninri','Awgu','Enugu East','Enugu North','Enugu South','Ezeagu','Igbo Etiti','Igbo Eze North','Igbo Eze South','Isi Uzo','Nkanu East','Nkanu West','Nsukka','Oji River','Udenu','Udi','Uzo Uwani'],
  'FCT': ['Abaji','Bwari','Gwagwalada','Kuje','Kwali','Municipal Area Council'],
  'Gombe': ['Akko','Balanga','Billiri','Dukku','Funakaye','Gombe','Kaltungo','Kwami','Nafada','Shomgom','Yamaltu/Deba'],
  'Imo': ['Aboh Mbaise','Ahiazu Mbaise','Ehime Mbano','Ezinihitte','Ideato North','Ideato South','Ihitte/Uboma','Ikeduru','Isiala Mbano','Isu','Mbaitoli','Ngor Okpala','Njaba','Nkwerre','Nwangele','Obowo','Oguta','Ohaji/Egbema','Okigwe','Onuimo','Orlu','Orsu','Oru East','Oru West','Owerri Municipal','Owerri North','Owerri West'],
  'Jigawa': ['Auyo','Babura','Biriniwa','Birnin Kudu','Buji','Dutse','Gagarawa','Garki','Gumel','Guri','Gwaram','Gwiwa','Hadejia','Jahun','Kafin Hausa','Kaugama','Kazaure','Kiri Kasama','Kiyawa','Maigatari','Malam Maduri','Miga','Ringim','Roni','Sule Tankarkar','Taura','Yankwashi'],
  'Kaduna': ['Birnin Gwari','Chikun','Giwa','Igabi','Ikara','Jaba','Jema\'a','Kachia','Kaduna North','Kaduna South','Kagarko','Kajuru','Kaura','Kauru','Kubau','Kudan','Lere','Makarfi','Sabon Gari','Sanga','Soba','Zangon Kataf','Zaria'],
  'Kano': ['Ajingi','Albasu','Bagwai','Bebeji','Bichi','Bunkure','Dala','Dambatta','Dawakin Kudu','Dawakin Tofa','Doguwa','Fagge','Gabasawa','Garko','Garun Mallam','Gaya','Gezawa','Gwale','Gwarzo','Kabo','Kano Municipal','Karaye','Kibiya','Kiru','Kumbotso','Kunchi','Kura','Madobi','Makoda','Minjibir','Nasarawa','Rano','Rimin Gado','Rogo','Shanono','Sumaila','Takai','Tarauni','Tofa','Tsanyawa','Tudun Wada','Ungogo','Warawa','Wudil'],
  'Katsina': ['Bakori','Batagarawa','Batsari','Baure','Bindawa','Charanchi','Dan Musa','Dandume','Danja','Daura','Dutsi','Dutsin-Ma','Faskari','Funtua','Ingawa','Jibia','Kafur','Kaita','Kankara','Kankia','Katsina','Kurfi','Kusada','Mai\'Adua','Malumfashi','Mani','Mashi','Matazu','Musawa','Rimi','Sabuwa','Safana','Sandamu','Zango'],
  'Kebbi': ['Aleiro','Arewa Dandi','Argungu','Augie','Bagudo','Birnin Kebbi','Bunza','Dandi','Fakai','Gwandu','Jega','Kalgo','Koko/Besse','Maiyama','Ngaski','Sakaba','Shanga','Suru','Wasagu/Danko','Yauri','Zuru'],
  'Kogi': ['Adavi','Ajaokuta','Ankpa','Bassa','Dekina','Ibaji','Idah','Igalamela-Odolu','Ijumu','Kabba/Bunu','Kogi','Lokoja','Mopa-Muro','Ofu','Ogori/Magongo','Okehi','Okene','Olamaboro','Omala','Yagba East','Yagba West'],
  'Kwara': ['Asa','Baruten','Edu','Ekiti','Ifelodun','Ilorin East','Ilorin South','Ilorin West','Irepodun','Isin','Kaiama','Moro','Offa','Oke Ero','Oyun','Pategi'],
  'Lagos': ['Agege','Ajeromi-Ifelodun','Alimosho','Amuwo-Odofin','Apapa','Badagry','Epe','Eti-Osa','Ibeju-Lekki','Ifako-Ijaiye','Ikeja','Ikorodu','Kosofe','Lagos Island','Lagos Mainland','Mushin','Ojo','Oshodi-Isolo','Shomolu','Surulere'],
  'Nasarawa': ['Akwanga','Awe','Doma','Karu','Keana','Keffi','Kokona','Lafia','Nasarawa','Nasarawa Egon','Obi','Toto','Wamba'],
  'Niger': ['Agaie','Agwara','Bida','Borgu','Bosso','Chanchaga','Edati','Gbako','Gurara','Katcha','Kontagora','Lapai','Lavun','Magama','Mariga','Mashegu','Mokwa','Moya','Paikoro','Rafi','Rijau','Shiroro','Suleja','Tafa','Wushishi'],
  'Ogun': ['Abeokuta North','Abeokuta South','Ado-Odo/Ota','Egbado North','Egbado South','Ewekoro','Ifo','Ijebu East','Ijebu North','Ijebu North East','Ijebu Ode','Ikenne','Imeko Afon','Ipokia','Obafemi Owode','Odeda','Odogbolu','Ogun Waterside','Remo North','Shagamu'],
  'Ondo': ['Akoko North-East','Akoko North-West','Akoko South-East','Akoko South-West','Akure North','Akure South','Ese Odo','Idanre','Ifedore','Ilaje','Ile Oluji/Okeigbo','Irele','Odigbo','Okitipupa','Ondo East','Ondo West','Ose','Owo'],
  'Osun': ['Atakumosa East','Atakumosa West','Aiyedaade','Aiyedire','Boluwaduro','Boripe','Ede North','Ede South','Egbedore','Ejigbo','Ife Central','Ife East','Ife North','Ife South','Ifedayo','Ifelodun','Ila','Ilesa East','Ilesa West','Irepodun','Irewole','Isokan','Iwo','Obokun','Odo Otin','Ola Oluwa','Olorunda','Oriade','Orolu','Osogbo'],
  'Oyo': ['Afijio','Akinyele','Atiba','Atisbo','Egbeda','Ibadan North','Ibadan North-East','Ibadan North-West','Ibadan South-East','Ibadan South-West','Ibarapa Central','Ibarapa East','Ibarapa North','Ido','Irepo','Iseyin','Itesiwaju','Iwajowa','Kajola','Lagelu','Ogbomosho North','Ogbomosho South','Ogo Oluwa','Olorunsogo','Oluyole','Ona Ara','Orelope','Orire','Oyo East','Oyo West','Saki East','Saki West','Surulere'],
  'Plateau': ['Barkin Ladi','Bassa','Bokkos','Jos East','Jos North','Jos South','Kanam','Kanke','Langtang North','Langtang South','Mangu','Mikang','Pankshin','Qua\'an Pan','Riyom','Shendam','Wase'],
  'Rivers': ['Abua/Odual','Ahoada East','Ahoada West','Akuku-Toru','Andoni','Asari-Toru','Bonny','Degema','Eleme','Emuoha','Etche','Gokana','Ikwerre','Khana','Obio/Akpor','Ogba/Egbema/Ndoni','Ogu/Bolo','Okrika','Omuma','Opobo/Nkoro','Oyigbo','Port Harcourt','Tai'],
  'Sokoto': ['Binji','Bodinga','Dange Shuni','Gada','Goronyo','Gudu','Gwadabawa','Illela','Isa','Kebbe','Kware','Rabah','Sabon Birni','Shagari','Silame','Sokoto North','Sokoto South','Tambuwal','Tangaza','Tureta','Wamako','Wurno','Yabo'],
  'Taraba': ['Ardo Kola','Bali','Donga','Gashaka','Gassol','Ibi','Jalingo','Karim Lamido','Kumi','Lau','Sardauna','Takum','Ussa','Wukari','Yorro','Zing'],
  'Yobe': ['Bade','Bursari','Damaturu','Fika','Fune','Geidam','Gujba','Gulani','Jakusko','Karasuwa','Machina','Nangere','Nguru','Potiskum','Tarmuwa','Yunusari','Yusufari'],
  'Zamfara': ['Anka','Bakura','Birnin Magaji/Kiyaw','Bukkuyum','Bungudu','Gummi','Gusau','Kaura Namoda','Maradun','Maru','Shinkafi','Talata Mafara','Tsafe','Zurmi'],
};

const DRAFT_KEY = 'enbo_bdo_apply_v1';

const DEFAULT_FORM = {
  // Step 1 — Personal Information
  title: '', surname: '', otherNames: '', dob: '',
  streetAddress: '', lga: '', state: '',
  phone: '', whatsappNumber: '', email: '',
  // Step 2 — Business & Experience
  coverageAreas: '', hasOffice: '', officeAddress: '', officeCurrentUse: '',
  wantsVerjSticker: '', occupation: '', employerName: '',
  hasSalesExperience: '', previousSalesDetail: '', salesExperience: '', education: '',
  // Step 3 — KYC & Declaration
  referralSource: '', photoUrl: '', idDocumentUrl: '', declaration: false,
  // Step 4 — Banking
  bankName: '', accountNumber: '', accountName: '',
};

function loadDraft(): { formData: typeof DEFAULT_FORM; step: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export default function BdoApply() {
  const draft = useRef(loadDraft());
  const hasDraft = draft.current !== null;

  const [step, setStep] = useState(draft.current?.step ?? 1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [refId, setRefId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftRestored] = useState(hasDraft);
  const cardRef = useRef<HTMLDivElement>(null);
  const photoUploadRef = useRef<HTMLInputElement>(null);
  const photoCameraRef = useRef<HTMLInputElement>(null);
  const idUploadRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, maxPx = 1200, quality = 0.8): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          // Scale down so neither dimension exceeds maxPx
          let { width, height } = img;
          if (width > maxPx || height > maxPx) {
            if (width >= height) { height = Math.round((height / width) * maxPx); width = maxPx; }
            else { width = Math.round((width / height) * maxPx); height = maxPx; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleImageFile = async (file: File | undefined, field: 'photoUrl' | 'idDocumentUrl') => {
    if (!file) return;
    const dataUrl = await compressImage(file);
    update(field, dataUrl);
  };

  const [formData, setFormData] = useState<typeof DEFAULT_FORM>(
    draft.current ? { ...DEFAULT_FORM, ...draft.current.formData } : DEFAULT_FORM
  );

  // Auto-save on every change
  useEffect(() => {
    try {
      // Try saving with images first; fall back to saving without them on quota error
      const payload = { step, formData };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      } catch {
        // Strip base64 images if quota exceeded and retry
        const slim = { step, formData: { ...formData, photoUrl: '', idDocumentUrl: '' } };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(slim));
      }
    } catch { /* silently ignore */ }
  }, [formData, step]);

  const update = (key: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const scrollToTop = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title) e.title = 'Required';
      if (!formData.surname.trim()) e.surname = 'Required';
      if (!formData.otherNames.trim()) e.otherNames = 'Required';
      if (!formData.dob) e.dob = 'Required';
      if (!formData.streetAddress.trim()) e.streetAddress = 'Required';
      if (!formData.lga) e.lga = 'Required';
      if (!formData.state) e.state = 'Required';
      if (!formData.phone.trim()) e.phone = 'Required';
      if (!formData.email.trim()) e.email = 'Required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    }

    if (step === 2) {
      if (!formData.coverageAreas) e.coverageAreas = 'Required';
      if (!formData.hasOffice) e.hasOffice = 'Required';
      if (formData.hasOffice === 'Yes' && !formData.officeAddress.trim()) e.officeAddress = 'Required';
      if (!formData.occupation.trim()) e.occupation = 'Required';
      if (!formData.education) e.education = 'Required';
      if (!formData.hasSalesExperience) e.hasSalesExperience = 'Required';
      if (!formData.salesExperience) e.salesExperience = 'Required';
    }

    if (step === 3) {
      if (!formData.referralSource) e.referralSource = 'Required';
      if (!formData.photoUrl) e.photoUrl = 'Please upload a passport photo or take a selfie';
      if (!formData.idDocumentUrl) e.idDocumentUrl = 'Please upload your government-issued ID';
      if (!formData.declaration) e.declaration = 'You must accept the declaration to continue';
    }

    if (step === 4) {
      if (!formData.bankName) e.bankName = 'Required';
      if (!formData.accountNumber.trim() || formData.accountNumber.length !== 10) e.accountNumber = 'Must be exactly 10 digits';
      if (!formData.accountName.trim()) e.accountName = 'Required';
    }

    setErrors(e);
    if (Object.keys(e).length > 0) scrollToTop();
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) { setStep(s => s + 1); scrollToTop(); } };
  const back = () => { setStep(s => s - 1); scrollToTop(); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
      // Combine split fields before sending
      const payload = {
        ...formData,
        fullName: `${formData.surname.trim()} ${formData.otherNames.trim()}`,
        address: formData.streetAddress.trim(),
        lga: formData.lga,
        // state is already in formData
        declaration: formData.declaration ? 'true' : 'false',
      };
      const res = await fetch(`${BASE}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json() as { ok?: boolean; refId?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Submission failed');
      localStorage.removeItem(DRAFT_KEY);
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
        <div>
          <div className="text-white font-black text-lg leading-none tracking-tight">EnBO</div>
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className="text-white italic text-[9px] font-semibold leading-none">by</span>
            <img
              src={logoPath}
              alt="VERJ"
              className="h-6 object-contain"
              style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const fullName = [formData.surname, formData.otherNames].filter(Boolean).join(' ');

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
                Thank you, {fullName || 'applicant'}. Your application has been received. We will review your
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

        {/* Draft restored banner */}
        {draftRestored && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>Your previous progress has been restored. Pick up right where you left off.</span>
          </div>
        )}

        {/* Step progress */}
        <div className="mb-8 space-y-3">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              Draft auto-saved
            </span>
          </div>
        </div>

        <Card ref={cardRef} className="shadow-lg border-border/50">
          <CardHeader className="bg-muted/30 border-b pb-5">
            <CardTitle>{STEP_LABELS[step - 1]}</CardTitle>
            <CardDescription>Step {step} of {TOTAL_STEPS}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">

            {/* ─── STEP 1: Personal Information ─── */}
            {step === 1 && (
              <div className="space-y-5">

                {/* Title + Name row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="space-y-2">
                    <Label>Title <span className="text-destructive">*</span></Label>
                    <Select value={formData.title} onValueChange={v => update('title', v)}>
                      <SelectTrigger className={errors.title ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    {err('title')}
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Surname <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.surname}
                      onChange={e => update('surname', e.target.value)}
                      placeholder="Last name / Family name"
                      className={errors.surname ? 'border-destructive' : ''}
                    />
                    {err('surname')}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Other Name(s) <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.otherNames}
                    onChange={e => update('otherNames', e.target.value)}
                    placeholder="First name and middle name(s)"
                    className={errors.otherNames ? 'border-destructive' : ''}
                  />
                  {err('otherNames')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Date of Birth <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={e => update('dob', e.target.value)}
                      className={errors.dob ? 'border-destructive' : ''}
                    />
                    {err('dob')}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="+234 800 000 0000"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {err('phone')}
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number <span className="text-muted-foreground font-normal text-xs">(if different)</span></Label>
                    <Input value={formData.whatsappNumber} onChange={e => update('whatsappNumber', e.target.value)} placeholder="+234 800 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address <span className="text-destructive">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="you@example.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {err('email')}
                  </div>
                </div>

                {/* Address — three separate fields */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">Residential Address</div>
                  <div className="space-y-2">
                    <Label>Street Address <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.streetAddress}
                      onChange={e => update('streetAddress', e.target.value)}
                      placeholder="House no., street name, landmark"
                      className={errors.streetAddress ? 'border-destructive' : ''}
                    />
                    {err('streetAddress')}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>State <span className="text-destructive">*</span></Label>
                      <Select value={formData.state} onValueChange={v => { update('state', v); update('lga', ''); }}>
                        <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {err('state')}
                    </div>
                    <div className="space-y-2">
                      <Label>LGA <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.lga}
                        onValueChange={v => update('lga', v)}
                        disabled={!formData.state}
                      >
                        <SelectTrigger className={errors.lga ? 'border-destructive' : ''}>
                          <SelectValue placeholder={formData.state ? 'Select LGA' : 'Select state first'} />
                        </SelectTrigger>
                        <SelectContent>
                          {(LGAS_BY_STATE[formData.state] ?? []).map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {err('lga')}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ─── STEP 2: Business & Experience ─── */}
            {step === 2 && (
              <div className="space-y-8">

                {/* Validation summary banner */}
                {Object.keys(errors).length > 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive font-medium">
                    Please fill in all required fields highlighted below.
                  </div>
                )}

                <div className="space-y-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">Business / Operating Information</h3>

                  <div className="space-y-2">
                    <Label>Which state(s) would you be covering? <span className="text-destructive">*</span></Label>
                    <Select value={formData.coverageAreas} onValueChange={v => update('coverageAreas', v)}>
                      <SelectTrigger className={errors.coverageAreas ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select primary state" />
                      </SelectTrigger>
                      <SelectContent>{NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Select your primary state. You can specify additional areas during onboarding.</p>
                    {err('coverageAreas')}
                  </div>

                  <div className="space-y-2">
                    <Label>Do you have a shop or office you'll be operating from? <span className="text-destructive">*</span></Label>
                    <Select value={formData.hasOffice} onValueChange={v => update('hasOffice', v)}>
                      <SelectTrigger className={errors.hasOffice ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
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
                        <Label>Shop / Office Address <span className="text-destructive">*</span></Label>
                        <Textarea
                          value={formData.officeAddress}
                          onChange={e => update('officeAddress', e.target.value)}
                          placeholder="Full address of your shop or office"
                          className={`resize-none ${errors.officeAddress ? 'border-destructive' : ''}`}
                          rows={2}
                        />
                        {err('officeAddress')}
                      </div>
                      <div className="space-y-2">
                        <Label>What is the shop/office currently used for?</Label>
                        <Input value={formData.officeCurrentUse} onChange={e => update('officeCurrentUse', e.target.value)} placeholder="e.g. Electronics retail, Logistics, General merchandise" />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Would you like a VERJ SOLAR flex banner or sticker for your location?</Label>
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
                      <Label>Current Occupation <span className="text-destructive">*</span></Label>
                      <Input
                        value={formData.occupation}
                        onChange={e => update('occupation', e.target.value)}
                        placeholder="e.g. Sales Rep, Freelancer, Student"
                        className={errors.occupation ? 'border-destructive' : ''}
                      />
                      {err('occupation')}
                    </div>
                    <div className="space-y-2">
                      <Label>Employer / Business Name <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                      <Input value={formData.employerName} onChange={e => update('employerName', e.target.value)} placeholder="e.g. Dangote Group / Self-employed" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Highest Educational Qualification <span className="text-destructive">*</span></Label>
                    <Select value={formData.education} onValueChange={v => update('education', v)}>
                      <SelectTrigger className={errors.education ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>{EDUCATION_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                    {err('education')}
                  </div>

                  <div className="space-y-2">
                    <Label>Do you have prior experience in Sales or Marketing? <span className="text-destructive">*</span></Label>
                    <Select value={formData.hasSalesExperience} onValueChange={v => update('hasSalesExperience', v)}>
                      <SelectTrigger className={errors.hasSalesExperience ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    {err('hasSalesExperience')}
                  </div>

                  {formData.hasSalesExperience === 'Yes' && (
                    <div className="space-y-2">
                      <Label>What did you sell?</Label>
                      <Input value={formData.previousSalesDetail} onChange={e => update('previousSalesDetail', e.target.value)} placeholder="e.g. Solar products, FMCG, Real estate, Insurance" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Level of Sales / Marketing Experience <span className="text-destructive">*</span></Label>
                    <Select value={formData.salesExperience} onValueChange={v => update('salesExperience', v)}>
                      <SelectTrigger className={errors.salesExperience ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
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
                </div>

              </div>
            )}

            {/* ─── STEP 3: KYC & Declaration ─── */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">Application Source</h3>
                  <div className="space-y-2">
                    <Label>How did you hear about this opportunity? <span className="text-destructive">*</span></Label>
                    <Select value={formData.referralSource} onValueChange={v => update('referralSource', v)}>
                      <SelectTrigger className={errors.referralSource ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
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

                  {/* ── Selfie / Passport Photo ── */}
                  <div className="space-y-2">
                    <Label>Passport Photograph / Selfie <span className="text-destructive">*</span></Label>
                    <p className="text-xs text-muted-foreground">Recent, clear, face-forward photo. No sunglasses or hats.</p>

                    {/* Hidden inputs */}
                    <input ref={photoUploadRef} type="file" accept="image/*" className="hidden"
                      onChange={e => handleImageFile(e.target.files?.[0], 'photoUrl')} />
                    <input ref={photoCameraRef} type="file" accept="image/*" capture="user" className="hidden"
                      onChange={e => handleImageFile(e.target.files?.[0], 'photoUrl')} />

                    {formData.photoUrl ? (
                      <div className={`relative rounded-lg overflow-hidden border-2 ${errors.photoUrl ? 'border-destructive' : 'border-border'}`}>
                        <img src={formData.photoUrl} alt="Selfie preview" className="w-full max-h-56 object-cover" />
                        <button type="button" onClick={() => update('photoUrl', '')}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="px-3 py-2 bg-muted/60 text-xs text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" /> Photo selected
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-lg border-2 border-dashed p-6 ${errors.photoUrl ? 'border-destructive bg-destructive/5' : 'border-border bg-muted/30'}`}>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button type="button" variant="outline" className="flex-1 gap-2"
                            onClick={() => photoUploadRef.current?.click()}>
                            <Upload className="h-4 w-4" /> Upload Passport Photo
                          </Button>
                          <Button type="button" variant="outline" className="flex-1 gap-2"
                            onClick={() => photoCameraRef.current?.click()}>
                            <Camera className="h-4 w-4" /> Take Selfie
                          </Button>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-3">JPG, PNG or WEBP · max 10 MB</p>
                      </div>
                    )}
                    {err('photoUrl')}
                  </div>

                  {/* ── Government-Issued ID ── */}
                  <div className="space-y-2">
                    <Label>Government-Issued ID <span className="text-destructive">*</span></Label>
                    <p className="text-xs text-muted-foreground">NIN slip, International Passport, Driver's Licence, or Voter's Card.</p>

                    <input ref={idUploadRef} type="file" accept="image/*" className="hidden"
                      onChange={e => handleImageFile(e.target.files?.[0], 'idDocumentUrl')} />

                    {formData.idDocumentUrl ? (
                      <div className={`relative rounded-lg overflow-hidden border-2 ${errors.idDocumentUrl ? 'border-destructive' : 'border-border'}`}>
                        <img src={formData.idDocumentUrl} alt="ID preview" className="w-full max-h-56 object-cover" />
                        <button type="button" onClick={() => update('idDocumentUrl', '')}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="px-3 py-2 bg-muted/60 text-xs text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" /> ID document selected
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-lg border-2 border-dashed p-6 ${errors.idDocumentUrl ? 'border-destructive bg-destructive/5' : 'border-border bg-muted/30'}`}>
                        <div className="flex justify-center">
                          <Button type="button" variant="outline" className="gap-2"
                            onClick={() => idUploadRef.current?.click()}>
                            <IdCard className="h-4 w-4" /> Upload ID Document
                          </Button>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-3">JPG, PNG or WEBP · max 10 MB</p>
                      </div>
                    )}
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
                        I understand that false information may result in disqualification from the VERJ BDO programme.
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
                    These details will be used for commission payments. Once you are activated, banking details become read-only.
                    Any changes must be requested through the Finance team.
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Bank Name <span className="text-destructive">*</span></Label>
                    <Select value={formData.bankName} onValueChange={v => update('bankName', v)}>
                      <SelectTrigger className={errors.bankName ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {NIGERIAN_BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {err('bankName')}
                  </div>

                  <div className="space-y-2">
                    <Label>Bank Account Number <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.accountNumber}
                      onChange={e => update('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit account number"
                      inputMode="numeric"
                      className={errors.accountNumber ? 'border-destructive' : ''}
                    />
                    {err('accountNumber')}
                  </div>

                  <div className="space-y-2">
                    <Label>Account Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.accountName}
                      onChange={e => update('accountName', e.target.value)}
                      placeholder="Exact name on your bank account"
                      className={errors.accountName ? 'border-destructive' : ''}
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
