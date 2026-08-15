---
name: Protection device auto-selection for engineering designs
description: MCBs, MCCBs, RCDs, SPDs of various types/sizes must be added to inventory and auto-selected per design using standard electrical engineering formulas.
---

## Rule
When implementing the Inventory backend (Phase 3), add protection devices as standard inventory items. The engineering design engine must auto-select the correct device for each design using recognised formulas.

## Inventory items to add
- **MCBs** (Miniature Circuit Breakers): Type B and Type C, sizes 6A, 10A, 16A, 20A, 25A, 32A, 40A, 50A, 63A — single-pole and double-pole
- **MCCBs** (Moulded Case Circuit Breakers): 63A, 100A, 160A, 250A, 400A, 630A — for larger commercial/industrial systems
- **RCDs** (Residual Current Devices): 30mA (residential), 100mA (commercial), 300mA (industrial) — 2-pole and 4-pole
- **RCBOs** (Combined RCD+MCB): 16A, 20A, 25A, 32A / 30mA
- **DC SPDs** (DC Surge Protection Devices): Type 1+2 combined, 600V, 1000V, 1200V — for PV string protection
- **AC SPDs** (AC Surge Protection Devices): Type 2, 230V/400V — for inverter AC output protection

Brands to include (Nigerian market): ABB, Schneider Electric, Hager, Legrand, Siemens, Chint

## Auto-selection formulas (implement in design engine)

### DC MCB / String fuse sizing
- String current = Isc × 1.25 (short-circuit × 1.25 safety factor)
- Select next standard size above calculated current
- Use Type B or gPV-rated breakers for PV strings

### AC MCB at inverter output
- AC current = Inverter rated power (W) ÷ (Voltage × Power Factor)
  - Single phase: I = P / (230 × 0.95)
  - Three phase: I = P / (√3 × 400 × 0.95)
- Select next standard MCB size above calculated current
- Use Type C for inverter output (handles inrush)

### Battery fuse / MCCB
- Battery current = Inverter power (W) ÷ Battery voltage (V) × 1.25
- Select next standard fuse/MCCB size above calculated value

### RCD selection
- Residential systems (≤12kW): 30mA RCD, 2-pole
- Commercial systems (>12kW, single phase): 30mA RCD, 2-pole
- Three-phase systems: 4-pole RCD, 100mA or 300mA based on load

### SPD selection
- DC SPD: always required for PV array; voltage rating ≥ Voc × 1.25; select 1000V for ≤800V Voc, 1200V for higher
- AC SPD: always required at inverter AC output; Type 2, 230V for single phase, 400V for three phase
- One DC SPD per string combiner; one AC SPD per inverter

**Why:** These are mandatory protection components in every solar installation per IEC 62548 and Nigerian SEB standards. Auto-selection ensures compliance and saves engineer time.

**How to apply:** In the design engine (server-side), after selecting inverter/battery/panels, run the formulas above and append protection devices as required line items with quantities. Show them as a "Protection Devices" section in the calculator results, separate from main components.
