import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, Stethoscope } from 'lucide-react';
import ProviderCard from '../../components/providers/ProviderCard';
import ProviderMap from '../../components/map/ProviderMap';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { providersApi } from '../../api/providers';
import { categoriesApi } from '../../api/categories';

const ProviderSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [radius, setRadius] = useState(25);

  // Nairobi coordinates default
  const [userLocation, setUserLocation] = useState<[number, number]>([-1.2921, 36.8219]);

  useEffect(() => {
    // Attempt browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          /* user denied - keep Nairobi */
        },
      );
    }

    // Load categories
    categoriesApi.list().then(res => {
      if (res.success && res.data) {
        setCategories(Array.isArray(res.data) ? res.data : []);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    providersApi
      .search({
        categoryId: selectedCategory || undefined,
        providerType: (selectedType as any) || undefined,
        latitude: userLocation[0],
        longitude: userLocation[1],
        radiusKm: radius,
      })
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.items || [];
        setProviders(list);
      })
      .catch(() => {
        setProviders([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedType, radius, userLocation]);

  const handleBookNow = (providerId: string) => {
    navigate(`/book?providerId=${providerId}${selectedCategory ? `&categoryId=${selectedCategory}` : ''}`);
  };

  const mapLocations = providers
    .filter(p => p.current_latitude && p.current_longitude)
    .map(p => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      type: p.provider_type,
      latitude: Number(p.current_latitude),
      longitude: Number(p.current_longitude),
      price: p.base_price,
    }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Filter Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Find Healthcare Providers</h1>
          <p className="text-sm text-gray-500">
            Search licensed medical doctors, nurses, labs, and pharmacies near your location.
          </p>
        </div>

        {/* Search controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search provider name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
          />

          <Select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setSearchParams(prev => {
                if (e.target.value) prev.set('categoryId', e.target.value);
                else prev.delete('categoryId');
                return prev;
              });
            }}
            placeholder="All Service Categories"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
          />

          <Select
            value={selectedType}
            onChange={e => {
              setSelectedType(e.target.value);
              setSearchParams(prev => {
                if (e.target.value) prev.set('type', e.target.value);
                else prev.delete('type');
                return prev;
              });
            }}
            placeholder="All Professions"
            options={[
              { value: 'DOCTOR', label: 'Doctor' },
              { value: 'NURSE', label: 'Nurse' },
              { value: 'LABORATORY', label: 'Laboratory' },
              { value: 'PHARMACY', label: 'Pharmacy' },
              { value: 'AMBULANCE', label: 'Ambulance' },
              { value: 'PHYSIOTHERAPIST', label: 'Physiotherapist' },
            ]}
          />

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
            <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" />
            <span className="shrink-0 font-medium">Radius:</span>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <span className="shrink-0 font-bold text-gray-900">{radius}km</span>
          </div>
        </div>
      </div>

      {/* Main Split: Left Providers List, Right Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Providers list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {providers.length} Verified Providers Available
            </span>
          </div>

          {loading ? (
            <Spinner size="lg" />
          ) : providers.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="No providers found in this area"
              description="Try expanding the search radius or selecting a different medical service category."
              actionText="Reset Search Filters"
              onAction={() => {
                setSelectedCategory('');
                setSelectedType('');
                setRadius(35);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} onBookNow={handleBookNow} />
              ))}
            </div>
          )}
        </div>

        {/* Interactive Map */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <ProviderMap
              center={userLocation}
              userLocation={userLocation}
              providers={mapLocations}
              onSelectProvider={handleBookNow}
              className="h-[520px]"
            />
            <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" /> You (Patient)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Available Provider
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSearchPage;
