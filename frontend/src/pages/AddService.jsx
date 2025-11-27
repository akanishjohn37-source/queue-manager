// frontend/src/pages/AddService.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";

export default function AddService() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setMessage("Service name is required.");
      return;
    }

    try {
      await apiPost("/services/", { name, description });
      navigate("/services");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add service. " + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Add New Service</h1>

      {message && (
        <div className="bg-red-50 border border-red-200 px-3 py-2 rounded text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Service Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border rounded-lg px-3 py-2"
            rows="3"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Service
        </button>
      </form>
    </div>
  );
}
