import { useState } from "react";

const PersmissionsDropdown = ({ re, onStatusUpdate, STATUS_OPTIONS }) => {
  const [status, setStatus] = useState(re.role.id);
  const [loading, setLoading] = useState(false);

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
      className={`px-2 py-1 rounded-full text-xs text-white cursor-pointer w-[max-content] outline-none `}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.id} value={opt.id} className="text-black">
          {opt.name}
        </option>
      ))}
    </select>
  );
};

export default PersmissionsDropdown;
