"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDocuments } from "@/services/Documents";
import { getRFIs } from "@/services/RFI";
import { getTeams, GetTeamMembers } from "@/services/Teams";
import {
  startWizardDraft,
  saveWizardStep,
  finalizeWizardDraft,
  getWizardOrgCatalog,
} from "@/services/ProjectWizard";
import { getCompanies, createCompany } from "@/services/Companies";
import { getContacts, createContact } from "@/services/Contacts";
import { getAssets } from "@/services/AssetManagement";
import { listOrgWorkflows } from "@/services/OrgWorkflows";
import { listOrgSOPs } from "@/services/OrgSOPs";
import { listOrgSafetyPlans } from "@/services/OrgSafetyPlans";
import { listOrgMobCatalog } from "@/services/OrgMobCatalog";
import { listOrgToolboxTalks } from "@/services/OrgToolboxTalks";
import {
  listCommunications,
  createCommunication,
} from "@/services/Communications";

// ─── STEPS ────────────────────────────────────────────────────────────────────
const STEPS = [
  { key: "start", label: "How to start", required: true },
  { key: "basics", label: "Basics", required: true },
  { key: "assets", label: "Assets", required: false },
  { key: "scope", label: "Scope", required: true },
  { key: "schedule", label: "Schedule", required: true },
  { key: "team", label: "Team", required: true },
  { key: "customer", label: "Customer", required: false },
  { key: "sites", label: "Sites", required: false },
  { key: "permits", label: "Permits", required: false },
  // { key: "mob_site", label: "Site Setup", required: false },
  // { key: "mob_ppe", label: "PPE", required: false },
  // { key: "mob_supplies", label: "Supplies", required: false },
  // { key: "mob_trailer", label: "Trailer", required: false },
  // { key: "mob_house", label: "Housing", required: false },
  // { key: "mob_tools", label: "Tools", required: false },
  { key: "safety", label: "Safety", required: false },
  // { key: "zones", label: "Zones", required: false },
  { key: "quality", label: "Quality", required: false },
  { key: "risk", label: "Risk", required: false },
  { key: "docs", label: "Docs", required: false },
  { key: "budget", label: "Budget", required: false },
  { key: "comms", label: "Comms", required: false },
  { key: "reporting", label: "Reporting", required: false },
  { key: "training", label: "Training", required: false },
  { key: "workflows", label: "Workflows", required: true },
  { key: "sops", label: "SOPs", required: true },
  { key: "partners", label: "Partners", required: true },
  { key: "kickoff", label: "Kickoff", required: true },
];

const PROJECT_NATURE = [
  {
    id: "new_build",
    name: "New build",
    desc: "Greenfield DC from scratch",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 6L7 17v17h9v-9h8v9h9V17L20 6z"
          fill="var(--rf-yellow)"
          opacity=".9"
        />
        <rect
          x="16"
          y="26"
          width="8"
          height="8"
          rx="1"
          fill="var(--rf-yellow2)"
          opacity=".7"
        />
        <path
          d="M20 6L7 17"
          stroke="var(--rf-yellow2)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "expansion",
    name: "Expansion",
    desc: "Add halls or rooms to existing DC",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect
          x="6"
          y="20"
          width="10"
          height="14"
          rx="1"
          fill="var(--rf-txt3)"
          opacity=".5"
        />
        <rect
          x="18"
          y="14"
          width="10"
          height="20"
          rx="1"
          fill="var(--rf-teal)"
          opacity=".7"
        />
        <rect
          x="30"
          y="10"
          width="5"
          height="5"
          rx="1"
          fill="var(--rf-yellow)"
          opacity=".9"
        />
        <line
          x1="30"
          y1="7"
          x2="30"
          y2="9"
          stroke="var(--rf-yellow)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "retrofit",
    name: "Retrofit",
    desc: "Upgrade existing equipment",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect
          x="9"
          y="9"
          width="22"
          height="22"
          rx="3"
          fill="var(--rf-txt3)"
          opacity=".25"
        />
        <rect
          x="14"
          y="14"
          width="12"
          height="12"
          rx="2"
          fill="var(--rf-txt2)"
          opacity=".4"
        />
        <circle cx="20" cy="20" r="3" fill="var(--rf-yellow)" opacity=".9" />
        <circle
          cx="20"
          cy="20"
          r="5.5"
          stroke="var(--rf-yellow)"
          strokeWidth="1.2"
          fill="none"
          opacity=".5"
        />
      </svg>
    ),
  },
  {
    id: "cx_only",
    name: "Commissioning only",
    desc: "Cx scope, no install work",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect
          x="8"
          y="8"
          width="24"
          height="24"
          rx="5"
          fill="var(--rf-purple)"
          opacity=".85"
        />
        <polyline
          points="14,20 18,25 27,15"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const STANDARD_PHASES = [
  {
    id: "ph1",
    name: "Pre-Construction",
    weeks: "2–4 wks",
    desc: "Submittals, shop drawings, owner kickoff",
  },
  {
    id: "ph2",
    name: "Site Mobilization",
    weeks: "1–2 wks",
    desc: "Trailer, laydown, temp power, access",
  },
  {
    id: "ph3",
    name: "Rough-In & Equipment",
    weeks: "4–8 wks",
    desc: "Major equipment set, rough-in complete",
  },
  {
    id: "ph4",
    name: "Systems Integration",
    weeks: "3–6 wks",
    desc: "BMS, controls, cabling terminations",
  },
  {
    id: "ph5",
    name: "Cx & Testing",
    weeks: "2–4 wks",
    desc: "Functional testing, ITAF, Cx reports",
  },
  {
    id: "ph6",
    name: "Owner Training",
    weeks: "3–5 days",
    desc: "Operator training, docs handover",
  },
  {
    id: "ph7",
    name: "Punch & Close",
    weeks: "1–2 wks",
    desc: "Punch list, final inspections, close-out",
  },
];

const AVAILABLE_PEOPLE = [
  {
    id: "p1",
    name: "Chris Martinez",
    initials: "CM",
    role: "National PM",
    avail: "busy",
    color: "#0A2540",
  },
  {
    id: "p2",
    name: "Sarah Chen",
    initials: "SC",
    role: "Regional PM",
    avail: "free",
    color: "#0F6E56",
  },
  {
    id: "p3",
    name: "Mike Johnson",
    initials: "MJ",
    role: "Lead FSE",
    avail: "free",
    color: "#6D28D9",
  },
  {
    id: "p4",
    name: "David Park",
    initials: "DP",
    role: "FSE",
    avail: "busy",
    color: "#D97706",
  },
  {
    id: "p5",
    name: "Jennifer Wu",
    initials: "JW",
    role: "Cx Engineer",
    avail: "free",
    color: "#DC2626",
  },
  {
    id: "p7",
    name: "Maria Garcia",
    initials: "MG",
    role: "App Engineer",
    avail: "free",
    color: "#0066FF",
  },
  {
    id: "p11",
    name: "Emily Brooks",
    initials: "EB",
    role: "FSE",
    avail: "free",
    color: "#059669",
  },
  {
    id: "p12",
    name: "Kevin Rodriguez",
    initials: "KR",
    role: "Cx Engineer",
    avail: "free",
    color: "#0A2540",
  },
  {
    id: "p13",
    name: "Angela Foster",
    initials: "AF",
    role: "Safety Manager",
    avail: "free",
    color: "#6D28D9",
  },
  {
    id: "p14",
    name: "Brian Lee",
    initials: "BL",
    role: "QA/QC Manager",
    avail: "busy",
    color: "#D97706",
  },
  {
    id: "p15",
    name: "Rachel Green",
    initials: "RG",
    role: "Scheduler",
    avail: "free",
    color: "#059669",
  },
];

const ROLE_ASSIGNMENTS = [
  {
    role: "Project Manager",
    sub: "Overall coordination & owner liaison",
    ids: ["p1"],
  },
  { role: "Lead FSE", sub: "Field superintendent", ids: ["p3"] },
  {
    role: "Cx Engineers",
    sub: "Testing & commissioning team",
    ids: ["p5", "p12"],
  },
  { role: "FSEs", sub: "Field service engineers", ids: ["p4", "p11"] },
  {
    role: "Safety Manager",
    sub: "OSHA compliance & incident reporting",
    ids: ["p13"],
  },
  { role: "QA/QC Manager", sub: "Quality & punch list", ids: ["p14"] },
  { role: "Scheduler", sub: "Schedule management & look-ahead", ids: [] },
  { role: "App Engineer", sub: "Applications & controls", ids: ["p7"] },
];

const EQUIPMENT_SCOPE = [
  {
    id: "ups",
    name: "UPS Systems",
    sub: "Uninterruptible power supplies",
    scope: "SUPPLY+CX",
  },
  {
    id: "batt",
    name: "Battery Systems",
    sub: "VRLA / Li-ion battery strings",
    scope: "SUPPLY+CX",
  },
  {
    id: "gen",
    name: "Generators",
    sub: "Diesel standby generators",
    scope: "SUPPLY+CX",
  },
  {
    id: "pdu",
    name: "PDUs",
    sub: "Power distribution units",
    scope: "SUPPLY+CX",
  },
  {
    id: "ats",
    name: "Transfer Switches",
    sub: "Static / mechanical ATS",
    scope: "SUPPLY+CX",
  },
  {
    id: "chlr",
    name: "Chillers",
    sub: "Centrifugal / screw chillers",
    scope: "CX ONLY",
  },
  {
    id: "crah",
    name: "CRAC/CRAH",
    sub: "Computer room air handlers",
    scope: "CX ONLY",
  },
  {
    id: "facp",
    name: "Fire Alarm",
    sub: "FACP, smoke, pull stations",
    scope: "CX ONLY",
  },
  {
    id: "acs",
    name: "Access Control",
    sub: "Card readers, cameras",
    scope: "CX ONLY",
  },
  {
    id: "bms",
    name: "BMS",
    sub: "Building management system",
    scope: "SUPPLY",
  },
  {
    id: "swg",
    name: "Switchgear",
    sub: "MV/LV switchgear, breakers",
    scope: "SUPPLY",
  },
];

const WORKFLOWS = [
  {
    id: "wf1",
    cat: "Field",
    name: "Daily Field Report",
    desc: "Auto-collects FSE daily entries → PM review → owner digest",
    steps: ["FSE submits", "Lead reviews", "PM approves", "Owner digest"],
  },
  {
    id: "wf2",
    cat: "Field",
    name: "Deficiency Tag",
    desc: "Issue identified → tagged → assigned → resolved → re-inspected",
    steps: [
      "Issue created",
      "Tagged",
      "Assigned",
      "Remediated",
      "Re-inspected",
      "Closed",
    ],
  },
  {
    id: "wf3",
    cat: "Field",
    name: "Pre-Task Plan (PTP)",
    desc: "Daily safety job plan completed before work begins",
    steps: ["Supervisor creates", "Crew sign-off", "Safety logs", "Archived"],
  },
  {
    id: "wf4",
    cat: "Cx",
    name: "Cx Test Record",
    desc: "Test procedure → results → SUPPLY signature → final report",
    steps: [
      "Procedure selected",
      "Results entered",
      "Witness signs",
      "Report generated",
    ],
  },
  {
    id: "wf5",
    cat: "Cx",
    name: "Equipment Pre-Check",
    desc: "Equipment checklist before energization sequence",
    steps: [
      "Checklist opened",
      "Items verified",
      "Signed off",
      "Cleared to energize",
    ],
  },
  {
    id: "wf6",
    cat: "Cx",
    name: "Punchlist Item",
    desc: "Create → assign contractor → fix → Cx verify → close",
    steps: [
      "Item created",
      "Contractor assigned",
      "Fixed",
      "Cx verified",
      "Closed",
    ],
  },
  {
    id: "wf7",
    cat: "Documents",
    name: "RFI Process",
    desc: "Question raised → ball-in-court tracking → answer logged",
    steps: ["RFI created", "Routed", "Ball-in-court", "Answered", "Logged"],
  },
  {
    id: "wf8",
    cat: "Documents",
    name: "Submittal Review",
    desc: "Submit → GC review → A/E review → approved/rejected",
    steps: ["Submitted", "GC review", "A/E review", "Disposition", "Filed"],
  },
  {
    id: "wf9",
    cat: "Documents",
    name: "Change Order Request",
    desc: "Scope change identified → estimated → negotiated → executed",
    steps: ["Scope ID'd", "Estimated", "Submitted", "Negotiated", "Executed"],
  },
  {
    id: "wf10",
    cat: "Safety",
    name: "Incident Report",
    desc: "Incident occurs → immediate report → investigation → OSHA log",
    steps: [
      "Report filed",
      "Scene documented",
      "Investigated",
      "OSHA filed",
      "Closed",
    ],
  },
  {
    id: "wf11",
    cat: "Safety",
    name: "Near Miss",
    desc: "Near miss logged → root cause → corrective action",
    steps: ["Logged", "Root cause", "Corrective action", "Closed"],
  },
  {
    id: "wf12",
    cat: "Safety",
    name: "Hot Work Permit",
    desc: "Permit requested → fire watch assigned → work window → clear",
    steps: [
      "Requested",
      "Fire watch set",
      "Work begins",
      "Work ends",
      "Area cleared",
    ],
  },
  {
    id: "wf13",
    cat: "Approvals",
    name: "Energization Approval",
    desc: "Request to energize → safety check → PM approval → executed",
    steps: [
      "Request",
      "Safety verified",
      "PM signs",
      "Owner notified",
      "Energized",
    ],
  },
  {
    id: "wf14",
    cat: "Approvals",
    name: "Scope Deviation",
    desc: "Field finds scope gap → PM reviews → owner notified → resolved",
    steps: ["Deviation noted", "PM reviews", "Owner notified", "Resolved"],
  },
  {
    id: "wf15",
    cat: "Approvals",
    name: "Material Substitution",
    desc: "Alt material proposed → Cx reviews → A/E approves → executed",
    steps: ["Proposed", "Cx reviews", "A/E approves", "Executed"],
  },
  {
    id: "wf16",
    cat: "Procurement",
    name: "Material Request",
    desc: "Field request → PM approves → PO generated → delivery tracked",
    steps: [
      "Field request",
      "PM approves",
      "PO created",
      "Shipped",
      "Received",
    ],
  },
  {
    id: "wf17",
    cat: "Procurement",
    name: "Tool Check-Out",
    desc: "Tool requested → checked out → tracked → returned → logged",
    steps: ["Requested", "Checked out", "In use", "Returned", "Logged"],
  },
  {
    id: "wf18",
    cat: "Closeout",
    name: "System Turnover",
    desc: "System ready → owner training → docs delivered → accepted",
    steps: ["Systems ready", "Owner trained", "Docs delivered", "Accepted"],
  },
  {
    id: "wf19",
    cat: "Closeout",
    name: "Final Walkthrough",
    desc: "Schedule walk → open items documented → resolved → signed off",
    steps: ["Walk scheduled", "Items logged", "Resolved", "Signed off"],
  },
  {
    id: "wf20",
    cat: "Closeout",
    name: "Warranty Registration",
    desc: "Serial numbers collected → warranties filed → owner packet",
    steps: ["Serials collected", "Filed", "Owner packet", "Done"],
  },
  {
    id: "wf21",
    cat: "Reporting",
    name: "Weekly Status Report",
    desc: "Auto-compiled from field data → PM review → distributed",
    steps: ["Auto-compiled", "PM reviews", "Distributed", "Archived"],
  },
];

const WF_CATS = [
  "Field",
  "Cx",
  "Documents",
  "Safety",
  "Approvals",
  "Procurement",
  "Closeout",
  "Reporting",
];

const SOPS = [
  // ── UPS (7) ────────────────────────────────────────────────
  {
    id: "ups1",
    cat: "UPS",
    name: "UPS Pre-Start Checklist",
    steps: 18,
    desc: "Complete UPS pre-energization verification",
    def: true,
  },
  {
    id: "ups2",
    cat: "UPS",
    name: "UPS Functional Test",
    steps: 12,
    desc: "Static bypass, bypass transfer, alarm verification",
    def: true,
  },
  {
    id: "ups3",
    cat: "UPS",
    name: "UPS Load Bank Test (25/50/75/100%)",
    steps: 14,
    desc: "Staged load test with governor & AVR tuning",
    def: true,
  },
  {
    id: "ups4",
    cat: "UPS",
    name: "UPS Bypass Procedure",
    steps: 6,
    desc: "Safe transfer to static or maintenance bypass",
    def: true,
  },
  {
    id: "ups5",
    cat: "UPS",
    name: "UPS Paralleling Test",
    steps: 10,
    desc: "Multi-module synchronizing and load sharing",
    def: true,
  },
  {
    id: "ups6",
    cat: "UPS",
    name: "UPS Alarm & Event Log Review",
    steps: 5,
    desc: "Review fault history, calibration, setpoint check",
    def: true,
  },
  {
    id: "ups7",
    cat: "UPS",
    name: "UPS Maintenance Bypass Isolation",
    steps: 8,
    desc: "Full isolation for in-service maintenance",
    def: true,
  },
  // ── BATTERY (6) ────────────────────────────────────────────
  {
    id: "bat1",
    cat: "BATTERY",
    name: "Battery Pre-Installation Inspection",
    steps: 9,
    desc: "Visual, labeling, rack and cable check",
    def: true,
  },
  {
    id: "bat2",
    cat: "BATTERY",
    name: "Battery String Installation Checklist",
    steps: 11,
    desc: "Torque, polarity, string continuity verification",
    def: true,
  },
  {
    id: "bat3",
    cat: "BATTERY",
    name: "Battery Conductance / Impedance Test",
    steps: 8,
    desc: "Per-cell and per-string conductance baseline",
    def: true,
  },
  {
    id: "bat4",
    cat: "BATTERY",
    name: "Battery Capacity (Discharge) Test",
    steps: 12,
    desc: "Full discharge to rated Ah at C/10 rate",
    def: true,
  },
  {
    id: "bat5",
    cat: "BATTERY",
    name: "Battery Float Voltage Verification",
    steps: 6,
    desc: "Float voltage, temperature compensation check",
    def: true,
  },
  {
    id: "bat6",
    cat: "BATTERY",
    name: "Battery Room Safety Checklist",
    steps: 7,
    desc: "Ventilation, spill kit, eyewash, PPE station",
    def: true,
  },
  // ── GENERATOR (6) ──────────────────────────────────────────
  {
    id: "gen1",
    cat: "GENERATOR",
    name: "Generator Pre-Start Checklist",
    steps: 14,
    desc: "Fuel, coolant, oil, battery, controls verification",
    def: true,
  },
  {
    id: "gen2",
    cat: "GENERATOR",
    name: "Generator Load Test (Staged)",
    steps: 12,
    desc: "25/50/75/100% load with governor & AVR tuning",
    def: true,
  },
  {
    id: "gen3",
    cat: "GENERATOR",
    name: "ATS Transfer Test",
    steps: 10,
    desc: "Normal-to-emergency and retransfer verification",
    def: true,
  },
  {
    id: "gen4",
    cat: "GENERATOR",
    name: "Generator Paralleling & Load Share",
    steps: 13,
    desc: "Multi-gen synchronizing, droop, load share",
    def: true,
  },
  {
    id: "gen5",
    cat: "GENERATOR",
    name: "Generator Weekly Exercise Log",
    steps: 5,
    desc: "No-load and loaded weekly exercise record",
    def: true,
  },
  {
    id: "gen6",
    cat: "GENERATOR",
    name: "Generator Fuel System Inspection",
    steps: 8,
    desc: "Day tank, main tank, fill, leak, spill containment",
    def: true,
  },
  // ── SWITCHGEAR (6, default 5) ──────────────────────────────
  {
    id: "swg1",
    cat: "SWITCHGEAR",
    name: "Switchgear Visual Inspection",
    steps: 8,
    desc: "Bus, breaker, lugs, labeling, arc flash rating check",
    def: true,
  },
  {
    id: "swg2",
    cat: "SWITCHGEAR",
    name: "Switchgear Insulation Resistance Test",
    steps: 10,
    desc: "Megger per bus section and feeder",
    def: true,
  },
  {
    id: "swg3",
    cat: "SWITCHGEAR",
    name: "Switchgear Breaker Trip Test",
    steps: 9,
    desc: "Primary injection, trip curve, instantaneous test",
    def: true,
  },
  {
    id: "swg4",
    cat: "SWITCHGEAR",
    name: "Switchgear Arc Flash Label Verify",
    steps: 6,
    desc: "Label currency, incident energy, PPE category",
    def: true,
  },
  {
    id: "swg5",
    cat: "SWITCHGEAR",
    name: "Switchgear Functional Test",
    steps: 11,
    desc: "Racking, interlock, control power, alarm test",
    def: true,
  },
  {
    id: "swg6",
    cat: "SWITCHGEAR",
    name: "HV/MV Cable Hi-Pot Test",
    steps: 8,
    desc: "DC hi-pot with leakage current measurement",
    def: false,
  },
  // ── DISTRIBUTION (7, default 5) ────────────────────────────
  {
    id: "dis1",
    cat: "DISTRIBUTION",
    name: "PDU Pre-Start Checklist",
    steps: 10,
    desc: "Input/output breakers, metering, alarm calibration",
    def: true,
  },
  {
    id: "dis2",
    cat: "DISTRIBUTION",
    name: "ATS Transfer Test (Static)",
    steps: 9,
    desc: "Static ATS transfer time and retransfer test",
    def: true,
  },
  {
    id: "dis3",
    cat: "DISTRIBUTION",
    name: "ATS Transfer Test (Mechanical)",
    steps: 9,
    desc: "Open-transition and closed-transition test",
    def: true,
  },
  {
    id: "dis4",
    cat: "DISTRIBUTION",
    name: "Busway / Busduct Inspection",
    steps: 7,
    desc: "Joint torque, phase sequence, insulation check",
    def: true,
  },
  {
    id: "dis5",
    cat: "DISTRIBUTION",
    name: "Distribution Board Functional Test",
    steps: 8,
    desc: "Breaker trip, metering, alarm, labeling",
    def: true,
  },
  {
    id: "dis6",
    cat: "DISTRIBUTION",
    name: "RPP / Sub-panel Inspection",
    steps: 6,
    desc: "Breaker sizing, torque, branch circuit labeling",
    def: false,
  },
  {
    id: "dis7",
    cat: "DISTRIBUTION",
    name: "Metering & Power Quality Calibration",
    steps: 7,
    desc: "CT/PT ratio, THD baseline, PF correction verify",
    def: false,
  },
  // ── COOLING (10, default 9) ─────────────────────────────────
  {
    id: "col1",
    cat: "COOLING",
    name: "Chiller Pre-Start Checklist",
    steps: 14,
    desc: "Refrigerant, oil, controls, starter pre-start check",
    def: true,
  },
  {
    id: "col2",
    cat: "COOLING",
    name: "Chiller Functional Test",
    steps: 10,
    desc: "Capacity test, setpoint, alarm, trip verification",
    def: true,
  },
  {
    id: "col3",
    cat: "COOLING",
    name: "Cooling Tower Inspection",
    steps: 8,
    desc: "Basin, fill, drift eliminators, fan and motor check",
    def: true,
  },
  {
    id: "col4",
    cat: "COOLING",
    name: "CRAC/CRAH Pre-Start Checklist",
    steps: 9,
    desc: "Fan belt/EC fan, coil, drain pan, controls check",
    def: true,
  },
  {
    id: "col5",
    cat: "COOLING",
    name: "CRAC/CRAH Functional Test",
    steps: 9,
    desc: "Airflow, temp, humidity setpoint and alarm test",
    def: true,
  },
  {
    id: "col6",
    cat: "COOLING",
    name: "Piping Pressure Test",
    steps: 7,
    desc: "Hydronic system static and dynamic pressure test",
    def: true,
  },
  {
    id: "col7",
    cat: "COOLING",
    name: "Glycol / Coolant System Flush",
    steps: 8,
    desc: "System flush, chemical treatment and refill",
    def: true,
  },
  {
    id: "col8",
    cat: "COOLING",
    name: "Hot/Cold Aisle Containment Check",
    steps: 6,
    desc: "Blanking panels, brush strips, bypass airflow audit",
    def: true,
  },
  {
    id: "col9",
    cat: "COOLING",
    name: "Airflow Management Audit",
    steps: 7,
    desc: "CFD baseline vs. actual, hotspot survey",
    def: true,
  },
  {
    id: "col10",
    cat: "COOLING",
    name: "Cooling System Integrated Test",
    steps: 11,
    desc: "Full load scenario with all cooling paths active",
    def: false,
  },
  // ── FIRE/LIFE (6, default 5) ────────────────────────────────
  {
    id: "fls1",
    cat: "FIRE/LIFE",
    name: "Fire Alarm Panel (FACP) Functional Test",
    steps: 12,
    desc: "Point test, alarm zones, notification appliances",
    def: true,
  },
  {
    id: "fls2",
    cat: "FIRE/LIFE",
    name: "Smoke Detector Point Test",
    steps: 8,
    desc: "Analog addressable smoke detector sensitivity test",
    def: true,
  },
  {
    id: "fls3",
    cat: "FIRE/LIFE",
    name: "Sprinkler System Visual Inspection",
    steps: 6,
    desc: "Heads, hangers, gauges, control valve position",
    def: true,
  },
  {
    id: "fls4",
    cat: "FIRE/LIFE",
    name: "Clean Agent Pre-Discharge Check",
    steps: 9,
    desc: "Cylinder weight, abort switch, door seals, signage",
    def: true,
  },
  {
    id: "fls5",
    cat: "FIRE/LIFE",
    name: "Emergency Lighting & Exit Sign Test",
    steps: 5,
    desc: "90-min discharge test, illumination level check",
    def: true,
  },
  {
    id: "fls6",
    cat: "FIRE/LIFE",
    name: "Suppression System Discharge Test",
    steps: 10,
    desc: "Full agent release test (authority approval required)",
    def: false,
  },
  // ── CONTROLS (6) ───────────────────────────────────────────
  {
    id: "ctl1",
    cat: "CONTROLS",
    name: "BMS/BAS Points List Verification",
    steps: 12,
    desc: "Every I/O point mapped, scaled, and alarmed",
    def: true,
  },
  {
    id: "ctl2",
    cat: "CONTROLS",
    name: "BMS Functional Test – HVAC",
    steps: 10,
    desc: "Sequence of operations, setpoints, PID tuning",
    def: true,
  },
  {
    id: "ctl3",
    cat: "CONTROLS",
    name: "BMS Functional Test – Power",
    steps: 10,
    desc: "Metering, transfer sequences, load shed logic",
    def: true,
  },
  {
    id: "ctl4",
    cat: "CONTROLS",
    name: "DCIM Integration Check",
    steps: 8,
    desc: "Asset import, sensor mapping, dashboard validation",
    def: true,
  },
  {
    id: "ctl5",
    cat: "CONTROLS",
    name: "Controls Network Topology Verify",
    steps: 6,
    desc: "IP addressing, VLAN, firewall rules, latency test",
    def: true,
  },
  {
    id: "ctl6",
    cat: "CONTROLS",
    name: "Alarm & Notification Test",
    steps: 7,
    desc: "Critical, major, minor alarms — email/SMS/SNMP",
    def: true,
  },
  // ── SECURITY (2, default 0) ────────────────────────────────
  {
    id: "sec1",
    cat: "SECURITY",
    name: "Access Control System Test",
    steps: 8,
    desc: "Card reader, door contact, REX, lockdown test",
    def: false,
  },
  {
    id: "sec2",
    cat: "SECURITY",
    name: "CCTV / Camera System Verification",
    steps: 6,
    desc: "Coverage, recording, retention, NVR health check",
    def: false,
  },
  // ── IST (3) ────────────────────────────────────────────────
  {
    id: "ist1",
    cat: "IST",
    name: "IST Scenario 1 – Loss of Utility Power",
    steps: 15,
    desc: "Full UPS/gen transfer, retransfer, autonomy test",
    def: true,
  },
  {
    id: "ist2",
    cat: "IST",
    name: "IST Scenario 2 – Cooling Failure",
    steps: 12,
    desc: "Cooling redundancy failover and recovery scenario",
    def: true,
  },
  {
    id: "ist3",
    cat: "IST",
    name: "IST Scenario 3 – Full Blackout",
    steps: 14,
    desc: "Site blackout, black-start, full load restoration",
    def: true,
  },
  // ── OPERATIONS (3) ────────────────────────────────────────
  {
    id: "ops1",
    cat: "OPERATIONS",
    name: "Owner Operator Training Checklist",
    steps: 10,
    desc: "System overviews, normal ops, emergency procedures",
    def: true,
  },
  {
    id: "ops2",
    cat: "OPERATIONS",
    name: "O&M Documentation Handover",
    steps: 8,
    desc: "Manuals, as-builts, warranties, spare parts list",
    def: true,
  },
  {
    id: "ops3",
    cat: "OPERATIONS",
    name: "Spare Parts & Attic Stock Verify",
    steps: 6,
    desc: "Confirm critical spares received per contract",
    def: true,
  },
  // ── SAFETY (5, default 4) ──────────────────────────────────
  {
    id: "saf1",
    cat: "SAFETY",
    name: "Site Safety Orientation Checklist",
    steps: 8,
    desc: "Hazard briefing, emergency egress, PPE issuance",
    def: true,
  },
  {
    id: "saf2",
    cat: "SAFETY",
    name: "LOTO Procedure Verification",
    steps: 12,
    desc: "Lockout/tagout control of hazardous energy",
    def: true,
  },
  {
    id: "saf3",
    cat: "SAFETY",
    name: "Arc Flash Boundary & PPE Verify",
    steps: 9,
    desc: "Boundary marking, incident energy, PPE selection",
    def: true,
  },
  {
    id: "saf4",
    cat: "SAFETY",
    name: "Hot Work Permit Procedure",
    steps: 7,
    desc: "Permit issuance, fire watch, post-work inspection",
    def: true,
  },
  {
    id: "saf5",
    cat: "SAFETY",
    name: "Confined Space Entry Procedure",
    steps: 10,
    desc: "Atmospheric test, rescue plan, attendant duties",
    def: false,
  },
  // ── WARRANTY (3) ───────────────────────────────────────────
  {
    id: "war1",
    cat: "WARRANTY",
    name: "Equipment S/N & Warranty Registration",
    steps: 7,
    desc: "Capture serials, register all equipment warranties",
    def: true,
  },
  {
    id: "war2",
    cat: "WARRANTY",
    name: "Warranty Start Date Documentation",
    steps: 5,
    desc: "Confirm and record owner-accepted warranty dates",
    def: true,
  },
  {
    id: "war3",
    cat: "WARRANTY",
    name: "30-Day Warranty Walkthrough",
    steps: 9,
    desc: "Scheduled walkthrough at 30 days post-turnover",
    def: true,
  },
];

const SOP_CATS = [
  "UPS",
  "BATTERY",
  "GENERATOR",
  "SWITCHGEAR",
  "DISTRIBUTION",
  "COOLING",
  "FIRE/LIFE",
  "CONTROLS",
  "SECURITY",
  "IST",
  "OPERATIONS",
  "SAFETY",
  "WARRANTY",
];


const SITES_LIST = [
  {
    id: "site1",
    name: "Atlanta DC3 – Main Data Hall",
    addr: "1234 Peachtree Rd, Atlanta, GA 30309",
    type: "primary",
  },
  {
    id: "site2",
    name: "Atlanta DC3 – Generator Yard",
    addr: "1234 Peachtree Rd (rear), Atlanta, GA",
    type: "ancillary",
  },
  {
    id: "site3",
    name: "Staging Warehouse",
    addr: "500 Industrial Blvd, Norcross, GA",
    type: "staging",
  },
];

const COMPANY_TYPES = [
  "CLIENT",
  "SUBCONTRACTOR",
  "VENDOR",
  "PARTNER",
  "CONSULTANT",
  "OTHER",
];

const ASSET_TAG_SCHEMES = [
  { id: "eq", label: "EQ-####", desc: "Equipment sequential" },
  { id: "sys", label: "SYS-TYPE-##", desc: "System + type code" },
  { id: "area", label: "AREA-##-##", desc: "Area + number" },
  { id: "cust", label: "Custom", desc: "Define your own format" },
];

const PERMITS = [
  {
    id: "bp",
    name: "Building Permit",
    jurisdiction: "City of Atlanta",
    required: true,
  },
  {
    id: "ep",
    name: "Electrical Permit",
    jurisdiction: "GA State",
    required: true,
  },
  {
    id: "fp",
    name: "Fire Alarm Permit",
    jurisdiction: "Atlanta Fire Dept",
    required: true,
  },
  {
    id: "gp",
    name: "Generator / Fuel Tank Permit",
    jurisdiction: "GA EPD",
    required: true,
  },
  {
    id: "hp",
    name: "HAZMAT Permit (Battery rooms)",
    jurisdiction: "EPA Region 4",
    required: false,
  },
  {
    id: "pp",
    name: "Plumbing Permit",
    jurisdiction: "City of Atlanta",
    required: false,
  },
];

const SAFETY_REQS = [
  { id: "sr1", name: "OSHA 30-hour", cat: "Certification", required: true },
  { id: "sr2", name: "OSHA 10-hour", cat: "Certification", required: true },
  {
    id: "sr3",
    name: "NFPA 70E Arc Flash",
    cat: "Certification",
    required: true,
  },
  { id: "sr4", name: "First Aid / CPR", cat: "Certification", required: false },
  {
    id: "sr5",
    name: "Confined Space Entry",
    cat: "Certification",
    required: false,
  },
  {
    id: "sr6",
    name: "Rigging & Signaling",
    cat: "Certification",
    required: false,
  },
  { id: "sr7", name: "Hard hat", cat: "PPE", required: true },
  { id: "sr8", name: "Safety glasses", cat: "PPE", required: true },
  { id: "sr9", name: "Hi-vis vest", cat: "PPE", required: true },
  { id: "sr10", name: "Steel-toe boots", cat: "PPE", required: true },
  { id: "sr11", name: "Arc flash kit (Cal 8)", cat: "PPE", required: false },
  { id: "sr12", name: "Fall arrest harness", cat: "PPE", required: false },
];

const ACCESS_OPTIONS = [
  {
    id: "ac1",
    name: "Escort required",
    desc: "All visitors must be escorted at all times",
  },
  {
    id: "ac2",
    name: "Badged access only",
    desc: "Credential badge required for all areas",
  },
  {
    id: "ac3",
    name: "Biometric",
    desc: "Fingerprint or retinal scan at secure doors",
  },
  {
    id: "ac4",
    name: "Mantraps",
    desc: "Double-door airlock at critical zone entry",
  },
  {
    id: "ac5",
    name: "Background check required",
    desc: "Criminal background check before site access",
  },
  {
    id: "ac6",
    name: "NDA required",
    desc: "Non-disclosure agreement before entry",
  },
];

const QUALITY_STANDARDS = [
  { id: "qs1", name: "ASHRAE 90.4-2019", cat: "Energy", required: true },
  { id: "qs2", name: "Uptime Tier III", cat: "Tier", required: true },
  { id: "qs3", name: "ISO 9001:2015", cat: "Quality Sys", required: false },
  { id: "qs4", name: "NFPA 70 (NEC)", cat: "Electrical", required: true },
  { id: "qs5", name: "NFPA 110", cat: "Emergency", required: true },
  { id: "qs6", name: "BICSI 002", cat: "Cabling", required: false },
  { id: "qs7", name: "TIA-942-B", cat: "Data Center", required: false },
  { id: "qs8", name: "LEED Silver", cat: "Green", required: false },
];

const RISKS = [
  {
    id: "r1",
    cat: "Schedule",
    name: "Long-lead equipment delay",
    prob: "med",
    impact: "high",
  },
  {
    id: "r2",
    cat: "Schedule",
    name: "GC critical path conflict",
    prob: "med",
    impact: "high",
  },
  {
    id: "r3",
    cat: "Safety",
    name: "Arc flash incident",
    prob: "low",
    impact: "high",
  },
  {
    id: "r4",
    cat: "Safety",
    name: "Crane/rigging accident",
    prob: "low",
    impact: "high",
  },
  {
    id: "r5",
    cat: "Technical",
    name: "Scope creep / design change",
    prob: "high",
    impact: "med",
  },
  {
    id: "r6",
    cat: "Technical",
    name: "BMS integration complexity",
    prob: "med",
    impact: "med",
  },
  {
    id: "r7",
    cat: "Financial",
    name: "Material price escalation",
    prob: "med",
    impact: "med",
  },
  {
    id: "r8",
    cat: "Financial",
    name: "Weather / force majeure delay",
    prob: "low",
    impact: "med",
  },
];

const DOC_CATEGORIES = [
  {
    id: "dc1",
    name: "Design Drawings",
    items: [
      "Architectural",
      "Structural",
      "Electrical",
      "Mechanical",
      "Plumbing",
      "Civil",
    ],
  },
  {
    id: "dc2",
    name: "Submittals",
    items: [
      "UPS submittal",
      "Generator submittal",
      "Battery submittal",
      "Chiller submittal",
    ],
  },
  {
    id: "dc3",
    name: "Specifications",
    items: ["Project specs book", "Equipment specs"],
  },
  {
    id: "dc4",
    name: "Contracts",
    items: ["Prime contract", "Subcontracts", "Owner-direct"],
  },
  {
    id: "dc5",
    name: "Cx Documentation",
    items: ["Cx plan", "Test procedures", "ITAF plan", "Final report"],
  },
];

const COST_CODES = [
  { id: "cc01", code: "01-1000", name: "Project Management", budget: 320000 },
  { id: "cc02", code: "16-2000", name: "Electrical Labor", budget: 840000 },
  {
    id: "cc03",
    code: "16-5000",
    name: "UPS & Battery Systems",
    budget: 2200000,
  },
  { id: "cc04", code: "16-6000", name: "Generators", budget: 1800000 },
  { id: "cc05", code: "23-1000", name: "Mechanical / Cooling", budget: 650000 },
  { id: "cc06", code: "01-5100", name: "Safety & Compliance", budget: 95000 },
  { id: "cc07", code: "01-4000", name: "Commissioning", budget: 410000 },
  { id: "cc08", code: "01-9000", name: "Contingency (10%)", budget: 631500 },
];

const COMMS_CHANNELS = [
  {
    id: "ch1",
    name: "#project-general",
    desc: "All-hands channel",
    letter: "G",
  },
  { id: "ch2", name: "#pm-leadership", desc: "PM + leads only", letter: "P" },
  {
    id: "ch3",
    name: "#field-ops",
    desc: "FSEs + foremen, on-site coordination",
    letter: "F",
  },
  { id: "ch4", name: "#qa-qc", desc: "Quality & commissioning", letter: "Q" },
  {
    id: "ch5",
    name: "#safety",
    desc: "Safety manager + officers",
    letter: "S",
  },
  {
    id: "ch6",
    name: "#rfi-tracker",
    desc: "RFI questions & answers",
    letter: "R",
  },
  {
    id: "ch7",
    name: "#submittals",
    desc: "Submittal package reviews",
    letter: "B",
  },
];

const REPORTING_ITEMS = [
  {
    id: "ri1",
    name: "Daily Field Report",
    freq: "Daily",
    owner: "Lead FSE",
    auto: true,
  },
  {
    id: "ri2",
    name: "Weekly Status Report",
    freq: "Weekly",
    owner: "PM",
    auto: true,
  },
  {
    id: "ri3",
    name: "Safety Incident Log",
    freq: "Incident",
    owner: "Safety Mgr",
    auto: false,
  },
  {
    id: "ri4",
    name: "Cx Progress Tracker",
    freq: "Weekly",
    owner: "Cx Lead",
    auto: true,
  },
  {
    id: "ri5",
    name: "Schedule Look-Ahead",
    freq: "Weekly",
    owner: "PM",
    auto: false,
  },
  {
    id: "ri6",
    name: "Owner Executive Summary",
    freq: "Monthly",
    owner: "PM",
    auto: false,
  },
  {
    id: "ri7",
    name: "Budget Burn Report",
    freq: "Monthly",
    owner: "PM",
    auto: true,
  },
  {
    id: "ri8",
    name: "Punch List Status",
    freq: "Weekly",
    owner: "QA/QC",
    auto: false,
  },
];

const TRAINING_REQS = [
  { id: "tr1", name: "Site Orientation", cat: "Onboarding", required: true },
  {
    id: "tr2",
    name: "Emergency Procedures",
    cat: "Onboarding",
    required: true,
  },
  { id: "tr3", name: "LOTO Training", cat: "Electrical", required: true },
  { id: "tr4", name: "Arc Flash Awareness", cat: "Electrical", required: true },
  { id: "tr5", name: "Ladder Safety", cat: "Falls", required: true },
  { id: "tr6", name: "Rigging Basics", cat: "Rigging", required: false },
  { id: "tr7", name: "Hot Work Permit Training", cat: "Fire", required: false },
  { id: "tr8", name: "Confined Space Entry", cat: "Confined", required: false },
  {
    id: "tr9",
    name: "Heat Stress Prevention",
    cat: "Environment",
    required: false,
  },
  {
    id: "tr10",
    name: "Battery Handling & Acid",
    cat: "Chemical",
    required: true,
  },
  {
    id: "tr11",
    name: "Incident Reporting Culture",
    cat: "Safety Mgmt",
    required: true,
  },
  {
    id: "tr12",
    name: "Owner Operator Training",
    cat: "Closeout",
    required: false,
  },
];

// ─── DEFAULT STATE ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "cxcontrol_project_wizard_v4";

function buildDefaultState() {
  const wfSel = {};
  const sopSel = {};
  const scopeSel = {};
  EQUIPMENT_SCOPE.forEach((e) => {
    scopeSel[e.id] = e.scope !== "CX ONLY";
  });
  const scopeHours = {};
  EQUIPMENT_SCOPE.forEach((e) => {
    scopeHours[e.id] =
      e.scope === "SUPPLY+CX" ? 80 : e.scope === "SUPPLY" ? 16 : 0;
  });
  const permitSel = {};
  PERMITS.forEach((p) => {
    permitSel[p.id] = p.required;
  });
  const safetySel = {};
  const accessSel = {};
  ACCESS_OPTIONS.forEach((a) => {
    accessSel[a.id] = ["ac1", "ac2", "ac5"].includes(a.id);
  });
  const qualitySel = {};
  QUALITY_STANDARDS.forEach((q) => {
    qualitySel[q.id] = q.required;
  });
  const riskSel = {};
  RISKS.forEach((r) => {
    riskSel[r.id] = true;
  });
  const docSel = {};
  DOC_CATEGORIES.forEach((d) => {
    docSel[d.id] = true;
  });
  const commsSel = {};
  COMMS_CHANNELS.forEach((c) => {
    commsSel[c.id] = ["ch1", "ch2", "ch3"].includes(c.id);
  });
  const reportSel = {};
  REPORTING_ITEMS.forEach((r) => {
    reportSel[r.id] = r.auto;
  });
  const trainingSel = {};
  const custSel = {};
  const siteSel = {};
  SITES_LIST.forEach((s) => {
    siteSel[s.id] = s.type === "primary";
  });
  const partnerSel = {};

  return {
    step: 0,
    startMode: "",
    projectNature: "new_build",
    projectName: "Delta DC3 Atlanta — Phase 2 Data Hall Cx",
    customer: "",
    customerId: "",
    contractNumber: "QTS-2026-DC3-002",
    siteAddress: "1234 Peachtree Rd NE, Atlanta, GA 30309",
    startDate: "2026-07-01",
    endDate: "2026-12-15",
    projectType: "cx_full",
    description:
      "Full commissioning (Levels 1–5) for the Phase 2 expansion of QTS Atlanta Metro data center. Scope includes UPS, battery, generator, ATS, and PDU systems across 2 new data halls.",
    contractValue: "6500000",
    phases: STANDARD_PHASES.map((p) => ({ ...p, start: "", end: "" })),
    assignments: Object.fromEntries(
      ROLE_ASSIGNMENTS.map((r) => [r.role, [...r.ids]]),
    ),
    scopeSel,
    scopeHours,
    tagScheme: "eq",
    customTagFormat: "",
    assetSel: {},
    permitSel,
    safetySel,
    accessSel,
    qualitySel,
    riskSel,
    docSel,
    costCodes: COST_CODES.map((c) => ({ ...c })),
    commsSel,
    reportSel,
    trainingSel,
    custSel,
    siteSel,
    partnerSel,
    partnerInvites: {},
    workflows: wfSel,
    sops: sopSel,
    safetyPlanId: null,
    skipped: {},
    planningMode: true,
    selectedTeams: {},
    teamMemberSel: {},
    mobSel: {
      mob_site: {},
      mob_ppe: {},
      mob_supplies: {},
      mob_trailer: {},
      mob_house: {},
      mob_tools: {},
    },
    toolboxSchedule: [],
    retainage: 5,
  };
}

const DEFAULT_STATE = buildDefaultState();

// Wizard project-type → API projectType enum
const PROJECT_TYPE_MAP = {
  cx_full: "DATA_CENTER",
  cx_partial: "DATA_CENTER",
  retro_cx: "DATA_CENTER",
  pmo: "CONSTRUCTION",
  startup: "INFRA",
  service: "INFRA",
};

const ASSET_TYPE_MAP = {
  ups: "Power",
  batt: "Power",
  gen: "Power",
  pdu: "Power",
  ats: "Power",
  chlr: "Cooling",
  crah: "Cooling",
  facp: "Safety",
  acs: "Safety",
  bms: "BMS",
  swg: "Power",
};

// Returns an array of { step, data } API calls for the given wizard step.
function buildApiCalls(key, s, extras = {}) {
  const {
    orgMobCatalog = {},
    teams = [],
    contactsList = [],
    orgSafetyPlans = [],
    orgPartners = [],
  } = extras;

  switch (key) {
    // ── basics ──────────────────────────────────────────────────────────────
    case "basics":
      return [
        {
          step: "basics",
          data: {
            projectName: s.projectName,
            projectNature: s.projectNature || undefined,
            description: s.description || undefined,
            customer: s.customer || undefined,
            contractNumber: s.contractNumber || undefined,
            siteAddress: s.siteAddress || undefined,
            startDate: s.startDate || undefined,
            endDate: s.endDate || undefined,
            projectType: PROJECT_TYPE_MAP[s.projectType] || "DATA_CENTER",
          },
        },
      ];

    // ── assets (org asset selection + tagging convention) ────────────────────
    case "assets": {
      const selectedAssetIds = Object.entries(s.assetSel || {})
        .filter(([, v]) => v)
        .map(([id]) => id);
      return [
        {
          step: "resources",
          data: {
            assetIds: selectedAssetIds,
            tagScheme: s.tagScheme || "eq",
            customTagFormat:
              s.tagScheme === "cust"
                ? s.customTagFormat || undefined
                : undefined,
          },
        },
      ];
    }

    // ── scope (equipment list with hours) ────────────────────────────────────
    case "scope":
      return [
        {
          step: "assets",
          data: {
            assets: EQUIPMENT_SCOPE.filter((e) => s.scopeSel[e.id]).map(
              (e) => ({
                abbr: e.id.toUpperCase(),
                name: e.name,
                assetType: ASSET_TYPE_MAP[e.id] || "Other",
                quantity: 1,
                procurementOwner: e.scope === "CX ONLY" ? "CFCI" : "OFCI",
                laborHours: s.scopeHours?.[e.id] || 0,
              }),
            ),
          },
        },
      ];

    // ── schedule ─────────────────────────────────────────────────────────────
    case "schedule":
      return [
        {
          step: "schedule",
          data: {
            scheduleSource: "manual",
            phases: s.phases
              .filter((p) => p.start || p.end)
              .map((p) => ({
                name: p.name,
                startDate: p.start || null,
                endDate: p.end || null,
                type: "contractual",
              })),
          },
        },
      ];

    // ── team ─────────────────────────────────────────────────────────────────
    case "team": {
      const teamMemberSel = s.teamMemberSel || {};
      const activeTeamIds = Object.keys(teamMemberSel).filter((teamId) =>
        Object.values(teamMemberSel[teamId] || {}).some(Boolean),
      );

      const teamAssignments = activeTeamIds.map((teamId) => {
        const teamObj = teams.find((t) => String(t.id) === String(teamId));
        const selectedMemberIds = Object.entries(teamMemberSel[teamId] || {})
          .filter(([, v]) => v)
          .map(([id]) => id);
        return {
          teamId,
          teamName: teamObj?.name || teamId,
          memberIds: selectedMemberIds,
        };
      });

      return [
        {
          step: "team",
          data: {
            teams: teamAssignments,
          },
        },
      ];
    }

    // ── customer ─────────────────────────────────────────────────────────────
    case "customer": {
      const customerContacts = contactsList
        .filter((c) => s.custSel?.[c.id])
        .map((c) => ({
          contactId: c.id,
          name: c.fullName || `${c.firstName} ${c.lastName}`.trim(),
          role: c.jobTitle || "Contact",
          tier: "DECISION_MAKER",
        }));

      return [
        {
          step: "stakeholders",
          data: {
            customer: s.customer || undefined,
            customerId: s.customerId || undefined,
            contacts: customerContacts,
          },
        },
      ];
    }

    // ── sites ────────────────────────────────────────────────────────────────
    case "sites":
      return [
        {
          step: "zones",
          data: {
            zones: SITES_LIST.filter((si) => s.siteSel?.[si.id]).map((si) => ({
              name: si.name,
              zoneType: si.type === "primary" ? "CREW" : "PUBLIC",
              accessRequirements: si.addr || undefined,
            })),
          },
        },
      ];

    // ── permits ──────────────────────────────────────────────────────────────
    case "permits":
      return [
        {
          step: "compliance",
          data: {
            compliance: PERMITS.filter((p) => s.permitSel?.[p.id]).map((p) => ({
              recordType: "PERMIT",
              name: p.name,
              issuer: p.jurisdiction,
              status: "VALID",
            })),
          },
        },
      ];

    // ── safety ───────────────────────────────────────────────────────────────
    case "safety": {
      const plan = orgSafetyPlans.find((p) => p.id === s.safetyPlanId);
      return [
        {
          step: "safety",
          data: {
            safetyPlanId: s.safetyPlanId || undefined,
            osha30Required: plan?.osha30Required ?? false,
            osha10Required: plan?.osha10Required ?? true,
            nfpa70eRequirements: plan?.nfpa70eRequired
              ? "Arc flash PPE required in all live-electrical zones"
              : undefined,
            requiredPpe: plan?.requiredPpe || undefined,
            toolboxTalkFrequency: plan?.toolboxTalkFrequency || undefined,
            safetyManagerRole: plan?.safetyManagerRole || undefined,
            emergencyPlan: plan?.emergencyPlan || undefined,
          },
        },
      ];
    }

    // ── quality ──────────────────────────────────────────────────────────────
    case "quality":
      return [
        {
          step: "documentation",
          data: {
            standards: QUALITY_STANDARDS.filter(
              (q) => s.qualitySel?.[q.id],
            ).map((q) => ({
              name: q.name,
              category: q.cat,
              required: q.required,
            })),
          },
        },
      ];

    // ── risk ─────────────────────────────────────────────────────────────────
    case "risk":
      return [
        {
          step: "resources",
          data: {
            risks: RISKS.filter((r) => s.riskSel?.[r.id]).map((r) => ({
              name: r.name,
              category: r.cat,
              probability: r.prob,
              impact: r.impact,
            })),
          },
        },
      ];

    // ── mob checklist steps ──────────────────────────────────────────────────
    case "mob_site":
    case "mob_ppe":
    case "mob_supplies":
    case "mob_trailer":
    case "mob_house":
    case "mob_tools": {
      const catalog = orgMobCatalog[key] || [];
      const sel = s.mobSel?.[key] || {};
      const selectedItems = catalog.filter((item) => sel[item.id]);
      if (selectedItems.length === 0) return [];
      return [
        {
          step: key,
          data: {
            items: selectedItems.map((item) => ({
              name: item.name,
              category: item.category,
              quantity: item.defaultQty || 1,
              unitCost: parseFloat(item.defaultUnitCost || 0),
            })),
          },
        },
      ];
    }

    // ── budget (full cost-code breakdown + financials) ───────────────────────
    case "budget": {
      const ccById = Object.fromEntries(
        (s.costCodes || []).map((c) => [c.id, c]),
      );
      const totalBudget = (s.costCodes || []).reduce(
        (sum, c) => sum + (c.budget || 0),
        0,
      );
      return [
        {
          step: "financials",
          data: {
            contractValue: s.contractValue
              ? parseFloat(s.contractValue)
              : undefined,
            totalBudget,
            paymentTerms: "Net 30",
            progressBilling: true,
            milestoneBilling: false,
            retainage: s.retainage ?? 5,
            laborBudget:
              (ccById["cc02"]?.budget || 0) + (ccById["cc07"]?.budget || 0),
            equipmentBudget:
              (ccById["cc03"]?.budget || 0) +
              (ccById["cc04"]?.budget || 0) +
              (ccById["cc05"]?.budget || 0),
            contingencyBudget: ccById["cc08"]?.budget || 0,
            costCodes: (s.costCodes || []).map((c) => ({
              code: c.code,
              name: c.name,
              budget: c.budget || 0,
            })),
          },
        },
      ];
    }

    // ── comms — communications are created directly via API; nothing to save here
    case "comms":
      return [];

    // ── reporting ────────────────────────────────────────────────────────────
    case "reporting":
      return [
        {
          step: "documentation",
          data: {
            reports: REPORTING_ITEMS.filter((r) => s.reportSel?.[r.id]).map(
              (r) => ({
                name: r.name,
                frequency: r.freq,
                owner: r.owner,
                automated: r.auto,
              }),
            ),
            forecastWindow: "3wk",
          },
        },
      ];

    // ── training (org toolbox talk IDs) ─────────────────────────────────────
    case "training":
      return [
        {
          step: "resources",
          data: {
            toolboxTalkIds: Object.entries(s.trainingSel || {})
              .filter(([, v]) => v)
              .map(([id]) => id),
          },
        },
      ];

    // ── workflows ────────────────────────────────────────────────────────────
    case "workflows":
      return [
        {
          step: "workflows",
          data: {
            workflowIds: Object.entries(s.workflows || {})
              .filter(([, v]) => v)
              .map(([id]) => id),
          },
        },
      ];

    // ── sops ─────────────────────────────────────────────────────────────────
    case "sops":
      return [
        {
          step: "sops",
          data: {
            sopIds: Object.entries(s.sops || {})
              .filter(([, v]) => v)
              .map(([id]) => id),
          },
        },
      ];

    // ── partners (selected + invited) ────────────────────────────────────────
    case "partners":
      return [
        {
          step: "partners",
          data: {
            partners: orgPartners.filter(
              (p) => s.partnerSel?.[p.id],
            ).map((p) => ({
              partnerId: p.id,
              role: p.role ?? undefined,
              scope: p.scope ?? undefined,
            })),
          },
        },
      ];

    default:
      return [];
  }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ProjectWizard() {
  const router = useRouter();

  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STATE;
  });

  const [draftId, setDraftId] = useState(() => {
    try {
      return localStorage.getItem("cxcontrol_wizard_draftId") || null;
    } catch {
      return null;
    }
  });
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [orgMobCatalog, setOrgMobCatalog] = useState({});
  const [orgToolboxTalks, setOrgToolboxTalks] = useState([]);
  const [orgWorkflows, setOrgWorkflows] = useState([]);
  const [orgSOPs, setOrgSOPs] = useState([]);
  const [orgSafetyPlans, setOrgSafetyPlans] = useState([]);
  const [orgDataLoading, setOrgDataLoading] = useState(true);
  const [projectDocs, setProjectDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [rfiList, setRfiList] = useState([]);
  const [rfisLoading, setRfisLoading] = useState(false);
  const [commsList, setCommsList] = useState([]);
  const [commsLoading, setCommsLoading] = useState(false);
  const [showAddComm, setShowAddComm] = useState(false);
  const [newComm, setNewComm] = useState({
    commType: "RFI",
    commNumber: "",
    subject: "",
    body: "",
    fromCompanyCode: "",
    toCompanyCode: "",
  });
  const [addingComm, setAddingComm] = useState(false);
  const [addCommError, setAddCommError] = useState(null);
  const [orgPartners, setOrgPartners] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [teamMembersCache, setTeamMembersCache] = useState({});
  const [teamMembersLoading, setTeamMembersLoading] = useState(null);
  const [assetList, setAssetList] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [companiesList, setCompaniesList] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    type: "CLIENT",
    region: "",
  });
  const [addingCompany, setAddingCompany] = useState(false);
  const [addCompanyError, setAddCompanyError] = useState(null);
  const [contactsList, setContactsList] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
  });
  const [addingContact, setAddingContact] = useState(false);
  const [addContactError, setAddContactError] = useState(null);
  const searchParams = useSearchParams();
  const urlProjectId = searchParams?.get("projectId") || null;

  // search/UI state
  const [wfSearch, setWfSearch] = useState("");
  const [sopSearch, setSopSearch] = useState("");
  const [partnerInviteId, setPartnerInviteId] = useState(null);
  const [partnerDirSearch, setPartnerDirSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccess, setInviteAccess] = useState("read");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    setTeamsLoading(true);
    getTeams()
      .then((res) => setTeams(res?.data || res || []))
      .catch(() => {})
      .finally(() => setTeamsLoading(false));

    const toArr = (res) => res?.data ?? (Array.isArray(res) ? res : []);

    const MOB_KEYS = [
      "mob_site",
      "mob_ppe",
      "mob_supplies",
      "mob_trailer",
      "mob_house",
      "mob_tools",
    ];
    Promise.all(
      MOB_KEYS.map((sk) =>
        listOrgMobCatalog({ stepKey: sk, activeOnly: "true" })
          .then((res) => [sk, toArr(res)])
          .catch(() => [sk, []]),
      ),
    ).then((entries) => setOrgMobCatalog(Object.fromEntries(entries)));

    Promise.all([
      listOrgToolboxTalks({ activeOnly: "true" })
        .then(toArr)
        .catch(() => []),
      listOrgWorkflows()
        .then(toArr)
        .catch(() => []),
      listOrgSOPs()
        .then(toArr)
        .catch(() => []),
      listOrgSafetyPlans()
        .then(toArr)
        .catch(() => []),
      getWizardOrgCatalog()
        .then((res) => res?.data?.partners ?? res?.partners ?? [])
        .catch(() => []),
    ])
      .then(([talks, workflows, sops, plans, partners]) => {
        setOrgToolboxTalks(talks);
        setOrgWorkflows(workflows);
        setOrgSOPs(sops);
        setOrgSafetyPlans(plans);
        setOrgPartners(partners);
        const def = plans.find((p) => p.isDefault);
        if (def)
          upd((s) => (s.safetyPlanId ? s : { ...s, safetyPlanId: def.id }));
      })
      .finally(() => setOrgDataLoading(false));
  }, []);

  const DOCS_STEP_IDX = STEPS.findIndex((s) => s.key === "docs");
  useEffect(() => {
    if (state.step !== DOCS_STEP_IDX) return;
    if (urlProjectId) {
      setDocsLoading(true);
      getDocuments({ projectId: urlProjectId })
        .then((res) =>
          setProjectDocs(Array.isArray(res) ? res : res?.data || []),
        )
        .catch(() => setProjectDocs([]))
        .finally(() => setDocsLoading(false));
    }
    setRfisLoading(true);
    getRFIs(urlProjectId ? { projectId: urlProjectId } : {})
      .then((res) => setRfiList(res?.data || (Array.isArray(res) ? res : [])))
      .catch(() => setRfiList([]))
      .finally(() => setRfisLoading(false));
  }, [state.step, urlProjectId]);

  const COMMS_STEP_IDX = STEPS.findIndex((s) => s.key === "comms");
  useEffect(() => {
    if (state.step !== COMMS_STEP_IDX) return;
    setCommsLoading(true);
    const params = urlProjectId ? { cxProjectId: urlProjectId } : {};
    listCommunications(params)
      .then((res) => setCommsList(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setCommsList([]))
      .finally(() => setCommsLoading(false));
  }, [state.step, urlProjectId]);

  const handleAddComm = async () => {
    if (
      !newComm.commNumber.trim() ||
      !newComm.subject.trim() ||
      !newComm.body.trim() ||
      !newComm.fromCompanyCode.trim()
    ) {
      setAddCommError(
        "Comm number, subject, body, and from company code are required.",
      );
      return;
    }
    setAddingComm(true);
    setAddCommError(null);
    try {
      const payload = {
        commType: newComm.commType,
        commNumber: newComm.commNumber.trim(),
        subject: newComm.subject.trim(),
        body: newComm.body.trim(),
        fromCompanyCode: newComm.fromCompanyCode.trim(),
        toCompanyCode: newComm.toCompanyCode.trim() || undefined,
      };
      if (urlProjectId) payload.cxProjectId = urlProjectId;
      const res = await createCommunication(payload);
      const created = res?.data ?? res;
      setCommsList((prev) => [created, ...prev]);
      setShowAddComm(false);
      setNewComm({
        commType: "RFI",
        commNumber: "",
        subject: "",
        body: "",
        fromCompanyCode: "",
        toCompanyCode: "",
      });
    } catch (err) {
      setAddCommError(err?.message || "Failed to create communication.");
    } finally {
      setAddingComm(false);
    }
  };

  const BASICS_STEP_IDX = STEPS.findIndex((s) => s.key === "basics");
  useEffect(() => {
    if (state.step !== BASICS_STEP_IDX) return;
    setCompaniesLoading(true);
    getCompanies()
      .then((res) =>
        setCompaniesList(Array.isArray(res) ? res : res?.data || []),
      )
      .catch(() => setCompaniesList([]))
      .finally(() => setCompaniesLoading(false));
  }, [state.step]);

  const CUSTOMER_STEP_IDX = STEPS.findIndex((s) => s.key === "customer");
  useEffect(() => {
    if (state.step !== CUSTOMER_STEP_IDX) return;
    setContactsLoading(true);
    getContacts()
      .then((res) =>
        setContactsList(res?.data || (Array.isArray(res) ? res : [])),
      )
      .catch(() => setContactsList([]))
      .finally(() => setContactsLoading(false));
  }, [state.step]);

  const ASSETS_STEP_IDX = STEPS.findIndex((s) => s.key === "assets");
  useEffect(() => {
    if (state.step !== ASSETS_STEP_IDX) return;
    setAssetsLoading(true);
    getAssets()
      .then((res) => setAssetList(res?.data || res || []))
      .catch(() => setAssetList([]))
      .finally(() => setAssetsLoading(false));
  }, [state.step]);

  const handleAddContact = async () => {
    if (
      !newContact.firstName.trim() ||
      !newContact.lastName.trim() ||
      !newContact.email.trim()
    ) {
      setAddContactError("First name, last name, and email are required.");
      return;
    }
    setAddingContact(true);
    setAddContactError(null);
    try {
      const payload = { ...newContact };
      if (state.customerId) payload.companyId = state.customerId;
      const res = await createContact(payload);
      const created = res?.data || res;
      setContactsList((prev) => [...prev, created]);
      upd((s) => ({
        ...s,
        custSel: { ...(s.custSel ?? {}), [created.id]: true },
      }));
      setShowAddContact(false);
      setNewContact({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
      });
    } catch (err) {
      setAddContactError(err?.message || "Failed to create contact.");
    } finally {
      setAddingContact(false);
    }
  };

  const handleAddCompany = async () => {
    if (
      !newCompany.name.trim() ||
      !newCompany.type ||
      !newCompany.region.trim()
    ) {
      setAddCompanyError("Name, type, and region are required.");
      return;
    }
    setAddingCompany(true);
    setAddCompanyError(null);
    try {
      const res = await createCompany(newCompany);
      const created = res?.data || res;
      setCompaniesList((prev) => [...prev, created]);
      upd((s) => ({ ...s, customer: created.name, customerId: created.id }));
      setShowAddCompany(false);
      setNewCompany({ name: "", type: "CLIENT", region: "" });
    } catch (err) {
      setAddCompanyError(err?.message || "Failed to create company.");
    } finally {
      setAddingCompany(false);
    }
  };

  const upd = useCallback((fn) => {
    setState((prev) => (typeof fn === "function" ? fn(prev) : fn));
  }, []);

  const cur = state.step;
  const stepDef = STEPS[cur];

  const goBack = () => {
    if (cur > 0) upd((s) => ({ ...s, step: s.step - 1 }));
  };

  const goNext = async () => {
    if (cur >= STEPS.length - 1) return;
    setSaving(true);
    setApiError(null);
    try {
      let id = draftId;
      // Create a draft the first time the user advances past the "start" screen
      if (!id && cur === 0) {
        const res = await startWizardDraft({ startMode: state?.startMode });
        id = res?.props?.id || res?.id;
        if (id) {
          setDraftId(id);
          try {
            localStorage.setItem("cxcontrol_wizard_draftId", id);
          } catch {}
        }
      }
      if (id) {
        const calls = buildApiCalls(stepDef.key, state, {
          orgMobCatalog,
          teams,
          teamMembersCache,
          contactsList,
          orgSafetyPlans,
          orgPartners,
        });
        const currentCall = calls[0];
        if (currentCall?.data && Object.keys(currentCall.data).length > 0) {
          await saveWizardStep(id, currentCall.step, currentCall.data);
        }
      }
      upd((s) => ({ ...s, step: s.step + 1 }));
    } catch (err) {
      setApiError(err?.message || "Save failed — changes kept locally.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    const key = stepDef.key;
    upd((s) => ({ ...s, skipped: { ...s.skipped, [key]: !s.skipped[key] } }));
  };

  const handleLaunch = async () => {
    if (!draftId) {
      setApiError("No active draft — please complete the wizard steps first.");
      return;
    }
    setSaving(true);
    setApiError(null);
    try {
      const res = await finalizeWizardDraft(draftId);
      const projectId = res?.data?.id || res?.id;
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("cxcontrol_wizard_draftId");
      } catch {}
      if (projectId) {
        router.push(`/ProjectDetails/${projectId}`);
      } else {
        router.push("/Projects");
      }
    } catch (err) {
      setApiError(
        err?.message ||
          "Launch failed — please check required steps and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetWizard = () => {
    if (!confirm("Reset the wizard? All unsaved changes will be lost.")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("cxcontrol_wizard_draftId");
    } catch {}
    setDraftId(null);
    setState(buildDefaultState());
  };

  // ── helpers ────────────────────────────────────────────────────────────────
  function personById(id) {
    return AVAILABLE_PEOPLE.find((p) => p.id === id);
  }

  function togglePerson(role, id) {
    upd((s) => {
      const cur = s.assignments[role] || [];
      const next = cur.includes(id)
        ? cur.filter((x) => x !== id)
        : [...cur, id];
      return { ...s, assignments: { ...s.assignments, [role]: next } };
    });
  }

  const wfCount = Object.values(state.workflows).filter(Boolean).length;
  const sopCount = Object.values(state.sops).filter(Boolean).length;
  const partCount = Object.values(state.partnerSel).filter(Boolean).length;

  // ── STEP RENDERS ───────────────────────────────────────────────────────────

  const renderStart = () => {
    const opts = [
      {
        id: "TEMPLATE",
        n: "Use a template",
        d: "Pre-filled with sample Delta project data — edit to match yours",
        meta: "5 MIN · FASTEST",
      },
      {
        id: "BLANK",
        n: "Start blank",
        d: "Empty forms — registered catalog available as pickers",
        meta: "FULL CONTROL · 30 MIN",
      },
      {
        id: "COPY_EXISTING",
        n: "Copy from existing",
        d: "Clone a past Delta project as your baseline",
        meta: "REUSE PROVEN SETUP",
      },
      {
        id: "QUICK",
        n: "Quick create",
        d: "Just name + customer + date — mobile-friendly",
        meta: "90 SECONDS",
      },
    ];
    return (
      <div>
        <div className="step-head">
          <div className="kicker">Step 1 of {STEPS.length}</div>
          <h1 className="step-title">
            How to create <em>this project?</em>
          </h1>
          <p className="step-sub">
            Your registered catalog (assets, people, partners) is always
            available as picker options regardless of choice. Template prefills
            sample data; blank starts empty.
          </p>
        </div>
        <div className="pg pg-2">
          {opts.map((o) => (
            <div
              key={o.id}
              className={`start-option${state.startMode === o.id ? " sel" : ""}`}
              onClick={() => upd((s) => ({ ...s, startMode: o.id }))}
            >
              <div className="start-option-icon">
                {o.id === "template" && (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <rect
                      x="3"
                      y="3"
                      width="8"
                      height="10"
                      rx="2"
                      fill="currentColor"
                      opacity=".15"
                    />
                    <rect
                      x="13"
                      y="3"
                      width="8"
                      height="10"
                      rx="2"
                      fill="currentColor"
                      opacity=".15"
                    />
                    <rect
                      x="3"
                      y="15"
                      width="8"
                      height="6"
                      rx="2"
                      fill="currentColor"
                      opacity=".3"
                    />
                    <rect
                      x="13"
                      y="15"
                      width="8"
                      height="6"
                      rx="2"
                      fill="currentColor"
                      opacity=".3"
                    />
                  </svg>
                )}
                {o.id === "blank" && (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <rect
                      x="4"
                      y="2"
                      width="16"
                      height="20"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="8"
                      y1="8"
                      x2="16"
                      y2="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="12"
                      x2="16"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="16"
                      x2="12"
                      y2="16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {o.id === "copy" && (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <rect
                      x="9"
                      y="9"
                      width="11"
                      height="13"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M6 14H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
                {o.id === "quick" && (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="start-option-n">{o.n}</div>
              <div className="start-option-d">{o.d}</div>
              <div className="start-option-meta">{o.meta}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBasics = () => (
    <div>
      <div className="step-head">
        <div className="kicker">Step 2 of {STEPS.length}</div>
        <h1 className="step-title">
          Project <em>basics</em>
        </h1>
        <p className="step-sub">
          Name, customer, contract details and key dates.
        </p>
      </div>
      <div className="form-grid">
        <div className="form-grid-full">
          <label className="input-label">Project Name</label>
          <input
            className="input-field"
            value={state.projectName}
            onChange={(e) =>
              upd((s) => ({ ...s, projectName: e.target.value }))
            }
            placeholder="e.g. Delta DC3 Atlanta — Phase 2 Cx"
          />
        </div>
        <div>
          <label className="input-label">Customer</label>
          {companiesLoading ? (
            <div
              className="input-field"
              style={{
                color: "var(--rf-txt3)",
                display: "flex",
                alignItems: "center",
              }}
            >
              Loading…
            </div>
          ) : (
            <select
              className="input-field"
              value={state.customerId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__add__") {
                  setShowAddCompany(true);
                  return;
                }
                const company = companiesList.find((c) => c.id === val);
                upd((s) => ({
                  ...s,
                  customerId: val,
                  customer: company?.name || "",
                }));
                setShowAddCompany(false);
              }}
            >
              <option value="">Select customer…</option>
              {companiesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__add__">+ Add new company</option>
            </select>
          )}
          {showAddCompany && (
            <div
              style={{
                marginTop: 10,
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid var(--rf-border, #e2e8f0)",
                background: "var(--rf-bg2, #f8fafc)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--rf-txt)",
                }}
              >
                New Company
              </div>
              <input
                className="input-field"
                placeholder="Company name *"
                value={newCompany.name}
                onChange={(e) =>
                  setNewCompany((p) => ({ ...p, name: e.target.value }))
                }
              />
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  className="input-field"
                  value={newCompany.type}
                  onChange={(e) =>
                    setNewCompany((p) => ({ ...p, type: e.target.value }))
                  }
                  style={{ flex: 1 }}
                >
                  {COMPANY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  className="input-field"
                  placeholder="Region *"
                  value={newCompany.region}
                  onChange={(e) =>
                    setNewCompany((p) => ({ ...p, region: e.target.value }))
                  }
                  style={{ flex: 1 }}
                />
              </div>
              {addCompanyError && (
                <div style={{ fontSize: 12, color: "var(--rf-red)" }}>
                  {addCompanyError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="rf-btn rf-btn-primary"
                  style={{ flex: 1 }}
                  disabled={addingCompany}
                  onClick={handleAddCompany}
                >
                  {addingCompany ? "Saving…" : "Save Company"}
                </button>
                <button
                  className="rf-btn"
                  style={{ flex: 1 }}
                  disabled={addingCompany}
                  onClick={() => {
                    setShowAddCompany(false);
                    setNewCompany({ name: "", type: "CLIENT", region: "" });
                    setAddingCompany(false);
                    setAddCompanyError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="input-label">Contract Number</label>
          <input
            className="input-field"
            value={state.contractNumber}
            onChange={(e) =>
              upd((s) => ({ ...s, contractNumber: e.target.value }))
            }
            placeholder="e.g. QTS-2026-DC3-002"
          />
        </div>
        <div className="form-grid-full">
          <label className="input-label">Site Address</label>
          <input
            className="input-field"
            value={state.siteAddress}
            onChange={(e) =>
              upd((s) => ({ ...s, siteAddress: e.target.value }))
            }
            placeholder="1234 Peachtree Rd NE, Atlanta, GA"
          />
        </div>
        <div>
          <label className="input-label">Target Start Date</label>
          <input
            className="input-field"
            type="date"
            value={state.startDate}
            onChange={(e) => upd((s) => ({ ...s, startDate: e.target.value }))}
          />
        </div>

        <div>
          <label className="input-label">Contract Value (USD)</label>
          <input
            className="input-field"
            value={state.contractValue}
            onChange={(e) =>
              upd((s) => ({ ...s, contractValue: e.target.value }))
            }
            placeholder="6,500,000"
          />
        </div>
      </div>

      {/* ── Project nature picker ── */}
      <div className="wiz-section">
        <div className="section-kicker">Type</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "var(--rf-txt)",
            marginBottom: 16,
            fontFamily: "var(--wfont-serif)",
            letterSpacing: "-.01em",
          }}
        >
          What kind of project is this?
        </div>
        <div className="pg pg-4">
          {PROJECT_NATURE.map((n) => (
            <div
              key={n.id}
              className={`pc${state.projectNature === n.id ? " sel" : ""}`}
              onClick={() => upd((s) => ({ ...s, projectNature: n.id }))}
            >
              <div className="pc-icon">{n.icon}</div>
              <div className="pc-name">{n.name}</div>
              <div className="pc-desc">{n.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScope = () => (
    <div>
      <div className="step-head">
        <div className="kicker">Step 3 of {STEPS.length}</div>
        <h1 className="step-title">
          Scope of <em>work</em>
        </h1>
        <p className="step-sub">
          For each asset, what are you delivering? Supply only, Cx only, or full
          supply + commissioning?
        </p>
      </div>
      <div className="callout callout-blue">
        <span className="callout-icon">ℹ</span>
        <div>
          <div className="callout-t">Scope drives SOPs and test procedures</div>
          Only selected systems will have commissioning checklists auto-attached
          in the SOPs step.
        </div>
      </div>
      {EQUIPMENT_SCOPE.map((eq) => (
        <div key={eq.id} className="sow-item">
          <div className="sow-icon">
            <span style={{ fontSize: 22 }}>
              {eq.id === "ups"
                ? "⚡"
                : eq.id === "batt"
                  ? "🔋"
                  : eq.id === "gen"
                    ? "⚙️"
                    : eq.id === "pdu"
                      ? "🔌"
                      : eq.id === "ats"
                        ? "🔀"
                        : eq.id === "chlr"
                          ? "❄️"
                          : eq.id === "crah"
                            ? "🌀"
                            : eq.id === "facp"
                              ? "🚨"
                              : eq.id === "acs"
                                ? "🔐"
                                : eq.id === "bms"
                                  ? "🖥️"
                                  : "🔧"}
            </span>
          </div>
          <div>
            <div className="sow-name">{eq.name}</div>
            <div className="sow-meta">{eq.sub}</div>
          </div>
          <div className="sow-scope-pick">
            {["SUPPLY+CX", "SUPPLY", "CX ONLY"].map((v) => (
              <button
                key={v}
                className={
                  state.scopeSel[eq.id] === "SUPPLY+CX" && v === "SUPPLY+CX"
                    ? "on"
                    : state.scopeSel[eq.id] === "SUPPLY" && v === "SUPPLY"
                      ? "on"
                      : (!state.scopeSel[eq.id] ||
                            state.scopeSel[eq.id] === "CX ONLY") &&
                          v === "CX ONLY"
                        ? "on"
                        : ""
                }
                onClick={() =>
                  upd((s) => ({
                    ...s,
                    scopeSel: {
                      ...s.scopeSel,
                      [eq.id]: v === "CX ONLY" ? false : v,
                    },
                    scopeHours: {
                      ...s.scopeHours,
                      [eq.id]:
                        v === "SUPPLY+CX"
                          ? s.scopeHours[eq.id] || 80
                          : v === "SUPPLY"
                            ? 16
                            : 0,
                    },
                  }))
                }
              >
                {v}
              </button>
            ))}
          </div>
          <div className="sow-hours">
            <input
              type="number"
              value={state.scopeHours[eq.id] || 0}
              onChange={(e) =>
                upd((s) => ({
                  ...s,
                  scopeHours: {
                    ...s.scopeHours,
                    [eq.id]: parseInt(e.target.value) || 0,
                  },
                }))
              }
            />
            <div
              style={{
                fontSize: 10,
                color: "var(--smoke)",
                marginTop: 2,
                textAlign: "right",
              }}
            >
              hrs
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSchedule = () => (
    <div>
      <div className="step-head">
        <div className="kicker">Step 4 of {STEPS.length}</div>
        <h1 className="step-title">
          Baseline <em>schedule</em>
        </h1>
        <p className="step-sub">
          Set target dates for each phase. You can refine in the full scheduler
          after launch.
        </p>
      </div>
      <div className="callout callout-amber">
        <span className="callout-icon">⚠</span>
        <div>
          <div className="callout-t">Dates are planning targets</div>Actual
          schedule will be managed in the project timeline after kickoff.
        </div>
      </div>
      {state.phases.map((phase, i) => (
        <div key={phase.id} className="phase-card">
          <div className="phase-num">{i + 1}</div>
          <div>
            <div className="phase-name">{phase.name}</div>
            <div className="phase-meta">
              {phase.desc} · {phase.weeks}
            </div>
          </div>
          <div className="phase-date">
            <label className="input-label" style={{ marginBottom: 3 }}>
              Start
            </label>
            <input
              type="date"
              value={phase.start}
              onChange={(e) =>
                upd((s) => {
                  const ph = [...s.phases];
                  ph[i] = { ...ph[i], start: e.target.value };
                  return { ...s, phases: ph };
                })
              }
            />
          </div>
          <div className="phase-date">
            <label className="input-label" style={{ marginBottom: 3 }}>
              End
            </label>
            <input
              type="date"
              value={phase.end}
              onChange={(e) =>
                upd((s) => {
                  const ph = [...s.phases];
                  ph[i] = { ...ph[i], end: e.target.value };
                  return { ...s, phases: ph };
                })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );

  const handleTeamToggle = async (team) => {
    const teamId = String(team.id);
    const isExpanded = expandedTeam === teamId;

    if (isExpanded) {
      setExpandedTeam(null);
      return;
    }

    setExpandedTeam(teamId);
    if (!teamMembersCache[teamId]) {
      setTeamMembersLoading(teamId);
      try {
        const res = await GetTeamMembers(team.id);
        setTeamMembersCache((prev) => ({
          ...prev,
          [teamId]: res?.data || res || [],
        }));
      } catch {
        setTeamMembersCache((prev) => ({ ...prev, [teamId]: [] }));
      } finally {
        setTeamMembersLoading(null);
      }
    }
  };

  const toggleTeamMember = (teamId, memberId) => {
    upd((s) => {
      const teamSel = (s.teamMemberSel ?? {})[teamId] || {};
      return {
        ...s,
        teamMemberSel: {
          ...(s.teamMemberSel ?? {}),
          [teamId]: { ...teamSel, [memberId]: !teamSel[memberId] },
        },
      };
    });
  };

  const clearTeamMembers = (teamId) => {
    upd((s) => {
      const next = { ...(s.teamMemberSel ?? {}) };
      delete next[teamId];
      return { ...s, teamMemberSel: next };
    });
  };

  const renderTeam = () => {
    const selectedCount = Object.values(state.teamMemberSel || {}).reduce(
      (acc, teamSel) => acc + Object.values(teamSel).filter(Boolean).length,
      0,
    );

    return (
      <div>
        <div className="step-head">
          <div className="kicker">Step 5 of {STEPS.length}</div>
          <h1 className="step-title">
            Assign your <em>team</em>
          </h1>
          <p className="step-sub">
            {teamsLoading
              ? "Loading teams…"
              : teams.length > 0
                ? `${teams.length} team${teams.length !== 1 ? "s" : ""} available${selectedCount > 0 ? ` · ${selectedCount} member${selectedCount !== 1 ? "s" : ""} selected` : ""}.`
                : "No teams found — add teams via the Teams module first."}
          </p>
        </div>

        {teamsLoading && (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--smoke)",
              fontSize: 13,
            }}
          >
            Loading teams…
          </div>
        )}

        {!teamsLoading &&
          teams.map((team) => {
            const teamId = String(team.id);
            const isExpanded = expandedTeam === teamId;
            const members = teamMembersCache[teamId] || [];
            const isMembersLoading = teamMembersLoading === teamId;
            const teamSel = (state.teamMemberSel ?? {})[teamId] || {};
            const checkedCount = Object.values(teamSel).filter(Boolean).length;
            const hasSelected = checkedCount > 0;

            return (
              <div
                key={teamId}
                className={`wcard${hasSelected ? " sel" : ""}`}
                style={{ marginBottom: 8 }}
              >
                {/* Team header row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: hasSelected
                        ? "var(--electric)"
                        : "var(--stone-dark)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: hasSelected ? "#fff" : "var(--navy)",
                      fontSize: 14,
                      flexShrink: 0,
                      fontFamily: "var(--wfont-mono)",
                    }}
                  >
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--navy)",
                        fontSize: 14,
                        marginBottom: 2,
                      }}
                    >
                      {team.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--wfont-mono)",
                        fontSize: 11,
                        color: "var(--smoke)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>
                        {team.memberCount ?? 0} member
                        {team.memberCount !== 1 ? "s" : ""}
                      </span>
                      {hasSelected && (
                        <span
                          style={{ color: "var(--electric)", fontWeight: 600 }}
                        >
                          {checkedCount} selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {hasSelected && (
                      <button
                        className="nav-btn"
                        style={{
                          fontSize: 12,
                          padding: "6px 10px",
                          color: "var(--rf-red, #e53e3e)",
                        }}
                        onClick={() => clearTeamMembers(teamId)}
                      >
                        Remove all
                      </button>
                    )}
                    <button
                      className={isExpanded ? "nav-btn" : "nav-btn primary"}
                      style={{ fontSize: 12, padding: "6px 14px" }}
                      onClick={() => handleTeamToggle(team)}
                    >
                      {isExpanded
                        ? "▲ Close"
                        : hasSelected
                          ? "▼ Edit"
                          : "+ Add"}
                    </button>
                  </div>
                </div>

                {/* Member picker panel */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: 12,
                      borderTop: "1px solid var(--stone-dark)",
                      paddingTop: 12,
                    }}
                  >
                    {isMembersLoading ? (
                      <div
                        style={{
                          padding: "12px 0",
                          color: "var(--smoke)",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        Loading members…
                      </div>
                    ) : members.length === 0 ? (
                      <div
                        style={{
                          color: "var(--smoke)",
                          fontSize: 12,
                          padding: "4px 0",
                        }}
                      >
                        No members found for this team.
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--smoke)",
                            marginBottom: 8,
                            fontFamily: "var(--wfont-mono)",
                          }}
                        >
                          Select members to add to this project
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(210px, 1fr))",
                            gap: 6,
                          }}
                        >
                          {members.map((m, i) => {
                            const memberId = String(m.id ?? i);
                            const isMemberChecked = !!teamSel[memberId];
                            const roleLabel =
                              m.role && typeof m.role === "object"
                                ? m.role.name
                                : m.role;
                            const displayRole = roleLabel || m.jobTitle;
                            const initials = (m.firstName || m.fullName || "?")
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase();
                            const displayName =
                              m.fullName ||
                              `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() ||
                              "—";
                            return (
                              <div
                                key={memberId}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "8px 10px",
                                  background: isMemberChecked
                                    ? "color-mix(in srgb, var(--electric) 10%, var(--bone))"
                                    : "var(--bone)",
                                  borderRadius: 6,
                                  border: isMemberChecked
                                    ? "1px solid var(--electric)"
                                    : "1px solid var(--stone)",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  toggleTeamMember(teamId, memberId)
                                }
                              >
                                <input
                                  type="checkbox"
                                  readOnly
                                  checked={isMemberChecked}
                                  style={{
                                    accentColor: "var(--electric)",
                                    width: 14,
                                    height: 14,
                                    flexShrink: 0,
                                  }}
                                />
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: isMemberChecked
                                      ? "var(--electric)"
                                      : "var(--stone-dark)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: isMemberChecked
                                      ? "#fff"
                                      : "var(--navy)",
                                    flexShrink: 0,
                                  }}
                                >
                                  {initials}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 500,
                                      color: "var(--navy)",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {displayName}
                                  </div>
                                  {displayRole && (
                                    <div
                                      style={{
                                        fontSize: 10,
                                        color: "var(--smoke)",
                                        fontFamily: "var(--wfont-mono)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {displayRole}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        {!teamsLoading && teams.length === 0 && (
          <div className="callout callout-blue">
            <span className="callout-icon">ℹ</span>
            <div>
              No teams configured yet. Teams can be created in the Teams module
              and assigned here.
            </div>
          </div>
        )}
      </div>
    );
  };

  const ADD_CONTACT_FORM = (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 8,
        border: "1px solid var(--rf-border, #e2e8f0)",
        background: "var(--rf-bg2, #f8fafc)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 12,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--rf-txt)" }}>
        New Contact
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="input-field"
          placeholder="First name *"
          value={newContact.firstName}
          onChange={(e) =>
            setNewContact((p) => ({ ...p, firstName: e.target.value }))
          }
          style={{ flex: 1 }}
        />
        <input
          className="input-field"
          placeholder="Last name *"
          value={newContact.lastName}
          onChange={(e) =>
            setNewContact((p) => ({ ...p, lastName: e.target.value }))
          }
          style={{ flex: 1 }}
        />
      </div>
      <input
        className="input-field"
        placeholder="Email *"
        type="email"
        value={newContact.email}
        onChange={(e) =>
          setNewContact((p) => ({ ...p, email: e.target.value }))
        }
      />
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="input-field"
          placeholder="Phone"
          value={newContact.phone}
          onChange={(e) =>
            setNewContact((p) => ({ ...p, phone: e.target.value }))
          }
          style={{ flex: 1 }}
        />
        <input
          className="input-field"
          placeholder="Job title"
          value={newContact.jobTitle}
          onChange={(e) =>
            setNewContact((p) => ({ ...p, jobTitle: e.target.value }))
          }
          style={{ flex: 1 }}
        />
      </div>
      {addContactError && (
        <div style={{ fontSize: 12, color: "var(--rf-red)" }}>
          {addContactError}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="rf-btn rf-btn-primary"
          style={{ flex: 1 }}
          disabled={addingContact}
          onClick={handleAddContact}
        >
          {addingContact ? "Saving…" : "Save Contact"}
        </button>
        <button
          className="rf-btn"
          style={{ flex: 1 }}
          disabled={addingContact}
          onClick={() => {
            setShowAddContact(false);
            setAddContactError(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderCustomer = () => (
    <div>
      <div className="step-head">
        <div className="kicker">Step 6 of {STEPS.length}</div>
        <h1 className="step-title">
          Customer <em>contacts</em>
        </h1>
        <p className="step-sub">
          Select the key stakeholders from the customer / owner side.
        </p>
      </div>

      {contactsLoading ? (
        <div
          style={{ color: "var(--rf-txt3)", padding: "16px 0", fontSize: 14 }}
        >
          Loading contacts…
        </div>
      ) : contactsList.length === 0 ? (
        <div>
          <div
            style={{ color: "var(--rf-txt3)", fontSize: 14, marginBottom: 4 }}
          >
            No contacts found. Add your first contact below.
          </div>
          {ADD_CONTACT_FORM}
        </div>
      ) : (
        <div>
          <div className="pg pg-2">
            {contactsList.map((c) => {
              const initials =
                `${c.firstName?.[0] ?? ""}${c.lastName?.[0] ?? ""}`.toUpperCase();
              const selected = !!(state.custSel ?? {})[c.id];
              return (
                <div
                  key={c.id}
                  className={`wcard${selected ? " sel" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    upd((s) => ({
                      ...s,
                      custSel: { ...(s.custSel ?? {}), [c.id]: !selected },
                    }))
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      className="person-avatar"
                      style={{
                        background: "var(--navy)",
                        width: 36,
                        height: 36,
                        fontSize: 13,
                      }}
                    >
                      {initials}
                    </div>
                    <input
                      type="checkbox"
                      readOnly
                      checked={selected}
                      style={{
                        accentColor: "var(--rf-accent)",
                        width: 15,
                        height: 15,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontWeight: 500,
                      color: "var(--rf-txt)",
                      marginBottom: 2,
                    }}
                  >
                    {c.fullName || `${c.firstName} ${c.lastName}`.trim()}
                  </div>
                  {c.jobTitle && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--rf-txt3)",
                        marginBottom: 4,
                      }}
                    >
                      {c.jobTitle}
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: "var(--wfont-mono)",
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    {c.email}
                  </div>
                  {c.phone && (
                    <div
                      style={{
                        fontFamily: "var(--wfont-mono)",
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                      }}
                    >
                      {c.phone}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--rf-txt3)" }}>
            {Object.values(state.custSel ?? {}).filter(Boolean).length} of{" "}
            {contactsList.length} selected
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              className="rf-btn"
              onClick={() => {
                setShowAddContact((v) => !v);
                setAddContactError(null);
              }}
            >
              {showAddContact ? "Cancel" : "+ Add Contact"}
            </button>
          </div>
          {showAddContact && ADD_CONTACT_FORM}
        </div>
      )}
    </div>
  );

  const renderSites = () => (
    <div>
      <div className="step-head">
        <div className="kicker">Step 7 of {STEPS.length}</div>
        <h1 className="step-title">
          Sites & <em>locations</em>
        </h1>
        <p className="step-sub">
          Select all sites associated with this project.
        </p>
      </div>
      {SITES_LIST.map((s) => (
        <div
          key={s.id}
          className={`wcard${state.siteSel[s.id] ? " sel" : ""}`}
          onClick={() =>
            upd((st) => ({
              ...st,
              siteSel: { ...st.siteSel, [s.id]: !st.siteSel[s.id] },
            }))
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <div style={{ fontWeight: 500, color: "var(--navy)" }}>
              {s.name}
            </div>
            <span
              style={{
                fontFamily: "var(--wfont-mono)",
                fontSize: 10,
                background: "var(--stone)",
                color: "var(--smoke)",
                padding: "2px 7px",
                borderRadius: 4,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              {s.type}
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--wfont-mono)",
              fontSize: 11,
              color: "var(--smoke)",
            }}
          >
            {s.addr}
          </div>
        </div>
      ))}
    </div>
  );

  const ASSET_STATUS_COLOR = {
    IN_STOCK: "var(--rf-green)",
    ASSIGNED: "var(--rf-accent)",
    IN_REPAIR: "var(--rf-yellow)",
    DAMAGED: "var(--rf-red)",
    RETIRED: "var(--rf-txt3)",
    LOST: "var(--rf-red)",
  };

  const renderAssets = () => (
    <div>
      <div className="step-head">
        <div className="kicker">Step 8 of {STEPS.length}</div>
        <h1 className="step-title">
          Asset <em>Registry</em>
        </h1>
        <p className="step-sub">
          Select the assets to link to this project and set a tagging
          convention. Drives unique IDs for every commissioned piece of
          equipment.
        </p>
      </div>

      <div className="wiz-section">
        <div className="section-kicker">Available Assets</div>
        {assetsLoading ? (
          <div
            style={{ color: "var(--rf-txt3)", padding: "16px 0", fontSize: 14 }}
          >
            Loading assets…
          </div>
        ) : assetList.length === 0 ? (
          <div
            style={{ color: "var(--rf-txt3)", padding: "16px 0", fontSize: 14 }}
          >
            No assets found in your organization.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assetList.map((asset) => {
              const selected = !!(state.assetSel ?? {})[asset.id];
              return (
                <div
                  key={asset.id}
                  className={`wcard${selected ? " sel" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    upd((s) => ({
                      ...s,
                      assetSel: {
                        ...(s.assetSel ?? {}),
                        [asset.id]: !(s.assetSel ?? {})[asset.id],
                      },
                    }))
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={selected}
                        style={{
                          accentColor: "var(--rf-accent)",
                          width: 16,
                          height: 16,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: 500,
                            color: "var(--rf-txt)",
                            marginBottom: 2,
                          }}
                        >
                          {asset.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--wfont-mono)",
                            fontSize: 11,
                            color: "var(--rf-txt3)",
                          }}
                        >
                          {asset.assetTag}
                          {asset.category ? ` · ${asset.category}` : ""}
                          {asset.procurementType
                            ? ` · ${asset.procurementType}`
                            : ""}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: `color-mix(in srgb, ${ASSET_STATUS_COLOR[asset.status] ?? "var(--rf-txt3)"} 15%, transparent)`,
                        color:
                          ASSET_STATUS_COLOR[asset.status] ?? "var(--rf-txt3)",
                        flexShrink: 0,
                      }}
                    >
                      {asset.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!assetsLoading && assetList.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--rf-txt3)" }}>
            {Object.values(state.assetSel ?? {}).filter(Boolean).length} of{" "}
            {assetList.length} selected
          </div>
        )}
      </div>

      <div className="wiz-section">
        <div className="section-kicker">Tagging Convention</div>
        <div className="pg pg-4">
          {ASSET_TAG_SCHEMES.map((scheme) => (
            <div
              key={scheme.id}
              className={`pc${state.tagScheme === scheme.id ? " sel" : ""}`}
              onClick={() => upd((s) => ({ ...s, tagScheme: scheme.id }))}
            >
              <div className="pc-icon" style={{ height: 36 }}>
                <span
                  style={{
                    fontFamily: "var(--wfont-mono)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--navy)",
                  }}
                >
                  {scheme.label}
                </span>
              </div>
              <div className="pc-desc">{scheme.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {state.tagScheme === "cust" && (
        <div className="wiz-section">
          <label className="input-label">Custom format</label>
          <input
            className="input-field"
            value={state.customTagFormat}
            onChange={(e) =>
              upd((s) => ({ ...s, customTagFormat: e.target.value }))
            }
            placeholder="e.g. DC3-{TYPE}-{SEQ}"
            style={{ maxWidth: 340 }}
          />
        </div>
      )}
      <div className="callout callout-teal">
        <span className="callout-icon">✓</span>
        <div>
          <div className="callout-t">Auto-tagging at scan</div>When FSEs scan QR
          codes in the field, tags will be auto-applied using the format you
          selected.
        </div>
      </div>
    </div>
  );

  const renderPermits = () => (
    <div>
      <div className="step-head">
        <div className="kicker">Step 9 of {STEPS.length}</div>
        <h1 className="step-title">
          Permits & <em>licenses</em>
        </h1>
        <p className="step-sub">
          Select all permits required for this project. You can track status
          after launch.
        </p>
      </div>
      {PERMITS.map((p) => (
        <div
          key={p.id}
          className={`wcard${state.permitSel[p.id] ? " sel" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() =>
            upd((s) => ({
              ...s,
              permitSel: { ...s.permitSel, [p.id]: !s.permitSel[p.id] },
            }))
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 500,
                  color: "var(--navy)",
                  marginBottom: 2,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--wfont-mono)",
                  fontSize: 11,
                  color: "var(--smoke)",
                }}
              >
                {p.jurisdiction}
              </div>
            </div>
            {p.required && (
              <span
                style={{
                  fontFamily: "var(--wfont-mono)",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  background: "var(--crimson-soft)",
                  color: "var(--crimson)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                }}
              >
                Required
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMobStep = (stepKey, title, subtitle) => {
    const catalog = orgMobCatalog?.[stepKey] || [];
    const sel = state.mobSel?.[stepKey] || {};
    const selectedCount = Object.values(sel).filter(Boolean).length;
    return (
      <div>
        <div className="step-head">
          <div className="kicker">
            Step {cur + 1} of {STEPS.length}
          </div>
          <h1 className="step-title">{title}</h1>
          <p className="step-sub">{subtitle}</p>
        </div>
        {catalog.length === 0 ? (
          <div className="callout callout-blue">
            <span className="callout-icon">ℹ</span>
            <div>
              <div className="callout-t">Auto-seed on launch</div>
              Your org catalog for this mobilization step will be seeded
              automatically when you launch the project.
            </div>
          </div>
        ) : (
          <>
            <div className="callout callout-blue" style={{ marginBottom: 12 }}>
              <span className="callout-icon">ℹ</span>
              <div>
                Select items to include. Leave all unselected to auto-seed the
                full catalog on launch.
                {selectedCount > 0 && (
                  <strong> {selectedCount} selected.</strong>
                )}
              </div>
            </div>
            {catalog.map((item) => (
              <div
                key={item.id}
                className={`wcard${sel[item.id] ? " sel" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  upd((s) => ({
                    ...s,
                    mobSel: {
                      ...s.mobSel,
                      [stepKey]: {
                        ...s.mobSel?.[stepKey],
                        [item.id]: !s.mobSel?.[stepKey]?.[item.id],
                      },
                    },
                  }))
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "var(--navy)",
                        marginBottom: 2,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--wfont-mono)",
                        fontSize: 11,
                        color: "var(--smoke)",
                      }}
                    >
                      {item.category} · Qty: {item.defaultQty || 1} · $
                      {parseFloat(item.defaultUnitCost || 0).toLocaleString()}
                      /unit
                    </div>
                  </div>
                  {item.formula && (
                    <span
                      style={{
                        fontFamily: "var(--wfont-mono)",
                        fontSize: 9,
                        background: "var(--stone)",
                        color: "var(--smoke)",
                        padding: "2px 7px",
                        borderRadius: 4,
                      }}
                    >
                      {item.formula}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const renderMobSite = () =>
    renderMobStep(
      "mob_site",
      <>
        Site <em>setup</em>
      </>,
      "Fencing, signage, laydown, temp power — leave empty to auto-seed from org catalog.",
    );
  const renderMobPPE = () =>
    renderMobStep(
      "mob_ppe",
      <>
        PPE <em>requirements</em>
      </>,
      "Personal protective equipment for the crew — leave empty to auto-seed.",
    );
  const renderMobSupplies = () =>
    renderMobStep(
      "mob_supplies",
      <>
        Supplies <em>& consumables</em>
      </>,
      "Consumables, small tools, office supplies — leave empty to auto-seed.",
    );
  const renderMobTrailer = () =>
    renderMobStep(
      "mob_trailer",
      <>
        Trailer <em>& temp office</em>
      </>,
      "Field office trailer, furniture, utilities — leave empty to auto-seed.",
    );
  const renderMobHouse = () =>
    renderMobStep(
      "mob_house",
      <>
        Temporary <em>housing</em>
      </>,
      "Lodging, per diem, travel arrangements — leave empty to auto-seed.",
    );
  const renderMobTools = () =>
    renderMobStep(
      "mob_tools",
      <>
        Tools <em>& equipment</em>
      </>,
      "Power tools, test equipment, ladders — leave empty to auto-seed.",
    );

  const renderSafety = () => (
    <div>
      <div className="step-head">
        <div className="kicker">
          Step {cur + 1} of {STEPS.length}
        </div>
        <h1 className="step-title">
          Safety <em>plan</em>
        </h1>
        <p className="step-sub">
          Choose an organization safety plan template for this project.
        </p>
      </div>
      {orgDataLoading ? (
        <div
          style={{
            padding: "32px 0",
            textAlign: "center",
            color: "var(--smoke)",
          }}
        >
          Loading safety plans…
        </div>
      ) : orgSafetyPlans.length === 0 ? (
        <div className="callout callout-blue">
          <span className="callout-icon">ℹ</span>
          <div>
            No safety plan templates found.{" "}
            <a
              href="/OrgSafetyPlans/Add"
              target="_blank"
              style={{ color: "var(--electric)" }}
            >
              Create one
            </a>{" "}
            in Org Safety Plans.
          </div>
        </div>
      ) : (
        <div className="pg pg-2">
          {orgSafetyPlans.map((plan) => (
            <div
              key={plan.id}
              className={`wcard${state.safetyPlanId === plan.id ? " sel" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => upd((s) => ({ ...s, safetyPlanId: plan.id }))}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--navy)",
                    fontSize: 13,
                  }}
                >
                  {plan.name}
                </div>
                {plan.isDefault && (
                  <span
                    style={{
                      fontFamily: "var(--wfont-mono)",
                      fontSize: 9,
                      background: "var(--amber-soft)",
                      color: "var(--amber-dark)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    Default
                  </span>
                )}
              </div>
              {plan.safetyManagerRole && (
                <div
                  style={{ fontSize: 12, color: "var(--smoke)", marginTop: 4 }}
                >
                  Manager: {plan.safetyManagerRole}
                </div>
              )}
              {plan.requiredPpe && (
                <div
                  style={{ fontSize: 12, color: "var(--smoke)", marginTop: 2 }}
                >
                  PPE: {plan.requiredPpe}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  flexWrap: "wrap",
                }}
              >
                {plan.nfpa70eRequired && (
                  <span
                    style={{
                      fontFamily: "var(--wfont-mono)",
                      fontSize: 9,
                      background: "var(--amber-soft)",
                      color: "var(--amber-dark)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    NFPA 70E
                  </span>
                )}
                {plan.osha30Required && (
                  <span
                    style={{
                      fontFamily: "var(--wfont-mono)",
                      fontSize: 9,
                      background: "var(--electric-soft)",
                      color: "var(--electric)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    OSHA 30
                  </span>
                )}
                {plan.osha10Required && (
                  <span
                    style={{
                      fontFamily: "var(--wfont-mono)",
                      fontSize: 9,
                      background: "var(--electric-soft)",
                      color: "var(--electric)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    OSHA 10
                  </span>
                )}
                {plan.toolboxTalkFrequency && (
                  <span
                    style={{
                      fontFamily: "var(--wfont-mono)",
                      fontSize: 9,
                      background: "var(--stone)",
                      color: "var(--smoke)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    Toolbox: {plan.toolboxTalkFrequency}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAccess = () => (
    <div>
      <div className="step-head">
        <div className="kicker">
          Step {cur + 1} of {STEPS.length}
        </div>
        <h1 className="step-title">
          Site access & <em>badging</em>
        </h1>
        <p className="step-sub">
          Define access control requirements for this data center project.
        </p>
      </div>
      <div className="pg pg-2">
        {ACCESS_OPTIONS.map((a) => (
          <div
            key={a.id}
            className={`wcard${state.accessSel[a.id] ? " sel" : ""}`}
            onClick={() =>
              upd((s) => ({
                ...s,
                accessSel: { ...s.accessSel, [a.id]: !s.accessSel[a.id] },
              }))
            }
          >
            <div
              style={{ fontWeight: 500, color: "var(--navy)", marginBottom: 4 }}
            >
              {a.name}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--smoke)", lineHeight: 1.4 }}
            >
              {a.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuality = () => (
    <div>
      <div className="step-head">
        <div className="kicker">
          Step {cur + 1} of {STEPS.length}
        </div>
        <h1 className="step-title">
          Quality <em>standards</em>
        </h1>
        <p className="step-sub">
          Select the codes, standards, and certifications this project must
          comply with.
        </p>
      </div>
      <div className="pg pg-2">
        {QUALITY_STANDARDS.map((q) => (
          <div
            key={q.id}
            className={`wcard${state.qualitySel[q.id] ? " sel" : ""}`}
            onClick={() =>
              upd((s) => ({
                ...s,
                qualitySel: { ...s.qualitySel, [q.id]: !s.qualitySel[q.id] },
              }))
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <div style={{ fontWeight: 500, color: "var(--navy)" }}>
                {q.name}
              </div>
              <span
                style={{
                  fontFamily: "var(--wfont-mono)",
                  fontSize: 10,
                  background: "var(--stone)",
                  color: "var(--smoke)",
                  padding: "2px 7px",
                  borderRadius: 4,
                }}
              >
                {q.cat}
              </span>
            </div>
            {q.required && (
              <span
                style={{
                  fontFamily: "var(--wfont-mono)",
                  fontSize: 9,
                  background: "var(--crimson-soft)",
                  color: "var(--crimson)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                Required
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderRisk = () => {
    const bycat = {};
    RISKS.forEach((r) => {
      (bycat[r.cat] = bycat[r.cat] || []).push(r);
    });
    const colorMap = {
      high: "var(--crimson)",
      med: "var(--amber)",
      low: "var(--emerald)",
    };
    return (
      <div>
        <div className="step-head">
          <div className="kicker">
            Step {cur + 1} of {STEPS.length}
          </div>
          <h1 className="step-title">
            Risk <em>register</em>
          </h1>
          <p className="step-sub">
            Pre-identified project risks — select which apply to include in your
            risk register.
          </p>
        </div>
        {Object.entries(bycat).map(([cat, items]) => (
          <div key={cat} className="wiz-section">
            <div className="group-sub-title">{cat}</div>
            {items.map((r) => (
              <div
                key={r.id}
                className={`wcard${state.riskSel[r.id] ? " sel" : ""}`}
                onClick={() =>
                  upd((s) => ({
                    ...s,
                    riskSel: { ...s.riskSel, [r.id]: !s.riskSel[r.id] },
                  }))
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 500,
                      color: "var(--navy)",
                      fontSize: 13,
                    }}
                  >
                    {r.name}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span
                      style={{
                        fontFamily: "var(--wfont-mono)",
                        fontSize: 9,
                        background: colorMap[r.prob] + "22",
                        color: colorMap[r.prob],
                        padding: "2px 7px",
                        borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      P:{r.prob}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--wfont-mono)",
                        fontSize: 9,
                        background: colorMap[r.impact] + "22",
                        color: colorMap[r.impact],
                        padding: "2px 7px",
                        borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      I:{r.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderDocs = () => {
    const grouped = {};
    projectDocs.forEach((doc) => {
      const cat = doc.category || "OTHER";
      (grouped[cat] = grouped[cat] || []).push(doc);
    });

    const fmtSize = (bytes) => {
      if (!bytes) return null;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const DOC_STATUS_COLOR = {
      ACTIVE: {
        bg: "color-mix(in srgb, var(--rf-green) 15%, transparent)",
        color: "var(--rf-green)",
      },
      DELETED: {
        bg: "color-mix(in srgb, var(--rf-red)   15%, transparent)",
        color: "var(--rf-red)",
      },
    };

    const RFI_STATUS_COLOR = {
      OPEN: {
        bg: "color-mix(in srgb, var(--rf-accent) 15%, transparent)",
        color: "var(--rf-accent)",
      },
      ANSWERED: {
        bg: "color-mix(in srgb, var(--rf-yellow) 15%, transparent)",
        color: "var(--rf-yellow)",
      },
      CLOSED: {
        bg: "color-mix(in srgb, var(--rf-green)  15%, transparent)",
        color: "var(--rf-green)",
      },
    };

    const RFI_PRIORITY_COLOR = {
      LOW: {
        bg: "color-mix(in srgb, var(--rf-txt3) 15%, transparent)",
        color: "var(--rf-txt3)",
      },
      MEDIUM: {
        bg: "color-mix(in srgb, var(--rf-yellow) 15%, transparent)",
        color: "var(--rf-yellow)",
      },
      HIGH: {
        bg: "color-mix(in srgb, var(--rf-red)    15%, transparent)",
        color: "var(--rf-red)",
      },
      CRITICAL: {
        bg: "color-mix(in srgb, var(--rf-red)    20%, transparent)",
        color: "var(--rf-red)",
      },
    };

    const badge = (label, colorObj) => (
      <span
        style={{
          fontFamily: "var(--wfont-mono)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 4,
          flexShrink: 0,
          background: colorObj?.bg ?? "var(--stone)",
          color: colorObj?.color ?? "var(--smoke)",
        }}
      >
        {label}
      </span>
    );

    const sectionKicker = (title, count) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid var(--stone-dark)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--wfont-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--rf-txt)",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "var(--wfont-mono)",
            fontSize: 10,
            background: "var(--stone)",
            color: "var(--smoke)",
            padding: "1px 7px",
            borderRadius: 10,
          }}
        >
          {count}
        </span>
      </div>
    );

    return (
      <div>
        <div className="step-head">
          <div className="kicker">
            Step {cur + 1} of {STEPS.length}
          </div>
          <h1 className="step-title">
            Document <em>hub</em>
          </h1>
          <p className="step-sub">Documents and RFIs linked to this project.</p>
        </div>

        {/* ── Documents ── */}
        <div className="wiz-section" style={{ marginBottom: 24 }}>
          {sectionKicker("Documents", projectDocs.length)}
          {docsLoading ? (
            <div
              style={{
                color: "var(--rf-txt3)",
                fontSize: 13,
                padding: "12px 0",
              }}
            >
              Loading documents…
            </div>
          ) : !urlProjectId ? (
            <div
              style={{
                color: "var(--rf-txt3)",
                fontSize: 13,
                padding: "8px 0",
              }}
            >
              Documents will appear here after the project is created.
            </div>
          ) : projectDocs.length === 0 ? (
            <div
              style={{
                color: "var(--rf-txt3)",
                fontSize: 13,
                padding: "8px 0",
              }}
            >
              No documents found for this project.
            </div>
          ) : (
            Object.entries(grouped).map(([category, docs]) => (
              <div key={category} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontFamily: "var(--wfont-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                    color: "var(--smoke)",
                    marginBottom: 6,
                  }}
                >
                  {category.replace(/_/g, " ")} ({docs.length})
                </div>
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="wcard"
                    style={{ cursor: "default", marginBottom: 6 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            color: "var(--rf-txt)",
                            marginBottom: 3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {doc.title}
                        </div>
                        {doc.description && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--rf-txt3)",
                              marginBottom: 4,
                            }}
                          >
                            {doc.description}
                          </div>
                        )}
                        <div
                          style={{
                            fontFamily: "var(--wfont-mono)",
                            fontSize: 11,
                            color: "var(--smoke)",
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          {doc.fileName && <span>{doc.fileName}</span>}
                          {fmtSize(doc.fileSize) && (
                            <span>{fmtSize(doc.fileSize)}</span>
                          )}
                          {doc.version > 0 && <span>v{doc.version}</span>}
                          {doc.mimeType && (
                            <span style={{ textTransform: "uppercase" }}>
                              {doc.mimeType.split("/").pop()}
                            </span>
                          )}
                        </div>
                      </div>
                      {badge(doc.status, DOC_STATUS_COLOR[doc.status])}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* ── RFIs ── */}
        <div className="wiz-section">
          {sectionKicker("RFIs", rfiList.length)}
          {rfisLoading ? (
            <div
              style={{
                color: "var(--rf-txt3)",
                fontSize: 13,
                padding: "12px 0",
              }}
            >
              Loading RFIs…
            </div>
          ) : rfiList.length === 0 ? (
            <div
              style={{
                color: "var(--rf-txt3)",
                fontSize: 13,
                padding: "8px 0",
              }}
            >
              No RFIs found.
            </div>
          ) : (
            rfiList.map((rfi) => (
              <div
                key={rfi.id}
                className="wcard"
                style={{ cursor: "default", marginBottom: 6 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--wfont-mono)",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--rf-accent)",
                        }}
                      >
                        {rfi.rfiNumber}
                      </span>
                      <span
                        style={{
                          fontWeight: 500,
                          color: "var(--rf-txt)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {rfi.subject}
                      </span>
                    </div>
                    {rfi.question && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--rf-txt3)",
                          marginBottom: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rfi.question}
                      </div>
                    )}
                    {rfi.dueDate && (
                      <div
                        style={{
                          fontFamily: "var(--wfont-mono)",
                          fontSize: 11,
                          color: "var(--smoke)",
                        }}
                      >
                        Due {new Date(rfi.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      alignItems: "flex-end",
                    }}
                  >
                    {badge(rfi.status, RFI_STATUS_COLOR[rfi.status])}
                    {rfi.priority &&
                      badge(rfi.priority, RFI_PRIORITY_COLOR[rfi.priority])}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderBudget = () => (
    <div>
      <div className="step-head">
        <div className="kicker">
          Step {cur + 1} of {STEPS.length}
        </div>
        <h1 className="step-title">
          Budget & <em>cost codes</em>
        </h1>
        <p className="step-sub">
          Review and adjust initial budget allocations by cost code.
        </p>
      </div>
      <div
        style={{
          border: "1px solid var(--stone-dark)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 1fr",
            padding: "10px 16px",
            background: "var(--stone)",
            fontFamily: "var(--wfont-mono)",
            fontSize: 10,
            color: "var(--smoke)",
            textTransform: "uppercase",
            letterSpacing: ".08em",
            fontWeight: 600,
          }}
        >
          <div>Code</div>
          <div>Description</div>
          <div style={{ textAlign: "right" }}>Budget</div>
        </div>
        {state.costCodes.map((cc, i) => (
          <div
            key={cc.id}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 1fr",
              padding: "12px 16px",
              borderBottom: "1px solid var(--stone)",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--wfont-mono)",
                fontSize: 12,
                color: "var(--navy)",
                fontWeight: 500,
              }}
            >
              {cc.code}
            </div>
            <div style={{ fontSize: 13, color: "var(--navy)" }}>{cc.name}</div>
            <div style={{ textAlign: "right" }}>
              <input
                type="number"
                value={cc.budget}
                onChange={(e) =>
                  upd((s) => {
                    const ccs = [...s.costCodes];
                    ccs[i] = {
                      ...ccs[i],
                      budget: parseInt(e.target.value) || 0,
                    };
                    return { ...s, costCodes: ccs };
                  })
                }
                style={{
                  width: 120,
                  padding: "5px 8px",
                  fontFamily: "var(--wfont-mono)",
                  fontSize: 12,
                  border: "1px solid var(--stone-dark)",
                  borderRadius: 6,
                  textAlign: "right",
                  background: "var(--bone)",
                }}
              />
            </div>
          </div>
        ))}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 1fr",
            padding: "12px 16px",
            background: "var(--stone)",
          }}
        >
          <div></div>
          <div
            style={{
              fontFamily: "var(--wfont-mono)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--navy)",
            }}
          >
            TOTAL
          </div>
          <div
            style={{
              textAlign: "right",
              fontFamily: "var(--wfont-mono)",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--navy)",
            }}
          >
            $
            {state.costCodes
              .reduce((sum, c) => sum + (c.budget || 0), 0)
              .toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  const COMM_TYPES = [
    "FORMAL_LETTER",
    "RFI",
    "TRANSMITTAL",
    "SUBMITTAL",
    "CHANGE_ORDER",
    "MEETING_MINUTES",
  ];
  const COMM_TYPE_LABEL = {
    FORMAL_LETTER: "Letter",
    RFI: "RFI",
    TRANSMITTAL: "Transmittal",
    SUBMITTAL: "Submittal",
    CHANGE_ORDER: "Change Order",
    MEETING_MINUTES: "Meeting Minutes",
  };
  const COMM_STATE_COLOR = {
    DRAFT: {
      bg: "color-mix(in srgb, var(--rf-txt3) 15%, transparent)",
      color: "var(--rf-txt3)",
    },
    SENT: {
      bg: "color-mix(in srgb, var(--rf-accent) 15%, transparent)",
      color: "var(--rf-accent)",
    },
    ACKNOWLEDGED: {
      bg: "color-mix(in srgb, var(--rf-yellow) 15%, transparent)",
      color: "var(--rf-yellow)",
    },
    CLOSED: {
      bg: "color-mix(in srgb, var(--rf-green) 15%, transparent)",
      color: "var(--rf-green)",
    },
  };

  const renderComms = () => {
    const commBadge = (label, colorObj) => (
      <span
        style={{
          fontFamily: "var(--wfont-mono)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 4,
          flexShrink: 0,
          background: colorObj?.bg ?? "var(--stone)",
          color: colorObj?.color ?? "var(--smoke)",
        }}
      >
        {label}
      </span>
    );

    return (
      <div>
        <div className="step-head">
          <div className="kicker">
            Step {cur + 1} of {STEPS.length}
          </div>
          <h1 className="step-title">Communications</h1>
          <p className="step-sub">
            Formal project communications — RFIs, transmittals, submittals,
            letters and more.
          </p>
        </div>

        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: "var(--wfont-mono)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--rf-txt3)",
            }}
          >
            {commsLoading
              ? "Loading…"
              : `${commsList.length} communication${commsList.length !== 1 ? "s" : ""}`}
          </div>
          {!showAddComm && (
            <button
              className="rf-btn rf-btn-primary"
              style={{ fontSize: 12, padding: "5px 14px" }}
              onClick={() => {
                setShowAddComm(true);
                setAddCommError(null);
              }}
            >
              + Add Communication
            </button>
          )}
        </div>

        {/* Add form */}
        {showAddComm && (
          <div
            style={{
              marginBottom: 16,
              padding: "14px 16px",
              borderRadius: 8,
              border: "1px solid var(--rf-border, #e2e8f0)",
              background: "var(--rf-bg2, #f8fafc)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{ fontWeight: 600, fontSize: 13, color: "var(--rf-txt)" }}
            >
              New Communication
            </div>

            {/* Type selector */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {COMM_TYPES.map((t) => (
                <button
                  key={t}
                  className={`rf-btn${newComm.commType === t ? " rf-btn-primary" : ""}`}
                  style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => setNewComm((p) => ({ ...p, commType: t }))}
                >
                  {COMM_TYPE_LABEL[t]}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input-field"
                placeholder="Comm number * (e.g. RFI-001)"
                value={newComm.commNumber}
                maxLength={50}
                style={{ flex: 1 }}
                onChange={(e) =>
                  setNewComm((p) => ({ ...p, commNumber: e.target.value }))
                }
              />
              <input
                className="input-field"
                placeholder="From company code *"
                value={newComm.fromCompanyCode}
                maxLength={50}
                style={{ flex: 1 }}
                onChange={(e) =>
                  setNewComm((p) => ({ ...p, fromCompanyCode: e.target.value }))
                }
              />
              <input
                className="input-field"
                placeholder="To company code"
                value={newComm.toCompanyCode}
                maxLength={50}
                style={{ flex: 1 }}
                onChange={(e) =>
                  setNewComm((p) => ({ ...p, toCompanyCode: e.target.value }))
                }
              />
            </div>

            <input
              className="input-field"
              placeholder="Subject *"
              value={newComm.subject}
              maxLength={200}
              onChange={(e) =>
                setNewComm((p) => ({ ...p, subject: e.target.value }))
              }
            />

            <textarea
              className="input-field"
              placeholder="Body *"
              value={newComm.body}
              maxLength={10000}
              rows={4}
              style={{ resize: "vertical" }}
              onChange={(e) =>
                setNewComm((p) => ({ ...p, body: e.target.value }))
              }
            />

            {addCommError && (
              <div style={{ fontSize: 12, color: "var(--rf-red)" }}>
                {addCommError}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="rf-btn rf-btn-primary"
                style={{ flex: 1 }}
                disabled={addingComm}
                onClick={handleAddComm}
              >
                {addingComm ? "Saving…" : "Save Communication"}
              </button>
              <button
                className="rf-btn"
                style={{ flex: 1 }}
                disabled={addingComm}
                onClick={() => {
                  setShowAddComm(false);
                  setNewComm({
                    commType: "RFI",
                    commNumber: "",
                    subject: "",
                    body: "",
                    fromCompanyCode: "",
                    toCompanyCode: "",
                  });
                  setAddCommError(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {commsLoading ? (
          <div
            style={{ color: "var(--rf-txt3)", fontSize: 13, padding: "12px 0" }}
          >
            Loading communications…
          </div>
        ) : commsList.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 16px",
              borderRadius: 8,
              border: "1px dashed var(--rf-border, #e2e8f0)",
              color: "var(--rf-txt3)",
              fontSize: 13,
            }}
          >
            <div style={{ marginBottom: 10 }}>No communications yet.</div>
            {!showAddComm && (
              <button
                className="rf-btn rf-btn-primary"
                style={{ fontSize: 12 }}
                onClick={() => {
                  setShowAddComm(true);
                  setAddCommError(null);
                }}
              >
                + Add First Communication
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {commsList.map((c) => (
              <div key={c.id} className="wcard" style={{ cursor: "default" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--wfont-mono)",
                          fontSize: 10,
                          color: "var(--smoke)",
                        }}
                      >
                        {c.commNumber}
                      </span>
                      {commBadge(
                        COMM_TYPE_LABEL[c.commType] ?? c.commType,
                        null,
                      )}
                      {commBadge(c.state, COMM_STATE_COLOR[c.state])}
                      {c.isOverdue &&
                        commBadge("OVERDUE", {
                          bg: "color-mix(in srgb, var(--rf-red) 15%, transparent)",
                          color: "var(--rf-red)",
                        })}
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "var(--rf-txt)",
                        fontSize: 13,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.subject}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--wfont-mono)",
                        fontSize: 11,
                        color: "var(--smoke)",
                        marginTop: 3,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>From: {c.fromCompanyCode}</span>
                      {c.toCompanyCode && <span>To: {c.toCompanyCode}</span>}
                      {c.slaDeadline && (
                        <span>
                          SLA:{" "}
                          {new Date(c.slaDeadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderReporting = () => (
    <div>
      <div className="step-head">
        <div className="kicker">
          Step {cur + 1} of {STEPS.length}
        </div>
        <h1 className="step-title">
          Reporting <em>setup</em>
        </h1>
        <p className="step-sub">
          Choose which reports will be generated automatically for this project.
        </p>
      </div>
      {REPORTING_ITEMS.map((r) => (
        <div
          key={r.id}
          className={`wcard${state.reportSel[r.id] ? " sel" : ""}`}
          onClick={() =>
            upd((s) => ({
              ...s,
              reportSel: { ...s.reportSel, [r.id]: !s.reportSel[r.id] },
            }))
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 500,
                  color: "var(--navy)",
                  marginBottom: 2,
                }}
              >
                {r.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--wfont-mono)",
                  fontSize: 11,
                  color: "var(--smoke)",
                }}
              >
                Freq: {r.freq} · Owner: {r.owner}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {r.auto && (
                <span
                  style={{
                    fontFamily: "var(--wfont-mono)",
                    fontSize: 9,
                    background: "var(--teal-soft)",
                    color: "var(--teal)",
                    padding: "2px 7px",
                    borderRadius: 4,
                    fontWeight: 700,
                  }}
                >
                  AUTO
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTraining = () => {
    const byCat = {};
    orgToolboxTalks.forEach((t) => {
      const cat = t.category || "GENERAL";
      (byCat[cat] = byCat[cat] || []).push(t);
    });
    const selectedCount = Object.values(state.trainingSel || {}).filter(
      Boolean,
    ).length;
    return (
      <div>
        <div className="step-head">
          <div className="kicker">
            Step {cur + 1} of {STEPS.length}
          </div>
          <h1 className="step-title">
            Toolbox <em>talks</em>
          </h1>
          <p className="step-sub">
            Select toolbox talk topics for the project crew.{" "}
            {selectedCount > 0 && <strong>{selectedCount} selected.</strong>}
          </p>
        </div>
        {orgDataLoading ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: "var(--smoke)",
            }}
          >
            Loading toolbox talks…
          </div>
        ) : orgToolboxTalks.length === 0 ? (
          <div className="callout callout-blue">
            <span className="callout-icon">ℹ</span>
            <div>
              No toolbox talks found.{" "}
              <a
                href="/OrgToolboxTalks/Add"
                target="_blank"
                style={{ color: "var(--electric)" }}
              >
                Add topics
              </a>{" "}
              in the Toolbox Talk library.
            </div>
          </div>
        ) : (
          Object.entries(byCat).map(([cat, items]) => (
            <div key={cat} className="wiz-section">
              <div className="group-sub-title">{cat}</div>
              <div className="pg pg-2">
                {items.map((t) => (
                  <div
                    key={t.id}
                    className={`wcard${state.trainingSel?.[t.id] ? " sel" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      upd((s) => ({
                        ...s,
                        trainingSel: {
                          ...s.trainingSel,
                          [t.id]: !s.trainingSel?.[t.id],
                        },
                      }))
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--navy)",
                          fontSize: 13,
                        }}
                      >
                        {t.title}
                      </div>
                      {t.durationMins && (
                        <span
                          style={{
                            fontFamily: "var(--wfont-mono)",
                            fontSize: 9,
                            background: "var(--stone)",
                            color: "var(--smoke)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {t.durationMins} min
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--smoke)",
                          marginTop: 3,
                        }}
                      >
                        {t.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderWorkflows = () => {
    const filtered = wfSearch
      ? orgWorkflows.filter(
          (w) =>
            w.name?.toLowerCase().includes(wfSearch.toLowerCase()) ||
            w.description?.toLowerCase().includes(wfSearch.toLowerCase()),
        )
      : orgWorkflows;
    const selectedCount = Object.values(state.workflows || {}).filter(
      Boolean,
    ).length;
    return (
      <div>
        <div className="step-head">
          <div className="kicker">
            Step {cur + 1} of {STEPS.length}
          </div>
          <h1 className="step-title">
            Pick your <em>workflows</em>
          </h1>
          <p className="step-sub">
            Task routing sequences that auto-trigger based on field events.{" "}
            {selectedCount > 0 && <strong>{selectedCount} selected.</strong>}
          </p>
        </div>
        {orgDataLoading ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: "var(--smoke)",
            }}
          >
            Loading workflows…
          </div>
        ) : orgWorkflows.length === 0 ? (
          <div className="callout callout-blue">
            <span className="callout-icon">ℹ</span>
            <div>
              No workflow templates found.{" "}
              <a
                href="/OrgWorkflows/Add"
                target="_blank"
                style={{ color: "var(--electric)" }}
              >
                Create one
              </a>{" "}
              in Org Workflows.
            </div>
          </div>
        ) : (
          <>
            <div className="hub-search">
              <span className="hub-search-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                value={wfSearch}
                onChange={(e) => setWfSearch(e.target.value)}
                placeholder="Search workflows…"
              />
            </div>
            <div className="hub-stats">
              <span>
                <strong>{selectedCount}</strong> selected
              </span>
              <span>
                <strong>{orgWorkflows.length - selectedCount}</strong> available
              </span>
            </div>
            <div className="pg pg-2">
              {filtered.map((wf) => (
                <div
                  key={wf.id}
                  className={`wcard${state.workflows?.[wf.id] ? " sel" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    upd((s) => ({
                      ...s,
                      workflows: {
                        ...s.workflows,
                        [wf.id]: !s.workflows?.[wf.id],
                      },
                    }))
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--navy)",
                        fontSize: 13,
                      }}
                    >
                      {wf.name}
                    </div>
                    {wf.version && (
                      <span
                        style={{
                          fontFamily: "var(--wfont-mono)",
                          fontSize: 9,
                          background: "var(--stone)",
                          color: "var(--smoke)",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        v{wf.version}
                      </span>
                    )}
                  </div>
                  {wf.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--smoke)",
                        marginTop: 3,
                      }}
                    >
                      {wf.description}
                    </div>
                  )}
                  {wf.steps?.length > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--smoke)",
                        marginTop: 6,
                        fontFamily: "var(--wfont-mono)",
                      }}
                    >
                      {wf.steps.slice(0, 4).map((st, i) => (
                        <span key={i}>
                          {typeof st === "string" ? st : st.name}
                          {i < Math.min(wf.steps.length, 4) - 1 ? " › " : ""}
                        </span>
                      ))}
                      {wf.steps.length > 4 && (
                        <span> +{wf.steps.length - 4} more</span>
                      )}
                    </div>
                  )}
                  {wf.tags?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        marginTop: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {wf.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontFamily: "var(--wfont-mono)",
                            fontSize: 9,
                            background: "var(--electric-soft)",
                            color: "var(--electric)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSOPs = () => {
    const filtered = sopSearch
      ? orgSOPs.filter(
          (s) =>
            s.name?.toLowerCase().includes(sopSearch.toLowerCase()) ||
            s.description?.toLowerCase().includes(sopSearch.toLowerCase()),
        )
      : orgSOPs;
    const byCat = {};
    filtered.forEach((s) => {
      const cat = s.category || "General";
      (byCat[cat] = byCat[cat] || []).push(s);
    });
    const selectedCount = Object.values(state.sops || {}).filter(
      Boolean,
    ).length;
    return (
      <div>
        <div className="step-head">
          <div className="kicker">
            Step {cur + 1} of {STEPS.length}
          </div>
          <h1 className="step-title">
            Select <em>SOPs & forms</em>
          </h1>
          <p className="step-sub">
            Auto-attach standard operating procedures to this project.{" "}
            {selectedCount > 0 && <strong>{selectedCount} selected.</strong>}
          </p>
        </div>
        {orgDataLoading ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: "var(--smoke)",
            }}
          >
            Loading SOPs…
          </div>
        ) : orgSOPs.length === 0 ? (
          <div className="callout callout-blue">
            <span className="callout-icon">ℹ</span>
            <div>
              No SOP templates found.{" "}
              <a
                href="/OrgSOPs/Add"
                target="_blank"
                style={{ color: "var(--electric)" }}
              >
                Create one
              </a>{" "}
              in Org SOPs.
            </div>
          </div>
        ) : (
          <>
            <div className="hub-search">
              <span className="hub-search-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                value={sopSearch}
                onChange={(e) => setSopSearch(e.target.value)}
                placeholder="Search SOPs…"
              />
            </div>
            <div className="hub-stats">
              <span>
                <strong>{selectedCount}</strong> selected
              </span>
              <span>
                <strong>{orgSOPs.length - selectedCount}</strong> available
              </span>
            </div>
            {Object.entries(byCat).map(([cat, items]) => (
              <div key={cat} className="wiz-section">
                <div className="group-sub-title">{cat}</div>
                <div className="pg pg-2">
                  {items.map((sop) => (
                    <div
                      key={sop.id}
                      className={`wcard${state.sops?.[sop.id] ? " sel" : ""}`}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        upd((s) => ({
                          ...s,
                          sops: { ...s.sops, [sop.id]: !s.sops?.[sop.id] },
                        }))
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--navy)",
                            fontSize: 13,
                          }}
                        >
                          {sop.name}
                        </div>
                        {sop.version && (
                          <span
                            style={{
                              fontFamily: "var(--wfont-mono)",
                              fontSize: 9,
                              background: "var(--stone)",
                              color: "var(--smoke)",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            v{sop.version}
                          </span>
                        )}
                      </div>
                      {sop.description && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--smoke)",
                            marginTop: 3,
                          }}
                        >
                          {sop.description}
                        </div>
                      )}
                      {sop.documentUrl && (
                        <a
                          href={sop.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: 11,
                            color: "var(--electric)",
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          View document ↗
                        </a>
                      )}
                      {sop.tags?.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            marginTop: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          {sop.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontFamily: "var(--wfont-mono)",
                                fontSize: 9,
                                background: "var(--electric-soft)",
                                color: "var(--electric)",
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const renderPartners = () => {
    const selTotal = Object.values(state.partnerSel).filter(Boolean).length;
    const connected = orgPartners.filter((p) => state.partnerSel[p.id]);
    const q = partnerDirSearch.toLowerCase();
    const dirList = orgPartners.filter(
      (p) =>
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q),
    );
    const partnersLoading = orgDataLoading && orgPartners.length === 0;

    const tagColor = (tag) => {
      if (tag === "GC") return "var(--electric)";
      if (tag === "TRADE") return "var(--amber)";
      if (tag === "CXA") return "var(--emerald)";
      if (tag === "RIG") return "var(--purple)";
      return "var(--smoke)";
    };

    return (
      <div>
        <div className="step-head">
          <div className="kicker">
            Step {cur + 1} of {STEPS.length}
          </div>
          <h1 className="step-title">
            Invite <em>partners</em>
          </h1>
          <p className="step-sub">
            Grant scoped access to subcontractors, the GC, and owner&apos;s
            reps. {selTotal} connected.
          </p>
        </div>

        {/* ── Connected partners ───────────────────────────────────────────── */}
        <div className="wiz-section">
          <div className="section-kicker">Connected partners</div>
          <div className="section-title" style={{ marginBottom: 12 }}>
            Active on this project
          </div>
          {connected.length === 0 ? (
            <div
              style={{ color: "var(--smoke)", fontSize: 13, padding: "10px 0" }}
            >
              No partners connected yet — select from the directory below.
            </div>
          ) : (
            connected.map((p) => {
              const invite = state.partnerInvites[p.id];
              return (
                <div key={p.id} className="hub-cat" style={{ marginBottom: 8 }}>
                  <div className="hub-cat-head" style={{ cursor: "default" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        className="person-avatar"
                        style={{
                          background: tagColor(p.type),
                          width: 36,
                          height: 36,
                          fontSize: 13,
                        }}
                      >
                        {p.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--navy)",
                              fontSize: 13,
                            }}
                          >
                            {p.name}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--wfont-mono)",
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "var(--emerald-soft)",
                              color: "var(--emerald)",
                            }}
                          >
                            CONNECTED
                          </span>
                          {p.type && (
                            <span
                              style={{
                                fontFamily: "var(--wfont-mono)",
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                padding: "2px 6px",
                                borderRadius: 4,
                                background:
                                  "color-mix(in srgb, " +
                                  tagColor(p.type) +
                                  " 12%, var(--rf-bg2))",
                                color: tagColor(p.type),
                              }}
                            >
                              {p.type}
                            </span>
                          )}
                        </div>
                        {p.region && (
                          <div
                            style={{
                              fontFamily: "var(--wfont-mono)",
                              fontSize: 11,
                              color: "var(--smoke)",
                              marginTop: 2,
                            }}
                          >
                            {p.region}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      {invite ? (
                        <span
                          className={`partner-status ${invite.status === "accepted" ? "ps-accepted" : invite.status === "declined" ? "ps-declined" : "ps-pending"}`}
                        >
                          {invite.status}
                        </span>
                      ) : (
                        <button
                          className="pill-btn"
                          onClick={() => {
                            setPartnerInviteId(p.id);
                            setInviteEmail("");
                            setInviteAccess("read");
                          }}
                        >
                          Invite
                        </button>
                      )}
                      <button
                        className="pill-btn"
                        style={{ color: "var(--crimson)" }}
                        onClick={() =>
                          upd((s) => ({
                            ...s,
                            partnerSel: { ...s.partnerSel, [p.id]: false },
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {partnerInviteId === p.id && (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderTop: "1px solid var(--stone-dark)",
                        background: "var(--bone)",
                      }}
                    >
                      <div className="group-sub-title" style={{ margin: "0 0 10px" }}>
                        Send invite to {p.name}
                      </div>
                      <div className="form-grid" style={{ marginBottom: 0 }}>
                        <div>
                          <label className="input-label">Contact email</label>
                          <input
                            className="input-field"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="pm@partner.com"
                          />
                        </div>
                        <div>
                          <label className="input-label">Access level</label>
                          <select
                            className="input-field"
                            value={inviteAccess}
                            onChange={(e) => setInviteAccess(e.target.value)}
                          >
                            <option value="read">Read only</option>
                            <option value="field">Field team</option>
                            <option value="pm">PM access</option>
                            <option value="full">Full access</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                          className="nav-btn primary"
                          onClick={() => {
                            if (!inviteEmail.trim()) return;
                            upd((s) => ({
                              ...s,
                              partnerInvites: {
                                ...s.partnerInvites,
                                [p.id]: {
                                  email: inviteEmail,
                                  accessLevel: inviteAccess,
                                  status: "pending",
                                },
                              },
                            }));
                            setPartnerInviteId(null);
                          }}
                        >
                          Send invite
                        </button>
                        <button className="nav-btn" onClick={() => setPartnerInviteId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Verified directory ───────────────────────────────────────────── */}
        <div className="wiz-section">
          <div className="section-kicker">Verified directory</div>
          <div className="section-title" style={{ marginBottom: 12 }}>
            Click to invite
          </div>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <svg
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.4,
              }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="input-field"
              style={{ paddingLeft: 36 }}
              placeholder="Search partners…"
              value={partnerDirSearch}
              onChange={(e) => setPartnerDirSearch(e.target.value)}
            />
          </div>
          {partnersLoading ? (
            <div style={{ color: "var(--smoke)", fontSize: 13, padding: "10px 0" }}>
              Loading partners…
            </div>
          ) : dirList.length === 0 ? (
            <div style={{ color: "var(--smoke)", fontSize: 13, padding: "10px 0" }}>
              No partner companies found — add them via the Companies module first.
            </div>
          ) : null}
          {!partnersLoading && dirList.map((p) => {
            const sel = state.partnerSel[p.id];
            const invite = state.partnerInvites[p.id];
            return (
              <div key={p.id} className="hub-cat" style={{ marginBottom: 8 }}>
                <div
                  className="hub-cat-head"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    upd((s) => ({
                      ...s,
                      partnerSel: {
                        ...s.partnerSel,
                        [p.id]: !s.partnerSel[p.id],
                      },
                    }))
                  }
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      className="person-avatar"
                      style={{
                        background: sel ? tagColor(p.type) : "var(--stone)",
                        width: 36,
                        height: 36,
                        fontSize: 13,
                      }}
                    >
                      {p.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--navy)",
                            fontSize: 13,
                          }}
                        >
                          {p.name}
                        </span>
                        {sel && (
                          <span
                            style={{
                              fontFamily: "var(--wfont-mono)",
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "var(--emerald-soft)",
                              color: "var(--emerald)",
                            }}
                          >
                            CONNECTED
                          </span>
                        )}
                        {p.type && (
                          <span
                            style={{
                              fontFamily: "var(--wfont-mono)",
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: sel
                                ? "color-mix(in srgb, " +
                                  tagColor(p.type) +
                                  " 12%, var(--rf-bg2))"
                                : "var(--stone)",
                              color: sel ? tagColor(p.type) : "var(--smoke)",
                            }}
                          >
                            {p.type}
                          </span>
                        )}
                      </div>
                      {p.region && (
                        <div
                          style={{
                            fontFamily: "var(--wfont-mono)",
                            fontSize: 11,
                            color: "var(--smoke)",
                            marginTop: 2,
                          }}
                        >
                          {p.region}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {invite && (
                      <span
                        className={`partner-status ${invite.status === "accepted" ? "ps-accepted" : invite.status === "declined" ? "ps-declined" : "ps-pending"}`}
                      >
                        {invite.status}
                      </span>
                    )}
                    <button
                      className={`pill-btn${sel ? " primary" : ""}`}
                      onClick={() =>
                        upd((s) => ({
                          ...s,
                          partnerSel: {
                            ...s.partnerSel,
                            [p.id]: !s.partnerSel[p.id],
                          },
                        }))
                      }
                    >
                      {sel ? "✓ Connected" : "+ Connect"}
                    </button>
                  </div>
                </div>
                {partnerInviteId === p.id && (
                  <div
                    style={{
                      padding: "14px 16px",
                      borderTop: "1px solid var(--stone-dark)",
                      background: "var(--bone)",
                    }}
                  >
                    <div className="group-sub-title" style={{ margin: "0 0 10px" }}>
                      Send invite to {p.name}
                    </div>
                    <div className="form-grid" style={{ marginBottom: 0 }}>
                      <div>
                        <label className="input-label">Contact email</label>
                        <input
                          className="input-field"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="pm@partner.com"
                        />
                      </div>
                      <div>
                        <label className="input-label">Access level</label>
                        <select
                          className="input-field"
                          value={inviteAccess}
                          onChange={(e) => setInviteAccess(e.target.value)}
                        >
                          <option value="read">Read only</option>
                          <option value="field">Field team</option>
                          <option value="pm">PM access</option>
                          <option value="full">Full access</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        className="nav-btn primary"
                        onClick={() => {
                          if (!inviteEmail.trim()) return;
                          upd((s) => ({
                            ...s,
                            partnerInvites: {
                              ...s.partnerInvites,
                              [p.id]: {
                                email: inviteEmail,
                                accessLevel: inviteAccess,
                                status: "pending",
                              },
                            },
                          }));
                          setPartnerInviteId(null);
                        }}
                      >
                        Send invite
                      </button>
                      <button className="nav-btn" onClick={() => setPartnerInviteId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Invite external partner */}
          {partnerInviteId === "__external__" ? (
            <div className="hub-cat" style={{ marginTop: 8 }}>
              <div
                style={{
                  padding: "14px 16px",
                  borderTop: "1px solid var(--stone-dark)",
                  background: "var(--bone)",
                }}
              >
                <div className="group-sub-title" style={{ margin: "0 0 10px" }}>
                  Send invite to New partner
                </div>
                <div className="form-grid" style={{ marginBottom: 0 }}>
                  <div>
                    <label className="input-label">Contact email</label>
                    <input
                      className="input-field"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="pm@partner.com"
                    />
                  </div>
                  <div>
                    <label className="input-label">Access level</label>
                    <select
                      className="input-field"
                      value={inviteAccess}
                      onChange={(e) => setInviteAccess(e.target.value)}
                    >
                      <option value="read">Read only</option>
                      <option value="field">Field team</option>
                      <option value="pm">PM access</option>
                      <option value="full">Full access</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    className="nav-btn primary"
                    onClick={() => {
                      if (!inviteEmail.trim()) return;
                      upd((s) => ({
                        ...s,
                        partnerInvites: {
                          ...s.partnerInvites,
                          ["__external__"]: {
                            email: inviteEmail,
                            accessLevel: inviteAccess,
                            status: "pending",
                          },
                        },
                      }));
                      setPartnerInviteId(null);
                    }}
                  >
                    Send invite
                  </button>
                  <button className="nav-btn" onClick={() => setPartnerInviteId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              style={{
                width: "100%",
                marginTop: 12,
                padding: "12px 0",
                border: "1.5px dashed var(--stone-dark)",
                borderRadius: 8,
                background: "transparent",
                color: "var(--electric)",
                fontFamily: "var(--wfont)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
              onClick={() => {
                setPartnerInviteId("__external__");
                setInviteEmail("");
                setInviteAccess("read");
              }}
            >
              + Invite a partner not in your verified directory
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderKickoff = () => {
    const checks = [
      {
        label: "Project basics",
        sub: state.projectName || "—",
        done: !!(state.projectName && state.customer),
      },
      {
        label: "Scope of work",
        sub: `${Object.values(state.scopeSel).filter(Boolean).length} systems in scope`,
        done: Object.values(state.scopeSel).some(Boolean),
      },
      {
        label: "Baseline schedule",
        sub: `${state.phases.filter((p) => p.start).length}/${state.phases.length} phases dated`,
        done: state.phases.some((p) => p.start),
      },
      {
        label: "Team assignments",
        sub: `${Object.values(state.selectedTeams || {}).filter(Boolean).length} team${Object.values(state.selectedTeams || {}).filter(Boolean).length !== 1 ? "s" : ""} selected`,
        done:
          Object.values(state.selectedTeams || {}).some(Boolean) ||
          Object.values(state.assignments).flat().length > 0,
      },
      {
        label: "Workflows",
        sub: `${wfCount} workflows selected`,
        done: wfCount > 0,
      },
      {
        label: "SOPs & forms",
        sub: `${sopCount} SOPs selected`,
        done: sopCount > 0,
      },
      {
        label: "Partner network",
        sub: `${partCount} partners selected`,
        done: partCount > 0,
      },
    ];

    const allReady = checks.every((c) => c.done);

    return (
      <div>
        <div className="kickoff-hero">
          <div className="kickoff-hero-inner">
            <div className="kickoff-kicker">Ready for launch</div>
            <div className="kickoff-headline">
              {state.projectName || "Your project"} — <em>ready to kick off</em>
            </div>
            <div className="kickoff-sub">
              {state.customer && `${state.customer} · `}
              {state.siteAddress}
            </div>
          </div>
        </div>
        <div className="summary-grid">
          <div className="summary-box">
            <div className="summary-l">Start date</div>
            <div className="summary-v">{state.startDate || "TBD"}</div>
            <div className="summary-sub">
              {state.endDate ? `→ ${state.endDate}` : ""}
            </div>
          </div>
          <div className="summary-box">
            <div className="summary-l">Contract value</div>
            <div className="summary-v">
              {state.contractValue
                ? `$${parseInt(state.contractValue).toLocaleString()}`
                : "TBD"}
            </div>
            <div className="summary-sub">{state.projectType || ""}</div>
          </div>
          <div className="summary-box">
            <div className="summary-l">Team members</div>
            <div className="summary-v">
              {Object.values(state.selectedTeams || {}).filter(Boolean)
                .length || Object.values(state.assignments).flat().length}
            </div>
            <div className="summary-sub">
              across {Object.keys(state.assignments).length} roles
            </div>
          </div>
          <div className="summary-box">
            <div className="summary-l">Workflows + SOPs</div>
            <div className="summary-v">{wfCount + sopCount}</div>
            <div className="summary-sub">
              {wfCount} workflows · {sopCount} SOPs
            </div>
          </div>
        </div>
        <div className="kickoff-checklist">
          <h3>Pre-launch checklist</h3>
          <p>Review required items before launching.</p>
          {checks.map((c, i) => (
            <div key={i} className="check-row">
              <div className={`check-icon ${c.done ? "done" : "pending"}`}>
                {c.done ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="1" />
                  </svg>
                )}
              </div>
              <div>
                <div className="check-text">{c.label}</div>
                <div className="check-sub">{c.sub}</div>
              </div>
              <span
                className={`check-status ${c.done ? "cs-ready" : "cs-pending"}`}
              >
                {c.done ? "Ready" : "Pending"}
              </span>
            </div>
          ))}
        </div>
        <button className="launch-btn" disabled={saving} onClick={handleLaunch}>
          {saving
            ? "Launching…"
            : allReady
              ? "🚀 Launch project"
              : "Complete required steps to launch"}
        </button>
        <div className="launch-disclaimer">
          PLANNING MODE — no live changes until you launch
        </div>
      </div>
    );
  };

  // ── STEP DISPATCH ──────────────────────────────────────────────────────────
  const STEP_RENDER = {
    start: renderStart,
    basics: renderBasics,
    scope: renderScope,
    schedule: renderSchedule,
    team: renderTeam,
    customer: renderCustomer,
    sites: renderSites,
    assets: renderAssets,
    permits: renderPermits,
    mob_site: renderMobSite,
    mob_ppe: renderMobPPE,
    mob_supplies: renderMobSupplies,
    mob_trailer: renderMobTrailer,
    mob_house: renderMobHouse,
    mob_tools: renderMobTools,
    safety: renderSafety,
    access: renderAccess,
    quality: renderQuality,
    risk: renderRisk,
    docs: renderDocs,
    budget: renderBudget,
    comms: renderComms,
    reporting: renderReporting,
    training: renderTraining,
    workflows: renderWorkflows,
    sops: renderSOPs,
    partners: renderPartners,
    kickoff: renderKickoff,
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="wiz-wrap">
      {/* Header */}
      <div className="wiz-top">
        <div className="wiz-brand">
          <div className="brand-mark">Cx</div>
          <div>
            <div className="brand-name">CxControl</div>
            <div className="brand-sub">Project Kickoff Wizard</div>
          </div>
        </div>
        <div className="company-badge">
          <div className="company-dot" />
          Delta Electronics · National
        </div>
      </div>

      {/* Reset */}
      <div className="reset-row">
        <a onClick={resetWizard}>Reset wizard</a>
      </div>

      {/* Planning banner */}
      {state.planningMode && cur < STEPS.length - 1 && (
        <div className="planning-mode-banner">
          <div className="planning-dot" />
          <div className="planning-text">
            Planning mode — all changes are saved locally until you launch
          </div>
          <button
            className="pill-btn"
            style={{ fontSize: 11 }}
            onClick={() => upd((s) => ({ ...s, planningMode: false }))}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error */}
      {apiError && (
        <div className="callout callout-amber" style={{ marginBottom: 12 }}>
          <span className="callout-icon">⚠</span>
          <div>
            <div className="callout-t">API error</div>
            {apiError}
          </div>
          <button
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--amber-dark)",
            }}
            onClick={() => setApiError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Step nav */}
      {cur > 0 && (
        <div className="step-nav">
          {STEPS.map((s, i) => {
            const cls = `step-dot${i === cur ? " active" : i < cur ? " done" : ""}`;
            return (
              <div
                key={s.key}
                className={cls}
                onClick={() => upd((st) => ({ ...st, step: i }))}
              >
                <span className="sdn">{i < cur ? "✓" : i + 1}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      {cur > 0 && (
        <div className="progress">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`pb${i < cur ? " done" : i === cur ? " active" : ""}`}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      {STEP_RENDER[stepDef.key]?.()}

      {/* Footer */}
      <div className="wiz-footer">
        <button className="nav-btn" onClick={goBack} disabled={cur === 0}>
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="step-count">
            Step {cur + 1} of {STEPS.length}
          </span>
          {!stepDef.required && cur > 0 && cur < STEPS.length - 1 && (
            <button className="nav-btn" onClick={handleSkip}>
              {state.skipped[stepDef.key] ? "Unskip" : "Skip"}
            </button>
          )}
          {cur < STEPS.length - 1 && (
            <button
              className="nav-btn primary"
              onClick={goNext}
              disabled={saving}
            >
              {saving ? "Saving…" : "Next →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
