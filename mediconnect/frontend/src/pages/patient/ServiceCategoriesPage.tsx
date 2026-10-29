import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  HeartPulse,
  Activity,
  UserCheck,
  Truck,
  ShieldCheck,
  Pill,
  ArrowRight,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { categoriesApi } from '../../api/categories';

const iconMap: Record<string, any> = {
  stethoscope: Stethoscope,
  nurse: HeartPulse,
  telemedicine: Activity,
  lab: UserCheck,
  ambulance: Truck,
  pharmacy: Pill,
  physio: Activity,
  homecare: HeartPulse,
};

const ServiceCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi
      .list()
      .then(res => {
        if (res.success && res.data) {
          setCategories(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {
        setCategories([
          { id: '1', name: 'Doctor Home Visit', description: 'Licensed doctors for acute consultations and examinations.', icon_name: 'stethoscope' },
          { id: '2', name: 'Nurse Home Care', description: 'Wound dressing, injections, vital checks, and nursing care.', icon_name: 'nurse' },
          { id: '3', name: 'Telemedicine Consult', description: 'Live video or audio consultations with verified doctors.', icon_name: 'telemedicine' },
          { id: '4', name: 'Lab Sample Collection', description: 'Certified phlebotomists collect blood/urine samples at home.', icon_name: 'lab' },
          { id: '5', name: 'Pharmacy Delivery', description: 'Prescription and OTC medication delivered to your address.', icon_name: 'pharmacy' },
          { id: '6', name: 'Ambulance Transport', description: 'Authorized medical transport for non-critical transfers.', icon_name: 'ambulance' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Medical Services Directory</h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Choose a medical service to discover verified professionals available for immediate dispatch or scheduled home appointments.
        </p>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const Icon = iconMap[cat.icon_name] || iconMap[Object.keys(iconMap)[idx % 6]] || ShieldCheck;
            return (
              <Card key={cat.id} hoverable className="p-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{cat.description}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600">Verified Providers Available</span>
                  <Link
                    to={`/providers?categoryId=${cat.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform"
                  >
                    Find Providers <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceCategoriesPage;
