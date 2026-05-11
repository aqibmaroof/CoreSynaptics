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
      setMessage({
        type: "error",
        text: err?.message || "Error creating submittal",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6">
      <h1 className="text-2xl text-gray-100 font-semibold mb-2">
        Create Submittal
      </h1>
      <p className="text-gray-300 mb-6">
        Fill all required fields to initiate workflow
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-green-900/20 border-green-500/30 text-green-300"
              : "bg-red-900/20 border-red-500/30 text-red-300"
          }`}
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
