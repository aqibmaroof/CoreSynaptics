"use client";
import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { getHunts } from "../../../services/Hunts";

export default function HuntList() {
  const [hunts, setHunts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const huntsPerPage = 20;
  const indexOfLast = currentPage * huntsPerPage;
  const indexOfFirst = indexOfLast - huntsPerPage;

  useEffect(() => {
    getHuntsList();
  }, [currentPage]);

  const removeHunt = (id) => {
    setHunts((prev) => prev.filter((h) => h.id !== id));
  };

  const getHuntsList = async () => {
    const response = await getHunts(huntsPerPage, 0, currentPage);
    setHunts(response?.data);
    setTotalPages(response?.meta?.totalPages);
  };

  return (
    <div className="px-5">
      <div className="flex items-center justify-between my-5">
        <h1 className="text-2xl font-bold text-[#101437] dark:text-white">
          All Hunts
        </h1>
        <a href="/Hunt/Add" className="btn btn-success">
          Add Hunt
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full border border-gray-200 dark:border-gray-700">
          <thead className="text-center text-[#101437] dark:text-white  bg-[#f6f6f6] dark:bg-[#1e4742]">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Code</th>
              <th>Area</th>
              <th>Base Price</th>
              <th>Outfiter Name</th>
              <th>Status</th>
              <th>Terms</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {hunts.map((hunt, idx) => (
              <tr
                key={hunt.id}
                className=" bg-[#f6f6f6] dark:bg-[#1e4742] text-center hover:bg-gray-50 dark:hover:bg-[#101437]"
              >
                <td>{indexOfFirst + idx + 1}</td>
                <td>{hunt.title}</td>
                <td>{hunt.id}</td>
                <td>{hunt.region}</td>
                <td>${hunt.basePriceMinor}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs ${
                      hunt.outfitter?.verificationState === "approved"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {hunt?.outfitter?.orgName}
                  </span>
                </td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs ${
                      hunt.status === "published"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {hunt.status}
                  </span>
                </td>
                <td>
                  {/* <ul className="list-disc">
                    {hunt.terms.map((term, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-center text-sm"
                      >
                        {term}
                      </li>
                    ))}
                  </ul> */}
                </td>
                <td>
                  <div className="flex items-center justify-center  gap-2">
                    {hunt?.media?.map((img, i) => (
                      <img
                        key={i}
                        src={img?.media?.cdnUrl}
                        alt={hunt.title}
                        className="w-12 h-12 object-cover rounded-xl border border-[0.5px]"
                      />
                    ))}
                  </div>
                </td>
                <td className="flex items-center justify-center  gap-2">
                  <a href={`/Hunt/Add?id=${hunt?.id}`}>
                    {" "}
                    <button className="btn btn-sm mt-2 mb-2 btn-info">
                      <FaEdit />
                    </button>
                  </a>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => removeHunt(hunt.id)}
                  >
                    <FaTrash />
                  </button>
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
