import React, { useState, useEffect } from 'react';
import {
    Play,
    MessageCircle,
    ChevronDown,
    Zap,
    Users,
    Activity,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { Section, Button, FeatureItem, AccordionItem } from '../components/QtracComponents';
import { Link } from 'react-router-dom';
import HospitalDirectory from '../components/HospitalDirectory';

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState('customer');
    const [openFaq, setOpenFaq] = useState(0);
    const [sliderIndex, setSliderIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSliderIndex((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-white relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">

            {/* Premium Hero Section */}
            <section className="relative px-6 pt-24 pb-40 overflow-hidden bg-slate-900">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="text-center lg:text-left space-y-10 animate-fade-in">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-white/50 tracking-[0.3em] uppercase">Enterprise Ready V2.0</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                            Modernize <br />
                            <span className="text-blue-500">Waiting.</span>
                        </h1>

                        <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Eliminate crowded physical lobbies. Our intelligent token system bridges the gap between patient scheduling and real-time clinical operations.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                            <Link to="/register">
                                <button className="btn-gold !px-10 !py-5 text-lg group">
                                    Launch Your Queue
                                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </Link>
                            <Link to="/login">
                                <button className="px-10 py-5 text-white font-bold hover:text-blue-400 transition-colors bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                    Clinical Access
                                </button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-8 opacity-40">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800" />)}
                            </div>
                            <p className="text-xs font-bold text-white uppercase tracking-widest">Trusted by 2k+ Providers</p>
                        </div>
                    </div>

                    <div className="relative group animate-scale-in hidden lg:block">
                        <div className="absolute inset-0 bg-blue-600/30 blur-[80px] rounded-full group-hover:bg-blue-600/50 transition-all duration-700"></div>
                        <div className="relative bg-slate-800 border-8 border-slate-700/50 rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none"></div>
                            <div className="text-center relative">
                                <div className="bg-blue-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50 animate-bounce">
                                    <Activity size={40} className="text-white" />
                                </div>
                                <div className="text-3xl font-black text-white tracking-widest mb-1">LIVE STREAM</div>
                                <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Processing Token #842</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Institutional Trust Band */}
            <div className="bg-white py-12 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    {['GENERAL CLINIC', 'CITY MEDICA', 'APOLLO CARE', 'MAYO HUB', 'ZENITH'].map(name => (
                        <div key={name} className="text-xl font-black text-slate-900 tracking-tighter">{name}</div>
                    ))}
                </div>
            </div>

            {/* Value Propositions */}
            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                    <div className="lg:col-span-5 space-y-8">
                        <div className="p-3 bg-blue-50 rounded-2xl w-fit text-blue-600">
                            <Zap size={24} />
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">The future of clinical flow management.</h2>
                        <p className="text-lg text-slate-500 font-medium">Built with precision to handle thousands of concurrent tokens across multiple departments seamlessly.</p>
                        <div className="space-y-4 pt-6">
                            <FeatureItem text="Automated session cleanup & reset" />
                            <FeatureItem text="End-to-end encrypted patient data" />
                            <FeatureItem text="Instant SMS & Webhooks integration" />
                        </div>
                    </div>

                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { title: '99.9% Uptime', desc: 'Enterprise-grade infrastructure ensuring your clinic never misses a patient.', icon: <Activity /> },
                            { title: 'Universal Access', desc: 'Optimized for mobile web, native apps, and lobby kiosks.', icon: <Users /> },
                            { title: 'Secure Vault', desc: 'GDPR & HIPAA compliant data storage for internal records.', icon: <ShieldCheck /> },
                            { title: 'Smart Analytics', desc: 'Predictive wait times based on historical session data.', icon: <Play /> }
                        ].map((card, i) => (
                            <div key={i} className="premium-card p-10 space-y-6 hover:border-blue-200">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    {card.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">{card.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Interactive Experience */}
            <Section className="bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Patient-First Experience</h2>
                    <p className="text-xl text-slate-500 font-medium">Simple for them. Powerful for you.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="lg:w-1/2 space-y-12 order-2 lg:order-1">
                        <div onClick={() => setActiveTab('customer')} className={`p-8 rounded-3xl cursor-pointer transition-all duration-500 ${activeTab === 'customer' ? 'bg-white shadow-2xl shadow-blue-500/10 border-2 border-blue-500 scale-105' : 'bg-transparent border-2 border-transparent grayscale opacity-50'}`}>
                            <h3 className="text-2xl font-black mb-3">Instant Token Retrieval</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Patients book from their mobile browser in under 15 seconds. No app download required.</p>
                        </div>
                        <div onClick={() => setActiveTab('associate')} className={`p-8 rounded-3xl cursor-pointer transition-all duration-500 ${activeTab === 'associate' ? 'bg-white shadow-2xl shadow-blue-500/10 border-2 border-blue-500 scale-105' : 'bg-transparent border-2 border-transparent grayscale opacity-50'}`}>
                            <h3 className="text-2xl font-black mb-3">Dynamic Queue Tracking</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">Real-time countdowns and push notifications when their number is approaching.</p>
                        </div>
                    </div>

                    <div className="lg:w-1/2 flex justify-center order-1 lg:order-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full"></div>
                            <div className="relative bg-slate-900 border-[12px] border-slate-800 rounded-[3.5rem] p-4 shadow-2xl w-80 aspect-[9/19]">
                                <div className="bg-white h-full rounded-[2.5rem] overflow-hidden relative flex flex-col items-center justify-center p-8 text-center">
                                    {activeTab === 'customer' ? (
                                        <div className="animate-scale-in">
                                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                                                <Zap fill="currentColor" />
                                            </div>
                                            <div className="text-lg font-black text-slate-900 mb-2">Book Now</div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full mb-2 overflow-hidden">
                                                <div className="h-full bg-blue-600 w-1/3 animate-pulse"></div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">General Practice</p>
                                        </div>
                                    ) : (
                                        <div className="animate-scale-in">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Position in Queue</div>
                                            <div className="text-7xl font-black text-blue-600 tracking-tighter mb-4">08</div>
                                            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Estimated 4m</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Dark CTA */}
            <div className="relative bg-blue-600 px-8 py-24 text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-3xl mx-auto relative z-10 space-y-10">
                    <h2 className="text-6xl font-black text-white tracking-tighter leading-none">Integrate the elite <br /> standard of care.</h2>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/register">
                            <button className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 shadow-2xl transition-all hover:scale-105 active:scale-95">
                                Start Your Implementation
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Support / FAQ */}
            <Section>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Common Inquiries</h2>
                        <p className="text-slate-500 font-medium">Everything you need to know about our industrial solution.</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "How secure is patient information?", a: "We utilize multi-layer encryption and session-only data persistence where possible to ensure highest patient privacy." },
                            { q: "Can we handle multiple departments?", a: "Absolutely. The administrative dashboard allows for unlimited service creation and staff assignment." },
                            { q: "Is there a hardware requirement?", a: "No. The system is cloud-native and works on any standard web-enabled device." }
                        ].map((item, i) => (
                            <AccordionItem
                                key={i}
                                question={item.q}
                                answer={item.a}
                                isOpen={openFaq === i}
                                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                            />
                        ))}
                    </div>
                </div>
            </Section>

            {/* Hospital Directory - Now on Landing Page */}
            <Section className="bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto space-y-10">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Clinical Network Directory</h2>
                        <p className="text-slate-500 font-medium">Real-time status of our institutional partners and available departments.</p>
                    </div>
                    <HospitalDirectory />
                </div>
            </Section>

            {/* Float Help */}
            <div className="fixed bottom-8 right-8 z-50 group pointer-events-none sm:pointer-events-auto">
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-90 transition-all duration-300">
                    <MessageCircle size={28} />
                </div>
            </div>
        </div>
    );
}
