export default function ManagersOverview({ user }) {
  return (
    <div className="w-full px-3 gap-10 flex flex-col justify-between font-gilroy mt-8 mb-6">
      {/* LEFT SIDE */}
        <h2 className="text-[#fff] text-xl md:text-2xl font-semibold">
          Project Managers (PMs){" "}
        </h2>
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center justify-between gap-7 w-[max-content]">
            <p className="text-5xl md:text-7xl font-bold font-gilroy">147</p>
            <div className="flex flex-col items-start justify-end text-sm md:text-xl">
              <p>Total <br />PMs</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-7 w-[max-content]">
            <p className=" font-bold text-5xl md:text-7xl">120</p>
            <div className="flex flex-col items-right justify-end text-sm md:text-xl">
              <p>Active <br />PMs</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-7 w-[max-content]">
            <p className="font-bold text-5xl md:text-7xl">27</p>
            <div className="flex flex-col items-start justify-end text-sm md:text-xl">
              <p>Inactive PMs</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-7 w-[max-content]">
            <p className="font-bold text-5xl md:text-7xl">27</p>
            <div className="flex flex-col items-right justify-end text-sm md:text-xl  text-right">
              <p>Inactive <br />PMs</p>
            </div>
          </div>
        </div>
    </div>
  );
}
