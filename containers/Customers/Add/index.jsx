"use client";
import { useState, useRef } from "react";

export default function AddCustomer() {
  const [profilePreview, setProfilePreview] = useState(null);
  const profileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const documentsInputRef = useRef(null);

  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState([]);

  // --- PROFILE IMAGE ---
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePreview(URL.createObjectURL(file));
  };

  const removeProfile = () => {
    setProfilePreview(null);
    if (profileInputRef.current) profileInputRef.current.value = "";
  };

  // --- DOCUMENT UPLOAD ---
  const handleDocuments = (e) => {
    const selected = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setDocuments((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // --- NOTES ---
  const addNote = () => {
    if (noteInput.trim() === "") return;
    setNotes((prev) => [...prev, noteInput]);
    setNoteInput("");
  };

  const removeNote = (index) => {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center  justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#183431] dark:text-white">
            Edit Customer
          </h1>
          <p className="text-sm text-[#183431] dark:text-white opacity-70">
            Edit the customer profile
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline btn-accent">Discard</button>
          <button className="btn btn-accent">Save Customer</button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* LEFT SECTION */}
        <div className="w-2/3 flex flex-col gap-6">
          {/* BASIC INFORMATION */}
          <div className="card bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl p-6">
            <h2 className="text-xl text-[#183431] dark:text-white font-semibold mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label text-[#183431] dark:text-white">
                  Full Name
                </label>
                <input
                  className="input input-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white"
                  placeholder="Customer name"
                />
              </div>

              <div>
                <label className="label text-[#183431] dark:text-white">
                  Email
                </label>
                <input
                  className="input input-bordered bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white w-full"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="label text-[#183431] dark:text-white">
                  Phone
                </label>
                <input
                  className="input input-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white"
                  placeholder="+1 234 5678"
                />
              </div>

              <div>
                <label className="label text-[#183431] dark:text-white">
                  Customer Type
                </label>
                <select className="select select-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white">
                  <option>Regular</option>
                  <option>VIP</option>
                  <option>Corporate</option>
                </select>
              </div>
            </div>

            <label className="label text-[#183431] dark:text-white mt-4">
              Address
            </label>
            <textarea
              className="textarea textarea-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white"
              placeholder="Customer address"
            ></textarea>
          </div>

          {/* PROFILE IMAGE */}
          <div className="card bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl p-6">
            <h2 className="text-xl text-[#183431] dark:text-white font-semibold mb-4">
              Profile Image
            </h2>

            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white"
              onChange={handleProfileChange}
              ref={profileInputRef}
            />

            {profilePreview && (
              <div className="relative w-fit mt-4">
                <button
                  className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-red-600 text-white"
                  onClick={removeProfile}
                >
                  ✕
                </button>
                <img src={profilePreview} className="rounded-xl border w-40" />
              </div>
            )}
          </div>

          {/* DOCUMENTS */}
          <div className="card bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl p-6">
            <h2 className="text-xl text-[#183431] dark:text-white font-semibold mb-4">
              Customer Documents
            </h2>

            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="file-input file-input-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white"
              onChange={handleDocuments}
              ref={documentsInputRef}
            />

            <div className="flex flex-wrap gap-4 mt-4">
              {documents.map((doc) => (
                <div key={doc.id} className="relative w-32">
                  <button
                    className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-red-600 text-white"
                    onClick={() => removeDocument(doc.id)}
                  >
                    ✕
                  </button>

                  <img
                    src={doc.preview}
                    className="h-28 w-full object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-1/3 flex flex-col gap-6">
          {/* CUSTOMER STATUS */}
          <div className="card bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>

            <div className="flex items-center justify-between mb-4">
              <span>Active Customer</span>
              <input
                type="checkbox"
                className="toggle toggle-accent"
                defaultChecked
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Receive Notifications</span>
              <input type="checkbox" className="toggle toggle-accent" />
            </div>
          </div>

          {/* CUSTOMER TAGS */}
          <div className="card bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>

            <input
              className="input input-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white"
              placeholder="Add tags like VIP, Business..."
            />
          </div>
          {/* NOTES */}
          <div className="card bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl p-6">
            <h2 className="text-xl text-[#183431] dark:text-white font-semibold mb-4">
              Notes
            </h2>

            <div className="flex gap-3">
              <input
                type="text"
                className="input input-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] placeholder:text-[#183431] dark:placeholder:text-white"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add a note"
              />
              <button className="btn btn-accent" onClick={addNote}>
                Add
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {notes.map((note, index) => (
                <li
                  key={index}
                  className="flex justify-between bg-[#f6f6f6] dark:bg-[#1e4742] border border-[#e3e6e4] border-1 p-3 rounded-lg items-center"
                >
                  {note}
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => removeNote(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
