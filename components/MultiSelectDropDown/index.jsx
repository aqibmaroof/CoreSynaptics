"use client";
import { useState } from "react";

export default function MultiSelectDropdown({
  label,
  options = [],
  selected = [],
  setSelected,
  displayKey = "name",
  deleteUser,
  setMessage,
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (item) => {
    const exists = selected.find((s) => s.id === item.id);
    if (label !== "Assign Teams") {
      if (!exists) {
        setSelected(item); // ✅ SEND SINGLE ITEM
      }
    } else if (!exists && selected.length === 0) {
      setSelected(item); // ✅ SEND SINGLE ITEM
    } else {
      setMessage({
        type: "error",
        text: `Error Selecting Team : This project already has a team`,
      });
    }

    setOpen(false);
  };

  const removeItem = (id) => {
    // optional: only UI removal (no API call)
    deleteUser(id);
  };

  return (
    <div className="w-full flex gap-21 mt-5">
      <label className="text-white mb-1 block">{label}</label>
      <div className="w-2/6">
        <div
          onClick={() => setOpen(!open)}
          className="bg-[#12153d] text-white p-2 rounded cursor-pointer min-h-[40px] flex flex-col  flex-wrap gap-2"
        >
          {selected?.length === 0 && (
            <span className="text-gray-400 text-sm">Select {label}</span>
          )}

          {/* SHOW SELECTED */}
          {selected.length > 0 &&
            selected?.map((item) => (
              <span
                key={item?.id}
                className="bg-indigo-600 px-2 py-1 rounded text-sm w-full"
              >
                {item?.firstName
                  ? `${item?.firstName} ${item?.lastName}`
                  : displayKey && item
                    ? item[displayKey]
                    : ""}

                {/* REMOVE BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item?.id); // ✅ CALL REMOVE
                  }}
                  className="text-xs ml-1 cursor-pointer hover:text-error"
                >
                  ✕
                </button>
              </span>
            ))}
        </div>
        {open && (
          <div className="bg-[#1e214f] mt-1 rounded max-h-40 overflow-y-auto">
            {options.map((item) => (
              <div
                key={item?.id}
                onClick={() => handleSelect(item)}
                className="p-2 hover:bg-indigo-600 cursor-pointer text-sm"
              >
                {item.firstName
                  ? `${item.firstName} ${item.lastName}`
                  : item[displayKey]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
