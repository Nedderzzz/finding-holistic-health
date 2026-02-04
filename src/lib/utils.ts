export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName.charAt(0)}.`;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4) return 'Very Good';
  if (rating >= 3) return 'Good';
  if (rating >= 2) return 'Fair';
  return 'Poor';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeAddressKey(
  addressLine1?: string,
  city?: string,
  state?: string,
  zip?: string
): string {
  const parts = [addressLine1, city, state, zip]
    .filter(Boolean)
    .map((p) => String(p).trim().toLowerCase());
  return parts.join('|');
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Basic profanity filter (expand as needed)
const profanityList = [
  'badword1',
  'badword2',
  // Add more as needed
];

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some((word) => lowerText.includes(word));
}

// Rate limiting helper
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  if (!record || now > record.resetTime) {
    rateLimitStore[identifier] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

export function getStateCodeByName(stateName: string): string | null {
  const stateMap: { [key: string]: string } = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'newhampshire': 'NH', 'newjersey': 'NJ', 'newmexico': 'NM', 'newyork': 'NY',
    'northcarolina': 'NC', 'northdakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhodeisland': 'RI', 'southcarolina': 'SC',
    'southdakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'westvirginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY',
  };
  
  return stateMap[stateName.toLowerCase().replace(/\s/g, '')] || null;
}
