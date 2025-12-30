"use client";
import { useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

export default function ListOutfiter() {
  const [hunts, setHunts] = useState(
    Array.from({ length: 45 }).map((_, i) => ({
      id: i + 1,
      name: `Hunt ${i + 1}`,
      code: `H${i + 1}`,
      area: i % 2 === 0 ? "North Forest" : "South Plains",
      basePrice: 100 + i * 10,
      discountedPrice: 90 + i * 8,
      status: i % 2 === 0,
      terms: ["Follow guide", "Safety first"],
      images: [
        "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
      ],
    }))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const huntsPerPage = 20;

  // Pagination logic
  const indexOfLast = currentPage * huntsPerPage;
  const indexOfFirst = indexOfLast - huntsPerPage;
  const currentHunts = hunts.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(hunts.length / huntsPerPage);

  const removeHunt = (id) => {
    setHunts((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="px-5">
      <div className="flex items-center justify-between my-5">
        <h1 className="text-2xl font-bold text-[#101437] dark:text-white">
          All Outfitters
        </h1>
        <a href="/Outfiters/Add" className="btn btn-success">
          Add Outfitter
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full border border-gray-200 dark:border-gray-700">
          <thead className="text-center text-[#101437] dark:text-white  bg-[#f6f6f6] dark:bg-[#1e4742]">
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Rating</th>
              <th>Area</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentHunts.map((hunt, idx) => (
              <tr
                key={hunt.id}
                className=" bg-[#f6f6f6] dark:bg-[#1e4742] text-center hover:bg-gray-50 dark:hover:bg-[#101437]"
              >
                <td>{indexOfFirst + idx + 1}</td>
                <td>
                  <div className="flex items-center justify-center  gap-2">
                    {hunt.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={hunt.name}
                        className="w-12 h-12 object-cover rounded-xl border"
                      />
                    ))}
                  </div>
                </td>
                <td>{hunt.name}</td>
                <td>{hunt.code}</td>
                <td>{hunt.code}</td>
                <td>{hunt.area}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs ${
                      hunt.status ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {hunt.status ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="flex items-center justify-center  gap-2">
                  <button className="btn btn-xs btn-info">
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-xs btn-error"
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
