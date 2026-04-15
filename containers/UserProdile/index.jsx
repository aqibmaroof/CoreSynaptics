"use client";

import React, { useState } from "react";
import { ChangePassword } from "../../services/auth";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    storeName: "John Doe",
    phone: "+(123) 456-7890",
    storeEmail: "johndoe@gmail.com",
    senderEmail: "johndoe@gmail.com",
    businessName: "",
    country: "United States",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    timezone: "(GMT-12:00) International Date Line West",
    unitSystem: "Metric",
    weightUnit: "Kilograms",
    currency: "Store currency",
    prefix: "#",
    suffix: "",
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "current_password",
    newPassword: "new_secure_password",
    confirmNewPassword: "new_secure_password",
  });

  const handlePasswordChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Add your save logic here
  };

  const handleDiscard = () => {
    console.log("Discarding changes...");
    // Add your discard logic here
  };

  const UpdatePassword = async () => {
    try {
      const payload = {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      };
      const response = await ChangePassword(payload);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen p-6">
      <style jsx>{`
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.25em 1.25em;
          padding-right: 2.5rem;
        }
      `}</style>

      <div className=" mx-auto space-y-6">
        {/* Profile Section */}
        <div className="bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-2xl p-6">
          <h2 className="text-white text-xl font-semibold mb-6">Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy border border-gray-600 rounded-xl px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+(123) 456-7890"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Store contact email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Store contact email
              </label>
              <input
                type="email"
                name="storeEmail"
                value={formData.storeEmail}
                onChange={handleChange}
                placeholder="johndoe@gmail.com"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Sender email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Sender email
              </label>
              <input
                type="email"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleChange}
                placeholder="johndoe@gmail.com"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* Warning Alert */}
          <div className="mt-6 bg-[#4a3b2a] border-l-4 border-[#f59e0b] rounded-xl p-4 flex items-start gap-3">
            <div className="bg-[#f59e0b] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-[#f59e0b] text-sm">
              Confirm that you have access to {formData.senderEmail} in sender
              email settings.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-2xl p-6">
          <h2 className="text-white text-xl font-semibold mb-6">
            Pasword Change
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy border border-gray-600 rounded-xl px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Sender email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* Warning Alert */}
          <div className="mt-6 ">
            <button
              className="btn btn-info btn-outline"
              onClick={() => UpdatePassword()}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Billing Information Section */}
        <div className="bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-2xl p-6">
          <h2 className="text-white text-xl font-semibold mb-6">
            Billing information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legal business name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Legal business name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Business name"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Country/region */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Country/region
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 focus:outline-none focus:border-gray-500 appearance-none cursor-pointer transition-colors"
              >
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Australia</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Apartment, suite, etc. */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Apartment, suite, etc.
              </label>
              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
                placeholder="Apartment, suite, etc."
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* City, State, PIN Code Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* City */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                PIN Code
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="PIN Code"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Time zone and units of measurement Section */}
        <div className="bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-2">
            Time zone and units of measurement
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Used to calculate product prices, shipping weighs, and order times.
          </p>

          {/* Time zone */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">
              Time zone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 focus:outline-none focus:border-gray-500 appearance-none cursor-pointer transition-colors"
            >
              <option>(GMT-12:00) International Date Line West</option>
              <option>(GMT-11:00) Midway Island, Samoa</option>
              <option>(GMT-10:00) Hawaii</option>
              <option>(GMT-09:00) Alaska</option>
              <option>(GMT-08:00) Pacific Time (US & Canada)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit system */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Unit system
              </label>
              <select
                name="unitSystem"
                value={formData.unitSystem}
                onChange={handleChange}
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 focus:outline-none focus:border-gray-500 appearance-none cursor-pointer transition-colors"
              >
                <option>Metric</option>
                <option>Imperial</option>
              </select>
            </div>

            {/* Default weight unit */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Default weight unit
              </label>
              <select
                name="weightUnit"
                value={formData.weightUnit}
                onChange={handleChange}
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 focus:outline-none focus:border-gray-500 appearance-none cursor-pointer transition-colors"
              >
                <option>Kilograms</option>
                <option>Pounds</option>
                <option>Ounces</option>
              </select>
            </div>
          </div>
        </div>

        {/* Store currency Section */}
        <div className="bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-2">
            Store currency
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            The currency your products are sold in.
          </p>

          {/* Store currency */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Store currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 focus:outline-none focus:border-gray-500 appearance-none cursor-pointer transition-colors"
            >
              <option>Store currency</option>
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
              <option>JPY - Japanese Yen</option>
            </select>
          </div>
        </div>

        {/* Order id format Section */}
        <div className="bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-2">
            Order id format
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Shown on the Orders page, customer pages, and customer order
            notifications to identify orders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prefix */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Prefix</label>
              <input
                type="text"
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                placeholder="#"
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Suffix */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Suffix</label>
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Your order ID will appear as #1001, #1002, #1003 ...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleDiscard}
            className="px-6 py-3 bg-base-100 text-gray-300 rounded-xl hover:bg-[#4a5066] transition-colors font-medium"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 px-6 py-3  font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
