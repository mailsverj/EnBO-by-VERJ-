import type { ChapterContent } from "@workspace/db/schema";

export interface ChapterDef {
  chapterId: string;
  title: string;
  subtitle: string;
  content: ChapterContent;
}

export const CHAPTER_SEED: ChapterDef[] = [
  {
    chapterId: "welcome",
    title: "Welcome to VERJ SOLAR",
    subtitle: "The start of your journey as a VERJ Business Development Officer",
    content: {
      sections: [
        {
          title: "Who We Are",
          blocks: [
            { type: "paragraph", text: "VERJ SOLAR is a Nigerian renewable energy company committed to powering homes, businesses, and communities with reliable, clean, and affordable solar solutions. We operate across Nigeria, bringing world-class solar technology to every corner of the country through our nationwide network of Business Development Officers — people like you." },
            { type: "paragraph", text: "Our mission is simple: **to redefine the limit of what is possible** for every Nigerian family and business through the power of the sun." },
          ],
        },
        {
          title: "Why BDOs Matter",
          blocks: [
            { type: "paragraph", text: "At VERJ, our BDOs are not just salespeople. You are the face of VERJ in your community. You are an energy ambassador — someone who educates, inspires, and empowers people to take control of their power supply. The impact you create outlasts any single sale." },
            {
              type: "cards", columns: 3,
              items: [
                { title: "Community Impact", body: "Every system you sell frees a family from generator fuel costs and unstable grid power." },
                { title: "Career Growth", body: "VERJ BDOs grow into senior roles — Team Leads, Area Managers, and beyond." },
                { title: "Earnings Potential", body: "Your income is directly linked to your performance. The sky is your limit." },
              ],
            },
          ],
        },
        {
          title: "Our Core Values",
          blocks: [
            {
              type: "list",
              items: [
                "Integrity — We do what is right, always.",
                "Excellence — We deliver the best, not the easiest.",
                "Customer-First — The customer's success is our success.",
                "Innovation — We embrace better ways of doing things.",
                "Accountability — We own our results.",
              ],
            },
            { type: "callout", variant: "key", text: "As a VERJ BDO, you represent the brand at all times. Everything you say, wear, and do reflects on VERJ. This is not just a job — it is a responsibility." },
          ],
        },
      ],
    },
  },

  {
    chapterId: "solar-fundamentals",
    title: "Solar Energy Fundamentals",
    subtitle: "Understanding how solar works so you can explain it confidently to any customer",
    content: {
      sections: [
        {
          title: "How Solar Power Works",
          blocks: [
            { type: "paragraph", text: "A solar energy system converts sunlight into electricity using photovoltaic (PV) panels. This electricity is then stored in batteries and/or used directly to power your home. An inverter converts the DC electricity from panels and batteries into AC electricity that your appliances use." },
            { type: "paragraph", text: "Nigeria receives an average of 5–7 hours of peak sunlight daily — one of the highest solar radiation levels in the world. This makes solar an exceptionally powerful and economical energy solution for Nigerian homes and businesses." },
          ],
        },
        {
          title: "Key Components",
          blocks: [
            {
              type: "cards", columns: 2,
              items: [
                { title: "Solar Panels (PV Modules)", body: "Capture sunlight and convert it to DC electricity. Measured in Watts (W) or Kilowatts (kW). Common residential sizes: 400W–600W per panel." },
                { title: "Inverter", body: "The brain of the system. Converts DC power from panels/batteries into AC power for your appliances. Also manages charging and discharging." },
                { title: "Battery Bank", body: "Stores energy for use at night or when there is no sun. Capacity is measured in kilowatt-hours (kWh). Modern lithium batteries (LiFePO4) offer high depth of discharge (80–100%) and long life (3,000+ cycles)." },
                { title: "Charge Controller", body: "Regulates the voltage and current from solar panels to the battery, preventing overcharging. Modern hybrid inverters often have this built in." },
                { title: "Wiring & Protection", body: "DC and AC cabling, circuit breakers, surge protectors (SPD), and earthing equipment to ensure safe operation." },
              ],
            },
          ],
        },
        {
          title: "Key Terms You Must Know",
          blocks: [
            {
              type: "keyterms",
              terms: [
                { term: "PV", def: "Photovoltaic — the technology that converts sunlight directly into electricity." },
                { term: "kWh", def: "Kilowatt-hour — the unit for measuring electrical energy. 1 kWh = running a 1,000W appliance for 1 hour." },
                { term: "kWp", def: "Kilowatt-peak — the rated output of solar panels under standard test conditions." },
                { term: "DoD", def: "Depth of Discharge — how much of a battery's capacity can safely be used. LiFePO4 batteries typically allow 80–100% DoD." },
                { term: "LiFePO4", def: "Lithium Iron Phosphate — the preferred battery chemistry for modern solar systems. Safe, long-lasting, and high-performance." },
                { term: "Off-grid", def: "A system completely independent from the national grid, relying entirely on solar and batteries." },
                { term: "Hybrid", def: "A system that can work with solar, batteries, AND the grid or generator as a backup." },
              ],
            },
          ],
        },
        {
          title: "VERJ Sizing Formulas (Critical)",
          blocks: [
            { type: "callout", variant: "warning", text: "These formulas are used by VERJ engineers and will appear in your assessment. You must understand them — not just memorise them." },
            { type: "formula", label: "Battery Capacity Formula", formula: "Total Night-time Load Energy × 1.25", explanation: "Night-time load energy = total energy consumed by appliances used after dark. The 1.25 factor adds a 25% safety buffer." },
            { type: "formula", label: "PV (Solar Panel) Formula", formula: "(Total Battery Size ÷ 6 + Total Load) × 1.67", explanation: "This ensures the panels can charge the battery in ~6 hours AND cover the live load simultaneously, with a 67% system efficiency buffer." },
            { type: "formula", label: "Inverter Selection", formula: "", explanation: "Select the inverter from inventory within a 5 kW tolerance of the calculated load. If no matching inverter exists, the engineer marks it as DESIGN REVIEW REQUIRED." },
          ],
        },
      ],
    },
  },

  {
    chapterId: "verj-products",
    title: "VERJ Products & Solutions",
    subtitle: "Know your products inside out — because you cannot sell what you do not understand",
    content: {
      sections: [
        {
          title: "Our Product Range",
          blocks: [
            { type: "paragraph", text: "VERJ SOLAR offers complete solar energy solutions — from compact residential systems to large commercial installations. Our systems are designed, installed, and maintained by VERJ-certified engineers to the highest quality standards." },
            {
              type: "cards", columns: 2,
              items: [
                { title: "Residential Systems", subtitle: "1 kWp – 10 kWp", body: "Ideal for homes, flats, and small businesses. Covers essential loads: fans, lights, TV, refrigerator, and phone charging." },
                { title: "Mid-range Systems", subtitle: "10 kWp – 20 kWp", body: "For medium homes, schools, and SMEs. Can power air conditioning, water pumps, and office equipment." },
                { title: "Large Commercial", subtitle: "20 kWp – 48 kWp", body: "For factories, hospitals, large offices, and estates. Full-facility backup with scalable battery banks." },
                { title: "Custom Designs", subtitle: "48 kWp+", body: "Bespoke engineering for large-scale industrial and institutional requirements." },
              ],
            },
          ],
        },
        {
          title: "What Makes VERJ Different",
          blocks: [
            {
              type: "list",
              items: [
                "Factory-grade components — no compromise on quality",
                "VERJ-certified engineers for every installation",
                "After-sales support and maintenance packages",
                "EnBO-tracked warranties and service history",
                "Customer-facing Solar Plan invoices — no confusing jargon",
                "Scalable systems designed to grow with the customer",
              ],
            },
            { type: "callout", variant: "tip", text: "Never make up product specifications. If a customer asks a technical question you cannot answer, say: \"Great question. Let me get our engineer to confirm the exact specs for you.\" This builds trust rather than eroding it." },
          ],
        },
        {
          title: "Battery Selection Guide",
          blocks: [
            {
              type: "table",
              headers: ["Calculated Need", "Recommended Size"],
              rows: [
                ["0 – 5 kWh", "5 kWh"],
                ["5.1 – 10 kWh", "10 kWh"],
                ["10.1 – 16 kWh", "16 kWh"],
                ["16.1 – 32 kWh", "32 kWh"],
                ["32.1 – 48 kWh", "48 kWh"],
              ],
            },
          ],
        },
      ],
    },
  },

  {
    chapterId: "bdo-role",
    title: "Your Role as a VERJ BDO",
    subtitle: "Understanding your responsibilities, your pipeline, and how you are measured",
    content: {
      sections: [
        {
          title: "Your Core Responsibilities",
          blocks: [
            {
              type: "cards", columns: 2,
              items: [
                { title: "Lead Generation", body: "Identify and approach potential customers in your coverage area through referrals, community engagement, and outreach." },
                { title: "Customer Education", body: "Help prospects understand the benefits of solar and how VERJ's solutions can solve their specific energy challenges." },
                { title: "Site Assessment", body: "Conduct a basic load assessment at the customer's premises and submit the information for engineering review." },
                { title: "Proposal Presentation", body: "Present the VERJ Solar Plan (proposal) to the customer in a clear, compelling, and professional way." },
                { title: "Deal Closure", body: "Guide the customer through the decision and payment process, coordinating with the VERJ sales and finance teams." },
                { title: "Relationship Management", body: "Maintain ongoing relationships with existing customers for referrals and potential upgrades." },
              ],
            },
          ],
        },
        {
          title: "The BDO Pipeline (Business Chain)",
          blocks: [
            {
              type: "pipeline",
              items: [
                "BDO generates Lead",
                "Lead becomes a Customer",
                "Customer's Load is Assessed",
                "Design is created by Engineer",
                "Design is technically approved",
                "Invoice is generated",
                "Sales approves Invoice",
                "Customer makes Payment",
                "System is installed",
                "Commission is earned",
              ],
            },
            { type: "callout", variant: "key", text: "Every record in EnBO retains the BDO ID so your contribution is always tracked and credited — from the initial lead all the way to commission payment." },
          ],
        },
        {
          title: "Your VBDO ID",
          blocks: [
            { type: "paragraph", text: "Once activated, you receive a unique VERJ BDO ID in the format VBDO-XXXX. This ID is your official VERJ identity. It appears on all your commissions, leads, customers, and EnBO records. Guard it carefully." },
          ],
        },
      ],
    },
  },

  {
    chapterId: "sales-process",
    title: "Lead Generation & Sales",
    subtitle: "How to find the right prospects, build trust, and close deals professionally",
    content: {
      sections: [
        {
          title: "Finding Quality Leads",
          blocks: [
            { type: "paragraph", text: "The best leads are warm leads — people who already trust you or have been referred by someone they trust. Focus your energy on building relationships rather than cold approaching strangers." },
            {
              type: "cards", columns: 2,
              items: [
                { title: "Referrals", body: "Your single most powerful lead source. Ask every satisfied customer for 2–3 referrals." },
                { title: "Community Events", body: "Church gatherings, market days, estate meetings, cooperative meetings." },
                { title: "Social Media", body: "WhatsApp status, Facebook groups, Instagram stories showing before/after." },
                { title: "Existing Network", body: "Friends, family, former colleagues — people who already trust you." },
                { title: "Canvassing", body: "Door-to-door in residential estates or commercial areas during business hours." },
                { title: "Generator Noise", body: "Anyone running a generator is a qualified solar prospect. Find them." },
              ],
            },
          ],
        },
        {
          title: "The Sales Conversation",
          blocks: [
            { type: "paragraph", text: "A great sales conversation is 80% listening and 20% talking. Before you present anything, understand the customer's situation deeply." },
            {
              type: "steps",
              items: [
                { label: "1. Connect", desc: "Build rapport. Be genuinely interested in the person, not just the sale." },
                { label: "2. Discover", desc: "Ask about their power situation. How long are outages? What does fuel cost per week? What appliances suffer?" },
                { label: "3. Identify Pain", desc: "Uncover their specific frustration. A pain point is a problem your product can solve." },
                { label: "4. Present", desc: "Show how VERJ's solution specifically solves their identified pain. Personalise it." },
                { label: "5. Handle Objections", desc: "Acknowledge concerns, validate them, then address them with facts and evidence." },
                { label: "6. Close", desc: "Ask for the next step clearly: \"Shall we schedule a site visit?\" or \"Shall we proceed with the proposal?\"" },
              ],
            },
          ],
        },
        {
          title: "Handling Common Objections",
          blocks: [
            {
              type: "objections",
              items: [
                { obj: "\"It's too expensive\"", res: "Reframe as an investment. \"You currently spend ₦X/month on fuel. This system pays for itself in Y months and then saves you money every month after.\"" },
                { obj: "\"I tried solar before and it failed\"", res: "Acknowledge their experience. Ask about the system they had. Then explain VERJ's quality difference and post-installation support." },
                { obj: "\"Let me think about it\"", res: "Understand the real objection. \"Of course — what specific aspect would you like more information on before you decide?\"" },
                { obj: "\"My neighbour has solar from another company\"", res: "Never disparage competitors. \"That's great! Every home powered by solar is a win. What I can tell you is what makes VERJ specifically different...\"" },
              ],
            },
          ],
        },
        {
          title: "Understanding ROI for Your Customer",
          blocks: [
            { type: "paragraph", text: "Return on Investment (ROI) is one of the most powerful tools in your sales conversation. If a customer spends ₦25,000 per month on generator fuel, their annual fuel bill is ₦300,000. A solar system costing ₦1,500,000 pays for itself in 5 years — and then provides free energy for the next 20+ years." },
            { type: "callout", variant: "tip", text: "Always anchor the conversation on the customer's current monthly cost versus their new monthly zero-cost. Numbers are more powerful than words." },
          ],
        },
      ],
    },
  },

  {
    chapterId: "customer-assessment",
    title: "Customer Needs Assessment",
    subtitle: "How to conduct a professional load assessment and submit an accurate brief to the engineering team",
    content: {
      sections: [
        {
          title: "Why Accurate Assessment Matters",
          blocks: [
            { type: "paragraph", text: "An incorrectly sized system either leaves the customer unsatisfied (undersized — runs out of power at night) or wastes their money (oversized — paying for capacity they don't use). Both damage VERJ's reputation and your relationship with the customer." },
            { type: "callout", variant: "warning", text: "Never promise a specific system size to a customer before the engineering team has reviewed their load schedule. You can give a range, but never a final number. Under-sizing or over-sizing a system has serious consequences." },
          ],
        },
        {
          title: "The Load Assessment Process",
          blocks: [
            {
              type: "steps",
              items: [
                { label: "Step 1: Appliance Inventory", desc: "List every electrical appliance the customer uses. Include appliances they want to power with solar — not just what they currently use." },
                { label: "Step 2: Power Ratings", desc: "Record the wattage of each appliance. This is usually on a label at the back of the appliance or in the manual. Common examples: LED bulb (10W), fan (50W), TV (100W), refrigerator (150W), air conditioner (1,500W)." },
                { label: "Step 3: Daily Usage Hours", desc: "Ask how many hours per day each appliance is used. Separate day-time use from night-time use — this matters for battery sizing." },
                { label: "Step 4: Calculate Energy", desc: "Energy (Wh) = Wattage × Hours per day. Sum all appliances. Convert to kWh (divide by 1,000)." },
                { label: "Step 5: Submit to EnBO", desc: "Enter the load schedule into EnBO. The engineering team uses this data to design the correct system." },
              ],
            },
          ],
        },
        {
          title: "Key Questions to Ask a Prospect",
          blocks: [
            {
              type: "list",
              items: [
                "How many hours of power outage do you experience daily?",
                "What appliances do you currently use on your generator?",
                "What additional appliances would you like solar to power?",
                "Do you run an air conditioner? If so, how many and for how many hours?",
                "What is your approximate monthly generator fuel spend?",
                "Do you have an existing solar or inverter system? What brand?",
                "When would you ideally like the system installed?",
              ],
            },
            { type: "callout", variant: "key", text: "The most important thing you can determine in a customer visit is: what problem are they trying to solve? A customer who spends ₦20,000/week on fuel has a very different need from one who just wants to power their lights. Size the conversation accordingly." },
          ],
        },
      ],
    },
  },

  {
    chapterId: "onboarding-workflow",
    title: "BDO Onboarding Workflow",
    subtitle: "How you got here — and what happens after you pass the assessment",
    content: {
      sections: [
        {
          title: "The Full Application Pipeline",
          blocks: [
            {
              type: "pipeline",
              items: [
                "Submitted — You completed the application form. Your information is under review.",
                "KYC Pending — Admin is reviewing your selfie/photo and government-issued ID.",
                "KYC Verified — Your identity has been confirmed. You are eligible for shortlisting.",
                "Shortlisted — You have been shortlisted! Your onboarding portal is now active. Train, study, and take the assessment.",
                "Assessment Passed — Congratulations! You passed the assessment. Awaiting Chief Admin activation.",
                "Assessment Failed — You have used all assessment attempts. Contact VERJ if you wish to apply again.",
                "Activated / Active BDO — Welcome to the team! Your VBDO ID, BDO portal account, certificate, and work ID have been generated.",
              ],
            },
          ],
        },
        {
          title: "Assessment Rules — READ CAREFULLY",
          blocks: [
            { type: "callout", variant: "warning", text: "You have a maximum of 2 attempts at the assessment. Passing on either attempt advances you to activation. Failing both attempts locks your onboarding access permanently. The Chief Admin may grant an override if VERJ decides to give you another opportunity." },
            {
              type: "cards", columns: 2,
              items: [
                { title: "100", subtitle: "Total Marks", body: "" },
                { title: "70 (70%)", subtitle: "Pass Mark", body: "" },
                { title: "2", subtitle: "Max Attempts", body: "" },
                { title: "None", subtitle: "Time Limit", body: "" },
              ],
            },
          ],
        },
        {
          title: "What You Get When Activated",
          blocks: [
            {
              type: "list",
              items: [
                "A unique VBDO ID (e.g. VBDO-0017)",
                "EnBO BDO Portal login credentials",
                "VERJ BDO Certificate (downloadable, MD-signed)",
                "VERJ Work ID (downloadable, MD-signed)",
                "Access to leads, customers, commissions, and your performance dashboard",
              ],
            },
            { type: "callout", variant: "key", text: "Your onboarding (applicant) account is deactivated the moment you are activated as a BDO. Your old login credentials will no longer work. You receive new login details via email and WhatsApp." },
          ],
        },
      ],
    },
  },

  {
    chapterId: "professional-standards",
    title: "Professional Standards",
    subtitle: "The code of conduct that defines you as a VERJ BDO",
    content: {
      sections: [
        {
          title: "Appearance & Dress Code",
          blocks: [
            { type: "paragraph", text: "You represent VERJ at every customer interaction. Your appearance is your first impression — and first impressions last. Always dress smartly and professionally, even for informal visits." },
            {
              type: "dodont",
              dos: [
                "Dress smartly (smart casual minimum)",
                "Wear VERJ branded items when available",
                "Keep hair neat and groomed",
                "Carry business cards and a notepad",
                "Arrive on time for every appointment",
              ],
              donts: [
                "Visit customers in torn or casual wear",
                "Use your phone during a customer presentation",
                "Smoke or drink alcohol before/during visits",
                "Make promises you haven't cleared with VERJ",
                "Discuss competitor pricing unless you know the facts",
              ],
            },
          ],
        },
        {
          title: "Ethical Conduct",
          blocks: [
            {
              type: "cards", columns: 2,
              items: [
                { title: "No Personal Gifts", body: "Do not accept cash, gifts, or favours from customers or prospects. Politely decline and explain VERJ's professional standards." },
                { title: "No Misrepresentation", body: "Never make false claims about VERJ products or services. If you don't know something, find out and come back with the truth." },
                { title: "Confidentiality", body: "Customer data accessed through EnBO is confidential. Never share customer information with third parties." },
                { title: "Conflict of Interest", body: "Inform VERJ management if you have a personal relationship with a customer or a competing business interest." },
                { title: "Following Authority", body: "If a Chief Admin instruction conflicts with VERJ's official process, raise your concern professionally before proceeding. You are not exempt from the process." },
              ],
            },
          ],
        },
        {
          title: "Communication Standards",
          blocks: [
            {
              type: "list",
              items: [
                "Always respond to customer messages within 24 hours.",
                "Use clear, respectful language in all written and verbal communication.",
                "Copy your VERJ contact into important emails when necessary.",
                "Never make a commitment on behalf of VERJ without authorisation.",
                "Report all significant customer interactions in EnBO.",
              ],
            },
            { type: "callout", variant: "key", text: "Your VERJ BDO status can be suspended or revoked for serious violations of this code of conduct. Your VBDO ID and the privileges that come with it are earned — and they must be maintained through consistent professional behaviour." },
            { type: "assessment_cta" },
          ],
        },
      ],
    },
  },
];
