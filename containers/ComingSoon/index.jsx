"use client";
import config from "../../config";

const ComingSoon = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side: Illustration */}
      <div className="bg-[url('/images/login-illustration.png')] bg-cover bg-center bg-no-repeat w-full flex items-center justify-center"></div>

      {/* Right Side: Form */}
      <div className="bg-[url('/images/mainBackground.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center w-full p-8 md:p-16 lg:p-12 xl:p-20">
        <div className="flex items-center gap-2 mb-5">
          <img src={config?.brand} className="w-70 h-auto" alt="Brand" />
        </div>

        <div className="mb-10 mt-18">
          <h3 className="flex items-center gap-10 text-[#00E691] text-xl font-sora tracking-widest">
            <span>C O M I N G</span> <span>S O O N</span>
          </h3>
          <h2 className="text-7xl font-bold text-white mt-4">Data Center</h2>
          <p className="text-6xl text-gray-300">one window solution</p>
        </div>
 {/* <form
          action="https://forms.zohopublic.com/customelectronics1/form/CustomerSignupForm/formperma/O0Tqc3RSeo0qdhKwX11lBUGwf-Y4kgyz0T-vNyEB5Yk/htmlRecords/submit"
          name="form"
          id="form"
          method="POST"
          accept-charset="UTF-8"
          enctype="multipart/form-data"
          className="flex flex-col"
        >
          <input type="hidden" name="zf_referrer_name" value="" />
          <input type="hidden" name="zf_redirect_url" value="" />
          <input type="hidden" name="zc_gad" value="" />
          <p></p>
          <label>
            Enter a valid email address
            <em>*</em>
          </label>
          <input
            type="text"
            maxlength="255"
            name="Email"
            value=""
            fieldType="9"
            placeholder=""
          />
          <label>
            Enter your phone number
            <em>*</em>
          </label>
          <input
            type="text"
            compname="PhoneNumber"
            name="PhoneNumber_countrycode"
            phoneFormat="1"
            isCountryCodeEnabled="false"
            maxlength="20"
            value=""
            fieldType="11"
            id="international_PhoneNumber_countrycode"
            placeholder=""
          />
          <label>Number</label>
          <label>Enter the company name if applicable</label>
          <input
            type="text"
            name="SingleLine1"
            value=""
            fieldType="1"
            maxlength="255"
            placeholder=""
          />
          <label>
            Enter your first name
            <em>*</em>
          </label>
          <input
            type="text"
            name="SingleLine2"
            value=""
            fieldType="1"
            maxlength="255"
            placeholder=""
          />
          <label>Enter your last name</label>
          <input
            type="text"
            name="SingleLine3"
            value=""
            fieldType="1"
            maxlength="255"
            placeholder=""
          />
          <button type="submit">
            <em>Submit</em>
          </button>
        </form> */}
        <form className="space-y-4">
          {/* Email Field */}
          <div className="flex flex-col items-start justify-center">
            <form className="w-full flex items-center">
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
            <h2 className="text-lg font-sora mt-4 ml-2">
              Subscribe for early bird information
            </h2>
          </div>
        </form>
        {/* Social icons */}
        <div className="mt-12">
          <div className="flex items-center gap-6 ml-2">
            <a
              href="https://www.facebook.com/coresynaptics/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              <svg
                width="10"
                height="20"
                viewBox="0 0 10 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.952 19.2H6.468V10.44H9.408L9.852 7.032H6.468V4.848C6.468 3.864 6.744 3.192 8.16 3.192H9.972V0.132C9.66 0.0959999 8.592 0 7.344 0C4.728 0 2.952 1.596 2.952 4.512V7.032H0V10.44H2.952V19.2Z"
                  fill="#00E691"
                />
              </svg>
            </a>
            <a
              href="https://x.com/coresynaptics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.032 20C15.0696 20 18.372 14.6132 18.372 9.94228C18.372 9.78894 18.372 9.63646 18.3624 9.48484C19.0048 8.98518 19.5592 8.36492 20 7.65506C19.4016 7.94107 18.7656 8.12887 18.1152 8.21158C18.8 7.76964 19.3128 7.07529 19.5584 6.25603C18.9136 6.66781 18.2088 6.95813 17.4736 7.11406C16.2304 5.6909 14.1512 5.62198 12.8288 6.96071C11.9768 7.82391 11.6144 9.11096 11.8792 10.3386C9.24 10.1956 6.7808 8.85337 5.1136 6.64541C4.2424 8.26068 4.688 10.3265 6.1304 11.3637C5.608 11.3473 5.0968 11.1957 4.64 10.9218V10.9666C4.6408 12.649 5.7424 14.098 7.2736 14.4314C6.7904 14.5736 6.2832 14.5942 5.792 14.4917C6.2216 15.9321 7.4544 16.9185 8.8584 16.9469C7.696 17.9307 6.26 18.4649 4.7816 18.4631C4.5208 18.4623 4.26 18.4459 4 18.4123C5.5016 19.4495 7.248 20 9.032 19.9974"
                  fill="#00E691"
                />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/core-synaptics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="43"
                  height="43"
                  rx="21.5"
                  stroke="url(#paint0_radial_747_5886)"
                />
                <rect
                  x="0.5"
                  y="0.5"
                  width="43"
                  height="43"
                  rx="21.5"
                  stroke="url(#paint1_radial_747_5886)"
                />
                <rect
                  x="0.5"
                  y="0.5"
                  width="43"
                  height="43"
                  rx="21.5"
                  stroke="url(#paint2_radial_747_5886)"
                />
                <path
                  d="M14.983 17.1963C16.1914 17.1963 17.171 16.2167 17.171 15.0083C17.171 13.7999 16.1914 12.8203 14.983 12.8203C13.7746 12.8203 12.795 13.7999 12.795 15.0083C12.795 16.2167 13.7746 17.1963 14.983 17.1963Z"
                  fill="#00E691"
                />
                <path
                  d="M19.237 18.8543V30.9933H23.006V24.9903C23.006 23.4063 23.304 21.8723 25.268 21.8723C27.205 21.8723 27.229 23.6833 27.229 25.0903V30.9943H31V24.3373C31 21.0673 30.296 18.5543 26.474 18.5543C24.639 18.5543 23.409 19.5613 22.906 20.5143H22.855V18.8543H19.237ZM13.095 18.8543H16.87V30.9933H13.095V18.8543Z"
                  fill="#00E691"
                />
                <defs>
                  <radialGradient
                    id="paint0_radial_747_5886"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(-28.072 -30.5486 30.5486 -14.3224 22 22)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                  </radialGradient>
                  <radialGradient
                    id="paint1_radial_747_5886"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(26.4 22.6914 -22.6914 13.4694 22 22)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#582CFF" />
                    <stop offset="1" stop-color="#582CFF" stop-opacity="0" />
                  </radialGradient>
                  <radialGradient
                    id="paint2_radial_747_5886"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientTransform="matrix(-24.112 23.32 -23.32 -12.302 22 22)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#151515" />
                    <stop offset="1" stop-color="#151515" stop-opacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/coresynaptics/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="18"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.95 5.324C17.9399 4.56662 17.7981 3.81678 17.531 3.108C17.2993 2.51015 16.9455 1.9672 16.4922 1.51383C16.0388 1.06046 15.4958 0.706651 14.898 0.475C14.1983 0.212357 13.4592 0.0703413 12.712 0.0550001C11.75 0.0120001 11.445 0 9.003 0C6.561 0 6.248 6.70552e-08 5.293 0.0550001C4.54616 0.0704541 3.80735 0.212468 3.108 0.475C2.51006 0.706489 1.96702 1.06024 1.51363 1.51363C1.06024 1.96702 0.706489 2.51006 0.475 3.108C0.211831 3.80713 0.0701232 4.54611 0.056 5.293C0.013 6.256 0 6.561 0 9.003C0 11.445 -7.45058e-09 11.757 0.056 12.713C0.071 13.461 0.212 14.199 0.475 14.9C0.706878 15.4978 1.0609 16.0406 1.51444 16.4938C1.96798 16.947 2.51106 17.3006 3.109 17.532C3.80643 17.8052 4.54537 17.9574 5.294 17.982C6.257 18.025 6.562 18.038 9.004 18.038C11.446 18.038 11.759 18.038 12.714 17.982C13.4612 17.9673 14.2004 17.8256 14.9 17.563C15.4977 17.3311 16.0405 16.9772 16.4938 16.5238C16.9472 16.0705 17.3011 15.5277 17.533 14.93C17.796 14.23 17.937 13.492 17.952 12.743C17.995 11.781 18.008 11.476 18.008 9.033C18.006 6.591 18.006 6.281 17.95 5.324ZM8.997 13.621C6.443 13.621 4.374 11.552 4.374 8.998C4.374 6.444 6.443 4.375 8.997 4.375C10.2231 4.375 11.399 4.86207 12.266 5.72905C13.1329 6.59603 13.62 7.7719 13.62 8.998C13.62 10.2241 13.1329 11.4 12.266 12.267C11.399 13.1339 10.2231 13.621 8.997 13.621ZM13.804 5.282C13.207 5.282 12.726 4.8 12.726 4.204C12.726 4.0625 12.7539 3.92239 12.808 3.79166C12.8622 3.66093 12.9415 3.54215 13.0416 3.44209C13.1416 3.34204 13.2604 3.26267 13.3912 3.20852C13.5219 3.15437 13.662 3.1265 13.8035 3.1265C13.945 3.1265 14.0851 3.15437 14.2158 3.20852C14.3466 3.26267 14.4654 3.34204 14.5654 3.44209C14.6655 3.54215 14.7448 3.66093 14.799 3.79166C14.8531 3.92239 14.881 4.0625 14.881 4.204C14.881 4.8 14.399 5.282 13.804 5.282Z"
                  fill="#00E691"
                />
              </svg>
            </a>
          </div>
          <h2 className="text-sm text-[#A0AEC0] mt-2">
            @ 2026, All rights reserved. made by C2M
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
