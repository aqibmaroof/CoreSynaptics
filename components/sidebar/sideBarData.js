"use client";
import config from "@/config";

{
  /** Roles for the application 
  
  [
  oem_vp_ops
oem_sales_dir
oem_vp_eng
oem_natl_pm
oem_reg_pm
oem_sr_pm
oem_pm
oem_apm
oem_coord
oem_reg_fsm
oem_lead_fse
oem_sr_fse
oem_fse
oem_app_fse
oem_svc_dispatch
oem_cx_lead
oem_sr_cx
oem_cx
oem_app_eng
oem_sr_app_eng
oem_sol_eng
oem_sales_rep
oem_inside_sales
oem_sales_eng
oem_acct_mgr
oem_safety_mgr
oem_safety_off
oem_qaqc_mgr
oem_qaqc_insp
oem_scheduler
oem_site_scheduler
oem_proj_ctrl
oem_estimator
oem_warranty_mgr
oem_warranty
oem_parts
oem_rma
oem_finance
oem_ar
oem_admin

gc_proj_exec
gc_vp_ops
gc_vp_precon
gc_sr_pm
gc_pm
gc_apm
gc_proj_eng
gc_doc_ctrl
gc_sr_super
gc_super
gc_asst_super
gc_gen_foreman
gc_foreman
gc_vp_mep
gc_sr_mep_pm
gc_mep_pm
gc_sr_mep_super
gc_mep_super
gc_asst_mep_super
gc_mep_elec_super
gc_mep_mech_super
gc_mep_coord
gc_mep_eng
gc_mep_qaqc
gc_bim_mgr
gc_vdc_coord
gc_bim_mep
gc_safety_mgr
gc_site_safety
gc_qaqc
gc_scheduler
gc_estimator
gc_buyer

cust_vp_infra
cust_dir_dc
cust_dc_prog_dir
cust_prog_dir
cust_prog_lead
cust_sr_const_pm
cust_const_coord
cust_owner_rep
cust_dc_ops
cust_facility_mgr
cust_campus_fac_mgr
cust_crit_ops_mgr
cust_chief_eng
cust_lead_bldg_eng
cust_crit_fac_eng
cust_bldg_eng
cust_elec_tech
cust_ctrl_tech
cust_net_ops
cust_sec_ops
cust_ehs_mgr
cust_procure
cust_legal
cust_finance
cust_hr
cust_payroll
cust_janitorial
cust_grounds

tr_pm
tr_apm
tr_eng
tr_estimator
tr_elec_super
tr_elec_gen_foreman
tr_elec_foreman
tr_journey
tr_app
tr_mech_estimator
tr_mech_super
tr_mech_gen_foreman
tr_mech_foreman
tr_pipefitter
tr_sheet_metal
tr_mech_app
tr_mech_safety
tr_fp_designer
tr_fp_foreman
tr_sprinkler
tr_sec_designer
tr_sec_foreman
tr_sec_acs_tech
tr_cabling_foreman
tr_fiber_tech
tr_ctrl_pm
tr_ctrl_eng
tr_ctrl_super
tr_ctrl_foreman
tr_ctrl_tech
tr_ctrl_prog
tr_qaqc
tr_safety

cxa_principal
cxa_director
cxa_lead
cxa_agent
cxa_spec
cxa_ftl
cxa_engineer
cxa_sr_engineer_ee
cxa_sr_engineer_me
cxa_writer
cxa_coord
cxa_doc

ae_principal
ae_pm
ae_arch
ae_arch_design
ae_arch_project
ae_lead_eng
ae_mep_lead
ae_elec_eng
ae_mech_eng
ae_plumb_eng
ae_fire_eng
ae_ctrl_eng
ae_struct
ae_civil
ae_drafter
ae_ca_lead
ae_rfi_coord
ae_field_eng

rig_pm
rig_lift_dir
rig_eng
rig_super
rig_foreman
rig_crane_op
rig_crane_op_jr
rig_signal
rig_rigger_lead
rig_rigger
rig_oiler
rig_truck_driver
rig_dispatch
rig_safety_mgr
rig_safety_off
rig_inspector
bld_proj_exec
bld_vp_ops
bld_sr_pm
bld_pm
bld_apm
bld_eng
bld_super
bld_asst_super
bld_gen_foreman
bld_concrete_foreman
bld_steel_foreman
bld_carpenter
bld_ironworker
bld_finisher
bld_laborer
bld_safety_mgr
bld_qaqc
bld_scheduler
bld_estimator

sec_pm
sec_eng_mgr
sec_design
sec_sys_eng
sec_prog
sec_cctv_eng
sec_lead_tech
sec_tech
sec_install
sec_app
sec_console_mgr
sec_console_op
sec_guard_super
sec_qaqc
sec_safety

fa_pm
fa_eng_mgr
fa_design_eng
fa_designer
fa_supp_eng
fa_super
fa_lead_tech
fa_tech
fa_install
fa_pipe_fitter
fa_test_lead
fa_inspector
fa_qaqc
fa_safety

st_owner
st_acct_mgr
st_biz_dev
st_recr_mgr
st_recruiter
st_sourcer
st_ops_mgr
st_payroll
st_compliance
st_field_rep

int_principal
int_vp_eng
int_sr_pm
int_pm
int_apm
int_coord
int_eng_mgr
int_sr_ctrl_eng
int_ctrl_eng
int_prog
int_scada_eng
int_graphics
int_net_eng
int_shop_mgr
int_panel_lead
int_panel_tech
int_wireman
int_qc_factory
int_lead_field
int_field_tech
int_startup_eng
int_cx_eng
int_sales
int_estimator
int_safety_mgr
int_qaqc_mgr
int_warranty
int_remote_ops

ct_pm
ct_apm
ct_eng_mgr
ct_sr_ctrl_eng
ct_ctrl_eng
ct_bms_prog
ct_plc_prog
ct_graphics
ct_net_eng
ct_super
ct_foreman
ct_lead_tech
ct_tech
ct_app
ct_startup_eng
ct_cx_eng
ct_qaqc
ct_safety

lv_pm
lv_apm
lv_estimator
lv_designer
lv_eng
lv_super
lv_foreman
lv_lead_tech
lv_fiber_tech
lv_copper_tech
lv_tester
lv_app
lv_qaqc
lv_safety

mc_pm
mc_apm
mc_eng
mc_estimator
mc_super
mc_gen_foreman
mc_foreman
mc_pipefitter
mc_journey_pf
mc_sheet_metal
mc_journey_sm
mc_hvac_tech
mc_welder
mc_app
mc_qaqc
mc_safety

ops_oem_dir_proj
ops_oem_dir_fs
ops_oem_vp_ops
ops_oem_vp_eng
ops_gc_vp_ops
ops_gc_vp_precon
ops_cxa_dir_cx
ops_sales_dir
ops_sr_acct_sales_mgr
ops_sales_mgr
ops_acct_mgr
ops_sales_rep
ops_sales_eng
ops_sol_eng
ops_estimator
ops_finance_mgr
ops_proj_ctrl_analyst
ops_payroll_spec
ops_hr_mgr
ops_recruiter
ops_training_coord
ops_contracts_admin
ops_procure_mgr

cc_vp_const
cc_dir_const
cc_dc_prog_dir
cc_prog_dir
cc_sr_const_pm
cc_const_pm
cc_const_coord
cc_owner_rep
cc_mep_pm
cc_mep_eng
cc_const_qaqc
cc_ehs
cc_procure
cc_contracts
cc_finance
]
  
  
  */
}
export const ROLES = {
  // ── OEM ──────────────────────────────────────────────────────────────────────
  OEM_VP_OPS: "oem_vp_ops",
  OEM_SALES_DIR: "oem_sales_dir",
  OEM_VP_ENG: "oem_vp_eng",
  OEM_NATL_PM: "oem_natl_pm",
  OEM_REG_PM: "oem_reg_pm",
  OEM_SR_PM: "oem_sr_pm",
  OEM_PM: "oem_pm",
  OEM_APM: "oem_apm",
  OEM_COORD: "oem_coord",
  OEM_REG_FSM: "oem_reg_fsm",
  OEM_LEAD_FSE: "oem_lead_fse",
  OEM_SR_FSE: "oem_sr_fse",
  OEM_FSE: "oem_fse",
  OEM_APP_FSE: "oem_app_fse",
  OEM_SVC_DISPATCH: "oem_svc_dispatch",
  OEM_CX_LEAD: "oem_cx_lead",
  OEM_SR_CX: "oem_sr_cx",
  OEM_CX: "oem_cx",
  OEM_APP_ENG: "oem_app_eng",
  OEM_SR_APP_ENG: "oem_sr_app_eng",
  OEM_SOL_ENG: "oem_sol_eng",
  OEM_SALES_REP: "oem_sales_rep",
  OEM_INSIDE_SALES: "oem_inside_sales",
  OEM_SALES_ENG: "oem_sales_eng",
  OEM_ACCT_MGR: "oem_acct_mgr",
  OEM_SAFETY_MGR: "oem_safety_mgr",
  OEM_SAFETY_OFF: "oem_safety_off",
  OEM_QAQC_MGR: "oem_qaqc_mgr",
  OEM_QAQC_INSP: "oem_qaqc_insp",
  OEM_SCHEDULER: "oem_scheduler",
  OEM_SITE_SCHEDULER: "oem_site_scheduler",
  OEM_PROJ_CTRL: "oem_proj_ctrl",
  OEM_ESTIMATOR: "oem_estimator",
  OEM_WARRANTY_MGR: "oem_warranty_mgr",
  OEM_WARRANTY: "oem_warranty",
  OEM_PARTS: "oem_parts",
  OEM_RMA: "oem_rma",
  OEM_FINANCE: "oem_finance",
  OEM_AR: "oem_ar",
  OEM_ADMIN: "oem_admin",
  // legacy oem aliases
  FSM: "fsm",
  FSE: "fse",
  ASP: "asp",
  OEM_SALES: "oem_sales",
  OEM_ENGINEER: "oem_engineer",
  OEM_FACTORY_TECH: "oem_factory_tech",
  // ── GC ───────────────────────────────────────────────────────────────────────
  GC_PROJ_EXEC: "gc_proj_exec",
  GC_VP_OPS: "gc_vp_ops",
  GC_VP_PRECON: "gc_vp_precon",
  GC_SR_PM: "gc_sr_pm",
  GC_PM: "gc_pm",
  GC_APM: "gc_apm",
  GC_PROJ_ENG: "gc_proj_eng",
  GC_DOC_CTRL: "gc_doc_ctrl",
  GC_SR_SUPER: "gc_sr_super",
  GC_SUPER: "gc_super",
  GC_ASST_SUPER: "gc_asst_super",
  GC_GEN_FOREMAN: "gc_gen_foreman",
  GC_FOREMAN: "gc_foreman",
  GC_VP_MEP: "gc_vp_mep",
  GC_SR_MEP_PM: "gc_sr_mep_pm",
  GC_MEP_PM: "gc_mep_pm",
  GC_SR_MEP_SUPER: "gc_sr_mep_super",
  GC_MEP_SUPER: "gc_mep_super",
  GC_ASST_MEP_SUPER: "gc_asst_mep_super",
  GC_MEP_ELEC_SUPER: "gc_mep_elec_super",
  GC_MEP_MECH_SUPER: "gc_mep_mech_super",
  GC_MEP_COORD: "gc_mep_coord",
  GC_MEP_ENG: "gc_mep_eng",
  GC_MEP_QAQC: "gc_mep_qaqc",
  GC_BIM_MGR: "gc_bim_mgr",
  GC_VDC_COORD: "gc_vdc_coord",
  GC_BIM_MEP: "gc_bim_mep",
  GC_SAFETY_MGR: "gc_safety_mgr",
  GC_SITE_SAFETY: "gc_site_safety",
  GC_QAQC: "gc_qaqc",
  GC_SCHEDULER: "gc_scheduler",
  GC_ESTIMATOR: "gc_estimator",
  GC_BUYER: "gc_buyer",
  // legacy gc aliases
  GC_ADMIN: "gc_admin",
  SUPERINTENDENT: "superintendent",
  GC_FIELD_ENGINEER: "gc_field_engineer",
  GC_PROCUREMENT: "gc_procurement",
  GC_SAFETY_MANAGER: "gc_safety_manager",
  GC_FINANCE: "gc_finance",
  // ── CUSTOMER ─────────────────────────────────────────────────────────────────
  CUST_VP_INFRA: "cust_vp_infra",
  CUST_DIR_DC: "cust_dir_dc",
  CUST_DC_PROG_DIR: "cust_dc_prog_dir",
  CUST_PROG_DIR: "cust_prog_dir",
  CUST_PROG_LEAD: "cust_prog_lead",
  CUST_SR_CONST_PM: "cust_sr_const_pm",
  CUST_CONST_COORD: "cust_const_coord",
  CUST_OWNER_REP: "cust_owner_rep",
  CUST_DC_OPS: "cust_dc_ops",
  CUST_FACILITY_MGR: "cust_facility_mgr",
  CUST_CAMPUS_FAC_MGR: "cust_campus_fac_mgr",
  CUST_CRIT_OPS_MGR: "cust_crit_ops_mgr",
  CUST_CHIEF_ENG: "cust_chief_eng",
  CUST_LEAD_BLDG_ENG: "cust_lead_bldg_eng",
  CUST_CRIT_FAC_ENG: "cust_crit_fac_eng",
  CUST_BLDG_ENG: "cust_bldg_eng",
  CUST_ELEC_TECH: "cust_elec_tech",
  CUST_CTRL_TECH: "cust_ctrl_tech",
  CUST_NET_OPS: "cust_net_ops",
  CUST_SEC_OPS: "cust_sec_ops",
  CUST_EHS_MGR: "cust_ehs_mgr",
  CUST_PROCURE: "cust_procure",
  CUST_LEGAL: "cust_legal",
  CUST_FINANCE: "cust_finance",
  CUST_HR: "cust_hr",
  CUST_PAYROLL: "cust_payroll",
  CUST_JANITORIAL: "cust_janitorial",
  CUST_GROUNDS: "cust_grounds",
  // legacy customer aliases
  CUSTOMER_EXEC: "customer_exec",
  CUSTOMER_PROGRAM_DIRECTOR: "customer_program_director",
  CUSTOMER_PM: "customer_pm",
  CUSTOMER_OWNER_REP: "customer_owner_rep",
  CUSTOMER_IT_MANAGER: "customer_it_manager",
  CUSTOMER_PROCUREMENT: "customer_procurement",
  CUSTOMER_FINANCE: "customer_finance",
  CUSTOMER_LEGAL: "customer_legal",
  CUSTOMER_CX_WITNESS: "customer_cx_witness",
  // ── TRADE ────────────────────────────────────────────────────────────────────
  TR_PM: "tr_pm",
  TR_APM: "tr_apm",
  TR_ENG: "tr_eng",
  TR_ESTIMATOR: "tr_estimator",
  TR_ELEC_SUPER: "tr_elec_super",
  TR_ELEC_GEN_FOREMAN: "tr_elec_gen_foreman",
  TR_ELEC_FOREMAN: "tr_elec_foreman",
  TR_JOURNEY: "tr_journey",
  TR_APP: "tr_app",
  TR_MECH_ESTIMATOR: "tr_mech_estimator",
  TR_MECH_SUPER: "tr_mech_super",
  TR_MECH_GEN_FOREMAN: "tr_mech_gen_foreman",
  TR_MECH_FOREMAN: "tr_mech_foreman",
  TR_PIPEFITTER: "tr_pipefitter",
  TR_SHEET_METAL: "tr_sheet_metal",
  TR_MECH_APP: "tr_mech_app",
  TR_MECH_SAFETY: "tr_mech_safety",
  TR_FP_DESIGNER: "tr_fp_designer",
  TR_FP_FOREMAN: "tr_fp_foreman",
  TR_SPRINKLER: "tr_sprinkler",
  TR_SEC_DESIGNER: "tr_sec_designer",
  TR_SEC_FOREMAN: "tr_sec_foreman",
  TR_SEC_ACS_TECH: "tr_sec_acs_tech",
  TR_CABLING_FOREMAN: "tr_cabling_foreman",
  TR_FIBER_TECH: "tr_fiber_tech",
  TR_CTRL_PM: "tr_ctrl_pm",
  TR_CTRL_ENG: "tr_ctrl_eng",
  TR_CTRL_SUPER: "tr_ctrl_super",
  TR_CTRL_FOREMAN: "tr_ctrl_foreman",
  TR_CTRL_TECH: "tr_ctrl_tech",
  TR_CTRL_PROG: "tr_ctrl_prog",
  TR_QAQC: "tr_qaqc",
  TR_SAFETY: "tr_safety",
  // legacy trade aliases
  TRADE_EXEC: "trade_exec",
  TRADE_PM: "trade_pm",
  TRADE_SUPERINTENDENT: "trade_superintendent",
  TRADE_FOREMAN: "trade_foreman",
  TRADE_JOURNEYMAN: "trade_journeyman",
  TRADE_APPRENTICE: "trade_apprentice",
  TRADE_SAFETY: "trade_safety",
  TRADE_ESTIMATOR: "trade_estimator",
  TRADE_QA: "trade_qa",
  // ── CXA ──────────────────────────────────────────────────────────────────────
  CXA_PRINCIPAL: "cxa_principal",
  CXA_DIRECTOR: "cxa_director",
  CXA_LEAD: "cxa_lead",
  CXA_AGENT: "cxa_agent",
  CXA_SPEC: "cxa_spec",
  CXA_FTL: "cxa_ftl",
  CXA_ENGINEER: "cxa_engineer",
  CXA_SR_ENGINEER_EE: "cxa_sr_engineer_ee",
  CXA_SR_ENGINEER_ME: "cxa_sr_engineer_me",
  CXA_WRITER: "cxa_writer",
  CXA_COORD: "cxa_coord",
  CXA_DOC: "cxa_doc",
  // legacy cxa aliases
  CXA_EXEC: "cxa_exec",
  CXA_PM: "cxa_pm",
  CXA_FIELD_AGENT: "cxa_field_agent",
  CXA_FUNCTIONAL_TESTER: "cxa_functional_tester",
  CXA_DOCUMENTER: "cxa_documenter",
  // ── AE ───────────────────────────────────────────────────────────────────────
  AE_PRINCIPAL: "ae_principal",
  AE_PM: "ae_pm",
  AE_ARCH: "ae_arch",
  AE_ARCH_DESIGN: "ae_arch_design",
  AE_ARCH_PROJECT: "ae_arch_project",
  AE_LEAD_ENG: "ae_lead_eng",
  AE_MEP_LEAD: "ae_mep_lead",
  AE_ELEC_ENG: "ae_elec_eng",
  AE_MECH_ENG: "ae_mech_eng",
  AE_PLUMB_ENG: "ae_plumb_eng",
  AE_FIRE_ENG: "ae_fire_eng",
  AE_CTRL_ENG: "ae_ctrl_eng",
  AE_STRUCT: "ae_struct",
  AE_CIVIL: "ae_civil",
  AE_DRAFTER: "ae_drafter",
  AE_CA_LEAD: "ae_ca_lead",
  AE_RFI_COORD: "ae_rfi_coord",
  AE_FIELD_ENG: "ae_field_eng",
  // legacy ae aliases
  AE_EXEC: "ae_exec",
  AE_ARCHITECT: "ae_architect",
  AE_STRUCTURAL_ENGINEER: "ae_structural_engineer",
  AE_MEP_ENGINEER: "ae_mep_engineer",
  AE_INSPECTOR: "ae_inspector",
  AE_CA: "ae_ca",
  // ── RIGGING ──────────────────────────────────────────────────────────────────
  RIG_PM: "rig_pm",
  RIG_LIFT_DIR: "rig_lift_dir",
  RIG_ENG: "rig_eng",
  RIG_SUPER: "rig_super",
  RIG_FOREMAN: "rig_foreman",
  RIG_CRANE_OP: "rig_crane_op",
  RIG_CRANE_OP_JR: "rig_crane_op_jr",
  RIG_SIGNAL: "rig_signal",
  RIG_RIGGER_LEAD: "rig_rigger_lead",
  RIG_RIGGER: "rig_rigger",
  RIG_OILER: "rig_oiler",
  RIG_TRUCK_DRIVER: "rig_truck_driver",
  RIG_DISPATCH: "rig_dispatch",
  RIG_SAFETY_MGR: "rig_safety_mgr",
  RIG_SAFETY_OFF: "rig_safety_off",
  RIG_INSPECTOR: "rig_inspector",
  // legacy rigger aliases
  RIGGER_EXEC: "rigger_exec",
  RIGGER_PM: "rigger_pm",
  RIGGER_SUPERINTENDENT: "rigger_superintendent",
  RIGGER_SIGNAL_PERSON: "rigger_signal_person",
  RIGGER_OPERATOR: "rigger_operator",
  RIGGER_SAFETY: "rigger_safety",
  // ── BUILDER ──────────────────────────────────────────────────────────────────
  BLD_PROJ_EXEC: "bld_proj_exec",
  BLD_VP_OPS: "bld_vp_ops",
  BLD_SR_PM: "bld_sr_pm",
  BLD_PM: "bld_pm",
  BLD_APM: "bld_apm",
  BLD_ENG: "bld_eng",
  BLD_SUPER: "bld_super",
  BLD_ASST_SUPER: "bld_asst_super",
  BLD_GEN_FOREMAN: "bld_gen_foreman",
  BLD_CONCRETE_FOREMAN: "bld_concrete_foreman",
  BLD_STEEL_FOREMAN: "bld_steel_foreman",
  BLD_CARPENTER: "bld_carpenter",
  BLD_IRONWORKER: "bld_ironworker",
  BLD_FINISHER: "bld_finisher",
  BLD_LABORER: "bld_laborer",
  BLD_SAFETY_MGR: "bld_safety_mgr",
  BLD_QAQC: "bld_qaqc",
  BLD_SCHEDULER: "bld_scheduler",
  BLD_ESTIMATOR: "bld_estimator",
  // legacy builder aliases
  BUILDER_EXEC: "builder_exec",
  BUILDER_PM: "builder_pm",
  BUILDER_SUPERINTENDENT: "builder_superintendent",
  BUILDER_ESTIMATOR: "builder_estimator",
  BUILDER_ARCHITECT: "builder_architect",
  BUILDER_SAFETY: "builder_safety",
  BUILDER_FIELD_ENGINEER: "builder_field_engineer",
  BUILDER_FOREMAN: "builder_foreman",
  // ── SECURITY ─────────────────────────────────────────────────────────────────
  SEC_PM: "sec_pm",
  SEC_ENG_MGR: "sec_eng_mgr",
  SEC_DESIGN: "sec_design",
  SEC_SYS_ENG: "sec_sys_eng",
  SEC_PROG: "sec_prog",
  SEC_CCTV_ENG: "sec_cctv_eng",
  SEC_LEAD_TECH: "sec_lead_tech",
  SEC_TECH: "sec_tech",
  SEC_INSTALL: "sec_install",
  SEC_APP: "sec_app",
  SEC_CONSOLE_MGR: "sec_console_mgr",
  SEC_CONSOLE_OP: "sec_console_op",
  SEC_GUARD_SUPER: "sec_guard_super",
  SEC_QAQC: "sec_qaqc",
  SEC_SAFETY: "sec_safety",
  // legacy security aliases
  SECURITY_EXEC: "security_exec",
  SECURITY_PM: "security_pm",
  SECURITY_ENGINEER: "security_engineer",
  SECURITY_TECHNICIAN: "security_technician",
  SECURITY_CX_TECH: "security_cx_tech",
  SECURITY_SAFETY: "security_safety",
  // ── FIRE ─────────────────────────────────────────────────────────────────────
  FA_PM: "fa_pm",
  FA_ENG_MGR: "fa_eng_mgr",
  FA_DESIGN_ENG: "fa_design_eng",
  FA_DESIGNER: "fa_designer",
  FA_SUPP_ENG: "fa_supp_eng",
  FA_SUPER: "fa_super",
  FA_LEAD_TECH: "fa_lead_tech",
  FA_TECH: "fa_tech",
  FA_INSTALL: "fa_install",
  FA_PIPE_FITTER: "fa_pipe_fitter",
  FA_TEST_LEAD: "fa_test_lead",
  FA_INSPECTOR: "fa_inspector",
  FA_QAQC: "fa_qaqc",
  FA_SAFETY: "fa_safety",
  // legacy fire aliases
  FIRE_EXEC: "fire_exec",
  FIRE_PM: "fire_pm",
  FIRE_DESIGNER: "fire_designer",
  FIRE_SUPERINTENDENT: "fire_superintendent",
  FIRE_TECHNICIAN: "fire_technician",
  FIRE_INSPECTOR: "fire_inspector",
  FIRE_SAFETY: "fire_safety",
  // ── STAFFING ─────────────────────────────────────────────────────────────────
  ST_OWNER: "st_owner",
  ST_ACCT_MGR: "st_acct_mgr",
  ST_BIZ_DEV: "st_biz_dev",
  ST_RECR_MGR: "st_recr_mgr",
  ST_RECRUITER: "st_recruiter",
  ST_SOURCER: "st_sourcer",
  ST_OPS_MGR: "st_ops_mgr",
  ST_PAYROLL: "st_payroll",
  ST_COMPLIANCE: "st_compliance",
  ST_FIELD_REP: "st_field_rep",
  // legacy staffing aliases
  STAFFING_EXEC: "staffing_exec",
  STAFFING_RECRUITER: "staffing_recruiter",
  STAFFING_PM: "staffing_pm",
  STAFFING_WORKER: "staffing_worker",
  STAFFING_ACCOUNT_MGR: "staffing_account_mgr",
  // ── INTEGRATOR ───────────────────────────────────────────────────────────────
  INT_PRINCIPAL: "int_principal",
  INT_VP_ENG: "int_vp_eng",
  INT_SR_PM: "int_sr_pm",
  INT_PM: "int_pm",
  INT_APM: "int_apm",
  INT_COORD: "int_coord",
  INT_ENG_MGR: "int_eng_mgr",
  INT_SR_CTRL_ENG: "int_sr_ctrl_eng",
  INT_CTRL_ENG: "int_ctrl_eng",
  INT_PROG: "int_prog",
  INT_SCADA_ENG: "int_scada_eng",
  INT_GRAPHICS: "int_graphics",
  INT_NET_ENG: "int_net_eng",
  INT_SHOP_MGR: "int_shop_mgr",
  INT_PANEL_LEAD: "int_panel_lead",
  INT_PANEL_TECH: "int_panel_tech",
  INT_WIREMAN: "int_wireman",
  INT_QC_FACTORY: "int_qc_factory",
  INT_LEAD_FIELD: "int_lead_field",
  INT_FIELD_TECH: "int_field_tech",
  INT_STARTUP_ENG: "int_startup_eng",
  INT_CX_ENG: "int_cx_eng",
  INT_SALES: "int_sales",
  INT_ESTIMATOR: "int_estimator",
  INT_SAFETY_MGR: "int_safety_mgr",
  INT_QAQC_MGR: "int_qaqc_mgr",
  INT_WARRANTY: "int_warranty",
  INT_REMOTE_OPS: "int_remote_ops",
  // legacy integrator aliases
  INTEGRATOR_EXEC: "integrator_exec",
  INTEGRATOR_PM: "integrator_pm",
  INTEGRATOR_LEAD_TECH: "integrator_lead_tech",
  INTEGRATOR_NETWORK_ENGINEER: "integrator_network_engineer",
  INTEGRATOR_TECHNICIAN: "integrator_technician",
  INTEGRATOR_CX_TECH: "integrator_cx_tech",
  INTEGRATOR_SAFETY: "integrator_safety",
  INTEGRATOR_WARRANTY: "integrator_warranty",
  // ── CONTROLS ─────────────────────────────────────────────────────────────────
  CT_PM: "ct_pm",
  CT_APM: "ct_apm",
  CT_ENG_MGR: "ct_eng_mgr",
  CT_SR_CTRL_ENG: "ct_sr_ctrl_eng",
  CT_CTRL_ENG: "ct_ctrl_eng",
  CT_BMS_PROG: "ct_bms_prog",
  CT_PLC_PROG: "ct_plc_prog",
  CT_GRAPHICS: "ct_graphics",
  CT_NET_ENG: "ct_net_eng",
  CT_SUPER: "ct_super",
  CT_FOREMAN: "ct_foreman",
  CT_LEAD_TECH: "ct_lead_tech",
  CT_TECH: "ct_tech",
  CT_APP: "ct_app",
  CT_STARTUP_ENG: "ct_startup_eng",
  CT_CX_ENG: "ct_cx_eng",
  CT_QAQC: "ct_qaqc",
  CT_SAFETY: "ct_safety",
  // legacy controls aliases
  CONTROLS_EXEC: "controls_exec",
  CONTROLS_PM: "controls_pm",
  CONTROLS_ENGINEER: "controls_engineer",
  CONTROLS_TECHNICIAN: "controls_technician",
  CONTROLS_CX_TECH: "controls_cx_tech",
  CONTROLS_PROGRAMMER: "controls_programmer",
  CONTROLS_SAFETY: "controls_safety",
  // ── LOW VOLTAGE ──────────────────────────────────────────────────────────────
  LV_PM: "lv_pm",
  LV_APM: "lv_apm",
  LV_ESTIMATOR: "lv_estimator",
  LV_DESIGNER: "lv_designer",
  LV_ENG: "lv_eng",
  LV_SUPER: "lv_super",
  LV_FOREMAN: "lv_foreman",
  LV_LEAD_TECH: "lv_lead_tech",
  LV_FIBER_TECH: "lv_fiber_tech",
  LV_COPPER_TECH: "lv_copper_tech",
  LV_TESTER: "lv_tester",
  LV_APP: "lv_app",
  LV_QAQC: "lv_qaqc",
  LV_SAFETY: "lv_safety",
  // legacy lv aliases
  LV_EXEC: "lv_exec",
  LV_SUPERINTENDENT: "lv_superintendent",
  LV_TECHNICIAN: "lv_technician",
  LV_CX_TECH: "lv_cx_tech",
  // ── MECHANICAL ───────────────────────────────────────────────────────────────
  MC_PM: "mc_pm",
  MC_APM: "mc_apm",
  MC_ENG: "mc_eng",
  MC_ESTIMATOR: "mc_estimator",
  MC_SUPER: "mc_super",
  MC_GEN_FOREMAN: "mc_gen_foreman",
  MC_FOREMAN: "mc_foreman",
  MC_PIPEFITTER: "mc_pipefitter",
  MC_JOURNEY_PF: "mc_journey_pf",
  MC_SHEET_METAL: "mc_sheet_metal",
  MC_JOURNEY_SM: "mc_journey_sm",
  MC_HVAC_TECH: "mc_hvac_tech",
  MC_WELDER: "mc_welder",
  MC_APP: "mc_app",
  MC_QAQC: "mc_qaqc",
  MC_SAFETY: "mc_safety",
  // legacy mechanical aliases
  MECH_EXEC: "mech_exec",
  MECH_PM: "mech_pm",
  MECH_SUPERINTENDENT: "mech_superintendent",
  MECH_FOREMAN: "mech_foreman",
  MECH_TECHNICIAN: "mech_technician",
  MECH_CX_TECH: "mech_cx_tech",
  MECH_SAFETY: "mech_safety",
  // ── OPERATIONS ───────────────────────────────────────────────────────────────
  OPS_OEM_DIR_PROJ: "ops_oem_dir_proj",
  OPS_OEM_DIR_FS: "ops_oem_dir_fs",
  OPS_OEM_VP_OPS: "ops_oem_vp_ops",
  OPS_OEM_VP_ENG: "ops_oem_vp_eng",
  OPS_GC_VP_OPS: "ops_gc_vp_ops",
  OPS_GC_VP_PRECON: "ops_gc_vp_precon",
  OPS_CXA_DIR_CX: "ops_cxa_dir_cx",
  OPS_SALES_DIR: "ops_sales_dir",
  OPS_SR_ACCT_SALES_MGR: "ops_sr_acct_sales_mgr",
  OPS_SALES_MGR: "ops_sales_mgr",
  OPS_ACCT_MGR: "ops_acct_mgr",
  OPS_SALES_REP: "ops_sales_rep",
  OPS_SALES_ENG: "ops_sales_eng",
  OPS_SOL_ENG: "ops_sol_eng",
  OPS_ESTIMATOR: "ops_estimator",
  OPS_FINANCE_MGR: "ops_finance_mgr",
  OPS_PROJ_CTRL_ANALYST: "ops_proj_ctrl_analyst",
  OPS_PAYROLL_SPEC: "ops_payroll_spec",
  OPS_HR_MGR: "ops_hr_mgr",
  OPS_RECRUITER: "ops_recruiter",
  OPS_TRAINING_COORD: "ops_training_coord",
  OPS_CONTRACTS_ADMIN: "ops_contracts_admin",
  OPS_PROCURE_MGR: "ops_procure_mgr",
  // legacy ops aliases
  OPS_EXEC: "ops_exec",
  OPS_DIRECTOR: "ops_director",
  OPS_FACILITY_MANAGER: "ops_facility_manager",
  OPS_SHIFT_SUPERVISOR: "ops_shift_supervisor",
  OPS_CRITICAL_TECH: "ops_critical_tech",
  OPS_CHANGE_MANAGER: "ops_change_manager",
  OPS_SAFETY: "ops_safety",
  OPS_WARRANTY_MANAGER: "ops_warranty_manager",
  OPS_FINANCE: "ops_finance",
  // ── CUSTOMER CONSTRUCTION ────────────────────────────────────────────────────
  CC_VP_CONST: "cc_vp_const",
  CC_DIR_CONST: "cc_dir_const",
  CC_DC_PROG_DIR: "cc_dc_prog_dir",
  CC_PROG_DIR: "cc_prog_dir",
  CC_SR_CONST_PM: "cc_sr_const_pm",
  CC_CONST_PM: "cc_const_pm",
  CC_CONST_COORD: "cc_const_coord",
  CC_OWNER_REP: "cc_owner_rep",
  CC_MEP_PM: "cc_mep_pm",
  CC_MEP_ENG: "cc_mep_eng",
  CC_CONST_QAQC: "cc_const_qaqc",
  CC_EHS: "cc_ehs",
  CC_PROCURE: "cc_procure",
  CC_CONTRACTS: "cc_contracts",
  CC_FINANCE: "cc_finance",
  // legacy cc aliases
  CC_EXEC: "cc_exec",
  CC_PM: "cc_pm",
  CC_INSPECTOR: "cc_inspector",
  // ── UNIVERSAL ────────────────────────────────────────────────────────────────
  QA_QC: "qa_manager",
  SAFETY: "safety_officer",
  FINANCE: "finance",
  EXECUTIVE: "executive",
  // ── PLATFORM ─────────────────────────────────────────────────────────────────
  SUPERADMIN: "SUPERADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
};

// ── ROLE_MODULES ─────────────────────────────────────────────────────────────
export const ROLE_MODULES = {
  OEM: [
    ROLES.OEM_VP_OPS,
    ROLES.OEM_SALES_DIR,
    ROLES.OEM_VP_ENG,
    ROLES.OEM_NATL_PM,
    ROLES.OEM_REG_PM,
    ROLES.OEM_SR_PM,
    ROLES.OEM_PM,
    ROLES.OEM_APM,
    ROLES.OEM_COORD,
    ROLES.OEM_REG_FSM,
    ROLES.OEM_LEAD_FSE,
    ROLES.OEM_SR_FSE,
    ROLES.OEM_FSE,
    ROLES.OEM_APP_FSE,
    ROLES.OEM_SVC_DISPATCH,
    ROLES.OEM_CX_LEAD,
    ROLES.OEM_SR_CX,
    ROLES.OEM_CX,
    ROLES.OEM_APP_ENG,
    ROLES.OEM_SR_APP_ENG,
    ROLES.OEM_SOL_ENG,
    ROLES.OEM_SALES_REP,
    ROLES.OEM_INSIDE_SALES,
    ROLES.OEM_SALES_ENG,
    ROLES.OEM_ACCT_MGR,
    ROLES.OEM_SAFETY_MGR,
    ROLES.OEM_SAFETY_OFF,
    ROLES.OEM_QAQC_MGR,
    ROLES.OEM_QAQC_INSP,
    ROLES.OEM_SCHEDULER,
    ROLES.OEM_SITE_SCHEDULER,
    ROLES.OEM_PROJ_CTRL,
    ROLES.OEM_ESTIMATOR,
    ROLES.OEM_WARRANTY_MGR,
    ROLES.OEM_WARRANTY,
    ROLES.OEM_PARTS,
    ROLES.OEM_RMA,
    ROLES.OEM_FINANCE,
    ROLES.OEM_AR,
    ROLES.OEM_ADMIN,
  ],
  GC: [
    ROLES.GC_PROJ_EXEC,
    ROLES.GC_VP_OPS,
    ROLES.GC_VP_PRECON,
    ROLES.GC_SR_PM,
    ROLES.GC_PM,
    ROLES.GC_APM,
    ROLES.GC_PROJ_ENG,
    ROLES.GC_DOC_CTRL,
    ROLES.GC_SR_SUPER,
    ROLES.GC_SUPER,
    ROLES.GC_ASST_SUPER,
    ROLES.GC_GEN_FOREMAN,
    ROLES.GC_FOREMAN,
    ROLES.GC_VP_MEP,
    ROLES.GC_SR_MEP_PM,
    ROLES.GC_MEP_PM,
    ROLES.GC_SR_MEP_SUPER,
    ROLES.GC_MEP_SUPER,
    ROLES.GC_ASST_MEP_SUPER,
    ROLES.GC_MEP_ELEC_SUPER,
    ROLES.GC_MEP_MECH_SUPER,
    ROLES.GC_MEP_COORD,
    ROLES.GC_MEP_ENG,
    ROLES.GC_MEP_QAQC,
    ROLES.GC_BIM_MGR,
    ROLES.GC_VDC_COORD,
    ROLES.GC_BIM_MEP,
    ROLES.GC_SAFETY_MGR,
    ROLES.GC_SITE_SAFETY,
    ROLES.GC_QAQC,
    ROLES.GC_SCHEDULER,
    ROLES.GC_ESTIMATOR,
    ROLES.GC_BUYER,
  ],
  CUSTOMER: [
    ROLES.CUST_VP_INFRA,
    ROLES.CUST_DIR_DC,
    ROLES.CUST_DC_PROG_DIR,
    ROLES.CUST_PROG_DIR,
    ROLES.CUST_PROG_LEAD,
    ROLES.CUST_SR_CONST_PM,
    ROLES.CUST_CONST_COORD,
    ROLES.CUST_OWNER_REP,
    ROLES.CUST_DC_OPS,
    ROLES.CUST_FACILITY_MGR,
    ROLES.CUST_CAMPUS_FAC_MGR,
    ROLES.CUST_CRIT_OPS_MGR,
    ROLES.CUST_CHIEF_ENG,
    ROLES.CUST_LEAD_BLDG_ENG,
    ROLES.CUST_CRIT_FAC_ENG,
    ROLES.CUST_BLDG_ENG,
    ROLES.CUST_ELEC_TECH,
    ROLES.CUST_CTRL_TECH,
    ROLES.CUST_NET_OPS,
    ROLES.CUST_SEC_OPS,
    ROLES.CUST_EHS_MGR,
    ROLES.CUST_PROCURE,
    ROLES.CUST_LEGAL,
    ROLES.CUST_FINANCE,
    ROLES.CUST_HR,
    ROLES.CUST_PAYROLL,
    ROLES.CUST_JANITORIAL,
    ROLES.CUST_GROUNDS,
  ],
  TRADE: [
    ROLES.TR_PM,
    ROLES.TR_APM,
    ROLES.TR_ENG,
    ROLES.TR_ESTIMATOR,
    ROLES.TR_ELEC_SUPER,
    ROLES.TR_ELEC_GEN_FOREMAN,
    ROLES.TR_ELEC_FOREMAN,
    ROLES.TR_JOURNEY,
    ROLES.TR_APP,
    ROLES.TR_MECH_ESTIMATOR,
    ROLES.TR_MECH_SUPER,
    ROLES.TR_MECH_GEN_FOREMAN,
    ROLES.TR_MECH_FOREMAN,
    ROLES.TR_PIPEFITTER,
    ROLES.TR_SHEET_METAL,
    ROLES.TR_MECH_APP,
    ROLES.TR_MECH_SAFETY,
    ROLES.TR_FP_DESIGNER,
    ROLES.TR_FP_FOREMAN,
    ROLES.TR_SPRINKLER,
    ROLES.TR_SEC_DESIGNER,
    ROLES.TR_SEC_FOREMAN,
    ROLES.TR_SEC_ACS_TECH,
    ROLES.TR_CABLING_FOREMAN,
    ROLES.TR_FIBER_TECH,
    ROLES.TR_CTRL_PM,
    ROLES.TR_CTRL_ENG,
    ROLES.TR_CTRL_SUPER,
    ROLES.TR_CTRL_FOREMAN,
    ROLES.TR_CTRL_TECH,
    ROLES.TR_CTRL_PROG,
    ROLES.TR_QAQC,
    ROLES.TR_SAFETY,
  ],
  CXA: [
    ROLES.CXA_PRINCIPAL,
    ROLES.CXA_DIRECTOR,
    ROLES.CXA_LEAD,
    ROLES.CXA_AGENT,
    ROLES.CXA_SPEC,
    ROLES.CXA_FTL,
    ROLES.CXA_ENGINEER,
    ROLES.CXA_SR_ENGINEER_EE,
    ROLES.CXA_SR_ENGINEER_ME,
    ROLES.CXA_WRITER,
    ROLES.CXA_COORD,
    ROLES.CXA_DOC,
  ],
  AE: [
    ROLES.AE_PRINCIPAL,
    ROLES.AE_PM,
    ROLES.AE_ARCH,
    ROLES.AE_ARCH_DESIGN,
    ROLES.AE_ARCH_PROJECT,
    ROLES.AE_LEAD_ENG,
    ROLES.AE_MEP_LEAD,
    ROLES.AE_ELEC_ENG,
    ROLES.AE_MECH_ENG,
    ROLES.AE_PLUMB_ENG,
    ROLES.AE_FIRE_ENG,
    ROLES.AE_CTRL_ENG,
    ROLES.AE_STRUCT,
    ROLES.AE_CIVIL,
    ROLES.AE_DRAFTER,
    ROLES.AE_CA_LEAD,
    ROLES.AE_RFI_COORD,
    ROLES.AE_FIELD_ENG,
  ],
  RIGGING: [
    ROLES.RIG_PM,
    ROLES.RIG_LIFT_DIR,
    ROLES.RIG_ENG,
    ROLES.RIG_SUPER,
    ROLES.RIG_FOREMAN,
    ROLES.RIG_CRANE_OP,
    ROLES.RIG_CRANE_OP_JR,
    ROLES.RIG_SIGNAL,
    ROLES.RIG_RIGGER_LEAD,
    ROLES.RIG_RIGGER,
    ROLES.RIG_OILER,
    ROLES.RIG_TRUCK_DRIVER,
    ROLES.RIG_DISPATCH,
    ROLES.RIG_SAFETY_MGR,
    ROLES.RIG_SAFETY_OFF,
    ROLES.RIG_INSPECTOR,
  ],
  BUILDER: [
    ROLES.BLD_PROJ_EXEC,
    ROLES.BLD_VP_OPS,
    ROLES.BLD_SR_PM,
    ROLES.BLD_PM,
    ROLES.BLD_APM,
    ROLES.BLD_ENG,
    ROLES.BLD_SUPER,
    ROLES.BLD_ASST_SUPER,
    ROLES.BLD_GEN_FOREMAN,
    ROLES.BLD_CONCRETE_FOREMAN,
    ROLES.BLD_STEEL_FOREMAN,
    ROLES.BLD_CARPENTER,
    ROLES.BLD_IRONWORKER,
    ROLES.BLD_FINISHER,
    ROLES.BLD_LABORER,
    ROLES.BLD_SAFETY_MGR,
    ROLES.BLD_QAQC,
    ROLES.BLD_SCHEDULER,
    ROLES.BLD_ESTIMATOR,
  ],
  SECURITY: [
    ROLES.SEC_PM,
    ROLES.SEC_ENG_MGR,
    ROLES.SEC_DESIGN,
    ROLES.SEC_SYS_ENG,
    ROLES.SEC_PROG,
    ROLES.SEC_CCTV_ENG,
    ROLES.SEC_LEAD_TECH,
    ROLES.SEC_TECH,
    ROLES.SEC_INSTALL,
    ROLES.SEC_APP,
    ROLES.SEC_CONSOLE_MGR,
    ROLES.SEC_CONSOLE_OP,
    ROLES.SEC_GUARD_SUPER,
    ROLES.SEC_QAQC,
    ROLES.SEC_SAFETY,
  ],
  FIRE: [
    ROLES.FA_PM,
    ROLES.FA_ENG_MGR,
    ROLES.FA_DESIGN_ENG,
    ROLES.FA_DESIGNER,
    ROLES.FA_SUPP_ENG,
    ROLES.FA_SUPER,
    ROLES.FA_LEAD_TECH,
    ROLES.FA_TECH,
    ROLES.FA_INSTALL,
    ROLES.FA_PIPE_FITTER,
    ROLES.FA_TEST_LEAD,
    ROLES.FA_INSPECTOR,
    ROLES.FA_QAQC,
    ROLES.FA_SAFETY,
  ],
  STAFFING: [
    ROLES.ST_OWNER,
    ROLES.ST_ACCT_MGR,
    ROLES.ST_BIZ_DEV,
    ROLES.ST_RECR_MGR,
    ROLES.ST_RECRUITER,
    ROLES.ST_SOURCER,
    ROLES.ST_OPS_MGR,
    ROLES.ST_PAYROLL,
    ROLES.ST_COMPLIANCE,
    ROLES.ST_FIELD_REP,
  ],
  INTEGRATOR: [
    ROLES.INT_PRINCIPAL,
    ROLES.INT_VP_ENG,
    ROLES.INT_SR_PM,
    ROLES.INT_PM,
    ROLES.INT_APM,
    ROLES.INT_COORD,
    ROLES.INT_ENG_MGR,
    ROLES.INT_SR_CTRL_ENG,
    ROLES.INT_CTRL_ENG,
    ROLES.INT_PROG,
    ROLES.INT_SCADA_ENG,
    ROLES.INT_GRAPHICS,
    ROLES.INT_NET_ENG,
    ROLES.INT_SHOP_MGR,
    ROLES.INT_PANEL_LEAD,
    ROLES.INT_PANEL_TECH,
    ROLES.INT_WIREMAN,
    ROLES.INT_QC_FACTORY,
    ROLES.INT_LEAD_FIELD,
    ROLES.INT_FIELD_TECH,
    ROLES.INT_STARTUP_ENG,
    ROLES.INT_CX_ENG,
    ROLES.INT_SALES,
    ROLES.INT_ESTIMATOR,
    ROLES.INT_SAFETY_MGR,
    ROLES.INT_QAQC_MGR,
    ROLES.INT_WARRANTY,
    ROLES.INT_REMOTE_OPS,
  ],
  CONTROLS: [
    ROLES.CT_PM,
    ROLES.CT_APM,
    ROLES.CT_ENG_MGR,
    ROLES.CT_SR_CTRL_ENG,
    ROLES.CT_CTRL_ENG,
    ROLES.CT_BMS_PROG,
    ROLES.CT_PLC_PROG,
    ROLES.CT_GRAPHICS,
    ROLES.CT_NET_ENG,
    ROLES.CT_SUPER,
    ROLES.CT_FOREMAN,
    ROLES.CT_LEAD_TECH,
    ROLES.CT_TECH,
    ROLES.CT_APP,
    ROLES.CT_STARTUP_ENG,
    ROLES.CT_CX_ENG,
    ROLES.CT_QAQC,
    ROLES.CT_SAFETY,
  ],
  LOW_VOLTAGE: [
    ROLES.LV_PM,
    ROLES.LV_APM,
    ROLES.LV_ESTIMATOR,
    ROLES.LV_DESIGNER,
    ROLES.LV_ENG,
    ROLES.LV_SUPER,
    ROLES.LV_FOREMAN,
    ROLES.LV_LEAD_TECH,
    ROLES.LV_FIBER_TECH,
    ROLES.LV_COPPER_TECH,
    ROLES.LV_TESTER,
    ROLES.LV_APP,
    ROLES.LV_QAQC,
    ROLES.LV_SAFETY,
  ],
  MECHANICAL: [
    ROLES.MC_PM,
    ROLES.MC_APM,
    ROLES.MC_ENG,
    ROLES.MC_ESTIMATOR,
    ROLES.MC_SUPER,
    ROLES.MC_GEN_FOREMAN,
    ROLES.MC_FOREMAN,
    ROLES.MC_PIPEFITTER,
    ROLES.MC_JOURNEY_PF,
    ROLES.MC_SHEET_METAL,
    ROLES.MC_JOURNEY_SM,
    ROLES.MC_HVAC_TECH,
    ROLES.MC_WELDER,
    ROLES.MC_APP,
    ROLES.MC_QAQC,
    ROLES.MC_SAFETY,
  ],
  OPERATIONS: [
    ROLES.OPS_OEM_DIR_PROJ,
    ROLES.OPS_OEM_DIR_FS,
    ROLES.OPS_OEM_VP_OPS,
    ROLES.OPS_OEM_VP_ENG,
    ROLES.OPS_GC_VP_OPS,
    ROLES.OPS_GC_VP_PRECON,
    ROLES.OPS_CXA_DIR_CX,
    ROLES.OPS_SALES_DIR,
    ROLES.OPS_SR_ACCT_SALES_MGR,
    ROLES.OPS_SALES_MGR,
    ROLES.OPS_ACCT_MGR,
    ROLES.OPS_SALES_REP,
    ROLES.OPS_SALES_ENG,
    ROLES.OPS_SOL_ENG,
    ROLES.OPS_ESTIMATOR,
    ROLES.OPS_FINANCE_MGR,
    ROLES.OPS_PROJ_CTRL_ANALYST,
    ROLES.OPS_PAYROLL_SPEC,
    ROLES.OPS_HR_MGR,
    ROLES.OPS_RECRUITER,
    ROLES.OPS_TRAINING_COORD,
    ROLES.OPS_CONTRACTS_ADMIN,
    ROLES.OPS_PROCURE_MGR,
  ],
  CUSTOMER_CONSTRUCTION: [
    ROLES.CC_VP_CONST,
    ROLES.CC_DIR_CONST,
    ROLES.CC_DC_PROG_DIR,
    ROLES.CC_PROG_DIR,
    ROLES.CC_SR_CONST_PM,
    ROLES.CC_CONST_PM,
    ROLES.CC_CONST_COORD,
    ROLES.CC_OWNER_REP,
    ROLES.CC_MEP_PM,
    ROLES.CC_MEP_ENG,
    ROLES.CC_CONST_QAQC,
    ROLES.CC_EHS,
    ROLES.CC_PROCURE,
    ROLES.CC_CONTRACTS,
    ROLES.CC_FINANCE,
  ],
  PLATFORM: [ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
};

// ── ROLE_LABELS ───────────────────────────────────────────────────────────────
export const ROLE_LABELS = {
  // OEM
  [ROLES.OEM_VP_OPS]: "VP Operations",
  [ROLES.OEM_SALES_DIR]: "Sales Director",
  [ROLES.OEM_VP_ENG]: "VP Engineering",
  [ROLES.OEM_NATL_PM]: "National PM",
  [ROLES.OEM_REG_PM]: "Regional PM",
  [ROLES.OEM_SR_PM]: "Senior PM",
  [ROLES.OEM_PM]: "Project Manager",
  [ROLES.OEM_APM]: "Assistant PM",
  [ROLES.OEM_COORD]: "Project Coordinator",
  [ROLES.OEM_REG_FSM]: "Regional Field Service Manager",
  [ROLES.OEM_LEAD_FSE]: "Lead FSE",
  [ROLES.OEM_SR_FSE]: "Senior FSE",
  [ROLES.OEM_FSE]: "Field Service Engineer",
  [ROLES.OEM_APP_FSE]: "Apprentice FSE",
  [ROLES.OEM_SVC_DISPATCH]: "Service Dispatch",
  [ROLES.OEM_CX_LEAD]: "Lead",
  [ROLES.OEM_SR_CX]: "Senior Engineer",
  [ROLES.OEM_CX]: "Engineer",
  [ROLES.OEM_APP_ENG]: "Application Engineer",
  [ROLES.OEM_SR_APP_ENG]: "Senior App Engineer",
  [ROLES.OEM_SOL_ENG]: "Solutions Engineer",
  [ROLES.OEM_SALES_REP]: "Sales Rep",
  [ROLES.OEM_INSIDE_SALES]: "Inside Sales",
  [ROLES.OEM_SALES_ENG]: "Sales Engineer",
  [ROLES.OEM_ACCT_MGR]: "Account Manager",
  [ROLES.OEM_SAFETY_MGR]: "Safety Manager",
  [ROLES.OEM_SAFETY_OFF]: "Site Safety Officer",
  [ROLES.OEM_QAQC_MGR]: "QA/QC Manager",
  [ROLES.OEM_QAQC_INSP]: "QA/QC Inspector",
  [ROLES.OEM_SCHEDULER]: "Scheduler",
  [ROLES.OEM_SITE_SCHEDULER]: "On-site Scheduler",
  [ROLES.OEM_PROJ_CTRL]: "Project Controls",
  [ROLES.OEM_ESTIMATOR]: "Estimator",
  [ROLES.OEM_WARRANTY_MGR]: "Warranty Manager",
  [ROLES.OEM_WARRANTY]: "Warranty Administrator",
  [ROLES.OEM_PARTS]: "Parts Coordinator",
  [ROLES.OEM_RMA]: "RMA Specialist",
  [ROLES.OEM_FINANCE]: "Finance Director",
  [ROLES.OEM_AR]: "AR Specialist",
  [ROLES.OEM_ADMIN]: "Office Admin",
  // GC
  [ROLES.GC_PROJ_EXEC]: "Project Executive",
  [ROLES.GC_VP_OPS]: "VP Operations",
  [ROLES.GC_VP_PRECON]: "VP Preconstruction",
  [ROLES.GC_SR_PM]: "Senior PM",
  [ROLES.GC_PM]: "Project Manager",
  [ROLES.GC_APM]: "Assistant PM",
  [ROLES.GC_PROJ_ENG]: "Project Engineer",
  [ROLES.GC_DOC_CTRL]: "Document Controller",
  [ROLES.GC_SR_SUPER]: "Senior Superintendent",
  [ROLES.GC_SUPER]: "Superintendent",
  [ROLES.GC_ASST_SUPER]: "Assistant Superintendent",
  [ROLES.GC_GEN_FOREMAN]: "General Foreman",
  [ROLES.GC_FOREMAN]: "Foreman",
  [ROLES.GC_VP_MEP]: "VP MEP / MEP Director",
  [ROLES.GC_SR_MEP_PM]: "Senior MEP PM",
  [ROLES.GC_MEP_PM]: "MEP Project Manager",
  [ROLES.GC_SR_MEP_SUPER]: "Senior MEP Superintendent",
  [ROLES.GC_MEP_SUPER]: "MEP Superintendent",
  [ROLES.GC_ASST_MEP_SUPER]: "Assistant MEP Superintendent",
  [ROLES.GC_MEP_ELEC_SUPER]: "Electrical Superintendent",
  [ROLES.GC_MEP_MECH_SUPER]: "Mechanical Superintendent",
  [ROLES.GC_MEP_COORD]: "MEP Coordinator",
  [ROLES.GC_MEP_ENG]: "MEP Field Engineer",
  [ROLES.GC_MEP_QAQC]: "MEP QA/QC",
  [ROLES.GC_BIM_MGR]: "BIM Manager",
  [ROLES.GC_VDC_COORD]: "VDC Coordinator",
  [ROLES.GC_BIM_MEP]: "BIM/VDC MEP Coordinator",
  [ROLES.GC_SAFETY_MGR]: "Safety Manager",
  [ROLES.GC_SITE_SAFETY]: "Site Safety Officer",
  [ROLES.GC_QAQC]: "QA/QC Manager",
  [ROLES.GC_SCHEDULER]: "Scheduler",
  [ROLES.GC_ESTIMATOR]: "Estimator",
  [ROLES.GC_BUYER]: "Buyer / Procurement",
  // Customer
  [ROLES.CUST_VP_INFRA]: "VP Infrastructure",
  [ROLES.CUST_DIR_DC]: "Director DC Construction",
  [ROLES.CUST_DC_PROG_DIR]: "DC Program Director",
  [ROLES.CUST_PROG_DIR]: "Program Director",
  [ROLES.CUST_PROG_LEAD]: "Construction Program Lead",
  [ROLES.CUST_SR_CONST_PM]: "Senior Construction PM",
  [ROLES.CUST_CONST_COORD]: "Construction Coordinator",
  [ROLES.CUST_OWNER_REP]: "Owner Rep",
  [ROLES.CUST_DC_OPS]: "DC Ops Manager",
  [ROLES.CUST_FACILITY_MGR]: "Facility Manager",
  [ROLES.CUST_CAMPUS_FAC_MGR]: "Campus Facility Manager",
  [ROLES.CUST_CRIT_OPS_MGR]: "Critical Operations Manager",
  [ROLES.CUST_CHIEF_ENG]: "Chief Engineer",
  [ROLES.CUST_LEAD_BLDG_ENG]: "Lead Building Engineer",
  [ROLES.CUST_CRIT_FAC_ENG]: "Critical Facility Engineer",
  [ROLES.CUST_BLDG_ENG]: "Building Engineer",
  [ROLES.CUST_ELEC_TECH]: "Electrical Technician",
  [ROLES.CUST_CTRL_TECH]: "Controls Technician",
  [ROLES.CUST_NET_OPS]: "Network Operations",
  [ROLES.CUST_SEC_OPS]: "Security Operations",
  [ROLES.CUST_EHS_MGR]: "EHS Manager",
  [ROLES.CUST_PROCURE]: "Procurement",
  [ROLES.CUST_LEGAL]: "Legal / Contracts",
  [ROLES.CUST_FINANCE]: "Finance",
  [ROLES.CUST_HR]: "HR",
  [ROLES.CUST_PAYROLL]: "Payroll",
  [ROLES.CUST_JANITORIAL]: "Janitorial",
  [ROLES.CUST_GROUNDS]: "Groundskeeping",
  // Trade
  [ROLES.TR_PM]: "Project Manager",
  [ROLES.TR_APM]: "Assistant PM",
  [ROLES.TR_ENG]: "Project Engineer",
  [ROLES.TR_ESTIMATOR]: "Estimator",
  [ROLES.TR_ELEC_SUPER]: "Electrical Superintendent",
  [ROLES.TR_ELEC_GEN_FOREMAN]: "Electrical General Foreman",
  [ROLES.TR_ELEC_FOREMAN]: "Electrical Foreman",
  [ROLES.TR_JOURNEY]: "Journeyman Electrician",
  [ROLES.TR_APP]: "Apprentice",
  [ROLES.TR_MECH_ESTIMATOR]: "Mechanical Estimator",
  [ROLES.TR_MECH_SUPER]: "Mechanical Superintendent",
  [ROLES.TR_MECH_GEN_FOREMAN]: "Mechanical General Foreman",
  [ROLES.TR_MECH_FOREMAN]: "Mechanical Foreman",
  [ROLES.TR_PIPEFITTER]: "Pipefitter",
  [ROLES.TR_SHEET_METAL]: "Sheet Metal Worker",
  [ROLES.TR_MECH_APP]: "Mechanical Apprentice",
  [ROLES.TR_MECH_SAFETY]: "Mechanical Safety Officer",
  [ROLES.TR_FP_DESIGNER]: "Fire Protection Designer",
  [ROLES.TR_FP_FOREMAN]: "Fire Protection Foreman",
  [ROLES.TR_SPRINKLER]: "Sprinkler Fitter",
  [ROLES.TR_SEC_DESIGNER]: "Security Designer",
  [ROLES.TR_SEC_FOREMAN]: "Security Foreman",
  [ROLES.TR_SEC_ACS_TECH]: "ACS Technician",
  [ROLES.TR_CABLING_FOREMAN]: "Cabling Foreman",
  [ROLES.TR_FIBER_TECH]: "Fiber Technician",
  [ROLES.TR_CTRL_PM]: "Controls PM",
  [ROLES.TR_CTRL_ENG]: "Controls Engineer",
  [ROLES.TR_CTRL_SUPER]: "Controls Superintendent",
  [ROLES.TR_CTRL_FOREMAN]: "Controls Foreman",
  [ROLES.TR_CTRL_TECH]: "Controls Technician",
  [ROLES.TR_CTRL_PROG]: "Controls Programmer",
  [ROLES.TR_QAQC]: "QA/QC",
  [ROLES.TR_SAFETY]: "Safety Officer",
  // CXA
  [ROLES.CXA_PRINCIPAL]: "Principal",
  [ROLES.CXA_DIRECTOR]: "Director",
  [ROLES.CXA_LEAD]: "Lead",
  [ROLES.CXA_AGENT]: "Agent",
  [ROLES.CXA_SPEC]: "Specialist",
  [ROLES.CXA_FTL]: "Functional Test Lead",
  [ROLES.CXA_ENGINEER]: "Engineer",
  [ROLES.CXA_SR_ENGINEER_EE]: "Senior Engineer (EE)",
  [ROLES.CXA_SR_ENGINEER_ME]: "Senior Engineer (ME)",
  [ROLES.CXA_WRITER]: "Writer",
  [ROLES.CXA_COORD]: "Coordinator",
  [ROLES.CXA_DOC]: "Documentation Specialist",
  // AE
  [ROLES.AE_PRINCIPAL]: "Principal",
  [ROLES.AE_PM]: "Project Manager",
  [ROLES.AE_ARCH]: "Architect",
  [ROLES.AE_ARCH_DESIGN]: "Design Architect",
  [ROLES.AE_ARCH_PROJECT]: "Project Architect",
  [ROLES.AE_LEAD_ENG]: "Lead Engineer",
  [ROLES.AE_MEP_LEAD]: "MEP Lead Engineer",
  [ROLES.AE_ELEC_ENG]: "Electrical Engineer",
  [ROLES.AE_MECH_ENG]: "Mechanical Engineer",
  [ROLES.AE_PLUMB_ENG]: "Plumbing Engineer",
  [ROLES.AE_FIRE_ENG]: "Fire Protection Engineer",
  [ROLES.AE_CTRL_ENG]: "Controls Engineer",
  [ROLES.AE_STRUCT]: "Structural Engineer",
  [ROLES.AE_CIVIL]: "Civil Engineer",
  [ROLES.AE_DRAFTER]: "Drafter / CAD Tech",
  [ROLES.AE_CA_LEAD]: "CA Lead",
  [ROLES.AE_RFI_COORD]: "RFI Coordinator",
  [ROLES.AE_FIELD_ENG]: "Field Engineer",
  // Rigging
  [ROLES.RIG_PM]: "Project Manager",
  [ROLES.RIG_LIFT_DIR]: "Lift Director",
  [ROLES.RIG_ENG]: "Rigging Engineer",
  [ROLES.RIG_SUPER]: "Superintendent",
  [ROLES.RIG_FOREMAN]: "Foreman",
  [ROLES.RIG_CRANE_OP]: "Crane Operator",
  [ROLES.RIG_CRANE_OP_JR]: "Junior Crane Operator",
  [ROLES.RIG_SIGNAL]: "Signal Person",
  [ROLES.RIG_RIGGER_LEAD]: "Lead Rigger",
  [ROLES.RIG_RIGGER]: "Rigger",
  [ROLES.RIG_OILER]: "Oiler",
  [ROLES.RIG_TRUCK_DRIVER]: "Truck Driver",
  [ROLES.RIG_DISPATCH]: "Dispatch",
  [ROLES.RIG_SAFETY_MGR]: "Safety Manager",
  [ROLES.RIG_SAFETY_OFF]: "Safety Officer",
  [ROLES.RIG_INSPECTOR]: "Inspector",
  // Builder
  [ROLES.BLD_PROJ_EXEC]: "Project Executive",
  [ROLES.BLD_VP_OPS]: "VP Operations",
  [ROLES.BLD_SR_PM]: "Senior PM",
  [ROLES.BLD_PM]: "Project Manager",
  [ROLES.BLD_APM]: "Assistant PM",
  [ROLES.BLD_ENG]: "Project Engineer",
  [ROLES.BLD_SUPER]: "Superintendent",
  [ROLES.BLD_ASST_SUPER]: "Assistant Superintendent",
  [ROLES.BLD_GEN_FOREMAN]: "General Foreman",
  [ROLES.BLD_CONCRETE_FOREMAN]: "Concrete Foreman",
  [ROLES.BLD_STEEL_FOREMAN]: "Steel Foreman",
  [ROLES.BLD_CARPENTER]: "Carpenter",
  [ROLES.BLD_IRONWORKER]: "Ironworker",
  [ROLES.BLD_FINISHER]: "Finisher",
  [ROLES.BLD_LABORER]: "Laborer",
  [ROLES.BLD_SAFETY_MGR]: "Safety Manager",
  [ROLES.BLD_QAQC]: "QA/QC",
  [ROLES.BLD_SCHEDULER]: "Scheduler",
  [ROLES.BLD_ESTIMATOR]: "Estimator",
  // Security
  [ROLES.SEC_PM]: "Project Manager",
  [ROLES.SEC_ENG_MGR]: "Engineering Manager",
  [ROLES.SEC_DESIGN]: "Security Designer",
  [ROLES.SEC_SYS_ENG]: "Systems Engineer",
  [ROLES.SEC_PROG]: "Programmer",
  [ROLES.SEC_CCTV_ENG]: "CCTV Engineer",
  [ROLES.SEC_LEAD_TECH]: "Lead Technician",
  [ROLES.SEC_TECH]: "Technician",
  [ROLES.SEC_INSTALL]: "Installer",
  [ROLES.SEC_APP]: "Apprentice",
  [ROLES.SEC_CONSOLE_MGR]: "Console Manager",
  [ROLES.SEC_CONSOLE_OP]: "Console Operator",
  [ROLES.SEC_GUARD_SUPER]: "Guard Supervisor",
  [ROLES.SEC_QAQC]: "QA/QC",
  [ROLES.SEC_SAFETY]: "Safety Officer",
  // Fire
  [ROLES.FA_PM]: "Project Manager",
  [ROLES.FA_ENG_MGR]: "Engineering Manager",
  [ROLES.FA_DESIGN_ENG]: "Design Engineer",
  [ROLES.FA_DESIGNER]: "Designer",
  [ROLES.FA_SUPP_ENG]: "Support Engineer",
  [ROLES.FA_SUPER]: "Superintendent",
  [ROLES.FA_LEAD_TECH]: "Lead Technician",
  [ROLES.FA_TECH]: "Technician",
  [ROLES.FA_INSTALL]: "Installer",
  [ROLES.FA_PIPE_FITTER]: "Pipe Fitter",
  [ROLES.FA_TEST_LEAD]: "Test Lead",
  [ROLES.FA_INSPECTOR]: "Inspector",
  [ROLES.FA_QAQC]: "QA/QC",
  [ROLES.FA_SAFETY]: "Safety Officer",
  // Staffing
  [ROLES.ST_OWNER]: "Owner",
  [ROLES.ST_ACCT_MGR]: "Account Manager",
  [ROLES.ST_BIZ_DEV]: "Business Development",
  [ROLES.ST_RECR_MGR]: "Recruiting Manager",
  [ROLES.ST_RECRUITER]: "Recruiter",
  [ROLES.ST_SOURCER]: "Sourcer",
  [ROLES.ST_OPS_MGR]: "Operations Manager",
  [ROLES.ST_PAYROLL]: "Payroll Specialist",
  [ROLES.ST_COMPLIANCE]: "Compliance Officer",
  [ROLES.ST_FIELD_REP]: "Field Representative",
  // Integrator
  [ROLES.INT_PRINCIPAL]: "Principal",
  [ROLES.INT_VP_ENG]: "VP Engineering",
  [ROLES.INT_SR_PM]: "Senior PM",
  [ROLES.INT_PM]: "Project Manager",
  [ROLES.INT_APM]: "Assistant PM",
  [ROLES.INT_COORD]: "Project Coordinator",
  [ROLES.INT_ENG_MGR]: "Engineering Manager",
  [ROLES.INT_SR_CTRL_ENG]: "Senior Controls Engineer",
  [ROLES.INT_CTRL_ENG]: "Controls Engineer",
  [ROLES.INT_PROG]: "Programmer",
  [ROLES.INT_SCADA_ENG]: "SCADA Engineer",
  [ROLES.INT_GRAPHICS]: "Graphics Developer",
  [ROLES.INT_NET_ENG]: "Network Engineer",
  [ROLES.INT_SHOP_MGR]: "Shop Manager",
  [ROLES.INT_PANEL_LEAD]: "Panel Lead",
  [ROLES.INT_PANEL_TECH]: "Panel Technician",
  [ROLES.INT_WIREMAN]: "Wireman",
  [ROLES.INT_QC_FACTORY]: "Factory QC",
  [ROLES.INT_LEAD_FIELD]: "Lead Field Technician",
  [ROLES.INT_FIELD_TECH]: "Field Technician",
  [ROLES.INT_STARTUP_ENG]: "Startup Engineer",
  [ROLES.INT_CX_ENG]: "Engineer",
  [ROLES.INT_SALES]: "Sales",
  [ROLES.INT_ESTIMATOR]: "Estimator",
  [ROLES.INT_SAFETY_MGR]: "Safety Manager",
  [ROLES.INT_QAQC_MGR]: "QA/QC Manager",
  [ROLES.INT_WARRANTY]: "Warranty",
  [ROLES.INT_REMOTE_OPS]: "Remote Operations",
  // Controls
  [ROLES.CT_PM]: "Project Manager",
  [ROLES.CT_APM]: "Assistant PM",
  [ROLES.CT_ENG_MGR]: "Engineering Manager",
  [ROLES.CT_SR_CTRL_ENG]: "Senior Controls Engineer",
  [ROLES.CT_CTRL_ENG]: "Controls Engineer",
  [ROLES.CT_BMS_PROG]: "BMS Programmer",
  [ROLES.CT_PLC_PROG]: "PLC Programmer",
  [ROLES.CT_GRAPHICS]: "Graphics Developer",
  [ROLES.CT_NET_ENG]: "Network Engineer",
  [ROLES.CT_SUPER]: "Superintendent",
  [ROLES.CT_FOREMAN]: "Foreman",
  [ROLES.CT_LEAD_TECH]: "Lead Technician",
  [ROLES.CT_TECH]: "Technician",
  [ROLES.CT_APP]: "Apprentice",
  [ROLES.CT_STARTUP_ENG]: "Startup Engineer",
  [ROLES.CT_CX_ENG]: "Engineer",
  [ROLES.CT_QAQC]: "QA/QC",
  [ROLES.CT_SAFETY]: "Safety Officer",
  // Low Voltage
  [ROLES.LV_PM]: "Project Manager",
  [ROLES.LV_APM]: "Assistant PM",
  [ROLES.LV_ESTIMATOR]: "Estimator",
  [ROLES.LV_DESIGNER]: "Designer",
  [ROLES.LV_ENG]: "Engineer",
  [ROLES.LV_SUPER]: "Superintendent",
  [ROLES.LV_FOREMAN]: "Foreman",
  [ROLES.LV_LEAD_TECH]: "Lead Technician",
  [ROLES.LV_FIBER_TECH]: "Fiber Technician",
  [ROLES.LV_COPPER_TECH]: "Copper Technician",
  [ROLES.LV_TESTER]: "Tester",
  [ROLES.LV_APP]: "Apprentice",
  [ROLES.LV_QAQC]: "QA/QC",
  [ROLES.LV_SAFETY]: "Safety Officer",
  // Mechanical
  [ROLES.MC_PM]: "Project Manager",
  [ROLES.MC_APM]: "Assistant PM",
  [ROLES.MC_ENG]: "Engineer",
  [ROLES.MC_ESTIMATOR]: "Estimator",
  [ROLES.MC_SUPER]: "Superintendent",
  [ROLES.MC_GEN_FOREMAN]: "General Foreman",
  [ROLES.MC_FOREMAN]: "Foreman",
  [ROLES.MC_PIPEFITTER]: "Pipefitter",
  [ROLES.MC_JOURNEY_PF]: "Journeyman Pipefitter",
  [ROLES.MC_SHEET_METAL]: "Sheet Metal Worker",
  [ROLES.MC_JOURNEY_SM]: "Journeyman Sheet Metal",
  [ROLES.MC_HVAC_TECH]: "HVAC Technician",
  [ROLES.MC_WELDER]: "Welder",
  [ROLES.MC_APP]: "Apprentice",
  [ROLES.MC_QAQC]: "QA/QC",
  [ROLES.MC_SAFETY]: "Safety Officer",
  // Operations
  [ROLES.OPS_OEM_DIR_PROJ]: "OEM Director of Projects",
  [ROLES.OPS_OEM_DIR_FS]: "OEM Director of Field Services",
  [ROLES.OPS_OEM_VP_OPS]: "OEM VP Operations",
  [ROLES.OPS_OEM_VP_ENG]: "OEM VP Engineering",
  [ROLES.OPS_GC_VP_OPS]: "GC VP Operations",
  [ROLES.OPS_GC_VP_PRECON]: "GC VP Preconstruction",
  [ROLES.OPS_CXA_DIR_CX]: "CxA Director of Commissioning",
  [ROLES.OPS_SALES_DIR]: "Sales Director",
  [ROLES.OPS_SR_ACCT_SALES_MGR]: "Sr. Account Sales Manager",
  [ROLES.OPS_SALES_MGR]: "Sales Manager",
  [ROLES.OPS_ACCT_MGR]: "Account Manager",
  [ROLES.OPS_SALES_REP]: "Sales Representative",
  [ROLES.OPS_SALES_ENG]: "Sales Engineer",
  [ROLES.OPS_SOL_ENG]: "Solutions Engineer",
  [ROLES.OPS_ESTIMATOR]: "Estimator",
  [ROLES.OPS_FINANCE_MGR]: "Finance Manager",
  [ROLES.OPS_PROJ_CTRL_ANALYST]: "Project Controls Analyst",
  [ROLES.OPS_PAYROLL_SPEC]: "Payroll Specialist",
  [ROLES.OPS_HR_MGR]: "HR Manager",
  [ROLES.OPS_RECRUITER]: "Recruiter",
  [ROLES.OPS_TRAINING_COORD]: "Training Coordinator",
  [ROLES.OPS_CONTRACTS_ADMIN]: "Contracts Administrator",
  [ROLES.OPS_PROCURE_MGR]: "Procurement Manager",
  // Customer Construction
  [ROLES.CC_VP_CONST]: "VP Construction",
  [ROLES.CC_DIR_CONST]: "Director of Construction",
  [ROLES.CC_DC_PROG_DIR]: "DC Program Director",
  [ROLES.CC_PROG_DIR]: "Program Director",
  [ROLES.CC_SR_CONST_PM]: "Senior Construction PM",
  [ROLES.CC_CONST_PM]: "Construction PM",
  [ROLES.CC_CONST_COORD]: "Construction Coordinator",
  [ROLES.CC_OWNER_REP]: "Owner Rep",
  [ROLES.CC_MEP_PM]: "MEP Project Manager",
  [ROLES.CC_MEP_ENG]: "MEP Engineer",
  [ROLES.CC_CONST_QAQC]: "Construction QA/QC",
  [ROLES.CC_EHS]: "EHS Manager",
  [ROLES.CC_PROCURE]: "Procurement",
  [ROLES.CC_CONTRACTS]: "Contracts Administrator",
  [ROLES.CC_FINANCE]: "Finance",
  // Platform
  [ROLES.SUPERADMIN]: "Super Admin",
  [ROLES.PLATFORM_ADMIN]: "Platform Admin",
};

// ── ROLE_TIERS ────────────────────────────────────────────────────────────────
export const ROLE_TIERS = {
  executive: [
    ROLES.OEM_VP_OPS,
    ROLES.OEM_SALES_DIR,
    ROLES.OEM_VP_ENG,
    ROLES.OEM_FINANCE,
    ROLES.GC_PROJ_EXEC,
    ROLES.GC_VP_OPS,
    ROLES.GC_VP_PRECON,
    ROLES.GC_VP_MEP,
    ROLES.CUST_VP_INFRA,
    ROLES.CUST_DIR_DC,
    ROLES.CUST_DC_PROG_DIR,
    ROLES.CUST_PROG_DIR,
    ROLES.CXA_PRINCIPAL,
    ROLES.CXA_DIRECTOR,
    ROLES.AE_PRINCIPAL,
    ROLES.RIG_LIFT_DIR,
    ROLES.BLD_PROJ_EXEC,
    ROLES.BLD_VP_OPS,
    ROLES.INT_PRINCIPAL,
    ROLES.INT_VP_ENG,
    ROLES.ST_OWNER,
    ROLES.OPS_OEM_DIR_PROJ,
    ROLES.OPS_OEM_DIR_FS,
    ROLES.OPS_OEM_VP_OPS,
    ROLES.OPS_OEM_VP_ENG,
    ROLES.OPS_GC_VP_OPS,
    ROLES.OPS_GC_VP_PRECON,
    ROLES.OPS_CXA_DIR_CX,
    ROLES.OPS_SALES_DIR,
    ROLES.CC_VP_CONST,
    ROLES.CC_DIR_CONST,
    ROLES.CC_DC_PROG_DIR,
    ROLES.CC_PROG_DIR,
    ROLES.SUPERADMIN,
    ROLES.PLATFORM_ADMIN,
    ROLES.EXECUTIVE,
  ],
  director: [
    ROLES.OEM_SALES_DIR,
    ROLES.OEM_REG_FSM,
    ROLES.GC_VP_MEP,
    ROLES.CUST_DIR_DC,
    ROLES.CUST_DC_PROG_DIR,
    ROLES.RIG_LIFT_DIR,
    ROLES.OPS_OEM_DIR_PROJ,
    ROLES.OPS_OEM_DIR_FS,
    ROLES.OPS_CXA_DIR_CX,
    ROLES.OPS_SALES_DIR,
  ],
  manager: [
    ROLES.OEM_NATL_PM,
    ROLES.OEM_REG_PM,
    ROLES.OEM_SR_PM,
    ROLES.OEM_PM,
    ROLES.OEM_WARRANTY_MGR,
    ROLES.OEM_SAFETY_MGR,
    ROLES.OEM_QAQC_MGR,
    ROLES.GC_SR_PM,
    ROLES.GC_PM,
    ROLES.GC_SR_MEP_PM,
    ROLES.GC_MEP_PM,
    ROLES.GC_BIM_MGR,
    ROLES.GC_SAFETY_MGR,
    ROLES.GC_QAQC,
    ROLES.CUST_PROG_LEAD,
    ROLES.CUST_SR_CONST_PM,
    ROLES.CUST_DC_OPS,
    ROLES.CUST_FACILITY_MGR,
    ROLES.CUST_CAMPUS_FAC_MGR,
    ROLES.CUST_CRIT_OPS_MGR,
    ROLES.CUST_EHS_MGR,
    ROLES.TR_PM,
    ROLES.SEC_PM,
    ROLES.SEC_ENG_MGR,
    ROLES.SEC_CONSOLE_MGR,
    ROLES.FA_PM,
    ROLES.FA_ENG_MGR,
    ROLES.ST_ACCT_MGR,
    ROLES.ST_RECR_MGR,
    ROLES.ST_OPS_MGR,
    ROLES.INT_SR_PM,
    ROLES.INT_PM,
    ROLES.INT_ENG_MGR,
    ROLES.INT_SHOP_MGR,
    ROLES.INT_SAFETY_MGR,
    ROLES.INT_QAQC_MGR,
    ROLES.CT_PM,
    ROLES.CT_ENG_MGR,
    ROLES.RIG_PM,
    ROLES.RIG_SAFETY_MGR,
    ROLES.BLD_SR_PM,
    ROLES.BLD_PM,
    ROLES.BLD_SAFETY_MGR,
    ROLES.LV_PM,
    ROLES.MC_PM,
    ROLES.AE_PM,
    ROLES.CXA_LEAD,
    ROLES.OPS_SALES_MGR,
    ROLES.OPS_SR_ACCT_SALES_MGR,
    ROLES.OPS_FINANCE_MGR,
    ROLES.OPS_HR_MGR,
    ROLES.OPS_PROCURE_MGR,
    ROLES.CC_SR_CONST_PM,
    ROLES.CC_CONST_PM,
  ],
  lead: [
    ROLES.OEM_LEAD_FSE,
    ROLES.OEM_CX_LEAD,
    ROLES.OEM_SR_CX,
    ROLES.OEM_SR_APP_ENG,
    ROLES.GC_SR_SUPER,
    ROLES.GC_SR_MEP_SUPER,
    ROLES.CXA_LEAD,
    ROLES.AE_LEAD_ENG,
    ROLES.AE_MEP_LEAD,
    ROLES.AE_CA_LEAD,
    ROLES.RIG_RIGGER_LEAD,
    ROLES.SEC_LEAD_TECH,
    ROLES.FA_LEAD_TECH,
    ROLES.FA_TEST_LEAD,
    ROLES.INT_PANEL_LEAD,
    ROLES.INT_LEAD_FIELD,
    ROLES.CT_LEAD_TECH,
    ROLES.LV_LEAD_TECH,
  ],
  engineer: [
    ROLES.OEM_APP_ENG,
    ROLES.OEM_SR_APP_ENG,
    ROLES.OEM_SOL_ENG,
    ROLES.OEM_SR_FSE,
    ROLES.OEM_FSE,
    ROLES.GC_PROJ_ENG,
    ROLES.GC_MEP_ENG,
    ROLES.CUST_CHIEF_ENG,
    ROLES.CUST_LEAD_BLDG_ENG,
    ROLES.CUST_CRIT_FAC_ENG,
    ROLES.CUST_BLDG_ENG,
    ROLES.TR_ENG,
    ROLES.TR_CTRL_ENG,
    ROLES.CXA_ENGINEER,
    ROLES.CXA_SR_ENGINEER_EE,
    ROLES.CXA_SR_ENGINEER_ME,
    ROLES.AE_ELEC_ENG,
    ROLES.AE_MECH_ENG,
    ROLES.AE_PLUMB_ENG,
    ROLES.AE_FIRE_ENG,
    ROLES.AE_CTRL_ENG,
    ROLES.AE_STRUCT,
    ROLES.AE_CIVIL,
    ROLES.RIG_ENG,
    ROLES.BLD_ENG,
    ROLES.SEC_SYS_ENG,
    ROLES.SEC_CCTV_ENG,
    ROLES.FA_DESIGN_ENG,
    ROLES.FA_SUPP_ENG,
    ROLES.INT_SR_CTRL_ENG,
    ROLES.INT_CTRL_ENG,
    ROLES.INT_SCADA_ENG,
    ROLES.INT_NET_ENG,
    ROLES.INT_STARTUP_ENG,
    ROLES.INT_CX_ENG,
    ROLES.CT_SR_CTRL_ENG,
    ROLES.CT_CTRL_ENG,
    ROLES.CT_NET_ENG,
    ROLES.CT_STARTUP_ENG,
    ROLES.CT_CX_ENG,
    ROLES.LV_ENG,
    ROLES.MC_ENG,
    ROLES.OPS_SALES_ENG,
    ROLES.OPS_SOL_ENG,
    ROLES.CC_MEP_ENG,
  ],
  coordinator: [
    ROLES.OEM_APM,
    ROLES.OEM_COORD,
    ROLES.OEM_PARTS,
    ROLES.OEM_SITE_SCHEDULER,
    ROLES.GC_APM,
    ROLES.GC_DOC_CTRL,
    ROLES.GC_MEP_COORD,
    ROLES.GC_VDC_COORD,
    ROLES.CUST_CONST_COORD,
    ROLES.CUST_OWNER_REP,
    ROLES.TR_APM,
    ROLES.CXA_COORD,
    ROLES.AE_RFI_COORD,
    ROLES.INT_APM,
    ROLES.INT_COORD,
    ROLES.CT_APM,
    ROLES.LV_APM,
    ROLES.MC_APM,
    ROLES.CC_CONST_COORD,
    ROLES.CC_OWNER_REP,
    ROLES.OPS_TRAINING_COORD,
    ROLES.OPS_CONTRACTS_ADMIN,
    ROLES.OPS_PROJ_CTRL_ANALYST,
  ],
  technician: [
    ROLES.OEM_APP_FSE,
    ROLES.OEM_SVC_DISPATCH,
    ROLES.CUST_ELEC_TECH,
    ROLES.CUST_CTRL_TECH,
    ROLES.TR_CTRL_TECH,
    ROLES.TR_SEC_ACS_TECH,
    ROLES.TR_FIBER_TECH,
    ROLES.SEC_TECH,
    ROLES.SEC_INSTALL,
    ROLES.FA_TECH,
    ROLES.FA_INSTALL,
    ROLES.FA_PIPE_FITTER,
    ROLES.INT_PANEL_TECH,
    ROLES.INT_FIELD_TECH,
    ROLES.CT_TECH,
    ROLES.CT_APP,
    ROLES.LV_LEAD_TECH,
    ROLES.LV_FIBER_TECH,
    ROLES.LV_COPPER_TECH,
    ROLES.LV_TESTER,
    ROLES.LV_APP,
    ROLES.MC_HVAC_TECH,
    ROLES.MC_APP,
    ROLES.RIG_CRANE_OP,
    ROLES.RIG_CRANE_OP_JR,
    ROLES.RIG_OILER,
  ],
  admin: [
    ROLES.OEM_ADMIN,
    ROLES.OEM_AR,
    ROLES.GC_DOC_CTRL,
    ROLES.GC_BUYER,
    ROLES.CUST_HR,
    ROLES.CUST_PAYROLL,
    ROLES.CUST_LEGAL,
    ROLES.ST_COMPLIANCE,
    ROLES.ST_PAYROLL,
    ROLES.OPS_CONTRACTS_ADMIN,
    ROLES.OPS_PAYROLL_SPEC,
    ROLES.CC_CONTRACTS,
    ROLES.SUPERADMIN,
    ROLES.PLATFORM_ADMIN,
  ],
  field: [
    ROLES.OEM_LEAD_FSE,
    ROLES.OEM_SR_FSE,
    ROLES.OEM_FSE,
    ROLES.OEM_APP_FSE,
    ROLES.GC_SR_SUPER,
    ROLES.GC_SUPER,
    ROLES.GC_ASST_SUPER,
    ROLES.GC_GEN_FOREMAN,
    ROLES.GC_FOREMAN,
    ROLES.GC_SR_MEP_SUPER,
    ROLES.GC_MEP_SUPER,
    ROLES.GC_ASST_MEP_SUPER,
    ROLES.GC_MEP_ELEC_SUPER,
    ROLES.GC_MEP_MECH_SUPER,
    ROLES.CUST_DC_OPS,
    ROLES.CUST_FACILITY_MGR,
    ROLES.CUST_JANITORIAL,
    ROLES.CUST_GROUNDS,
    ROLES.TR_ELEC_SUPER,
    ROLES.TR_ELEC_GEN_FOREMAN,
    ROLES.TR_ELEC_FOREMAN,
    ROLES.TR_JOURNEY,
    ROLES.TR_APP,
    ROLES.TR_MECH_SUPER,
    ROLES.TR_MECH_GEN_FOREMAN,
    ROLES.TR_MECH_FOREMAN,
    ROLES.TR_PIPEFITTER,
    ROLES.TR_SHEET_METAL,
    ROLES.TR_MECH_APP,
    ROLES.TR_FP_FOREMAN,
    ROLES.TR_SPRINKLER,
    ROLES.TR_SEC_FOREMAN,
    ROLES.TR_CABLING_FOREMAN,
    ROLES.TR_CTRL_SUPER,
    ROLES.TR_CTRL_FOREMAN,
    ROLES.RIG_SUPER,
    ROLES.RIG_FOREMAN,
    ROLES.RIG_SIGNAL,
    ROLES.RIG_RIGGER,
    ROLES.RIG_TRUCK_DRIVER,
    ROLES.RIG_DISPATCH,
    ROLES.BLD_SUPER,
    ROLES.BLD_ASST_SUPER,
    ROLES.BLD_GEN_FOREMAN,
    ROLES.BLD_CONCRETE_FOREMAN,
    ROLES.BLD_STEEL_FOREMAN,
    ROLES.BLD_CARPENTER,
    ROLES.BLD_IRONWORKER,
    ROLES.BLD_FINISHER,
    ROLES.BLD_LABORER,
    ROLES.SEC_GUARD_SUPER,
    ROLES.SEC_CONSOLE_OP,
    ROLES.FA_SUPER,
    ROLES.CT_SUPER,
    ROLES.CT_FOREMAN,
    ROLES.LV_SUPER,
    ROLES.LV_FOREMAN,
    ROLES.MC_SUPER,
    ROLES.MC_GEN_FOREMAN,
    ROLES.MC_FOREMAN,
    ROLES.MC_PIPEFITTER,
    ROLES.MC_JOURNEY_PF,
    ROLES.MC_SHEET_METAL,
    ROLES.MC_JOURNEY_SM,
    ROLES.MC_WELDER,
    ROLES.INT_WIREMAN,
    ROLES.INT_LEAD_FIELD,
    ROLES.INT_FIELD_TECH,
    ROLES.ST_FIELD_REP,
    ROLES.AE_FIELD_ENG,
    ROLES.AE_DRAFTER,
    ROLES.INT_REMOTE_OPS,
  ],
  finance: [
    ROLES.OEM_FINANCE,
    ROLES.OEM_AR,
    ROLES.CUST_FINANCE,
    ROLES.CUST_PAYROLL,
    ROLES.ST_PAYROLL,
    ROLES.OPS_FINANCE_MGR,
    ROLES.OPS_PAYROLL_SPEC,
    ROLES.CC_FINANCE,
    ROLES.FINANCE,
  ],
  safety: [
    ROLES.OEM_SAFETY_MGR,
    ROLES.OEM_SAFETY_OFF,
    ROLES.GC_SAFETY_MGR,
    ROLES.GC_SITE_SAFETY,
    ROLES.CUST_EHS_MGR,
    ROLES.CUST_SEC_OPS,
    ROLES.TR_MECH_SAFETY,
    ROLES.TR_SAFETY,
    ROLES.RIG_SAFETY_MGR,
    ROLES.RIG_SAFETY_OFF,
    ROLES.BLD_SAFETY_MGR,
    ROLES.SEC_SAFETY,
    ROLES.FA_SAFETY,
    ROLES.INT_SAFETY_MGR,
    ROLES.CT_SAFETY,
    ROLES.LV_SAFETY,
    ROLES.MC_SAFETY,
    ROLES.CC_EHS,
    ROLES.SAFETY,
  ],
  qaqc: [
    ROLES.OEM_QAQC_MGR,
    ROLES.OEM_QAQC_INSP,
    ROLES.GC_MEP_QAQC,
    ROLES.GC_QAQC,
    ROLES.TR_QAQC,
    ROLES.BLD_QAQC,
    ROLES.SEC_QAQC,
    ROLES.FA_QAQC,
    ROLES.FA_INSPECTOR,
    ROLES.INT_QAQC_MGR,
    ROLES.INT_QC_FACTORY,
    ROLES.CT_QAQC,
    ROLES.LV_QAQC,
    ROLES.MC_QAQC,
    ROLES.RIG_INSPECTOR,
    ROLES.CC_CONST_QAQC,
    ROLES.QA_QC,
  ],
  operations: [
    ROLES.OPS_OEM_DIR_PROJ,
    ROLES.OPS_OEM_DIR_FS,
    ROLES.OPS_OEM_VP_OPS,
    ROLES.OPS_OEM_VP_ENG,
    ROLES.OPS_GC_VP_OPS,
    ROLES.OPS_GC_VP_PRECON,
    ROLES.OPS_CXA_DIR_CX,
    ROLES.INT_REMOTE_OPS,
    ROLES.CUST_NET_OPS,
  ],
};

// ── ROLE_CANONICAL_GROUPS ─────────────────────────────────────────────────────
export const ROLE_CANONICAL_GROUPS = {
  PROJECT_MANAGEMENT: [
    ROLES.OEM_NATL_PM,
    ROLES.OEM_REG_PM,
    ROLES.OEM_SR_PM,
    ROLES.OEM_PM,
    ROLES.OEM_APM,
    ROLES.OEM_COORD,
    ROLES.OEM_PROJ_CTRL,
    ROLES.OEM_SCHEDULER,
    ROLES.OEM_SITE_SCHEDULER,
    ROLES.GC_SR_PM,
    ROLES.GC_PM,
    ROLES.GC_APM,
    ROLES.GC_PROJ_ENG,
    ROLES.GC_DOC_CTRL,
    ROLES.GC_SR_MEP_PM,
    ROLES.GC_MEP_PM,
    ROLES.GC_MEP_COORD,
    ROLES.GC_BIM_MGR,
    ROLES.GC_VDC_COORD,
    ROLES.GC_BIM_MEP,
    ROLES.GC_SCHEDULER,
    ROLES.CUST_PROG_LEAD,
    ROLES.CUST_SR_CONST_PM,
    ROLES.CUST_CONST_COORD,
    ROLES.TR_PM,
    ROLES.TR_APM,
    ROLES.TR_ENG,
    ROLES.TR_CTRL_PM,
    ROLES.CXA_COORD,
    ROLES.AE_PM,
    ROLES.AE_RFI_COORD,
    ROLES.RIG_PM,
    ROLES.BLD_SR_PM,
    ROLES.BLD_PM,
    ROLES.BLD_APM,
    ROLES.BLD_ENG,
    ROLES.BLD_SCHEDULER,
    ROLES.SEC_PM,
    ROLES.FA_PM,
    ROLES.INT_SR_PM,
    ROLES.INT_PM,
    ROLES.INT_APM,
    ROLES.INT_COORD,
    ROLES.CT_PM,
    ROLES.CT_APM,
    ROLES.LV_PM,
    ROLES.LV_APM,
    ROLES.MC_PM,
    ROLES.MC_APM,
    ROLES.OPS_PROJ_CTRL_ANALYST,
    ROLES.CC_SR_CONST_PM,
    ROLES.CC_CONST_PM,
    ROLES.CC_CONST_COORD,
    ROLES.CC_MEP_PM,
  ],
  FIELD_SERVICE: [
    ROLES.OEM_REG_FSM,
    ROLES.OEM_LEAD_FSE,
    ROLES.OEM_SR_FSE,
    ROLES.OEM_FSE,
    ROLES.OEM_APP_FSE,
    ROLES.OEM_SVC_DISPATCH,
    ROLES.GC_SR_SUPER,
    ROLES.GC_SUPER,
    ROLES.GC_ASST_SUPER,
    ROLES.GC_GEN_FOREMAN,
    ROLES.GC_FOREMAN,
    ROLES.GC_SR_MEP_SUPER,
    ROLES.GC_MEP_SUPER,
    ROLES.GC_ASST_MEP_SUPER,
    ROLES.GC_MEP_ELEC_SUPER,
    ROLES.GC_MEP_MECH_SUPER,
    ROLES.TR_ELEC_SUPER,
    ROLES.TR_ELEC_GEN_FOREMAN,
    ROLES.TR_ELEC_FOREMAN,
    ROLES.TR_JOURNEY,
    ROLES.TR_APP,
    ROLES.TR_MECH_SUPER,
    ROLES.TR_MECH_GEN_FOREMAN,
    ROLES.TR_MECH_FOREMAN,
    ROLES.TR_FP_FOREMAN,
    ROLES.TR_SEC_FOREMAN,
    ROLES.TR_CABLING_FOREMAN,
    ROLES.TR_CTRL_SUPER,
    ROLES.TR_CTRL_FOREMAN,
    ROLES.RIG_SUPER,
    ROLES.RIG_FOREMAN,
    ROLES.RIG_RIGGER_LEAD,
    ROLES.RIG_RIGGER,
    ROLES.RIG_CRANE_OP,
    ROLES.RIG_CRANE_OP_JR,
    ROLES.RIG_SIGNAL,
    ROLES.RIG_OILER,
    ROLES.RIG_TRUCK_DRIVER,
    ROLES.RIG_DISPATCH,
    ROLES.BLD_SUPER,
    ROLES.BLD_ASST_SUPER,
    ROLES.BLD_GEN_FOREMAN,
    ROLES.BLD_CONCRETE_FOREMAN,
    ROLES.BLD_STEEL_FOREMAN,
    ROLES.BLD_CARPENTER,
    ROLES.BLD_IRONWORKER,
    ROLES.BLD_FINISHER,
    ROLES.BLD_LABORER,
    ROLES.FA_SUPER,
    ROLES.FA_LEAD_TECH,
    ROLES.FA_TECH,
    ROLES.FA_INSTALL,
    ROLES.FA_PIPE_FITTER,
    ROLES.CT_SUPER,
    ROLES.CT_FOREMAN,
    ROLES.CT_LEAD_TECH,
    ROLES.CT_TECH,
    ROLES.LV_SUPER,
    ROLES.LV_FOREMAN,
    ROLES.LV_LEAD_TECH,
    ROLES.LV_FIBER_TECH,
    ROLES.LV_COPPER_TECH,
    ROLES.MC_SUPER,
    ROLES.MC_GEN_FOREMAN,
    ROLES.MC_FOREMAN,
    ROLES.MC_PIPEFITTER,
    ROLES.MC_JOURNEY_PF,
    ROLES.MC_SHEET_METAL,
    ROLES.MC_JOURNEY_SM,
    ROLES.MC_HVAC_TECH,
    ROLES.MC_WELDER,
    ROLES.INT_LEAD_FIELD,
    ROLES.INT_FIELD_TECH,
    ROLES.INT_REMOTE_OPS,
    ROLES.ST_FIELD_REP,
    ROLES.AE_FIELD_ENG,
  ],
  ENGINEERING: [
    ROLES.OEM_APP_ENG,
    ROLES.OEM_SR_APP_ENG,
    ROLES.OEM_SOL_ENG,
    ROLES.GC_PROJ_ENG,
    ROLES.GC_MEP_ENG,
    ROLES.CUST_CHIEF_ENG,
    ROLES.CUST_LEAD_BLDG_ENG,
    ROLES.CUST_CRIT_FAC_ENG,
    ROLES.CUST_BLDG_ENG,
    ROLES.TR_ENG,
    ROLES.TR_CTRL_ENG,
    ROLES.CXA_ENGINEER,
    ROLES.CXA_SR_ENGINEER_EE,
    ROLES.CXA_SR_ENGINEER_ME,
    ROLES.AE_LEAD_ENG,
    ROLES.AE_MEP_LEAD,
    ROLES.AE_ELEC_ENG,
    ROLES.AE_MECH_ENG,
    ROLES.AE_PLUMB_ENG,
    ROLES.AE_FIRE_ENG,
    ROLES.AE_CTRL_ENG,
    ROLES.AE_STRUCT,
    ROLES.AE_CIVIL,
    ROLES.RIG_ENG,
    ROLES.BLD_ENG,
    ROLES.SEC_SYS_ENG,
    ROLES.SEC_CCTV_ENG,
    ROLES.SEC_DESIGN,
    ROLES.SEC_PROG,
    ROLES.FA_DESIGN_ENG,
    ROLES.FA_SUPP_ENG,
    ROLES.FA_DESIGNER,
    ROLES.INT_SR_CTRL_ENG,
    ROLES.INT_CTRL_ENG,
    ROLES.INT_SCADA_ENG,
    ROLES.INT_NET_ENG,
    ROLES.INT_GRAPHICS,
    ROLES.CT_SR_CTRL_ENG,
    ROLES.CT_CTRL_ENG,
    ROLES.CT_BMS_PROG,
    ROLES.CT_PLC_PROG,
    ROLES.CT_GRAPHICS,
    ROLES.CT_NET_ENG,
    ROLES.LV_ENG,
    ROLES.LV_DESIGNER,
    ROLES.MC_ENG,
    ROLES.OPS_SALES_ENG,
    ROLES.OPS_SOL_ENG,
    ROLES.CC_MEP_ENG,
  ],
  SALES: [
    ROLES.OEM_SALES_DIR,
    ROLES.OEM_SALES_REP,
    ROLES.OEM_INSIDE_SALES,
    ROLES.OEM_SALES_ENG,
    ROLES.OEM_ACCT_MGR,
    ROLES.OEM_ESTIMATOR,
    ROLES.GC_ESTIMATOR,
    ROLES.GC_BUYER,
    ROLES.CUST_PROCURE,
    ROLES.TR_ESTIMATOR,
    ROLES.TR_MECH_ESTIMATOR,
    ROLES.BLD_ESTIMATOR,
    ROLES.LV_ESTIMATOR,
    ROLES.MC_ESTIMATOR,
    ROLES.INT_SALES,
    ROLES.INT_ESTIMATOR,
    ROLES.ST_ACCT_MGR,
    ROLES.ST_BIZ_DEV,
    ROLES.OPS_SALES_DIR,
    ROLES.OPS_SR_ACCT_SALES_MGR,
    ROLES.OPS_SALES_MGR,
    ROLES.OPS_ACCT_MGR,
    ROLES.OPS_SALES_REP,
    ROLES.OPS_SALES_ENG,
    ROLES.OPS_SOL_ENG,
    ROLES.OPS_ESTIMATOR,
  ],
  SAFETY: [
    ROLES.OEM_SAFETY_MGR,
    ROLES.OEM_SAFETY_OFF,
    ROLES.GC_SAFETY_MGR,
    ROLES.GC_SITE_SAFETY,
    ROLES.CUST_EHS_MGR,
    ROLES.CUST_SEC_OPS,
    ROLES.TR_MECH_SAFETY,
    ROLES.TR_SAFETY,
    ROLES.RIG_SAFETY_MGR,
    ROLES.RIG_SAFETY_OFF,
    ROLES.BLD_SAFETY_MGR,
    ROLES.SEC_SAFETY,
    ROLES.FA_SAFETY,
    ROLES.INT_SAFETY_MGR,
    ROLES.CT_SAFETY,
    ROLES.LV_SAFETY,
    ROLES.MC_SAFETY,
    ROLES.CC_EHS,
    ROLES.SAFETY,
  ],
  QAQC: [
    ROLES.OEM_QAQC_MGR,
    ROLES.OEM_QAQC_INSP,
    ROLES.GC_MEP_QAQC,
    ROLES.GC_QAQC,
    ROLES.TR_QAQC,
    ROLES.BLD_QAQC,
    ROLES.SEC_QAQC,
    ROLES.FA_QAQC,
    ROLES.FA_INSPECTOR,
    ROLES.FA_TEST_LEAD,
    ROLES.INT_QAQC_MGR,
    ROLES.INT_QC_FACTORY,
    ROLES.CT_QAQC,
    ROLES.LV_QAQC,
    ROLES.LV_TESTER,
    ROLES.MC_QAQC,
    ROLES.RIG_INSPECTOR,
    ROLES.CC_CONST_QAQC,
    ROLES.QA_QC,
  ],
  FINANCE: [
    ROLES.OEM_FINANCE,
    ROLES.OEM_AR,
    ROLES.CUST_FINANCE,
    ROLES.CUST_PAYROLL,
    ROLES.ST_PAYROLL,
    ROLES.OPS_FINANCE_MGR,
    ROLES.OPS_PAYROLL_SPEC,
    ROLES.CC_FINANCE,
    ROLES.CC_PROCURE,
    ROLES.CC_CONTRACTS,
    ROLES.OPS_CONTRACTS_ADMIN,
    ROLES.CUST_PROCURE,
    ROLES.OPS_PROCURE_MGR,
    ROLES.FINANCE,
  ],
  OPERATIONS: [
    ROLES.OPS_OEM_DIR_PROJ,
    ROLES.OPS_OEM_DIR_FS,
    ROLES.OPS_OEM_VP_OPS,
    ROLES.OPS_OEM_VP_ENG,
    ROLES.OPS_GC_VP_OPS,
    ROLES.OPS_GC_VP_PRECON,
    ROLES.OPS_CXA_DIR_CX,
    ROLES.CUST_DC_OPS,
    ROLES.CUST_FACILITY_MGR,
    ROLES.CUST_CAMPUS_FAC_MGR,
    ROLES.CUST_CRIT_OPS_MGR,
    ROLES.CUST_NET_OPS,
    ROLES.INT_REMOTE_OPS,
    ROLES.ST_OPS_MGR,
  ],
  CONTROLS: [
    ROLES.TR_CTRL_PM,
    ROLES.TR_CTRL_ENG,
    ROLES.TR_CTRL_SUPER,
    ROLES.TR_CTRL_FOREMAN,
    ROLES.TR_CTRL_TECH,
    ROLES.TR_CTRL_PROG,
    ROLES.CT_PM,
    ROLES.CT_APM,
    ROLES.CT_ENG_MGR,
    ROLES.CT_SR_CTRL_ENG,
    ROLES.CT_CTRL_ENG,
    ROLES.CT_BMS_PROG,
    ROLES.CT_PLC_PROG,
    ROLES.CT_GRAPHICS,
    ROLES.CT_NET_ENG,
    ROLES.CT_SUPER,
    ROLES.CT_FOREMAN,
    ROLES.CT_LEAD_TECH,
    ROLES.CT_TECH,
    ROLES.CT_APP,
    ROLES.CT_STARTUP_ENG,
    ROLES.CT_CX_ENG,
    ROLES.INT_SR_CTRL_ENG,
    ROLES.INT_CTRL_ENG,
    ROLES.INT_PROG,
    ROLES.INT_SCADA_ENG,
    ROLES.AE_CTRL_ENG,
    ROLES.CUST_CTRL_TECH,
  ],
  CX: [
    ROLES.OEM_CX_LEAD,
    ROLES.OEM_SR_CX,
    ROLES.OEM_CX,
    ROLES.CXA_PRINCIPAL,
    ROLES.CXA_DIRECTOR,
    ROLES.CXA_LEAD,
    ROLES.CXA_AGENT,
    ROLES.CXA_SPEC,
    ROLES.CXA_FTL,
    ROLES.CXA_ENGINEER,
    ROLES.CXA_SR_ENGINEER_EE,
    ROLES.CXA_SR_ENGINEER_ME,
    ROLES.CXA_WRITER,
    ROLES.CXA_COORD,
    ROLES.CXA_DOC,
    ROLES.INT_CX_ENG,
    ROLES.CT_CX_ENG,
    ROLES.INT_STARTUP_ENG,
    ROLES.CT_STARTUP_ENG,
  ],
  PROCUREMENT: [
    ROLES.GC_BUYER,
    ROLES.CUST_PROCURE,
    ROLES.CUST_LEGAL,
    ROLES.OPS_PROCURE_MGR,
    ROLES.OPS_CONTRACTS_ADMIN,
    ROLES.CC_PROCURE,
    ROLES.CC_CONTRACTS,
    ROLES.OEM_PARTS,
    ROLES.OEM_RMA,
    ROLES.INT_WARRANTY,
    ROLES.OEM_WARRANTY,
    ROLES.OEM_WARRANTY_MGR,
    ROLES.ST_COMPLIANCE,
  ],
};

const ALL = Object.values(ROLES);

// Helper: union of role arrays (deduped)
const union = (...arrays) => [...new Set(arrays.flat())];

// ── Role Groups ───────────────────────────────────────────────────────────────
// Used to build sidebar item role lists without repeating every role name.

// Platform admins always get everything
const PLATFORM = [ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN];

// ── Org-admin roles (the catalog `isAdmin` role per company type) ────────────
// Exactly the set the backend CompanyAdminGuard resolves to via the role catalog
// — ONE designated admin per company type. The RBAC-admin "Roles & Access" screen
// is gated to these (+ SUPERADMIN), NOT the broad EXEC tier: a Project Executive /
// VP Ops who is NOT the designated admin must not see the link (they'd hit the
// guard's "Admin access required"). Mirrors rbac-catalog.ts isAdmin keys.
const ORG_ADMIN_ROLES = [
  ROLES.OEM_VP_OPS,
  ROLES.GC_PROJ_EXEC,
  ROLES.CUST_VP_INFRA,
  ROLES.TR_PM,
  ROLES.CXA_PRINCIPAL,
  ROLES.AE_PRINCIPAL,
  ROLES.RIG_PM,
  ROLES.BLD_PROJ_EXEC,
  ROLES.SEC_PM,
  ROLES.FA_PM,
  ROLES.ST_OWNER,
  ROLES.INT_PRINCIPAL,
  ROLES.CT_PM,
  ROLES.LV_PM,
  ROLES.MC_PM,
  ROLES.OPS_OEM_DIR_PROJ,
  ROLES.CC_VP_CONST,
];

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

// Safety and quality specialists — includes all granular QAQC roles
const SAFETY_QA_ROLES = [
  // universal
  ROLES.QA_QC,
  ROLES.SAFETY,
  // safety officers/managers
  // ROLES.GC_SAFETY_MANAGER,
  // ROLES.GC_SAFETY_MGR,
  // ROLES.GC_SITE_SAFETY,
  // ROLES.BUILDER_SAFETY,
  // ROLES.BLD_SAFETY_MGR,
  // ROLES.TRADE_SAFETY,
  ROLES.TRADE_QA,
  // ROLES.TR_SAFETY,
  // ROLES.TR_MECH_SAFETY,
  // ROLES.MECH_SAFETY,
  // ROLES.CONTROLS_SAFETY,
  // ROLES.LV_SAFETY,
  ROLES.LV_QAQC,
  // ROLES.RIGGER_SAFETY,
  // ROLES.RIG_SAFETY_MGR,
  // ROLES.RIG_SAFETY_OFF,
  // ROLES.SECURITY_SAFETY,
  // ROLES.SEC_SAFETY,
  ROLES.SEC_QAQC,
  // ROLES.FIRE_SAFETY,
  // ROLES.FIRE_INSPECTOR,
  // ROLES.FA_SAFETY,
  // ROLES.FA_INSPECTOR,
  ROLES.FA_QAQC,
  // ROLES.INTEGRATOR_SAFETY,
  // ROLES.INT_SAFETY_MGR,
  // ROLES.OPS_SAFETY,
  // ROLES.AE_INSPECTOR,
  // ROLES.CT_SAFETY,
  ROLES.CT_QAQC,
  // ROLES.MC_SAFETY,
  ROLES.MC_QAQC,
  // ROLES.CC_EHS,
  // ROLES.CUST_EHS_MGR,
  // qaqc specialists
  ROLES.OEM_QAQC_MGR,
  ROLES.OEM_QAQC_INSP,
  ROLES.GC_MEP_QAQC,
  ROLES.GC_QAQC,
  ROLES.TR_QAQC,
  ROLES.BLD_QAQC,
  ROLES.INT_QAQC_MGR,
  ROLES.INT_QC_FACTORY,
  ROLES.CC_CONST_QAQC,
  // ROLES.RIG_INSPECTOR,
  // ROLES.FA_TEST_LEAD,
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

// ── QAQC role detection ───────────────────────────────────────────────────────
// Derives the canonical QAQC role list from ROLES at module load time.
// Any future role whose value string contains "qaqc" is automatically included —
// no manual additions needed.
export const QAQC_ROLES = Object.values(ROLES).filter(
  (r) => typeof r === "string" && (r.includes("qaqc") || r === "qa_manager"),
);

// Returns true when roleId belongs to any QAQC-related role.
// Covers legacy "qa_manager" and every new granular "…qaqc…" role value.
export const isQAQCRole = (roleId) =>
  typeof roleId === "string" &&
  (roleId.includes("qaqc") || roleId === "qa_manager");

// Top-level sidebar section titles visible to QAQC users (lowercase for comparison).
// All other sections are hidden when a QAQC role is detected.
const QAQC_ALLOWED_SECTIONS = new Set([
  "reporting & dashboards",
  "project & program management",
  "operations",
  "field execution",
  "qa / qc",
  "safety & compliance",
  "hr & resources",
  "settings",
]);

// ════════════════════════════════════════════════════════════════════════════
// COMPANIES — org catalogue (matches prototype COMPANIES object)
// ════════════════════════════════════════════════════════════════════════════
export const COMPANIES = {
  delta: {
    id: "delta",
    code: "DELTA",
    name: "Delta Electronics",
    type: "oem",
    desc: "OEM · Critical power equipment manufacturer · Plano TX HQ · Servicing 5 active DC commissioning projects across the Americas.",
    sites: 5,
    headcount: 62,
    active_projects: 5,
    established: "2026",
    is_chris_company: true,
  },
  hitt: {
    id: "hitt",
    code: "HITT",
    name: "HITT Contracting",
    type: "gc",
    desc: "GC · Mission-critical builder · DC, healthcare, federal · Falls Church VA HQ · Currently lead GC on ATL-DC-4.",
    sites: 18,
    headcount: 34,
    active_projects: 1,
    established: "1937",
  },
  cloudx: {
    id: "cloudx",
    code: "CLOUDX",
    name: "CloudX Infrastructure",
    type: "customer",
    desc: "Customer · Hyperscale operator · ATL-DC-4 owner · Multi-campus expansion across Atlanta, Dallas, Richmond.",
    sites: 12,
    headcount: 45,
    active_projects: 8,
    established: "2019",
  },
  spark: {
    id: "spark",
    code: "SPARK",
    name: "Spark Electric Co",
    type: "trade",
    desc: "Trade-E · Electrical contractor · Union local IBEW · ATL-DC-4 sub for feeders, gear, terminations.",
    sites: 1,
    headcount: 42,
    active_projects: 3,
    established: "2008",
  },
  primary: {
    id: "primary",
    code: "PRIMARY",
    name: "Primary Integration",
    type: "cxa",
    desc: "CxA · Owner-hired commissioning agent · L3-L5 ownership · Authors test scripts, witnesses execution.",
    sites: 1,
    headcount: 18,
    active_projects: 6,
    established: "2003",
  },
  corgan: {
    id: "corgan",
    code: "CORGAN",
    name: "Corgan Architects",
    type: "ae",
    desc: "A/E · Mission critical architect of record · IFC drawings, MEP engineering, RFI response on ATL-DC-4.",
    sites: 1,
    headcount: 12,
    active_projects: 14,
    established: "1938",
  },
  bigfoot: {
    id: "bigfoot",
    code: "BIGFOOT",
    name: "Bigfoot Crane & Rigging",
    type: "rigger",
    desc: "Rigger · Heavy-lift specialist for OEM equipment · UPS, gens, transformers, e-houses · CFCI subcontract on ATL-DC-4.",
    sites: 1,
    headcount: 24,
    active_projects: 6,
    established: "2001",
  },
  brasfield: {
    id: "brasfield",
    code: "BRASFIELD",
    name: "Brasfield & Gorrie",
    type: "builder",
    desc: "Builder · Shell + interior · concrete tilt-up, structural steel, building envelope, slab-on-grade · subcontractor to GC.",
    sites: 9,
    headcount: 38,
    active_projects: 4,
    established: "1922",
  },
  convergint: {
    id: "convergint",
    code: "CONVERGINT",
    name: "Convergint Technologies",
    type: "security",
    desc: "Security · Access control, CCTV, intrusion detection, perimeter, guarding integration · low-voltage subcontractor.",
    sites: 1,
    headcount: 22,
    active_projects: 7,
    established: "2001",
  },
  jci_fire: {
    id: "jci_fire",
    code: "JCI-FIRE",
    name: "Johnson Controls Fire Protection",
    type: "fire",
    desc: "Fire Alarm · Detection, suppression, clean-agent, sprinkler, FACP integration · life-safety subcontractor.",
    sites: 1,
    headcount: 18,
    active_projects: 9,
    established: "1885",
  },
  trillium: {
    id: "trillium",
    code: "TRILLIUM",
    name: "Trillium Construction Staffing",
    type: "staffing",
    desc: "Staffing · Skilled trades labor supply · journeymen, apprentices, helpers · short-term project labor for trades.",
    sites: 1,
    headcount: 8,
    active_projects: 5,
    established: "1984",
  },
  mps: {
    id: "mps",
    code: "MPS",
    name: "MPS Critical Power (Rosendin)",
    type: "integrator",
    desc: "Integrator · E-house, power skids, factory-built BMS/EPMS integration · Rosendin subsidiary · UL listed assemblies.",
    sites: 2,
    headcount: 32,
    active_projects: 3,
    established: "2008",
  },
  jci_ctrl: {
    id: "jci_ctrl",
    code: "JCI-CTRL",
    name: "Johnson Controls (BAS Division)",
    type: "controls",
    desc: "Controls · Building automation, BMS, PLC programming · Metasys / Niagara · controls integration subcontractor.",
    sites: 1,
    headcount: 20,
    active_projects: 8,
    established: "1885",
  },
  graybar_lv: {
    id: "graybar_lv",
    code: "GRAYBAR-LV",
    name: "Graybar Low-Voltage Solutions",
    type: "lowvoltage",
    desc: "Low-Voltage / Cabling · Structured cabling, fiber, data infrastructure · BICSI certified.",
    sites: 1,
    headcount: 14,
    active_projects: 6,
    established: "1869",
  },
  emcor_mech: {
    id: "emcor_mech",
    code: "EMCOR-MECH",
    name: "EMCOR Mechanical Services",
    type: "mechanical",
    desc: "Mechanical · Pipefitting, sheet metal, HVAC installation · UA / SMART unions · MEP subcontractor.",
    sites: 1,
    headcount: 38,
    active_projects: 5,
    established: "1994",
  },
  delta_corp: {
    id: "delta_corp",
    code: "DELTA-CORP",
    name: "Delta Electronics · Corporate",
    type: "operations",
    desc: "Operations · Delta corporate executives, sales, back-office (non-project). Sister entity to the field-delivery Delta org.",
    sites: 1,
    headcount: 26,
    active_projects: 0,
    established: "1971",
  },
  cloudx_const: {
    id: "cloudx_const",
    code: "CLOUDX-CON",
    name: "CloudX Construction Group",
    type: "customer_const",
    desc: "Customer · Construction-side · Owner's construction PMs, coordinators (separate from facility ops). Manages CloudX's build program.",
    sites: 1,
    headcount: 18,
    active_projects: 8,
    established: "2019",
  },
};

// ════════════════════════════════════════════════════════════════════════════
// LENSES — 8 dashboard lenses that role IDs map to
// ════════════════════════════════════════════════════════════════════════════
export const LENSES = {
  exec: {
    id: "exec",
    name: "Executive · portfolio",
    color: "pu",
    desc: "Portfolio of all active projects · margin · pipeline · escalations",
  },
  pm: {
    id: "pm",
    name: "Project management",
    color: "b",
    desc: "Single project view · milestones · tasks · daily rollup · cross-company chat",
  },
  field: {
    id: "field",
    name: "Field execution",
    color: "g",
    desc: "My assigned tasks · daily checklist · field reports",
  },
  tech: {
    id: "tech",
    name: "Technical / engineering",
    color: "y",
    desc: "Submittals · drawings · technical RFIs · application questions",
  },
  sales: {
    id: "sales",
    name: "Sales / account",
    color: "k",
    desc: "Pipeline · quotes · QBR readiness · forecast",
  },
  safety: {
    id: "safety",
    name: "Safety / QA",
    color: "r",
    desc: "Incidents · NCR · audits · toolbox talks",
  },
  warr: {
    id: "warr",
    name: "Warranty / parts",
    color: "c",
    desc: "Warranty queue · RMA · parts orders · field issues",
  },
  cx: {
    id: "cx",
    name: "Commissioning",
    color: "t",
    desc: "L1-L5 progress · witness schedule · test results · IST",
  },
};

// ════════════════════════════════════════════════════════════════════════════
// ROLE_LIBRARY — full role catalogue by company type
// Each entry: { id, name, lens }  tier is on the parent tier object
// ════════════════════════════════════════════════════════════════════════════
export const ROLE_LIBRARY = {
  oem: [
    {
      tier: "Executive",
      roles: [
        { id: "oem_vp_ops", name: "VP Operations", lens: "exec" },
        { id: "oem_sales_dir", name: "Sales Director", lens: "sales" },
        { id: "oem_vp_eng", name: "VP Engineering", lens: "exec" },
      ],
    },
    {
      tier: "Project Management",
      roles: [
        { id: "oem_natl_pm", name: "National PM", lens: "pm" },
        { id: "oem_reg_pm", name: "Regional PM", lens: "pm" },
        { id: "oem_sr_pm", name: "Senior PM", lens: "pm" },
        { id: "oem_pm", name: "Project Manager", lens: "pm" },
        { id: "oem_apm", name: "Assistant PM", lens: "pm" },
        { id: "oem_coord", name: "Project Coordinator", lens: "pm" },
      ],
    },
    {
      tier: "Field Service",
      roles: [
        {
          id: "oem_reg_fsm",
          name: "Regional Field Service Manager",
          lens: "pm",
        },
        { id: "oem_lead_fse", name: "Lead FSE", lens: "field" },
        { id: "oem_sr_fse", name: "Senior FSE", lens: "field" },
        { id: "oem_fse", name: "Field Service Engineer", lens: "field" },
        { id: "oem_app_fse", name: "Apprentice FSE", lens: "field" },
        { id: "oem_svc_dispatch", name: "Service Dispatch", lens: "warr" },
      ],
    },
    {
      tier: "Commissioning",
      roles: [
        { id: "oem_cx_lead", name: "Lead", lens: "cx" },
        { id: "oem_sr_cx", name: "Senior Engineer", lens: "cx" },
        { id: "oem_cx", name: "Engineer", lens: "cx" },
      ],
    },
    {
      tier: "Engineering",
      roles: [
        { id: "oem_app_eng", name: "Application Engineer", lens: "tech" },
        { id: "oem_sr_app_eng", name: "Senior App Engineer", lens: "tech" },
        { id: "oem_sol_eng", name: "Solutions Engineer", lens: "tech" },
      ],
    },
    {
      tier: "Sales",
      roles: [
        { id: "oem_sales_rep", name: "Sales Rep", lens: "sales" },
        { id: "oem_inside_sales", name: "Inside Sales", lens: "sales" },
        { id: "oem_sales_eng", name: "Sales Engineer", lens: "sales" },
        { id: "oem_acct_mgr", name: "Account Manager", lens: "sales" },
      ],
    },
    {
      tier: "Safety & Quality",
      roles: [
        { id: "oem_safety_mgr", name: "Safety Manager", lens: "safety" },
        { id: "oem_safety_off", name: "Site Safety Officer", lens: "safety" },
        { id: "oem_qaqc_mgr", name: "QA/QC Manager", lens: "safety" },
        { id: "oem_qaqc_insp", name: "QA/QC Inspector", lens: "safety" },
      ],
    },
    {
      tier: "Scheduling & Controls",
      roles: [
        { id: "oem_scheduler", name: "Scheduler", lens: "pm" },
        { id: "oem_site_scheduler", name: "On-site Scheduler", lens: "pm" },
        { id: "oem_proj_ctrl", name: "Project Controls", lens: "pm" },
        { id: "oem_estimator", name: "Estimator", lens: "sales" },
      ],
    },
    {
      tier: "Warranty & Parts",
      roles: [
        { id: "oem_warranty_mgr", name: "Warranty Manager", lens: "exec" },
        { id: "oem_warranty", name: "Warranty Administrator", lens: "warr" },
        { id: "oem_parts", name: "Parts Coordinator", lens: "warr" },
        { id: "oem_rma", name: "RMA Specialist", lens: "warr" },
      ],
    },
    {
      tier: "Finance & Admin",
      roles: [
        { id: "oem_finance", name: "Finance Director", lens: "exec" },
        { id: "oem_ar", name: "AR Specialist", lens: "exec" },
        { id: "oem_admin", name: "Office Admin", lens: "pm" },
      ],
    },
  ],
  gc: [
    {
      tier: "Executive",
      roles: [
        { id: "gc_proj_exec", name: "Project Executive", lens: "exec" },
        { id: "gc_vp_ops", name: "VP Operations", lens: "exec" },
        { id: "gc_vp_precon", name: "VP Preconstruction", lens: "exec" },
      ],
    },
    {
      tier: "Project Management",
      roles: [
        { id: "gc_sr_pm", name: "Senior PM", lens: "pm" },
        { id: "gc_pm", name: "Project Manager", lens: "pm" },
        { id: "gc_apm", name: "Assistant PM", lens: "pm" },
        { id: "gc_proj_eng", name: "Project Engineer", lens: "tech" },
        { id: "gc_doc_ctrl", name: "Document Controller", lens: "pm" },
      ],
    },
    {
      tier: "Field Leadership",
      roles: [
        { id: "gc_sr_super", name: "Senior Superintendent", lens: "field" },
        { id: "gc_super", name: "Superintendent", lens: "field" },
        {
          id: "gc_asst_super",
          name: "Assistant Superintendent",
          lens: "field",
        },
        { id: "gc_gen_foreman", name: "General Foreman", lens: "field" },
        { id: "gc_foreman", name: "Foreman", lens: "field" },
      ],
    },
    {
      tier: "MEP Coordination",
      roles: [
        { id: "gc_vp_mep", name: "VP MEP / MEP Director", lens: "exec" },
        { id: "gc_sr_mep_pm", name: "Senior MEP PM", lens: "pm" },
        { id: "gc_mep_pm", name: "MEP Project Manager", lens: "pm" },
        {
          id: "gc_sr_mep_super",
          name: "Senior MEP Superintendent",
          lens: "field",
        },
        { id: "gc_mep_super", name: "MEP Superintendent", lens: "field" },
        {
          id: "gc_asst_mep_super",
          name: "Assistant MEP Superintendent",
          lens: "field",
        },
        {
          id: "gc_mep_elec_super",
          name: "Electrical Superintendent",
          lens: "field",
        },
        {
          id: "gc_mep_mech_super",
          name: "Mechanical Superintendent",
          lens: "field",
        },
        { id: "gc_mep_coord", name: "MEP Coordinator", lens: "tech" },
        { id: "gc_mep_eng", name: "MEP Field Engineer", lens: "tech" },
        { id: "gc_mep_qaqc", name: "MEP QA/QC", lens: "safety" },
      ],
    },
    {
      tier: "BIM / VDC",
      roles: [
        { id: "gc_bim_mgr", name: "BIM Manager", lens: "tech" },
        { id: "gc_vdc_coord", name: "VDC Coordinator", lens: "tech" },
        { id: "gc_bim_mep", name: "BIM/VDC MEP Coordinator", lens: "tech" },
      ],
    },
    {
      tier: "Safety & Quality",
      roles: [
        { id: "gc_safety_mgr", name: "Safety Manager", lens: "safety" },
        { id: "gc_site_safety", name: "Site Safety Officer", lens: "safety" },
        { id: "gc_qaqc", name: "QA/QC Manager", lens: "safety" },
      ],
    },
    {
      tier: "Controls & Procurement",
      roles: [
        { id: "gc_scheduler", name: "Scheduler", lens: "pm" },
        { id: "gc_estimator", name: "Estimator", lens: "sales" },
        { id: "gc_buyer", name: "Buyer / Procurement", lens: "sales" },
      ],
    },
  ],
  customer: [
    {
      tier: "Executive",
      roles: [
        { id: "cust_vp_infra", name: "VP Infrastructure", lens: "exec" },
        { id: "cust_dir_dc", name: "Director DC Construction", lens: "exec" },
        { id: "cust_dc_prog_dir", name: "DC Program Director", lens: "exec" },
      ],
    },
    {
      tier: "Construction Program",
      roles: [
        { id: "cust_prog_dir", name: "Program Director", lens: "exec" },
        { id: "cust_prog_lead", name: "Construction Program Lead", lens: "pm" },
        { id: "cust_sr_const_pm", name: "Senior Construction PM", lens: "pm" },
        {
          id: "cust_const_coord",
          name: "Construction Coordinator",
          lens: "pm",
        },
        { id: "cust_owner_rep", name: "Owner Rep", lens: "pm" },
      ],
    },
    {
      tier: "Facility Operations",
      roles: [
        { id: "cust_dc_ops", name: "DC Ops Manager", lens: "field" },
        { id: "cust_facility_mgr", name: "Facility Manager", lens: "field" },
        {
          id: "cust_campus_fac_mgr",
          name: "Campus Facility Manager",
          lens: "field",
        },
        {
          id: "cust_crit_ops_mgr",
          name: "Critical Operations Manager",
          lens: "field",
        },
        { id: "cust_chief_eng", name: "Chief Engineer", lens: "field" },
        {
          id: "cust_lead_bldg_eng",
          name: "Lead Building Engineer",
          lens: "field",
        },
        {
          id: "cust_crit_fac_eng",
          name: "Critical Facility Engineer",
          lens: "field",
        },
        { id: "cust_bldg_eng", name: "Building Engineer", lens: "field" },
        { id: "cust_elec_tech", name: "Electrical Technician", lens: "field" },
        { id: "cust_ctrl_tech", name: "Controls Technician", lens: "field" },
      ],
    },
    {
      tier: "Network & Security Ops",
      roles: [
        { id: "cust_net_ops", name: "Network Operations", lens: "tech" },
        { id: "cust_sec_ops", name: "Security Operations", lens: "safety" },
        { id: "cust_ehs_mgr", name: "EHS Manager", lens: "safety" },
      ],
    },
    {
      tier: "Business",
      roles: [
        { id: "cust_procure", name: "Procurement", lens: "sales" },
        { id: "cust_legal", name: "Legal / Contracts", lens: "exec" },
        { id: "cust_finance", name: "Finance", lens: "exec" },
        { id: "cust_hr", name: "HR", lens: "warr" },
        { id: "cust_payroll", name: "Payroll", lens: "warr" },
      ],
    },
    {
      tier: "Site Services",
      roles: [
        { id: "cust_janitorial", name: "Janitorial", lens: "field" },
        { id: "cust_grounds", name: "Groundskeeping", lens: "field" },
      ],
    },
  ],
  trade: [
    {
      tier: "Management",
      roles: [
        { id: "tr_pm", name: "Project Manager", lens: "pm" },
        { id: "tr_apm", name: "Assistant PM", lens: "pm" },
        { id: "tr_eng", name: "Project Engineer", lens: "tech" },
        { id: "tr_estimator", name: "Estimator", lens: "sales" },
      ],
    },
    {
      tier: "Electrical Field",
      roles: [
        {
          id: "tr_elec_super",
          name: "Electrical Superintendent",
          lens: "field",
        },
        {
          id: "tr_elec_gen_foreman",
          name: "Electrical General Foreman",
          lens: "field",
        },
        { id: "tr_elec_foreman", name: "Electrical Foreman", lens: "field" },
        { id: "tr_journey", name: "Journeyman Electrician", lens: "field" },
        { id: "tr_app", name: "Apprentice", lens: "field" },
      ],
    },
    {
      tier: "Mechanical Field",
      roles: [
        {
          id: "tr_mech_estimator",
          name: "Mechanical Estimator",
          lens: "sales",
        },
        {
          id: "tr_mech_super",
          name: "Mechanical Superintendent",
          lens: "field",
        },
        {
          id: "tr_mech_gen_foreman",
          name: "Mechanical General Foreman",
          lens: "field",
        },
        { id: "tr_mech_foreman", name: "Mechanical Foreman", lens: "field" },
        { id: "tr_pipefitter", name: "Pipefitter", lens: "field" },
        { id: "tr_sheet_metal", name: "Sheet Metal Worker", lens: "field" },
        { id: "tr_mech_app", name: "Mechanical Apprentice", lens: "field" },
        {
          id: "tr_mech_safety",
          name: "Mechanical Safety Officer",
          lens: "safety",
        },
      ],
    },
    {
      tier: "Fire Protection Field",
      roles: [
        {
          id: "tr_fp_designer",
          name: "Fire Protection Designer",
          lens: "tech",
        },
        { id: "tr_fp_foreman", name: "Fire Protection Foreman", lens: "field" },
        { id: "tr_sprinkler", name: "Sprinkler Fitter", lens: "field" },
      ],
    },
    {
      tier: "Security / ACS Field",
      roles: [
        {
          id: "tr_sec_designer",
          name: "Security Systems Designer",
          lens: "tech",
        },
        { id: "tr_sec_foreman", name: "Security Foreman", lens: "field" },
        {
          id: "tr_sec_acs_tech",
          name: "Access Control Technician",
          lens: "field",
        },
      ],
    },
    {
      tier: "Low-Voltage / Cabling",
      roles: [
        { id: "tr_cabling_foreman", name: "Cabling Foreman", lens: "field" },
        { id: "tr_fiber_tech", name: "Fiber Technician", lens: "field" },
      ],
    },
    {
      tier: "Controls Field",
      roles: [
        { id: "tr_ctrl_pm", name: "Controls PM", lens: "pm" },
        { id: "tr_ctrl_eng", name: "Controls Engineer", lens: "tech" },
        { id: "tr_ctrl_super", name: "Controls Superintendent", lens: "field" },
        { id: "tr_ctrl_foreman", name: "Controls Foreman", lens: "field" },
        { id: "tr_ctrl_tech", name: "Controls Technician", lens: "field" },
        { id: "tr_ctrl_prog", name: "Controls Programmer", lens: "tech" },
      ],
    },
    {
      tier: "Quality",
      roles: [
        { id: "tr_qaqc", name: "QA/QC", lens: "safety" },
        { id: "tr_safety", name: "Safety Officer", lens: "safety" },
      ],
    },
  ],
  cxa: [
    {
      tier: "Leadership",
      roles: [
        { id: "cxa_principal", name: "Principal", lens: "exec" },
        { id: "cxa_director", name: "Director", lens: "exec" },
      ],
    },
    {
      tier: "Cx Operations",
      roles: [
        { id: "cxa_lead", name: "Lead Agent", lens: "cx" },
        { id: "cxa_agent", name: "Agent", lens: "cx" },
        { id: "cxa_spec", name: "Specialist", lens: "cx" },
        { id: "cxa_ftl", name: "Functional Test Lead", lens: "cx" },
        { id: "cxa_engineer", name: "Engineer", lens: "cx" },
        {
          id: "cxa_sr_engineer_ee",
          name: "Senior Engineer (EE)",
          lens: "cx",
        },
        {
          id: "cxa_sr_engineer_me",
          name: "Senior Engineer (ME)",
          lens: "cx",
        },
        { id: "cxa_writer", name: "Writer / Protocol Author", lens: "tech" },
        { id: "cxa_coord", name: "Coordinator", lens: "pm" },
      ],
    },
    {
      tier: "Support",
      roles: [
        { id: "cxa_doc", name: "Documentation Specialist", lens: "tech" },
      ],
    },
  ],
  ae: [
    {
      tier: "Leadership",
      roles: [
        { id: "ae_principal", name: "Principal in Charge", lens: "exec" },
        { id: "ae_pm", name: "Architectural PM", lens: "pm" },
      ],
    },
    {
      tier: "Architecture",
      roles: [
        { id: "ae_arch", name: "Lead Architect", lens: "tech" },
        { id: "ae_arch_design", name: "Design Architect", lens: "tech" },
        { id: "ae_arch_project", name: "Project Architect", lens: "tech" },
      ],
    },
    {
      tier: "MEP Engineering",
      roles: [
        { id: "ae_lead_eng", name: "Lead Engineer", lens: "tech" },
        { id: "ae_mep_lead", name: "MEP Engineering Lead", lens: "tech" },
        { id: "ae_elec_eng", name: "Electrical Engineer (PE)", lens: "tech" },
        { id: "ae_mech_eng", name: "Mechanical Engineer (PE)", lens: "tech" },
        { id: "ae_plumb_eng", name: "Plumbing Engineer", lens: "tech" },
        { id: "ae_fire_eng", name: "Fire Protection Engineer", lens: "tech" },
        { id: "ae_ctrl_eng", name: "Controls Engineer", lens: "tech" },
      ],
    },
    {
      tier: "Structural / Civil",
      roles: [
        { id: "ae_struct", name: "Structural Engineer (PE)", lens: "tech" },
        { id: "ae_civil", name: "Civil Engineer (PE)", lens: "tech" },
      ],
    },
    {
      tier: "Drafting / Production",
      roles: [{ id: "ae_drafter", name: "Drafter", lens: "tech" }],
    },
    {
      tier: "Construction Admin",
      roles: [
        { id: "ae_ca_lead", name: "CA Lead", lens: "tech" },
        { id: "ae_rfi_coord", name: "RFI Coordinator", lens: "tech" },
        { id: "ae_field_eng", name: "Field Engineer", lens: "tech" },
      ],
    },
  ],
  rigger: [
    {
      tier: "Management",
      roles: [
        { id: "rig_pm", name: "Rigging PM", lens: "pm" },
        { id: "rig_lift_dir", name: "Lift Director", lens: "pm" },
        { id: "rig_eng", name: "Rigging Engineer (Pick Plans)", lens: "tech" },
      ],
    },
    {
      tier: "Field Leadership",
      roles: [
        { id: "rig_super", name: "Rigging Superintendent", lens: "field" },
        { id: "rig_foreman", name: "Rigging Foreman", lens: "field" },
      ],
    },
    {
      tier: "Crane & Crew",
      roles: [
        { id: "rig_crane_op", name: "Crane Operator (NCCCO)", lens: "field" },
        { id: "rig_crane_op_jr", name: "Junior Crane Operator", lens: "field" },
        { id: "rig_signal", name: "Signal Person", lens: "field" },
        { id: "rig_rigger_lead", name: "Lead Rigger", lens: "field" },
        { id: "rig_rigger", name: "Rigger", lens: "field" },
        { id: "rig_oiler", name: "Crane Oiler", lens: "field" },
      ],
    },
    {
      tier: "Transport",
      roles: [
        {
          id: "rig_truck_driver",
          name: "Heavy Haul Driver (CDL-A)",
          lens: "field",
        },
        { id: "rig_dispatch", name: "Transport Dispatcher", lens: "pm" },
      ],
    },
    {
      tier: "Safety & Quality",
      roles: [
        {
          id: "rig_safety_mgr",
          name: "Rigging Safety Manager",
          lens: "safety",
        },
        { id: "rig_safety_off", name: "Site Safety Officer", lens: "safety" },
        {
          id: "rig_inspector",
          name: "Crane / Rigging Inspector",
          lens: "safety",
        },
      ],
    },
  ],
  builder: [
    {
      tier: "Executive",
      roles: [
        { id: "bld_proj_exec", name: "Project Executive", lens: "exec" },
        { id: "bld_vp_ops", name: "VP Operations", lens: "exec" },
      ],
    },
    {
      tier: "Project Management",
      roles: [
        { id: "bld_sr_pm", name: "Senior PM", lens: "pm" },
        { id: "bld_pm", name: "Project Manager", lens: "pm" },
        { id: "bld_apm", name: "Assistant PM", lens: "pm" },
        { id: "bld_eng", name: "Project Engineer", lens: "tech" },
      ],
    },
    {
      tier: "Field Leadership",
      roles: [
        { id: "bld_super", name: "Superintendent", lens: "field" },
        { id: "bld_asst_super", name: "Assistant Super", lens: "field" },
        { id: "bld_gen_foreman", name: "General Foreman", lens: "field" },
        { id: "bld_concrete_foreman", name: "Concrete Foreman", lens: "field" },
        { id: "bld_steel_foreman", name: "Steel Foreman", lens: "field" },
      ],
    },
    {
      tier: "Crew",
      roles: [
        { id: "bld_carpenter", name: "Carpenter", lens: "field" },
        { id: "bld_ironworker", name: "Ironworker", lens: "field" },
        { id: "bld_finisher", name: "Concrete Finisher", lens: "field" },
        { id: "bld_laborer", name: "Laborer", lens: "field" },
      ],
    },
    {
      tier: "Safety & Quality",
      roles: [
        { id: "bld_safety_mgr", name: "Safety Manager", lens: "safety" },
        { id: "bld_qaqc", name: "QA/QC", lens: "safety" },
      ],
    },
    {
      tier: "Controls",
      roles: [
        { id: "bld_scheduler", name: "Scheduler", lens: "pm" },
        { id: "bld_estimator", name: "Estimator", lens: "sales" },
      ],
    },
  ],
  security: [
    {
      tier: "Management",
      roles: [
        { id: "sec_pm", name: "Security PM", lens: "pm" },
        { id: "sec_eng_mgr", name: "Engineering Manager", lens: "tech" },
      ],
    },
    {
      tier: "Engineering",
      roles: [
        { id: "sec_design", name: "Security Designer", lens: "tech" },
        { id: "sec_sys_eng", name: "Systems Engineer", lens: "tech" },
        { id: "sec_prog", name: "Access Control Programmer", lens: "tech" },
        { id: "sec_cctv_eng", name: "CCTV / Video Engineer", lens: "tech" },
      ],
    },
    {
      tier: "Field",
      roles: [
        {
          id: "sec_lead_tech",
          name: "Lead Security Technician",
          lens: "field",
        },
        { id: "sec_tech", name: "Security Technician", lens: "field" },
        { id: "sec_install", name: "Low-Voltage Installer", lens: "field" },
        { id: "sec_app", name: "Apprentice", lens: "field" },
      ],
    },
    {
      tier: "Operations",
      roles: [
        {
          id: "sec_console_mgr",
          name: "SOC / Console Manager",
          lens: "safety",
        },
        { id: "sec_console_op", name: "Console Operator", lens: "safety" },
        {
          id: "sec_guard_super",
          name: "Guard Force Supervisor",
          lens: "safety",
        },
      ],
    },
    {
      tier: "Quality",
      roles: [
        { id: "sec_qaqc", name: "QA/QC", lens: "safety" },
        { id: "sec_safety", name: "Safety Officer", lens: "safety" },
      ],
    },
  ],
  fire: [
    {
      tier: "Management",
      roles: [
        { id: "fa_pm", name: "Fire Alarm PM", lens: "pm" },
        { id: "fa_eng_mgr", name: "Engineering Manager", lens: "tech" },
      ],
    },
    {
      tier: "Engineering",
      roles: [
        {
          id: "fa_design_eng",
          name: "Fire Protection Engineer (PE)",
          lens: "tech",
        },
        {
          id: "fa_designer",
          name: "Fire Alarm Designer (NICET IV)",
          lens: "tech",
        },
        { id: "fa_supp_eng", name: "Suppression Designer", lens: "tech" },
      ],
    },
    {
      tier: "Field",
      roles: [
        { id: "fa_super", name: "Fire Alarm Superintendent", lens: "field" },
        {
          id: "fa_lead_tech",
          name: "Lead Technician (NICET III)",
          lens: "field",
        },
        {
          id: "fa_tech",
          name: "Fire Alarm Technician (NICET II)",
          lens: "field",
        },
        { id: "fa_install", name: "Installer", lens: "field" },
        { id: "fa_pipe_fitter", name: "Sprinkler Pipefitter", lens: "field" },
      ],
    },
    {
      tier: "Inspection & Test",
      roles: [
        { id: "fa_test_lead", name: "Test & Inspection Lead", lens: "cx" },
        { id: "fa_inspector", name: "NFPA-72 Inspector", lens: "cx" },
      ],
    },
    {
      tier: "Quality",
      roles: [
        { id: "fa_qaqc", name: "QA/QC", lens: "safety" },
        { id: "fa_safety", name: "Safety Officer", lens: "safety" },
      ],
    },
  ],
  staffing: [
    {
      tier: "Leadership",
      roles: [{ id: "st_owner", name: "Owner / Branch Manager", lens: "exec" }],
    },
    {
      tier: "Sales",
      roles: [
        { id: "st_acct_mgr", name: "Account Manager", lens: "sales" },
        { id: "st_biz_dev", name: "Business Development Rep", lens: "sales" },
      ],
    },
    {
      tier: "Recruiting",
      roles: [
        { id: "st_recr_mgr", name: "Recruiting Manager", lens: "pm" },
        { id: "st_recruiter", name: "Recruiter", lens: "pm" },
        { id: "st_sourcer", name: "Sourcer", lens: "pm" },
      ],
    },
    {
      tier: "Operations",
      roles: [
        { id: "st_ops_mgr", name: "Operations Manager", lens: "pm" },
        { id: "st_payroll", name: "Payroll / Onboarding", lens: "warr" },
        { id: "st_compliance", name: "Compliance Officer", lens: "safety" },
      ],
    },
    {
      tier: "Field",
      roles: [
        { id: "st_field_rep", name: "Field Representative", lens: "field" },
      ],
    },
  ],
  integrator: [
    {
      tier: "Executive",
      roles: [
        { id: "int_principal", name: "Principal / Owner", lens: "exec" },
        { id: "int_vp_eng", name: "VP Engineering", lens: "exec" },
      ],
    },
    {
      tier: "Project Management",
      roles: [
        { id: "int_sr_pm", name: "Senior PM", lens: "pm" },
        { id: "int_pm", name: "Project Manager", lens: "pm" },
        { id: "int_apm", name: "Assistant PM", lens: "pm" },
        { id: "int_coord", name: "Project Coordinator", lens: "pm" },
      ],
    },
    {
      tier: "Engineering",
      roles: [
        { id: "int_eng_mgr", name: "Engineering Manager", lens: "tech" },
        {
          id: "int_sr_ctrl_eng",
          name: "Senior Controls Engineer",
          lens: "tech",
        },
        { id: "int_ctrl_eng", name: "Controls Engineer", lens: "tech" },
        { id: "int_prog", name: "PLC / DDC Programmer", lens: "tech" },
        { id: "int_scada_eng", name: "SCADA Engineer", lens: "tech" },
        { id: "int_graphics", name: "Graphics / HMI Designer", lens: "tech" },
        { id: "int_net_eng", name: "Network Engineer", lens: "tech" },
      ],
    },
    {
      tier: "Factory / Shop",
      roles: [
        { id: "int_shop_mgr", name: "Shop Manager", lens: "pm" },
        { id: "int_panel_lead", name: "Panel Build Lead", lens: "field" },
        { id: "int_panel_tech", name: "Panel Build Technician", lens: "field" },
        { id: "int_wireman", lens: "field", name: "Wireman" },
        { id: "int_qc_factory", name: "Factory QC Inspector", lens: "safety" },
      ],
    },
    {
      tier: "Field Service",
      roles: [
        { id: "int_lead_field", name: "Lead Field Technician", lens: "field" },
        { id: "int_field_tech", name: "Field Technician", lens: "field" },
        { id: "int_startup_eng", name: "Startup Engineer", lens: "cx" },
        { id: "int_cx_eng", name: "Integrator Engineer", lens: "cx" },
      ],
    },
    {
      tier: "Sales & Estimating",
      roles: [
        { id: "int_sales", name: "Sales Engineer", lens: "sales" },
        { id: "int_estimator", name: "Estimator", lens: "sales" },
      ],
    },
    {
      tier: "Safety & Quality",
      roles: [
        { id: "int_safety_mgr", name: "Safety Manager", lens: "safety" },
        { id: "int_qaqc_mgr", name: "QA/QC Manager", lens: "safety" },
      ],
    },
    {
      tier: "Warranty & Service",
      roles: [
        {
          id: "int_warranty",
          name: "Warranty / Service Coordinator",
          lens: "warr",
        },
        { id: "int_remote_ops", name: "Remote Ops Specialist", lens: "warr" },
      ],
    },
  ],
  controls: [
    {
      tier: "Management",
      roles: [
        { id: "ct_pm", name: "Controls PM", lens: "pm" },
        { id: "ct_apm", name: "Assistant PM", lens: "pm" },
        { id: "ct_eng_mgr", name: "Engineering Manager", lens: "tech" },
      ],
    },
    {
      tier: "Engineering",
      roles: [
        {
          id: "ct_sr_ctrl_eng",
          name: "Senior Controls Engineer",
          lens: "tech",
        },
        { id: "ct_ctrl_eng", name: "Controls Engineer", lens: "tech" },
        {
          id: "ct_bms_prog",
          name: "BMS Programmer (Niagara/Metasys)",
          lens: "tech",
        },
        { id: "ct_plc_prog", name: "PLC Programmer", lens: "tech" },
        { id: "ct_graphics", name: "Graphics / HMI Designer", lens: "tech" },
        { id: "ct_net_eng", name: "Network Engineer", lens: "tech" },
      ],
    },
    {
      tier: "Field",
      roles: [
        { id: "ct_super", name: "Controls Superintendent", lens: "field" },
        { id: "ct_foreman", name: "Controls Foreman", lens: "field" },
        { id: "ct_lead_tech", name: "Lead Controls Technician", lens: "field" },
        { id: "ct_tech", name: "Controls Technician", lens: "field" },
        { id: "ct_app", name: "Controls Apprentice", lens: "field" },
      ],
    },
    {
      tier: "Commissioning",
      roles: [
        { id: "ct_startup_eng", name: "Startup Engineer", lens: "cx" },
        { id: "ct_cx_eng", name: "Engineer", lens: "cx" },
      ],
    },
    {
      tier: "Quality",
      roles: [
        { id: "ct_qaqc", name: "QA/QC", lens: "safety" },
        { id: "ct_safety", name: "Safety Officer", lens: "safety" },
      ],
    },
  ],
  lowvoltage: [
    {
      tier: "Management",
      roles: [
        { id: "lv_pm", name: "Low-Voltage PM", lens: "pm" },
        { id: "lv_apm", name: "Assistant PM", lens: "pm" },
        { id: "lv_estimator", name: "Estimator", lens: "sales" },
      ],
    },
    {
      tier: "Engineering / Design",
      roles: [
        { id: "lv_designer", name: "LV Designer (BICSI RCDD)", lens: "tech" },
        { id: "lv_eng", name: "LV Engineer", lens: "tech" },
      ],
    },
    {
      tier: "Field",
      roles: [
        { id: "lv_super", name: "Cabling Superintendent", lens: "field" },
        { id: "lv_foreman", name: "Cabling Foreman", lens: "field" },
        { id: "lv_lead_tech", name: "Lead Cabling Technician", lens: "field" },
        { id: "lv_fiber_tech", name: "Fiber Technician", lens: "field" },
        {
          id: "lv_copper_tech",
          name: "Copper / Structured Cabling Tech",
          lens: "field",
        },
        { id: "lv_tester", name: "Cable Tester / Certifier", lens: "field" },
        { id: "lv_app", name: "Cabling Apprentice", lens: "field" },
      ],
    },
    {
      tier: "Quality",
      roles: [
        { id: "lv_qaqc", name: "QA/QC", lens: "safety" },
        { id: "lv_safety", name: "Safety Officer", lens: "safety" },
      ],
    },
  ],
  mechanical: [
    {
      tier: "Management",
      roles: [
        { id: "mc_pm", name: "Mechanical PM", lens: "pm" },
        { id: "mc_apm", name: "Assistant PM", lens: "pm" },
        { id: "mc_eng", name: "Mechanical Engineer", lens: "tech" },
        { id: "mc_estimator", name: "Mechanical Estimator", lens: "sales" },
      ],
    },
    {
      tier: "Field Leadership",
      roles: [
        { id: "mc_super", name: "Mechanical Superintendent", lens: "field" },
        {
          id: "mc_gen_foreman",
          name: "Mechanical General Foreman",
          lens: "field",
        },
        { id: "mc_foreman", name: "Mechanical Foreman", lens: "field" },
      ],
    },
    {
      tier: "Trades",
      roles: [
        { id: "mc_pipefitter", name: "Pipefitter", lens: "field" },
        { id: "mc_journey_pf", name: "Journeyman Pipefitter", lens: "field" },
        { id: "mc_sheet_metal", name: "Sheet Metal Worker", lens: "field" },
        { id: "mc_journey_sm", name: "Journeyman Sheet Metal", lens: "field" },
        { id: "mc_hvac_tech", name: "HVAC Installer", lens: "field" },
        { id: "mc_welder", name: "Welder (Pipe/Sanitary)", lens: "field" },
        { id: "mc_app", name: "Mechanical Apprentice", lens: "field" },
      ],
    },
    {
      tier: "Quality & Safety",
      roles: [
        { id: "mc_qaqc", name: "QA/QC", lens: "safety" },
        { id: "mc_safety", name: "Mechanical Safety Officer", lens: "safety" },
      ],
    },
  ],
  customer_const: [
    {
      tier: "Executive",
      roles: [
        { id: "cc_vp_const", name: "VP Construction", lens: "exec" },
        { id: "cc_dir_const", name: "Director of Construction", lens: "exec" },
        { id: "cc_dc_prog_dir", name: "DC Program Director", lens: "exec" },
      ],
    },
    {
      tier: "Construction Program",
      roles: [
        { id: "cc_prog_dir", name: "Program Director", lens: "exec" },
        { id: "cc_sr_const_pm", name: "Senior Construction PM", lens: "pm" },
        { id: "cc_const_pm", name: "Construction PM", lens: "pm" },
        { id: "cc_const_coord", name: "Construction Coordinator", lens: "pm" },
        { id: "cc_owner_rep", name: "Owner Rep", lens: "pm" },
      ],
    },
    {
      tier: "Technical Oversight",
      roles: [
        { id: "cc_mep_pm", name: "Owner MEP PM", lens: "pm" },
        { id: "cc_mep_eng", name: "Owner MEP Engineer", lens: "tech" },
        { id: "cc_const_qaqc", name: "Construction QA/QC", lens: "safety" },
        { id: "cc_ehs", name: "EHS Manager", lens: "safety" },
      ],
    },
    {
      tier: "Business",
      roles: [
        { id: "cc_procure", name: "Construction Procurement", lens: "sales" },
        { id: "cc_contracts", name: "Contracts Administrator", lens: "exec" },
        { id: "cc_finance", name: "Construction Finance", lens: "exec" },
      ],
    },
  ],
  operations: [
    {
      tier: "OEM Leadership",
      roles: [
        {
          id: "ops_oem_dir_proj",
          name: "Director of Projects (OEM)",
          lens: "exec",
        },
        {
          id: "ops_oem_dir_fs",
          name: "Director of Field Service (OEM)",
          lens: "exec",
        },
        { id: "ops_oem_vp_ops", name: "VP Operations (OEM)", lens: "exec" },
        { id: "ops_oem_vp_eng", name: "VP Engineering (OEM)", lens: "exec" },
      ],
    },
    {
      tier: "GC Leadership",
      roles: [
        { id: "ops_gc_vp_ops", name: "VP Operations (GC)", lens: "exec" },
        {
          id: "ops_gc_vp_precon",
          name: "VP Preconstruction (GC)",
          lens: "exec",
        },
      ],
    },
    {
      tier: "CxA Leadership",
      roles: [
        {
          id: "ops_cxa_dir_cx",
          name: "Director of Commissioning (CxA)",
          lens: "exec",
        },
      ],
    },
    {
      tier: "Sales",
      roles: [
        { id: "ops_sales_dir", name: "Sales Director", lens: "sales" },
        {
          id: "ops_sr_acct_sales_mgr",
          name: "Senior Account Sales Manager",
          lens: "sales",
        },
        { id: "ops_sales_mgr", name: "Sales Manager", lens: "sales" },
        { id: "ops_acct_mgr", name: "Account Manager", lens: "sales" },
        { id: "ops_sales_rep", name: "Sales Rep", lens: "sales" },
        { id: "ops_sales_eng", name: "Sales Engineer", lens: "sales" },
        { id: "ops_sol_eng", name: "Solution Engineer", lens: "sales" },
      ],
    },
    {
      tier: "Estimating",
      roles: [{ id: "ops_estimator", name: "Estimator", lens: "sales" }],
    },
    {
      tier: "Finance & Project Ctrl",
      roles: [
        { id: "ops_finance_mgr", name: "Finance Manager", lens: "exec" },
        {
          id: "ops_proj_ctrl_analyst",
          name: "Project Controls Analyst",
          lens: "pm",
        },
        { id: "ops_payroll_spec", name: "Payroll Specialist", lens: "warr" },
      ],
    },
    {
      tier: "HR & Training",
      roles: [
        { id: "ops_hr_mgr", name: "HR Manager", lens: "warr" },
        { id: "ops_recruiter", name: "Recruiter", lens: "pm" },
        { id: "ops_training_coord", name: "Training Coordinator", lens: "pm" },
      ],
    },
    {
      tier: "Contracts & Procurement",
      roles: [
        {
          id: "ops_contracts_admin",
          name: "Contracts Administrator",
          lens: "exec",
        },
        { id: "ops_procure_mgr", name: "Procurement Manager", lens: "sales" },
      ],
    },
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
  if (roleId === "SUPERADMIN")
    return {
      id: roleId,
      name: "Super Admin",
      lens: "exec",
      tier: "Platform",
      companyType: "platform",
    };
  if (roleId === "PLATFORM_ADMIN")
    return {
      id: roleId,
      name: "Platform Admin",
      lens: "exec",
      tier: "Platform",
      companyType: "platform",
    };
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// getLensNavItems — quick-access nav items for a given lens.
// Paths map to existing app routes.
// ────────────────────────────────────────────────────────────────────────────
export function getLensNavItems(lensId) {
  const map = {
    exec: [
      { title: "Portfolio", path: "/Portfolio" },
      { title: "P&L / Finance", path: "/Finance/Dashboard" },
      { title: "Executive Dashboard", path: "/Executive/Dashboard" },
      { title: "KPIs", path: "/KPIs" },
    ],
    pm: [
      { title: "Schedule", path: "/Schedule" },
      { title: "RFIs", path: "/RFI/List" },
      { title: "Milestones", path: "/ScheduleMilestones/List" },
      { title: "Issues", path: "/Issues/List" },
    ],
    field: [
      { title: "My Tasks", path: "/Tasks/List" },
      { title: "Daily Reports", path: "/DailyReports" },
      { title: "Field Reports", path: "/FieldReports" },
    ],
    tech: [
      { title: "Submittals", path: "/Submittals/List" },
      { title: "Documents", path: "/Document/List" },
      { title: "RFIs", path: "/RFI/List" },
    ],
    sales: [
      { title: "Leads", path: "/CRM/Leads/List" },
      { title: "Deals", path: "/CRM/Deals/List" },
      { title: "Contacts", path: "/CRM/Contacts/List" },
    ],
    safety: [
      { title: "Incidents", path: "/Safety/Incidents" },
      { title: "Audits", path: "/Safety/Audits" },
      { title: "NCRs", path: "/QAQC/NCRs" },
      { title: "JHAs / Permits", path: "/Safety/Reports" },
    ],
    warr: [
      { title: "Warranty / RMA", path: "/RMA" },
      { title: "Parts & Assets", path: "/Assets/List" },
    ],
    cx: [
      { title: "Commissioning", path: "/Commissioning" },
      { title: "Test Results", path: "/TestResults" },
    ],
  };
  return map[lensId] || [];
}

export const sidebarItems = [
  // ─── Projects (top-level shortcut) ──────────────────────────────────
  {
    title: "Projects",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Projects",
    type: "link",
    roles: ALL,
  },

  // ─── Reporting & Dashboards ─────────────────────────────────────────
  {
    title: "Reporting & Dashboards",
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
        roles: union(QAQC_ROLES, PLATFORM),
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
        roles: ALL,
      },
      {
        title: "new dashboard",
        type: "link",
        path: "/CxScore",
        roles: ALL,
      },
      {
        title: "Analytics",
        type: "link",
        path: "/Analytics",
        roles: ALL,
      },
    ],
  },

  // ─── Project & Program Management ───────────────────────────────────
  {
    title: "Project & Program Management",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Projects",
    type: "link",
    submenu: [],
    roles: union(EXEC_ROLES, PM_ROLES, QAQC_ROLES, PLATFORM, [
      ROLES.CUSTOMER_OWNER_REP,
      ROLES.CC_OWNER_REP,
    ]),
  },

  // ─── Sales & Commercial ─────────────────────────────────────────────
  {
    title: "Sales & Commercial",
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
        path: "/Meetings/List",
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
        roles: ALL,
      },
      // ── CxControl variants (HTML prototype UI) ─────────────────────────
      {
        title: "Issues",
        type: "link",
        path: "/Issues/List",
        roles: ALL,
      },
      {
        title: "Site Access · 2-stage",
        type: "link",
        path: "/CxTARF",
        roles: ALL,
      },
      {
        title: "Announcements",
        type: "link",
        path: "/CxAnnouncements",
        roles: ALL,
      },
    ],
  },

  // ─── CxControl · Commissioning ─────────────────────────────────────
  {
    title: "Commissioning",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Commissioning/Tests",
    type: "link",
    roles: ALL,
    submenu: [
      {
        title: "Commissioning Tests",
        type: "link",
        path: "/Commissioning/Tests",
        roles: ALL,
      },
      {
        title: "PSSR Inspections",
        type: "link",
        path: "/PSSR",
        roles: ALL,
      },
      {
        title: "Risk Register",
        type: "link",
        path: "/RiskRegister",
        roles: ALL,
      },
      {
        title: "Announcements",
        type: "link",
        path: "/Announcements",
        roles: ALL,
      },
      {
        title: "Training Simulator",
        type: "link",
        path: "/TrainingSim",
        roles: ALL,
      },
    ],
  },

  // ─── Scheduling & Manpower ──────────────────────────────────────────
  {
    title: "Scheduling & Manpower",
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
      {
        title: "Crew Dispatch",
        type: "link",
        path: "/CrewDispatch",
        roles: union(EXEC_ROLES, PM_ROLES, SUPERINTENDENT_ROLES, PLATFORM),
      },
    ],
  },

  // ─── Field Execution ────────────────────────────────────────────────
  {
    title: "Field Execution",
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
          ROLES?.GC_PROJ_EXEC,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP],
          ALL,
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

  // ─── QA / QC ────────────────────────────────────────────────────────
  {
    title: "QA / QC",
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
        roles: union(QAQC_ROLES, PLATFORM),
      },
      {
        title: "NCRs / Defects",
        type: "link",
        path: "/QAQC/NCRs",
        roles: union(QAQC_ROLES, PLATFORM),
      },
      {
        title: "Corrective Actions",
        type: "link",
        path: "/QAQC/CorrectiveActions",
        roles: union(QAQC_ROLES, PLATFORM),
      },
      {
        title: "Evidence Library",
        type: "link",
        path: "/QAQC/EvidenceLibrary",
        roles: union(QAQC_ROLES, PLATFORM),
      },
    ],
  },

  // ─── Safety & Compliance ─────────────────────────────────────────────
  {
    title: "Safety & Compliance",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety",
    type: "link",
    roles: union(
      EXEC_ROLES,
      PM_ROLES,
      SUPERINTENDENT_ROLES,
      SAFETY_QA_ROLES,
      PLATFORM,
    ),
    submenu: [
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

  // ─── Finance & Accounting ───────────────────────────────────────────
  {
    title: "Finance & Accounting",
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

  // ─── HR & Resources ─────────────────────────────────────────────────
  {
    title: "HR & Resources",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Teams/List",
    type: "link",
    roles: union(EXEC_ROLES, PM_ROLES, QAQC_ROLES, PLATFORM),
    submenu: [
      {
        title: "Team",
        type: "link",
        path: "/Teams/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          QAQC_ROLES,
          PLATFORM,
          ROLES?.GC_PROJ_EXEC,
          ROLES?.GC_PROJ_ENG,
          ROLES?.AE_PRINCIPAL,
          union(EXEC_ROLES, PM_ROLES, QAQC_ROLES, PLATFORM),
        ),
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
          ROLES?.GC_PROJ_EXEC,
          ROLES?.GC_PROJ_ENG,
          ROLES?.AE_PRINCIPAL,
          union(EXEC_ROLES, PM_ROLES, QAQC_ROLES, PLATFORM),
        ]),
      },
    ],
  },

  // ─── Document Control & Closeout ────────────────────────────────────
  {
    title: "Document Control & Closeout",
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
      // {
      //   // RBAC-admin write surface is guarded by CompanyAdminGuard, which admits
      //   // SUPERADMIN (support) + each org's ONE resolved admin role and REJECTS
      //   // PLATFORM_ADMIN. Gate the link to exactly that set (the 17 catalog admin
      //   // roles + SUPERADMIN) so only users who can actually use it see it — a
      //   // non-admin Project Executive / VP would otherwise see the link and hit
      //   // the page's "Admin access required" fallback.
      //   title: "Permissions",
      //   type: "link",
      //   path: "/Permissions",
      //   roles: [ROLES.SUPERADMIN, ...ORG_ADMIN_ROLES],
      // },
      // {
      //   // Platform-wide RBAC — SUPERADMIN only. Cross-organization grant/assign
      //   // via the /platform/rbac/* endpoints (org-picker + target org). The org
      //   // "Permissions" screen above is org-scoped and useless to a null-org
      //   // superadmin, so platform users get this dedicated surface.
      //   title: "Platform RBAC",
      //   type: "link",
      //   path: "/PlatformRbac",
      //   roles: [ROLES.SUPERADMIN, ...ORG_ADMIN_ROLES],
      // },
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
