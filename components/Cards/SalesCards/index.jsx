export default function SalesCards({ title, salesCount }) {
  return (
    <div className=" col-span-2 p-6 rounded-xl mt-2 shadow-xl h-53 bg-[#1e4742] flex flex-col justify-between">
      <p className="text-white">{title}</p>
      <p className="text-white">{salesCount}</p>
      <div className="flex flex-col justify-end items-end mt-1 h-19">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <path
            d="M0 50 C40 60, 60 20, 100 30 S160 60, 200 40"
            fill="none"
            stroke="#4ADE80"
            strokeWidth="3"
          />
        </svg>

        <div className="flex justify-between w-full px-3 text-xs text-gray-500 ">
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
        </div>
      </div>
    </div>
  );
}
