"use client";

import { useState, useEffect } from "react";
import SubmittalForm from "@/components/SubmittalsForm";
import { createSubmittal } from "@/services/Submittals";

// Mock APIs (replace with real)
const fetchProjects = async () => [
  { id: "1", name: "Project Alpha" },
  { id: "2", name: "Project Beta" },
];

const fetchCompanies = async () => [
  { id: "1", name: "ABC Construction" },
  { id: "2", name: "XYZ Engineers" },
];

const fetchUsers = async () => [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Sarah Khan" },
];

export default function CreateSubmittalContainer() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchProjects().then(setProjects);
    fetchCompanies().then(setCompanies);
    fetchUsers().then(setUsers);
  }, []);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage(null);

      await createSubmittal(data);

      setMessage("Submittal created successfully ✅");
    } catch (err) {
      setMessage(err.message || "Error creating submittal ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6">
      <h1 className="text-2xl text-gray-100 font-semibold mb-2">Create Submittal</h1>
      <p className="text-gray-300 mb-6">
        Fill all required fields to initiate workflow
      </p>

      {message && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          {message}
        </div>
      )}


      <SubmittalForm
        onSubmit={handleSubmit}
        loading={loading}
        projects={projects}
        companies={companies}
        users={users}
      />
    </div>
  );
}