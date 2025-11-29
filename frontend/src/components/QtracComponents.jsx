import React from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';

export const Section = ({ children, className = "" }) => (
    <div className={`px-6 py-12 ${className}`}>
        {children}
    </div>
);

export const Button = ({ children, variant = "primary", className = "", onClick }) => {
    const baseStyle = "font-bold py-3 px-6 rounded-full transition-all duration-300 text-center inline-flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-gray-900 text-white hover:bg-gray-700",
        secondary: "bg-yellow-400 text-gray-900 hover:bg-yellow-500",
        outline: "border-2 border-gray-900 text-gray-900 hover:bg-gray-100",
        white: "bg-white text-gray-900 hover:bg-gray-100 shadow-md"
    };
    return (
        <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
};

export const FeatureItem = ({ text }) => (
    <div className="flex items-start gap-3 mb-4">
        <CheckCircle2 className="text-yellow-500 w-6 h-6 flex-shrink-0 mt-0.5" />
        <p className="text-gray-700 leading-relaxed">{text}</p>
    </div>
);

export const AccordionItem = ({ question, answer, isOpen, onClick }) => (
    <div className="border-b border-gray-200">
        <button
            className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
            onClick={onClick}
        >
            <span className="text-lg font-semibold text-gray-800">{question}</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
        >
            <p className="text-gray-600">{answer}</p>
        </div>
    </div>
);
