/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  Linkedin,
  ChevronRight,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Award,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---
type Screen = 'home' | 'experts' | 'portfolio' | 'booking';

// --- Components ---

const Navbar = ({ activeScreen, setScreen }: { activeScreen: Screen, setScreen: (s: Screen) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string, id: Screen }[] = [
    { label: 'Home', id: 'home' },
    { label: 'Our Experts', id: 'experts' },
    { label: 'Smile Portfolio', id: 'portfolio' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
      isScrolled ? "glass-nav shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setScreen('home')}
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-headline text-xl shadow-lg group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-headline text-xl tracking-tight text-on-surface">
            Dental Center
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setScreen(link.id)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                activeScreen === link.id ? "text-primary" : "text-on-surface-variant"
              )}
            >
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => setScreen('booking')}
            className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-primary-container transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-on-surface"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-surface-variant p-6 md:hidden shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setScreen(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "text-left text-lg font-medium py-2",
                    activeScreen === link.id ? "text-primary" : "text-on-surface-variant"
                  )}
                >
                  {link.label}
                </button>
              ))}
              <button 
                onClick={() => {
                  setScreen('booking');
                  setIsMobileMenuOpen(false);
                }}
                className="bg-primary text-white w-full py-4 rounded-2xl text-center font-bold mt-2"
              >
                Book Appointment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onBook }: { onBook: () => void }) => (
  <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop" 
        alt="Modern Dental Clinic"
        className="w-full h-full object-cover opacity-10"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </div>

    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full text-primary text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          Redefining Aesthetic Dentistry
        </div>
        <h1 className="font-headline text-5xl md:text-7xl leading-[1.1] text-on-surface mb-6">
          The Art of a <br />
          <span className="text-primary italic">Perfect Smile</span>
        </h1>
        <p className="text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
          Experience clinical excellence combined with luxury care. Our world-class experts use cutting-edge technology to craft your most confident smile.
        </p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onBook}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-container transition-all flex items-center gap-2 group"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-4 px-4">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-surface-variant">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex text-yellow-500">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
              <p className="font-semibold text-on-surface">5,000+ Happy Patients</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative"
      >
        <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl editorial-shadow">
          <img 
            src="https://images.unsplash.com/photo-1606811841660-1b5168c34714?q=80&w=2070&auto=format&fit=crop" 
            alt="Dental Technology"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl max-w-[240px] border border-surface-variant">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-on-surface">Certified Safety</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            ISO 9001:2015 certified clinical standards and sterilization protocols.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

const Stats = () => (
  <section className="py-20 bg-surface-container-low">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Years Experience', value: '15+', icon: Award },
          { label: 'Expert Doctors', value: '12', icon: Users },
          { label: 'Success Rate', value: '99.8%', icon: CheckCircle2 },
          { label: 'Modern Clinics', value: '04', icon: MapPin },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-primary">
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-headline text-on-surface mb-1">{stat.value}</div>
            <div className="text-sm text-on-surface-variant font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Services = () => {
  const services = [
    {
      title: "Smile Design",
      desc: "Digital smile planning for perfectly symmetrical and natural-looking results.",
      icon: Sparkles,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Dental Implants",
      desc: "Permanent, stable solutions for missing teeth using premium titanium implants.",
      icon: Stethoscope,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Orthodontics",
      desc: "Invisalign and modern braces for perfectly aligned teeth at any age.",
      icon: HeartPulse,
      color: "bg-rose-50 text-rose-600"
    }
  ];

  return (
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="font-headline text-4xl md:text-5xl mb-6">World-Class Services</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
            We provide a comprehensive range of dental treatments using the latest clinical advancements.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[32px] bg-white border border-surface-variant shadow-sm hover:shadow-xl transition-all"
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8", s.color)}>
                <s.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-headline mb-4">{s.title}</h3>
              <p className="text-on-surface-variant leading-relaxed mb-8">{s.desc}</p>
              <button className="text-primary font-bold flex items-center gap-2 group">
                Learn More
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ExpertsScreen = () => {
  const experts = [
    {
      name: "Dr. Sarah Johnson",
      role: "Lead Aesthetic Dentist",
      image: "https://images.unsplash.com/photo-1559839734-2b71f153678f?q=80&w=2070&auto=format&fit=crop",
      bio: "Specializing in digital smile design with over 12 years of international experience."
    },
    {
      name: "Dr. Michael Chen",
      role: "Implant Specialist",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
      bio: "Expert in minimally invasive implantology and full-mouth reconstruction."
    },
    {
      name: "Dr. Elena Rossi",
      role: "Orthodontist",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2070&auto=format&fit=crop",
      bio: "Certified Invisalign Diamond provider focusing on functional aesthetics."
    }
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="font-headline text-5xl mb-4">Meet Our Experts</h1>
          <p className="text-on-surface-variant text-lg">A dedicated team of specialists committed to your oral health.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {experts.map((exp, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="aspect-[3/4] rounded-[32px] overflow-hidden mb-6 shadow-lg">
                <img 
                  src={exp.image} 
                  alt={exp.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-2xl font-headline mb-1">{exp.name}</h3>
              <p className="text-primary font-semibold mb-4">{exp.role}</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">{exp.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PortfolioScreen = () => {
  const cases = [
    {
      title: "Full Smile Makeover",
      desc: "Veneers & Whitening",
      image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Invisible Alignment",
      desc: "Invisalign Treatment",
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Dental Restoration",
      desc: "Premium Implants",
      image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center">
          <h1 className="font-headline text-5xl mb-4">Smile Portfolio</h1>
          <p className="text-on-surface-variant text-lg">Real transformations from our happy patients.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((c, i) => (
            <motion.div 
              key={i}
              className="relative rounded-[40px] overflow-hidden group aspect-square shadow-xl"
            >
              <img 
                src={c.image} 
                alt={c.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10">
                <h3 className="text-white font-headline text-2xl mb-2">{c.title}</h3>
                <p className="text-white/80">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookingScreen = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-12 bg-white rounded-[40px] shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-headline mb-4">Request Received!</h2>
          <p className="text-on-surface-variant mb-8">
            Our coordinator will contact you within 2 hours to confirm your preferred time slot.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-start">
        <div>
          <h1 className="font-headline text-5xl mb-6">Book Your <br /><span className="text-primary">Consultation</span></h1>
          <p className="text-on-surface-variant text-lg mb-12">
            Take the first step towards your dream smile. Fill out the form and our team will get back to you shortly.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Call Us Directly</h4>
                <p className="text-on-surface-variant">+1 (555) 000-1234</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Our Location</h4>
                <p className="text-on-surface-variant">123 Clinical Way, Medical District, NY</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Working Hours</h4>
                <p className="text-on-surface-variant">Mon - Sat: 9:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-surface-variant">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">First Name</label>
                <input required type="text" className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Last Name</label>
                <input required type="text" className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Email Address</label>
              <input required type="email" className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Service Interested In</label>
              <select className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none appearance-none">
                <option>General Checkup</option>
                <option>Smile Design / Veneers</option>
                <option>Dental Implants</option>
                <option>Orthodontics</option>
                <option>Teeth Whitening</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Message (Optional)</label>
              <textarea className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none h-32" placeholder="Tell us about your dental goals..."></textarea>
            </div>
            <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-primary-container transition-all">
              Request Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-inverse-surface text-white py-20">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-headline text-xl">S</div>
            <span className="font-headline text-xl tracking-tight">Dental Center</span>
          </div>
          <p className="text-white/60 max-w-sm leading-relaxed mb-8">
            Setting the gold standard in aesthetic dentistry. Our commitment to clinical excellence and patient comfort is unwavering.
          </p>
          <div className="flex gap-4">
            {[Instagram, Facebook, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-white/60">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Our Services</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Smile Gallery</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Legal</h4>
          <ul className="space-y-4 text-white/60">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
        © 2026 S Dental Center. All rights reserved.
      </div>
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeScreen={screen} setScreen={setScreen} />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onBook={() => setScreen('booking')} />
              <Stats />
              <Services />
              
              {/* Tech Spotlight Section */}
              <section className="py-32 bg-on-surface text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                  <div className="relative">
                    <div className="aspect-square rounded-[40px] overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1606811841660-1b5168c34714?q=80&w=2070&auto=format&fit=crop" 
                        alt="Advanced Tech" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                  </div>
                  <div>
                    <div className="text-primary font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-[2px] bg-primary" />
                      Future of Dentistry
                    </div>
                    <h2 className="font-headline text-4xl md:text-5xl mb-8 leading-tight">
                      Precision Driven by <br /> Advanced Technology
                    </h2>
                    <p className="text-white/60 text-lg mb-10 leading-relaxed">
                      We invest in the world's most advanced diagnostic and treatment tools, from 3D intraoral scanners to AI-assisted surgical planning, ensuring painless and accurate results.
                    </p>
                    <ul className="space-y-4">
                      {[
                        "AI-Powered Diagnostic Imaging",
                        "Pain-Free Laser Dentistry",
                        "3D Digital Smile Design",
                        "Microscopic Precision Surgery"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Testimonials */}
              <section className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                   <div className="text-center mb-20">
                    <h2 className="font-headline text-4xl md:text-5xl mb-6">Patient Stories</h2>
                    <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                      Hear from those who have experienced the S Dental Center difference.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { name: "James Wilson", text: "The most professional dental experience I've ever had. The technology they use is mind-blowing.", role: "Business Executive" },
                      { name: "Sophia Martinez", text: "I finally have the smile I've always dreamed of. Dr. Sarah is truly an artist.", role: "Fashion Designer" },
                      { name: "David Thompson", text: "Painless, efficient, and a beautiful clinic. Highly recommend for anyone with dental anxiety.", role: "Software Engineer" }
                    ].map((t, i) => (
                      <div key={i} className="p-10 bg-surface-container-low rounded-[32px] border border-surface-variant">
                        <div className="flex text-yellow-500 mb-6">
                          {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                        </div>
                        <p className="text-lg italic text-on-surface mb-8">"{t.text}"</p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${t.name}`} alt={t.name} referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="font-bold">{t.name}</div>
                            <div className="text-xs text-on-surface-variant uppercase tracking-wider">{t.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Final CTA */}
              <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto bg-primary-gradient rounded-[48px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
                  </div>
                  <h2 className="font-headline text-4xl md:text-6xl mb-8 relative z-10">Ready for Your <br /> New Smile?</h2>
                  <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto relative z-10">
                    Schedule your comprehensive consultation today and discover the possibilities for your smile.
                  </p>
                  <button 
                    onClick={() => setScreen('booking')}
                    className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all relative z-10"
                  >
                    Book Your Appointment
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {screen === 'experts' && <ExpertsScreen />}
          {screen === 'portfolio' && <PortfolioScreen />}
          {screen === 'booking' && <BookingScreen />}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
