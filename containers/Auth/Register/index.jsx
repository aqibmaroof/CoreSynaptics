"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GetOrganization, GetUser } from "../../../services/auth";
import {
  FinalizeSetup,
  GetEquipmentDefaults,
  GetReview,
  GetSetup,
  GetSetupRoles,
  SaveBrand,
  SaveCompany,
  SaveEquipment,
  SaveFacility,
  SaveScope,
  SaveTeam,
} from "../../../services/setup";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import {
  getAccessToken,
  setOrganization,
  setTokens,
  setUser,
} from "../../../services/instance/tokenService";
import {
  confirmOnboardingUpload,
  createOnboardingSession,
  getOnboardingUploadUrl,
  putFileToS3,
} from "../../../services/Onboarding";
import {
  getSubscriptions,
  selectSubscription,
} from "../../../services/Subscriptions";
// ── Data ──────────────────────────────────────────────────────────────────────

const COMPANY_TYPES = [
  { id: "customer", n: "Customer", d: "I own / pay for the DC", group: "core" },
  { id: "gc", n: "General Contractor", d: "We build DCs", group: "core" },
  { id: "oem", n: "OEM / Manufacturer", d: "We supply equipment", group: "core" },
  { id: "trade", n: "Trade Contractor", d: "Electrical, mechanical", group: "core" },
  { id: "cxa", n: "Cx Agent Firm", d: "3rd-party commissioning", group: "core" },
  { id: "arch", n: "Architecture / Engineering", d: "Design firm, MEP engineering", group: "specialist" },
  { id: "rig", n: "Rigging", d: "Heavy lift + transport", group: "specialist" },
  { id: "bld", n: "Builder", d: "Shell + interior build", group: "specialist" },
  { id: "sec", n: "Security", d: "Access, CCTV, guarding", group: "specialist" },
  { id: "fire", n: "Fire Alarm", d: "Detection + suppression", group: "specialist" },
  { id: "staff", n: "Staffing Agency", d: "Supply DC workers", group: "service" },
];

const COMPANY_SIZES = [
  {
    id: "small",
    n: "Just starting",
    d: "1–25 people",
    plan: "Just Starting",
    // price: 799,
  },
  {
    id: "med",
    n: "Small business",
    d: "26–250 people",
    plan: "Small Bussiness",
    // price: 2999,
  },
  {
    id: "medium",
    n: "Mid-size",
    d: "251–2,500",
    plan: "Mid Size",
    // price: 9999,
  },
  {
    id: "ent",
    n: "Enterprise",
    d: "2,500+ people",
    plan: "Enterprise",
    // price: 29999,
  },
];

const DC_TYPES = [
  {
    id: "ai",
    n: "AI / GPU Facility",
    d: "Training AI models",
    tech: "AI data center",
  },
  {
    id: "hyp",
    n: "Hyperscale Cloud",
    d: "Cloud provider scale",
    tech: "Hyperscale",
  },
  {
    id: "colo",
    n: "Colocation",
    d: "Rent space to customers",
    tech: "Multi-tenant",
  },
  { id: "ent", n: "Enterprise", d: "For one company", tech: "Enterprise" },
  { id: "edg", n: "Edge Computing", d: "Small, near the action", tech: "Edge" },
  { id: "hpc", n: "HPC / Research", d: "Supercomputing", tech: "HPC" },
  { id: "cry", n: "Crypto Mining", d: "Bitcoin/ETH mining", tech: "Mining" },
  {
    id: "gov",
    n: "Government / DOD",
    d: "Classified / FedRAMP",
    tech: "Gov / DOD",
  },
  {
    id: "bro",
    n: "Broadcast / Media",
    d: "Live production",
    tech: "Broadcast",
  },
  {
    id: "res",
    n: "University Research",
    d: "Academic computing",
    tech: "Research",
  },
  {
    id: "mod",
    n: "Modular / Prefab",
    d: "Containerized units",
    tech: "Prefab",
  },
  { id: "fin", n: "Financial Trading", d: "Low-latency HFT", tech: "HFT" },
];

const UPTIME_TIERS = [
  {
    id: "t1",
    n: "Some Downtime OK",
    d: "Hours/year acceptable",
    tech: "Tier I",
  },
  { id: "t2", n: "Minor Downtime OK", d: "Backup ready", tech: "Tier II" },
  { id: "t3", n: "Always Up", d: "Can't go down in service", tech: "Tier III" },
  {
    id: "t4",
    n: "Nothing Takes It Down",
    d: "Banks, gov, top AI",
    tech: "Tier IV",
  },
];

const FACILITY_SCALES = [
  { id: "s1", n: "Closet", d: "Under 1 MW", tech: "Small" },
  { id: "s2", n: "Server Room", d: "1–10 MW", tech: "Medium" },
  { id: "s3", n: "Full Data Hall", d: "10–50 MW", tech: "Large" },
  { id: "s4", n: "Multi-Building", d: "50+ MW", tech: "Hyperscale" },
];

const COOLING_METHODS = [
  {
    id: "air",
    n: "Regular AC",
    d: "AC units blow cold air",
    tech: "Air cooling",
  },
  {
    id: "rdhx",
    n: "Water-cooled Doors",
    d: "Rear-door heat exchangers",
    tech: "RDHX",
  },
  { id: "dlc", n: "Direct to Chip", d: "Required for AI racks", tech: "DLC" },
  { id: "imm", n: "Immersion", d: "Submerge in dielectric", tech: "Immersion" },
];

const POWER_ARCHS = [
  { id: "n", n: "One Power Line", d: "No backup", tech: "N" },
  { id: "n1", n: "Line + Generator", d: "Backup ready", tech: "N+1" },
  { id: "2n", n: "Two Full Paths", d: "Standard for most", tech: "2N" },
  { id: "2n1", n: "Fully Redundant", d: "Top-tier backup", tech: "2N+1" },
];

const DEFAULT_EQUIPMENT = [
  {
    abbr: "UPS",
    name: "UPS Systems",
    qty: 8,
    oem: "Delta Ultron DPS",
    proc: "OFCI",
    leadWeeks: 16,
  },
  {
    abbr: "BATT",
    name: "Batteries",
    qty: 16,
    oem: "Enersys NexSys",
    proc: "OFCI",
    leadWeeks: 20,
  },
  {
    abbr: "GEN",
    name: "Generators",
    qty: 6,
    oem: "Caterpillar C175",
    proc: "CFCI",
    leadWeeks: 52,
  },
  {
    abbr: "CHLR",
    name: "Chillers",
    qty: 4,
    oem: "Trane CVHF",
    proc: "OFCI",
    leadWeeks: 32,
  },
  {
    abbr: "PDU",
    name: "PDUs",
    qty: 16,
    oem: "Vertiv Liebert FPC",
    proc: "CFCI",
    leadWeeks: 12,
  },
  {
    abbr: "AIRACK",
    name: "AI Racks (GB200)",
    qty: 320,
    oem: "NVIDIA (Foxconn)",
    proc: "OFCI",
    leadWeeks: 40,
  },
];

const DIRECTORY = [
  { n: "Turner Construction", t: "GC", m: "Largest DC GC in the US" },
  { n: "DPR Construction", t: "GC", m: "Mission-critical leader" },
  { n: "Whiting-Turner", t: "GC", m: "Deep DC portfolio" },
  { n: "Skanska USA", t: "GC", m: "Global experience" },
  { n: "Mortenson", t: "GC", m: "Strong in mid-US" },
  { n: "Delta Electronics", t: "OEM", m: "UPS specialist, AI-optimized" },
  { n: "Caterpillar", t: "OEM", m: "Generator leader" },
  { n: "Motivair", t: "OEM", m: "Liquid cooling leader" },
  { n: "Vertiv", t: "OEM", m: "PDU + cooling leader" },
  { n: "Trane Technologies", t: "OEM", m: "Chiller standard" },
  { n: "Shermco Industries", t: "TRADE", m: "NETA electrical testing" },
  { n: "CEC Inc", t: "TRADE", m: "Electrical contractor" },
  { n: "Cerio Commissioning", t: "CXA", m: "DC Cx specialist" },
  { n: "Barnhart Crane", t: "RIG", m: "Heavy rigging specialist" },
  { n: "Mammoet USA", t: "RIG", m: "Industrial rigging + transport" },
  { n: "HDR Architecture", t: "ARCH", m: "DC design specialist" },
  { n: "Corgan", t: "ARCH", m: "DC + aviation architecture" },
  { n: "Convergint", t: "SEC", m: "Enterprise security integrator" },
  { n: "Johnson Controls", t: "FIRE", m: "Fire + life safety" },
  { n: "Siemens", t: "FIRE", m: "Integrated detection systems" },
];

const STAFFING_AGENCIES = [
  {
    n: "AECOM Staffing",
    loc: "National",
    count: "340 on call",
    skills: ["NETA tech", "FSE", "Electrician", "Safety", "QA/QC"],
  },
  {
    n: "GPAC DC Talent",
    loc: "Dallas, Atlanta",
    count: "180 on call",
    skills: ["PM", "Superintendent", "QA/QC", "Commissioning"],
  },
  {
    n: "Workrise",
    loc: "National",
    count: "1,200 on call",
    skills: ["Rigger", "Welder", "Pipefitter", "Labor"],
  },
  {
    n: "Turner Staffing Group",
    loc: "Atlanta, Richmond",
    count: "95 on call",
    skills: ["Commissioning", "Safety", "Controls"],
  },
  {
    n: "Aerotek",
    loc: "National",
    count: "2,400 on call",
    skills: ["Mechanical", "Electrical", "HVAC", "Instrumentation"],
  },
  {
    n: "Insight Global",
    loc: "National",
    count: "850 on call",
    skills: ["IT", "SRE", "Network", "Security"],
  },
];

const TEAMS_BY_TYPE = {
  oem: [
    { n: "VP Operations", d: "OEM role · Executive", tier: "P", qty: 1 },
    { n: "Sales Director", d: "OEM role · Executive", tier: "P", qty: 1 },
    { n: "VP Engineering", d: "OEM role · Executive", tier: "P", qty: 1 },
    { n: "National PM", d: "OEM role · Project Management", tier: "P", qty: 1 },
    { n: "Regional PM", d: "OEM role · Project Management", tier: "P", qty: 1 },
    { n: "Senior PM", d: "OEM role · Project Management", tier: "P", qty: 1 },
    {
      n: "Project Manager",
      d: "OEM role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Assistant PM",
      d: "OEM role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Project Coordinator",
      d: "OEM role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Regional Field Service Manager",
      d: "OEM role · Field Service",
      tier: "P",
      qty: 1,
    },
    { n: "Lead FSE", d: "OEM role · Field Service", tier: "F", qty: 1 },
    { n: "Senior FSE", d: "OEM role · Field Service", tier: "F", qty: 1 },
    {
      n: "Field Service Engineer",
      d: "OEM role · Field Service",
      tier: "F",
      qty: 1,
    },
    { n: "Apprentice FSE", d: "OEM role · Field Service", tier: "F", qty: 1 },
    { n: "Service Dispatch", d: "OEM role · Field Service", tier: "S", qty: 1 },
    { n: "Cx Lead", d: "OEM role · Commissioning", tier: "S", qty: 1 },
    {
      n: "Senior Cx Engineer",
      d: "OEM role · Commissioning",
      tier: "S",
      qty: 1,
    },
    { n: "Cx Engineer", d: "OEM role · Commissioning", tier: "S", qty: 1 },
    {
      n: "Application Engineer",
      d: "OEM role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Senior App Engineer",
      d: "OEM role · Engineering",
      tier: "S",
      qty: 1,
    },
    { n: "Solutions Engineer", d: "OEM role · Engineering", tier: "S", qty: 1 },
    { n: "Sales Rep", d: "OEM role · Sales", tier: "S", qty: 1 },
    { n: "Inside Sales", d: "OEM role · Sales", tier: "S", qty: 1 },
    { n: "Sales Engineer", d: "OEM role · Sales", tier: "S", qty: 1 },
    { n: "Account Manager", d: "OEM role · Sales", tier: "S", qty: 1 },
    {
      n: "Safety Manager",
      d: "OEM role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    {
      n: "Site Safety Officer",
      d: "OEM role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    { n: "QA/QC Manager", d: "OEM role · Safety & Quality", tier: "S", qty: 1 },
    {
      n: "QA/QC Inspector",
      d: "OEM role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    {
      n: "Scheduler",
      d: "OEM role · Scheduling & Controls",
      tier: "P",
      qty: 1,
    },
    {
      n: "On-site Scheduler",
      d: "OEM role · Scheduling & Controls",
      tier: "P",
      qty: 1,
    },
    {
      n: "Project Controls",
      d: "OEM role · Scheduling & Controls",
      tier: "P",
      qty: 1,
    },
    {
      n: "Estimator",
      d: "OEM role · Scheduling & Controls",
      tier: "S",
      qty: 1,
    },
    {
      n: "Warranty Manager",
      d: "OEM role · Warranty & Parts",
      tier: "P",
      qty: 1,
    },
    {
      n: "Warranty Administrator",
      d: "OEM role · Warranty & Parts",
      tier: "S",
      qty: 1,
    },
    {
      n: "Parts Coordinator",
      d: "OEM role · Warranty & Parts",
      tier: "S",
      qty: 1,
    },
    {
      n: "RMA Specialist",
      d: "OEM role · Warranty & Parts",
      tier: "S",
      qty: 1,
    },
    {
      n: "Finance Director",
      d: "OEM role · Finance & Admin",
      tier: "P",
      qty: 1,
    },
    { n: "AR Specialist", d: "OEM role · Finance & Admin", tier: "P", qty: 1 },
    { n: "Office Admin", d: "OEM role · Finance & Admin", tier: "P", qty: 1 },
  ],
  gc: [
    { n: "Project Executive", d: "GC role · Executive", tier: "P", qty: 1 },
    { n: "VP Operations", d: "GC role · Executive", tier: "P", qty: 1 },
    { n: "VP Preconstruction", d: "GC role · Executive", tier: "P", qty: 1 },
    { n: "Senior PM", d: "GC role · Project Management", tier: "P", qty: 1 },
    {
      n: "Project Manager",
      d: "GC role · Project Management",
      tier: "P",
      qty: 1,
    },
    { n: "Assistant PM", d: "GC role · Project Management", tier: "P", qty: 1 },
    {
      n: "Project Engineer",
      d: "GC role · Project Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Document Controller",
      d: "GC role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Senior Superintendent",
      d: "GC role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    { n: "Superintendent", d: "GC role · Field Leadership", tier: "F", qty: 1 },
    {
      n: "Assistant Superintendent",
      d: "GC role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "General Foreman",
      d: "GC role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    { n: "Foreman", d: "GC role · Field Leadership", tier: "F", qty: 1 },
    {
      n: "VP MEP / MEP Director",
      d: "GC role · MEP Coordination",
      tier: "P",
      qty: 1,
    },
    { n: "Senior MEP PM", d: "GC role · MEP Coordination", tier: "P", qty: 1 },
    {
      n: "MEP Project Manager",
      d: "GC role · MEP Coordination",
      tier: "P",
      qty: 1,
    },
    {
      n: "Senior MEP Superintendent",
      d: "GC role · MEP Coordination",
      tier: "F",
      qty: 1,
    },
    {
      n: "MEP Superintendent",
      d: "GC role · MEP Coordination",
      tier: "F",
      qty: 1,
    },
    {
      n: "Assistant MEP Superintendent",
      d: "GC role · MEP Coordination",
      tier: "F",
      qty: 1,
    },
    {
      n: "Electrical Superintendent",
      d: "GC role · MEP Coordination",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical Superintendent",
      d: "GC role · MEP Coordination",
      tier: "F",
      qty: 1,
    },
    {
      n: "MEP Coordinator",
      d: "GC role · MEP Coordination",
      tier: "S",
      qty: 1,
    },
    {
      n: "MEP Field Engineer",
      d: "GC role · MEP Coordination",
      tier: "S",
      qty: 1,
    },
    { n: "MEP QA/QC", d: "GC role · MEP Coordination", tier: "S", qty: 1 },
    { n: "BIM Manager", d: "GC role · BIM / VDC", tier: "S", qty: 1 },
    { n: "VDC Coordinator", d: "GC role · BIM / VDC", tier: "S", qty: 1 },
    {
      n: "BIM/VDC MEP Coordinator",
      d: "GC role · BIM / VDC",
      tier: "S",
      qty: 1,
    },
    { n: "Safety Manager", d: "GC role · Safety & Quality", tier: "S", qty: 1 },
    {
      n: "Site Safety Officer",
      d: "GC role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    { n: "QA/QC Manager", d: "GC role · Safety & Quality", tier: "S", qty: 1 },
    {
      n: "Scheduler",
      d: "GC role · Controls & Procurement",
      tier: "P",
      qty: 1,
    },
    {
      n: "Estimator",
      d: "GC role · Controls & Procurement",
      tier: "S",
      qty: 1,
    },
    {
      n: "Buyer / Procurement",
      d: "GC role · Controls & Procurement",
      tier: "S",
      qty: 1,
    },
  ],
  customer: [
    {
      n: "VP Infrastructure",
      d: "Customer role · Executive",
      tier: "P",
      qty: 1,
    },
    {
      n: "Director DC Construction",
      d: "Customer role · Executive",
      tier: "P",
      qty: 1,
    },
    {
      n: "DC Program Director",
      d: "Customer role · Executive",
      tier: "P",
      qty: 1,
    },
    {
      n: "Program Director",
      d: "Customer role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Construction Program Lead",
      d: "Customer role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Senior Construction PM",
      d: "Customer role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Construction Coordinator",
      d: "Customer role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Owner Rep",
      d: "Customer role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "DC Ops Manager",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Facility Manager",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Campus Facility Manager",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Critical Operations Manager",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Chief Engineer",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Lead Building Engineer",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Critical Facility Engineer",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Building Engineer",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Electrical Technician",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Controls Technician",
      d: "Customer role · Facility Operations",
      tier: "F",
      qty: 1,
    },
    {
      n: "Network Operations",
      d: "Customer role · Network & Security Ops",
      tier: "S",
      qty: 1,
    },
    {
      n: "Security Operations",
      d: "Customer role · Network & Security Ops",
      tier: "S",
      qty: 1,
    },
    {
      n: "EHS Manager",
      d: "Customer role · Network & Security Ops",
      tier: "S",
      qty: 1,
    },
    { n: "Procurement", d: "Customer role · Business", tier: "S", qty: 1 },
    {
      n: "Legal / Contracts",
      d: "Customer role · Business",
      tier: "P",
      qty: 1,
    },
    { n: "Finance", d: "Customer role · Business", tier: "P", qty: 1 },
    { n: "HR", d: "Customer role · Business", tier: "S", qty: 1 },
    { n: "Payroll", d: "Customer role · Business", tier: "S", qty: 1 },
    { n: "Janitorial", d: "Customer role · Site Services", tier: "F", qty: 1 },
    {
      n: "Groundskeeping",
      d: "Customer role · Site Services",
      tier: "F",
      qty: 1,
    },
  ],
  trade: [
    {
      n: "Project Manager",
      d: "Trade contractor role · Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Assistant PM",
      d: "Trade contractor role · Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Project Engineer",
      d: "Trade contractor role · Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Estimator",
      d: "Trade contractor role · Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Electrical Superintendent",
      d: "Trade contractor role · Electrical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Electrical General Foreman",
      d: "Trade contractor role · Electrical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Electrical Foreman",
      d: "Trade contractor role · Electrical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Journeyman Electrician",
      d: "Trade contractor role · Electrical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Apprentice",
      d: "Trade contractor role · Electrical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical Estimator",
      d: "Trade contractor role · Mechanical Field",
      tier: "S",
      qty: 1,
    },
    {
      n: "Mechanical Superintendent",
      d: "Trade contractor role · Mechanical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical General Foreman",
      d: "Trade contractor role · Mechanical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical Foreman",
      d: "Trade contractor role · Mechanical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Pipefitter",
      d: "Trade contractor role · Mechanical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Sheet Metal Worker",
      d: "Trade contractor role · Mechanical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical Apprentice",
      d: "Trade contractor role · Mechanical Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical Safety Officer",
      d: "Trade contractor role · Mechanical Field",
      tier: "S",
      qty: 1,
    },
    {
      n: "Fire Protection Designer",
      d: "Trade contractor role · Fire Protection Field",
      tier: "S",
      qty: 1,
    },
    {
      n: "Fire Protection Foreman",
      d: "Trade contractor role · Fire Protection Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Sprinkler Fitter",
      d: "Trade contractor role · Fire Protection Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Security Systems Designer",
      d: "Trade contractor role · Security / ACS Field",
      tier: "S",
      qty: 1,
    },
    {
      n: "Security Foreman",
      d: "Trade contractor role · Security / ACS Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Access Control Technician",
      d: "Trade contractor role · Security / ACS Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Cabling Foreman",
      d: "Trade contractor role · Low-Voltage / Cabling Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Fiber Technician",
      d: "Trade contractor role · Low-Voltage / Cabling Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Controls PM",
      d: "Trade contractor role · Controls Field",
      tier: "P",
      qty: 1,
    },
    {
      n: "Controls Engineer",
      d: "Trade contractor role · Controls Field",
      tier: "S",
      qty: 1,
    },
    {
      n: "Controls Superintendent",
      d: "Trade contractor role · Controls Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Controls Foreman",
      d: "Trade contractor role · Controls Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Controls Technician",
      d: "Trade contractor role · Controls Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Controls Programmer",
      d: "Trade contractor role · Controls Field",
      tier: "S",
      qty: 1,
    },
    { n: "QA/QC", d: "Trade contractor role · Quality", tier: "S", qty: 1 },
    {
      n: "Safety Officer",
      d: "Trade contractor role · Quality",
      tier: "S",
      qty: 1,
    },
  ],
  cxa: [
    { n: "Principal", d: "CxA role · Leadership", tier: "P", qty: 1 },
    { n: "Cx Director", d: "CxA role · Leadership", tier: "P", qty: 1 },
    { n: "Lead Cx Agent", d: "CxA role · Cx Operations", tier: "S", qty: 1 },
    { n: "Cx Agent", d: "CxA role · Cx Operations", tier: "S", qty: 1 },
    { n: "Cx Specialist", d: "CxA role · Cx Operations", tier: "S", qty: 1 },
    {
      n: "Functional Test Lead",
      d: "CxA role · Cx Operations",
      tier: "S",
      qty: 1,
    },
    { n: "Cx Engineer", d: "CxA role · Cx Operations", tier: "S", qty: 1 },
    {
      n: "Senior Cx Engineer (EE)",
      d: "CxA role · Cx Operations",
      tier: "S",
      qty: 1,
    },
    {
      n: "Senior Cx Engineer (ME)",
      d: "CxA role · Cx Operations",
      tier: "S",
      qty: 1,
    },
    {
      n: "Cx Writer / Protocol Author",
      d: "CxA role · Cx Operations",
      tier: "S",
      qty: 1,
    },
    { n: "Cx Coordinator", d: "CxA role · Cx Operations", tier: "P", qty: 1 },
    {
      n: "Documentation Specialist",
      d: "CxA role · Support",
      tier: "S",
      qty: 1,
    },
  ],
  ae: [
    { n: "Principal in Charge", d: "A/E role · Leadership", tier: "P", qty: 1 },
    { n: "Architectural PM", d: "A/E role · Leadership", tier: "P", qty: 1 },
    { n: "Lead Architect", d: "A/E role · Architecture", tier: "S", qty: 1 },
    { n: "Design Architect", d: "A/E role · Architecture", tier: "S", qty: 1 },
    { n: "Project Architect", d: "A/E role · Architecture", tier: "S", qty: 1 },
    { n: "Lead Engineer", d: "A/E role · MEP Engineering", tier: "S", qty: 1 },
    {
      n: "MEP Engineering Lead",
      d: "A/E role · MEP Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Electrical Engineer (PE)",
      d: "A/E role · MEP Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Mechanical Engineer (PE)",
      d: "A/E role · MEP Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Plumbing Engineer",
      d: "A/E role · MEP Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Fire Protection Engineer",
      d: "A/E role · MEP Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Controls Engineer",
      d: "A/E role · MEP Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Structural Engineer (PE)",
      d: "A/E role · Structural / Civil",
      tier: "S",
      qty: 1,
    },
    {
      n: "Civil Engineer (PE)",
      d: "A/E role · Structural / Civil",
      tier: "S",
      qty: 1,
    },
    { n: "Drafter", d: "A/E role · Drafting / Production", tier: "S", qty: 1 },
    { n: "CA Lead", d: "A/E role · Construction Admin", tier: "S", qty: 1 },
    {
      n: "RFI Coordinator",
      d: "A/E role · Construction Admin",
      tier: "S",
      qty: 1,
    },
    {
      n: "Field Engineer",
      d: "A/E role · Construction Admin",
      tier: "S",
      qty: 1,
    },
  ],
  rigger: [
    { n: "Rigging PM", d: "Rigging role · Management", tier: "P", qty: 1 },
    { n: "Lift Director", d: "Rigging role · Management", tier: "P", qty: 1 },
    {
      n: "Rigging Engineer (Pick Plans)",
      d: "Rigging role · Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Rigging Superintendent",
      d: "Rigging role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "Rigging Foreman",
      d: "Rigging role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "Crane Operator (NCCCO)",
      d: "Rigging role · Crane & Crew",
      tier: "F",
      qty: 1,
    },
    {
      n: "Junior Crane Operator",
      d: "Rigging role · Crane & Crew",
      tier: "F",
      qty: 1,
    },
    { n: "Signal Person", d: "Rigging role · Crane & Crew", tier: "F", qty: 1 },
    { n: "Lead Rigger", d: "Rigging role · Crane & Crew", tier: "F", qty: 1 },
    { n: "Rigger", d: "Rigging role · Crane & Crew", tier: "F", qty: 1 },
    { n: "Crane Oiler", d: "Rigging role · Crane & Crew", tier: "F", qty: 1 },
    {
      n: "Heavy Haul Driver (CDL-A)",
      d: "Rigging role · Transport",
      tier: "F",
      qty: 1,
    },
    {
      n: "Transport Dispatcher",
      d: "Rigging role · Transport",
      tier: "P",
      qty: 1,
    },
    {
      n: "Rigging Safety Manager",
      d: "Rigging role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    {
      n: "Site Safety Officer",
      d: "Rigging role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    {
      n: "Crane / Rigging Inspector",
      d: "Rigging role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
  ],
  builder: [
    {
      n: "Project Executive",
      d: "Builder role · Executive",
      tier: "P",
      qty: 1,
    },
    { n: "VP Operations", d: "Builder role · Executive", tier: "P", qty: 1 },
    {
      n: "Senior PM",
      d: "Builder role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Project Manager",
      d: "Builder role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Assistant PM",
      d: "Builder role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Project Engineer",
      d: "Builder role · Project Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Superintendent",
      d: "Builder role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "Assistant Super",
      d: "Builder role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "General Foreman",
      d: "Builder role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "Concrete Foreman",
      d: "Builder role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "Steel Foreman",
      d: "Builder role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    { n: "Carpenter", d: "Builder role · Crew", tier: "F", qty: 1 },
    { n: "Ironworker", d: "Builder role · Crew", tier: "F", qty: 1 },
    { n: "Concrete Finisher", d: "Builder role · Crew", tier: "F", qty: 1 },
    { n: "Laborer", d: "Builder role · Crew", tier: "F", qty: 1 },
    {
      n: "Safety Manager",
      d: "Builder role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    { n: "QA/QC", d: "Builder role · Safety & Quality", tier: "S", qty: 1 },
    { n: "Scheduler", d: "Builder role · Controls", tier: "P", qty: 1 },
    { n: "Estimator", d: "Builder role · Controls", tier: "S", qty: 1 },
  ],
  security: [
    { n: "Security PM", d: "Security role · Management", tier: "P", qty: 1 },
    {
      n: "Engineering Manager",
      d: "Security role · Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Security Designer",
      d: "Security role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Systems Engineer",
      d: "Security role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Access Control Programmer",
      d: "Security role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "CCTV / Video Engineer",
      d: "Security role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Lead Security Technician",
      d: "Security role · Field",
      tier: "F",
      qty: 1,
    },
    { n: "Security Technician", d: "Security role · Field", tier: "F", qty: 1 },
    {
      n: "Low-Voltage Installer",
      d: "Security role · Field",
      tier: "F",
      qty: 1,
    },
    { n: "Apprentice", d: "Security role · Field", tier: "F", qty: 1 },
    {
      n: "SOC / Console Manager",
      d: "Security role · Operations",
      tier: "S",
      qty: 1,
    },
    {
      n: "Console Operator",
      d: "Security role · Operations",
      tier: "S",
      qty: 1,
    },
    {
      n: "Guard Force Supervisor",
      d: "Security role · Operations",
      tier: "S",
      qty: 1,
    },
    { n: "QA/QC", d: "Security role · Quality", tier: "S", qty: 1 },
    { n: "Safety Officer", d: "Security role · Quality", tier: "S", qty: 1 },
  ],
  fire: [
    {
      n: "Fire Alarm PM",
      d: "Fire alarm role · Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Engineering Manager",
      d: "Fire alarm role · Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Fire Protection Engineer (PE)",
      d: "Fire alarm role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Fire Alarm Designer (NICET IV)",
      d: "Fire alarm role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Suppression Designer",
      d: "Fire alarm role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Fire Alarm Superintendent",
      d: "Fire alarm role · Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Lead Technician (NICET III)",
      d: "Fire alarm role · Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Fire Alarm Technician (NICET II)",
      d: "Fire alarm role · Field",
      tier: "F",
      qty: 1,
    },
    { n: "Installer", d: "Fire alarm role · Field", tier: "F", qty: 1 },
    {
      n: "Sprinkler Pipefitter",
      d: "Fire alarm role · Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Test & Inspection Lead",
      d: "Fire alarm role · Inspection & Test",
      tier: "S",
      qty: 1,
    },
    {
      n: "NFPA-72 Inspector",
      d: "Fire alarm role · Inspection & Test",
      tier: "S",
      qty: 1,
    },
    { n: "QA/QC", d: "Fire alarm role · Quality", tier: "S", qty: 1 },
    { n: "Safety Officer", d: "Fire alarm role · Quality", tier: "S", qty: 1 },
  ],
  staffing: [
    {
      n: "Owner / Branch Manager",
      d: "Staffing role · Leadership",
      tier: "P",
      qty: 1,
    },
    { n: "Account Manager", d: "Staffing role · Sales", tier: "S", qty: 1 },
    {
      n: "Business Development Rep",
      d: "Staffing role · Sales",
      tier: "S",
      qty: 1,
    },
    {
      n: "Recruiting Manager",
      d: "Staffing role · Recruiting",
      tier: "P",
      qty: 1,
    },
    { n: "Recruiter", d: "Staffing role · Recruiting", tier: "P", qty: 1 },
    { n: "Sourcer", d: "Staffing role · Recruiting", tier: "P", qty: 1 },
    {
      n: "Operations Manager",
      d: "Staffing role · Operations",
      tier: "P",
      qty: 1,
    },
    {
      n: "Payroll / Onboarding",
      d: "Staffing role · Operations",
      tier: "S",
      qty: 1,
    },
    {
      n: "Compliance Officer",
      d: "Staffing role · Operations",
      tier: "S",
      qty: 1,
    },
    {
      n: "Field Representative",
      d: "Staffing role · Field",
      tier: "F",
      qty: 1,
    },
  ],
  integrator: [
    {
      n: "Principal / Owner",
      d: "Integrator role · Executive",
      tier: "P",
      qty: 1,
    },
    {
      n: "VP Engineering",
      d: "Integrator role · Executive",
      tier: "P",
      qty: 1,
    },
    {
      n: "Senior PM",
      d: "Integrator role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Project Manager",
      d: "Integrator role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Assistant PM",
      d: "Integrator role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Project Coordinator",
      d: "Integrator role · Project Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Engineering Manager",
      d: "Integrator role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Senior Controls Engineer",
      d: "Integrator role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Controls Engineer",
      d: "Integrator role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "PLC / DDC Programmer",
      d: "Integrator role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "SCADA Engineer",
      d: "Integrator role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Graphics / HMI Designer",
      d: "Integrator role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Network Engineer",
      d: "Integrator role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Shop Manager",
      d: "Integrator role · Factory / Shop",
      tier: "P",
      qty: 1,
    },
    {
      n: "Panel Build Lead",
      d: "Integrator role · Factory / Shop",
      tier: "F",
      qty: 1,
    },
    {
      n: "Panel Build Technician",
      d: "Integrator role · Factory / Shop",
      tier: "F",
      qty: 1,
    },
    { n: "Wireman", d: "Integrator role · Factory / Shop", tier: "F", qty: 1 },
    {
      n: "Factory QC Inspector",
      d: "Integrator role · Factory / Shop",
      tier: "S",
      qty: 1,
    },
    {
      n: "Lead Field Technician",
      d: "Integrator role · Field Service",
      tier: "F",
      qty: 1,
    },
    {
      n: "Field Technician",
      d: "Integrator role · Field Service",
      tier: "F",
      qty: 1,
    },
    {
      n: "Startup Engineer",
      d: "Integrator role · Field Service",
      tier: "S",
      qty: 1,
    },
    {
      n: "Integrator Cx Engineer",
      d: "Integrator role · Field Service",
      tier: "S",
      qty: 1,
    },
    {
      n: "Sales Engineer",
      d: "Integrator role · Sales & Estimating",
      tier: "S",
      qty: 1,
    },
    {
      n: "Estimator",
      d: "Integrator role · Sales & Estimating",
      tier: "S",
      qty: 1,
    },
    {
      n: "Safety Manager",
      d: "Integrator role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    {
      n: "QA/QC Manager",
      d: "Integrator role · Safety & Quality",
      tier: "S",
      qty: 1,
    },
    {
      n: "Warranty / Service Coordinator",
      d: "Integrator role · Warranty & Service",
      tier: "S",
      qty: 1,
    },
    {
      n: "Remote Ops Specialist",
      d: "Integrator role · Warranty & Service",
      tier: "S",
      qty: 1,
    },
  ],
  controls: [
    { n: "Controls PM", d: "Controls role · Management", tier: "P", qty: 1 },
    { n: "Assistant PM", d: "Controls role · Management", tier: "P", qty: 1 },
    {
      n: "Engineering Manager",
      d: "Controls role · Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Senior Controls Engineer",
      d: "Controls role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Controls Engineer",
      d: "Controls role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "BMS Programmer (Niagara/Metasys)",
      d: "Controls role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "PLC Programmer",
      d: "Controls role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Graphics / HMI Designer",
      d: "Controls role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Network Engineer",
      d: "Controls role · Engineering",
      tier: "S",
      qty: 1,
    },
    {
      n: "Controls Superintendent",
      d: "Controls role · Field",
      tier: "F",
      qty: 1,
    },
    { n: "Controls Foreman", d: "Controls role · Field", tier: "F", qty: 1 },
    {
      n: "Lead Controls Technician",
      d: "Controls role · Field",
      tier: "F",
      qty: 1,
    },
    { n: "Controls Technician", d: "Controls role · Field", tier: "F", qty: 1 },
    { n: "Controls Apprentice", d: "Controls role · Field", tier: "F", qty: 1 },
    {
      n: "Startup Engineer",
      d: "Controls role · Commissioning",
      tier: "S",
      qty: 1,
    },
    { n: "Cx Engineer", d: "Controls role · Commissioning", tier: "S", qty: 1 },
    { n: "QA/QC", d: "Controls role · Quality", tier: "S", qty: 1 },
    { n: "Safety Officer", d: "Controls role · Quality", tier: "S", qty: 1 },
  ],
  lowvoltage: [
    {
      n: "Low-Voltage PM",
      d: "Low-voltage role · Management",
      tier: "P",
      qty: 1,
    },
    {
      n: "Assistant PM",
      d: "Low-voltage role · Management",
      tier: "P",
      qty: 1,
    },
    { n: "Estimator", d: "Low-voltage role · Management", tier: "S", qty: 1 },
    {
      n: "LV Designer (BICSI RCDD)",
      d: "Low-voltage role · Engineering / Design",
      tier: "S",
      qty: 1,
    },
    {
      n: "LV Engineer",
      d: "Low-voltage role · Engineering / Design",
      tier: "S",
      qty: 1,
    },
    {
      n: "Cabling Superintendent",
      d: "Low-voltage role · Field",
      tier: "F",
      qty: 1,
    },
    { n: "Cabling Foreman", d: "Low-voltage role · Field", tier: "F", qty: 1 },
    {
      n: "Lead Cabling Technician",
      d: "Low-voltage role · Field",
      tier: "F",
      qty: 1,
    },
    { n: "Fiber Technician", d: "Low-voltage role · Field", tier: "F", qty: 1 },
    {
      n: "Copper / Structured Cabling Tech",
      d: "Low-voltage role · Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Cable Tester / Certifier",
      d: "Low-voltage role · Field",
      tier: "F",
      qty: 1,
    },
    {
      n: "Cabling Apprentice",
      d: "Low-voltage role · Field",
      tier: "F",
      qty: 1,
    },
    { n: "QA/QC", d: "Low-voltage role · Quality", tier: "S", qty: 1 },
    { n: "Safety Officer", d: "Low-voltage role · Quality", tier: "S", qty: 1 },
  ],
  mechanical: [
    {
      n: "Mechanical PM",
      d: "Mechanical role · Management",
      tier: "P",
      qty: 1,
    },
    { n: "Assistant PM", d: "Mechanical role · Management", tier: "P", qty: 1 },
    {
      n: "Mechanical Engineer",
      d: "Mechanical role · Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Mechanical Estimator",
      d: "Mechanical role · Management",
      tier: "S",
      qty: 1,
    },
    {
      n: "Mechanical Superintendent",
      d: "Mechanical role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical General Foreman",
      d: "Mechanical role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical Foreman",
      d: "Mechanical role · Field Leadership",
      tier: "F",
      qty: 1,
    },
    { n: "Pipefitter", d: "Mechanical role · Trades", tier: "F", qty: 1 },
    {
      n: "Journeyman Pipefitter",
      d: "Mechanical role · Trades",
      tier: "F",
      qty: 1,
    },
    {
      n: "Sheet Metal Worker",
      d: "Mechanical role · Trades",
      tier: "F",
      qty: 1,
    },
    {
      n: "Journeyman Sheet Metal",
      d: "Mechanical role · Trades",
      tier: "F",
      qty: 1,
    },
    { n: "HVAC Installer", d: "Mechanical role · Trades", tier: "F", qty: 1 },
    {
      n: "Welder (Pipe/Sanitary)",
      d: "Mechanical role · Trades",
      tier: "F",
      qty: 1,
    },
    {
      n: "Mechanical Apprentice",
      d: "Mechanical role · Trades",
      tier: "F",
      qty: 1,
    },
    { n: "QA/QC", d: "Mechanical role · Quality & Safety", tier: "S", qty: 1 },
    {
      n: "Mechanical Safety Officer",
      d: "Mechanical role · Quality & Safety",
      tier: "S",
      qty: 1,
    },
  ],
  customer_const: [
    {
      n: "VP Construction",
      d: "Customer construction role · Executive",
      tier: "P",
      qty: 1,
    },
    {
      n: "Director of Construction",
      d: "Customer construction role · Executive",
      tier: "P",
      qty: 1,
    },
    {
      n: "DC Program Director",
      d: "Customer construction role · Executive",
      tier: "P",
      qty: 1,
    },
    {
      n: "Program Director",
      d: "Customer construction role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Senior Construction PM",
      d: "Customer construction role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Construction PM",
      d: "Customer construction role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Construction Coordinator",
      d: "Customer construction role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Owner Rep",
      d: "Customer construction role · Construction Program",
      tier: "P",
      qty: 1,
    },
    {
      n: "Owner MEP PM",
      d: "Customer construction role · Technical Oversight",
      tier: "P",
      qty: 1,
    },
    {
      n: "Owner MEP Engineer",
      d: "Customer construction role · Technical Oversight",
      tier: "S",
      qty: 1,
    },
    {
      n: "Construction QA/QC",
      d: "Customer construction role · Technical Oversight",
      tier: "S",
      qty: 1,
    },
    {
      n: "EHS Manager",
      d: "Customer construction role · Technical Oversight",
      tier: "S",
      qty: 1,
    },
    {
      n: "Construction Procurement",
      d: "Customer construction role · Business",
      tier: "S",
      qty: 1,
    },
    {
      n: "Contracts Administrator",
      d: "Customer construction role · Business",
      tier: "P",
      qty: 1,
    },
    {
      n: "Construction Finance",
      d: "Customer construction role · Business",
      tier: "P",
      qty: 1,
    },
  ],
  operations: [
    {
      n: "Director of Projects (OEM)",
      d: "Corporate operations role · OEM Leadership",
      tier: "P",
      qty: 1,
    },
    {
      n: "Director of Field Service (OEM)",
      d: "Corporate operations role · OEM Leadership",
      tier: "P",
      qty: 1,
    },
    {
      n: "VP Operations (OEM)",
      d: "Corporate operations role · OEM Leadership",
      tier: "P",
      qty: 1,
    },
    {
      n: "VP Engineering (OEM)",
      d: "Corporate operations role · OEM Leadership",
      tier: "P",
      qty: 1,
    },
    {
      n: "VP Operations (GC)",
      d: "Corporate operations role · GC Leadership",
      tier: "P",
      qty: 1,
    },
    {
      n: "VP Preconstruction (GC)",
      d: "Corporate operations role · GC Leadership",
      tier: "P",
      qty: 1,
    },
    {
      n: "Director of Commissioning (CxA)",
      d: "Corporate operations role · CxA Leadership",
      tier: "P",
      qty: 1,
    },
    {
      n: "Sales Director",
      d: "Corporate operations role · Sales",
      tier: "P",
      qty: 1,
    },
    {
      n: "Senior Account Sales Manager",
      d: "Corporate operations role · Sales",
      tier: "S",
      qty: 1,
    },
    {
      n: "Sales Manager",
      d: "Corporate operations role · Sales",
      tier: "S",
      qty: 1,
    },
    {
      n: "Account Manager",
      d: "Corporate operations role · Sales",
      tier: "S",
      qty: 1,
    },
    {
      n: "Sales Rep",
      d: "Corporate operations role · Sales",
      tier: "S",
      qty: 1,
    },
    {
      n: "Sales Engineer",
      d: "Corporate operations role · Sales",
      tier: "S",
      qty: 1,
    },
    {
      n: "Solution Engineer",
      d: "Corporate operations role · Sales",
      tier: "S",
      qty: 1,
    },
    {
      n: "Estimator",
      d: "Corporate operations role · Estimating",
      tier: "S",
      qty: 1,
    },
    {
      n: "Finance Manager",
      d: "Corporate operations role · Finance & Project Controls",
      tier: "P",
      qty: 1,
    },
    {
      n: "Project Controls Analyst",
      d: "Corporate operations role · Finance & Project Controls",
      tier: "P",
      qty: 1,
    },
    {
      n: "Payroll Specialist",
      d: "Corporate operations role · Finance & Project Controls",
      tier: "S",
      qty: 1,
    },
    {
      n: "HR Manager",
      d: "Corporate operations role · HR & Training",
      tier: "S",
      qty: 1,
    },
    {
      n: "Recruiter",
      d: "Corporate operations role · HR & Training",
      tier: "P",
      qty: 1,
    },
    {
      n: "Training Coordinator",
      d: "Corporate operations role · HR & Training",
      tier: "P",
      qty: 1,
    },
    {
      n: "Contracts Administrator",
      d: "Corporate operations role · Contracts & Procurement",
      tier: "P",
      qty: 1,
    },
    {
      n: "Procurement Manager",
      d: "Corporate operations role · Contracts & Procurement",
      tier: "S",
      qty: 1,
    },
  ],
};

const INTEGRATIONS = [
  {
    k: "PROCORE",
    n: "Procore",
    p: 399,
    color: "#F27B35",
    letters: "P",
    desc: "Two-way sync with your Procore projects.",
  },
  {
    k: "P6",
    n: "Oracle P6",
    p: 299,
    color: "#C14B2E",
    letters: "P6",
    desc: "Export live schedule data to P6.",
  },
  {
    k: "ACC",
    n: "Autodesk ACC",
    p: 349,
    color: "#2C2C2A",
    letters: "ACC",
    desc: "Pull BIM, push Cx status to ACC.",
  },
  {
    k: "CXALLOY",
    n: "CxAlloy",
    p: 249,
    color: "#D4537E",
    letters: "Cx",
    desc: "Migrate existing CxAlloy checklists.",
  },
  {
    k: "HAMMERTECH",
    n: "HammerTech",
    p: 199,
    color: "#BA7517",
    letters: "HT",
    desc: "Sync safety inspections and JHAs.",
  },
  {
    k: "BLUEBEAM",
    n: "Bluebeam",
    p: 149,
    color: "#378ADD",
    letters: "BB",
    desc: "Pull markups, link to assets.",
  },
];

const AI_OPTIONS = [
  {
    k: "CHATGPT",
    n: "ChatGPT",
    tag: "OpenAI · GPT-5",
    p: 299,
    color: "#10A37F",
    bestFor: "General Q&A",
    desc: "Most popular option. Fast, reliable, trusted.",
  },
  {
    k: "CLAUDE",
    n: "Claude",
    tag: "Anthropic · Claude 4.7",
    p: 399,
    color: "#D97757",
    bestFor: "Technical docs",
    desc: "Best at long technical docs, OEM specs, procedures.",
  },
  {
    k: "GEMINI",
    n: "Gemini",
    tag: "Google · Gemini 2",
    p: 249,
    color: "#4285F4",
    bestFor: "Google shops",
    desc: "Deeply integrated with Google Workspace.",
  },
  {
    k: "LLAMA",
    n: "Llama",
    tag: "Meta · Self-hosted",
    p: 199,
    color: "#0668E1",
    bestFor: "Private data",
    desc: "Open-source, self-hosted for data residency.",
  },
];

const BRAND_COLORS = [
  "#0A2540",
  "#0066FF",
  "#059669",
  "#D97706",
  "#DC2626",
  "#6D28D9",
  "#0891B2",
  "#151515",
];

const STEPS = [
  {
    key: "company",
    label: "Company",
    title: "Let's start with your",
    em: "company",
    sub: "Pick your company type. This drives pricing, role library, and wizard behavior.",
  },
  {
    key: "scope",
    label: "Scope",
    title: "Set your company",
    em: "scope",
    sub: "Admin-only settings that affect every future project.",
  },
  {
    key: "facility",
    label: "Facility",
    title: "Design your",
    em: "data center",
    sub: "DC type, uptime, scale, cooling, and power redundancy.",
  },
  {
    key: "equipment",
    label: "Equipment",
    title: "Your equipment",
    em: "registry",
    sub: "Assets + procurement tracking. Powers checklists, lead times, cost allocation.",
  },
  // {
  //   key: "partners",
  //   label: "Partners",
  //   title: "Who's working",
  //   em: "with you?",
  //   sub: "Standalone vs Connected. Search the directory, or add your own.",
  // },
  // {
  //   key: "staffing",
  //   label: "Staffing",
  //   title: "Bridge the",
  //   em: "labor shortage",
  //   sub: "Connect to DC-focused staffing agencies. Optional add-on.",
  // },
  {
    key: "team",
    label: "Team",
    title: "Size your",
    em: "team",
    sub: "Role library auto-loads for your company type.",
  },
  // {
  //   key: "integrate",
  //   label: "Integrate",
  //   title: "Connect",
  //   em: "integrations + AI",
  //   sub: "Keep your existing tools. Pick your AI. All itemized.",
  // },
  {
    key: "brand",
    label: "Brand",
    title: "Make it",
    em: "yours",
    sub: "Logo, colors, and geographic map add-on.",
  },
  {
    key: "review",
    label: "Review",
    title: "Your complete",
    em: "platform",
    sub: "Pricing breakdown, competitor comparison, and launch.",
  },
];

const STORAGE_KEY = "cxcontrol_register_v2";

// ── Style constants ────────────────────────────────────────────────────────────

const C = {
  bg: "var(--rf-bg)",
  card: "var(--rf-bg2)",
  border: "var(--rf-border2)",
  selBg: "var(--rf-bg3)",
  sel: "var(--rf-accent)",
  text: "var(--rf-txt)",
  muted: "var(--rf-txt2)",
  accent: "var(--rf-accent)",
  mono: "'IBM Plex Mono', monospace",
  sans: "'IBM Plex Sans', sans-serif",
};

const iBase = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px solid var(--rf-border2)",
  backgroundColor: "var(--rf-bg2)",
  color: "var(--rf-txt)",
  fontFamily: C.mono,
  fontSize: "0.8rem",
  letterSpacing: "0.04em",
  outline: "none",
};

const lStyle = {
  display: "block",
  fontFamily: C.mono,
  fontSize: "0.58rem",
  color: "var(--rf-txt2)",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  marginBottom: "6px",
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function FI({ label, ...p }) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <input
        style={iBase}
        onFocus={(e) => {
          e.target.style.borderColor = C.accent;
          e.target.style.boxShadow = "0 0 0 2px rgba(0,200,255,0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = C.border;
          e.target.style.boxShadow = "none";
        }}
        {...p}
      />
    </div>
  );
}

function Card({ label, desc, tech, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? C.selBg : C.card,
        border: selected ? `1.5px solid ${C.sel}` : `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 12px",
        cursor: "pointer",
        transition: "all 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!selected)
          e.currentTarget.style.borderColor = "rgba(0,180,220,0.45)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = C.border;
      }}
    >
      {selected && (
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 7,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: C.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8">
            <path
              d="M1.5 4l2 2 3-3"
              stroke="#020d16"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: selected ? C.accent : C.text,
          fontFamily: C.sans,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      {desc && (
        <div
          style={{ fontSize: "0.65rem", color: C.muted, fontFamily: C.mono }}
        >
          {desc}
        </div>
      )}
      {tech && (
        <div
          style={{
            fontSize: "0.58rem",
            color: selected ? C.accent : "var(--rf-txt2)",
            fontFamily: C.mono,
            marginTop: 4,
            paddingTop: 3,
            borderTop: `1px dashed ${C.border}`,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {tech}
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onToggle, label, sub }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
      }}
    >
      <div
        onClick={onToggle}
        style={{
          width: 38,
          height: 20,
          borderRadius: 10,
          background: on ? C.accent : "var(--rf-bg4)",
          position: "relative",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            background: "#fff",
            borderRadius: "50%",
            position: "absolute",
            top: 3,
            left: on ? 21 : 3,
            transition: "left 0.15s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      <div>
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: C.text,
            fontFamily: C.sans,
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: "0.64rem",
              color: C.muted,
              fontFamily: C.mono,
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function Callout({ color = "cyan", title, children }) {
  const pal = {
    cyan: {
      bg: "rgba(0,200,255,0.07)",
      bdr: "rgba(0,200,255,0.2)",
      t: "#00c8ff",
      b: "var(--rf-txt2)",
    },
    amber: {
      bg: "rgba(255,180,0,0.07)",
      bdr: "rgba(255,180,0,0.2)",
      t: "#ffcc00",
      b: "#a88c40",
    },
    green: {
      bg: "rgba(0,229,160,0.07)",
      bdr: "rgba(0,229,160,0.2)",
      t: "#00e5a0",
      b: "#4a9a80",
    },
    purple: {
      bg: "rgba(109,40,217,0.08)",
      bdr: "rgba(109,40,217,0.22)",
      t: "#a78bfa",
      b: "#7c6bba",
    },
    teal: {
      bg: "rgba(15,110,86,0.1)",
      bdr: "rgba(15,110,86,0.25)",
      t: "#34d399",
      b: "#5a9a82",
    },
  }[color] || {
    bg: "rgba(0,200,255,0.07)",
    bdr: "rgba(0,200,255,0.2)",
    t: "#00c8ff",
    b: "var(--rf-txt2)",
  };
  return (
    <div
      style={{
        background: pal.bg,
        border: `1px solid ${pal.bdr}`,
        borderRadius: 8,
        padding: "11px 14px",
        marginBottom: 14,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: "0.68rem",
            fontWeight: 600,
            color: pal.t,
            fontFamily: C.mono,
            marginBottom: 3,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {title}
        </div>
      )}
      <div style={{ fontSize: "0.7rem", color: pal.b, lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  );
}

function SH({ kicker, title, sub }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontFamily: C.mono,
          fontSize: "0.56rem",
          color: C.accent,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          marginBottom: 3,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: C.sans,
          fontSize: "0.88rem",
          fontWeight: 600,
          color: C.text,
        }}
      >
        {title}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: C.mono,
            fontSize: "0.62rem",
            color: C.muted,
            marginTop: 3,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function G({ cols = 2, gap = 8, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────────

const MULTI_DC_PRICE = { small: 160, med: 600, medium: 2000, ent: 6000 };
const CONNECTED_PRICE = { small: 199, med: 599, medium: 1499, ent: 4999 };

function calcPricing(w) {
  const size =
    COMPANY_SIZES.find((s) => s.id === w.companySize) || COMPANY_SIZES[2];
  let total = 0;
  const adds = [];

  if (w.multiDC) {
    const amt = MULTI_DC_PRICE[w.companySize] || 2000;
    total += amt;
    adds.push({
      label: "Multi-DC access",
      desc: "Portfolio workflows across sites",
      amount: amt,
    });
  }
  if (w.mode === "connected") {
    const amt = CONNECTED_PRICE[w.companySize] || 1499;
    total += amt;
    adds.push({
      label: "Connected mode",
      desc: "Link partners on this project",
      amount: amt,
    });
  }
  if (w.useStaffing) {
    total += 399;
    adds.push({
      label: "Staffing marketplace",
      desc: "Access to DC-focused agencies",
      amount: 399,
    });
  }
  INTEGRATIONS.forEach((i) => {
    if (w.integrations?.[i.k]) {
      total += i.p;
      adds.push({ label: `${i.n} integration`, desc: i.desc, amount: i.p });
    }
  });
  AI_OPTIONS.forEach((a) => {
    if (w.ai?.[a.k]) {
      total += a.p;
      adds.push({ label: `${a.n} (AI)`, desc: a.tag, amount: a.p });
    }
  });
  if (w.logoUploaded || w.primaryColor !== "#0A2540") {
    total += 499;
    adds.push({
      label: "White-label branding",
      desc: "Your logo + colors",
      amount: 499,
    });
  }
  if (w.googleEarth) {
    total += 599;
    adds.push({
      label: "Google Earth visualization",
      desc: "Exec map of all facilities",
      amount: 599,
    });
  }

  return { plan: size.plan, adds, total };
}

// ── Steps ──────────────────────────────────────────────────────────────────────

function StepCompany({ w, u, showPwd, setShowPwd, subscriptions }) {
  const p = calcPricing(w);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <SH
          kicker="Organization type"
          title="Which one are you?"
          sub="This changes the roles shown, the equipment generated, and the default workflows."
        />
        {[
          ["core", "Core DC Roles"],
          ["specialist", "Specialist Contractors"],
          ["service", "Services"],
        ].map(([grp, label]) => (
          <div key={grp} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontFamily: C.mono,
                fontSize: "0.56rem",
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 6,
                marginTop: grp !== "core" ? 4 : 0,
              }}
            >
              {label}
            </div>
            <G cols={3} gap={8}>
              {COMPANY_TYPES.filter((t) => t.group === grp).map((t) => (
                <Card
                  key={t.id}
                  label={t.n}
                  desc={t.d}
                  selected={w.companyType === t.id}
                  onClick={() => u({ companyType: t.id })}
                />
              ))}
            </G>
          </div>
        ))}
      </div>
      <div>
        <SH
          kicker="Company name"
          title="What's your company called?"
          sub="Shown in your dashboard and on invites."
        />
        <FI
          label="Company name"
          type="text"
          placeholder="e.g., Acme Data Center Co"
          value={w.companyName}
          onChange={(e) => u({ companyName: e.target.value })}
        />
      </div>
      <div>
        <SH
          kicker="Company size"
          title="How big is your organization?"
          sub="This determines your pricing tier — about your company, not a single project."
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {subscriptions.map((s) => (
            <div
              key={s.id}
              onClick={() =>
                u({
                  companySize:
                    s.name === "BASIC"
                      ? "small"
                      : s?.name === "PRO"
                        ? "medium"
                        : "ent",
                  companyId: s?.id,
                })
              }
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                background: w.companyId === s.id ? C.selBg : C.card,
                border:
                  w.companyId === s.id
                    ? `1.5px solid ${C.sel}`
                    : `1px solid ${C.border}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: w.companyId === s.id ? C.accent : C.text,
                    fontFamily: C.sans,
                  }}
                >
                  {s.displayName}
                </div>
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: C.muted,
                    fontFamily: C.mono,
                    marginTop: 2,
                  }}
                >
                  1-{s.userLimit || "2500+"} people
                </div>
              </div>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: "0.7rem",
                  color: w.companyId === s.id ? C.accent : C.muted,
                }}
              >
                {s.displayName}
              </div>
            </div>
          ))}
        </div>
        <Callout color="amber" title={`Your plan: ${p.plan}`}>
          All other add-ons are optional and priced separately.
        </Callout>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            fontFamily: C.mono,
            fontSize: "0.56rem",
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 4,
          }}
        >
          Create your account
        </div>
        <div
          style={{
            fontFamily: C.sans,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: C.text,
            marginBottom: 14,
          }}
        >
          You'll be the Admin for your organization.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FI
            label="Company email"
            type="email"
            placeholder="info@company.com"
            value={w.companyEmail}
            onChange={(e) => u({ companyEmail: e.target.value })}
          />
          <G cols={2} gap={10}>
            <FI
              label="First name"
              type="text"
              placeholder="First name"
              value={w.adminFirstName}
              onChange={(e) => u({ adminFirstName: e.target.value })}
            />
            <FI
              label="Last name"
              type="text"
              placeholder="Last name"
              value={w.adminLastName}
              onChange={(e) => u({ adminLastName: e.target.value })}
            />
          </G>
          <FI
            label="Admin email - this email will be used as a login email to the board"
            type="email"
            placeholder="you@company.com"
            value={w.adminEmail}
            onChange={(e) => u({ adminEmail: e.target.value })}
          />
          <div style={{ position: "relative" }}>
            <label style={lStyle}>Password</label>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Create a strong password"
              value={w.adminPassword}
              onChange={(e) => u({ adminPassword: e.target.value })}
              style={{ ...iBase, paddingRight: 42 }}
              onFocus={(e) => {
                e.target.style.borderColor = C.accent;
                e.target.style.boxShadow = "0 0 0 2px rgba(0,200,255,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((p) => !p)}
              style={{
                position: "absolute",
                right: 11,
                top: "calc(100% - 27px)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--rf-txt2)",
                padding: 0,
              }}
            >
              {showPwd ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepScope({ w, u }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Callout color="amber" title="Admin-only settings">
        Only Super Admins and Management can change these. They affect every
        future project your company creates.
      </Callout>
      <div>
        <SH
          kicker="Scope"
          title="Do you manage multiple data centers?"
          sub="If yes, portfolio-wide features turn on — cross-site reporting, shared templates, multi-site dashboards."
        />
        <G cols={2} gap={8}>
          <Card
            label="Single Data Center"
            desc="One facility, one project at a time"
            selected={!w.multiDC}
            onClick={() => u({ multiDC: false })}
          />
          <Card
            label="Multiple Data Centers"
            desc="Portfolio across regions"
            selected={w.multiDC}
            onClick={() => u({ multiDC: true })}
          />
        </G>
      </div>
      {w.multiDC && (
        <div>
          <SH
            kicker="Default behavior"
            title="Connect partners on every new project?"
            sub="Recommended for multi-DC teams that collaborate with GCs, OEMs, trades, and Cx agents on every project."
          />
          <Toggle
            on={w.defaultConnected}
            onToggle={() => u({ defaultConnected: !w.defaultConnected })}
            label="Yes, link partners on every new project automatically"
            sub="Recommended for multi-DC teams · adds $1,499/mo at Professional tier"
          />
        </div>
      )}
    </div>
  );
}

function StepFacility({ w, u }) {
  const grp = (kicker, title, opts, key, cols = 3) => (
    <div style={{ marginBottom: 20 }}>
      <SH kicker={kicker} title={title} />
      <G cols={cols} gap={8}>
        {opts.map((t) => (
          <Card
            key={t.id}
            label={t.n}
            desc={t.d}
            tech={t.tech}
            selected={w[key] === t.id}
            onClick={() => u({ [key]: t.id })}
          />
        ))}
      </G>
    </div>
  );
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <SH kicker="Facility name" title="What is this facility called?" />
        <FI
          label="Facility name"
          type="text"
          placeholder="e.g., Phoenix DC-1, Austin Campus A"
          value={w.facilityName}
          onChange={(e) => u({ facilityName: e.target.value })}
        />
      </div>
      {grp(
        "Purpose · 12 types",
        "What will your data center do?",
        DC_TYPES,
        "dcType",
        3,
      )}
      {grp("Uptime", "How important is uptime?", UPTIME_TIERS, "uptime", 2)}
      {grp("Scale", "How big is the facility?", FACILITY_SCALES, "scale", 2)}
      {grp("Cooling", "How will you cool it?", COOLING_METHODS, "cooling", 2)}
      {grp("Power", "How much backup power?", POWER_ARCHS, "power", 2)}
    </div>
  );
}

function StepEquipment({ w, u }) {
  const setProc = (abbr, proc) =>
    u({
      equipment: w.equipment.map((e) => (e.abbr === abbr ? { ...e, proc } : e)),
    });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          background: "rgba(109,40,217,0.07)",
          border: "1px solid rgba(109,40,217,0.2)",
          borderRadius: 8,
          padding: "11px 14px",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 600,
            color: "#a78bfa",
            fontFamily: C.mono,
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Why this step matters for 6 different roles
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            fontSize: "0.62rem",
            color: "#7c6bba",
          }}
        >
          {[
            "QA/QC + Cx agent auto-generate checklists",
            "PMs see lead times, OFCI/CFCI",
            "Trades know install expectations",
            "Customer gets full visibility",
            "Finance splits costs by source",
            "Legal knows warranty holder",
          ].map((t) => (
            <div key={t}>✓ {t}</div>
          ))}
        </div>
      </div>
      {w.equipment.map((e) => (
        <div
          key={e.abbr}
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "12px 14px",
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 500,
                color: C.text,
                fontFamily: C.sans,
              }}
            >
              {e.name}
            </div>
            <div
              style={{
                fontFamily: C.mono,
                fontSize: "0.6rem",
                color: C.muted,
                marginTop: 2,
              }}
            >
              {e.abbr} · {e.oem} · ×{e.qty} · {e.leadWeeks}wk lead
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["OFCI", "CFCI"].map((v) => (
              <button
                key={v}
                onClick={() => setProc(e.abbr, v)}
                style={{
                  padding: "5px 9px",
                  fontFamily: C.mono,
                  fontSize: "0.6rem",
                  borderRadius: 5,
                  border:
                    e.proc === v
                      ? "1px solid #00e5a0"
                      : `1px solid ${C.border}`,
                  background:
                    e.proc === v ? "rgba(0,229,160,0.1)" : "transparent",
                  color: e.proc === v ? "#00e5a0" : C.muted,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <div
            style={{
              fontFamily: C.mono,
              fontSize: "0.6rem",
              color: C.muted,
              textAlign: "right",
              minWidth: 88,
            }}
          >
            {e.proc === "OFCI" ? "Customer buys" : "Contractor buys"}
          </div>
        </div>
      ))}
      <div
        onClick={() => alert("Asset request submitted.")}
        style={{
          padding: "10px 14px",
          border: `2px dashed ${C.border}`,
          borderRadius: 8,
          fontSize: "0.7rem",
          color: C.muted,
          cursor: "pointer",
          textAlign: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = C.accent;
          e.currentTarget.style.color = C.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.color = C.muted;
        }}
      >
        + Request a new asset class we don't cover yet
      </div>
    </div>
  );
}

function StepPartners({ w, u }) {
  const combined = [
    ...DIRECTORY,
    ...w.customCompanies.map((c) => ({ ...c, custom: true })),
  ];
  const q = (w.partnerSearch || "").toLowerCase();
  const results = q
    ? combined
        .filter(
          (d) =>
            d.n.toLowerCase().includes(q) ||
            d.m.toLowerCase().includes(q) ||
            d.t.toLowerCase().includes(q),
        )
        .slice(0, 8)
    : combined.slice(0, 8);
  const toggleP = (name) =>
    u({
      selectedPartners: w.selectedPartners.includes(name)
        ? w.selectedPartners.filter((x) => x !== name)
        : [...w.selectedPartners, name],
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Callout
        color="cyan"
        title="Why CxControl beats Procore, CxAlloy, and P6"
      >
        No other platform lets Customer + GC + OEM + Trade + Cx Agent share the
        same live project data with scoped views.
      </Callout>
      <div>
        <SH kicker="Project mode" title="How will you run this project?" />
        <G cols={2} gap={10}>
          {[
            {
              id: "standalone",
              title: "Standalone Mode",
              sub: "Just you and your team",
              body: "Run the project privately. No partner invites, no cross-company sync.",
              badge: "Best if you're still pre-contract",
            },
            {
              id: "connected",
              title: "Connected Mode",
              sub: "Link partners on this project",
              body: "Invite your partners to see this one project. Everyone works on live scoped data.",
              badge: "Recommended · what makes CxControl unique",
            },
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => u({ mode: m.id })}
              style={{
                background: w.mode === m.id ? C.selBg : C.card,
                border:
                  w.mode === m.id
                    ? `1.5px solid ${C.sel}`
                    : `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  fontFamily: C.sans,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: w.mode === m.id ? C.accent : C.text,
                  marginBottom: 2,
                }}
              >
                {m.title}
              </div>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: "0.6rem",
                  color: C.muted,
                  marginBottom: 8,
                }}
              >
                {m.sub}
              </div>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: "0.63rem",
                  color: C.muted,
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                {m.body}
              </div>
              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background:
                    w.mode === m.id ? "rgba(0,200,255,0.1)" : "var(--rf-bg3)",
                  color: w.mode === m.id ? C.accent : C.muted,
                  fontFamily: C.mono,
                }}
              >
                {m.badge}
              </span>
            </div>
          ))}
        </G>
      </div>
      {w.mode === "connected" && (
        <div>
          <SH
            kicker="Your partners"
            title="Search the verified directory · or add your own"
            sub="Any partner you add appears in your project immediately."
          />
          <div style={{ position: "relative", marginBottom: 8 }}>
            <input
              style={{ ...iBase, paddingLeft: 36 }}
              placeholder="Search Turner, Shermco, Barnhart, HDR..."
              value={w.partnerSearch}
              onChange={(e) => u({ partnerSearch: e.target.value })}
              onFocus={(e) => {
                e.target.style.borderColor = C.accent;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
              }}
            />
            <svg
              style={{
                position: "absolute",
                left: 11,
                top: 12,
                color: C.muted,
              }}
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M11 11l3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            {results.length === 0 ? (
              <div
                style={{
                  padding: "10px 14px",
                  fontFamily: C.mono,
                  fontSize: "0.68rem",
                  color: C.muted,
                }}
              >
                No matches — try the add company button below
              </div>
            ) : (
              results.map((d) => {
                const sel = w.selectedPartners.includes(d.n);
                return (
                  <div
                    key={d.n}
                    onClick={() => toggleP(d.n)}
                    style={{
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer",
                      background: sel ? C.selBg : "transparent",
                      borderLeft: sel
                        ? `3px solid ${C.sel}`
                        : "3px solid transparent",
                      transition: "all 0.1s",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: sel ? C.accent : C.text,
                          fontFamily: C.sans,
                        }}
                      >
                        {d.n}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: C.muted,
                          fontFamily: C.mono,
                          marginTop: 1,
                        }}
                      >
                        {d.t} · {d.m}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: C.mono,
                        fontSize: "0.56rem",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontWeight: 500,
                        background: d.custom
                          ? "rgba(255,180,0,0.1)"
                          : "rgba(0,229,160,0.1)",
                        color: d.custom ? "#ffcc00" : "#00e5a0",
                      }}
                    >
                      {d.custom ? "PENDING" : "VERIFIED"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div
            onClick={() => u({ showAddForm: !w.showAddForm })}
            style={{
              padding: "9px 14px",
              border: `2px dashed ${C.border}`,
              borderRadius: 8,
              fontSize: "0.7rem",
              color: C.muted,
              cursor: "pointer",
              textAlign: "center",
              marginBottom: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.accent;
              e.currentTarget.style.color = C.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.muted;
            }}
          >
            + Add a company not in our directory
          </div>
          {w.showAddForm && (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.sel}`,
                borderRadius: 10,
                padding: 16,
                display: "grid",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontFamily: C.sans,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: C.text,
                }}
              >
                Add a new company
              </div>
              <FI
                label="Company name"
                type="text"
                placeholder="e.g., Lone Star Rigging Co"
                value={w.newCompanyName}
                onChange={(e) => u({ newCompanyName: e.target.value })}
              />
              <div>
                <label style={lStyle}>Type</label>
                <select
                  value={w.newCompanyType}
                  onChange={(e) => u({ newCompanyType: e.target.value })}
                  style={{ ...iBase, appearance: "none" }}
                >
                  {[
                    "GC",
                    "OEM",
                    "TRADE",
                    "CXA",
                    "RIG",
                    "ARCH",
                    "BLD",
                    "SEC",
                    "FIRE",
                    "STAFF",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <FI
                label="Short description"
                type="text"
                placeholder="e.g., Heavy rigging, Texas-based"
                value={w.newCompanyMeta}
                onChange={(e) => u({ newCompanyMeta: e.target.value })}
              />
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button
                  onClick={() =>
                    u({
                      showAddForm: false,
                      newCompanyName: "",
                      newCompanyMeta: "",
                    })
                  }
                  style={{
                    padding: "7px 13px",
                    borderRadius: 7,
                    border: `1px solid ${C.border}`,
                    background: "transparent",
                    color: C.text,
                    fontFamily: C.mono,
                    fontSize: "0.62rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!w.newCompanyName.trim()) return;
                    const c = {
                      n: w.newCompanyName.trim(),
                      t: w.newCompanyType,
                      m:
                        w.newCompanyMeta.trim() ||
                        "Added by you · pending verification",
                      custom: true,
                    };
                    u({
                      customCompanies: [...w.customCompanies, c],
                      selectedPartners: [...w.selectedPartners, c.n],
                      newCompanyName: "",
                      newCompanyMeta: "",
                      showAddForm: false,
                    });
                  }}
                  style={{
                    padding: "7px 13px",
                    borderRadius: 7,
                    border: "none",
                    background: C.accent,
                    color: "#020d16",
                    fontFamily: C.mono,
                    fontSize: "0.62rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Add to Project
                </button>
              </div>
              <Callout color="amber" title="Verification workflow">
                Added companies are private to your project immediately.
                Searchable after admin verification (usually 2 business days).
              </Callout>
            </div>
          )}
          {w.selectedPartners.length > 0 && (
            <div className="mb-3">
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: "0.56rem",
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 7,
                }}
              >
                Selected for this project · {w.selectedPartners.length}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {w.selectedPartners.map((name) => {
                  const d = combined.find((c) => c.n === name) || {
                    t: "?",
                    custom: false,
                  };
                  return (
                    <div
                      key={name}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        padding: "4px 10px",
                        borderRadius: 20,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          color: C.text,
                          fontFamily: C.sans,
                        }}
                      >
                        {name}
                      </span>
                      <span
                        style={{
                          fontFamily: C.mono,
                          fontSize: "0.54rem",
                          padding: "1px 5px",
                          borderRadius: 3,
                          background: d.custom
                            ? "rgba(255,180,0,0.1)"
                            : "rgba(0,229,160,0.1)",
                          color: d.custom ? "#ffcc00" : "#00e5a0",
                        }}
                      >
                        {d.t}
                      </span>
                      <button
                        onClick={() =>
                          u({
                            selectedPartners: w.selectedPartners.filter(
                              (x) => x !== name,
                            ),
                          })
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: C.muted,
                          fontSize: 13,
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Callout
            color="amber"
            title="Partners are invited now — but can't act until you kick off"
          >
            When you send invites, partners can create accounts and browse.
            Tasks can't be closed until you hit "Kickoff Project".
          </Callout>
        </div>
      )}
    </div>
  );
}

function StepStaffing({ w, u }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Callout
        color="teal"
        title="NEW · Staffing marketplace bridges the DC labor shortage"
      >
        DC construction faces a massive skilled-labor shortage. CxControl
        connects you to DC-focused staffing agencies with real-time
        availability.
      </Callout>
      <Toggle
        on={w.useStaffing}
        onToggle={() => u({ useStaffing: !w.useStaffing })}
        label="Enable the staffing marketplace"
        sub="Optional add-on · $399/mo · access to 50+ DC-focused agencies"
      />
      {w.useStaffing && (
        <div>
          <SH
            kicker="Available agencies"
            title="Pick the agencies you want access to"
            sub="Multi-select. You can request resources from any selected agency after launch."
          />
          {STAFFING_AGENCIES.map((a) => {
            const sel = w.selectedAgencies.includes(a.n);
            return (
              <div
                key={a.n}
                onClick={() =>
                  u({
                    selectedAgencies: sel
                      ? w.selectedAgencies.filter((x) => x !== a.n)
                      : [...w.selectedAgencies, a.n],
                  })
                }
                style={{
                  background: sel ? C.selBg : C.card,
                  border: sel
                    ? `1.5px solid ${C.sel}`
                    : `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 8,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        color: sel ? C.accent : C.text,
                        fontFamily: C.sans,
                      }}
                    >
                      {a.n}
                    </div>
                    <div
                      style={{
                        fontFamily: C.mono,
                        fontSize: "0.6rem",
                        color: C.muted,
                        marginTop: 2,
                      }}
                    >
                      {a.loc} · {a.count}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: C.mono,
                      fontSize: "0.56rem",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 500,
                      background: "rgba(255,200,0,0.08)",
                      color: "#ffcc00",
                      border: "1px solid rgba(255,200,0,0.18)",
                    }}
                  >
                    DC-FOCUSED
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {a.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: "0.6rem",
                        padding: "2px 7px",
                        background: sel
                          ? "rgba(0,200,255,0.08)"
                          : "rgba(0,10,20,0.4)",
                        color: sel ? C.accent : C.muted,
                        borderRadius: 4,
                        fontFamily: C.mono,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          <div
            style={{
              padding: "9px 14px",
              border: `2px dashed ${C.border}`,
              borderRadius: 8,
              fontSize: "0.7rem",
              color: C.muted,
              cursor: "pointer",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.accent;
              e.currentTarget.style.color = C.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.muted;
            }}
          >
            + Invite a staffing agency not listed here
          </div>
        </div>
      )}
    </div>
  );
}

function StepTeam({ w, u, apiRoles, roleQtys, setRoleQtys }) {
  const labels = {
    customer: "Customer",
    gc: "General Contractor",
    oem: "OEM",
    trade: "Trade",
    cxa: "Cx Agent",
    rig: "Rigging",
    arch: "Architecture",
    bld: "Builder",
    sec: "Security",
    fire: "Fire Alarm",
    staff: "Staffing Agency",
  };

  const useApi = apiRoles && apiRoles.length > 0;

  const setQtyApi = (roleId, delta) =>
    setRoleQtys((prev) => ({
      ...prev,
      [roleId]: Math.max(0, (prev[roleId] ?? 1) + delta),
    }));

  const setQtyLocal = (i, d) =>
    u({
      team: w.team.map((r, idx) =>
        idx === i ? { ...r, qty: Math.max(0, r.qty + d) } : r,
      ),
    });

  const total = useApi
    ? Object.values(roleQtys).reduce((s, q) => s + q, 0)
    : (w.team || []).reduce((s, r) => s + r.qty, 0);
  const ts = {
    P: {
      bg: "rgba(255,200,0,0.08)",
      color: "#ffcc00",
      bdr: "rgba(255,200,0,0.18)",
      label: "PREMIUM",
    },
    S: {
      bg: "rgba(109,40,217,0.08)",
      color: "#a78bfa",
      bdr: "rgba(109,40,217,0.2)",
      label: "STANDARD",
    },
    F: {
      bg: "rgba(15,110,86,0.08)",
      color: "#34d399",
      bdr: "rgba(15,110,86,0.2)",
      label: "FIELD",
    },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Callout
        color="amber"
        title={`Showing: ${labels[w.companyType] || "Customer"} roles`}
      >
        Auto-matched to your company type from Step 1. Adjust quantities freely.
      </Callout>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {useApi
          ? apiRoles.map((r, i) => {
              const roleId = r.roleKey || r.id || String(i);
              const qty = roleQtys[roleId] ?? r.defaultQty ?? 1;
              return (
                <div
                  key={roleId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 14px",
                    borderBottom:
                      i < apiRoles.length - 1
                        ? `1px solid ${C.border}`
                        : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 500,
                        color: C.text,
                        fontFamily: C.sans,
                      }}
                    >
                      {r.name || r.roleName || r.title || roleId}
                    </div>
                    {r.description && (
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: C.muted,
                          fontFamily: C.mono,
                          marginTop: 1,
                        }}
                      >
                        {r.description}
                      </div>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", gap: 4, alignItems: "center" }}
                  >
                    <button
                      onClick={() => setQtyApi(roleId, -1)}
                      style={{
                        width: 22,
                        height: 22,
                        border: `1px solid ${C.border}`,
                        background: "transparent",
                        borderRadius: 5,
                        fontSize: 12,
                        cursor: "pointer",
                        color: C.text,
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: C.mono,
                        fontSize: "0.75rem",
                        color: C.text,
                        fontWeight: 500,
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => setQtyApi(roleId, 1)}
                      style={{
                        width: 22,
                        height: 22,
                        border: `1px solid ${C.border}`,
                        background: "transparent",
                        borderRadius: 5,
                        fontSize: 12,
                        cursor: "pointer",
                        color: C.text,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          : (w.team || []).map((r, i) => {
              const t = ts[r.tier];
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 14px",
                    borderBottom:
                      i < (w.team || []).length - 1
                        ? `1px solid ${C.border}`
                        : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 500,
                        color: C.text,
                        fontFamily: C.sans,
                      }}
                    >
                      {r.n}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        color: C.muted,
                        fontFamily: C.mono,
                        marginTop: 1,
                      }}
                    >
                      {r.d}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: C.mono,
                      fontSize: "0.54rem",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 500,
                      background: t.bg,
                      color: t.color,
                      border: `1px solid ${t.bdr}`,
                    }}
                  >
                    {t.label}
                  </span>
                  <div
                    style={{ display: "flex", gap: 4, alignItems: "center" }}
                  >
                    <button
                      onClick={() => setQtyLocal(i, -1)}
                      style={{
                        width: 22,
                        height: 22,
                        border: `1px solid ${C.border}`,
                        background: "transparent",
                        borderRadius: 5,
                        fontSize: 12,
                        cursor: "pointer",
                        color: C.text,
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: C.mono,
                        fontSize: "0.75rem",
                        color: C.text,
                        fontWeight: 500,
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {r.qty}
                    </span>
                    <button
                      onClick={() => setQtyLocal(i, 1)}
                      style={{
                        width: 22,
                        height: 22,
                        border: `1px solid ${C.border}`,
                        background: "transparent",
                        borderRadius: 5,
                        fontSize: 12,
                        cursor: "pointer",
                        color: C.text,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {[
          { l: "Total", v: total },
          {
            l: "Premium",
            v: useApi
              ? 0
              : (w.team || [])
                  .filter((r) => r.tier === "P")
                  .reduce((s, r) => s + r.qty, 0),
          },
          {
            l: "Standard",
            v: useApi
              ? 0
              : (w.team || [])
                  .filter((r) => r.tier === "S")
                  .reduce((s, r) => s + r.qty, 0),
          },
          {
            l: "Field",
            v: useApi
              ? 0
              : (w.team || [])
                  .filter((r) => r.tier === "F")
                  .reduce((s, r) => s + r.qty, 0),
          },
        ].map((b) => (
          <div
            key={b.l}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "11px 13px",
            }}
          >
            <div
              style={{
                fontFamily: C.mono,
                fontSize: "0.54rem",
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 3,
              }}
            >
              {b.l}
            </div>
            <div
              style={{
                fontFamily: C.mono,
                fontSize: "1.1rem",
                fontWeight: 600,
                color: C.accent,
              }}
            >
              {b.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIntegrate({ w, u }) {
  const intAmt = INTEGRATIONS.reduce(
    (s, i) => (w.integrations?.[i.k] ? s + i.p : s),
    0,
  );
  const aiAmt = AI_OPTIONS.reduce((s, a) => (w.ai?.[a.k] ? s + a.p : s), 0);
  const total = intAmt + aiAmt;
  const count =
    Object.values(w.integrations || {}).filter(Boolean).length +
    Object.values(w.ai || {}).filter(Boolean).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <SH
          kicker="Construction & Cx platforms"
          title="Connect what you already use"
          sub="Keep your existing tools. We sync the DC-specific data so nothing lives in two places."
        />
        <G cols={3} gap={8}>
          {INTEGRATIONS.map((i) => {
            const sel = w.integrations?.[i.k];
            return (
              <div
                key={i.k}
                onClick={() =>
                  u({ integrations: { ...w.integrations, [i.k]: !sel } })
                }
                style={{
                  background: sel ? C.selBg : C.card,
                  border: sel
                    ? `1.5px solid ${C.sel}`
                    : `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: i.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontFamily: C.mono,
                      fontWeight: 500,
                      fontSize: "0.6rem",
                      flexShrink: 0,
                    }}
                  >
                    {i.letters}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      color: sel ? C.accent : C.text,
                      fontFamily: C.sans,
                    }}
                  >
                    {i.n}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: C.muted,
                    fontFamily: C.mono,
                    lineHeight: 1.4,
                    marginBottom: 5,
                  }}
                >
                  {i.desc}
                </div>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: sel ? C.accent : "var(--rf-txt2)",
                  }}
                >
                  +${i.p}/mo
                </div>
              </div>
            );
          })}
        </G>
      </div>
      <div>
        <SH
          kicker="AI providers"
          title="Pick your AI — multi-select OK"
          sub="Each can auto-write checklists, summarize standups, and predict schedule slips."
        />
        <G cols={2} gap={8}>
          {AI_OPTIONS.map((a) => {
            const sel = w.ai?.[a.k];
            return (
              <div
                key={a.k}
                onClick={() => u({ ai: { ...w.ai, [a.k]: !sel } })}
                style={{
                  background: sel ? C.selBg : C.card,
                  border: sel
                    ? `1.5px solid ${C.sel}`
                    : `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: a.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        color: sel ? C.accent : C.text,
                        fontFamily: C.sans,
                      }}
                    >
                      {a.n}
                    </div>
                    <div
                      style={{
                        fontFamily: C.mono,
                        fontSize: "0.58rem",
                        color: C.muted,
                      }}
                    >
                      {a.tag}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: C.muted,
                    fontFamily: C.mono,
                    lineHeight: 1.4,
                    marginBottom: 7,
                  }}
                >
                  {a.desc}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 6,
                    borderTop: `1px dashed ${C.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "#00e5a0",
                      fontWeight: 500,
                      fontFamily: C.mono,
                    }}
                  >
                    Best for {a.bestFor}
                  </span>
                  <span
                    style={{
                      fontFamily: C.mono,
                      fontSize: "0.65rem",
                      color: sel ? C.accent : "var(--rf-txt2)",
                      fontWeight: 600,
                    }}
                  >
                    +${a.p}/mo
                  </span>
                </div>
              </div>
            );
          })}
        </G>
      </div>
      <div
        style={{
          background: "rgba(0,200,255,0.05)",
          border: "1px solid rgba(0,200,255,0.15)",
          borderRadius: 8,
          padding: "13px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: C.sans,
              fontSize: "0.76rem",
              fontWeight: 500,
              color: C.text,
            }}
          >
            Add-ons from this step
          </div>
          <div
            style={{
              fontFamily: C.mono,
              fontSize: "0.6rem",
              color: C.muted,
              marginTop: 2,
            }}
          >
            {count} selected · rolls into final total on Review
          </div>
        </div>
        <div
          style={{
            fontFamily: C.mono,
            fontSize: "1.3rem",
            fontWeight: 700,
            color: C.accent,
          }}
        >
          ${total.toLocaleString()}
          <span style={{ fontSize: "0.6rem", color: C.muted }}>/mo</span>
        </div>
      </div>
    </div>
  );
}

function StepBrand({ w, u, sessionId }) {
  const initials = (w.companyName || "Cx").substring(0, 2).toUpperCase();
  const fileInputRef = useRef(null);
  const [uploadStep, setUploadStep] = useState("idle"); // idle | requesting | uploading | confirming
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target?.files?.[0] ?? e;
    if (!file) return;

    setUploadError("");
    setUploadProgress(0);
    setUploadStep("requesting");

    try {
      // Use sessionId from parent component
      let sid = sessionId;
      if (!sid) {
        try {
          sid = sessionStorage.getItem("cxcontrol_session_id");
        } catch {}
      }
      if (!sid) {
        const session = await createOnboardingSession(
          w.companyName || "My Company",
        );
        sid = session.sessionId;
        try {
          sessionStorage.setItem("cxcontrol_session_id", sid);
        } catch {}
      }

      // Get presigned S3 PUT URL
      const { uploadUrl, fileUrl, s3Key } = await getOnboardingUploadUrl({
        sessionId: sid,
        fileName: file.name,
        fileType: file.type,
        assetType: "logo",
        fileSize: file.size,
      });

      // Step 3 — upload file directly to S3
      setUploadStep("uploading");
      await putFileToS3(uploadUrl, file, (pct) => setUploadProgress(pct));

      // Step 4 — confirm upload with the backend
      setUploadStep("confirming");
      await confirmOnboardingUpload(sessionId, s3Key);

      u({
        logoUrl: fileUrl,
        logoUploaded: true,
        logoFileName: file.name,
        logoFileSize: `${(file.size / 1024).toFixed(0)} KB`,
      });
    } catch (err) {
      setUploadError(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploadStep("idle");
      setUploadProgress(0);
    }
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();
    u({
      logoUrl: "",
      logoUploaded: false,
      logoFileName: "",
      logoFileSize: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadError("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <SH
          kicker="Logo"
          title="Upload your company logo"
          sub="Shown top-left in CxControl for every user on your team."
        />
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {/* Upload progress bar */}
        {uploadStep !== "idle" && (
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontFamily: C.mono,
                  fontSize: "0.62rem",
                  color: C.accent,
                }}
              >
                {uploadStep === "requesting" && "Requesting upload URL…"}
                {uploadStep === "uploading" && `Uploading… ${uploadProgress}%`}
                {uploadStep === "confirming" && "Confirming upload…"}
              </span>
              <span
                style={{
                  fontFamily: C.mono,
                  fontSize: "0.6rem",
                  color: C.muted,
                }}
              >
                {uploadStep === "uploading" && `${uploadProgress}%`}
              </span>
            </div>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: "var(--rf-bg4)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  background: C.accent,
                  width:
                    uploadStep === "requesting"
                      ? "15%"
                      : uploadStep === "uploading"
                        ? `${uploadProgress}%`
                        : "90%",
                  transition: "width 0.2s",
                }}
              />
            </div>
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              marginBottom: 8,
              fontFamily: C.mono,
              fontSize: "0.65rem",
              background: "rgba(255,68,85,0.1)",
              color: "#ff4455",
              border: "1px solid rgba(255,68,85,0.3)",
            }}
          >
            {uploadError}
          </div>
        )}

        {/* Drop zone / trigger */}
        <div
          onClick={() =>
            uploadStep === "idle" &&
            !w.logoUploaded &&
            fileInputRef.current?.click()
          }
          style={{
            padding: 22,
            border: `2px dashed ${w.logoUploaded ? C.accent : uploadStep !== "idle" ? "var(--rf-accent2)" : C.border}`,
            borderRadius: 10,
            textAlign: "center",
            background: w.logoUploaded
              ? C.selBg
              : uploadStep !== "idle"
                ? "rgba(0,200,255,0.04)"
                : "transparent",
            cursor:
              w.logoUploaded || uploadStep !== "idle" ? "default" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!w.logoUploaded && uploadStep === "idle")
              e.currentTarget.style.borderColor = C.accent;
          }}
          onMouseLeave={(e) => {
            if (!w.logoUploaded && uploadStep === "idle")
              e.currentTarget.style.borderColor = C.border;
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && uploadStep === "idle") handleFileChange(file);
          }}
        >
          {w.logoUploaded ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              {w.logoUrl && !w.logoUrl.startsWith("data:") ? (
                <img
                  src={w.logoUrl}
                  alt="Logo preview"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    objectFit: "contain",
                    background: "var(--rf-bg3)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: w.primaryColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    fontFamily: C.sans,
                  }}
                >
                  {initials}
                </div>
              )}
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 500,
                    color: C.text,
                    fontFamily: C.sans,
                  }}
                >
                  {w.logoFileName || w.companyName || "Your company"}
                </div>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: "0.58rem",
                    color: C.muted,
                  }}
                >
                  {w.logoFileSize && `${w.logoFileSize} · `}
                  <span
                    style={{ color: "#ff4455", cursor: "pointer" }}
                    onClick={handleRemoveLogo}
                  >
                    remove
                  </span>
                  {" · "}
                  <span
                    style={{ color: C.accent, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    replace
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: "0.76rem",
                  color: C.muted,
                  fontFamily: C.mono,
                }}
              >
                Drop your logo here or{" "}
                <span style={{ color: C.accent }}>click to upload</span>
              </div>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: "0.6rem",
                  color: C.muted,
                  marginTop: 4,
                }}
              >
                PNG, SVG, JPG, WEBP · under 2 MB
              </div>
            </>
          )}
        </div>
      </div>
      <div>
        <SH
          kicker="Brand color"
          title="Pick your brand color"
          sub="Used throughout buttons, highlights, and headers across the platform."
        />
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          {BRAND_COLORS.map((c) => (
            <div
              key={c}
              onClick={() => u({ primaryColor: c })}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: c,
                cursor: "pointer",
                border:
                  w.primaryColor === c
                    ? `3px solid ${C.accent}`
                    : "3px solid transparent",
                transform: w.primaryColor === c ? "scale(1.12)" : "scale(1)",
                transition: "all 0.15s",
              }}
            />
          ))}
        </div>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "13px 17px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 7,
                background: w.primaryColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: 12,
                fontFamily: C.sans,
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  color: C.text,
                  fontFamily: C.sans,
                }}
              >
                {w.companyName || "Your Company"}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: C.muted,
                  fontFamily: C.mono,
                  marginTop: 1,
                }}
              >
                {w.companyType === "customer"
                  ? "Data Center Director"
                  : "Project Manager"}{" "}
                view
              </div>
            </div>
          </div>
          <div
            style={{
              padding: 15,
              background: "rgba(0,10,20,0.3)",
              fontFamily: C.mono,
              fontSize: "0.7rem",
              color: C.muted,
              lineHeight: 1.55,
            }}
          >
            Welcome back. You have{" "}
            <span style={{ color: C.text, fontWeight: 500 }}>
              12 active projects
            </span>{" "}
            across{" "}
            <span style={{ color: C.text, fontWeight: 500 }}>4 regions</span>.{" "}
            <span style={{ fontWeight: 500, color: w.primaryColor }}>
              View your dashboard →
            </span>
          </div>
        </div>
      </div>
      <div>
        <SH
          kicker="Geographic"
          title="Google Earth visualization · add-on"
          sub="Executive dashboard shows every facility on a live map with real-time status. Perfect for multi-DC portfolios."
        />
        <Toggle
          on={w.googleEarth}
          onToggle={() => u({ googleEarth: !w.googleEarth })}
          label="Enable geographic visualization"
          sub="+$599/mo · every facility on a live Google Earth map for execs"
        />
      </div>
    </div>
  );
}

function StepReview({ w, u, showPwd, setShowPwd, apiReview }) {
  const local = calcPricing(w);
  const p = apiReview
    ? {
        plan: apiReview.plan || local.plan,
        adds: (apiReview.addons || []).map((a) => ({
          label: a.label,
          desc: a.desc,
          amount: a.amount,
        })),
        total: apiReview.addonsTotal ?? local.total,
      }
    : local;
  const typeL = {
    customer: "Customer",
    gc: "GC",
    oem: "OEM",
    trade: "Trade",
    cxa: "Cx Agent",
    rig: "Rigging",
    arch: "Architecture",
    bld: "Builder",
    sec: "Security",
    fire: "Fire Alarm",
    staff: "Staffing",
  };
  const dcL = {
    ai: "AI",
    hyp: "Hyperscale",
    colo: "Colo",
    ent: "Enterprise",
    edg: "Edge",
    hpc: "HPC",
    cry: "Crypto",
    gov: "Gov/DOD",
    bro: "Broadcast",
    res: "Research",
    mod: "Modular",
    fin: "Financial",
  };
  const sb = {
    small: { p: 700, p6: 500, a: 800, cx: 900, h: 400, d: 500 },
    med: { p: 2500, p6: 1800, a: 2200, cx: 2800, h: 1500, d: 1800 },
    medium: { p: 8000, p6: 6000, a: 7500, cx: 9000, h: 3500, d: 5500 },
    ent: { p: 20000, p6: 15000, a: 18000, cx: 22000, h: 8000, d: 12000 },
  }[w.companySize] || {
    p: 8000,
    p6: 6000,
    a: 7500,
    cx: 9000,
    h: 3500,
    d: 5500,
  };
  const comps = [
    { n: "Procore", v: sb.p, c: "#F27B35" },
    { n: "Oracle P6", v: sb.p6, c: "#C14B2E" },
    { n: "Autodesk ACC", v: sb.a, c: "#555" },
    { n: "CxAlloy", v: sb.cx, c: "#D4537E" },
    { n: "HammerTech", v: sb.h, c: "#BA7517" },
    { n: "Sunbird DCIM", v: sb.d, c: "#7C3AED" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(0,30,70,0.8) 0%, rgba(0,10,30,0.95) 100%)",
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 22,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: C.mono,
            fontSize: "0.6rem",
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 6,
          }}
        >
          What you're buying
        </div>
        <div
          style={{
            fontFamily: C.sans,
            fontSize: "1.2rem",
            fontWeight: 700,
            color: C.text,
            marginBottom: 5,
            lineHeight: 1.2,
          }}
        >
          The only ERP built specifically for{" "}
          <span style={{ color: C.accent }}>data center commissioning</span>
        </div>
        <div
          style={{
            fontSize: "0.68rem",
            color: C.muted,
            fontFamily: C.mono,
            maxWidth: 460,
            margin: "0 auto",
          }}
        >
          Not a CRM. Not a project tool. Not a checklist app. A full operating
          system bridging all DC stakeholders.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {[
          { l: "Company", v: typeL[w.companyType] || "?" },
          { l: "Facility", v: dcL[w.dcType] || "?" },
          { l: "Mode", v: w.mode === "connected" ? "Connected" : "Standalone" },
          {
            l: "Team size",
            v: String(w.team?.reduce((s, r) => s + r.qty, 0) || 0),
          },
        ].map((b) => (
          <div
            key={b.l}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "11px 13px",
            }}
          >
            <div
              style={{
                fontFamily: C.mono,
                fontSize: "0.54rem",
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 3,
              }}
            >
              {b.l}
            </div>
            <div
              style={{
                fontFamily: C.mono,
                fontSize: "0.88rem",
                fontWeight: 500,
                color: C.text,
              }}
            >
              {b.v}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            fontFamily: C.sans,
            fontSize: "0.86rem",
            fontWeight: 600,
            color: C.text,
            marginBottom: 3,
          }}
        >
          One platform vs the fragmented stack
        </div>
        <div
          style={{
            fontSize: "0.62rem",
            color: C.muted,
            fontFamily: C.mono,
            marginBottom: 12,
          }}
        >
          Replace multiple tools with a single ERP built for DC commissioning.
        </div>
        {comps.map((b) => (
          <div
            key={b.n}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 66px",
              gap: 8,
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                color: C.muted,
                fontFamily: C.mono,
              }}
            >
              {b.n}
            </div>
            <div
              style={{
                height: 18,
                background: "rgba(0,20,40,0.6)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", height: "100%", background: b.c }} />
            </div>
          </div>
        ))}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            marginTop: 6,
            paddingTop: 6,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 8,
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                color: C.accent,
                fontFamily: C.mono,
                fontWeight: 500,
              }}
            >
              CxControl
            </div>
            <div
              style={{
                height: 18,
                background: "rgba(0,20,40,0.6)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{ width: "35%", height: "100%", background: C.accent }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "4px 10px",
            background: "rgba(0,229,160,0.08)",
            color: "#00e5a0",
            borderRadius: 20,
            fontFamily: C.mono,
            fontSize: "0.62rem",
            fontWeight: 500,
            border: "1px solid rgba(0,229,160,0.18)",
          }}
        >
          ✓ ONE PLATFORM · REPLACE THE ENTIRE STACK
        </div>
      </div>

      <div
        style={{
          background: C.card,
          border: `1.5px solid ${C.sel}`,
          borderRadius: 12,
          padding: "20px 22px",
        }}
      >
        <div
          style={{
            fontFamily: C.mono,
            fontSize: "0.6rem",
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 6,
          }}
        >
          Your plan summary
        </div>
        <div
          style={{
            fontFamily: C.sans,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: C.text,
            marginBottom: 3,
          }}
        >
          {p.plan}
        </div>
        <div
          style={{
            fontFamily: C.mono,
            fontSize: "0.62rem",
            color: C.muted,
            marginBottom: 14,
            paddingBottom: 14,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          Core platform · unlimited projects · contact sales for pricing
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            paddingBottom: 7,
            borderBottom: `1px solid ${C.border}`,
            marginBottom: 7,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: C.sans,
                fontSize: "0.73rem",
                fontWeight: 500,
                color: C.text,
              }}
            >
              {p.plan} base plan
            </div>
            <div
              style={{ fontFamily: C.mono, fontSize: "0.6rem", color: C.muted }}
            >
              Core platform · unlimited projects
            </div>
          </div>
          <div
            style={{
              fontFamily: C.mono,
              fontSize: "0.7rem",
              color: C.muted,
              fontStyle: "italic",
            }}
          >
            Contact sales
          </div>
        </div>
        {p.adds.length > 0 && (
          <>
            <div
              style={{
                fontFamily: C.mono,
                fontSize: "0.56rem",
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 7,
              }}
            >
              Selected add-ons
            </div>
            {p.adds.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                  paddingBottom: 6,
                  borderBottom: `1px solid ${C.border}`,
                  marginBottom: 6,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: C.sans,
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      color: C.text,
                    }}
                  >
                    {a.label}
                  </div>
                  <div
                    style={{
                      fontFamily: C.mono,
                      fontSize: "0.58rem",
                      color: C.muted,
                    }}
                  >
                    {a.desc}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  +${a.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: 12,
            marginTop: 6,
            borderTop: `2px solid ${C.sel}`,
          }}
        >
          <div
            style={{
              fontFamily: C.sans,
              fontSize: "0.8rem",
              fontWeight: 500,
              color: C.text,
            }}
          >
            Add-ons total
          </div>
          <div
            style={{
              fontFamily: C.sans,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: C.accent,
            }}
          >
            {p.total > 0 ? `$${p.total.toLocaleString()}/mo` : "—"}
          </div>
        </div>
      </div>

      <div
        style={{
          fontFamily: C.mono,
          fontSize: "0.6rem",
          color: C.muted,
          textAlign: "center",
        }}
      >
        NO PER-SEAT · NO PER-PROJECT · NO HIDDEN FEES · CANCEL ANYTIME
      </div>
    </div>
  );
}

// ── Left panel ─────────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <section
      className="hidden lg:flex flex-col items-center justify-center relative w-1/2 overflow-hidden p-10"
      style={{ backgroundColor: "var(--rf-bg)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.08) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />
      <div className="absolute top-2 left-2  w-6 h-6 border-t-2 border-l-2 border-cyan-700" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-700" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-700" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-700" />
      <div className="w-28 h-28 mb-7 relative z-10">
        <svg
          viewBox="0 0 110 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Glow backdrop */}
          <circle
            cx="55"
            cy="55"
            r="32"
            fill="rgba(0,180,255,0.10)"
            style={{
              animation: "pulse 2s ease-in-out infinite",
              filter: "blur(12px)",
            }}
          />

          {/* Outer dashed ring */}
          <g
            style={{
              animation: "spin 8s linear infinite",
              transformOrigin: "50% 50%",
            }}
          >
            <circle
              cx="55"
              cy="55"
              r="50"
              stroke="rgba(0,180,220,0.18)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          </g>

          {/* Mid ring with gaps */}
          <g
            style={{
              animation: "spin-reverse 5s linear infinite",
              transformOrigin: "50% 50%",
            }}
          >
            <circle
              cx="55"
              cy="55"
              r="40"
              stroke="rgba(0,212,255,0.28)"
              strokeWidth="1.2"
              strokeDasharray="10 4"
            />
          </g>

          {/* Solid arcs (the "C" shape) */}
          <path
            d="M 55 18 A 37 37 0 1 1 20 55"
            stroke="#00d4ff"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Inner arc */}
          <path
            d="M 55 30 A 25 25 0 1 1 30 55"
            stroke="#0090bb"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Dot on arc end */}
          <circle cx="20" cy="55" r="4" fill="#00d4ff" />
          <circle cx="30" cy="55" r="2.5" fill="#00aadd" />

          {/* Small accent tick */}
          <line
            x1="55"
            y1="14"
            x2="55"
            y2="22"
            stroke="#00d4ff"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Inner filled ring */}
          <circle
            cx="55"
            cy="55"
            r="10"
            fill="rgba(0,60,90,0.7)"
            stroke="#00d4ff"
            strokeWidth="1.5"
          />
          <circle cx="55" cy="55" r="4" fill="#00d4ff" />
        </svg>

        <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes spin-reverse {
              to { transform: rotate(-360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.5; filter: blur(12px); }
              50% { opacity: 1; filter: blur(18px); }
            }
          `}</style>
      </div>
      <div className="text-center mb-7 relative z-10">
        <div
          className="text-3xl font-bold mb-1"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: "0.12em",
          }}
        >
          <span className="text-white">CORE</span>
          <span className="text-cyan-400">SYNAPTICS</span>
        </div>
        <div
          className="text-xs text-slate-400 mt-1 uppercase"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.25em",
          }}
        >
          DC Commissioning ERP
        </div>
      </div>
      <div className="w-full max-w-[180px] mb-8 relative z-10">
        {[
          ["01", "Company", "Type · name · size"],
          ["02", "Scope", "Multi-DC · defaults"],
          ["03", "Facility", "DC type · uptime · cooling"],
          ["04", "Equipment", "Registry · OFCI/CFCI"],
          // ["05", "Partners", "Directory · mode"],
          // ["06", "Staffing", "Agencies · availability"],
          ["05", "Team", "Roles · headcount"],
          // ["08", "Integrate", "Platforms · AI"],
          ["06", "Brand", "Logo · colors · map"],
          ["07", "Review", "Pricing · launch"],
        ].map(([n, t, d]) => (
          <div
            key={n}
            className="flex items-center gap-3 mb-2"
            style={{ opacity: 0.7 }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                border: "1px solid rgba(0,200,255,0.3)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.56rem",
                color: "#00c8ff",
                flexShrink: 0,
              }}
            >
              {n}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: "var(--rf-txt)",
                }}
              >
                {t}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.56rem",
                  color: "var(--rf-txt2)",
                }}
              >
                {d}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center overflow-hidden">
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.5rem",
            color: "#4a7a92",
            letterSpacing: "0.18em",
            animation: "ticker-scroll 24s linear infinite",
            whiteSpace: "nowrap",
          }}
        >
          CORESYNAPTICS™ &nbsp;·&nbsp; SETUP WIZARD v2.1 &nbsp;·&nbsp; DC
          COMMISSIONING PLATFORM &nbsp;·&nbsp; SECURE SESSION &nbsp;·&nbsp;
          PHASE GATE ENFORCEMENT &nbsp;&nbsp;&nbsp;
        </div>
        <style>{`@keyframes ticker-scroll{from{transform:translateX(100vw)}to{transform:translateX(-100%)}}`}</style>
      </div>
    </section>
  );
}

// ── Default state ─────────────────────────────────────────────────────────────

const DEFAULT_WIZARD = {
  companyType: "customer",
  companyName: "",
  companySize: "med",
  companyId: "",
  multiDC: true,
  defaultConnected: false,
  facilityName: "",
  dcType: "ai",
  uptime: "t3",
  scale: "s3",
  cooling: "dlc",
  power: "2n",
  equipment: JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT)),
  mode: "connected",
  partnerSearch: "",
  selectedPartners: [
    "Turner Construction",
    "Delta Electronics",
    "Caterpillar",
    "Shermco Industries",
  ],
  customCompanies: [],
  showAddForm: false,
  newCompanyName: "",
  newCompanyType: "GC",
  newCompanyMeta: "",
  useStaffing: true,
  selectedAgencies: ["AECOM Staffing", "GPAC DC Talent"],
  team: null,
  integrations: {
    PROCORE: true,
    P6: true,
    ACC: false,
    CXALLOY: false,
    HAMMERTECH: false,
    BLUEBEAM: false,
  },
  ai: { CHATGPT: true, CLAUDE: true, GEMINI: false, LLAMA: false },
  logoUrl: "",
  logoUploaded: false,
  logoFileName: "",
  logoFileSize: "",
  primaryColor: "#0A2540",
  googleEarth: false,
  companyEmail: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
  adminPassword: "",
};

// ── Main ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [stepLoading, setStepLoading] = useState(false);
  const [stepError, setStepError] = useState("");
  const [apiRoles, setApiRoles] = useState([]);
  const [roleQtys, setRoleQtys] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [sessionId, setSessionId] = useState(() => {
    try {
      return sessionStorage.getItem("cxcontrol_session_id") || "";
    } catch {
      return "";
    }
  });
  const [apiReview, setApiReview] = useState(null);

  const [wizard, setWizard] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = { ...DEFAULT_WIZARD, ...JSON.parse(saved) };
        if (!p.team)
          p.team = JSON.parse(
            JSON.stringify(
              TEAMS_BY_TYPE[p.companyType] || TEAMS_BY_TYPE.customer,
            ),
          );
        return p;
      }
    } catch {}
    const d = { ...DEFAULT_WIZARD };
    d.team = JSON.parse(JSON.stringify(TEAMS_BY_TYPE.customer));
    return d;
  });

  // Apply saved theme synchronously before paint (prevents dark flash on refresh)
  useLayoutEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    getSubscriptionsList();
  }, []);

  const getSubscriptionsList = async () => {
    try {
      const res = await getSubscriptions();
      setSubscriptions(res?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // On mount: create session for new users; or resume setup for authed users
  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (!token) {
        // New registration — ensure we have a session
        try {
          let sid;
          try {
            sid = sessionStorage.getItem("cxcontrol_session_id");
          } catch {}
          if (sid) {
            setSessionId(sid);
            return;
          }
          const s = await createOnboardingSession(wizard.companyName || "");
          try {
            sessionStorage.setItem("cxcontrol_session_id", s.sessionId);
          } catch {}
          setSessionId(s.sessionId);
        } catch {}
        return;
      }
      // Authed user resuming setup — hydrate wizard from draft
      try {
        const sid = sessionId || "";
        const data = await GetSetup(sid || undefined);
        if (!data) return;
        const patch = {};
        if (data.company) {
          patch.companyType = data.company.companyRole ?? wizard.companyType;
          patch.companyName = data.company.companyName ?? wizard.companyName;
          patch.companySize = data.company.companySize ?? wizard.companySize;
        }
        if (data.scope) patch.multiDC = data.scope.multiDC ?? wizard.multiDC;
        if (data.facility) {
          patch.facilityName = data.facility.name ?? wizard.facilityName;
          patch.dcType = data.facility.dcType ?? wizard.dcType;
          patch.uptime = data.facility.uptime ?? wizard.uptime;
          patch.scale = data.facility.scale ?? wizard.scale;
          patch.cooling = data.facility.cooling ?? wizard.cooling;
          patch.power = data.facility.power ?? wizard.power;
        }
        if (data.equipment?.equipment)
          patch.equipment = data.equipment.equipment;
        if (data.brand) {
          patch.logoUrl = data.brand.logoUrl ?? wizard.logoUrl;
          patch.primaryColor = data.brand.primaryColor ?? wizard.primaryColor;
          patch.googleEarth = data.brand.googleEarth ?? wizard.googleEarth;
        }
        if (Object.keys(patch).length) update(patch);
        if (typeof data.currentStep === "number") setStep(data.currentStep);
      } catch {
        // Ignore — proceed with local wizard state
      }
    };
    init();
  }, []);

  // Fetch equipment defaults when entering the equipment step
  useEffect(() => {
    if (step !== 3) return;
    const fetchEquipmentDefaults = async () => {
      try {
        const data = await GetEquipmentDefaults();
        if (data?.equipment?.length > 0) update({ equipment: data.equipment });
      } catch {
        // API unavailable — keep local DEFAULT_EQUIPMENT
      }
    };
    fetchEquipmentDefaults();
  }, [step]);

  // Fetch roles from API when entering the team step
  useEffect(() => {
    if (step !== 4) return;
    const fetchRoles = async () => {
      try {
        const sid =
          sessionId || sessionStorage.getItem("cxcontrol_session_id") || "";
        const data = await GetSetupRoles(sid);
        const roles = data?.roles || data || [];
        setApiRoles(roles);
        const qtys = {};
        roles.forEach((role) => {
          const key = role.roleKey || role.id || String(role.name);
          qtys[key] = role.defaultQty ?? 1;
        });
        setRoleQtys(qtys);
      } catch {
        // API unavailable — fallback to local TEAMS_BY_TYPE data already in wizard state
        setApiRoles([]);
      }
    };
    fetchRoles();
  }, [step]);

  // Fetch review pricing when entering the review step
  useEffect(() => {
    if (step !== 6) return;
    const fetchReview = async () => {
      try {
        const sid =
          sessionId || sessionStorage.getItem("cxcontrol_session_id") || "";
        if (!sid) return;
        const data = await GetReview(sid);
        setApiReview(data);
      } catch {
        // API unavailable — fall back to local calcPricing
      }
    };
    fetchReview();
  }, [step]);

  const update = (patch) => {
    setWizard((prev) => {
      const next = { ...prev, ...patch };
      if (patch.companyType && patch.companyType !== prev.companyType) {
        next.team = JSON.parse(
          JSON.stringify(
            TEAMS_BY_TYPE[patch.companyType] || TEAMS_BY_TYPE.customer,
          ),
        );
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const canAdvance = () => {
    if (step === 0)
      return (
        wizard.companyType &&
        wizard.companyName.trim() &&
        wizard.companySize &&
        wizard.adminFirstName.trim() &&
        wizard.adminLastName.trim() &&
        wizard.adminEmail.trim() &&
        wizard.adminPassword
      );
    return true;
  };

  // Per-step API call then advance
  const handleNext = async () => {
    setStepError("");
    setStepLoading(true);
    try {
      const sid =
        sessionId || sessionStorage.getItem("cxcontrol_session_id") || "";

      if (step === 0) {
        await SaveCompany({
          sessionId: sid,
          companyName: wizard.companyName,
          companyEmail: wizard.companyEmail,
          companyRole: wizard.companyType,
          companySize: wizard.companySize,
          adminFirstName: wizard.adminFirstName,
          adminLastName: wizard.adminLastName,
          adminEmail: wizard.adminEmail,
          adminPassword: wizard.adminPassword,
        });
      } else if (step === 1) {
        await SaveScope({
          sessionId: sid,
          multiDC: wizard.multiDC,
          defaultConnected: wizard.defaultConnected,
        });
      } else if (step === 2) {
        await SaveFacility({
          sessionId: sid,
          name: wizard.facilityName,
          dcType: wizard.dcType,
          uptime: wizard.uptime,
          scale: wizard.scale,
          cooling: wizard.cooling,
          power: wizard.power,
        });
      } else if (step === 3) {
        await SaveEquipment({
          sessionId: sid,
          equipment: wizard.equipment.map((e) => ({
            abbr: e.abbr,
            name: e.name,
            oem: e.oem,
            qty: e.qty,
            proc: e.proc,
            leadWeeks: e.leadWeeks,
          })),
        });
      } else if (step === 4) {
        const rolesPayload =
          apiRoles.length > 0
            ? Object.entries(roleQtys).map(([roleKey, qty]) => {
                const role = apiRoles.find((r) => r.roleKey === roleKey);
                return {
                  name: role?.name || roleKey,
                  tier: role?.tier || "S",
                  qty,
                };
              })
            : (wizard.team || []).map((r) => ({
                name: r.n,
                tier: r.tier,
                qty: r.qty,
              }));
        await SaveTeam({ sessionId: sid, roles: rolesPayload });
      } else if (step === 5) {
        await SaveBrand({
          sessionId: sid,
          logoUrl: wizard.logoUrl,
          primaryColor: wizard.primaryColor,
          googleEarth: wizard.googleEarth,
        });
      }

      setStep((s) => s + 1);
    } catch (error) {
      setStepError(error?.message || "Failed to save. Please try again.");
    } finally {
      setStepLoading(false);
    }
  };

  const handleLaunch = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });

    const sid =
      sessionId || sessionStorage.getItem("cxcontrol_session_id") || "";

    try {
      // Finalize — creates org + user + returns JWT

      const finalizeRes = await FinalizeSetup({ sessionId: sid });
      const { accessToken, organization, user } = finalizeRes || {};

      if (accessToken) setTokens({ accessToken });
      if (user) setUser({ user });
      if (organization) setOrganization({ organization });

      // Fallback: fetch user/org if not in finalize response
      if (!user || !organization) {
        try {
          const userResponse = await GetUser();
          const orgResponse = await GetOrganization();
          setUser({ user: userResponse });
          setOrganization({ organization: orgResponse });
        } catch {}
      }

      setMsg({
        type: "success",
        text: "Account created! Redirecting to your platform…",
      });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      try {
        sessionStorage.removeItem("cxcontrol_session_id");
      } catch {}
      await selectSubscription({ subscriptionPlanId: wizard?.companyId });

      setTimeout(() => router.push("/"), 2200);
    } catch (error) {
      setMsg({
        type: "error",
        text: error?.message || "Network error. Please try again.",
      });
      setLoading(false);
    }
  };

  const s = STEPS[step];


  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        backgroundColor: C.bg,
      }}
    >
      <LeftPanel />
      <div
        className="w-px"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,180,220,0.22) 15%, #0a8aaa 50%, rgba(0,180,220,0.22) 85%, transparent 100%)",
        }}
      />

      <section
        className="flex-1 flex flex-col relative overflow-y-auto"
        style={{ backgroundColor: "var(--rf-bg)" }}
      >
        <div className="relative z-10 flex flex-col flex-1 px-8 py-7 max-w-2xl mx-auto w-full">
          {/* Step nav */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            {STEPS.map((st, i) => (
              <div
                key={st.key}
                onClick={() => i < step && setStep(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  borderRadius: 6,
                  cursor: i < step ? "pointer" : "default",
                  background:
                    i === step
                      ? "rgba(0,200,255,0.1)"
                      : i < step
                        ? "rgba(0,229,160,0.07)"
                        : "transparent",
                  border:
                    i === step
                      ? "1px solid rgba(0,200,255,0.3)"
                      : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background:
                      i === step
                        ? C.accent
                        : i < step
                          ? "#00e5a0"
                          : "var(--rf-bg4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i < step ? (
                    <svg width="7" height="7" viewBox="0 0 8 8">
                      <path
                        d="M1.5 4l2 2 3-3"
                        stroke="#020d16"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <span
                      style={{
                        fontFamily: C.mono,
                        fontSize: "0.52rem",
                        fontWeight: 600,
                        color: i === step ? "var(--rf-bg)" : C.muted,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: C.mono,
                    fontSize: "0.58rem",
                    color:
                      i === step ? C.accent : i < step ? "#00e5a0" : C.muted,
                    fontWeight: i === step ? 500 : 400,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background:
                    i < step
                      ? "#00e5a0"
                      : i === step
                        ? C.accent
                        : "var(--rf-bg4)",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>

          {/* Step header */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontFamily: C.mono,
                fontSize: "0.56rem",
                color: C.accent,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                marginBottom: 5,
              }}
            >
              Step {step + 1} · {s.label}
            </div>
            <h1
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "1.7rem",
                fontWeight: 700,
                color: "var(--rf-txt)",
                letterSpacing: "0.04em",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {s.title} <span style={{ color: C.accent }}>{s.em}</span>
            </h1>
            <p
              style={{
                fontFamily: C.mono,
                fontSize: "0.65rem",
                color: C.muted,
                marginTop: 4,
                marginBottom: 0,
                letterSpacing: "0.03em",
              }}
            >
              {s.sub}
            </p>
          </div>

          {/* Step content */}
          <div style={{ flex: 1, paddingBottom: 20 }}>
            {step === 0 && (
              <StepCompany
                w={wizard}
                u={update}
                showPwd={showPwd}
                setShowPwd={setShowPwd}
                subscriptions={subscriptions}
              />
            )}
            {step === 1 && <StepScope w={wizard} u={update} />}
            {step === 2 && <StepFacility w={wizard} u={update} />}
            {step === 3 && <StepEquipment w={wizard} u={update} />}
            {step === 4 && (
              <StepTeam
                w={wizard}
                u={update}
                apiRoles={apiRoles}
                roleQtys={roleQtys}
                setRoleQtys={setRoleQtys}
              />
            )}
            {step === 5 && (
              <StepBrand w={wizard} u={update} sessionId={sessionId} />
            )}
            {step === 6 && (
              <StepReview
                w={wizard}
                u={update}
                showPwd={showPwd}
                setShowPwd={setShowPwd}
                apiReview={apiReview}
              />
            )}
            {/* {step === 4 && <StepPartners w={wizard} u={update} />}
            {step === 5 && <StepStaffing w={wizard} u={update} />}
            {step === 6 && <StepTeam w={wizard} u={update} />}
            {step === 7 && <StepIntegrate w={wizard} u={update} />}
            {step === 8 && <StepBrand w={wizard} u={update} />}
            {step === 9 && (
              <StepReview
                w={wizard}
                u={update}
                showPwd={showPwd}
                setShowPwd={setShowPwd}
              />
            )} */}
          </div>

          {/* Per-step error */}
          {stepError && (
            <div
              style={{
                padding: "9px 14px",
                borderRadius: 6,
                marginBottom: 12,
                fontFamily: C.mono,
                fontSize: "0.7rem",
                background: "rgba(255,68,85,0.1)",
                color: "#ff4455",
                border: "1px solid rgba(255,68,85,0.3)",
              }}
            >
              {stepError}
            </div>
          )}

          {/* Status message */}
          {msg.text && (
            <div
              style={{
                padding: "9px 14px",
                borderRadius: 6,
                marginBottom: 12,
                fontFamily: C.mono,
                fontSize: "0.7rem",
                background:
                  msg.type === "success"
                    ? "rgba(0,229,160,0.1)"
                    : "rgba(255,68,85,0.1)",
                color: msg.type === "success" ? "#00e5a0" : "#ff4455",
                border:
                  msg.type === "success"
                    ? "1px solid rgba(0,229,160,0.3)"
                    : "1px solid rgba(255,68,85,0.3)",
              }}
            >
              {msg.text}
            </div>
          )}

          {/* Nav */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 14,
              borderTop: `1px solid rgba(0,180,220,0.12)`,
            }}
          >
            <button
              disabled={step === 0 || stepLoading}
              onClick={() => {
                setStepError("");
                setStep((s) => s - 1);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: "transparent",
                color: step === 0 ? C.muted : "var(--rf-txt2)",
                fontFamily: C.mono,
                fontSize: "0.7rem",
                cursor: step === 0 || stepLoading ? "not-allowed" : "pointer",
                letterSpacing: "0.08em",
              }}
            >
              ← Back
            </button>
            <span
              style={{
                fontFamily: C.mono,
                fontSize: "0.58rem",
                color: C.muted,
              }}
            >
              {step + 1} / {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <button
                disabled={!canAdvance() || stepLoading}
                onClick={handleNext}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "none",
                  background:
                    canAdvance() && !stepLoading ? C.accent : "var(--rf-bg4)",
                  color:
                    canAdvance() && !stepLoading ? "var(--rf-bg)" : C.muted,
                  fontFamily: C.mono,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  cursor:
                    canAdvance() && !stepLoading ? "pointer" : "not-allowed",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {stepLoading ? (
                  <>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        opacity="0.25"
                      />
                      <path
                        fill="currentColor"
                        opacity="0.75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Continue →"
                )}
              </button>
            ) : (
              <button
                disabled={loading}
                onClick={handleLaunch}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "none",
                  background: loading ? "var(--rf-bg4)" : C.accent,
                  color: loading ? C.muted : "var(--rf-bg)",
                  fontFamily: C.mono,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        opacity="0.25"
                      />
                      <path
                        fill="currentColor"
                        opacity="0.75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Launching…
                  </>
                ) : (
                  "Launch Platform →"
                )}
              </button>
            )}
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 14,
              fontFamily: C.mono,
              fontSize: "0.62rem",
              color: C.muted,
            }}
          >
            Already have an account?{" "}
            <Link
              href="/Auth/Login"
              style={{
                color: C.accent,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
