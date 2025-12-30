"use client";
import { useState, useRef } from "react";
import { CreateCountry } from "../../../services/Country";

export default function AddCountry() {
  // Form data state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    dialCode: "",
    flag: "",
    isActive: false,
    sortOrder: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image upload (optional - for flag image)
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setPreview(imageURL);
    }
  };

  const removeImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clear form
  const clearForm = () => {
    setFormData({
      code: "",
      name: "",
      dialCode: "",
      flag: "",
      isActive: true,
      sortOrder: 1,
    });
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        dialCode: formData.dialCode,
        flag: formData.flag,
        isActive: formData.isActive,
        sortOrder: parseInt(formData.sortOrder),
      };
      await CreateCountry(payload);
      clearForm();
      setMessage({ type: "success", text: "Country added successfully!" });
      setTimeout(() => {
        window.location.href = "/Country/List";
      }, 100);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error adding country: " + error.message,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold px-5 pt-5 text-[#101437] dark:text-white">
            Add a new Country Code
          </h1>
          <p className="text-sm px-5 text-[#101437] dark:text-white mb-5">
            Add country codes for your application
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 mr-5">
          {message.text && (
            <div className="px-5 py-10">
              <div
                className={`alert ${
                  message.type === "error" ? "alert-error" : "alert-success"
                }`}
              >
                <span>{message.text}</span>
              </div>
            </div>
          )}
          <button className="btn btn-accent" onClick={clearForm}>
            Discard Country
          </button>
          <button className="btn btn-success" onClick={handleSubmit}>
            Publish Country
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center items-start gap-10 w-[100%]">
          {/* LEFT COLUMN */}
          <div className="flex flex-col items-left justify-center w-[65%]">
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] px-5 py-5 ml-5 rounded-xl w-full shadow-xl">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Country Information
              </h4>

              <div className="flex justify-start gap-5 w-full">
                <fieldset className="fieldset w-full">
                  <legend className="text-xl text-[#101437] dark:text-white mb-3">
                    Country Name *
                  </legend>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-[#97999b]"
                    placeholder="United States"
                    required
                  />
                </fieldset>

                <fieldset className="fieldset w-full">
                  <legend className="text-xl text-[#101437] dark:text-white">
                    Country Code *
                  </legend>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-[#97999b]"
                    placeholder="US"
                    maxLength="2"
                    required
                  />
                  <p className="text-xs text-[#101437] dark:text-white">
                    2-letter ISO code (e.g., US, GB, CA)
                  </p>
                </fieldset>
              </div>

              <div className="flex items-center justify-start gap-5 w-full my-3">
                <fieldset className="fieldset w-full">
                  <legend className="text-xl text-[#101437] dark:text-white mb-3">
                    Dial Code *
                  </legend>
                  <input
                    type="text"
                    name="dialCode"
                    value={formData.dialCode}
                    onChange={handleInputChange}
                    className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-[#97999b]"
                    placeholder="+1"
                    required
                  />
                  <p className="text-xs text-[#101437] dark:text-white mt-1">
                    Include the + symbol (e.g., +1, +44, +91)
                  </p>
                </fieldset>
              </div>

              <div className="flex items-center justify-start gap-5 w-full my-3">
                <fieldset className="fieldset w-full">
                  <legend className="text-xl text-[#101437] dark:text-white mb-3">
                    Sort Order
                  </legend>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-[#97999b]"
                    placeholder="1"
                    min="1"
                  />
                  <p className="text-xs text-[#101437] dark:text-white mt-1">
                    Display order in dropdown (lower numbers appear first)
                  </p>
                </fieldset>

                <fieldset className="fieldset w-full mt-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xl text-[#101437] dark:text-white">
                      Active Status
                    </span>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="toggle toggle-accent"
                    />
                  </div>
                  <p className="text-xs text-[#101437] dark:text-white mt-1">
                    Enable this country code in the system
                  </p>
                </fieldset>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] px-5 py-5 ml-5 mt-5 rounded-xl w-full shadow-xl">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white mb-4">
                Preview
              </h4>
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#2a5f57] rounded-lg">
                <span className="text-4xl">{formData.flag || "🏳️"}</span>
                <div>
                  <p className="text-lg font-semibold text-[#101437] dark:text-white">
                    {formData.name || "Country Name"}
                  </p>
                  <p className="text-sm text-[#101437] dark:text-white">
                    {formData.code || "XX"} - {formData.dialCode || "+0"}
                  </p>
                  <p className="text-xs text-[#101437] dark:text-white">
                    Status: {formData.isActive ? "Active" : "Inactive"} | Order:{" "}
                    {formData.sortOrder}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col items-left justify-center mr-5 w-[35%]">
            {/* Optional Flag Image Upload */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl flex flex-col items-left justify-center px-5 py-5 rounded-xl w-full">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Country Flag Image (Optional)
              </h4>
              <p className="text-xs text-[#101437] dark:text-white mb-3">
                You can use emoji in the form or upload a flag image
              </p>
              <fieldset className="fieldset w-full mb-3">
                <input
                  type="file"
                  className="file-input w-full file-input-md bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  onChange={handleChange}
                  accept="image/*"
                  ref={fileInputRef}
                />
                {preview && (
                  <div className="relative w-fit mt-3">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 z-10"
                    >
                      ✕
                    </button>
                    <figure className="rounded-xl">
                      <img
                        src={preview}
                        alt="Flag Preview"
                        className=" rounded-xl border max-h-12 w-full object-cover"
                      />
                    </figure>
                  </div>
                )}
              </fieldset>
            </div>

            {/* Common Country Codes Reference */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5 mt-5">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white mb-3">
                Common Country Codes
              </h4>
              <div className="space-y-2 text-sm text-[#101437] dark:text-white">
                <div className="flex justify-between">
                  <span>🇺🇸 United States</span>
                  <span>US, +1</span>
                </div>
                <div className="flex justify-between">
                  <span>🇬🇧 United Kingdom</span>
                  <span>GB, +44</span>
                </div>
                <div className="flex justify-between">
                  <span>🇨🇦 Canada</span>
                  <span>CA, +1</span>
                </div>
                <div className="flex justify-between">
                  <span>🇦🇺 Australia</span>
                  <span>AU, +61</span>
                </div>
                <div className="flex justify-between">
                  <span>🇮🇳 India</span>
                  <span>IN, +91</span>
                </div>
                <div className="flex justify-between">
                  <span>🇵🇰 Pakistan</span>
                  <span>PK, +92</span>
                </div>
                <div className="flex justify-between">
                  <span>🇩🇪 Germany</span>
                  <span>DE, +49</span>
                </div>
                <div className="flex justify-between">
                  <span>🇫🇷 France</span>
                  <span>FR, +33</span>
                </div>
              </div>
            </div>

            {/* JSON Payload Preview */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5 mt-5">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white mb-3">
                Payload Preview
              </h4>
              <pre className="text-xs bg-white dark:bg-[#2a5f57] p-3 rounded text-[#101437] dark:text-white overflow-x-auto">
                {JSON.stringify(
                  {
                    code: formData.code.toUpperCase() || "XX",
                    name: formData.name || "Country Name",
                    dialCode: formData.dialCode || "+0",
                    flag: formData.flag || "🏳️",
                    isActive: formData.isActive,
                    sortOrder: parseInt(formData.sortOrder) || 1,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
