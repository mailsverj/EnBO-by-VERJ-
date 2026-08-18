import { Router } from "express";
import { db } from "../lib/db.js";
import { bdoApplicationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function escapeHtml(str: string | null | undefined): string {
  return (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── GET /documents/certificate/:id ─────────────────────────────────────────
router.get("/documents/certificate/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [app] = await db.select().from(bdoApplicationsTable)
    .where(eq(bdoApplicationsTable.id, id)).limit(1);
  if (!app || app.status !== "Activated") {
    res.status(404).json({ error: "Not found or not yet activated" }); return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(buildCertificate(app));
});

// ── GET /documents/work-id/:id ──────────────────────────────────────────────
router.get("/documents/work-id/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [app] = await db.select().from(bdoApplicationsTable)
    .where(eq(bdoApplicationsTable.id, id)).limit(1);
  if (!app || app.status !== "Activated") {
    res.status(404).json({ error: "Not found or not yet activated" }); return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(buildWorkId(app));
});

// ───────────────────────────────────────────────────────────────────────────
// Certificate HTML
// ───────────────────────────────────────────────────────────────────────────
function buildCertificate(app: typeof bdoApplicationsTable.$inferSelect): string {
  const issuedDate = formatDate(app.activatedAt);
  const vbdoId = escapeHtml(app.generatedUsername ?? "—");
  const name = escapeHtml(app.fullName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Certificate of Appointment — ${name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @page{size:A4 landscape;margin:0}
  html,body{width:297mm;height:210mm;background:#fff;font-family:Georgia,serif}
  .page{width:297mm;height:210mm;display:flex;align-items:center;justify-content:center;background:#fff;position:relative;overflow:hidden}
  .border-outer{position:absolute;inset:8mm;border:3px solid #C9A84C}
  .border-inner{position:absolute;inset:11.5mm;border:1px solid #C9A84C}
  .corner{position:absolute;width:14mm;height:14mm;border-color:#C9A84C;border-style:solid}
  .tl{top:7mm;left:7mm;border-width:3px 0 0 3px}
  .tr{top:7mm;right:7mm;border-width:3px 3px 0 0}
  .bl{bottom:7mm;left:7mm;border-width:0 0 3px 3px}
  .br{bottom:7mm;right:7mm;border-width:0 3px 3px 0}
  .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:75mm;font-weight:900;color:rgba(201,168,76,0.055);letter-spacing:-3px;z-index:0;pointer-events:none;font-family:sans-serif;user-select:none}
  .content{position:relative;z-index:1;text-align:center;padding:16mm 28mm;width:100%}
  .brand{font-size:8pt;letter-spacing:5px;text-transform:uppercase;color:#C9A84C;font-family:Arial,sans-serif;font-weight:700;margin-bottom:3mm}
  .cert-title{font-size:26pt;color:#111;letter-spacing:2px;text-transform:uppercase;margin-bottom:1mm}
  .cert-sub{font-size:9pt;color:#777;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:5mm}
  .rule{width:80mm;height:1px;background:#C9A84C;margin:3mm auto}
  .presents{font-size:10.5pt;color:#555;font-style:italic;margin-bottom:4mm}
  .name{font-size:30pt;color:#1a1a1a;font-weight:bold;margin-bottom:1.5mm}
  .role{font-size:10.5pt;color:#555;font-style:italic;margin-bottom:4mm}
  .body{font-size:9.5pt;color:#444;line-height:1.75;max-width:185mm;margin:0 auto 5mm}
  .badge{font-family:'Courier New',monospace;font-size:12.5pt;font-weight:bold;color:#C9A84C;letter-spacing:2px;background:#fafafa;border:1px solid #C9A84C;display:inline-block;padding:1.5mm 6mm;margin-bottom:6mm;border-radius:2px}
  .sigs{display:flex;justify-content:center;gap:28mm;margin-top:1mm}
  .sig{text-align:center}
  .sig-script{font-family:Georgia,serif;font-size:18pt;color:#1a3a7a;font-style:italic;margin-bottom:0.5mm}
  .sig-line{width:44mm;height:1px;background:#aaa;margin:0 auto 1.5mm}
  .sig-name{font-size:9pt;font-weight:bold;color:#222;margin-bottom:0.5mm}
  .sig-title{font-size:7.5pt;color:#888;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none}}
</style>
</head>
<body>
<div class="page">
  <div class="watermark">VERJ</div>
  <div class="border-outer"></div><div class="border-inner"></div>
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>
  <div class="content">
    <div class="brand">Verj Innovations Limited</div>
    <div class="cert-title">Certificate of Appointment</div>
    <div class="cert-sub">Business Development Officer</div>
    <div class="rule"></div>
    <div class="presents">This is to certify that</div>
    <div class="name">${name}</div>
    <div class="role">has been duly appointed as a Business Development Officer of VERJ Solar</div>
    <div class="body">
      Having successfully completed the VERJ BDO onboarding programme — including identity verification,
      competency assessment, and training requirements — this individual is hereby authorised to represent
       Verj Innovations Limited, Doing Business As VERJ SOLAR, in the capacity of Business Development Officer.
    </div>
    <div class="badge">${vbdoId}</div>
    <div class="sigs">
      <div class="sig">
        <div class="sig-script">J. Ijaola</div>
        <div class="sig-line"></div>
        <div class="sig-name">Managing Director</div>
        <div class="sig-title">Verj Innovations Limited · Doing Business As VERJ SOLAR</div>
      </div>
      <div class="sig">
        <div style="height:28px"></div>
        <div class="sig-line"></div>
        <div class="sig-name">Date Issued</div>
        <div class="sig-title">${issuedDate}</div>
      </div>
    </div>
  </div>
</div>
<div class="no-print" style="text-align:center;padding:20px;font-family:sans-serif;font-size:13px;color:#555">
  <button onclick="window.print()" style="background:#C9A84C;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600">🖨 Print / Save as PDF</button>
  <p style="margin-top:8px;font-size:11px;color:#999">Print in Landscape orientation · A4 paper</p>
</div>
</body>
</html>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Work ID HTML
// ───────────────────────────────────────────────────────────────────────────
function buildWorkId(app: typeof bdoApplicationsTable.$inferSelect): string {
  const issuedDate = formatDate(app.activatedAt);
  const vbdoId = escapeHtml(app.generatedUsername ?? "—");
  const name = escapeHtml(app.fullName);
  const email = escapeHtml(app.email ?? "");
  const phone = escapeHtml(app.phone ?? "");
  const idNum = (app.generatedUsername ?? "0000").replace("VBDO-", "");
  const initials = (app.fullName ?? "?")
    .split(" ").map((w: string) => w[0] ?? "").slice(0, 2).join("").toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>VERJ Work ID — ${name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @page{size:A4;margin:15mm}
  body{background:#f0f0f0;font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:6mm}
  .row{display:flex;gap:12mm;align-items:flex-start;justify-content:center}
  .col{display:flex;flex-direction:column;align-items:center;gap:2mm}
  .col-label{font-size:9pt;color:#666;font-family:sans-serif;font-weight:600}

  /* card base */
  .card{width:85.6mm;height:53.98mm;border-radius:3.5mm;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.22);position:relative;flex-shrink:0}

  /* FRONT */
  .front{background:linear-gradient(135deg,#0A1628 0%,#162444 65%,#1e3060 100%);color:#fff}
  .front-accent{position:absolute;top:0;left:0;right:0;height:2mm;background:linear-gradient(90deg,#C9A84C,#f0d080,#C9A84C)}
  .front-foot{position:absolute;bottom:0;left:0;right:0;height:8mm;background:rgba(201,168,76,0.12);border-top:0.5px solid rgba(201,168,76,0.35);display:flex;align-items:center;padding:0 3.5mm}
  .front-foot-text{font-size:4.5pt;color:rgba(201,168,76,0.75);letter-spacing:1px;text-transform:uppercase}
  .front-body{padding:3mm 3.5mm 2mm;height:calc(100% - 8mm - 2mm);display:flex;gap:2.5mm;align-items:flex-start}
  .photo{width:13mm;height:16mm;border-radius:1.5mm;background:rgba(255,255,255,0.09);border:1px solid rgba(201,168,76,0.45);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13pt;font-weight:900;color:rgba(201,168,76,0.88);letter-spacing:-1px}
  .info{flex:1;min-width:0}
  .info-brand{font-size:4.5pt;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;font-weight:700;margin-bottom:1mm}
  .info-name{font-size:8pt;font-weight:700;line-height:1.2;margin-bottom:0.8mm;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .info-role{font-size:5.5pt;color:rgba(201,168,76,0.8);letter-spacing:1px;text-transform:uppercase;margin-bottom:1.5mm}
  .info-id{font-family:'Courier New',monospace;font-size:9pt;font-weight:bold;color:#C9A84C;letter-spacing:1px}
  .info-issued{font-size:5pt;color:rgba(255,255,255,0.45);margin-top:0.8mm}
  .qr{width:11mm;height:11mm;background:rgba(255,255,255,0.07);border:1px solid rgba(201,168,76,0.28);border-radius:1mm;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1mm}
  .qr-text{font-size:3.5pt;color:rgba(255,255,255,0.4);text-align:center;line-height:1.4}

  /* BACK */
  .back{background:linear-gradient(135deg,#0A1628 0%,#162444 100%);color:#fff}
  .magstripe{width:100%;height:9mm;background:#111;margin-top:5mm}
  .back-body{padding:2.5mm 3.5mm}
  .bl{font-size:4.5pt;color:#C9A84C;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.5mm}
  .bv{font-size:6.5pt;color:rgba(255,255,255,0.82);margin-bottom:1.8mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .disclaimer{font-size:4pt;color:rgba(255,255,255,0.3);line-height:1.5;border-top:0.5px solid rgba(255,255,255,0.1);padding-top:1.5mm;margin-top:1mm}

  @media print{body{background:#fff}.no-print{display:none}}
</style>
</head>
<body>

<div class="row">
  <!-- FRONT -->
  <div class="col">
    <div class="card front">
      <div class="front-accent"></div>
      <div class="front-body">
        <div class="photo">${initials}</div>
        <div class="info">
          <div class="info-brand">Verj Innovations Limited · VERJ SOLAR</div>
          <div class="info-name">${name}</div>
          <div class="info-role">Business Development Officer</div>
          <div class="info-id">${vbdoId}</div>
          <div class="info-issued">Issued: ${issuedDate}</div>
        </div>
        <div class="qr">
          <div class="qr-text">ID<br/>${idNum}</div>
        </div>
      </div>
      <div class="front-foot">
        <span class="front-foot-text">VERJ · Official Staff ID · Not Transferable</span>
      </div>
    </div>
    <div class="col-label">Front</div>
  </div>

  <!-- BACK -->
  <div class="col">
    <div class="card back">
      <div class="magstripe"></div>
      <div class="back-body">
        <div class="bl">Full Name</div><div class="bv">${name}</div>
        <div class="bl">VBDO ID</div><div class="bv">${vbdoId}</div>
        <div class="bl">Email</div><div class="bv">${email}</div>
        ${phone ? `<div class="bl">Phone</div><div class="bv">${phone}</div>` : ""}
        <div class="disclaimer">If found, return to: Verj Innovations Limited (Doing Business As: VERJ SOLAR), Nigeria. This card is the property of VERJ SOLAR and must be surrendered upon termination of engagement. Report loss: mails.verj@gmail.com</div>
      </div>
    </div>
    <div class="col-label">Back</div>
  </div>
</div>

<div class="no-print" style="text-align:center;margin-top:8px;font-family:sans-serif">
  <p style="color:#888;font-size:11px;margin-bottom:10px">Print on CR80 card stock (85.6 × 53.98 mm) · Portrait orientation</p>
  <button onclick="window.print()" style="background:#0A1628;color:#C9A84C;border:1px solid #C9A84C;padding:10px 28px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600">🖨 Print / Save as PDF</button>
</div>
</body>
</html>`;
}

export default router;
