"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getContacts, createContact, updateContact, deleteContact } from "@/services/Contacts";
import { getCompanies } from "@/services/Companies";
import CompanySelect from "@/components/CRM/CompanySelect";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

export default function ContactsList() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [timelineEntity, setTimelineEntity] = useState(null); // { id, name }

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "",
    jobTitle: "",
  });

  useEffect(() => {
    fetchContacts();
    getCompanies()
      .then((res) => setCompanies(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await getContacts();
      setContacts(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", companyId: "", jobTitle: "" });
    setEditingContact(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (contact) => {
    setForm({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      companyId: contact.companyId || "",
      jobTitle: contact.jobTitle || "",
    });
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) {
      setMessage({ type: "error", text: "First and last name are required" });
      return;
    }
    setSaving(true);
    try {
      if (editingContact) {
        await updateContact(editingContact.id, form);
        setMessage({ type: "success", text: "Contact updated successfully" });
      } else {
        await createContact(form);
        setMessage({ type: "success", text: "Contact created successfully" });
      }
      setShowModal(false);
      resetForm();
      await fetchContacts();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Failed to save contact" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      setContacts(contacts.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      setMessage({ type: "success", text: "Contact deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete contact" });
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompanyName = (contact) => {
    if (contact.company?.name) return contact.company.name;
    const c = companies.find((c) => c.id === contact.companyId);
    return c?.name || "—";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Contacts</h1>
            <p className="text-gray-400">Manage your business contacts</p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <div className={`z-50 px-4 py-3 rounded-lg border shadow-lg ${message.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"}`}>
                {message.text}
              </div>
            )}
            <button onClick={openCreate}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Contact
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input type="text" placeholder="Search contacts..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm" />
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {["Name", "Email", "Phone", "Job Title", "Company", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => router.push(`/CRM/Contacts/Detail/${contact.id}`)}
                        className="text-white font-medium text-sm hover:text-cyan-400 text-left">
                        {contact.firstName} {contact.lastName}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{contact.email || "—"}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{contact.phone || "—"}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{contact.jobTitle || "—"}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{getCompanyName(contact)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(contact)} className="text-cyan-400 hover:text-cyan-300 text-xs">Edit</button>
                        <button
                          onClick={() => setTimelineEntity({ id: contact.id, name: `${contact.firstName} ${contact.lastName}` })}
                          className="text-purple-400 hover:text-purple-300 text-xs"
                        >
                          Timeline
                        </button>
                        <button onClick={() => setDeleteConfirm(contact.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredContacts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-12">No contacts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-white font-bold mb-2">Delete Contact?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Contact Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-white font-bold text-lg mb-6">{editingContact ? "Edit Contact" : "Create Contact"}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">First Name *</label>
                    <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Last Name *</label>
                    <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Job Title</label>
                  <input type="text" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. VP of Engineering" />
                </div>
                <CompanySelect
                  value={form.companyId}
                  onChange={(id) => setForm({ ...form, companyId: id })}
                  companies={companies}
                  onCreated={(company) => setCompanies((prev) => [...prev, company])}
                  label="Assign to Company"
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? "Saving..." : editingContact ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Modal */}
        {timelineEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setTimelineEntity(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 shrink-0">
                <h3 className="text-white font-bold">Timeline — {timelineEntity.name}</h3>
                <button onClick={() => setTimelineEntity(null)} className="text-gray-400 hover:text-white text-lg leading-none">✕</button>
              </div>
              <div className="p-5 overflow-y-auto">
                <ActivityTimeline entityType="contact" entityId={timelineEntity.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
