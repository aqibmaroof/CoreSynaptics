"use client";
import { useState, useEffect } from "react";
import { getRefunds, UpdateRefund } from "../../../services/Refunds";
import formatDateTime from "../../../Utils/DateFormater";
import RefundStatusDropdown from "../../../components/StatusDropDown";

const STATUS_REASONS = {
  pending: "Refund request has been received and is awaiting review.",
  processing:
    "Refund is currently being reviewed and processed by the finance team.",
  completed:
    "Refund has been Completed and will be issued to the original payment method.",
  failed:
    "Refund could not be processed due to a payment or verification issue.",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "processing", label: "Processing", color: "bg-blue-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "failed", label: "Failed", color: "bg-red-500" },
];

export default function ListRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  const refundsPerPage = 20;
  const indexOfLast = currentPage * refundsPerPage;
  const indexOfFirst = indexOfLast - refundsPerPage;

  useEffect(() => {
    getRefundsList();
  }, [currentPage]);

  const getRefundsList = async () => {
    const response = await getRefunds(refundsPerPage, 0, currentPage);
    setRefunds(response?.data);
    setTotalPages(response?.meta?.totalPages);
  };

  const UpdateRefundsStatus = async (id, status) => {
    try {
      const payload = {
        status: status,
        note:
          STATUS_REASONS[status] || "Refund status updated by administrator.",
      };
      await UpdateRefund(id, payload);
      setMessage({
        type: "success",
        text: "Refund Status Updated Successfully !",
      });
      getRefundsList();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update refund status.",
      });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };
  return (
    <div className="px-5">
      <div className="flex items-center justify-between my-5">
        <h1 className="text-2xl font-bold text-[#101437] dark:text-white">
          All Refunds
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
              <th>Processed By</th>
              <th>Processed At</th>
              <th>Stripe Refund Id</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {refunds?.map((re, idx) => (
              <tr
                key={re.id}
                className=" bg-[#f6f6f6] dark:bg-[#1e4742] text-center hover:bg-gray-50 dark:hover:bg-[#101437]"
              >
                <td>{indexOfFirst + idx + 1}</td>
                <td>{re.id}</td>
                <td>{re.processedBy}</td>
                <td>{formatDateTime(re.processedAt)}</td>
                <td>{re.stripeRefundId}</td>
                <td>{re.reason}</td>
                <td>
                  <RefundStatusDropdown
                    re={re}
                    onStatusUpdate={(id, status) => {
                      UpdateRefundsStatus(id, status);
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
