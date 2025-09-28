// ApplyJobModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";

export const ApplyJobModal = ({ jobId, open, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/candidates", { jobId, name, email });
      setSuccess(true);
      setName("");
      setEmail("");
    } catch (err) {
      console.error("Error applying:", err);
      setError("Failed to apply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Apply for this Job</h3>
        {success ? (
          <div className="text-green-600">
            ✅ Application submitted successfully!
            <Button className="mt-4" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border p-2 rounded w-full"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 rounded w-full"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
