// components/cards/TransactionsCard.jsx
import React from "react";
import CardWrapper from "../../CardWrapper";

const TransactionsCard = ({ data }) => {
  const { title, transactions } = data;

  return (
    <CardWrapper className="col-span-4 flex flex-col">
      {" "}
      {/* Example: Takes 4 columns */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {title}
        </h2>
        <button className="text-gray-400 dark:text-[#fff] hover:text-gray-600 dark:hover:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </button>
      </div>
      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.map((tx, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${tx.iconBg} ${tx.iconColor}`}
              >
                {tx.icon}
              </div>
              <div>
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {tx.type}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff]">
                  {tx.description}
                </p>
              </div>
            </div>
            <p
              className={`text-base font-semibold ${
                tx.amount.startsWith("+") ? "text-green-500" : "text-red-500"
              }`}
            >
              {tx.amount} {tx.currency}
            </p>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
};

export default TransactionsCard;
