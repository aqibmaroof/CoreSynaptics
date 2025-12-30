// pages/reviews/add.tsx
"use client";
import React, { useState } from "react";

// Star icon component for the rating system
const StarRating = ({ rating, setRating }) => {
  return (
    <div className="rating rating-lg -mt-2 ml-5">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <input
          key={starValue}
          type="radio"
          name="rating-9" // Unique name for the radio group
          className="mask mask-star-2 bg-accent cursor-pointer"
          checked={rating === starValue}
          onChange={() => setRating(starValue)}
        />
      ))}
    </div>
  );
};

const AddReviewPage = () => {
  const [huntOutfitter, setHuntOutfitter] = useState("");
  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("John Doe"); // Example pre-filled name
  const [rating, setRating] = useState(0);
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today
  const [reviewContent, setReviewContent] = useState(""); // Added content field for the actual review

  const handleSubmit = (e) => {
    e.preventDefault();
    // 1. Validate inputs (e.g., rating > 0)
    if (rating === 0) {
      alert("Please select a rating!");
      return;
    }

    // 2. Prepare data object
    const newReview = {
      huntOutfitter,
      title,
      customerName,
      rating,
      reviewDate,
      reviewContent,
    };

    console.log("Submitting Review:", newReview);
    // 3. API Call: You would integrate your fetch/axios call here
    // Example: post('/api/reviews', newReview)

    // 4. Handle success (e.g., redirect or show a success message)
    alert("Review Submitted Successfully!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-5">
      <div className="mx-auto p-6 bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl rounded-lg">
        {/* Header matching your theme */}
        <h1 className="text-2xl font-semibold pb-1 text-[#101437] dark:text-white">
          Submit a Review
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h1 className="mt-3 text-xl text-[#101437] dark:text-white">
              Select Customer
            </h1>
            <select
              defaultValue="Pick a color"
              className="select z-[99999] w-full mt-3 bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-[#fff] text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
            >
              <option disabled={true}>Pick a Customer</option>
              <option>Deer</option>
              <option>wolf</option>
              <option>Lion</option>
            </select>
          </div>
          <div>
            <h1 className="mt-3 text-xl">Select Guide</h1>
            <select
              defaultValue="Pick a color"
              className="select z-[99999] w-full mt-3 bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-[#fff] text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
            >
              <option disabled={true}>Pick a Guide</option>
              <option>Deer</option>
              <option>wolf</option>
              <option>Lion</option>
            </select>
          </div>
          {/* 1. Hunt/Outfitter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text mb-2 text-[#101437] dark:text-white font-medium">
                Cstomer/Guide Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., Rocky Mountain Adventures"
              className="input input-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
              value={huntOutfitter}
              onChange={(e) => setHuntOutfitter(e.target.value)}
              required
            />
          </div>

          {/* 2. Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text mb-2 text-[#101437] dark:text-white font-medium">
                Review Title <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., Best experience ever!"
              className="input input-bordered w-full bg-[#f6f6f6] dark:bg-[#1e4742] dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 3. Customer Name & 4. Date (Side-by-side on large screens) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-[#101437] dark:text-white mb-2 font-medium">
                  Customer Name
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full  bg-[#f6f6f6] dark:bg-[#1e4742] dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled // Name might be read-only if user is logged in
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-[#101437] dark:text-white mb-2 font-medium">
                  Guide Name
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full  bg-[#f6f6f6] dark:bg-[#1e4742] dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled // Name might be read-only if user is logged in
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-[#101437] dark:text-white mb-2 font-medium">
                  Review Date
                </span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full  bg-[#f6f6f6] dark:bg-[#1e4742] dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
              />
            </div>
          </div>

          {/* 5. Rating */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-[#101437] dark:text-white font-medium">
                Rating <span className="text-error">*</span>
              </span>
            </label>
            <StarRating rating={rating} setRating={setRating} />
            <p className="text-sm mt-2 text-[#101437] dark:text-white">
              You selected: {rating} out of 5 stars
            </p>
          </div>

          {/* 6. Actual Review Content (The main body) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-[#101437] dark:text-white mb-2 font-medium">
                Your Full Review <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              placeholder="Share your detailed experience..."
              className="textarea textarea-bordered h-32 w-full  bg-[#f6f6f6] dark:bg-[#1e4742] dark:border-white text-[#101437] dark:text-white placeholder-[#101437] dark:placeholder-white"
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-center">
            <button
              type="submit"
              className="w-[max-content] btn btn-lg btn-success"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewPage;
