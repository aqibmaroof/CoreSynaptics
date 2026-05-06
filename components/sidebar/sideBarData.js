"use client";
import config from "@/config";

export const ROLES = {
  // ── GC ───────────────────────────────────────────────────────────────────────
  GC_ADMIN: "gc_admin",
  GC_PM: "gc_pm",
  SUPERINTENDENT: "superintendent",
  GC_SCHEDULER: "gc_scheduler",
  GC_FOREMAN: "gc_foreman",
  GC_ESTIMATOR: "gc_estimator",
  GC_FIELD_ENGINEER: "gc_field_engineer",
  GC_PROCUREMENT: "gc_procurement",
  GC_SAFETY_MANAGER: "gc_safety_manager",
  GC_FINANCE: "gc_finance",
  // ── OEM ──────────────────────────────────────────────────────────────────────
  OEM_ADMIN: "oem_admin",
  OEM_PM: "oem_pm",
  FSM: "fsm",
  FSE: "fse",
  ASP: "asp",
  OEM_SALES: "oem_sales",
  OEM_ENGINEER: "oem_engineer",
  OEM_FACTORY_TECH: "oem_factory_tech",
  OEM_WARRANTY: "oem_warranty",
  // ── CUSTOMER ─────────────────────────────────────────────────────────────────
  CUSTOMER_EXEC: "customer_exec",
  CUSTOMER_PROGRAM_DIRECTOR: "customer_program_director",
  CUSTOMER_PM: "customer_pm",
  CUSTOMER_OWNER_REP: "customer_owner_rep",
  CUSTOMER_IT_MANAGER: "customer_it_manager",
  CUSTOMER_PROCUREMENT: "customer_procurement",
  CUSTOMER_FINANCE: "customer_finance",
  CUSTOMER_LEGAL: "customer_legal",
  CUSTOMER_CX_WITNESS: "customer_cx_witness",
  // ── BUILDER ──────────────────────────────────────────────────────────────────
  BUILDER_EXEC: "builder_exec",
  BUILDER_PM: "builder_pm",
  BUILDER_SUPERINTENDENT: "builder_superintendent",
  BUILDER_ESTIMATOR: "builder_estimator",
  BUILDER_ARCHITECT: "builder_architect",
  BUILDER_SAFETY: "builder_safety",
  BUILDER_FIELD_ENGINEER: "builder_field_engineer",
  BUILDER_FOREMAN: "builder_foreman",
  // ── TRADE ────────────────────────────────────────────────────────────────────
  TRADE_EXEC: "trade_exec",
  TRADE_PM: "trade_pm",
  TRADE_SUPERINTENDENT: "trade_superintendent",
  TRADE_FOREMAN: "trade_foreman",
  TRADE_JOURNEYMAN: "trade_journeyman",
  TRADE_APPRENTICE: "trade_apprentice",
  TRADE_SAFETY: "trade_safety",
  TRADE_ESTIMATOR: "trade_estimator",
  TRADE_QA: "trade_qa",
  // ── MECHANICAL ───────────────────────────────────────────────────────────────
  MECH_EXEC: "mech_exec",
  MECH_PM: "mech_pm",
  MECH_SUPERINTENDENT: "mech_superintendent",
  MECH_FOREMAN: "mech_foreman",
  MECH_TECHNICIAN: "mech_technician",
  MECH_CX_TECH: "mech_cx_tech",
  MECH_SAFETY: "mech_safety",
  // ── CONTROLS ─────────────────────────────────────────────────────────────────
  CONTROLS_EXEC: "controls_exec",
  CONTROLS_PM: "controls_pm",
  CONTROLS_ENGINEER: "controls_engineer",
  CONTROLS_TECHNICIAN: "controls_technician",
  CONTROLS_CX_TECH: "controls_cx_tech",
  CONTROLS_PROGRAMMER: "controls_programmer",
  CONTROLS_SAFETY: "controls_safety",
  // ── LOW VOLTAGE ──────────────────────────────────────────────────────────────
  LV_EXEC: "lv_exec",
  LV_PM: "lv_pm",
  LV_SUPERINTENDENT: "lv_superintendent",
  LV_TECHNICIAN: "lv_technician",
  LV_CX_TECH: "lv_cx_tech",
  LV_SAFETY: "lv_safety",
  // ── CXA ──────────────────────────────────────────────────────────────────────
  CXA_EXEC: "cxa_exec",
  CXA_PM: "cxa_pm",
  CXA_ENGINEER: "cxa_engineer",
  CXA_FIELD_AGENT: "cxa_field_agent",
  CXA_FUNCTIONAL_TESTER: "cxa_functional_tester",
  CXA_DOCUMENTER: "cxa_documenter",
  // ── AE ───────────────────────────────────────────────────────────────────────
  AE_EXEC: "ae_exec",
  AE_PM: "ae_pm",
  AE_ARCHITECT: "ae_architect",
  AE_STRUCTURAL_ENGINEER: "ae_structural_engineer",
  AE_MEP_ENGINEER: "ae_mep_engineer",
  AE_INSPECTOR: "ae_inspector",
  AE_CA: "ae_ca",
  // ── RIGGER ───────────────────────────────────────────────────────────────────
  RIGGER_EXEC: "rigger_exec",
  RIGGER_PM: "rigger_pm",
  RIGGER_SUPERINTENDENT: "rigger_superintendent",
  RIGGER_SIGNAL_PERSON: "rigger_signal_person",
  RIGGER_OPERATOR: "rigger_operator",
  RIGGER_SAFETY: "rigger_safety",
  // ── SECURITY ─────────────────────────────────────────────────────────────────
  SECURITY_EXEC: "security_exec",
  SECURITY_PM: "security_pm",
  SECURITY_ENGINEER: "security_engineer",
  SECURITY_TECHNICIAN: "security_technician",
  SECURITY_CX_TECH: "security_cx_tech",
  SECURITY_SAFETY: "security_safety",
  // ── FIRE ─────────────────────────────────────────────────────────────────────
  FIRE_EXEC: "fire_exec",
  FIRE_PM: "fire_pm",
  FIRE_DESIGNER: "fire_designer",
  FIRE_SUPERINTENDENT: "fire_superintendent",
  FIRE_TECHNICIAN: "fire_technician",
  FIRE_INSPECTOR: "fire_inspector",
  FIRE_SAFETY: "fire_safety",
  // ── STAFFING ─────────────────────────────────────────────────────────────────
  STAFFING_EXEC: "staffing_exec",
  STAFFING_RECRUITER: "staffing_recruiter",
  STAFFING_PM: "staffing_pm",
  STAFFING_WORKER: "staffing_worker",
  STAFFING_ACCOUNT_MGR: "staffing_account_mgr",
  // ── INTEGRATOR ───────────────────────────────────────────────────────────────
  INTEGRATOR_EXEC: "integrator_exec",
  INTEGRATOR_PM: "integrator_pm",
  INTEGRATOR_LEAD_TECH: "integrator_lead_tech",
  INTEGRATOR_NETWORK_ENGINEER: "integrator_network_engineer",
  INTEGRATOR_TECHNICIAN: "integrator_technician",
  INTEGRATOR_CX_TECH: "integrator_cx_tech",
  INTEGRATOR_SAFETY: "integrator_safety",
  INTEGRATOR_WARRANTY: "integrator_warranty",
  // ── OPERATIONS ───────────────────────────────────────────────────────────────
  OPS_EXEC: "ops_exec",
  OPS_DIRECTOR: "ops_director",
  OPS_FACILITY_MANAGER: "ops_facility_manager",
  OPS_SHIFT_SUPERVISOR: "ops_shift_supervisor",
  OPS_CRITICAL_TECH: "ops_critical_tech",
  OPS_CHANGE_MANAGER: "ops_change_manager",
  OPS_SAFETY: "ops_safety",
  OPS_WARRANTY_MANAGER: "ops_warranty_manager",
  OPS_FINANCE: "ops_finance",
  // ── CUSTOMER_CONST ───────────────────────────────────────────────────────────
  CC_EXEC: "cc_exec",
  CC_PM: "cc_pm",
  CC_OWNER_REP: "cc_owner_rep",
  CC_INSPECTOR: "cc_inspector",
  CC_FINANCE: "cc_finance",
  // ── UNIVERSAL ────────────────────────────────────────────────────────────────
  QA_QC: "qa_manager",
  SAFETY: "safety_officer",
  FINANCE: "finance",
  EXECUTIVE: "executive",
  // ── PLATFORM ─────────────────────────────────────────────────────────────────
  SUPERADMIN: "SUPERADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
};

const ALL = Object.values(ROLES);

// Helper: union of role arrays (deduped)
const union = (...arrays) => [...new Set(arrays.flat())];

// ── Role Groups ───────────────────────────────────────────────────────────────
// Used to build sidebar item role lists without repeating every role name.

// Platform admins always get everything
const PLATFORM = [ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN];

// Executive/director tier across all org types
const EXEC_ROLES = [
  ROLES.GC_ADMIN,
  ROLES.OEM_ADMIN,
  ROLES.EXECUTIVE,
  ROLES.BUILDER_EXEC,
  ROLES.TRADE_EXEC,
  ROLES.MECH_EXEC,
  ROLES.CONTROLS_EXEC,
  ROLES.LV_EXEC,
  ROLES.CXA_EXEC,
  ROLES.AE_EXEC,
  ROLES.RIGGER_EXEC,
  ROLES.SECURITY_EXEC,
  ROLES.FIRE_EXEC,
  ROLES.STAFFING_EXEC,
  ROLES.INTEGRATOR_EXEC,
  ROLES.OPS_EXEC,
  ROLES.OPS_DIRECTOR,
  ROLES.CUSTOMER_EXEC,
  ROLES.CUSTOMER_PROGRAM_DIRECTOR,
  ROLES.CC_EXEC,
];

// Project-management tier across all org types
const PM_ROLES = [
  ROLES.GC_PM,
  ROLES.GC_SCHEDULER,
  ROLES.OEM_PM,
  ROLES.FSM,
  ROLES.BUILDER_PM,
  ROLES.TRADE_PM,
  ROLES.MECH_PM,
  ROLES.CONTROLS_PM,
  ROLES.LV_PM,
  ROLES.CXA_PM,
  ROLES.AE_PM,
  ROLES.RIGGER_PM,
  ROLES.SECURITY_PM,
  ROLES.FIRE_PM,
  ROLES.STAFFING_PM,
  ROLES.INTEGRATOR_PM,
  ROLES.OPS_FACILITY_MANAGER,
  ROLES.OPS_CHANGE_MANAGER,
  ROLES.CUSTOMER_PM,
  ROLES.CC_PM,
];

// Site superintendents / shift supervisors across all org types
const SUPERINTENDENT_ROLES = [
  ROLES.SUPERINTENDENT,
  ROLES.BUILDER_SUPERINTENDENT,
  ROLES.TRADE_SUPERINTENDENT,
  ROLES.MECH_SUPERINTENDENT,
  ROLES.LV_SUPERINTENDENT,
  ROLES.RIGGER_SUPERINTENDENT,
  ROLES.FIRE_SUPERINTENDENT,
  ROLES.OPS_SHIFT_SUPERVISOR,
];

// Field execution workers (hands-on, non-supervisory)
const FIELD_WORKER_ROLES = [
  ROLES.FSE,
  ROLES.ASP,
  ROLES.GC_FOREMAN,
  ROLES.GC_FIELD_ENGINEER,
  ROLES.OEM_FACTORY_TECH,
  ROLES.BUILDER_FOREMAN,
  ROLES.BUILDER_FIELD_ENGINEER,
  ROLES.TRADE_FOREMAN,
  ROLES.TRADE_JOURNEYMAN,
  ROLES.TRADE_APPRENTICE,
  ROLES.MECH_FOREMAN,
  ROLES.MECH_TECHNICIAN,
  ROLES.MECH_CX_TECH,
  ROLES.CONTROLS_ENGINEER,
  ROLES.CONTROLS_TECHNICIAN,
  ROLES.CONTROLS_CX_TECH,
  ROLES.CONTROLS_PROGRAMMER,
  ROLES.LV_TECHNICIAN,
  ROLES.LV_CX_TECH,
  ROLES.CXA_ENGINEER,
  ROLES.CXA_FIELD_AGENT,
  ROLES.CXA_FUNCTIONAL_TESTER,
  ROLES.CXA_DOCUMENTER,
  ROLES.AE_ARCHITECT,
  ROLES.AE_STRUCTURAL_ENGINEER,
  ROLES.AE_MEP_ENGINEER,
  ROLES.AE_INSPECTOR,
  ROLES.AE_CA,
  ROLES.RIGGER_SIGNAL_PERSON,
  ROLES.RIGGER_OPERATOR,
  ROLES.SECURITY_ENGINEER,
  ROLES.SECURITY_TECHNICIAN,
  ROLES.SECURITY_CX_TECH,
  ROLES.FIRE_DESIGNER,
  ROLES.FIRE_TECHNICIAN,
  ROLES.FIRE_INSPECTOR,
  ROLES.STAFFING_WORKER,
  ROLES.INTEGRATOR_LEAD_TECH,
  ROLES.INTEGRATOR_NETWORK_ENGINEER,
  ROLES.INTEGRATOR_TECHNICIAN,
  ROLES.INTEGRATOR_CX_TECH,
  ROLES.OPS_CRITICAL_TECH,
  ROLES.CUSTOMER_OWNER_REP,
  ROLES.CUSTOMER_CX_WITNESS,
  ROLES.CUSTOMER_IT_MANAGER,
  ROLES.CC_OWNER_REP,
  ROLES.CC_INSPECTOR,
];

// Safety and quality specialists
const SAFETY_QA_ROLES = [
  ROLES.QA_QC,
  ROLES.SAFETY,
  ROLES.GC_SAFETY_MANAGER,
  ROLES.BUILDER_SAFETY,
  ROLES.TRADE_SAFETY,
  ROLES.TRADE_QA,
  ROLES.MECH_SAFETY,
  ROLES.CONTROLS_SAFETY,
  ROLES.LV_SAFETY,
  ROLES.RIGGER_SAFETY,
  ROLES.SECURITY_SAFETY,
  ROLES.FIRE_SAFETY,
  ROLES.FIRE_INSPECTOR,
  ROLES.INTEGRATOR_SAFETY,
  ROLES.OPS_SAFETY,
  ROLES.AE_INSPECTOR,
];

// Finance-focused roles
const FINANCE_ROLES = [
  ROLES.FINANCE,
  ROLES.GC_FINANCE,
  ROLES.CUSTOMER_FINANCE,
  ROLES.CC_FINANCE,
  ROLES.OPS_FINANCE,
];

// Sales / estimating roles
const SALES_ROLES = [
  ROLES.GC_ESTIMATOR,
  ROLES.OEM_SALES,
  ROLES.BUILDER_ESTIMATOR,
  ROLES.TRADE_ESTIMATOR,
  ROLES.STAFFING_RECRUITER,
  ROLES.STAFFING_ACCOUNT_MGR,
];

// ════════════════════════════════════════════════════════════════════════════
// COMPANIES — org catalogue (matches prototype COMPANIES object)
// ════════════════════════════════════════════════════════════════════════════
export const COMPANIES = {
  delta:       { id:"delta",       code:"DELTA",       name:"Delta Electronics",              type:"oem",            desc:"OEM · Critical power equipment manufacturer · Plano TX HQ · Servicing 5 active DC commissioning projects across the Americas.", sites:5,  headcount:62, active_projects:5,  established:"2026", is_chris_company:true },
  hitt:        { id:"hitt",        code:"HITT",        name:"HITT Contracting",               type:"gc",             desc:"GC · Mission-critical builder · DC, healthcare, federal · Falls Church VA HQ · Currently lead GC on ATL-DC-4.", sites:18, headcount:34, active_projects:1,  established:"1937" },
  cloudx:      { id:"cloudx",      code:"CLOUDX",      name:"CloudX Infrastructure",          type:"customer",       desc:"Customer · Hyperscale operator · ATL-DC-4 owner · Multi-campus expansion across Atlanta, Dallas, Richmond.", sites:12, headcount:45, active_projects:8,  established:"2019" },
  spark:       { id:"spark",       code:"SPARK",       name:"Spark Electric Co",              type:"trade",          desc:"Trade-E · Electrical contractor · Union local IBEW · ATL-DC-4 sub for feeders, gear, terminations.", sites:1,  headcount:42, active_projects:3,  established:"2008" },
  primary:     { id:"primary",     code:"PRIMARY",     name:"Primary Integration",            type:"cxa",            desc:"CxA · Owner-hired commissioning agent · L3-L5 ownership · Authors test scripts, witnesses execution.", sites:1,  headcount:18, active_projects:6,  established:"2003" },
  corgan:      { id:"corgan",      code:"CORGAN",      name:"Corgan Architects",              type:"ae",             desc:"A/E · Mission critical architect of record · IFC drawings, MEP engineering, RFI response on ATL-DC-4.", sites:1,  headcount:12, active_projects:14, established:"1938" },
  bigfoot:     { id:"bigfoot",     code:"BIGFOOT",     name:"Bigfoot Crane & Rigging",        type:"rigger",         desc:"Rigger · Heavy-lift specialist for OEM equipment · UPS, gens, transformers, e-houses · CFCI subcontract on ATL-DC-4.", sites:1,  headcount:24, active_projects:6,  established:"2001" },
  brasfield:   { id:"brasfield",   code:"BRASFIELD",   name:"Brasfield & Gorrie",             type:"builder",        desc:"Builder · Shell + interior · concrete tilt-up, structural steel, building envelope, slab-on-grade · subcontractor to GC.", sites:9,  headcount:38, active_projects:4,  established:"1922" },
  convergint:  { id:"convergint",  code:"CONVERGINT",  name:"Convergint Technologies",        type:"security",       desc:"Security · Access control, CCTV, intrusion detection, perimeter, guarding integration · low-voltage subcontractor.", sites:1,  headcount:22, active_projects:7,  established:"2001" },
  jci_fire:    { id:"jci_fire",    code:"JCI-FIRE",    name:"Johnson Controls Fire Protection",type:"fire",          desc:"Fire Alarm · Detection, suppression, clean-agent, sprinkler, FACP integration · life-safety subcontractor.", sites:1,  headcount:18, active_projects:9,  established:"1885" },
  trillium:    { id:"trillium",    code:"TRILLIUM",    name:"Trillium Construction Staffing", type:"staffing",       desc:"Staffing · Skilled trades labor supply · journeymen, apprentices, helpers · short-term project labor for trades.", sites:1,  headcount:8,  active_projects:5,  established:"1984" },
  mps:         { id:"mps",         code:"MPS",         name:"MPS Critical Power (Rosendin)",  type:"integrator",     desc:"Integrator · E-house, power skids, factory-built BMS/EPMS integration · Rosendin subsidiary · UL listed assemblies.", sites:2,  headcount:32, active_projects:3,  established:"2008" },
  jci_ctrl:    { id:"jci_ctrl",    code:"JCI-CTRL",    name:"Johnson Controls (BAS Division)","type":"controls",     desc:"Controls · Building automation, BMS, PLC programming · Metasys / Niagara · controls integration subcontractor.", sites:1,  headcount:20, active_projects:8,  established:"1885" },
  graybar_lv:  { id:"graybar_lv",  code:"GRAYBAR-LV",  name:"Graybar Low-Voltage Solutions",  type:"lowvoltage",     desc:"Low-Voltage / Cabling · Structured cabling, fiber, data infrastructure · BICSI certified.", sites:1,  headcount:14, active_projects:6,  established:"1869" },
  emcor_mech:  { id:"emcor_mech",  code:"EMCOR-MECH",  name:"EMCOR Mechanical Services",      type:"mechanical",     desc:"Mechanical · Pipefitting, sheet metal, HVAC installation · UA / SMART unions · MEP subcontractor.", sites:1,  headcount:38, active_projects:5,  established:"1994" },
  delta_corp:  { id:"delta_corp",  code:"DELTA-CORP",  name:"Delta Electronics · Corporate",  type:"operations",     desc:"Operations · Delta corporate executives, sales, back-office (non-project). Sister entity to the field-delivery Delta org.", sites:1,  headcount:26, active_projects:0,  established:"1971" },
  cloudx_const:{ id:"cloudx_const",code:"CLOUDX-CON",  name:"CloudX Construction Group",      type:"customer_const", desc:"Customer · Construction-side · Owner's construction PMs, coordinators (separate from facility ops). Manages CloudX's build program.", sites:1,  headcount:18, active_projects:8,  established:"2019" },
};

// ════════════════════════════════════════════════════════════════════════════
// LENSES — 8 dashboard lenses that role IDs map to
// ════════════════════════════════════════════════════════════════════════════
export const LENSES = {
  exec:   { id:"exec",   name:"Executive · portfolio",  color:"pu", desc:"Portfolio of all active projects · margin · pipeline · escalations" },
  pm:     { id:"pm",     name:"Project management",     color:"b",  desc:"Single project view · milestones · tasks · daily rollup · cross-company chat" },
  field:  { id:"field",  name:"Field execution",        color:"g",  desc:"My assigned tasks · daily checklist · field reports" },
  tech:   { id:"tech",   name:"Technical / engineering", color:"y", desc:"Submittals · drawings · technical RFIs · application questions" },
  sales:  { id:"sales",  name:"Sales / account",        color:"k",  desc:"Pipeline · quotes · QBR readiness · forecast" },
  safety: { id:"safety", name:"Safety / QA",            color:"r",  desc:"Incidents · NCR · audits · toolbox talks" },
  warr:   { id:"warr",   name:"Warranty / parts",       color:"c",  desc:"Warranty queue · RMA · parts orders · field issues" },
  cx:     { id:"cx",     name:"Commissioning",          color:"t",  desc:"L1-L5 progress · witness schedule · test results · IST" },
};

// ════════════════════════════════════════════════════════════════════════════
// ROLE_LIBRARY — full role catalogue by company type
// Each entry: { id, name, lens }  tier is on the parent tier object
// ════════════════════════════════════════════════════════════════════════════
export const ROLE_LIBRARY = {
  oem: [
    { tier:"Executive",             roles:[{ id:"oem_vp_ops",       name:"VP Operations",                lens:"exec"  },{ id:"oem_sales_dir",   name:"Sales Director",               lens:"sales" },{ id:"oem_vp_eng",       name:"VP Engineering",               lens:"exec"  }]},
    { tier:"Project Management",    roles:[{ id:"oem_natl_pm",      name:"National PM",                  lens:"pm"    },{ id:"oem_reg_pm",      name:"Regional PM",                  lens:"pm"    },{ id:"oem_sr_pm",        name:"Senior PM",                    lens:"pm"    },{ id:"oem_pm",      name:"Project Manager",  lens:"pm"   },{ id:"oem_apm",   name:"Assistant PM",       lens:"pm"   },{ id:"oem_coord",   name:"Project Coordinator",   lens:"pm"   }]},
    { tier:"Field Service",         roles:[{ id:"oem_reg_fsm",      name:"Regional Field Service Manager",lens:"pm"    },{ id:"oem_lead_fse",    name:"Lead FSE",                     lens:"field" },{ id:"oem_sr_fse",       name:"Senior FSE",                   lens:"field" },{ id:"oem_fse",     name:"Field Service Engineer",lens:"field"},{ id:"oem_app_fse",name:"Apprentice FSE",     lens:"field"},{ id:"oem_svc_dispatch",name:"Service Dispatch",lens:"warr" }]},
    { tier:"Commissioning",         roles:[{ id:"oem_cx_lead",      name:"Cx Lead",                      lens:"cx"    },{ id:"oem_sr_cx",       name:"Senior Cx Engineer",           lens:"cx"    },{ id:"oem_cx",           name:"Cx Engineer",                  lens:"cx"    }]},
    { tier:"Engineering",           roles:[{ id:"oem_app_eng",      name:"Application Engineer",          lens:"tech"  },{ id:"oem_sr_app_eng",  name:"Senior App Engineer",          lens:"tech"  },{ id:"oem_sol_eng",      name:"Solutions Engineer",           lens:"tech"  }]},
    { tier:"Sales",                 roles:[{ id:"oem_sales_rep",    name:"Sales Rep",                    lens:"sales" },{ id:"oem_inside_sales", name:"Inside Sales",                lens:"sales" },{ id:"oem_sales_eng",    name:"Sales Engineer",               lens:"sales" },{ id:"oem_acct_mgr",name:"Account Manager",  lens:"sales"}]},
    { tier:"Safety & Quality",      roles:[{ id:"oem_safety_mgr",   name:"Safety Manager",               lens:"safety"},{ id:"oem_safety_off",  name:"Site Safety Officer",          lens:"safety"},{ id:"oem_qaqc_mgr",     name:"QA/QC Manager",                lens:"safety"},{ id:"oem_qaqc_insp",name:"QA/QC Inspector",lens:"safety"}]},
    { tier:"Scheduling & Controls", roles:[{ id:"oem_scheduler",    name:"Scheduler",                    lens:"pm"    },{ id:"oem_site_scheduler",name:"On-site Scheduler",           lens:"pm"    },{ id:"oem_proj_ctrl",    name:"Project Controls",             lens:"pm"    },{ id:"oem_estimator",name:"Estimator",       lens:"sales"}]},
    { tier:"Warranty & Parts",      roles:[{ id:"oem_warranty_mgr", name:"Warranty Manager",             lens:"exec"  },{ id:"oem_warranty",    name:"Warranty Administrator",       lens:"warr"  },{ id:"oem_parts",        name:"Parts Coordinator",            lens:"warr"  },{ id:"oem_rma",     name:"RMA Specialist",   lens:"warr" }]},
    { tier:"Finance & Admin",       roles:[{ id:"oem_finance",      name:"Finance Director",             lens:"exec"  },{ id:"oem_ar",          name:"AR Specialist",                lens:"exec"  },{ id:"oem_admin",        name:"Office Admin",                 lens:"pm"    }]},
  ],
  gc: [
    { tier:"Executive",             roles:[{ id:"gc_proj_exec",     name:"Project Executive",            lens:"exec"  },{ id:"gc_vp_ops",       name:"VP Operations",                lens:"exec"  },{ id:"gc_vp_precon",     name:"VP Preconstruction",           lens:"exec"  }]},
    { tier:"Project Management",    roles:[{ id:"gc_sr_pm",         name:"Senior PM",                    lens:"pm"    },{ id:"gc_pm",           name:"Project Manager",              lens:"pm"    },{ id:"gc_apm",           name:"Assistant PM",                 lens:"pm"    },{ id:"gc_proj_eng",name:"Project Engineer",lens:"tech" },{ id:"gc_doc_ctrl",name:"Document Controller",lens:"pm"  }]},
    { tier:"Field Leadership",      roles:[{ id:"gc_sr_super",      name:"Senior Superintendent",        lens:"field" },{ id:"gc_super",        name:"Superintendent",               lens:"field" },{ id:"gc_asst_super",    name:"Assistant Superintendent",     lens:"field" },{ id:"gc_gen_foreman",name:"General Foreman",lens:"field"},{ id:"gc_foreman",name:"Foreman",          lens:"field"}]},
    { tier:"MEP Coordination",      roles:[{ id:"gc_vp_mep",        name:"VP MEP / MEP Director",        lens:"exec"  },{ id:"gc_sr_mep_pm",    name:"Senior MEP PM",                lens:"pm"    },{ id:"gc_mep_pm",        name:"MEP Project Manager",          lens:"pm"    },{ id:"gc_sr_mep_super",name:"Senior MEP Superintendent",lens:"field"},{ id:"gc_mep_super",name:"MEP Superintendent",lens:"field"},{ id:"gc_asst_mep_super",name:"Assistant MEP Superintendent",lens:"field"},{ id:"gc_mep_elec_super",name:"Electrical Superintendent",lens:"field"},{ id:"gc_mep_mech_super",name:"Mechanical Superintendent",lens:"field"},{ id:"gc_mep_coord",name:"MEP Coordinator",lens:"tech"},{ id:"gc_mep_eng",name:"MEP Field Engineer",lens:"tech"},{ id:"gc_mep_qaqc",name:"MEP QA/QC",lens:"safety"}]},
    { tier:"BIM / VDC",             roles:[{ id:"gc_bim_mgr",       name:"BIM Manager",                  lens:"tech"  },{ id:"gc_vdc_coord",    name:"VDC Coordinator",              lens:"tech"  },{ id:"gc_bim_mep",       name:"BIM/VDC MEP Coordinator",      lens:"tech"  }]},
    { tier:"Safety & Quality",      roles:[{ id:"gc_safety_mgr",    name:"Safety Manager",               lens:"safety"},{ id:"gc_site_safety",  name:"Site Safety Officer",          lens:"safety"},{ id:"gc_qaqc",          name:"QA/QC Manager",                lens:"safety"}]},
    { tier:"Controls & Procurement",roles:[{ id:"gc_scheduler",     name:"Scheduler",                    lens:"pm"    },{ id:"gc_estimator",    name:"Estimator",                    lens:"sales" },{ id:"gc_buyer",         name:"Buyer / Procurement",          lens:"sales" }]},
  ],
  customer: [
    { tier:"Executive",             roles:[{ id:"cust_vp_infra",    name:"VP Infrastructure",            lens:"exec"  },{ id:"cust_dir_dc",     name:"Director DC Construction",     lens:"exec"  },{ id:"cust_dc_prog_dir", name:"DC Program Director",          lens:"exec"  }]},
    { tier:"Construction Program",  roles:[{ id:"cust_prog_dir",    name:"Program Director",             lens:"exec"  },{ id:"cust_prog_lead",  name:"Construction Program Lead",    lens:"pm"    },{ id:"cust_sr_const_pm", name:"Senior Construction PM",       lens:"pm"    },{ id:"cust_const_coord",name:"Construction Coordinator",lens:"pm"},{ id:"cust_owner_rep",name:"Owner Rep",lens:"pm"}]},
    { tier:"Facility Operations",   roles:[{ id:"cust_dc_ops",      name:"DC Ops Manager",               lens:"field" },{ id:"cust_facility_mgr",name:"Facility Manager",            lens:"field" },{ id:"cust_campus_fac_mgr",name:"Campus Facility Manager",     lens:"field" },{ id:"cust_crit_ops_mgr",name:"Critical Operations Manager",lens:"field"},{ id:"cust_chief_eng",name:"Chief Engineer",lens:"field"},{ id:"cust_lead_bldg_eng",name:"Lead Building Engineer",lens:"field"},{ id:"cust_crit_fac_eng",name:"Critical Facility Engineer",lens:"field"},{ id:"cust_bldg_eng",name:"Building Engineer",lens:"field"},{ id:"cust_elec_tech",name:"Electrical Technician",lens:"field"},{ id:"cust_ctrl_tech",name:"Controls Technician",lens:"field"}]},
    { tier:"Network & Security Ops",roles:[{ id:"cust_net_ops",     name:"Network Operations",           lens:"tech"  },{ id:"cust_sec_ops",    name:"Security Operations",          lens:"safety"},{ id:"cust_ehs_mgr",     name:"EHS Manager",                  lens:"safety"}]},
    { tier:"Business",              roles:[{ id:"cust_procure",     name:"Procurement",                  lens:"sales" },{ id:"cust_legal",      name:"Legal / Contracts",            lens:"exec"  },{ id:"cust_finance",     name:"Finance",                      lens:"exec"  },{ id:"cust_hr",     name:"HR",               lens:"warr" },{ id:"cust_payroll",name:"Payroll",          lens:"warr" }]},
    { tier:"Site Services",         roles:[{ id:"cust_janitorial",  name:"Janitorial",                   lens:"field" },{ id:"cust_grounds",    name:"Groundskeeping",               lens:"field" }]},
  ],
  trade: [
    { tier:"Management",            roles:[{ id:"tr_pm",            name:"Project Manager",              lens:"pm"    },{ id:"tr_apm",          name:"Assistant PM",                 lens:"pm"    },{ id:"tr_eng",           name:"Project Engineer",             lens:"tech"  },{ id:"tr_estimator",name:"Estimator",       lens:"sales"}]},
    { tier:"Electrical Field",      roles:[{ id:"tr_elec_super",    name:"Electrical Superintendent",    lens:"field" },{ id:"tr_elec_gen_foreman",name:"Electrical General Foreman",lens:"field" },{ id:"tr_elec_foreman",  name:"Electrical Foreman",           lens:"field" },{ id:"tr_journey",  name:"Journeyman Electrician",lens:"field"},{ id:"tr_app",name:"Apprentice",          lens:"field"}]},
    { tier:"Mechanical Field",      roles:[{ id:"tr_mech_estimator",name:"Mechanical Estimator",        lens:"sales" },{ id:"tr_mech_super",   name:"Mechanical Superintendent",    lens:"field" },{ id:"tr_mech_gen_foreman",name:"Mechanical General Foreman",lens:"field"},{ id:"tr_mech_foreman",name:"Mechanical Foreman",lens:"field"},{ id:"tr_pipefitter",name:"Pipefitter",lens:"field"},{ id:"tr_sheet_metal",name:"Sheet Metal Worker",lens:"field"},{ id:"tr_mech_app",name:"Mechanical Apprentice",lens:"field"},{ id:"tr_mech_safety",name:"Mechanical Safety Officer",lens:"safety"}]},
    { tier:"Fire Protection Field", roles:[{ id:"tr_fp_designer",   name:"Fire Protection Designer",    lens:"tech"  },{ id:"tr_fp_foreman",   name:"Fire Protection Foreman",      lens:"field" },{ id:"tr_sprinkler",     name:"Sprinkler Fitter",             lens:"field" }]},
    { tier:"Security / ACS Field",  roles:[{ id:"tr_sec_designer",  name:"Security Systems Designer",   lens:"tech"  },{ id:"tr_sec_foreman",  name:"Security Foreman",             lens:"field" },{ id:"tr_sec_acs_tech",  name:"Access Control Technician",    lens:"field" }]},
    { tier:"Low-Voltage / Cabling", roles:[{ id:"tr_cabling_foreman",name:"Cabling Foreman",           lens:"field" },{ id:"tr_fiber_tech",   name:"Fiber Technician",             lens:"field" }]},
    { tier:"Controls Field",        roles:[{ id:"tr_ctrl_pm",       name:"Controls PM",                  lens:"pm"    },{ id:"tr_ctrl_eng",     name:"Controls Engineer",            lens:"tech"  },{ id:"tr_ctrl_super",    name:"Controls Superintendent",      lens:"field" },{ id:"tr_ctrl_foreman",name:"Controls Foreman",lens:"field"},{ id:"tr_ctrl_tech",name:"Controls Technician",lens:"field"},{ id:"tr_ctrl_prog",name:"Controls Programmer",lens:"tech"}]},
    { tier:"Quality",               roles:[{ id:"tr_qaqc",          name:"QA/QC",                        lens:"safety"},{ id:"tr_safety",       name:"Safety Officer",               lens:"safety"}]},
  ],
  cxa: [
    { tier:"Leadership",            roles:[{ id:"cxa_principal",    name:"Principal",                    lens:"exec"  },{ id:"cxa_director",    name:"Cx Director",                  lens:"exec"  }]},
    { tier:"Cx Operations",         roles:[{ id:"cxa_lead",         name:"Lead Cx Agent",                lens:"cx"    },{ id:"cxa_agent",       name:"Cx Agent",                     lens:"cx"    },{ id:"cxa_spec",         name:"Cx Specialist",                lens:"cx"    },{ id:"cxa_ftl",     name:"Functional Test Lead",lens:"cx"},{ id:"cxa_engineer",name:"Cx Engineer",         lens:"cx"},{ id:"cxa_sr_engineer_ee",name:"Senior Cx Engineer (EE)",lens:"cx"},{ id:"cxa_sr_engineer_me",name:"Senior Cx Engineer (ME)",lens:"cx"},{ id:"cxa_writer",name:"Cx Writer / Protocol Author",lens:"tech"},{ id:"cxa_coord",name:"Cx Coordinator",lens:"pm"}]},
    { tier:"Support",               roles:[{ id:"cxa_doc",          name:"Documentation Specialist",     lens:"tech"  }]},
  ],
  ae: [
    { tier:"Leadership",            roles:[{ id:"ae_principal",     name:"Principal in Charge",          lens:"exec"  },{ id:"ae_pm",           name:"Architectural PM",             lens:"pm"    }]},
    { tier:"Architecture",          roles:[{ id:"ae_arch",          name:"Lead Architect",               lens:"tech"  },{ id:"ae_arch_design",  name:"Design Architect",             lens:"tech"  },{ id:"ae_arch_project",  name:"Project Architect",            lens:"tech"  }]},
    { tier:"MEP Engineering",       roles:[{ id:"ae_lead_eng",      name:"Lead Engineer",                lens:"tech"  },{ id:"ae_mep_lead",     name:"MEP Engineering Lead",         lens:"tech"  },{ id:"ae_elec_eng",      name:"Electrical Engineer (PE)",     lens:"tech"  },{ id:"ae_mech_eng",name:"Mechanical Engineer (PE)",lens:"tech"},{ id:"ae_plumb_eng",name:"Plumbing Engineer",lens:"tech"},{ id:"ae_fire_eng",name:"Fire Protection Engineer",lens:"tech"},{ id:"ae_ctrl_eng",name:"Controls Engineer",lens:"tech"}]},
    { tier:"Structural / Civil",    roles:[{ id:"ae_struct",        name:"Structural Engineer (PE)",     lens:"tech"  },{ id:"ae_civil",        name:"Civil Engineer (PE)",          lens:"tech"  }]},
    { tier:"Drafting / Production", roles:[{ id:"ae_drafter",       name:"Drafter",                      lens:"tech"  }]},
    { tier:"Construction Admin",    roles:[{ id:"ae_ca_lead",       name:"CA Lead",                      lens:"tech"  },{ id:"ae_rfi_coord",    name:"RFI Coordinator",              lens:"tech"  },{ id:"ae_field_eng",     name:"Field Engineer",               lens:"tech"  }]},
  ],
  rigger: [
    { tier:"Management",            roles:[{ id:"rig_pm",           name:"Rigging PM",                   lens:"pm"    },{ id:"rig_lift_dir",    name:"Lift Director",                lens:"pm"    },{ id:"rig_eng",          name:"Rigging Engineer (Pick Plans)", lens:"tech"  }]},
    { tier:"Field Leadership",      roles:[{ id:"rig_super",        name:"Rigging Superintendent",       lens:"field" },{ id:"rig_foreman",     name:"Rigging Foreman",              lens:"field" }]},
    { tier:"Crane & Crew",          roles:[{ id:"rig_crane_op",     name:"Crane Operator (NCCCO)",       lens:"field" },{ id:"rig_crane_op_jr", name:"Junior Crane Operator",        lens:"field" },{ id:"rig_signal",       name:"Signal Person",                lens:"field" },{ id:"rig_rigger_lead",name:"Lead Rigger",lens:"field"},{ id:"rig_rigger",name:"Rigger",lens:"field"},{ id:"rig_oiler",name:"Crane Oiler",lens:"field"}]},
    { tier:"Transport",             roles:[{ id:"rig_truck_driver", name:"Heavy Haul Driver (CDL-A)",    lens:"field" },{ id:"rig_dispatch",    name:"Transport Dispatcher",         lens:"pm"    }]},
    { tier:"Safety & Quality",      roles:[{ id:"rig_safety_mgr",  name:"Rigging Safety Manager",       lens:"safety"},{ id:"rig_safety_off",  name:"Site Safety Officer",          lens:"safety"},{ id:"rig_inspector",    name:"Crane / Rigging Inspector",    lens:"safety"}]},
  ],
  builder: [
    { tier:"Executive",             roles:[{ id:"bld_proj_exec",    name:"Project Executive",            lens:"exec"  },{ id:"bld_vp_ops",      name:"VP Operations",                lens:"exec"  }]},
    { tier:"Project Management",    roles:[{ id:"bld_sr_pm",        name:"Senior PM",                    lens:"pm"    },{ id:"bld_pm",          name:"Project Manager",              lens:"pm"    },{ id:"bld_apm",          name:"Assistant PM",                 lens:"pm"    },{ id:"bld_eng",     name:"Project Engineer",  lens:"tech" }]},
    { tier:"Field Leadership",      roles:[{ id:"bld_super",        name:"Superintendent",               lens:"field" },{ id:"bld_asst_super",  name:"Assistant Super",              lens:"field" },{ id:"bld_gen_foreman",  name:"General Foreman",              lens:"field" },{ id:"bld_concrete_foreman",name:"Concrete Foreman",lens:"field"},{ id:"bld_steel_foreman",name:"Steel Foreman",lens:"field"}]},
    { tier:"Crew",                  roles:[{ id:"bld_carpenter",    name:"Carpenter",                    lens:"field" },{ id:"bld_ironworker",  name:"Ironworker",                   lens:"field" },{ id:"bld_finisher",     name:"Concrete Finisher",            lens:"field" },{ id:"bld_laborer",name:"Laborer",           lens:"field"}]},
    { tier:"Safety & Quality",      roles:[{ id:"bld_safety_mgr",  name:"Safety Manager",               lens:"safety"},{ id:"bld_qaqc",        name:"QA/QC",                        lens:"safety"}]},
    { tier:"Controls",              roles:[{ id:"bld_scheduler",    name:"Scheduler",                    lens:"pm"    },{ id:"bld_estimator",   name:"Estimator",                    lens:"sales" }]},
  ],
  security: [
    { tier:"Management",            roles:[{ id:"sec_pm",           name:"Security PM",                  lens:"pm"    },{ id:"sec_eng_mgr",     name:"Engineering Manager",          lens:"tech"  }]},
    { tier:"Engineering",           roles:[{ id:"sec_design",       name:"Security Designer",            lens:"tech"  },{ id:"sec_sys_eng",     name:"Systems Engineer",             lens:"tech"  },{ id:"sec_prog",         name:"Access Control Programmer",    lens:"tech"  },{ id:"sec_cctv_eng",name:"CCTV / Video Engineer",lens:"tech"}]},
    { tier:"Field",                 roles:[{ id:"sec_lead_tech",    name:"Lead Security Technician",     lens:"field" },{ id:"sec_tech",        name:"Security Technician",          lens:"field" },{ id:"sec_install",      name:"Low-Voltage Installer",        lens:"field" },{ id:"sec_app",     name:"Apprentice",        lens:"field"}]},
    { tier:"Operations",            roles:[{ id:"sec_console_mgr",  name:"SOC / Console Manager",        lens:"safety"},{ id:"sec_console_op",  name:"Console Operator",             lens:"safety"},{ id:"sec_guard_super",  name:"Guard Force Supervisor",       lens:"safety"}]},
    { tier:"Quality",               roles:[{ id:"sec_qaqc",         name:"QA/QC",                        lens:"safety"},{ id:"sec_safety",      name:"Safety Officer",               lens:"safety"}]},
  ],
  fire: [
    { tier:"Management",            roles:[{ id:"fa_pm",            name:"Fire Alarm PM",                lens:"pm"    },{ id:"fa_eng_mgr",      name:"Engineering Manager",          lens:"tech"  }]},
    { tier:"Engineering",           roles:[{ id:"fa_design_eng",    name:"Fire Protection Engineer (PE)",lens:"tech"  },{ id:"fa_designer",     name:"Fire Alarm Designer (NICET IV)",lens:"tech" },{ id:"fa_supp_eng",      name:"Suppression Designer",         lens:"tech"  }]},
    { tier:"Field",                 roles:[{ id:"fa_super",         name:"Fire Alarm Superintendent",    lens:"field" },{ id:"fa_lead_tech",    name:"Lead Technician (NICET III)",  lens:"field" },{ id:"fa_tech",          name:"Fire Alarm Technician (NICET II)",lens:"field"},{ id:"fa_install",name:"Installer",lens:"field"},{ id:"fa_pipe_fitter",name:"Sprinkler Pipefitter",lens:"field"}]},
    { tier:"Inspection & Test",     roles:[{ id:"fa_test_lead",     name:"Test & Inspection Lead",       lens:"cx"    },{ id:"fa_inspector",    name:"NFPA-72 Inspector",            lens:"cx"    }]},
    { tier:"Quality",               roles:[{ id:"fa_qaqc",          name:"QA/QC",                        lens:"safety"},{ id:"fa_safety",       name:"Safety Officer",               lens:"safety"}]},
  ],
  staffing: [
    { tier:"Leadership",            roles:[{ id:"st_owner",         name:"Owner / Branch Manager",       lens:"exec"  }]},
    { tier:"Sales",                 roles:[{ id:"st_acct_mgr",      name:"Account Manager",              lens:"sales" },{ id:"st_biz_dev",      name:"Business Development Rep",     lens:"sales" }]},
    { tier:"Recruiting",            roles:[{ id:"st_recr_mgr",      name:"Recruiting Manager",           lens:"pm"    },{ id:"st_recruiter",    name:"Recruiter",                    lens:"pm"    },{ id:"st_sourcer",       name:"Sourcer",                      lens:"pm"    }]},
    { tier:"Operations",            roles:[{ id:"st_ops_mgr",       name:"Operations Manager",           lens:"pm"    },{ id:"st_payroll",      name:"Payroll / Onboarding",         lens:"warr"  },{ id:"st_compliance",    name:"Compliance Officer",           lens:"safety"}]},
    { tier:"Field",                 roles:[{ id:"st_field_rep",     name:"Field Representative",         lens:"field" }]},
  ],
  integrator: [
    { tier:"Executive",             roles:[{ id:"int_principal",    name:"Principal / Owner",            lens:"exec"  },{ id:"int_vp_eng",      name:"VP Engineering",               lens:"exec"  }]},
    { tier:"Project Management",    roles:[{ id:"int_sr_pm",        name:"Senior PM",                    lens:"pm"    },{ id:"int_pm",          name:"Project Manager",              lens:"pm"    },{ id:"int_apm",          name:"Assistant PM",                 lens:"pm"    },{ id:"int_coord",   name:"Project Coordinator", lens:"pm"  }]},
    { tier:"Engineering",           roles:[{ id:"int_eng_mgr",      name:"Engineering Manager",          lens:"tech"  },{ id:"int_sr_ctrl_eng", name:"Senior Controls Engineer",     lens:"tech"  },{ id:"int_ctrl_eng",     name:"Controls Engineer",            lens:"tech"  },{ id:"int_prog",    name:"PLC / DDC Programmer",lens:"tech"},{ id:"int_scada_eng",name:"SCADA Engineer",lens:"tech"},{ id:"int_graphics",name:"Graphics / HMI Designer",lens:"tech"},{ id:"int_net_eng",name:"Network Engineer",lens:"tech"}]},
    { tier:"Factory / Shop",        roles:[{ id:"int_shop_mgr",     name:"Shop Manager",                 lens:"pm"    },{ id:"int_panel_lead",  name:"Panel Build Lead",             lens:"field" },{ id:"int_panel_tech",   name:"Panel Build Technician",       lens:"field" },{ id:"int_wireman",lens:"field",name:"Wireman"},{ id:"int_qc_factory",name:"Factory QC Inspector",lens:"safety"}]},
    { tier:"Field Service",         roles:[{ id:"int_lead_field",   name:"Lead Field Technician",        lens:"field" },{ id:"int_field_tech",  name:"Field Technician",             lens:"field" },{ id:"int_startup_eng",  name:"Startup Engineer",             lens:"cx"    },{ id:"int_cx_eng",  name:"Integrator Cx Engineer",lens:"cx"}]},
    { tier:"Sales & Estimating",    roles:[{ id:"int_sales",        name:"Sales Engineer",               lens:"sales" },{ id:"int_estimator",   name:"Estimator",                    lens:"sales" }]},
    { tier:"Safety & Quality",      roles:[{ id:"int_safety_mgr",  name:"Safety Manager",               lens:"safety"},{ id:"int_qaqc_mgr",    name:"QA/QC Manager",                lens:"safety"}]},
    { tier:"Warranty & Service",    roles:[{ id:"int_warranty",     name:"Warranty / Service Coordinator",lens:"warr" },{ id:"int_remote_ops",  name:"Remote Ops Specialist",        lens:"warr"  }]},
  ],
  controls: [
    { tier:"Management",            roles:[{ id:"ct_pm",            name:"Controls PM",                  lens:"pm"    },{ id:"ct_apm",          name:"Assistant PM",                 lens:"pm"    },{ id:"ct_eng_mgr",       name:"Engineering Manager",          lens:"tech"  }]},
    { tier:"Engineering",           roles:[{ id:"ct_sr_ctrl_eng",   name:"Senior Controls Engineer",     lens:"tech"  },{ id:"ct_ctrl_eng",     name:"Controls Engineer",            lens:"tech"  },{ id:"ct_bms_prog",      name:"BMS Programmer (Niagara/Metasys)",lens:"tech"},{ id:"ct_plc_prog",name:"PLC Programmer",lens:"tech"},{ id:"ct_graphics",name:"Graphics / HMI Designer",lens:"tech"},{ id:"ct_net_eng",name:"Network Engineer",lens:"tech"}]},
    { tier:"Field",                 roles:[{ id:"ct_super",         name:"Controls Superintendent",      lens:"field" },{ id:"ct_foreman",      name:"Controls Foreman",             lens:"field" },{ id:"ct_lead_tech",     name:"Lead Controls Technician",     lens:"field" },{ id:"ct_tech",     name:"Controls Technician", lens:"field"},{ id:"ct_app",name:"Controls Apprentice",lens:"field"}]},
    { tier:"Commissioning",         roles:[{ id:"ct_startup_eng",   name:"Startup Engineer",             lens:"cx"    },{ id:"ct_cx_eng",       name:"Cx Engineer",                  lens:"cx"    }]},
    { tier:"Quality",               roles:[{ id:"ct_qaqc",          name:"QA/QC",                        lens:"safety"},{ id:"ct_safety",       name:"Safety Officer",               lens:"safety"}]},
  ],
  lowvoltage: [
    { tier:"Management",            roles:[{ id:"lv_pm",            name:"Low-Voltage PM",               lens:"pm"    },{ id:"lv_apm",          name:"Assistant PM",                 lens:"pm"    },{ id:"lv_estimator",     name:"Estimator",                    lens:"sales" }]},
    { tier:"Engineering / Design",  roles:[{ id:"lv_designer",      name:"LV Designer (BICSI RCDD)",     lens:"tech"  },{ id:"lv_eng",          name:"LV Engineer",                  lens:"tech"  }]},
    { tier:"Field",                 roles:[{ id:"lv_super",         name:"Cabling Superintendent",       lens:"field" },{ id:"lv_foreman",      name:"Cabling Foreman",              lens:"field" },{ id:"lv_lead_tech",     name:"Lead Cabling Technician",      lens:"field" },{ id:"lv_fiber_tech",name:"Fiber Technician",lens:"field"},{ id:"lv_copper_tech",name:"Copper / Structured Cabling Tech",lens:"field"},{ id:"lv_tester",name:"Cable Tester / Certifier",lens:"field"},{ id:"lv_app",name:"Cabling Apprentice",lens:"field"}]},
    { tier:"Quality",               roles:[{ id:"lv_qaqc",          name:"QA/QC",                        lens:"safety"},{ id:"lv_safety",       name:"Safety Officer",               lens:"safety"}]},
  ],
  mechanical: [
    { tier:"Management",            roles:[{ id:"mc_pm",            name:"Mechanical PM",                lens:"pm"    },{ id:"mc_apm",          name:"Assistant PM",                 lens:"pm"    },{ id:"mc_eng",           name:"Mechanical Engineer",          lens:"tech"  },{ id:"mc_estimator",name:"Mechanical Estimator",lens:"sales"}]},
    { tier:"Field Leadership",      roles:[{ id:"mc_super",         name:"Mechanical Superintendent",    lens:"field" },{ id:"mc_gen_foreman",  name:"Mechanical General Foreman",   lens:"field" },{ id:"mc_foreman",       name:"Mechanical Foreman",           lens:"field" }]},
    { tier:"Trades",                roles:[{ id:"mc_pipefitter",    name:"Pipefitter",                   lens:"field" },{ id:"mc_journey_pf",   name:"Journeyman Pipefitter",        lens:"field" },{ id:"mc_sheet_metal",   name:"Sheet Metal Worker",           lens:"field" },{ id:"mc_journey_sm",name:"Journeyman Sheet Metal",lens:"field"},{ id:"mc_hvac_tech",name:"HVAC Installer",lens:"field"},{ id:"mc_welder",name:"Welder (Pipe/Sanitary)",lens:"field"},{ id:"mc_app",name:"Mechanical Apprentice",lens:"field"}]},
    { tier:"Quality & Safety",      roles:[{ id:"mc_qaqc",          name:"QA/QC",                        lens:"safety"},{ id:"mc_safety",       name:"Mechanical Safety Officer",    lens:"safety"}]},
  ],
  customer_const: [
    { tier:"Executive",             roles:[{ id:"cc_vp_const",      name:"VP Construction",              lens:"exec"  },{ id:"cc_dir_const",    name:"Director of Construction",     lens:"exec"  },{ id:"cc_dc_prog_dir",   name:"DC Program Director",          lens:"exec"  }]},
    { tier:"Construction Program",  roles:[{ id:"cc_prog_dir",      name:"Program Director",             lens:"exec"  },{ id:"cc_sr_const_pm",  name:"Senior Construction PM",       lens:"pm"    },{ id:"cc_const_pm",      name:"Construction PM",              lens:"pm"    },{ id:"cc_const_coord",name:"Construction Coordinator",lens:"pm"},{ id:"cc_owner_rep",name:"Owner Rep",lens:"pm"}]},
    { tier:"Technical Oversight",   roles:[{ id:"cc_mep_pm",        name:"Owner MEP PM",                 lens:"pm"    },{ id:"cc_mep_eng",      name:"Owner MEP Engineer",           lens:"tech"  },{ id:"cc_const_qaqc",    name:"Construction QA/QC",           lens:"safety"},{ id:"cc_ehs",name:"EHS Manager",lens:"safety"}]},
    { tier:"Business",              roles:[{ id:"cc_procure",       name:"Construction Procurement",     lens:"sales" },{ id:"cc_contracts",    name:"Contracts Administrator",      lens:"exec"  },{ id:"cc_finance",       name:"Construction Finance",         lens:"exec"  }]},
  ],
  operations: [
    { tier:"OEM Leadership",        roles:[{ id:"ops_oem_dir_proj", name:"Director of Projects (OEM)",   lens:"exec"  },{ id:"ops_oem_dir_fs",  name:"Director of Field Service (OEM)",lens:"exec"},{ id:"ops_oem_vp_ops",   name:"VP Operations (OEM)",          lens:"exec"  },{ id:"ops_oem_vp_eng",name:"VP Engineering (OEM)",lens:"exec"}]},
    { tier:"GC Leadership",         roles:[{ id:"ops_gc_vp_ops",    name:"VP Operations (GC)",           lens:"exec"  },{ id:"ops_gc_vp_precon",name:"VP Preconstruction (GC)",      lens:"exec"  }]},
    { tier:"CxA Leadership",        roles:[{ id:"ops_cxa_dir_cx",   name:"Director of Commissioning (CxA)",lens:"exec"}]},
    { tier:"Sales",                 roles:[{ id:"ops_sales_dir",    name:"Sales Director",               lens:"sales" },{ id:"ops_sr_acct_sales_mgr",name:"Senior Account Sales Manager",lens:"sales"},{ id:"ops_sales_mgr",name:"Sales Manager",lens:"sales"},{ id:"ops_acct_mgr",name:"Account Manager",lens:"sales"},{ id:"ops_sales_rep",name:"Sales Rep",lens:"sales"},{ id:"ops_sales_eng",name:"Sales Engineer",lens:"sales"},{ id:"ops_sol_eng",name:"Solution Engineer",lens:"sales"}]},
    { tier:"Estimating",            roles:[{ id:"ops_estimator",    name:"Estimator",                    lens:"sales" }]},
    { tier:"Finance & Project Ctrl",roles:[{ id:"ops_finance_mgr",  name:"Finance Manager",              lens:"exec"  },{ id:"ops_proj_ctrl_analyst",name:"Project Controls Analyst",lens:"pm"},{ id:"ops_payroll_spec",name:"Payroll Specialist",lens:"warr"}]},
    { tier:"HR & Training",         roles:[{ id:"ops_hr_mgr",       name:"HR Manager",                   lens:"warr"  },{ id:"ops_recruiter",   name:"Recruiter",                    lens:"pm"    },{ id:"ops_training_coord",name:"Training Coordinator",lens:"pm"}]},
    { tier:"Contracts & Procurement",roles:[{ id:"ops_contracts_admin",name:"Contracts Administrator",  lens:"exec"  },{ id:"ops_procure_mgr", name:"Procurement Manager",          lens:"sales" }]},
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// getRoleMeta — looks up role metadata from ROLE_LIBRARY by role ID string.
// Returns { id, name, lens, tier, companyType } or null if not found.
// Falls back to platform roles (SUPERADMIN / PLATFORM_ADMIN).
// ────────────────────────────────────────────────────────────────────────────
export function getRoleMeta(roleId) {
  if (!roleId) return null;
  for (const [companyType, tiers] of Object.entries(ROLE_LIBRARY)) {
    for (const tierObj of tiers) {
      for (const role of tierObj.roles) {
        if (role.id === roleId) {
          return { ...role, tier: tierObj.tier, companyType };
        }
      }
    }
  }
  if (roleId === "SUPERADMIN")    return { id: roleId, name: "Super Admin",    lens: "exec", tier: "Platform", companyType: "platform" };
  if (roleId === "PLATFORM_ADMIN") return { id: roleId, name: "Platform Admin", lens: "exec", tier: "Platform", companyType: "platform" };
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// getLensNavItems — quick-access nav items for a given lens.
// Paths map to existing app routes.
// ────────────────────────────────────────────────────────────────────────────
export function getLensNavItems(lensId) {
  const map = {
    exec:   [{ title:"Portfolio",          path:"/Portfolio"               },{ title:"P&L / Finance",      path:"/Finance/Dashboard"       },{ title:"Executive Dashboard", path:"/Executive/Dashboard"    },{ title:"KPIs",                path:"/KPIs"                    }],
    pm:     [{ title:"Schedule",           path:"/Schedule"                },{ title:"RFIs",               path:"/RFI/List"                },{ title:"Milestones",          path:"/ScheduleMilestones/List" },{ title:"Issues",              path:"/Issues/List"             }],
    field:  [{ title:"My Tasks",           path:"/Tasks/List"              },{ title:"Daily Reports",      path:"/DailyReports"            },{ title:"Field Reports",       path:"/FieldReports"            }],
    tech:   [{ title:"Submittals",         path:"/Submittals/List"         },{ title:"Documents",          path:"/Document/List"           },{ title:"RFIs",                path:"/RFI/List"                }],
    sales:  [{ title:"Leads",             path:"/CRM/Leads/List"          },{ title:"Deals",              path:"/CRM/Deals/List"          },{ title:"Contacts",            path:"/CRM/Contacts/List"       }],
    safety: [{ title:"Incidents",          path:"/Safety/Incidents"        },{ title:"Audits",             path:"/Safety/Audits"           },{ title:"NCRs",                path:"/QAQC/NCRs"               },{ title:"JHAs / Permits",      path:"/Safety/Reports"          }],
    warr:   [{ title:"Warranty / RMA",     path:"/RMA"                     },{ title:"Parts & Assets",     path:"/Assets/List"             }],
    cx:     [{ title:"Commissioning",      path:"/Commissioning"           },{ title:"Test Results",       path:"/TestResults"             }],
  };
  return map[lensId] || [];
}

export const sidebarItems = [
  // ─── Dashboards ─────────────────────────────────────────────────────
  {
    title: "Dashboards",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/",
    type: "link",
    roles: ALL,
    submenu: [
      {
        title: "GC Dashboard",
        type: "link",
        path: "/",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "OEM Dashboard",
        type: "link",
        path: "/OEM/Dashboard",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "FSM Dashboard",
        type: "link",
        path: "/Dispatch/Dashboard",
        roles: [ROLES.FSM, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Field Dashboard",
        type: "link",
        path: "/Field/Dashboard",
        roles: [ROLES.SUPERINTENDENT, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "QA/QC Dashboard",
        type: "link",
        path: "/QAQC/Dashboard",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Safety Dashboard",
        type: "link",
        path: "/Safety/Audits",
        roles: [ROLES.SAFETY, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Finance Dashboard",
        type: "link",
        path: "/Finance/Dashboard",
        roles: [ROLES.FINANCE, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Executive Dashboard",
        type: "link",
        path: "/Executive/Dashboard",
        roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
    ],
  },

  // ─── Projects ───────────────────────────────────────────────────────
  {
    title: "Projects",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Projects",
    type: "link",
    submenu: [],
    roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [
      ROLES.QA_QC,
      ROLES.CUSTOMER_OWNER_REP,
      ROLES.CC_OWNER_REP,
    ]),
  },

  // ─── CRM ────────────────────────────────────────────────────────────
  {
    title: "CRM",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/CRM/Leads/List",
    type: "link",
    roles: ALL,
    submenu: [
      { title: "Leads", type: "link", path: "/CRM/Leads/List", roles: ALL },
      { title: "Companies", type: "link", path: "/Company/List", roles: ALL },
      {
        title: "Contacts",
        type: "link",
        path: "/CRM/Contacts/List",
        roles: ALL,
      },
      { title: "Deals", type: "link", path: "/CRM/Deals/List", roles: ALL },
    ],
  },

  // ─── Operations ─────────────────────────────────────────────────────
  {
    title: "Operations",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Checklist/List",
    type: "link",
    roles: ALL,
    submenu: [
      {
        title: "Checklists",
        type: "link",
        path: "/Checklist/List",
        roles: ALL,
      },
      {
        title: "Tasks",
        type: "link",
        path: "/Tasks/List",
        roles: union(SUPERINTENDENT_ROLES, FIELD_WORKER_ROLES, PLATFORM, [
          ROLES.FSE,
          ROLES.ASP,
        ]),
      },
      {
        title: "Issues",
        type: "link",
        path: "/Issues/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FIELD_WORKER_ROLES,
          SAFETY_QA_ROLES,
          PLATFORM,
        ),
      },
      {
        title: "RFIs",
        type: "link",
        path: "/RFI/List",
        roles: ALL,
      },
      {
        title: "Meetings",
        type: "link",
        path: "/Meeting/List",
        roles: ALL,
      },
      {
        title: "Site Access (TARF)",
        type: "link",
        path: "/TARF/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          SAFETY_QA_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP],
        ),
      },
      {
        title: "Change Requests",
        type: "link",
        path: "/ChangeRequests",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM),
      },
      {
        title: "Communications",
        type: "link",
        path: "/Communications",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          SAFETY_QA_ROLES,
          PLATFORM,
        ),
      },
    ],
  },

  // ─── Scheduling ─────────────────────────────────────────────────────
  {
    title: "Scheduling",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Schedule",
    type: "link",
    roles: union(EXEC_ROLES, PM_ROLES, SUPERINTENDENT_ROLES, PLATFORM, [
      ROLES.FSE,
      ROLES.ASP,
    ]),
    submenu: [
      {
        title: "Schedule & Look-Ahead",
        type: "link",
        path: "/Schedule",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.GC_SCHEDULER,
          ROLES.SUPERINTENDENT,
          ROLES.BUILDER_SUPERINTENDENT,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Service Schedule / Dispatch",
        type: "link",
        path: "/ServiceSchedule",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Assignments",
        type: "link",
        path: "/Assignments",
        roles: [ROLES.FSM, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Schedule & Windows",
        type: "link",
        path: "/ScheduleWindows",
        roles: [ROLES.FSM, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "My Assignments",
        type: "link",
        path: "/MyAssignments",
        roles: [ROLES.FSE, ROLES.ASP, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Phases",
        type: "link",
        path: "/Phases/List",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [ROLES.GC_SCHEDULER]),
      },
      {
        title: "Schedule Milestones",
        type: "link",
        path: "/ScheduleMilestones/List",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [ROLES.GC_SCHEDULER]),
      },
      {
        title: "Phase & Milestone Wizard",
        type: "link",
        path: "/ScheduleMilestones/Wizard",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [ROLES.GC_SCHEDULER]),
      },
    ],
  },

  // ─── Field Operations ───────────────────────────────────────────────
  {
    title: "Field Operations",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Commissioning",
    type: "link",
    roles: union(
      EXEC_ROLES,
      PM_ROLES,
      SUPERINTENDENT_ROLES,
      FIELD_WORKER_ROLES,
      PLATFORM,
    ),
    submenu: [
      {
        title: "Commissioning",
        type: "link",
        path: "/Commissioning",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [
          ROLES.FSE,
          ROLES.ASP,
          ROLES.CXA_ENGINEER,
          ROLES.CXA_FIELD_AGENT,
          ROLES.CXA_FUNCTIONAL_TESTER,
          ROLES.MECH_CX_TECH,
          ROLES.CONTROLS_CX_TECH,
          ROLES.LV_CX_TECH,
          ROLES.SECURITY_CX_TECH,
          ROLES.INTEGRATOR_CX_TECH,
          ROLES.CUSTOMER_IT_MANAGER,
          ROLES.CUSTOMER_CX_WITNESS,
          ROLES.OPS_CRITICAL_TECH,
        ]),
      },
      {
        title: "Test Results Upload",
        type: "link",
        path: "/TestResults",
        roles: union(PLATFORM, [
          ROLES.FSE,
          ROLES.ASP,
          ROLES.CXA_FIELD_AGENT,
          ROLES.CXA_FUNCTIONAL_TESTER,
          ROLES.MECH_CX_TECH,
          ROLES.CONTROLS_CX_TECH,
          ROLES.LV_CX_TECH,
          ROLES.SECURITY_CX_TECH,
          ROLES.INTEGRATOR_CX_TECH,
        ]),
      },
      {
        title: "Field Reports",
        type: "link",
        path: "/FieldReports",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Daily Reports",
        type: "link",
        path: "/DailyReports",
        roles: union(SUPERINTENDENT_ROLES, PLATFORM, [
          ROLES.GC_FOREMAN,
          ROLES.BUILDER_FOREMAN,
          ROLES.TRADE_FOREMAN,
        ]),
      },
      {
        title: "Logistics",
        type: "link",
        path: "/Logistics",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
    ],
  },

  // ─── Supply Chain ───────────────────────────────────────────────────
  {
    title: "Supply Chain",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Inventory/Products/List",
    type: "link",
    roles: union(
      EXEC_ROLES,
      PM_ROLES,
      SUPERINTENDENT_ROLES,
      FINANCE_ROLES,
      PLATFORM,
      [
        ROLES.FSE,
        ROLES.ASP,
        ROLES.GC_PROCUREMENT,
        ROLES.BUILDER_ESTIMATOR,
        ROLES.TRADE_ESTIMATOR,
        ROLES.CUSTOMER_PROCUREMENT,
      ],
    ),
    submenu: [
      {
        title: "Products & SKUs",
        type: "link",
        path: "/Inventory/Products/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Stock Movements",
        type: "link",
        path: "/Inventory/Movements/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Warehouses",
        type: "link",
        path: "/Inventory/Warehouses/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Suppliers",
        type: "link",
        path: "/Inventory/Suppliers/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Shipments",
        type: "link",
        path: "/Shipments/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Carriers",
        type: "link",
        path: "/Shipments/Carriers",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "OEM Supply Chain",
        type: "link",
        path: "/SupplyChain",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Shipment Dashboard",
        type: "link",
        path: "/Shipment/Dashboard",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Receiving",
        type: "link",
        path: "/Receiving/Overview",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Assets",
        type: "link",
        path: "/Assets/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP],
        ),
      },
      {
        title: "RMA / Service",
        type: "link",
        path: "/RMA",
        roles: union(PLATFORM, [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.FSE,
          ROLES.ASP,
          ROLES.OEM_WARRANTY,
          ROLES.INTEGRATOR_WARRANTY,
          ROLES.OPS_WARRANTY_MANAGER,
        ]),
      },
    ],
  },

  // ─── Quality & Safety ───────────────────────────────────────────────
  {
    title: "Quality & Safety",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/Inspections",
    type: "link",
    roles: union(
      EXEC_ROLES,
      PM_ROLES,
      SUPERINTENDENT_ROLES,
      SAFETY_QA_ROLES,
      PLATFORM,
      [
        ROLES.CXA_ENGINEER,
        ROLES.CXA_FIELD_AGENT,
        ROLES.OEM_FACTORY_TECH,
        ROLES.MECH_CX_TECH,
        ROLES.CONTROLS_CX_TECH,
        ROLES.LV_CX_TECH,
        ROLES.CUSTOMER_IT_MANAGER,
        ROLES.CUSTOMER_CX_WITNESS,
        ROLES.CC_INSPECTOR,
      ],
    ),
    submenu: [
      {
        title: "Quality (NCR)",
        type: "link",
        path: "/Quality",
        roles: union(SUPERINTENDENT_ROLES, PLATFORM, [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.GC_FIELD_ENGINEER,
        ]),
      },
      {
        title: "Inspections",
        type: "link",
        path: "/QAQC/Inspections",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "NCRs / Defects",
        type: "link",
        path: "/QAQC/NCRs",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Corrective Actions",
        type: "link",
        path: "/QAQC/CorrectiveActions",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Evidence Library",
        type: "link",
        path: "/QAQC/EvidenceLibrary",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Safety",
        type: "link",
        path: "/Safety",
        roles: union(SUPERINTENDENT_ROLES, PLATFORM, [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.GC_SAFETY_MANAGER,
        ]),
      },
      {
        title: "JHAs / JSAs & Permits",
        type: "link",
        path: "/Safety/Reports",
        roles: union(SAFETY_QA_ROLES, PLATFORM),
      },
      {
        title: "Incidents",
        type: "link",
        path: "/Safety/Incidents",
        roles: union(SAFETY_QA_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Audits",
        type: "link",
        path: "/Safety/Audits",
        roles: union(SAFETY_QA_ROLES, PLATFORM),
      },
      {
        title: "Training Compliance",
        type: "link",
        path: "/Safety/Training",
        roles: union(SAFETY_QA_ROLES, PLATFORM),
      },
    ],
  },

  // ─── Finance ────────────────────────────────────────────────────────
  {
    title: "Finance",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/Dashboard",
    type: "link",
    roles: union(FINANCE_ROLES, PLATFORM, [
      ROLES.GC_ADMIN,
      ROLES.GC_PM,
      ROLES.GC_PROCUREMENT,
      ROLES.OEM_ADMIN,
      ROLES.OEM_PM,
      ROLES.CUSTOMER_EXEC,
      ROLES.CUSTOMER_PROGRAM_DIRECTOR,
      ROLES.CC_EXEC,
      ROLES.OPS_EXEC,
      ROLES.OPS_DIRECTOR,
    ]),
    submenu: [
      {
        title: "Dashboard",
        type: "link",
        path: "/Finance/Dashboard",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Contracts & Budget",
        type: "link",
        path: "/Finance/Contracts",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Vendor Quotes",
        type: "link",
        path: "/Finance/VendorQuotes",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Billing",
        type: "link",
        path: "/Finance/Billing",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Billing Chain",
        type: "link",
        path: "/Finance/BillingChain",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Procurement & Delays",
        type: "link",
        path: "/Finance/Procurement",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.GC_PROCUREMENT,
        ]),
      },
      {
        title: "Payroll Dashboard",
        type: "link",
        path: "/Finance/Payroll/Dashboard",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Employees",
        type: "link",
        path: "/Finance/Payroll/Employees",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Timesheets",
        type: "link",
        path: "/Finance/Payroll/Timesheets",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Payroll Processing",
        type: "link",
        path: "/Finance/Payroll/PayrollProcessing",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
    ],
  },

  // ─── People ─────────────────────────────────────────────────────────
  {
    title: "People",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Teams/List",
    type: "link",
    roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [ROLES.QA_QC]),
    submenu: [
      {
        title: "Teams",
        type: "link",
        path: "/Teams/List",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [ROLES.QA_QC]),
      },
      {
        title: "Users",
        type: "link",
        path: "/Users/List",
        roles: union(PLATFORM, [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.BUILDER_EXEC,
          ROLES.BUILDER_PM,
          ROLES.TRADE_EXEC,
          ROLES.TRADE_PM,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
    ],
  },

  // ─── Documentation ──────────────────────────────────────────────────
  {
    title: "Documentation",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Document/List",
    type: "link",
    roles: ALL,
    submenu: [
      { title: "Documents", type: "link", path: "/Document/List", roles: ALL },
      {
        title: "Submittals",
        type: "link",
        path: "/Submittals/List",
        roles: ALL,
      },
    ],
  },

  // ─── Reports ────────────────────────────────────────────────────────
  {
    title: "Reports",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Reports",
    type: "link",
    submenu: [],
    roles: union(
      EXEC_ROLES,
      PM_ROLES,
      SAFETY_QA_ROLES,
      FINANCE_ROLES,
      SALES_ROLES,
      PLATFORM,
      [
        ROLES.FSE,
        ROLES.ASP,
        ROLES.OEM_ENGINEER,
        ROLES.OEM_WARRANTY,
        ROLES.CXA_ENGINEER,
        ROLES.CXA_FIELD_AGENT,
        ROLES.TRADE_QA,
        ROLES.OPS_WARRANTY_MANAGER,
      ],
    ),
  },

  // ─── Executive ──────────────────────────────────────────────────────
  {
    title: "Executive",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Portfolio",
    type: "link",
    roles: union(PLATFORM, [
      ROLES.EXECUTIVE,
      ROLES.CUSTOMER_EXEC,
      ROLES.CUSTOMER_PROGRAM_DIRECTOR,
      ROLES.OPS_EXEC,
      ROLES.OPS_DIRECTOR,
    ]),
    submenu: [
      {
        title: "Portfolio",
        type: "link",
        path: "/Portfolio",
        roles: union(PLATFORM, [
          ROLES.EXECUTIVE,
          ROLES.CUSTOMER_EXEC,
          ROLES.CUSTOMER_PROGRAM_DIRECTOR,
          ROLES.OPS_EXEC,
          ROLES.OPS_DIRECTOR,
        ]),
      },
      {
        title: "KPIs",
        type: "link",
        path: "/KPIs",
        roles: union(PLATFORM, [
          ROLES.EXECUTIVE,
          ROLES.CUSTOMER_EXEC,
          ROLES.CUSTOMER_PROGRAM_DIRECTOR,
          ROLES.OPS_EXEC,
          ROLES.OPS_DIRECTOR,
        ]),
      },
    ],
  },

  // ─── Administration ─────────────────────────────────────────────────
  {
    title: "Administration",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Admin/OwnerPortal",
    type: "link",
    roles: ALL,
    submenu: [
      {
        title: "Owner Portal",
        type: "link",
        path: "/Admin/OwnerPortal",
        roles: ALL,
      },
      {
        title: "Tenants",
        type: "link",
        path: "/Admin/OwnerPortal/Tenants",
        roles: ALL,
      },
      {
        title: "Platform Subscriptions",
        type: "link",
        path: "/Admin/OwnerPortal/Subscriptions",
        roles: ALL,
      },
      {
        title: "Audit Logs",
        type: "link",
        path: "/Admin/OwnerPortal/AuditLogs",
        roles: ALL,
      },
      {
        title: "Roles",
        type: "link",
        path: "/Roles/List",
        roles: PLATFORM,
      },
      {
        title: "Permissions",
        type: "link",
        path: "/Permissions",
        roles: PLATFORM,
      },
      {
        title: "Subscriptions",
        type: "link",
        path: "/Subscriptions/List",
        roles: PLATFORM,
      },
      {
        title: "Org Workflows",
        type: "link",
        path: "/OrgWorkflows",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
      {
        title: "Org SOPs",
        type: "link",
        path: "/OrgSOPs",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
      {
        title: "Mob Catalog",
        type: "link",
        path: "/OrgMobCatalog",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
      {
        title: "Safety Plan Templates",
        type: "link",
        path: "/OrgSafetyPlans",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES.SAFETY,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
      {
        title: "Toolbox Talks",
        type: "link",
        path: "/OrgToolboxTalks",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES.SAFETY,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
    ],
  },

  // ─── Settings ───────────────────────────────────────────────────────
  {
    title: "Settings",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Settings",
    type: "link",
    submenu: [],
    roles: ALL,
  },
];

/**
 * Returns sidebar items filtered by role, with an optional second-layer
 * filter on accessibleModules (array of title strings from the user object).
 * When accessibleModules is present and non-empty, top-level items are only
 * shown if their title appears in the list (case-insensitive).
 * Falls back to role-only filtering when accessibleModules is null/undefined/empty.
 */
export function getMenuByRole(role, accessibleModules) {
  const moduleSet =
    Array.isArray(accessibleModules) && accessibleModules.length > 0
      ? new Set(accessibleModules.map((m) => m.toLowerCase()))
      : null;

  return sidebarItems
    .filter((item) => {
      if (item.roles && !item.roles.includes(role)) return false;
      if (moduleSet && !moduleSet.has((item.title || "").toLowerCase()))
        return false;
      return true;
    })
    .map((item) => ({
      ...item,
      submenu: (item.submenu || []).filter(
        (sub) => !sub.roles || sub.roles.includes(role),
      ),
    }));
}
