import config from "../../../config";

export default function ProfileReportCard({ user }) {
  return (
    <div className="w-full mt-2 col-span-8 bg-[#f6f6f6] dark:bg-[#1e4742] rounded-2xl p-6 flex items-center justify-between shadow-xl">
      {/* LEFT SIDE */}
      <div>
        <h2 className="text-[#DF5B30] dark:text-[#E2B864] text-xl font-semibold flex items-center gap-2">
          Congratulations {user?.fullName}! 🎉
        </h2>

        <p className="text-[#183431] dark:text-[#fff] mt-2">
          You have done
          <span className="font-semibold text-[#183431] dark:text-[#fff] mx-1">
            72% more sales
          </span>
          today.
          <br />
          Check your new badge in your profile.
        </p>

        <button className="mt-4 bg-teal-600 hover:bg-teal-700 text-[#fff] px-4 py-2 rounded-lg transition">
          View Badges
        </button>
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden md:flex transform translate-y-6">
        <img
          src={config?.home_card}
          alt="Illustration"
          className="w-50 h-auto"
        />
      </div>
    </div>
  );
}
