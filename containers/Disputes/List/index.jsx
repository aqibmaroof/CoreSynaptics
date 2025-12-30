"use client";
import { useState, useEffect } from "react";
import { getDisputes, UpdateDispute } from "../../../services/Disputes";
import formatDateTime from "../../../Utils/DateFormater";
import RefundStatusDropdown from "../../../components/StatusDropDown";

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "bg-yellow-500" },
  { value: "under_review", label: "Under Review", color: "bg-blue-500" },
  { value: "resolved", label: "Resolved", color: "bg-green-500" },
  { value: "closed", label: "Closed", color: "bg-gray-500" },
];

const STATUS_REASONS = {
  open: "Dispute has been created and is currently open for review.",
  under_review: "Dispute is under investigation by the support team.",
  resolved: "Dispute has been resolved in favor of the relevant party.",
  closed: "Dispute has been closed and no further action will be taken.",
};

export default function ListDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  const disputesPerPage = 20;
  const indexOfLast = currentPage * disputesPerPage;
  const indexOfFirst = indexOfLast - disputesPerPage;

  useEffect(() => {
    getDisputesList();
  }, [currentPage]);

  const getDisputesList = async () => {
    const response = await getDisputes(disputesPerPage, 0, currentPage);
    setDisputes(response?.data);
    setTotalPages(response?.meta?.totalPages);
  };

  const UpdateDisputeStatus = async (id, status) => {
    const payload = {
      status,
      resolution:
        STATUS_REASONS[status] || "Dispute status updated by administrator.",
    };

    try {
      await UpdateDispute(id, payload);

      setMessage({
        type: "success",
        text: "Dispute status updated successfully!",
      });

      getDisputesList();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update dispute status.",
      });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };
  return (
    <div className="px-5">
      <div className="flex items-center justify-between my-5">
        <h1 className="text-2xl font-bold text-[#101437] dark:text-white">
          All Disputes
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
          <thead className="text-center text-[#101437] dark:text-white  bg-[#f6f6f6] dark:bg-[#1e4742]">
            <tr>
              <th>#</th>
              <th>id</th>
              <th>Resolved By</th>
              <th>Reviewed At</th>
              <th>Resolution</th>
              <th>Booking Id</th>
              <th>Initiated By</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {disputes?.map((re, idx) => (
              <tr
                key={re.id}
                className=" bg-[#f6f6f6] dark:bg-[#1e4742] text-center hover:bg-gray-50 dark:hover:bg-[#101437]"
              >
                <td>{indexOfFirst + idx + 1}</td>
                <td>{re.id}</td>
                <td>{re.resolvedBy || "-"}</td>
                <td>{formatDateTime(re.resolvedAt)}</td>
                <td>{re.resolution || "-"}</td>

                <td>{re.bookingId}</td>
                <td>{re.initiatedBy}</td>
                <td>{re.reason || "No Reason Defined"}</td>
                <td>
                  <RefundStatusDropdown
                    re={re}
                    onStatusUpdate={(id, status) => {
                      UpdateDisputeStatus(id, status);
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
