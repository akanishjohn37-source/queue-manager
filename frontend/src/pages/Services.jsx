import React, { useEffect, useState } from "react";
import { fetchServices } from "../api";

export default function Services() {
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch((err) => {
        console.error(err);
        setMessage("Failed to load services");
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Services</h1>

      {message && (
        <div className="bg-red-50 border border-red-200 px-3 py-2 rounded text-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Description</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b">
                <td className="py-2">{service.name}</td>
                <td className="py-2">{service.description}</td>
                <td className="py-2">{service.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
