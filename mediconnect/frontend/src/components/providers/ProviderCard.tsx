import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ProviderCardProps {
  provider: {
    id: string;
    user_id?: string;
    first_name: string;
    last_name: string;
    business_name?: string;
    provider_type: string;
    bio?: string;
    average_rating: number;
    total_reviews: number;
    base_price?: number;
    price_unit?: string;
    is_available: boolean;
    distance_km?: number | null;
    service_name?: string;
  };
  onBookNow?: (providerId: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onBookNow }) => {
  const fullName = `${provider.first_name} ${provider.last_name}`;
  const price = provider.base_price || 2500;

  return (
    <Card hoverable className="p-5 flex flex-col justify-between">
      <div>
        {/* Header row */}
        <div className="flex items-start gap-3">
          <Avatar name={fullName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-base font-bold text-gray-900 truncate">{fullName}</h4>
              <CheckCircle className="w-4 h-4 text-primary shrink-0" aria-label="Verified Provider" />
            </div>
            {provider.business_name && (
              <p className="text-xs text-gray-500 truncate">{provider.business_name}</p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {provider.provider_type}
              </Badge>
              {provider.is_available ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available Now
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock className="w-3 h-3" /> Scheduled only
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {provider.bio && (
          <p className="mt-3 text-xs text-gray-600 line-clamp-2">{provider.bio}</p>
        )}

        {/* Rating and Distance */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50 text-xs">
          <StarRating
            rating={Number(provider.average_rating || 0)}
            totalReviews={provider.total_reviews}
            showText
            size="sm"
          />
          {provider.distance_km !== null && provider.distance_km !== undefined && (
            <span className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {Number(provider.distance_km).toFixed(1)} km away
            </span>
          )}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Service Fee</span>
          <span className="text-sm font-bold text-gray-900">
            KES {Number(price).toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-400 ml-1">/{provider.price_unit === 'PER_HOUR' ? 'hr' : 'visit'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/providers/${provider.id || provider.user_id}`}
            className="text-xs font-medium text-gray-600 hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Profile
          </Link>
          <Button
            size="sm"
            onClick={() => onBookNow?.(provider.id)}
          >
            Book
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProviderCard;
