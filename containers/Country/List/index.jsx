"use client";
import { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import {
  getCountries,
  DeleteCountry,
  UpdateCountry,
} from "../../../services/Country";

export default function ListCountry() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const countriesPerPage = 20;

  // Fetch countries from API
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await getCountries(countriesPerPage, currentPage);
      setCountries(response?.data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * countriesPerPage;
  const indexOfFirst = indexOfLast - countriesPerPage;
  const currentCountries = countries?.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(countries.length / countriesPerPage);

  // Delete country
  const removeCountry = async (id) => {
    try {
      // TODO: Replace with actual DELETE endpoint when available
      await DeleteCountry(id);

      // Remove from state
      fetchCountries();
      setMessage({ type: "success", text: "Country deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Toggle active status
  const toggleStatus = async (id, currentStatus) => {
    try {
      // TODO: Replace with actual PATCH/PUT endpoint when available
      const payload = { isActive: !currentStatus };
      await UpdateCountry(id, payload);
      // Update state
      fetchCountries();
      setMessage({ type: "success", text: "Country Updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );
  }

  return (
    <div className="px-5">
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="text-2xl font-bold text-[#101437] dark:text-white">
            All Country Codes
          </h1>
          <p className="text-sm text-[#101437] dark:text-white">
            Total: {countries.length} countries
          </p>
        </div>
        <div className="flex gap-2">
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
          <button className="btn btn-accent" onClick={fetchCountries}>
            Refresh
          </button>
          <a href="/Country/Add" className="btn btn-success">
            Add Country
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full border border-gray-200 dark:border-gray-700">
          <thead className="text-center text-[#101437] dark:text-white bg-[#f6f6f6] dark:bg-[#1e4742]">
            <tr>
              <th>#</th>
              <th>Flag</th>
              <th>Country Name</th>
              <th>Code</th>
              <th>Dial Code</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentCountries.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-10 text-[#101437] dark:text-white"
                >
                  No countries found. Add your first country!
                </td>
              </tr>
            ) : (
              currentCountries.map((country, idx) => (
                <tr
                  key={country.id || country.code}
                  className="bg-[#f6f6f6] dark:bg-[#1e4742] text-center hover:bg-gray-50 dark:hover:bg-[#101437]"
                >
                  <td className="text-[#101437] dark:text-white">
                    {indexOfFirst + idx + 1}
                  </td>
                  <td>
                    <span className="text-3xl">{country.flag}</span>
                  </td>
                  <td className="text-[#101437] dark:text-white font-semibold">
                    {country.name}
                  </td>
                  <td className="text-[#101437] dark:text-white font-mono">
                    {country.code}
                  </td>
                  <td className="text-[#101437] dark:text-white">
                    {country.dialCode}
                  </td>
                  <td className="text-[#101437] dark:text-white">
                    {country.sortOrder}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(country.id, country.isActive)}
                      className={`px-3 py-1 rounded-full text-white text-xs cursor-pointer ${
                        country.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {country.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="flex items-center justify-center gap-2">
                    <a
                      href={`/country/edit/${country.id || country.code}`}
                      className="btn btn-xs btn-info my-2"
                    >
                      <FaEdit />
                    </a>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => removeCountry(country.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5 mb-5">
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
              className={`btn btn-sm ${
                currentPage === i + 1 ? "btn-error" : ""
              }`}
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
      )}

      {/* Summary Footer */}
      <div className="mt-5 p-4 bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl">
        <div className="flex justify-between text-[#101437] dark:text-white">
          <span>
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, countries.length)} of {countries.length}{" "}
            countries
          </span>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>
    </div>
  );
}
