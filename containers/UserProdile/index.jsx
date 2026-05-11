"use client";

import React, { useEffect, useState } from "react";
import { FiAlertCircle, FiCheck, FiMail } from "react-icons/fi";
import { ChangePassword } from "../../services/auth";
import { getUser, getOrganization } from "../../services/instance/tokenService";

const COMPANY_ROLE_LABELS = {
  gc: "General Contractor",
  oem: "OEM / Manufacturer",
  customer: "Owner / Customer",
  trade: "Trade Contractor",
  cxa: "Commissioning Authority",
  ae: "Architect & Engineer",
  integrator: "Systems Integrator",
  rigger: "Rigger",
  builder: "Builder",
  security: "Security",
  fire: "Fire Protection",
  staffing: "Staffing",
  controls: "Controls",
  lowvoltage: "Low Voltage",
  mechanical: "Mechanical",
  operations: "Operations",
  customer_const: "Construction Owner",
};
const COMPANY_SIZE_LABELS = {
  small: "Starter",
  med: "Growth",
  medium: "Professional",
  ent: "Enterprise",
};
const DC_TYPE_LABELS = {
  ai: "AI / GPU-Dense",
  hyp: "Hyperscale",
  colo: "Colocation",
  ent: "Enterprise",
  edg: "Edge",
  hpc: "HPC",
  cry: "Cryptocurrency",
  gov: "Government / Secure",
  bro: "Broadcast",
  res: "Research",
  mod: "Modular",
  fin: "Financial / Low-Latency",
};
const UPTIME_TIER_LABELS = {
  t1: "Tier I — Basic",
  t2: "Tier II — Redundant",
  t3: "Tier III — Concurrently Maintainable",
  t4: "Tier IV — Fault Tolerant",
};
const FACILITY_SCALE_LABELS = {
  s1: "Small (< 1 MW)",
  s2: "Medium (1–10 MW)",
  s3: "Large (10–100 MW)",
  s4: "Hyperscale (> 100 MW)",
};
const COOLING_TYPE_LABELS = {
  air: "Air-Cooled",
  rdhx: "Rear-Door Heat Exchanger",
  dlc: "Direct Liquid Cooling",
  imm: "Immersion Cooling",
};
const POWER_REDUNDANCY_LABELS = {
  n: "N (No Redundancy)",
  n1: "N+1",
  "2n": "2N (Fully Redundant)",
  "2n1": "2N+1",
};
const PROCUREMENT_OWNER_LABELS = {
  OFCI: "Owner-Furnished / Contractor-Installed",
  CFCI: "Contractor-Furnished / Contractor-Installed",
  CUSTOMER: "Customer",
  CONTRACTOR: "Contractor",
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [tab, setTab] = useState("profile");

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const raw = getUser();
    if (raw) setUser(JSON.parse(raw));

    const rawOrg = getOrganization();
    if (rawOrg) setOrg(JSON.parse(rawOrg));
  }, []);

  if (!user) return null;

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const plan = user.subscriptionPlan;
  const role = user.activeRole;

  const handlePwChange = (e) =>
    setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdatePassword = async () => {
    setPwError("");
    setPwSuccess(false);
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      await ChangePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(true);
      setPwForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      setPwError(err?.response?.data?.message ?? "Password update failed.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto space-y-5">
      {/* ── Hero Card ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 flex flex-wrap items-center gap-5"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
        }}
      >
        {org?.branding?.logoUrl ? (
          <img
            src={org?.branding?.logoUrl}
            alt={`${org.name} logo`}
            className="w-20 h-20 rounded-2xl object-center shrink-0"
            style={{ border: "1px solid var(--rf-border)" }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{
              background:
                "color-mix(in srgb, var(--rf-accent) 18%, transparent)",
              color: "var(--rf-accent)",
            }}
          >
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-bold truncate"
            style={{ color: "var(--rf-txt)" }}
          >
            {user.firstName}
            {user.lastName}
          </h1>
          <p
            className="text-sm mt-0.5 truncate"
            style={{ color: "var(--rf-txt2)" }}
          >
            {user.email}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <StatusPill label={user.status} active={user.status === "ACTIVE"} />
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                background:
                  "color-mix(in srgb, var(--rf-accent) 12%, transparent)",
                color: "var(--rf-accent)",
              }}
            >
              {user.organizationType}
            </span>
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize"
              style={{
                background: "var(--rf-bg)",
                color: "var(--rf-txt2)",
                border: "1px solid var(--rf-border2)",
              }}
            >
              {role?.description ?? role?.name?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right hidden md:block">
          <p
            className="text-[10px] uppercase tracking-widest mb-1"
            style={{ color: "var(--rf-txt3)" }}
          >
            Plan
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: "var(--rf-accent)" }}
          >
            {plan?.displayName}
          </p>
          <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
            Tier {plan?.tier}
          </p>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
        }}
      >
        {["profile", "organization", "permissions", "security"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
            style={
              tab === t
                ? { background: "var(--rf-accent)", color: "#fff" }
                : { color: "var(--rf-txt2)" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ───────────────────────────────────────── */}
      {tab === "profile" && (
        <>
          {/* Identity */}
          <Section title="Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="First Name" value={user.firstName} />
              <InfoField label="Last Name" value={user.lastName} />
              <InfoField label="Email" value={user.email} icon={<FiMail />} />
              <InfoField
                label="Account Status"
                value={user.status}
                valueStyle={{
                  color:
                    user.status === "ACTIVE"
                      ? "var(--rf-green)"
                      : "var(--rf-red)",
                  fontWeight: 600,
                }}
              />
            </div>
          </Section>

          {/* Organization */}
          <Section title="Organization">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="Organization Name"
                value={user.organizationName}
              />
              <InfoField
                label="Organization Type"
                value={user.organizationType}
              />
              <InfoField
                label="Organization Status"
                value={user.organizationStatus}
              />
              <InfoField
                label="Platform User"
                value={user.isPlatformUser ? "Yes" : "No"}
              />
            </div>
          </Section>

          {/* Subscription */}
          <Section title="Subscription Plan">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <InfoField label="Plan" value={plan?.displayName} />
              <InfoField label="Tier" value={`Tier ${plan?.tier}`} />
              <InfoField label="Plan Name" value={plan?.name} />
            </div>
            <p className="text-xs mb-2" style={{ color: "var(--rf-txt3)" }}>
              Module Access
            </p>
            <div className="flex flex-wrap gap-2">
              {plan?.moduleAccess?.map((mod) => (
                <span
                  key={mod}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium capitalize"
                  style={{
                    background:
                      "color-mix(in srgb, var(--rf-accent) 12%, transparent)",
                    color: "var(--rf-accent)",
                    border:
                      "1px solid color-mix(in srgb, var(--rf-accent) 25%, transparent)",
                  }}
                >
                  {mod}
                </span>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ── Organization Tab ──────────────────────────────────── */}
      {tab === "organization" &&
        (org ? (
          <>
            {/* Setup status banner */}
            {org.setupStatus !== "COMPLETE" && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background:
                    "color-mix(in srgb, var(--rf-red) 12%, transparent)",
                  color: "var(--rf-red)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-red) 25%, transparent)",
                }}
              >
                <FiAlertCircle className="shrink-0" />
                {org.setupStatus === "PENDING"
                  ? "Organization setup has not been started. Complete the setup wizard to unlock all features."
                  : "Organization setup is incomplete. Resume the setup wizard to finish configuration."}
              </div>
            )}

            {/* Identity */}
            <Section title="Organization Identity">
              <div className="flex items-center gap-4 mb-5">
                {org?.branding?.logoUrl ? (
                  <img
                    src={org?.branding?.logoUrl}
                    alt={`${org.name} logo`}
                    className="w-16 h-16 rounded-xl object-center shrink-0"
                    style={{ border: "1px solid var(--rf-border)" }}
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
                    style={{
                      background:
                        "color-mix(in srgb, var(--rf-accent) 18%, transparent)",
                      color: "var(--rf-accent)",
                    }}
                  >
                    {user?.firstName?.[0]?.toUpperCase() ?? "O"}
                    {user?.lastName?.[0]?.toUpperCase() ?? "O"}
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className="text-lg font-bold truncate uppercase"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    {user?.firstName?.toUpperCase()}
                    {user?.lastName?.toUpperCase()}
                  </p>
                  {org.subdomain && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--rf-txt3)" }}
                    >
                      {org.subdomain}.app.cx-control.com
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Slug" value={org.slug} />
                {org.subdomain && (
                  <InfoField label="Subdomain" value={org.subdomain} />
                )}
                {org.companyEmail && (
                  <InfoField
                    label="Company Email"
                    value={org.companyEmail}
                    icon={<FiMail />}
                  />
                )}
                <InfoField
                  label="Status"
                  value={org.status}
                  valueStyle={{
                    color:
                      org.status === "ACTIVE"
                        ? "var(--rf-green)"
                        : "var(--rf-red)",
                    fontWeight: 600,
                  }}
                />
                <InfoField
                  label="Setup Status"
                  value={org.setupStatus}
                  valueStyle={{
                    color:
                      org.setupStatus === "COMPLETE"
                        ? "var(--rf-green)"
                        : "var(--rf-red)",
                    fontWeight: 600,
                  }}
                />
                {org.setupCompletedAt && (
                  <InfoField
                    label="Setup Completed"
                    value={new Date(org.setupCompletedAt).toLocaleDateString()}
                  />
                )}
              </div>
            </Section>

            {/* Classification & Plan */}
            <Section title="Classification & Plan">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Company Type"
                  value={COMPANY_ROLE_LABELS[org.companyRole ?? ""] ?? org.type}
                />
                {org.companySize && (
                  <InfoField
                    label="Plan"
                    value={`${COMPANY_SIZE_LABELS[org.companySize] ?? org.companySize}${org.pricingAmount != null ? ` · $${org.pricingAmount.toLocaleString()}/mo` : ""}`}
                  />
                )}
                {org.pricingTier && (
                  <InfoField label="Pricing Tier" value={org.pricingTier} />
                )}
              </div>
            </Section>

            {/* Scope Config */}
            {org.scopeConfig && (
              <Section title="Scope Configuration">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Multi-Site (Multi-DC)"
                    value={org.scopeConfig.multiDC ? "Enabled" : "Disabled"}
                  />
                  <InfoField
                    label="Default Connected Mode"
                    value={
                      org.scopeConfig.defaultConnected ? "Enabled" : "Disabled"
                    }
                  />
                </div>
              </Section>
            )}

            {/* Facilities */}
            {org.facilities?.length > 0 && (
              <Section title={`Facilities (${org.facilities.length})`}>
                <div className="space-y-4">
                  {org.facilities.map((f) => (
                    <div
                      key={f.id}
                      className="rounded-xl p-4"
                      style={{
                        background: "var(--rf-bg)",
                        border: "1px solid var(--rf-border)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {f.name ?? DC_TYPE_LABELS[f.dcType] ?? f.dcType}
                        </p>
                        {f.isPrimary && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                            style={{
                              background:
                                "color-mix(in srgb, var(--rf-accent) 15%, transparent)",
                              color: "var(--rf-accent)",
                            }}
                          >
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <InfoField
                          label="Type"
                          value={DC_TYPE_LABELS[f.dcType] ?? f.dcType}
                        />
                        <InfoField
                          label="Uptime Tier"
                          value={
                            UPTIME_TIER_LABELS[f.uptimeTier] ?? f.uptimeTier
                          }
                        />
                        <InfoField
                          label="Scale"
                          value={
                            FACILITY_SCALE_LABELS[f.facilityScale] ??
                            f.facilityScale
                          }
                        />
                        <InfoField
                          label="Cooling"
                          value={
                            COOLING_TYPE_LABELS[f.coolingType] ?? f.coolingType
                          }
                        />
                        <InfoField
                          label="Power Redundancy"
                          value={
                            POWER_REDUNDANCY_LABELS[f.powerRedundancy] ??
                            f.powerRedundancy
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Equipment Catalog */}
            {org.equipment?.length > 0 && (
              <Section
                title={`Equipment Catalog (${org.equipment.length} classes)`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{ borderBottom: "1px solid var(--rf-border)" }}
                      >
                        {[
                          "Code",
                          "Asset Class",
                          "Manufacturer",
                          "Qty",
                          "Lead Time",
                          "Procurement",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: "var(--rf-txt3)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {org.equipment.map((e) => (
                        <tr
                          key={e.id}
                          style={{ borderBottom: "1px solid var(--rf-border)" }}
                        >
                          <td className="py-2.5 px-3">
                            <span
                              className="font-mono text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: "var(--rf-bg2)",
                                color: "var(--rf-accent)",
                              }}
                            >
                              {e.assetCode}
                            </span>
                          </td>
                          <td
                            className="py-2.5 px-3 text-xs font-medium"
                            style={{ color: "var(--rf-txt)" }}
                          >
                            {e.assetClass}
                          </td>
                          <td
                            className="py-2.5 px-3 text-xs"
                            style={{ color: "var(--rf-txt2)" }}
                          >
                            {e.manufacturer ?? "—"}
                          </td>
                          <td
                            className="py-2.5 px-3 text-xs"
                            style={{ color: "var(--rf-txt)" }}
                          >
                            {e.quantity}
                          </td>
                          <td
                            className="py-2.5 px-3 text-xs"
                            style={{ color: "var(--rf-txt2)" }}
                          >
                            {e.leadWeeks != null ? `${e.leadWeeks}w` : "—"}
                          </td>
                          <td
                            className="py-2.5 px-3 text-xs"
                            style={{ color: "var(--rf-txt2)" }}
                          >
                            {PROCUREMENT_OWNER_LABELS[e.procurementOwner] ??
                              e.procurementOwner}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Branding */}
            {org.branding && (
              <Section title="Branding">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {org.branding.primaryColor && (
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: "var(--rf-bg)",
                        border: "1px solid var(--rf-border)",
                      }}
                    >
                      <p
                        className="text-[10px] uppercase tracking-wider mb-2"
                        style={{ color: "var(--rf-txt3)" }}
                      >
                        Primary Color
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md shrink-0"
                          style={{
                            background: org.branding.primaryColor,
                            border: "1px solid var(--rf-border)",
                          }}
                        />
                        <span
                          className="text-sm font-mono font-medium"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {org.branding.primaryColor}
                        </span>
                      </div>
                    </div>
                  )}
                  <InfoField
                    label="Google Earth Add-on"
                    value={org.branding.googleEarth ? "Enabled" : "Disabled"}
                  />
                </div>
              </Section>
            )}
          </>
        ) : (
          <Section title="Organization">
            <p className="text-sm" style={{ color: "var(--rf-txt3)" }}>
              Organization details not available. They load automatically when
              the app initializes.
            </p>
          </Section>
        ))}

      {/* ── Permissions Tab ───────────────────────────────────── */}
      {tab === "permissions" && (
        <Section
          title={role?.description ?? "Role Permissions"}
          subtitle={`Role: ${role?.name?.replace(/_/g, " ")}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rf-border)" }}>
                  {["Module", "Display Name", "Permission", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-3 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--rf-txt3)" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {role?.permissions?.map((perm) => (
                  <tr
                    key={perm.moduleKey}
                    style={{ borderBottom: "1px solid var(--rf-border)" }}
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className="font-medium capitalize text-xs"
                        style={{ color: "var(--rf-txt)" }}
                      >
                        {perm.orgLabel}
                      </span>
                    </td>
                    <td
                      className="py-2.5 px-3 text-xs"
                      style={{ color: "var(--rf-txt2)" }}
                    >
                      {perm.displayName}
                    </td>
                    <td className="py-2.5 px-3">
                      <PermBadge level={perm.permissionLevel} />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {perm.allowedActions.map((a) => (
                          <span
                            key={a}
                            className="text-[10px] px-1.5 py-0.5 rounded capitalize font-medium"
                            style={{
                              background: "var(--rf-bg)",
                              color: "var(--rf-txt3)",
                              border: "1px solid var(--rf-border2)",
                            }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Accessible modules summary */}
          <div className="mt-6">
            <p
              className="text-xs mb-2 font-semibold uppercase tracking-wider"
              style={{ color: "var(--rf-txt3)" }}
            >
              All Accessible Modules
            </p>
            <div className="flex flex-wrap gap-2">
              {user.accessibleModules?.map((mod) => (
                <span
                  key={mod}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium capitalize"
                  style={{
                    background: "var(--rf-bg)",
                    color: "var(--rf-txt2)",
                    border: "1px solid var(--rf-border)",
                  }}
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── Security Tab ──────────────────────────────────────── */}
      {tab === "security" && (
        <Section title="Change Password">
          <div className="max-w-md space-y-4">
            <PwField
              label="Current Password"
              name="currentPassword"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
            />
            <PwField
              label="New Password"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={handlePwChange}
            />
            <PwField
              label="Confirm New Password"
              name="confirmNewPassword"
              value={pwForm.confirmNewPassword}
              onChange={handlePwChange}
            />

            {pwError && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background:
                    "color-mix(in srgb, var(--rf-red) 12%, transparent)",
                  color: "var(--rf-red)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-red) 25%, transparent)",
                }}
              >
                <FiAlertCircle className="shrink-0" /> {pwError}
              </div>
            )}

            {pwSuccess && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background:
                    "color-mix(in srgb, var(--rf-green) 12%, transparent)",
                  color: "var(--rf-green)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-green) 25%, transparent)",
                }}
              >
                <FiCheck className="shrink-0" /> Password updated successfully.
              </div>
            )}

            <button
              onClick={handleUpdatePassword}
              disabled={pwLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--rf-accent)",
                color: "#fff",
                opacity: pwLoading ? 0.7 : 1,
              }}
            >
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border)",
      }}
    >
      <div className="mb-5">
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--rf-txt)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-xs capitalize mt-0.5"
            style={{ color: "var(--rf-txt3)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoField({ label, value, icon, valueStyle = {} }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "var(--rf-bg)",
        border: "1px solid var(--rf-border)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: "var(--rf-txt3)" }}
      >
        {label}
      </p>
      <p
        className="text-sm font-medium flex items-center gap-1.5"
        style={{ color: "var(--rf-txt)", ...valueStyle }}
      >
        {icon && <span style={{ color: "var(--rf-txt3)" }}>{icon}</span>}
        {value || "—"}
      </p>
    </div>
  );
}

function PwField({ label, name, value, onChange }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "var(--rf-txt2)" }}
      >
        {label}
      </label>
      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
        style={{
          background: "var(--rf-bg)",
          border: "1px solid var(--rf-border)",
          color: "var(--rf-txt)",
        }}
      />
    </div>
  );
}

function StatusPill({ label, active }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{
        background: active
          ? "color-mix(in srgb, var(--rf-green) 15%, transparent)"
          : "color-mix(in srgb, var(--rf-red) 15%, transparent)",
        color: active ? "var(--rf-green)" : "var(--rf-red)",
      }}
    >
      {label}
    </span>
  );
}

function PermBadge({ level }) {
  const map = {
    approve: {
      bg: "color-mix(in srgb, var(--rf-green) 15%, transparent)",
      color: "var(--rf-green)",
    },
    edit: {
      bg: "color-mix(in srgb, var(--rf-accent) 15%, transparent)",
      color: "var(--rf-accent)",
    },
    view: {
      bg: "color-mix(in srgb, var(--rf-txt3) 15%, transparent)",
      color: "var(--rf-txt3)",
    },
  };
  const s = map[level] ?? map.view;
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {level}
    </span>
  );
}
