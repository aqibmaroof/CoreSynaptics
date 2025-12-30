"use client";
import { useState, useRef } from "react";

export default function AddHunt() {
  const [preview, setPreview] = useState(null);
  // Create a ref for the file input
  const fileInputRef = useRef(null);
  const [termInput, setTermInput] = useState(""); // current input
  const [terms, setTerms] = useState([]); // all added line
  const [acoomodationsImages, setAccomodationImages] = useState([]); // stores multiple files
  const accomodationsFileInputRef = useRef(null);

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

  const handleAccomodationChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // convert FileList to array
    const newFiles = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9), // unique id for each file
    }));

    setAccomodationImages((prev) => [...prev, ...newFiles]);
    // reset file input so same file can be re-uploaded
    e.target.value = "";
  };

  const removeAccomodationFile = (id) => {
    setAccomodationImages((prev) => prev.filter((f) => f.id !== id));
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
            Add a new Hunt Category
          </h1>
          <p className="text-sm px-5 text-[#101437] dark:text-white mb-5">
            Hunts Categorized over your store
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 mr-5">
          <button className="btn btn-accent">Discard Hunt Category</button>
          <button className="btn btn-success">Publish Hunt Category</button>
        </div>
      </div>
      <div className="flex jusify-center items-start gap-10 w-[100%]">
        <div className="flex flex-col items-left justify-center w-[65%]">
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] px-5 py-5 ml-5 rounded-xl w-full shadow-xl">
            <h4 className="fieldset-legend text-xl  text-[#101437] dark:text-white">
              Hunt Information
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
        </div>
        <div className=" flex flex-col items-left justify-center  mr-5 w-[35%]">
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5">
            <h4 className="fieldset-legend text-xl  text-[#101437] dark:text-white">
              Hunt Category Options
            </h4>
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
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl flex flex-col items-left justify-center px-5 py-5 mt-5 rounded-xl w-full">
            <h4 className="fieldset-legend text-xl  text-[#101437] dark:text-white">
              Hunt Category Image
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
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-xl px-5 py-5 mt-5">
            {/* Fieldset with input */}
            <fieldset className="fieldset w-full">
              <legend className="text-lg text-[#101437] dark:text-white mb-3">
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
      </div>
    </div>
  );
}
