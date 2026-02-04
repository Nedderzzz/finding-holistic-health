import { z } from 'zod';

// US States
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

// Specialties
export const SPECIALTIES = [
  'Acupuncture',
  'Naturopathy',
  'Chiropractic',
  'Functional Medicine',
  'Herbalism',
  'Massage Therapy',
  'Nutritionist/Dietitian',
  'Integrative MD/DO',
  'Ayurveda',
  'Homeopathy',
  'Midwifery/Doula',
  'Yoga Therapy',
  'Holistic Mental Health',
  'Reiki/Energy Work',
  'Traditional Chinese Medicine',
];

// Validation Schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const providerSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(255),
  providerName: z.string().min(1, "Provider's name is required").max(255),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().length(2, 'State must be 2 letters').toUpperCase(),
  phone: z.string().regex(/^\d{10,}$/, 'Valid phone number required'),
  addressLine1: z.string().max(255).optional(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code').optional(),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  specialties: z.array(z.string()).optional().default([]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const requestSubmissionSchema = providerSchema;

export const suggestionSchema = z.object({
  businessName: z.string().min(1, 'Business/Provider name is required').max(255),
  providerName: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().length(2, 'State must be 2 letters').toUpperCase(),
  phone: z.string().regex(/^\d{10,}$/, 'Valid phone number required').optional().or(z.literal('')),
  addressLine1: z.string().max(255).optional(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code').optional().or(z.literal('')),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  notes: z.string().max(2000).optional(),
  specialties: z.array(z.string()).optional().default([]),
  suggestedBy: z.string().email('Invalid email').optional().or(z.literal('')),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5),
  content: z.string().min(10, 'Review must be at least 10 characters').max(5000),
});

// Type exports
export type Provider = z.infer<typeof providerSchema>;
export type RequestSubmission = z.infer<typeof requestSubmissionSchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
