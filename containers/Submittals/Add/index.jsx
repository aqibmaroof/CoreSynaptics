"use client";

import { useState, useEffect } from "react";
import SubmittalForm from "@/components/SubmittalsForm";
import { createSubmittal } from "@/services/Submittals";
import { getCompanies } from "@/services/Companies";
import { getUsers } from "@/services/Users";
import { useRouter } from "next/navigation";

function toArray(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ?? data?.companies ?? data?.users ?? []);
}

export default function CreateSubmittalContainer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getCompanies()
      .then((d) => setCompanies(toArray(d)))
      .catch(() => {});
    getUsers()
      .then((d) => setUsers(toArray(d)))
      .catch(() => {});
  }, []);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage(null);
      await createSubmittal(data);
      setMessage({ type: "success", text: "Submittal created successfully" });
      router.back();
    } catch (err) {
      // Surface the SPECIFIC backend field errors instead of the generic
      // "Some fields have errors" message, so the user knows what to fix.
      const fieldErrs =
        err?.errors && typeof err.errors === "object"
          ? Object.values(err.errors).flat().filter(Boolean)
          : [];
      setMessage({
        type: "error",
        text: fieldErrs.length
          ? fieldErrs.join(" ")
          : err?.message || "Error creating submittal",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6">
      <h1
        className="text-2xl font-semibold mb-2"
        style={{ color: "var(--rf-txt)" }}
      >
        Create Submittal
      </h1>
      <p className="mb-6" style={{ color: "var(--rf-txt2)" }}>
        Fill all required fields to initiate workflow
      </p>

      {message && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={
            message.type === "success"
              ? {
                  background:
                    "color-mix(in srgb, var(--rf-green) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-green) 30%, transparent)",
                  color: "var(--rf-green)",
                }
              : {
                  background:
                    "color-mix(in srgb, var(--rf-red) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
                  color: "var(--rf-red)",
                }
          }
        >
          {message.text}
        </div>
      )}

      <SubmittalForm
        onSubmit={handleSubmit}
        loading={loading}
        companies={companies}
        users={users}
      />
    </div>
  );
}
