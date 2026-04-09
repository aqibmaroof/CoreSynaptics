"use client";

import { useState, useEffect } from "react";
import SubmittalEditForm from "@/components/EditSubmittalsForm";
import { updateSubmittal, getSubmittalById } from "@/services/Submittals";
import { useParams } from "next/navigation";

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


export default function EditSubmittalContainer() {
    const params = useParams()
    const submittalId = params.id;
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [message, setMessage] = useState("");

    const [projects, setProjects] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchProjects().then(setProjects);
        fetchCompanies().then(setCompanies);
        fetchUsers().then(setUsers);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!submittalId) return;

            try {
                const data = await getSubmittalById(submittalId);
                setInitialData(data);
            } catch (err) {
                setMessage("Failed to load submittal ❌");
            }
        };

        loadData();
    }, [submittalId]);

    const handleUpdate = async (data) => {
        try {
            setLoading(true);
            setMessage("");

            await updateSubmittal(submittalId, data);

            setMessage("Submittal updated successfully ✅");
        } catch (err) {
            setMessage("Failed to update submittal ❌");
        } finally {
            setLoading(false);
        }
    };

    // if (!initialData) {
    //     return <div className="p-6 text-gray-200">Loading submittal...</div>;
    // }

    return (
        <div className="mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4 text-white">
                Edit Submittal
            </h1>
<p className="text-gray-300 mb-6">
        Update fields to update records
      </p>
            {/* {message && (
                <div className="mb-4 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-700">
                    {message}
                </div>
            )} */}

            <SubmittalEditForm
                data={initialData}
                onSubmit={handleUpdate}
                loading={loading}
                projects={projects}
                companies={companies}
                users={users}
            />
        </div>
    );
}