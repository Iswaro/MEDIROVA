import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  Activity,
  ArrowRight,
  Stethoscope,
  Truck,
  HeartPulse,
  UserCheck,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { categoriesApi } from '../../api/categories';
import { useAuth } from '../../context/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; description: string; slug: string }>>([]);

  useEffect(() => {
    categoriesApi.list().then(res => {
      if (res.success && res.data) {
        setCategories(Array.isArray(res.data) ? res.data : []);
      }
    }).catch(() => {
      // Fallback display categories if backend offline
      setCategories([
        { id: '1', name: 'Doctor Home Visit', description: 'Licensed doctors for acute consultations and examinations.', slug: 'doctor-home-visit' },
        { id: '2', name: 'Nurse Home Care', description: 'Wound dressing, injections, vital checks, and nursing care.', slug: 'nurse-home-care' },
        { id: '3', name: 'Telemedicine Consult', description: 'Live video or audio consultations with verified doctors.', slug: 'telemedicine' },
        { id: '4', name: 'Lab Sample Collection', description: 'Certified phlebotomists collect blood/urine samples at home.', slug: 'lab-sample' },
        { id: '5', name: 'Pharmacy Delivery', description: 'Prescription and OTC medication delivered to your address.', slug: 'pharmacy-delivery' },
        { id: '6', name: 'Ambulance Transport', description: 'Authorized medical transport for non-critical transfers.', slug: 'ambulance' },
      ]);
    });
  }, []);

  const handleBookNow = () => {
    if (isAuthenticated) {
      if (user?.role === 'PATIENT') navigate('/services');
      else if (user?.role === 'PROVIDER') navigate('/provider/dashboard');
      else navigate('/admin/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-primary to-secondary text-white p-8 sm:p-14 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
            ON-DEMAND HEALTHCARE IN KENYA
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Verified Doctors & Nurses <span className="text-teal-200">At Your Doorstep</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl font-normal leading-relaxed">
            Request home doctor visits, nursing care, lab sample collections, and pharmacy delivery in minutes. Transparent pricing, verified credentials, and seamless M-Pesa payments.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={handleBookNow}
              className="bg-white text-primary hover:bg-blue-50 font-bold shadow-lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Request a Medical Service
            </Button>
            <Link to="/providers">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 border border-white/30">
                Browse Nearby Providers
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10 text-xs text-blue-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
              <span>100% Verified Licenses</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Real-Time Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-300 shrink-0" />
              <span>M-Pesa Integrated</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-300 shrink-0" />
              <span>GPS Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Service Categories ───────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Comprehensive Medical Services</h2>
          <p className="text-gray-600 text-sm">
            Select a service to find available, credentialed healthcare professionals serving your area.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((cat, idx) => {
            const icons = [Stethoscope, HeartPulse, Activity, UserCheck, Truck, ShieldCheck];
            const Icon = icons[idx % icons.length];
            return (
              <Card key={cat.id} hoverable className="p-6 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">From KES 2,000</span>
                  <Link
                    to={`/providers?categoryId=${cat.id}`}
                    className="text-xs font-semibold text-gray-700 hover:text-primary flex items-center gap-1"
                  >
                    Find Providers <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link to="/services">
            <Button variant="outline">View All Available Services</Button>
          </Link>
        </div>
      </section>

      {/* ─── How it works (Uber-like flow) ────────────────────────── */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">How MEDICONNECT Works</h2>
          <p className="text-gray-600 text-sm">Four simple steps to healthcare at your location.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-primary font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
              1
            </div>
            <h4 className="font-bold text-gray-900">Choose Service</h4>
            <p className="text-xs text-gray-500">Pick from doctor visits, nursing care, lab testing, or telemedicine.</p>
          </div>

          <div className="space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-secondary-dark font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
              2
            </div>
            <h4 className="font-bold text-gray-900">Set Location</h4>
            <p className="text-xs text-gray-500">Enter your address or share GPS coordinates. See upfront price quotes.</p>
          </div>

          <div className="space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-primary font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
              3
            </div>
            <h4 className="font-bold text-gray-900">Get Matched</h4>
            <p className="text-xs text-gray-500">Nearby verified providers are notified. First available provider accepts atomically.</p>
          </div>

          <div className="space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
              4
            </div>
            <h4 className="font-bold text-gray-900">Track & Pay</h4>
            <p className="text-xs text-gray-500">Track provider arrival in real time. Pay securely via M-Pesa upon completion.</p>
          </div>
        </div>
      </section>

      {/* ─── For Healthcare Providers ──────────────────────────────── */}
      <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-block text-xs font-semibold uppercase tracking-wider text-teal-400">
            For Medical Professionals
          </div>
          <h2 className="text-3xl font-bold">Are You a Verified Doctor, Nurse, or Lab?</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Join the MEDICONNECT network. Set your own schedule, service areas, and consultation fees. Receive automated payouts with verified audit trails.
          </p>
          <ul className="text-xs text-gray-300 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              Verified credentials checked by licensed medical administrators
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              Real-time incoming requests in your geographic coverage radius
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              Automated M-Pesa earnings and transparent commission tracking
            </li>
          </ul>
        </div>
        <div className="shrink-0">
          <Link to="/register?role=PROVIDER">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
              Register as Medical Provider
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
