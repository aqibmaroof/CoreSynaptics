"use client";
import { useState, useRef } from "react";

export default function AddReviews() {
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
            Add a new Faq
          </h1>
          <p className="text-sm px-5 text-[#101437] dark:text-white mb-5">
            Faqs Dsiplayed over your store
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 mr-5">
          <button className="btn btn-accent">Discard Faq</button>
          <button className="btn btn-success">Publish Faq</button>
        </div>
      </div>
      <div className="flex jusify-center items-start gap-10 w-[100%]">
        <div className="flex flex-col items-left justify-center w-[65%]">
          <div className="bg-[#f6f6f6] dark:bg-[#1e4742] px-5 py-5 ml-5 rounded-xl w-full shadow-xl">
            <h4 className="fieldset-legend text-xl  text-[#101437] dark:text-white">
              Faq Information
            </h4>
            <fieldset className="fieldset mt-4 w-full">
              <legend className="text-xl  text-[#101437] dark:text-white mb-3">
                Category
              </legend>
              <div class="dropdown dropdown-end w-full">
                <div
                  tabindex="0"
                  role="button"
                  class="inline-flex justify-between items-center w-full rounded-lg shadow-lg bg-[#f6f6f6]/50  dark:bg-[#265953]/50 text-[#101437] dark:text-white text-base font-semibold transition duration-150 ease-in-out border-2 border-[#d8d6d6] dark:border-[#265953] focus:outline-none"
                >
                  <span class="py-2 px-3 mx-1 bg-[#e3e0e0] dark:bg-[#265953]/50 rounded-l-md">
                    Category 1
                  </span>

                  <div class="bg-[#e3e0e0] dark:bg-[#275a54] hover:bg-[#d9d6d6] dark:hover:bg-[#246159] p-3 rounded-r-md">
                    <svg
                      class="h-5 w-5 fill-current dark:text-white text-[#101437] "
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.97l3.71-3.74a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <ul
                  tabindex="0"
                  class="dropdown-content z-[1] bg-[#e3e0e0] dark:bg-[#246159] mt-2 w-full mb-20 p-0 rounded-lg shadow-2xl ring-1 ring-white/10"
                >
                  <li>
                    <a class="block px-4 py-3 text-lg text-[#101437] dark:text-white hover:bg-[#d9d6d6] dark:hover:bg-[#275a54] hover:rounded-t-lg transition duration-100 ease-in-out">
                      Category 1
                    </a>
                  </li>
                  <li>
                    <a class="block px-4 py-3 text-lg text-[#101437] dark:text-white hover:bg-[#d9d6d6] dark:hover:bg-[#275a54] transition duration-100 ease-in-out">
                      Category 2
                    </a>
                  </li>
                  <li>
                    <a class="block px-4 py-3 text-lg text-[#101437] dark:text-white hover:bg-[#d9d6d6] dark:hover:bg-[#275a54] hover:rounded-b-lg transition duration-100 ease-in-out">
                      Category 3
                    </a>
                  </li>
                </ul>
              </div>
            </fieldset>{" "}
            <fieldset className="fieldset mt-4 w-full">
              <legend className="text-xl text-[#101437] dark:text-white mb-3">
                Question
              </legend>
              <input
                type="text"
                className="input w-full bg-[transparent] border border-black dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                placeholder="My awesome page"
              />
            </fieldset>
            <fieldset className="fieldset mt-4 w-full">
              <legend className="text-xl  text-[#101437] dark:text-white mb-3">
                Answer
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
              Faq Organize
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
        </div>
      </div>
    </div>
  );
}
