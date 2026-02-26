"use client";
import config from "../../../config";
import { useRouter } from "next/navigation";
import { LoginService, GetUser } from "../../../services/auth";


const LoginPage = () => {
  const router = useRouter();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await LoginService(formData);
      console.log(response);
      if (response) {
        setMessage({ type: "success", text: "Login successful! 🚀" });

        // Save credentials if "Remember Me" is checked
        saveCredentials();

        // const userResponse = await GetUser();
        // setUser({ user: userResponse });

        setTimeout(() => router.push("/"), 2000);
      } else {
        setMessage({
          type: "error",
          text: response?.message || "Login failed.",
        });

        // Don't save credentials on failed login
        if (rememberMe) {
          clearSavedCredentials();
          setRememberMe(false);
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: Array.isArray(error?.message)
          ? error?.message?.[0]
          : error?.message || "An error occurred during login.",
      });

      // Don't save credentials on error
      if (rememberMe) {
        clearSavedCredentials();
        setRememberMe(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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
          <h3 className="text-[#00E691] text-xl font-sora tracking-widest">C O M I N G  S O O N</h3>
          <h2 className="text-7xl font-bold dark:text-white mt-4">
            Data Center
          </h2>
          <p className="text-6xl text-[#101437] dark:text-gray-300">
            one window solution
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="flex flex-col items-start justify-center">
            <form className="w-full flex items-center justify-center px-1">
          <div className="w-full max-w-xl relative flex bg-transparent backdrop-blur-[42px] border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl p-1 shadow-2xl overflow-hidden">
            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              className="flex-1 bg-transparent text-white placeholder-white px-2 py-4 w-42 md:w-80 text-lg outline-none "
              required
            />

            {/* Subscribe Button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0075F8] to-[#00387A] border-3 border-blue-700 text-white px-5 py-4 md: rounded-2xl"
            >
              Subscribe
            </button>
          </div>
        </form>
            <h2 className="text-lg font-sora mt-4 ml-2">Subscribe for early bird information</h2>
          </div>
        </form>
        <div className="mt-12">
          {/* Social Media Icons */}
          <div className="flex items-center gap-6 ml-2">
            <a
              href="https://www.facebook.com/coresynaptics/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto"
            >
              <img src="/images/facebook.png" alt="fb" />
            </a>
            <a
              href="https://x.com/coresynaptics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/images/twitter.png" alt="TW" />
            </a>
            <a
              href="https://www.linkedin.com/company/core-synaptics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/images/linkedin.png" alt="LinkdIn" />
            </a>
            <a
              href="https://www.instagram.com/coresynaptics/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/images/instagram.png" alt="Insta" />
            </a>
          </div>
          <h2 className="text-sm text-[#A0AEC0] mt-2">@ 2026, All rights reserved. made by C2M</h2>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
