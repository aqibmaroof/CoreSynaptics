"use client";
import { useState, useRef } from "react";

export default function AddHunt() {
  const [preview, setPreview] = useState(null);
  // Create a ref for the file input
  const fileInputRef = useRef(null);
  const [termInput, setTermInput] = useState(""); // current input
  const [terms, setTerms] = useState([]); // all added line
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availability, setAvailability] = useState([]);

  const addSlot = () => {
    if (!date || !startTime || !endTime) return;

    setAvailability([...availability, { date, startTime, endTime }]);

    setStartTime("");
    setEndTime("");
  };

  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setPreview(imageURL);
    }
  };

  const removeImage = () => {
    setPreview(null);
    // Reset the file input completely
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAdd = () => {
    if (termInput.trim() === "") return; // prevent empty
    setTerms((prev) => [...prev, termInput.trim()]);
    setTermInput(""); // clear input
  };

  const removeTerm = (index) => {
    setTerms((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold px-5 pt-5 text-[#101437] dark:text-white">
            Add a new Guide
          </h1>
          <p className="text-sm px-5 text-[#101437] dark:text-white mb-5">
            Guides Added over your store
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 mr-5">
          <button className="btn btn-accent">Discard Guide</button>
          <button className="btn btn-success">Publish Guide</button>
        </div>
      </div>
      <div className="flex jusify-center items-start gap-10 w-[100%]">
        <div className="flex flex-col items-left justify-center w-[65%]">
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] px-5 py-5 ml-5 rounded-xl w-full shadow-xl">
            <h4 className="fieldset-legend text-xl  text-[#101437] dark:text-white">
              Guide Information
            </h4>
            <div className="flex items-center justify-start gap-5 w-full my-3">
              <fieldset className="fieldset w-full">
                <legend className="text-xl  text-[#101437] dark:text-white mb-3">
                  Name
                </legend>
                <input
                  type="text"
                  className="input bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                  placeholder="My awesome page"
                />
              </fieldset>
              <fieldset className="fieldset w-full">
                <legend className="text-xl  text-[#101437] dark:text-white mb-3">
                  code
                </legend>
                <input
                  type="text"
                  className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                  placeholder="My awesome page"
                />
              </fieldset>
            </div>
            <div className="flex items-center justify-start gap-5 w-full my-3">
              <fieldset className="fieldset w-full">
                <legend className="text-xl  text-[#101437] dark:text-white mb-3">
                  Guide Area
                </legend>
                <input
                  type="text"
                  className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                  placeholder="My awesome page"
                />
              </fieldset>
            </div>
            <fieldset className="fieldset w-full">
              <legend className="text-xl  text-[#101437] dark:text-white mb-3">
                Description
              </legend>
              <textarea
                className="input p-auto flex items-center justify-center bg-[transparent] py-2 w-full h-40 border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                placeholder="My awesome page"
              />
            </fieldset>{" "}
          </div>
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl flex flex-col items-left justify-center px-5 py-5 ml-5 mt-5 rounded-xl w-full">
            <h4 className="fieldset-legend text-xl mb-5 text-[#101437] dark:text-white">
              Guide Image
            </h4>
            <fieldset className="fieldset w-full mb-3">
              <input
                type="file"
                className="file-input w-full file-input-md bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                onChange={handleChange}
                accept="image/*"
                ref={fileInputRef}
              />
              {preview && (
                <div className="relative w-fit mt-3">
                  {/* DaisyUI close button */}
                  <button
                    onClick={removeImage}
                    className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                  >
                    ✕
                  </button>
                  <figure className="rounded-xl">
                    <img
                      src={preview}
                      alt="Uploaded Preview"
                      className="rounded-xl border max-h-40"
                    />
                  </figure>
                </div>
              )}
            </fieldset>
          </div>
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5 mt-5 ml-5 w-full h-full">
            {/* Fieldset with input */}
            <fieldset className="fieldset w-full">
              <legend className="text-lg text-[#101437] dark:text-white mb-5">
                Terms & Conditions
              </legend>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  placeholder="Enter a term..."
                  className="w-full input bg-transparent border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                />
                <button onClick={handleAdd} className="btn btn-accent">
                  Add
                </button>
              </div>
            </fieldset>

            {/* Display added terms as bullets */}
            {terms.length > 0 && (
              <ul className="list-disc pl-5 mt-3 space-y-1">
                {terms.map((term, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center "
                  >
                    <span>{term}</span>
                    <button
                      onClick={() => removeTerm(index)}
                      className="btn btn-xs text-white btn-circle btn-error"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className=" flex flex-col items-left justify-center  mr-5 w-[35%]">
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5">
            <h4 className="fieldset-legend text-xl  text-[#101437] dark:text-white">
              Guide Status
            </h4>
            {/* <fieldset className="fieldset w-full mb-3">
              <legend className="text-xl  text-[#101437] dark:text-white mb-3">
                Base Price
              </legend>
              <input
                type="text"
                className=" border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                placeholder="My awesome page"
              />
            </fieldset>
            <fieldset className="fieldset w-full">
              <legend className="text-xl  text-[#101437] dark:text-white mb-3">
                Discounted Price
              </legend>
              <input
                type="text"
                className=" border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                placeholder="My awesome page"
              />
            </fieldset> */}
            <div className="flex flex-col items-center justify-start gap-5 mt-3">
              <fieldset className="w-full">
                <div className="flex items-center justify-between">
                  <span className="text-xl text-[#101437] dark:text-white">
                    Status
                  </span>
                  <input type="checkbox" checked className="toggle" />
                </div>
              </fieldset>
            </div>
          </div>
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5 mt-5">
            <h4 className="fieldset-legend text-xl  text-[#101437] dark:text-white">
              Guide Organize
            </h4>

            <div>
              <h1 className="mt-3 text-xl">Select Hunt</h1>
              <select
                defaultValue="Pick a color"
                className="select z-[99999] w-full mt-3 bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-[#fff] text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
              >
                <option disabled={true}>Pick a Hunt</option>
                <option>Deer</option>
                <option>wolf</option>
                <option>Lion</option>
              </select>
            </div>

            <div className="max-w-3xl mx-auto mt-5 space-y-[19px]  rounded-xl shadow">
              <h2 className="text-2xl font-bold text-[#101437] dark:text-white">
                Guide Availability
              </h2>

              {/* Date Picker */}
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text font-medium text-[#101437] dark:text-white">
                    Select Date
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-[#101437] dark:text-white mb-2">
                      Start Time
                    </span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-[#101437] dark:text-white mb-2">
                      End Time
                    </span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full  bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Add Slot */}
              <button className="btn btn-accent w-full" onClick={addSlot}>
                Add Availability Slot
              </button>

              {/* Availability List */}
              {availability.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Added Availability
                  </h3>

                  <div className="space-y-3">
                    {availability.map((slot, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{slot.date}</p>
                          <p className="text-sm opacity-75">
                            {slot.startTime} – {slot.endTime}
                          </p>
                        </div>

                        <button
                          onClick={() => removeSlot(index)}
                          className="btn btn-error btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
