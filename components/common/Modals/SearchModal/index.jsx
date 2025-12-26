"use client";

import { FaExclamationTriangle } from "react-icons/fa";

export default function TailwindDialog({ open, setOpen }) {
  return (
    <div>
      {/* Dialog */}
      {open && (
        <dialog
          id="dialog"
          aria-labelledby="dialog-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-transparent"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/50 transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Dialog Panel */}
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              {/* Content */}
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      id="dialog-title"
                      className="text-base font-semibold text-white"
                    >
                      Deactivate account
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Are you sure you want to deactivate your account? All of
                        your data will be permanently removed. This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="bg-gray-700/25 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400 sm:ml-3 sm:w-auto"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
