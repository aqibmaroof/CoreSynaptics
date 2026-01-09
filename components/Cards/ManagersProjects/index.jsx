export default function ManagersProjects({ user }) {
  return (
    <div className="w-full px-3 gap-10 flex items-center justify-between font-gilroy mt-10 mb-6">
      {/* LEFT SIDE */}
      <div>
        <h2 className="text-[#DF5B30] dark:text-[#fff] text-2xl font-semibold">
          Project Summary{" "}
        </h2>
        <div className="flex items-center justify-between w-full mt-4 gap-30">
          <div className="flex items-center justify-between gap-10 w-[max-content]">
            <p className="text-7xl font-bold font-gilroy">147</p>
            <div className="flex flex-col items-start justify-end text-2xl w-30">
              <p>Total Projects</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-10 w-[max-content]">
            <p className="text-6xl font-bold text-7xl">120</p>
            <div className="flex flex-col items-right justify-end text-2xl w-40">
              <p>Active Projects</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-10 w-[max-content]">
          <p className="text-6xl font-bold text-7xl">27</p>
          <div className="flex flex-col items-start justify-end text-2xl">
            <p>Cancelled Projects</p>
          </div>
        </div>
        </div>
      </div>

    
    </div>
  );
}
