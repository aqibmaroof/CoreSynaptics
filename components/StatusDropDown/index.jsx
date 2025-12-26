import { useState } from "react";

const RefundStatusDropdown = ({ re, onStatusUpdate, STATUS_OPTIONS }) => {
  const [status, setStatus] = useState(re.status);
  const [loading, setLoading] = useState(false);

  const current = STATUS_OPTIONS.find((s) => s.value === status);

  const handleChange = async (e) => {
    const newStatus = e.target.value;

    if (newStatus === status) return;

    setStatus(newStatus); // optimistic UI
    setLoading(true);

    try {
      onStatusUpdate(re.id, newStatus);
    } catch (err) {
      setStatus(re.status); // rollback on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className={`px-2 py-1 rounded-full text-xs text-white cursor-pointer w-[max-content] outline-none ${current?.color}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="text-black">
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default RefundStatusDropdown;
