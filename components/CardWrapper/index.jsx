// components/common/CardWrapper.jsx
import React from "react";

const CardWrapper = ({ children, className = "" }) => {
  return (
    <div
      className={`
        bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl p-6
      ${className}
    `}
    >
      {children}
    </div>
  );
};

export default CardWrapper;
