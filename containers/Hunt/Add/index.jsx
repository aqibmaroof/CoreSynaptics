"use client";
import { CreateHunt } from "@/services/Hunts";
import { useState, useRef, useEffect } from "react";
// import { getUser } from "../../../services/instance/tokenService";
import { UploadImage } from "../../../services/Media";

export default function AddHuntForm() {
  const scrollContainerRef = useRef(null);

  // State for form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    species: [],
    availableDates: [],
    region: "",
    geo: { lat: "", lng: "" },
    basePriceMinor: "",
    depositPercent: "",
    capacityPerDayDefault: "",
    durationDays: "",
    inclusions: {
      lodging: "",
      meals: "",
      guide: "",
    },
    exclusions: {
      license: "",
      transportation: "",
    },
    tags: [],
    weaponTypes: [],
    transportationType: "provided",
    lodgingType: "cabin",
    chefProvided: false,
    gearProvided: false,
    cruiseAvailable: false,
    fenceType: "not_fenced",
    territorySizeAcres: "",
    staffLanguage: "",
    nearestAirport: "",
    airportDistanceKm: "",
    airportTransferProvided: false,
    railwayTransferProvided: false,
    outfitterId: "",
  });

  // Image handling - separate File objects and display objects
  const [accommodationImages, setAccommodationImages] = useState([]);
  const [accommodationFiles, setAccommodationFiles] = useState([]);
  const accommodationsFileInputRef = useRef(null);

  // Dynamic lists
  const [speciesInput, setSpeciesInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [weaponInput, setWeaponInput] = useState("");

  // Season dates
  const [seasonStart, setSeasonStart] = useState("");
  const [seasonEnd, setSeasonEnd] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle nested object changes (geo, inclusions, exclusions)
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Accommodation images handling
  const handleAccommodationChange = async (e) => {
    const files = Array.from(e.target.files);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const response = await UploadImage("listing_temp", formData);

    setAccommodationFiles((prev) => [...prev, ...files]);

    const newImages = files.map(() => ({
      s3Key: response?.s3Key,
      cdnUrl: response?.cdnUrl,
    }));
    setAccommodationImages((prev) => [...prev, ...newImages]);
  };

  const removeAccommodationFile = (s3Key) => {
    // Remove from display array
    const updatedImages = accommodationImages.filter(
      (img) => img.s3Key !== s3Key
    );
    setAccommodationImages(updatedImages);

    // Remove from File objects array
    const updatedFiles = accommodationFiles.filter(
      (file) => file.name.replace(/\s+/g, "") !== s3Key
    );
    setAccommodationFiles(updatedFiles);

    // Clear file input if no images left
    if (updatedImages.length === 0 && accommodationsFileInputRef.current) {
      accommodationsFileInputRef.current.value = "";
    }
  };

  // Function to clear accommodation images after successful upload
  const clearAccommodationImages = () => {
    setAccommodationImages([]);
    setAccommodationFiles([]);
    if (accommodationsFileInputRef.current) {
      accommodationsFileInputRef.current.value = "";
    }
  };

  // Add/remove array items
  const addToArray = (field, value, setter) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setter("");
    }
  };

  const removeFromArray = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (message?.text && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [message]);

  // Generate available dates from season range
  const generateAvailableDates = () => {
    if (!seasonStart || !seasonEnd) {
      setMessage({
        type: "error",
        text: "Error : Please select both start and end dates",
      });
      return;
    }

    const duration = parseInt(formData.durationDays);
    if (!duration || duration < 1) {
      setMessage({
        type: "error",
        text: "Error : Please enter a valid duration (days)",
      });
      return;
    }

    const start = new Date(seasonStart);
    const end = new Date(seasonEnd);

    const dates = [];

    // Generate dates with gap equal to duration

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }

    if (dates.length === 0) {
      setMessage({
        type: "error",
        text: `Error : No dates generated. Check your season range and duration..`,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);

      return;
    }

    setFormData((prev) => ({
      ...prev,
      availableDates: dates,
    }));
    // Check if the date range is at least as long as the duration
    if (dates.length < duration) {
      setMessage({
        type: "error",
        text: `Error : The selected date range (${dates.length} days) is shorter than the hunt duration (${duration} days). Please select a date range of at least ${duration} days.`,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);

      return;
    }
    // Show success message
    if (dates.length > duration) {
      setMessage({
        type: "error",
        text: `Error : The selected date range (${dates.length} days) is greater than the hunt duration (${duration} days). Please select a date range of ${duration} days.`,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);

      return;
    }

    setMessage({
      type: "success",
      text: `Success : Generated ${dates.length}  dates with ${duration} day gaps`,
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      species: [],
      availableDates: [],
      region: "",
      geo: { lat: "", lng: "" },
      basePriceMinor: "",
      depositPercent: "",
      capacityPerDayDefault: "",
      durationDays: "",
      inclusions: {
        lodging: "",
        meals: "",
        guide: "",
      },
      exclusions: {
        license: "",
        transportation: "",
      },
      tags: [],
      weaponTypes: [],
      transportationType: "provided",
      lodgingType: "cabin",
      chefProvided: false,
      gearProvided: false,
      cruiseAvailable: false,
      fenceType: "not_fenced",
      territorySizeAcres: "",
      staffLanguage: "",
      nearestAirport: "",
      airportDistanceKm: "",
      airportTransferProvided: false,
      railwayTransferProvided: false,
      outfitterId: "",
    });
    clearAccommodationImages();
    setSpeciesInput("");
    setTagInput("");
    setWeaponInput("");
    setSeasonStart("");
    setSeasonEnd("");
    setMessage({
      type: "success",
      text: `Success : Your form has been cleared successfully!`,
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate available dates if not already done
      if (formData.availableDates.length === 0 && seasonStart && seasonEnd) {
        setMessage({
          type: "error",
          text: `Error : Please generate available dates first`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return;
      }

      // Convert basePriceMinor to cents (multiply by 100 if needed)
      const payload = {
        ...formData,
        basePriceMinor: parseInt(formData.basePriceMinor) * 100, // Convert dollars to cents
        depositPercent: parseInt(formData.depositPercent),
        capacityPerDayDefault: parseInt(formData.capacityPerDayDefault),
        durationDays: parseInt(formData.durationDays),
        territorySizeAcres: parseInt(formData.territorySizeAcres),
        airportDistanceKm: parseInt(formData.airportDistanceKm),
        geo: {
          lat: parseFloat(formData.geo.lat),
          lng: parseFloat(formData.geo.lng),
        },
        // Images array with exact API structure (cdnUrl and s3Key only)
        images: accommodationImages,
      };

      // TODO: Upload images first using accommodationFiles
      // const uploadedImages = await uploadToS3(accommodationFiles);
      // payload.images = uploadedImages; // Replace blob URLs with actual CDN URLs

      // TODO: Send payload to API
      const response = await CreateHunt(payload);
      console.log(response);
      // After successful submission:
      clearForm();
      setMessage({
        type: "success",
        text: "Success : Hunt created successfully! 🚀",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Error : Creating hunt: " + (err.message || "Unknown error"),
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div ref={scrollContainerRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold px-5 pt-5 text-[#101437] dark:text-white">
            Add a new Hunt
          </h1>
          <p className="text-sm px-5 text-[#101437] dark:text-white mb-5">
            Hunts booked over your store
          </p>
        </div>
        <div className="flex  justify-end gap-3 mr-5">
          {message.text && (
            <div
              className={`tooltip text-white tooltip-bottom ${
                message.type === "success" ? "tooltip-accent" : "tooltip-error"
              }`}
              data-tip={message.text}
            >
              <button
                className={`btn font-thin text-white ${
                  message.type === "success" ? "btn-accent" : "btn-error"
                }`}
              >
                {message.text.slice(0, 160)}
              </button>
            </div>
          )}

          <button className="btn btn-accent" onClick={() => clearForm()}>
            Discard Hunt
          </button>
          <button className="btn btn-success" onClick={handleSubmit}>
            Publish Hunt
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center items-start gap-10 w-[100%]">
          {/* LEFT COLUMN */}
          <div className="flex flex-col items-left justify-center w-[65%]">
            {/* Hunt Information */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] px-5 py-5 ml-5 rounded-xl w-full shadow-xl">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Hunt Information
              </h4>

              <fieldset className="fieldset w-full my-3">
                <legend className="text-xl text-[#101437] dark:text-white mb-3">
                  Title *
                </legend>
                <input
                  type="text"
                  name="title"
                  value={formData?.title}
                  onChange={handleInputChange}
                  className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="Premium Elk Hunt in Montana Wilderness"
                  required
                />
              </fieldset>

              <div className="flex items-center justify-start gap-5 w-full my-3">
                <fieldset className="fieldset w-full">
                  <legend className="text-xl text-[#101437] dark:text-white mb-3">
                    Region *
                  </legend>
                  <input
                    type="text"
                    name="region"
                    value={formData?.region}
                    onChange={handleInputChange}
                    className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                    placeholder="Montana"
                    required
                  />
                </fieldset>

                <fieldset className="fieldset w-full">
                  <legend className="text-xl text-[#101437] dark:text-white mb-3">
                    Duration (Days) *
                  </legend>
                  <input
                    type="number"
                    name="durationDays"
                    value={formData?.durationDays}
                    onChange={handleInputChange}
                    className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                    placeholder="2"
                    required
                  />
                </fieldset>
              </div>

              <div className="flex items-center justify-start gap-5 w-full my-3">
                <fieldset className="fieldset w-full">
                  <legend className="text-xl text-[#101437] dark:text-white mb-3">
                    Latitude *
                  </legend>
                  <input
                    type="number"
                    step="any"
                    value={formData?.geo?.lat}
                    onChange={(e) =>
                      handleNestedChange("geo", "lat", e.target.value)
                    }
                    className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                    placeholder="46.8797"
                    required
                  />
                </fieldset>

                <fieldset className="fieldset w-full">
                  <legend className="text-xl text-[#101437] dark:text-white mb-3">
                    Longitude *
                  </legend>
                  <input
                    type="number"
                    step="any"
                    value={formData?.geo?.lng}
                    onChange={(e) =>
                      handleNestedChange("geo", "lng", e.target.value)
                    }
                    className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                    placeholder="-110.3626"
                    required
                  />
                </fieldset>
              </div>

              <fieldset className="fieldset w-full">
                <legend className="text-xl text-[#101437] dark:text-white mb-3">
                  Description *
                </legend>
                <textarea
                  name="description"
                  value={formData?.description}
                  onChange={handleInputChange}
                  className="input p-2 flex items-center justify-center bg-[transparent] w-full h-40 border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="Experience world-class elk hunting..."
                  required
                />
              </fieldset>
            </div>

            {/* Hunt Territory */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl flex flex-col items-left justify-center px-5 py-5 ml-5 mt-5 rounded-xl w-full">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Hunt Territory
              </h4>

              <div>
                <h1 className="mt-3 text-xl"> Fence Type</h1>
                <select
                  name="fenceType"
                  value={formData?.fenceType}
                  onChange={handleInputChange}
                  className="select z-[99999] w-full mt-3 bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-[#fff] text-[#101437] dark:text-white"
                >
                  <option value="not_fenced">Not Fenced</option>
                  <option value="partially_fenced">Partially Fenced</option>
                  <option value="fully_fenced">Fully Fenced</option>
                </select>
              </div>

              <fieldset className="fieldset w-full mt-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-3">
                  Territory Size (Acres)
                </legend>
                <input
                  type="number"
                  name="territorySizeAcres"
                  value={formData?.territorySizeAcres}
                  onChange={handleInputChange}
                  className="w-full input bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="5000"
                />
              </fieldset>

              <fieldset className="fieldset w-full mt-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-3">
                  Staff Language
                </legend>
                <input
                  type="text"
                  name="staffLanguage"
                  value={formData?.staffLanguage}
                  onChange={handleInputChange}
                  className="w-full input bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="English"
                />
              </fieldset>
            </div>

            {/* Hunt Travel */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl flex flex-col items-left justify-center px-5 py-5 ml-5 mt-5 rounded-xl w-full">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Hunt Travel
              </h4>

              <fieldset className="fieldset w-full mt-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-3">
                  Nearest Airport
                </legend>
                <input
                  type="text"
                  name="nearestAirport"
                  value={formData?.nearestAirport}
                  onChange={handleInputChange}
                  className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="Melbourne"
                />
              </fieldset>

              <fieldset className="fieldset w-full mt-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-3">
                  Airport Distance (KM)
                </legend>
                <input
                  type="number"
                  name="airportDistanceKm"
                  value={formData?.airportDistanceKm}
                  onChange={handleInputChange}
                  className="w-full input bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="350"
                />
              </fieldset>

              <fieldset className="fieldset w-full mt-3">
                <div className="flex items-center justify-between">
                  <legend className="text-lg text-[#101437] dark:text-white">
                    Airport Transfer Provided
                  </legend>
                  <input
                    type="checkbox"
                    name="airportTransferProvided"
                    checked={formData?.airportTransferProvided}
                    onChange={handleInputChange}
                    className="toggle toggle-accent"
                  />
                </div>
              </fieldset>

              <fieldset className="fieldset w-full mt-3">
                <div className="flex items-center justify-between">
                  <legend className="text-lg text-[#101437] dark:text-white">
                    Railway Transfer Provided
                  </legend>
                  <input
                    type="checkbox"
                    name="railwayTransferProvided"
                    checked={formData?.railwayTransferProvided}
                    onChange={handleInputChange}
                    className="toggle toggle-accent"
                  />
                </div>
              </fieldset>
            </div>

            {/* Hunt Services */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl ml-5 flex flex-col items-left justify-center px-5 py-5 mt-5 rounded-xl w-full">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Hunt Services
              </h4>

              <fieldset className="fieldset w-full mt-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-3">
                  Transportation Type
                </legend>
                <select
                  name="transportationType"
                  value={formData?.transportationType}
                  onChange={handleInputChange}
                  className="select w-full bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-white text-[#101437] dark:text-white"
                >
                  <option value="provided">Provided</option>
                  <option value="not_provided">Not Provided</option>
                  <option value="optional">Optional</option>
                </select>
              </fieldset>

              <div>
                <h1 className="mt-3 text-xl">Lodging Type</h1>
                <select
                  name="lodgingType"
                  value={formData?.lodgingType}
                  onChange={handleInputChange}
                  className="select z-[99999] w-full mt-3 bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-[#fff] text-[#101437] dark:text-white"
                >
                  <option value="cabin">Cabin</option>
                  <option value="lodge">Lodge</option>
                  <option value="tent">Tent</option>
                  <option value="hotel">Hotel</option>
                </select>
              </div>

              <fieldset className="fieldset w-full mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-[#101437] dark:text-white">
                    Chef Provided
                  </span>
                  <input
                    type="checkbox"
                    name="chefProvided"
                    checked={formData?.chefProvided}
                    onChange={handleInputChange}
                    className="toggle toggle-accent"
                  />
                </div>
              </fieldset>

              <fieldset className="fieldset w-full mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-[#101437] dark:text-white">
                    Gear Provided
                  </span>
                  <input
                    type="checkbox"
                    name="gearProvided"
                    checked={formData?.gearProvided}
                    onChange={handleInputChange}
                    className="toggle toggle-accent"
                  />
                </div>
              </fieldset>

              <fieldset className="fieldset w-full mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-[#101437] dark:text-white">
                    Cruise Available
                  </span>
                  <input
                    type="checkbox"
                    name="cruiseAvailable"
                    checked={formData?.cruiseAvailable}
                    onChange={handleInputChange}
                    className="toggle toggle-accent"
                  />
                </div>
              </fieldset>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col items-left justify-center mr-5 w-[35%]">
            {/* Hunt Images */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl flex flex-col items-left justify-center px-5 py-5 mb-5 rounded-xl w-full">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Hunt Images
              </h4>
              <fieldset className="fieldset w-full mt-3 mb-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-3">
                  Upload Multiple Images
                </legend>

                <input
                  type="file"
                  className="file-input file-input-md w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  onChange={handleAccommodationChange}
                  accept="image/*"
                  ref={accommodationsFileInputRef}
                  multiple
                />

                <div className="flex flex-wrap gap-3 mt-3">
                  {accommodationImages?.map((f) => (
                    <div key={f?.s3Key} className="relative w-32">
                      <button
                        type="button"
                        onClick={() => removeAccommodationFile(f?.s3Key)}
                        className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 z-10"
                      >
                        ✕
                      </button>

                      <figure className="rounded-xl">
                        <img
                          src={f?.cdnUrl}
                          alt={f?.s3Key}
                          className="rounded-xl border max-h-32 w-full object-cover"
                        />
                      </figure>
                      <p className="text-xs text-center mt-1 text-[#101437] dark:text-white truncate">
                        {f?.s3Key}
                      </p>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Hunt Pricing */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Hunt Pricing
              </h4>

              <fieldset className="fieldset w-full mb-3">
                <legend className="text-xl text-[#101437] dark:text-white mb-3">
                  Base Price ($) *
                </legend>
                <input
                  type="number"
                  name="basePriceMinor"
                  value={formData?.basePriceMinor}
                  onChange={handleInputChange}
                  className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="5000"
                  required
                />
                <p className="text-xs text-[#101437] dark:text-white mt-1">
                  Will be converted to cents (multiply by 100)
                </p>
              </fieldset>

              <fieldset className="fieldset w-full mb-3">
                <legend className="text-xl text-[#101437] dark:text-white mb-3">
                  Deposit Percent (%) *
                </legend>
                <input
                  type="number"
                  name="depositPercent"
                  value={formData?.depositPercent}
                  onChange={handleInputChange}
                  className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="30"
                  required
                />
              </fieldset>

              <fieldset className="fieldset w-full">
                <legend className="text-xl text-[#101437] dark:text-white mb-3">
                  Capacity Per Day *
                </legend>
                <input
                  type="number"
                  name="capacityPerDayDefault"
                  value={formData?.capacityPerDayDefault}
                  onChange={handleInputChange}
                  className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="2"
                  required
                />
              </fieldset>
            </div>

            {/* Hunt Details */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5 mt-5">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white">
                Hunt Details
              </h4>

              {/* Species */}
              <div className="mt-4">
                <h5 className="text-lg text-[#101437] dark:text-white mb-2">
                  Species
                </h5>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={speciesInput}
                    onChange={(e) => setSpeciesInput(e.target.value)}
                    placeholder="e.g., elk"
                    className="input w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      addToArray("species", speciesInput, setSpeciesInput)
                    }
                    className="btn btn-accent"
                  >
                    Add
                  </button>
                </div>
                {formData?.species?.length > 0 && (
                  <ul className="list-disc pt-2 px-1 space-y-1">
                    {formData?.species?.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-[#101437] dark:text-white">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromArray("species", index)}
                          className="btn btn-xs btn-circle btn-error text-white"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Weapon Types */}
              <div className="mt-4">
                <h5 className="text-lg text-[#101437] dark:text-white mb-2">
                  Weapon Types
                </h5>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={weaponInput}
                    onChange={(e) => setWeaponInput(e.target.value)}
                    placeholder="e.g., rifle, bow"
                    className="input w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      addToArray("weaponTypes", weaponInput, setWeaponInput)
                    }
                    className="btn btn-accent"
                  >
                    Add
                  </button>
                </div>
                {formData?.weaponTypes?.length > 0 && (
                  <ul className="list-disc pt-2 px-1 space-y-1">
                    {formData?.weaponTypes?.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-[#101437] dark:text-white">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromArray("weaponTypes", index)}
                          className="btn btn-xs btn-circle btn-error text-white"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Tags */}
              <div className="mt-4">
                <h5 className="text-lg text-[#101437] dark:text-white mb-2">
                  Tags
                </h5>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g., archery, guided"
                    className="input w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray("tags", tagInput, setTagInput)}
                    className="btn btn-accent"
                  >
                    Add
                  </button>
                </div>
                {formData?.tags?.length > 0 && (
                  <ul className="list-disc pt-2 px-1 space-y-1">
                    {formData?.tags?.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-[#101437] dark:text-white">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromArray("tags", index)}
                          className="btn btn-xs btn-circle btn-error text-white"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Outfitter */}
              <div>
                <h1 className="mt-3 text-xl">Outfitter</h1>
                <select
                  name="outfitterId"
                  value={formData?.outfitterId}
                  onChange={handleInputChange}
                  className="select z-[99999] w-full mt-3 bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-[#fff] text-[#101437] dark:text-white"
                >
                  <option value="" disabled>
                    Pick an outfitter
                  </option>
                  <option value="outfitter-1">Crimson</option>
                  <option value="outfitter-2">Amber</option>
                  <option value="outfitter-3">Velvet</option>
                </select>
              </div>

              {/* Season Dates */}
              <div className="mt-4">
                <h5 className="text-lg text-[#101437] dark:text-white mb-2">
                  Hunt Season
                </h5>
                <div className="flex gap-2">
                  <fieldset className="fieldset w-full">
                    <legend className="text-sm text-[#101437] dark:text-white mb-2">
                      Start Date
                    </legend>
                    <input
                      type="date"
                      value={seasonStart}
                      onChange={(e) => setSeasonStart(e.target.value)}
                      className="input bg-transparent border border-black dark:border-white text-[#101437] dark:text-white w-full"
                    />
                  </fieldset>
                  <fieldset className="fieldset w-full">
                    <legend className="text-sm text-[#101437] dark:text-white mb-2">
                      End Date
                    </legend>
                    <input
                      type="date"
                      value={seasonEnd}
                      onChange={(e) => setSeasonEnd(e.target.value)}
                      className="input bg-transparent border border-black dark:border-white text-[#101437] dark:text-white w-full"
                    />
                  </fieldset>
                </div>
                <button
                  type="button"
                  onClick={generateAvailableDates}
                  className="btn btn-sm btn-accent mt-2 w-full"
                >
                  Generate Available Dates
                </button>
                {formData?.availableDates?.length > 0 && (
                  <p className="text-md text-[#101437] dark:text-white mt-3">
                    {formData?.availableDates?.length} dates generated from{" "}
                    {formData?.availableDates?.[0] +
                      " to " +
                      formData?.availableDates?.[
                        formData?.availableDates?.length - 1
                      ]}
                  </p>
                )}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5 mt-5">
              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white mb-3">
                Inclusions
              </h4>

              <fieldset className="fieldset w-full mb-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-2">
                  Lodging
                </legend>
                <input
                  type="text"
                  value={formData?.inclusions?.lodging}
                  onChange={(e) =>
                    handleNestedChange("inclusions", "lodging", e.target.value)
                  }
                  className="input w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="Premium cabin accommodations"
                />
              </fieldset>

              <fieldset className="fieldset w-full mb-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-2">
                  Meals
                </legend>
                <input
                  type="text"
                  value={formData?.inclusions?.meals}
                  onChange={(e) =>
                    handleNestedChange("inclusions", "meals", e.target.value)
                  }
                  className="input w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="All meals included"
                />
              </fieldset>

              <fieldset className="fieldset w-full mb-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-2">
                  Guide
                </legend>
                <input
                  type="text"
                  value={formData?.inclusions?.guide}
                  onChange={(e) =>
                    handleNestedChange("inclusions", "guide", e.target.value)
                  }
                  className="input w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="Professional guide service"
                />
              </fieldset>

              <h4 className="fieldset-legend text-xl text-[#101437] dark:text-white mb-3 mt-5">
                Exclusions
              </h4>

              <fieldset className="fieldset w-full mb-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-2">
                  License
                </legend>
                <input
                  type="text"
                  value={formData?.exclusions?.license}
                  onChange={(e) =>
                    handleNestedChange("exclusions", "license", e.target.value)
                  }
                  className="input w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="Hunting license not included"
                />
              </fieldset>

              <fieldset className="fieldset w-full mb-3">
                <legend className="text-lg text-[#101437] dark:text-white mb-2">
                  Transportation
                </legend>
                <input
                  type="text"
                  value={formData?.exclusions?.transportation}
                  onChange={(e) =>
                    handleNestedChange(
                      "exclusions",
                      "transportation",
                      e.target.value
                    )
                  }
                  className="input w-full bg-transparent border border-black dark:border-white text-[#101437] dark:text-white"
                  placeholder="Travel to location not included"
                />
              </fieldset>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
