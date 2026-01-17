import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { fetchProviders, fetchServices } from "../api";

export default function HospitalDirectory() {
    const [allProviders, setAllProviders] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchProviders(), fetchServices()]).then(([providers, services]) => {
            setAllProviders(providers);
            setAllServices(services);
            setLoading(false);
        }).catch(console.error);
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Users size={20} className="mr-2 text-blue-600" />
                    Hospital Directory
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr className="text-gray-500 text-xs uppercase tracking-wider">
                            <th className="py-3 px-6 font-medium">Hospital Name</th>
                            <th className="py-3 px-6 font-medium">Location</th>
                            <th className="py-3 px-6 font-medium">Working Hours</th>
                            <th className="py-3 px-6 font-medium">Services Provided</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allProviders.map(provider => {
                            const providerServices = allServices.filter(s => s.provider === provider.id);
                            return (
                                <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">{provider.name}</td>
                                    <td className="py-4 px-6 text-gray-600">{provider.location || "N/A"}</td>
                                    <td className="py-4 px-6 text-gray-600">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {provider.working_hours || "09:00 AM - 02:00 PM"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        <div className="flex flex-wrap gap-1">
                                            {providerServices.length > 0 ? (
                                                providerServices.map(s => (
                                                    <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {s.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 italic">No services listed</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {allProviders.length === 0 && (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-500 italic">No hospitals found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
