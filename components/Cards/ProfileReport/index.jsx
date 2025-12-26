import NumberFormatter from "../../../Utils/NumberFormatter";

export default function SalesCards({
  title,
  year,
  reportPercentage,
  reportPersonsCount,
}) {
  return (
    <div className="bg-[#f6f6f6] col-span-2 p-6 rounded-xl mt-2 shadow-xl h-53 dark:bg-[#1e4742] flex flex-col justify-between">
      <div className="flex justify-between">
        <div>
          <p className="text-[#183431] dark:text-[#fff]">{title}</p>
          <p class="w-[max-content] bg-[#E2B864]/40 hover:bg-[#A37B47] text-warning text-sm font-medium py-1 px-2 rounded-md shadow-md shadow-[#E2B864]/40 transition duration-150 ease-in-out">
            YEAR {year}
          </p>
        </div>
        <div>
          <p className="text-[#71dd37]">{reportPercentage}%</p>
          <p className="text-[#183431] dark:text-[#fff]">
            {NumberFormatter(reportPersonsCount)}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-end items-end w-full  h-25">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <path
            d="M0 50 C40 60, 60 20, 100 30 S160 60, 200 40"
            fill="none"
            stroke="#4ADE80"
            strokeWidth="3"
          />
        </svg>

        <div className="flex justify-evenly w-full px-3 text-[9px] text-gray-500 ">
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
        </div>
      </div>
    </div>
  );
}
