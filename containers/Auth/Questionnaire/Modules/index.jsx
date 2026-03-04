"use client";
import config from "../../../../config";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
 

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Illustration */}
      <div className="bg-[url('/images/login-illustration.png')] bg-cover bg-center bg-no-repeat w-full flex items-center justify-center"></div>

      {/* Right Side: Form */}
      <div className="bg-[url('/images/mainBackground.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center w-full p-8 md:p-16 lg:p-12 xl:p-20">
        <div className="flex items-center gap-2 mb-5">
          <img
            src={config?.brand}
            className="w-70 h-auto dark:hidden"
            alt="Brand"
          />
          <img
            src={config?.brand}
            className="w-70 h-auto hidden dark:block"
            alt="Brand Dark"
          />
        </div>
        
        <div className="mb-10 mt-18">
          <h3 className=" text-4xl font-sora font-bold">Customize Your Experience</h3>
          <h2 className="text-base dark:text-[#A0AEC0] mt-4">
            Let’s choose the best plan to fulfill your needs
          </h2>
        </div>
        <div>
            <progress className="progress progress-success w-xl" value="50" max="100"></progress>
        </div>
            
        <div>
            <h3 className="text-base font-bold mt-4">Plan must have modules included</h3> 
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-4 mt-4">
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Projects
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0075F8] to-[#00387A] border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Sales
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Scheduling
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              RMA/RCA
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0075F8] to-[#00387A] border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Field Execution
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              QA/QC
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Safety
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Finance
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Commissioning
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0075F8] to-[#00387A] border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Supply Chain
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Documents
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              HR
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0075F8] to-[#00387A] border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Reports
            </button>
            <button
              type="submit"
              className="backdrop-blur-2xl border-3 border-blue-500 text-white px-3 py-3 text-xl md:rounded-2xl"
            >
              Admin
            </button>
            
        </div>
        <div className="mt-20 flex items-center justify-between">
          
          <h2 className="text-sm text-[#A0AEC0] mt-2 underline" >See all plans</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={()=> router.push("/Auth/Questionnaire/AdvanceReporting")}
              type="submit"
              className="bg-gradient-to-r from-[#656A80] to-[#1A1F37] border-3 border-blue-700 text-white px-5 py-2 md: rounded-2xl"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0075F8] to-[#00387A] border-3 border-blue-700 text-white px-5 py-2 md: rounded-2xl"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
