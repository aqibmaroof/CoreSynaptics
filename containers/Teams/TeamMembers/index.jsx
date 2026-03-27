"use client";

import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import {
  AddTeamMember,
  DeleteTeamMember,
  GetTeamById,
  GetTeamMembers,
} from "@/services/Teams";
import { getUsers } from "@/services/Users";

export default function TeamMembers() {
  const router = useRouter();
  const params = useParams();
  const teamId = params?.id;

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchMembers();
      fetchAllUsers();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const res = await GetTeamById(teamId);
      setTeam(res);
    } catch (err) {
      console.error("Error fetching team:", err.message);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await GetTeamMembers(teamId);
      setMembers(res);
    } catch (err) {
      console.error("Error fetching members:", err.message);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await getUsers();
      setAllUsers(res);
    } catch (err) {
      console.error("Error fetching users:", err.message);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredAvailableUsers.map((u) => u.id));
    }
  };

  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      setAddLoading(true);
      await AddTeamMember(teamId, { userIds: selectedUserIds });
      setSelectedUserIds([]);
      setUserSearch("");
      fetchMembers();
      showMessage(
        "success",
        `${selectedUserIds.length} member(s) added successfully! 🚀`,
      );
    } catch (err) {
      showMessage("error", "Error adding members: " + err?.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await DeleteTeamMember(teamId, userId);
      fetchMembers();
      showMessage("success", "Member removed successfully! 🚀");
    } catch (err) {
      showMessage("error", "Error removing member: " + err?.message);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const memberIds = members.map((m) => m.id ?? m.userId);
  const availableUsers = allUsers.filter((u) => !memberIds.includes(u.id));
  const filteredAvailableUsers = availableUsers.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );
  const allSelected =
    filteredAvailableUsers.length > 0 &&
    filteredAvailableUsers.every((u) => selectedUserIds.includes(u.id));

  return (
    <div className="text-white flex flex-col justify-center py-5 px-7">
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={() => router.back()}
          className="text-gray-400 text-sm mb-3 flex items-center gap-1 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Teams
        </button>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
          {team?.name ?? "Team"} — Members
        </h1>
        <p className="text-gray-400 text-sm">Manage members of this team.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Add Members Card ── */}
        <div className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Add Members</h2>
            {selectedUserIds.length > 0 && (
              <span className="text-xs bg-orange-400/20 text-orange-400 px-3 py-1 rounded-full font-medium">
                {selectedUserIds.length} selected
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white/5 border border-orange-400/40 focus:border-orange-400 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors"
            />
          </div>

          {/* Select All row */}
          {filteredAvailableUsers.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 mb-2 px-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  allSelected
                    ? "border-orange-400 bg-orange-400"
                    : "border-gray-600"
                }`}
              >
                {allSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              Select all ({filteredAvailableUsers.length})
            </button>
          )}

          {/* User list */}
          <div className="max-h-56 overflow-y-auto flex flex-col gap-2 pr-1 mb-4">
            {filteredAvailableUsers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                {availableUsers.length === 0
                  ? "All users are already team members."
                  : "No users match your search."}
              </p>
            ) : (
              filteredAvailableUsers.map((u) => {
                const selected = selectedUserIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      selected
                        ? "border-orange-400/60 bg-orange-400/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-bold">
                      {u.firstName?.slice(0, 1)}
                      {u.lastName?.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {u.email}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        selected
                          ? "border-orange-400 bg-orange-400"
                          : "border-gray-600"
                      }`}
                    >
                      {selected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Add button */}
          <button
            onClick={handleAddMembers}
            disabled={selectedUserIds.length === 0 || addLoading}
            className="w-full px-6 py-3 rounded-xl text-sm font-semibold text-white bg-orange-400 hover:bg-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {addLoading
              ? "Adding..."
              : selectedUserIds.length > 0
                ? `Add ${selectedUserIds.length} Member${selectedUserIds.length > 1 ? "s" : ""}`
                : "Add Members"}
          </button>
        </div>

        {/* ── Members Table ── */}
        <div className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-3xl">
          {message.text && (
            <div className="mb-4">
              <div
                className={`tooltip text-white tooltip-bottom ${
                  message.type === "success"
                    ? "tooltip-accent"
                    : "tooltip-error"
                }`}
                data-tip={message.text}
              >
                <button
                  className={`btn font-thin text-white ${
                    message.type === "success" ? "btn-accent" : "btn-error"
                  }`}
                >
                  {message.text.slice(0, 160)}
                </button>
              </div>
            </div>
          )}

          <h2 className="text-white font-semibold text-lg mb-4">
            Current Members ({members.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#080C26] rounded-2xl">
                <tr>
                  <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                    #
                  </th>
                  <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                    Name
                  </th>
                  <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                    Email
                  </th>
                  <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td
                      colSpan="100%"
                      className="text-center p-13 border-l-1 border-r-1 border-b-1 border-gray-600"
                    >
                      NO MEMBERS FOUND
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr
                      key={member.id ?? member.userId ?? index}
                      className="text-center hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-sm">
                            {(member.name ?? member.firstName)?.slice(0, 1)}
                            {member.lastName?.slice(0, 1)}
                          </div>
                          <span className="text-white font-medium">
                            {member.name ??
                              `${member.firstName ?? ""} ${member.lastName ?? ""}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white">{member.email}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center">
                          <button
                            className="text-error text-xl cursor-pointer"
                            onClick={() => handleRemoveMember(member.userId)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
