import React from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';

export const Section = ({ children, className = "" }) => (
    <div className={`px-8 py-20 max-w-7xl mx-auto ${className}`}>
        {children}
    </div>
);

export const Button = ({ children, variant = "primary", className = "", onClick }) => {
    const baseStyle = "btn-primary !px-8 !py-4 font-bold tracking-tight inline-flex items-center justify-center gap-3";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "btn-gold", // mapped to my global gold button
        outline: "bg-transparent border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white shadow-none hover:shadow-lg",
        white: "bg-white text-slate-900 hover:bg-slate-50 shadow-xl shadow-slate-200/50"
    };

    // allow variant secondary to use btn-gold logic
    const finalClass = variant === 'secondary' ? `btn-gold ${className}` : `${baseStyle} ${variants[variant]} ${className}`;

    return (
        <button onClick={onClick} className={finalClass}>
            {children}
        </button>
    );
};

export const FeatureItem = ({ text }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
        <div className="bg-emerald-50 p-1 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        </div>
        <p className="text-slate-600 font-medium leading-relaxed mt-0.5">{text}</p>
    </div>
);

export const AccordionItem = ({ question, answer, isOpen, onClick }) => (
    <div className={`border-b border-slate-100 transition-all duration-500 ${isOpen ? 'bg-slate-50/50 rounded-2xl px-6' : ''}`}>
        <button
            className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
            onClick={onClick}
        >
            <span className={`text-lg font-bold tracking-tight transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'}`}>{question}</span>
            <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                <ChevronDown size={18} />
            </div>
        </button>
        <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}
        >
            <p className="text-slate-500 font-medium leading-relaxed">{answer}</p>
        </div>
    </div>
);
