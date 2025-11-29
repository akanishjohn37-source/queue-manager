import React, { useState, useEffect } from 'react';
import {
    Play,
    MessageCircle,
    ChevronDown
} from 'lucide-react';
import { Section, Button, FeatureItem, AccordionItem } from '../components/QtracComponents';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'associate'
    const [openFaq, setOpenFaq] = useState(0);
    const [sliderIndex, setSliderIndex] = useState(0);

    // Auto-advance the slider for "Why Virtual Queuing"
    useEffect(() => {
        const timer = setInterval(() => {
            setSliderIndex((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="font-sans text-gray-900 bg-white relative overflow-x-hidden">

            {/* Hero Section */}
            <section className="bg-yellow-400 px-6 pt-12 pb-24 relative overflow-hidden">
                <div className="max-w-xl mx-auto text-center md:text-left">
                    <p className="font-bold text-xs tracking-widest uppercase mb-4 opacity-80">SMART HEALTHCARE</p>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight text-gray-900">
                        Hospital Queue Management
                    </h1>
                    <p className="text-xl font-medium mb-6">
                        Better care starts with less waiting.
                    </p>
                    <p className="text-gray-800 mb-8 leading-relaxed">
                        Eliminate crowded waiting rooms and reduce patient anxiety. Our virtual token system allows patients to book appointments from anywhere and track their status in real-time.
                    </p>
                    <Link to="/register">
                        <Button variant="primary">Get Started</Button>
                    </Link>
                </div>
            </section>

            {/* Overlapping Image Section */}
            <div className="px-6 -mt-16 relative z-10 max-w-xl mx-auto">
                <div className="bg-white p-2 rounded-lg shadow-xl transform rotate-1">
                    <div className="relative rounded-lg overflow-hidden bg-gray-200 aspect-video">
                        {/* Abstract placeholder for doctor/patient image */}
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <svg viewBox="0 0 200 200" className="w-full h-full object-cover opacity-80" fill="currentColor">
                                <rect width="200" height="200" fill="#e5e7eb" />
                                <circle cx="100" cy="80" r="40" fill="#d1d5db" />
                                <path d="M20 180 Q100 120 180 180" stroke="#d1d5db" strokeWidth="40" fill="none" />
                            </svg>
                            {/* Simulated Doctor Image */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl">👨‍⚕️</span>
                            </div>
                        </div>

                        {/* Chat Bubble Overlay */}
                        <div className="absolute bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-lg text-sm font-bold animate-bounce">
                            Your appointment is in 10 mins!
                        </div>
                    </div>
                </div>
            </div>

            {/* Partner Logos (Placeholder for Hospital Partners) */}
            <div className="py-12 flex flex-wrap justify-center gap-8 opacity-50 grayscale px-6">
                <div className="h-8 bg-gray-400 w-32 rounded flex items-center justify-center text-white text-xs font-bold">CITY HOSPITAL</div>
                <div className="h-8 bg-gray-400 w-24 rounded flex items-center justify-center text-white text-xs font-bold">MEDICARE</div>
                <div className="h-8 bg-gray-400 w-28 rounded flex items-center justify-center text-white text-xs font-bold">HEALTHPLUS</div>
            </div>

            {/* Why Virtual Queuing Slider */}
            <Section className="bg-gray-50 text-center">
                <p className="font-bold text-xs tracking-widest uppercase mb-4 text-gray-500">WHY CHOOSE US?</p>

                <div className="relative h-48">
                    {['IMPROVED PATIENT FLOW', 'REAL-TIME UPDATES', 'EFFICIENT STAFF'].map((title, idx) => (
                        <div key={idx} className={`absolute inset-0 transition-opacity duration-500 flex flex-col items-center justify-center ${idx === sliderIndex ? 'opacity-100' : 'opacity-0'}`}>
                            <h2 className="text-yellow-500 font-extrabold text-2xl mb-4">{title}</h2>
                            <p className="text-gray-700 max-w-md mx-auto">
                                {idx === 0 && "Reduce congestion in waiting areas and ensure a smooth flow of patients throughout the day."}
                                {idx === 1 && "Patients receive live notifications about their token status, reducing uncertainty and anxiety."}
                                {idx === 2 && "Doctors and staff can manage appointments efficiently with our integrated provider dashboard."}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2].map(idx => (
                        <button
                            key={idx}
                            onClick={() => setSliderIndex(idx)}
                            className={`h-1 rounded-full transition-all duration-300 ${idx === sliderIndex ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'}`}
                        />
                    ))}
                </div>
            </Section>

            {/* The Customer Experience */}
            <Section>
                <p className="font-bold text-xs tracking-widest uppercase mb-4 text-gray-500">THE PATIENT EXPERIENCE</p>
                <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Book your token from home</h2>
                <p className="text-gray-600 mb-8">Experience a hassle-free hospital visit.</p>

                {/* Tabs */}
                <div className="flex gap-4 overflow-x-auto pb-4 mb-6 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('customer')}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap ${activeTab === 'customer' ? 'bg-yellow-100 border-yellow-400 text-gray-900' : 'border-gray-200 text-gray-500'}`}
                    >
                        <div className="bg-yellow-400 rounded-full p-1"><Play size={12} fill="black" /></div>
                        Book Token
                    </button>
                    <button
                        onClick={() => setActiveTab('associate')}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap ${activeTab === 'associate' ? 'bg-yellow-100 border-yellow-400 text-gray-900' : 'border-gray-200 text-gray-500'}`}
                    >
                        <div className="bg-gray-200 rounded-full p-1"><Play size={12} className="text-gray-500" /></div>
                        Track Status
                    </button>
                </div>

                {/* Device Preview */}
                <div className="bg-gray-900 rounded-3xl p-4 max-w-xs mx-auto shadow-2xl border-4 border-gray-800">
                    <div className="bg-white rounded-2xl overflow-hidden h-96 relative">
                        {/* Fake Phone UI */}
                        {activeTab === 'customer' ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50">
                                <div className="w-full bg-white p-4 rounded-lg shadow mb-4 text-left border border-gray-100">
                                    <h4 className="font-bold text-sm mb-1">General Physician</h4>
                                    <p className="text-xs text-gray-500 mb-2">Dr. Smith</p>
                                    <div className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded inline-block">Book Now</div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Easy Booking</h3>
                                <p className="text-xs text-gray-500">Select your department and doctor to generate a token instantly.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-blue-50">
                                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white mb-4 shadow-lg animate-pulse">
                                    <span className="font-bold text-2xl">12</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-blue-900">Your Token Number</h3>
                                <p className="text-xs text-blue-700">Current Token Serving: 10<br />Estimated Wait: 15 mins</p>
                            </div>
                        )}
                    </div>
                </div>
            </Section>

            <hr className="border-gray-100 mx-6" />

            {/* Associate Experience */}
            <Section>
                <p className="font-bold text-xs tracking-widest uppercase mb-4 text-gray-500">THE DOCTOR EXPERIENCE</p>
                <h2 className="text-3xl font-extrabold mb-6 leading-tight">Manage patient queues effortlessly</h2>
                <p className="text-gray-700 mb-8">
                    The Provider Dashboard gives doctors and staff full control over the queue. Call the next patient, mark as completed, or skip with just a click.
                </p>
                <Link to="/login">
                    <Button variant="secondary" className="mb-12">Provider Login</Button>
                </Link>

                {/* Tablet Image Mockup */}
                <div className="relative rounded-xl shadow-2xl overflow-hidden border-8 border-gray-800 bg-gray-800">
                    <div className="bg-white aspect-[4/3] flex flex-col p-2">
                        <div className="bg-gray-100 h-8 mb-2 rounded w-full flex items-center px-2 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-2">
                            <div className="col-span-1 bg-gray-50 rounded p-2">
                                <div className="h-2 w-12 bg-gray-200 rounded mb-2"></div>
                                <div className="space-y-2">
                                    <div className="h-8 bg-white shadow-sm rounded border-l-4 border-green-500"></div>
                                    <div className="h-8 bg-white shadow-sm rounded"></div>
                                    <div className="h-8 bg-white shadow-sm rounded"></div>
                                </div>
                            </div>
                            <div className="col-span-2 bg-gray-50 rounded p-2 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-xs font-bold text-gray-500 mb-1">CURRENT PATIENT</div>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">Token #12</div>
                                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                                        <Play fill="white" className="text-white ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Feature Lists */}
            <Section className="bg-gray-50">
                <h2 className="text-2xl font-bold mb-8">Key Features</h2>
                <FeatureItem text="Simple token generation for patients" />
                <FeatureItem text="Real-time live status updates" />
                <FeatureItem text="Dedicated dashboard for doctors and staff" />
                <FeatureItem text="Admin panel for managing hospitals and services" />
            </Section>

            {/* Purple CTA */}
            <div className="bg-indigo-900 px-8 py-16 text-center relative overflow-hidden">
                {/* Decorative corner shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 transform translate-x-16 -translate-y-16 rotate-45"></div>

                <h2 className="text-3xl font-extrabold text-white mb-8 relative z-10">Ready to modernize your hospital queue?</h2>
                <Link to="/register">
                    <Button variant="secondary" className="relative z-10 w-full sm:w-auto">Get Started Now</Button>
                </Link>
            </div>

            {/* FAQ Section */}
            <Section>
                <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
                <AccordionItem
                    question="How do I book a token?"
                    answer="Simply register for an account, select your desired hospital and department, and click 'Book Token'."
                    isOpen={openFaq === 0}
                    onClick={() => setOpenFaq(openFaq === 0 ? -1 : 0)}
                />
                <AccordionItem
                    question="Can I track my position in the queue?"
                    answer="Yes! The 'Live Status' page shows the current token being served and your estimated wait time."
                    isOpen={openFaq === 1}
                    onClick={() => setOpenFaq(openFaq === 1 ? -1 : 1)}
                />
                <AccordionItem
                    question="Is this system free for patients?"
                    answer="Yes, the token booking system is completely free for patients."
                    isOpen={openFaq === 2}
                    onClick={() => setOpenFaq(openFaq === 2 ? -1 : 2)}
                />
            </Section>

            {/* Sticky Bottom "Psst" Button */}
            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 animate-bounce cursor-pointer">
                <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-gray-600 border border-gray-200">
                    Need Help?
                </div>
                <div className="bg-purple-800 text-white rounded-full p-3 shadow-lg">
                    <MessageCircle size={24} />
                </div>
            </div>

        </div>
    );
}
