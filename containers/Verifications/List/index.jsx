"use client";
import { useState, useEffect } from "react";
import {
  getVerifications,
  UpdateVerification,
} from "../../../services/Verifications";
import formatDateTime from "../../../Utils/DateFormater";
import RefundStatusDropdown from "../../../components/StatusDropDown";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "approved", label: "Approved", color: "bg-green-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" },
];
const STATUS_REASONS = {
  pending: "Verification request has been received and is awaiting review.",
  approved: "Verification has been approved after successful review.",
  rejected:
    "Verification failed due to incomplete or invalid submitted information.",
};

export default function ListVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  const verificationsPerPage = 20;
  const indexOfLast = currentPage * verificationsPerPage;
  const indexOfFirst = indexOfLast - verificationsPerPage;

  useEffect(() => {
    getVerificationsList();
  }, [currentPage]);

  const getVerificationsList = async () => {
    const response = await getVerifications(verificationsPerPage, 0, currentPage);
    setVerifications(response?.data);
    setTotalPages(response?.meta?.totalPages);
  };

  const UpdateVerificationStatus = async (id, status) => {
    const payload = {
      status,
      reason:
        STATUS_REASONS[status] ||
        "Verification status updated by administrator.",
    };

    try {
      await UpdateVerification(id, payload);

      setMessage({
        type: "success",
        text: "Verification status updated successfully!",
      });

      getVerificationsList();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update verification status.",
      });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };
  return (
    <div className="px-5">
      <div className="flex items-center justify-between my-5">
        <h1 className="text-2xl font-bold text-[#183431] dark:text-white">
          All Verifications
        </h1>
        {/* <a href="/Outfiters/Add" className="btn btn-success">
          Add Outfitter
        </a> */}
        {message.text && (
          <div className="px-5">
            <div
              className={`alert ${
                message.type === "error" ? "alert-error" : "alert-success"
              }`}
            >
              <span>{message.text}</span>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full border border-gray-200 dark:border-gray-700">
          <thead className="text-center text-[#183431] dark:text-white  bg-[#f6f6f6] dark:bg-[#1e4742]">
            <tr>
              <th>#</th>
              <th>id</th>
              <th>Reviewed By</th>
              <th>Reviewed At</th>
              <th>Subject Id</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {verifications?.map((re, idx) => (
              <tr
                key={re.id}
                className=" bg-[#f6f6f6] dark:bg-[#1e4742] text-center hover:bg-gray-50 dark:hover:bg-[#183431]"
              >
                <td>{indexOfFirst + idx + 1}</td>
                <td>{re.id}</td>
                <td>{re.reviewedBy || "-"}</td>
                <td>{formatDateTime(re.reviewedAt)}</td>
                <td>{re.subjectId}</td>
                <td>{re.reason || "No Reason Defined"}</td>
                <td>
                  <RefundStatusDropdown
                    re={re}
                    onStatusUpdate={(id, status) => {
                      UpdateVerificationStatus(id, status);
                    }}
                    STATUS_OPTIONS={STATUS_OPTIONS}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-5">
        <button
          className="btn btn-sm btn-success"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`btn btn-sm ${currentPage === i + 1 ? "btn-error" : ""}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="btn btn-success btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
