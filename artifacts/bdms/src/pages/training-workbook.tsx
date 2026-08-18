/**
 * Print-optimised workbook — opens as a full page, user prints to PDF via browser.
 * Accessible at /training/workbook (public route, no auth required).
 */
import { useEffect } from 'react';
import logoOnLight from '@assets/enbo-verj-logo-light.png';
import heroImg from '@assets/training-hero.jpg';
import solarBasicsImg from '@assets/training-solar-basics.jpg';
import salesImg from '@assets/training-sales.jpg';
import productsImg from '@assets/training-products.jpg';
import teamImg from '@assets/training-team.jpg';

export default function TrainingWorkbook() {
  useEffect(() => {
    document.title = 'VERJ BDO Training Workbook';
  }, []);

  return (
    <div className="workbook-root" style={{ fontFamily: 'Georgia, serif', color: '#111', background: '#fff', maxWidth: 780, margin: '0 auto', padding: '40px 48px' }}>
      <style>{`
        @media print {
          @page { margin: 18mm 18mm; size: A4; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
        }
        .workbook-root h1 { font-size: 2rem; font-weight: 900; margin: 0 0 8px; }
        .workbook-root h2 { font-size: 1.25rem; font-weight: 700; border-bottom: 2px solid #f59e0b; padding-bottom: 6px; margin: 32px 0 14px; }
        .workbook-root h3 { font-size: 1rem; font-weight: 700; margin: 20px 0 8px; }
        .workbook-root p { line-height: 1.7; margin: 0 0 12px; font-size: 0.92rem; }
        .workbook-root ul { padding-left: 20px; margin: 0 0 12px; }
        .workbook-root li { line-height: 1.7; font-size: 0.92rem; margin-bottom: 4px; }
        .workbook-root .callout { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-size: 0.88rem; }
        .workbook-root .formula-box { background: #f8f8f8; border: 1px solid #ddd; padding: 12px 16px; border-radius: 4px; font-family: monospace; font-size: 0.95rem; margin: 12px 0; }
        .workbook-root table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.88rem; }
        .workbook-root th { background: #111; color: #fff; padding: 8px 12px; text-align: left; }
        .workbook-root td { border: 1px solid #ddd; padding: 8px 12px; }
        .workbook-root .chapter-header { background: #111; color: #fff; padding: 20px 24px; border-radius: 8px; margin-bottom: 20px; }
        .workbook-root .chapter-num { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #f59e0b; margin-bottom: 6px; }
        .workbook-root img.chapter-img { width: 100%; height: 240px; object-fit: cover; border-radius: 8px; margin: 16px 0; }
      `}</style>

      {/* Cover */}
      <div className="page-break" style={{ textAlign: 'center', padding: '60px 0 80px' }}>
        <img src={logoOnLight} alt="EnBO by VERJ" style={{ height: 80, margin: '0 auto 24px', display: 'block' }} />
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>BDO Training<br />Workbook</h1>
        <p style={{ color: '#666', fontSize: '1rem', marginBottom: 32 }}>Business Development Officer<br />Onboarding Programme</p>
        <img src={heroImg} alt="VERJ Solar" style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 12 }} />
        <p style={{ marginTop: 24, color: '#888', fontSize: '0.8rem' }}>
          Confidential — for VERJ BDO Applicants only<br />
          Verj Innovations Limited · Doing Business As VERJ SOLAR<br />
          EnBO Onboarding Platform
        </p>
      </div>

      {/* Ch1 */}
      <div className="page-break">
        <div className="chapter-header"><div className="chapter-num">Chapter 1</div><h1 style={{ color: '#fff', margin: 0 }}>Welcome to VERJ SOLAR</h1></div>
        <h2>Who We Are</h2>
        <p>VERJ SOLAR is a Nigerian renewable energy company committed to powering homes, businesses, and communities with reliable, clean, and affordable solar solutions. We operate across Nigeria, bringing world-class solar technology to every corner of the country through our nationwide network of Business Development Officers.</p>
        <p>Our mission: <strong>to redefine the limit of what is possible</strong> for every Nigerian family and business through the power of the sun.</p>
        <h2>Our Core Values</h2>
        <ul>
          <li><strong>Integrity</strong> — We do what is right, always.</li>
          <li><strong>Excellence</strong> — We deliver the best, not the easiest.</li>
          <li><strong>Customer-First</strong> — The customer's success is our success.</li>
          <li><strong>Innovation</strong> — We embrace better ways of doing things.</li>
          <li><strong>Accountability</strong> — We own our results.</li>
        </ul>
        <div className="callout"><strong>Remember:</strong> As a VERJ BDO, you represent the brand at all times. Everything you say, wear, and do reflects on VERJ.</div>
      </div>

      {/* Ch2 */}
      <div className="page-break">
        <div className="chapter-header"><div className="chapter-num">Chapter 2</div><h1 style={{ color: '#fff', margin: 0 }}>Solar Energy Fundamentals</h1></div>
        <img src={solarBasicsImg} alt="" className="chapter-img" />
        <h2>How Solar Power Works</h2>
        <p>A solar energy system converts sunlight into electricity using photovoltaic (PV) panels. This electricity is stored in batteries and/or used directly. An inverter converts DC electricity from panels and batteries into AC electricity that appliances use. Nigeria receives 5–7 hours of peak sunlight daily.</p>
        <h2>Key Components</h2>
        <ul>
          <li><strong>Solar Panels (PV Modules)</strong> — Convert sunlight to DC electricity. Measured in Watts (W) or kW.</li>
          <li><strong>Inverter</strong> — Brain of the system. Converts DC to AC. Manages charging/discharging.</li>
          <li><strong>Battery Bank</strong> — Stores energy. Capacity in kWh. LiFePO4 preferred (high DoD, long life).</li>
          <li><strong>Charge Controller</strong> — Prevents battery overcharging. Often built into hybrid inverters.</li>
        </ul>
        <h2>VERJ Sizing Formulas (Must Know)</h2>
        <div className="formula-box">Battery Capacity = Total Night-time Load Energy × 1.25</div>
        <div className="formula-box">PV Size = (Total Battery Size ÷ 6 + Total Load) × 1.67</div>
        <h2>Battery Selection Table</h2>
        <table>
          <thead><tr><th>Calculated Need</th><th>Recommended Battery Size</th></tr></thead>
          <tbody>
            {[['0 – 5 kWh','5 kWh'],['5.1 – 10 kWh','10 kWh'],['10.1 – 16 kWh','16 kWh'],['16.1 – 32 kWh','32 kWh'],['32.1 – 48 kWh','48 kWh']].map(([r,s]) => (
              <tr key={r}><td>{r}</td><td><strong>{s}</strong></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ch3 */}
      <div className="page-break">
        <div className="chapter-header"><div className="chapter-num">Chapter 3</div><h1 style={{ color: '#fff', margin: 0 }}>VERJ Products &amp; Solutions</h1></div>
        <img src={productsImg} alt="" className="chapter-img" />
        <h2>Product Range</h2>
        <table>
          <thead><tr><th>Category</th><th>Range</th><th>Ideal For</th></tr></thead>
          <tbody>
            <tr><td>Residential</td><td>1–10 kWp</td><td>Homes, flats, small businesses</td></tr>
            <tr><td>Mid-range</td><td>10–20 kWp</td><td>Schools, SMEs, medium offices</td></tr>
            <tr><td>Large Commercial</td><td>20–48 kWp</td><td>Factories, hospitals, estates</td></tr>
            <tr><td>Custom</td><td>48 kWp+</td><td>Industrial and institutional</td></tr>
          </tbody>
        </table>
        <h2>What Makes VERJ Different</h2>
        <ul>
          <li>Factory-grade components — no compromise on quality</li>
          <li>VERJ-certified engineers for every installation</li>
          <li>After-sales support and maintenance packages</li>
          <li>Scalable systems designed to grow with the customer</li>
        </ul>
        <div className="callout"><strong>BDO Rule:</strong> Never make up product specifications. If you don't know, say so and get the right answer from the engineering team.</div>
      </div>

      {/* Ch4 */}
      <div className="page-break">
        <div className="chapter-header"><div className="chapter-num">Chapter 4</div><h1 style={{ color: '#fff', margin: 0 }}>Your Role as a VERJ BDO</h1></div>
        <img src={teamImg} alt="" className="chapter-img" />
        <h2>Core Responsibilities</h2>
        <ul>
          <li><strong>Lead Generation</strong> — Identify and approach potential customers in your coverage area.</li>
          <li><strong>Customer Education</strong> — Help prospects understand solar and VERJ's solutions.</li>
          <li><strong>Site Assessment</strong> — Conduct basic load assessment; submit to engineering.</li>
          <li><strong>Proposal Presentation</strong> — Present the VERJ Solar Plan professionally.</li>
          <li><strong>Deal Closure</strong> — Guide customers through the decision and payment process.</li>
          <li><strong>Relationship Management</strong> — Maintain relationships for referrals and upgrades.</li>
        </ul>
        <h2>The BDO Pipeline</h2>
        <p>BDO → Lead → Customer → Load Assessment → Design → Engineering Approval → Invoice → Sales Approval → Payment → Installation → Commission</p>
        <p>Every EnBO record retains your BDO ID, so your contribution is always tracked and credited.</p>
        <h2>Your VBDO ID</h2>
        <p>Your unique ID format: <strong>VBDO-XXXX</strong>. This is your official VERJ identity across all records, commissions, and certifications.</p>
      </div>

      {/* Ch5 */}
      <div className="page-break">
        <div className="chapter-header"><div className="chapter-num">Chapter 5</div><h1 style={{ color: '#fff', margin: 0 }}>Lead Generation &amp; Sales</h1></div>
        <img src={salesImg} alt="" className="chapter-img" />
        <h2>The Sales Conversation (6 Steps)</h2>
        <ol>
          <li><strong>Connect</strong> — Build genuine rapport before anything else.</li>
          <li><strong>Discover</strong> — Ask about their power situation. Listen 80% of the time.</li>
          <li><strong>Identify Pain</strong> — Uncover their specific frustration. A pain point is a problem your product solves.</li>
          <li><strong>Present</strong> — Show how VERJ solves their specific problem. Personalise.</li>
          <li><strong>Handle Objections</strong> — Acknowledge, validate, then address with facts.</li>
          <li><strong>Close</strong> — Ask for the next step clearly and directly.</li>
        </ol>
        <h2>Common Objections & Responses</h2>
        <table>
          <thead><tr><th>Objection</th><th>Response Approach</th></tr></thead>
          <tbody>
            <tr><td>"Too expensive"</td><td>Reframe as investment; calculate monthly fuel savings vs system cost</td></tr>
            <tr><td>"Tried solar before"</td><td>Acknowledge; ask about the old system; differentiate VERJ quality</td></tr>
            <tr><td>"Let me think"</td><td>Find the real concern: "What specifically would you like more info on?"</td></tr>
            <tr><td>"Neighbour uses another brand"</td><td>Never disparage; explain VERJ's specific differentiators</td></tr>
          </tbody>
        </table>
        <div className="callout"><strong>ROI Tip:</strong> If a customer spends ₦25,000/month on fuel = ₦300,000/year. A ₦1.5M system pays for itself in 5 years, then free energy for 20+ years.</div>
      </div>

      {/* Ch6 */}
      <div className="page-break">
        <div className="chapter-header"><div className="chapter-num">Chapter 6</div><h1 style={{ color: '#fff', margin: 0 }}>Customer Needs Assessment</h1></div>
        <h2>Load Assessment Process</h2>
        <ol>
          <li><strong>List every appliance</strong> the customer uses (and wants to add)</li>
          <li><strong>Record power ratings</strong> (wattage from label or manual)</li>
          <li><strong>Record daily usage hours</strong> — split day-time from night-time</li>
          <li><strong>Calculate energy:</strong> Wattage × Hours = Wh per day</li>
          <li><strong>Submit to EnBO</strong> for engineering review</li>
        </ol>
        <div className="callout"><strong>Critical Rule:</strong> Never promise a specific system size without engineering review. Under or over-sizing a system damages the customer relationship and VERJ's reputation.</div>
        <h2>Key Questions to Ask</h2>
        <ul>
          <li>How many hours of power outage daily?</li>
          <li>What appliances do you run on generator?</li>
          <li>Do you have air conditioning? How many units? How many hours?</li>
          <li>Monthly generator fuel spend?</li>
          <li>Existing solar system? What brand?</li>
        </ul>
      </div>

      {/* Ch7 */}
      <div className="page-break">
        <div className="chapter-header"><div className="chapter-num">Chapter 7</div><h1 style={{ color: '#fff', margin: 0 }}>BDO Onboarding Workflow</h1></div>
        <h2>Application Pipeline</h2>
        <table>
          <thead><tr><th>Status</th><th>What It Means</th></tr></thead>
          <tbody>
            <tr><td>Submitted</td><td>Application received, under review</td></tr>
            <tr><td>KYC Pending</td><td>Identity documents being reviewed</td></tr>
            <tr><td>KYC Verified</td><td>Identity confirmed; eligible for shortlisting</td></tr>
            <tr><td>Shortlisted</td><td>Onboarding portal active; train and take assessment</td></tr>
            <tr><td>Assessment Passed</td><td>Awaiting Chief Admin activation</td></tr>
            <tr><td>Activated</td><td>Full BDO account, VBDO ID, certificate, and work ID issued</td></tr>
          </tbody>
        </table>
        <h2>Assessment Rules</h2>
        <ul>
          <li><strong>Total Marks:</strong> 100 (10 critical questions × 4 marks + 20 standard × 3 marks)</li>
          <li><strong>Pass Mark:</strong> 70 marks (70%)</li>
          <li><strong>Maximum Attempts:</strong> 2</li>
          <li>Failing both attempts locks onboarding access permanently</li>
          <li>Chief Admin may override to grant an additional attempt</li>
        </ul>
        <div className="callout"><strong>Security Rule:</strong> When activated as a BDO, your onboarding credentials are permanently invalidated. New BDO credentials are issued via email and WhatsApp.</div>
      </div>

      {/* Ch8 */}
      <div className="page-break">
        <div className="chapter-header"><div className="chapter-num">Chapter 8</div><h1 style={{ color: '#fff', margin: 0 }}>Professional Standards</h1></div>
        <h2>Dress Code</h2>
        <p>Always dress smartly — smart casual minimum. Wear VERJ branded items when available. You are VERJ's representative in your community.</p>
        <h2>Ethical Conduct</h2>
        <ul>
          <li><strong>No Personal Gifts:</strong> Decline cash, gifts, or favours from customers.</li>
          <li><strong>No Misrepresentation:</strong> Never make false claims about VERJ products.</li>
          <li><strong>Confidentiality:</strong> Customer data in EnBO is strictly confidential.</li>
          <li><strong>Conflict of Interest:</strong> Disclose any personal relationships with customers.</li>
          <li><strong>Following Authority:</strong> If an instruction conflicts with VERJ policy, raise your concern professionally before acting.</li>
        </ul>
        <div className="callout"><strong>Final Reminder:</strong> Your VBDO status can be suspended or revoked for serious code of conduct violations. Your credentials are earned — and must be maintained.</div>
      </div>

      {/* Back cover */}
      <div style={{ textAlign: 'center', padding: '60px 0', borderTop: '2px solid #111', marginTop: 40 }}>
        <img src={logoOnLight} alt="EnBO by VERJ" style={{ height: 56, margin: '0 auto 16px', display: 'block' }} />
        <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 8 }}>Verj Innovations Limited · Doing Business As VERJ SOLAR<br />EnBO BDO Onboarding Programme · This document is confidential. Issued to VERJ BDO applicants only.</p>
      </div>

      <div className="no-print" style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', gap: 12 }}>
        <button onClick={() => window.print()} style={{ background: '#f59e0b', border: 'none', color: '#000', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          🖨️ Print / Save as PDF
        </button>
        <button onClick={() => window.close()} style={{ background: '#111', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          Close
        </button>
      </div>
    </div>
  );
}
