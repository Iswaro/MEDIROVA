import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Star,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { providersApi } from '../../api/providers';

const ProviderProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    providersApi
      .getById(id)
      .then(res => {
        if (res.success && res.data) {
          setProvider(res.data);
        }
      })
      .catch(() => {
        setProvider(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!provider) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Provider not found</h2>
        <Link to="/providers">
          <Button variant="outline">Browse All Providers</Button>
        </Link>
      </div>
    );
  }

  const fullName = `${provider.first_name} ${provider.last_name}`;
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      {/* Profile Header Card */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar name={fullName} size="xl" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900">{fullName}</h1>
              <Badge variant="primary">{provider.provider_type}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                <CheckCircle className="w-3.5 h-3.5" /> Verified License
              </span>
            </div>
            {provider.business_name && (
              <p className="text-sm font-medium text-gray-600">{provider.business_name}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <StarRating
                rating={Number(provider.average_rating || 0)}
                totalReviews={provider.total_reviews}
                showText
              />
              {provider.current_latitude && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Nairobi Coverage Area
                </span>
              )}
            </div>
          </div>
          <Link to={`/book?providerId=${provider.id}`}>
            <Button size="lg" className="w-full sm:w-auto font-bold shadow-md shadow-primary/20">
              Book Service
            </Button>
          </Link>
        </div>

        {provider.bio && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Professional Bio</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{provider.bio}</p>
          </div>
        )}
      </Card>

      {/* Services & Fees */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Services Offered & Pricing
        </h3>
        <div className="divide-y divide-gray-100">
          {(provider.services || []).map((s: any) => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.category_name || 'Medical Service'}</p>
                {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-gray-900">KES {Number(s.base_price).toLocaleString()}</span>
                <span className="text-xs text-gray-400 block">{s.price_unit?.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Availability Schedule */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Regular Weekly Working Hours
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
          {daysOfWeek.map((dayName, dayNum) => {
            const slot = (provider.availability || []).find((a: any) => a.day_of_week === dayNum);
            return (
              <div
                key={dayName}
                className={`p-3 rounded-xl border ${
                  slot ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-100 opacity-50'
                }`}
              >
                <span className="font-bold text-gray-800 block mb-1">{dayName}</span>
                {slot ? (
                  <span className="text-[11px] text-primary font-medium">
                    {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400">Off</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Patient Reviews */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" /> Patient Reviews & Ratings
        </h3>
        {(!provider.reviews || provider.reviews.length === 0) ? (
          <p className="text-xs text-gray-400 py-4 text-center">No reviews yet for this provider.</p>
        ) : (
          <div className="space-y-4">
            {provider.reviews.map((r: any) => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">
                    {r.first_name ? `${r.first_name} ${r.last_name || ''}` : 'Verified Patient'}
                  </span>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
                <span className="text-[10px] text-gray-400 block">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProviderProfilePage;
