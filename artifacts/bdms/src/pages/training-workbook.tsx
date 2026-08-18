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

const moduleColors = {
  amber: '#f59e0b',
  navy: '#111827',
  soft: '#f8fafc',
  ink: '#111',
  muted: '#5f6672',
};

export default function TrainingWorkbook() {
  useEffect(() => {
    document.title = 'VERJ SOLAR BDO Training Workbook';
  }, []);

  return (
    <div
      className="workbook-root"
      style={{
        fontFamily: 'Georgia, serif',
        color: moduleColors.ink,
        background: '#fff',
        maxWidth: 780,
        margin: '0 auto',
        padding: '40px 48px',
      }}
    >
      <style>{`
        @media print {
          @page { margin: 16mm 16mm; size: A4; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
        .workbook-root h1 {
          font-size: 2rem;
          font-weight: 900;
          margin: 0 0 8px;
          line-height: 1.12;
        }
        .workbook-root h2 {
          font-size: 1.22rem;
          font-weight: 700;
          border-bottom: 2px solid #f59e0b;
          padding-bottom: 6px;
          margin: 28px 0 13px;
          line-height: 1.25;
        }
        .workbook-root h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 18px 0 7px;
          line-height: 1.3;
        }
        .workbook-root p {
          line-height: 1.65;
          margin: 0 0 11px;
          font-size: 0.91rem;
        }
        .workbook-root ul,
        .workbook-root ol {
          padding-left: 21px;
          margin: 0 0 12px;
        }
        .workbook-root li {
          line-height: 1.62;
          font-size: 0.91rem;
          margin-bottom: 5px;
        }
        .workbook-root .cover-title {
          letter-spacing: -0.04em;
        }
        .workbook-root .module-header {
          background: #111827;
          color: #fff;
          padding: 20px 24px;
          border-radius: 10px;
          margin-bottom: 18px;
        }
        .workbook-root .module-number {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #f59e0b;
          margin-bottom: 7px;
        }
        .workbook-root img.module-img {
          width: 100%;
          height: 205px;
          object-fit: cover;
          border-radius: 9px;
          margin: 0 0 18px;
        }
        .workbook-root .callout {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 12px 15px;
          border-radius: 5px;
          margin: 15px 0;
          font-size: 0.87rem;
          line-height: 1.55;
        }
        .workbook-root .warning {
          background: #fff1f2;
          border-left-color: #e11d48;
        }
        .workbook-root .formula-box {
          background: #f8fafc;
          border: 1px solid #d9dee7;
          padding: 12px 15px;
          border-radius: 5px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          margin: 10px 0;
          text-align: center;
        }
        .workbook-root .card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 12px 0 15px;
        }
        .workbook-root .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          padding: 11px 13px;
        }
        .workbook-root .info-card strong {
          display: block;
          color: #111827;
          margin-bottom: 4px;
          font-size: 0.88rem;
        }
        .workbook-root .info-card span {
          display: block;
          color: #5f6672;
          font-size: 0.83rem;
          line-height: 1.45;
        }
        .workbook-root .step-row {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 10px;
          align-items: start;
          margin: 10px 0;
        }
        .workbook-root .step-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f59e0b;
          color: #111827;
          font-weight: 900;
          font-size: 0.82rem;
        }
        .workbook-root .step-copy {
          font-size: 0.89rem;
          line-height: 1.5;
        }
        .workbook-root .step-copy strong {
          color: #111827;
        }
        .workbook-root table {
          width: 100%;
          border-collapse: collapse;
          margin: 11px 0 14px;
          font-size: 0.86rem;
        }
        .workbook-root th {
          background: #111827;
          color: #fff;
          padding: 8px 10px;
          text-align: left;
        }
        .workbook-root td {
          border: 1px solid #d9dee7;
          padding: 8px 10px;
          vertical-align: top;
          line-height: 1.45;
        }
        .workbook-root .formula {
          font-size: 1rem;
          line-height: 1.8;
          letter-spacing: 0.02em;
          color: #111827;
        }
        @media screen and (max-width: 600px) {
          .workbook-root { padding: 24px 18px !important; }
          .workbook-root .card-grid { grid-template-columns: 1fr; }
          .workbook-root img.module-img { height: 170px; }
          .workbook-root .workbook-actions {
            position: static !important;
            justify-content: center;
            flex-wrap: wrap;
            margin: 28px auto 0;
          }
        }
      `}</style>

      {/* Cover */}
      <div className="page-break" style={{ textAlign: 'center', padding: '55px 0 70px' }}>
        <img
          src={logoOnLight}
          alt="EnBO by VERJ"
          style={{ height: 80, margin: '0 auto 24px', display: 'block' }}
        />
        <h1
          className="cover-title"
          style={{ fontSize: '2.65rem', fontWeight: 900, lineHeight: 1.08, marginBottom: 12 }}
        >
          BDO Training
          <br />
          Workbook
        </h1>
        <p style={{ color: '#666', fontSize: '1rem', marginBottom: 28 }}>
          Business Development Officer
          <br />
          Training Programme
        </p>
        <img
          src={heroImg}
          alt="Solar panels and renewable energy"
          style={{ width: '100%', height: 315, objectFit: 'cover', borderRadius: 12 }}
        />
        <div
          style={{
            margin: '27px auto 0',
            maxWidth: 440,
            padding: '13px 16px',
            borderTop: `2px solid ${moduleColors.amber}`,
            borderBottom: `2px solid ${moduleColors.amber}`,
            color: '#555',
            fontSize: '0.85rem',
            lineHeight: 1.55,
          }}
        >
          A practical guide to representing VERJ SOLAR, creating opportunities, understanding
          solar solutions, and serving customers with integrity.
        </div>
        <p style={{ marginTop: 26, color: '#888', fontSize: '0.78rem' }}>
          Confidential — for VERJ BDO Applicants only
          <br />
          Verj Innovations Limited · Doing Business As VERJ SOLAR
          <br />
          EnBO Onboarding Platform
        </p>
      </div>

      {/* Module 1 */}
      <div className="page-break">
        <div className="module-header">
          <div className="module-number">Module 1</div>
          <h1 style={{ color: '#fff' }}>Sales &amp; Marketing Fundamentals</h1>
        </div>
        <img
          src={salesImg}
          alt="VERJ SOLAR sales and customer conversation"
          className="module-img"
        />

        <h2>1. The VERJ BDO Work Structure</h2>
        <ul>
          <li>
            <strong>Flexible Involvement:</strong> The BDO model offers a flexible structure
            allowing you to source and convert solar prospects alongside your existing job,
            business, or studies.
          </li>
          <li>
            <strong>Opportunity Finder:</strong> As a BDO, your primary focus is lead generation,
            relationship building, and opportunity creation. You are the bridge between energy
            prospects and VERJ engineering solutions.
          </li>
        </ul>

        <h2>2. Lead Generation &amp; Prospecting</h2>
        <ul>
          <li>
            <strong>Target Audience:</strong> Salaried employees, homeowners, SMEs, worship
            centers, and commercial institutions experiencing power grid instability or high fuel
            costs.
          </li>
          <li>
            <strong>Initial Customer Conversations:</strong> Focus on the prospect&apos;s energy
            pain points—unreliable power, high generator operational costs, and business/household
            disruptions—rather than leading with technical specifications or upfront pricing.
          </li>
          <li>
            <strong>The Sales Funnel:</strong> Prospects who are not ready to purchase immediately
            should be nurtured in your pipeline for future follow-up and referrals.
          </li>
        </ul>

        <h2>3. Handling Objections</h2>
        <div className="card-grid">
          <div className="info-card">
            <strong>Price Objections</strong>
            <span>
              Reframe solar from a high initial cost to a long-term capital investment that
              eliminates recurring fuel expense and operational downtime.
            </span>
          </div>
          <div className="info-card">
            <strong>Trust &amp; Value</strong>
            <span>
              Emphasize VERJ Solar&apos;s installation standards, engineering backing, and
              long-term warranties to build confidence.
            </span>
          </div>
        </div>
        <div className="callout">
          <strong>Financing reminder:</strong> Present flexible financing options where applicable.
        </div>

        <h2>4. Sales Operations &amp; Pipeline Management</h2>
        <p>
          All lead progress, customer details, and pipeline stages must be routinely recorded and
          managed on the <strong>BDMS (Business Development Management System)</strong> platform.
        </p>
      </div>

      {/* Module 2 */}
      <div className="page-break">
        <div className="module-header">
          <div className="module-number">Module 2</div>
          <h1 style={{ color: '#fff' }}>Basic Technical Knowledge for BDOs</h1>
        </div>
        <img
          src={solarBasicsImg}
          alt="Solar panels and solar energy components"
          className="module-img"
        />

        <h2>1. System Components</h2>
        <div className="card-grid">
          <div className="info-card">
            <strong>Solar Panels (PV)</strong>
            <span>Capture sunlight and generate Direct Current (DC) electricity.</span>
          </div>
          <div className="info-card">
            <strong>Inverter</strong>
            <span>Converts DC electricity from solar panels or batteries into AC electricity.</span>
          </div>
          <div className="info-card">
            <strong>Battery Storage</strong>
            <span>Acts as the energy bank to store electricity for nighttime use or outages.</span>
          </div>
          <div className="info-card">
            <strong>Charge Controller</strong>
            <span>Regulates incoming panel voltage to protect batteries from overcharging.</span>
          </div>
        </div>

        <h2>2. Load Types &amp; Solar Math</h2>
        <ul>
          <li>
            <strong>Resistive Loads:</strong> Draw a steady, predictable amount of power, such as
            LED bulbs, televisions, and laptops.
          </li>
          <li>
            <strong>Inductive Loads:</strong> Require high initial startup power surges, such as
            air conditioners, water pumps, and refrigerators.
          </li>
        </ul>
        <div className="formula-box">
          <div className="formula">Energy (Watt-hours) = Power (Watts) × Time (Hours)</div>
        </div>
        <div className="callout">
          <strong>Example:</strong> A 100-Watt appliance running for 10 hours consumes 1,000
          Watt-hours (1 kWh).
        </div>
        <p>
          <strong>Peak Solar Hours:</strong> Nigeria averages between <strong>4 to 6 hours</strong>{' '}
          of peak sunshine daily.
        </p>

        <h2>3. Technical Boundaries for BDOs</h2>
        <ul>
          <li>
            <strong>Consultant Role:</strong> BDOs collect energy load information—appliance lists
            and run-times—and present solutions.
          </li>
          <li>
            <strong>Engineering Rule:</strong> Final system sizing, electrical design, and price
            quotes must always be verified by VERJ technical engineers before commitment.
          </li>
        </ul>
        <div className="callout warning">
          <strong>Never over-promise:</strong> You are an opportunity finder, not an engineer.
          Defer final system design to VERJ engineers.
        </div>
      </div>

      {/* Module 3 */}
      <div className="page-break">
        <div className="module-header">
          <div className="module-number">Module 3</div>
          <h1 style={{ color: '#fff' }}>Solar Financing &amp; Installment Workflow</h1>
        </div>
        <img
          src={productsImg}
          alt="VERJ SOLAR solutions for homes and businesses"
          className="module-img"
        />

        <h2>1. Purpose &amp; Eligibility</h2>
        <div className="card-grid">
          <div className="info-card">
            <strong>Purpose</strong>
            <span>
              Remove high upfront cost barriers by allowing clients to spread solar system
              payments over monthly terms.
            </span>
          </div>
          <div className="info-card">
            <strong>Qualifying Groups</strong>
            <span>
              Salaried individuals, homeowners, SMEs, worship centers, and registered corporations.
            </span>
          </div>
        </div>

        <h2>2. Mandatory Documentation</h2>
        <p>Applicants submitting for financing approval must provide three core documents:</p>
        <div className="card-grid">
          <div className="info-card">
            <strong>01 · 12-Month Bank Statement</strong>
            <span>Evidence of account activity and income history.</span>
          </div>
          <div className="info-card">
            <strong>02 · National Identification Number</strong>
            <span>Your NIN is required for identity verification.</span>
          </div>
          <div className="info-card">
            <strong>03 · Bank Verification Number</strong>
            <span>Your BVN supports the financing partner&apos;s review.</span>
          </div>
        </div>

        <h2>3. The 3-Stage Financing Workflow</h2>
        <div className="avoid-break">
          <div className="step-row">
            <div className="step-number">1</div>
            <div className="step-copy">
              <strong>Lead &amp; Load Assessment:</strong> The BDO collects the prospect&apos;s
              appliance schedule, submits it to the operational channel, and receives an official
              engineering recommendation.
            </div>
          </div>
          <div className="step-row">
            <div className="step-number">2</div>
            <div className="step-copy">
              <strong>Credit Review &amp; Equity:</strong> The financing partner&apos;s automated
              review system conducts credit checks on the submitted documents. Upon approval, the
              customer pays their initial <strong>Equity Contribution</strong>.
            </div>
          </div>
          <div className="step-row">
            <div className="step-number">3</div>
            <div className="step-copy">
              <strong>Deployment:</strong> Once equity payment is verified, installation execution
              begins within <strong>4–5 business days in Lagos</strong>, or{' '}
              <strong>7–10 business days outside Lagos</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Module 4 */}
      <div className="page-break">
        <div className="module-header">
          <div className="module-number">Module 4</div>
          <h1 style={{ color: '#fff' }}>The &quot;You&quot; Factor &amp; Compliance</h1>
        </div>
        <img
          src={teamImg}
          alt="VERJ SOLAR team representing the brand"
          className="module-img"
        />

        <h2>1. Personal Brand &amp; Position</h2>
        <div className="card-grid">
          <div className="info-card">
            <strong>Carriage &amp; Presentation</strong>
            <span>
              Clients evaluate and trust the BDO as an individual before trusting the hardware
              brand. Punctuality, professional attire, and clear communication are essential.
            </span>
          </div>
          <div className="info-card">
            <strong>Positioning</strong>
            <span>
              Always position yourself as an elite <strong>Energy Consultant</strong> delivering
              reliable power solutions.
            </span>
          </div>
        </div>

        <h2>2. Operational Compliance &amp; Non-Negotiable Rules</h2>
        <div className="callout warning">
          <strong>Zero Personal Payments:</strong> All customer payments—deposits, equity, or
          outright purchases—<strong>MUST</strong> be made directly into official VERJ or financing
          partner bank accounts. BDOs are strictly prohibited from receiving cash or personal
          transfers.
        </div>
        <div className="callout warning">
          <strong>No Unapproved Discounts:</strong> BDOs cannot offer custom price cuts or alter
          official quotation terms without explicit management approval.
        </div>

        <h2>3. Digital Branding &amp; Mindset</h2>
        <ul>
          <li>
            <strong>Digital Footprint:</strong> Maintain clean, professional digital branding on
            public channels and social platforms.
          </li>
          <li>
            <strong>Growth Mindset:</strong> Rejection is a natural component of sales—treat it as
            feedback, refine your consultation approach, and continue nurturing your pipeline.
          </li>
        </ul>

        <h2>The VERJ BDO Formula</h2>
        <div className="formula-box">
          <div className="formula">
            Find → Ask → Listen → Record → Solve → Follow Up → Deliver → Build Trust
          </div>
        </div>
        <div className="callout">
          <strong>Remember:</strong> Your personal conduct is part of the customer experience. Be
          credible, compliant, and consistent at every stage of the relationship.
        </div>
      </div>

      {/* Back cover */}
      <div style={{ textAlign: 'center', padding: '60px 0', borderTop: '2px solid #111', marginTop: 40 }}>
        <img
          src={logoOnLight}
          alt="EnBO by VERJ"
          style={{ height: 56, margin: '0 auto 16px', display: 'block' }}
        />
        <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 8 }}>
          Verj Innovations Limited · Doing Business As VERJ SOLAR
          <br />
          EnBO BDO Onboarding Programme · This document is confidential.
          <br />
          Issued to VERJ BDO applicants only.
        </p>
      </div>

      <div
        className="no-print workbook-actions"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          gap: 12,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => window.print()}
          style={{
            background: '#f59e0b',
            border: 'none',
            color: '#000',
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          🖨️ Print / Save as PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            background: '#111',
            border: 'none',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}