'use client';

interface ProviderCardProps {
  id: string;
  businessName: string;
  providerName: string;
  city: string;
  state: string;
  avgRating: number;
  reviewCount?: number;
  description?: string;
  specialties?: string[];
}

export function ProviderCard({
  id,
  businessName,
  providerName,
  city,
  state,
  avgRating,
  reviewCount = 0,
  description,
  specialties = [],
}: ProviderCardProps) {
  return (
    <a
      href={`/providers/${id}`}
      className="block p-6 bg-white rounded-lg border border-neutral-lighter hover:border-primary hover:shadow-lg transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-neutral-dark text-lg truncate">
          {businessName}
        </h3>
        <div className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
          {avgRating.toFixed(1)} ⭐
        </div>
      </div>

      <p className="text-sm text-text-muted mb-2">{providerName}</p>
      
      <p className="text-sm text-text-muted mb-3">
        {city}, {state}
      </p>

      {description && (
        <p className="text-sm text-text-muted mb-3 line-clamp-2">
          {description}
        </p>
      )}

      {specialties && specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {specialties.slice(0, 3).map((specialty) => (
            <span
              key={specialty}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
            >
              {specialty}
            </span>
          ))}
          {specialties.length > 3 && (
            <span className="text-xs text-text-muted">
              +{specialties.length - 3} more
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-text-muted">
        {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
      </p>
    </a>
  );
}
