// components/common/CardWrapper.jsx
import React from "react";

const CardWrapper = ({ children, className = "" }) => {
  return (
    <div
      className={`
        flex w-full bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl
      ${className}
    `}
    >
      {children}
    </div>
  );
};

export default CardWrapper;
