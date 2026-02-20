#!/usr/bin/env python3
"""
Healthcare Provider Scraper
Scrapes holistic healthcare provider information from multiple real APIs.

Status Values:
- PENDING: Initial status when providers are imported (not shown on site)
- APPROVED: Provider is visible and searchable on the site
- REJECTED: Provider was rejected and will not appear on site

Required API Keys (set as environment variables or in .env file):
- GOOGLE_MAPS_API_KEY: Get from https://cloud.google.com/maps-platform
- YELP_API_KEY: Get from https://www.yelp.com/developers

Installation:
pip install requests geopy python-dotenv
"""

import csv
import json
import logging
import os
import re
import sys
import time
from datetime import datetime
from typing import Optional, List, Dict, Tuple
from dataclasses import dataclass, asdict

import requests
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Holistic healthcare specialties to search for
SPECIALTIES = [
    'Acupuncture',
    'Naturopathy',
    'Chiropractic',
    'Functional Medicine',
    'Herbalism',
    'Massage Therapy',
    'Nutritionist',
    'Integrative Medicine',
    'Ayurveda',
    'Homeopathy',
    'Reiki',
    'Traditional Chinese Medicine',
    'Yoga Therapy',
    'Holistic Wellness',
]

# US States
US_STATES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming',
}


@dataclass
class Provider:
    """Data class for provider information."""
    businessName: str
    providerName: str = ''
    specialties: str = ''
    addressLine1: str = ''
    city: str = ''
    state: str = ''
    zip: str = ''
    phone: str = ''
    website: str = ''
    description: str = ''
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = 'PENDING'
    source: str = ''

    def to_dict(self) -> Dict:
        """Convert to dictionary, excluding source field."""
        data = asdict(self)
        data.pop('source', None)
        return data


class ProviderScraper:
    """Scrape healthcare provider information from multiple real APIs."""
    
    def __init__(self, output_file: str = 'scraped_providers.csv'):
        self.output_file = output_file
        self.providers: Dict[str, Provider] = {}  # Use dict to deduplicate
        self.geocoder = Nominatim(user_agent="finding_health_scraper")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # API Keys
        self.google_api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        self.yelp_api_key = os.getenv('YELP_API_KEY')
        
        if not self.google_api_key and not self.yelp_api_key:
            logger.warning("No API keys found. Set GOOGLE_MAPS_API_KEY and/or YELP_API_KEY environment variables.")
    
    def generate_provider_key(self, provider: Provider) -> str:
        """Generate a unique key for deduplication."""
        return f"{provider.businessName.lower()}_{provider.city.lower()}_{provider.state.lower()}"
    
    def add_provider(self, provider: Provider):
        """Add provider to collection, avoiding duplicates."""
        key = self.generate_provider_key(provider)
        if key not in self.providers:
            self.providers[key] = provider
            logger.info(f"Added: {provider.businessName} in {provider.city}, {provider.state}")
        else:
            logger.debug(f"Skipped duplicate: {provider.businessName}")
    
    def scrape_google_places(self, specialty: str, state: str = None) -> int:
        """
        Scrape from Google Maps Places API.
        
        Args:
            specialty: Type of provider to search for
            state: Optional state to limit search
        
        Returns:
            Number of providers found
        """
        if not self.google_api_key:
            logger.warning("Google Maps API key not set. Skipping Google Places.")
            return 0
        
        added = 0
        try:
            # Search query
            search_query = f"{specialty} provider"
            if state:
                search_query += f" {state}"
            
            url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            params = {
                'query': search_query,
                'key': self.google_api_key,
                'type': 'health',
            }
            
            logger.info(f"Searching Google Places for '{specialty}' in {state or 'all US'}...")
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data['status'] != 'OK':
                logger.warning(f"Google Places API error: {data.get('status', 'Unknown')}")
                return 0
            
            for result in data.get('results', []):
                try:
                    # Extract phone and website
                    phone = result.get('formatted_phone_number', '').replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
                    
                    # Parse address
                    address_parts = result.get('formatted_address', '').split(',')
                    address_line1 = address_parts[0].strip() if address_parts else ''
                    
                    # Extract city, state, zip from address
                    city, state_code, zip_code = self.parse_address(result.get('formatted_address', ''))
                    
                    if not city or not state_code:
                        logger.debug(f"Skipped {result['name']} - invalid address")
                        continue
                    
                    provider = Provider(
                        businessName=result['name'],
                        specialties=specialty,
                        addressLine1=address_line1,
                        city=city,
                        state=state_code,
                        zip=zip_code,
                        phone=phone,
                        website=result.get('website', ''),
                        latitude=result['geometry']['location']['lat'],
                        longitude=result['geometry']['location']['lng'],
                        source='Google Places'
                    )
                    
                    self.add_provider(provider)
                    added += 1
                    time.sleep(0.5)  # Rate limiting
                    
                except Exception as e:
                    logger.debug(f"Error processing Google result: {e}")
                    continue
            
            logger.info(f"Found {added} providers from Google Places")
            return added
            
        except requests.RequestException as e:
            logger.error(f"Error calling Google Places API: {e}")
            return 0
    
    def scrape_yelp(self, specialty: str, state: str = None) -> int:
        """
        Scrape from Yelp Fusion API.
        
        Args:
            specialty: Type of provider to search for
            state: Optional state to limit search
        
        Returns:
            Number of providers found
        """
        if not self.yelp_api_key:
            logger.warning("Yelp API key not set. Skipping Yelp.")
            return 0
        
        added = 0
        try:
            # Search major cities in state, or nationally
            cities_to_search = self.get_major_cities(state) if state else self.get_major_cities_us()
            
            for city in cities_to_search:
                try:
                    url = "https://api.yelp.com/v3/businesses/search"
                    headers = {'Authorization': f'Bearer {self.yelp_api_key}'}
                    
                    params = {
                        'term': specialty,
                        'location': f"{city}, {state or 'USA'}",
                        'limit': 50,
                        'sort_by': 'rating',
                    }
                    
                    logger.info(f"Searching Yelp for '{specialty}' in {city}...")
                    
                    response = self.session.get(url, headers=headers, params=params, timeout=10)
                    response.raise_for_status()
                    data = response.json()
                    
                    for business in data.get('businesses', []):
                        try:
                            location = business.get('location', {})
                            
                            provider = Provider(
                                businessName=business['name'],
                                specialties=specialty,
                                addressLine1=location.get('address1', ''),
                                city=location.get('city', ''),
                                state=location.get('state', ''),
                                zip=location.get('zip_code', ''),
                                phone=business.get('phone', ''),
                                website=business.get('url', ''),
                                description=f"Yelp Rating: {business.get('rating', 'N/A')}/5 ({business.get('review_count', 0)} reviews)",
                                latitude=business['coordinates']['latitude'],
                                longitude=business['coordinates']['longitude'],
                                source='Yelp'
                            )
                            
                            self.add_provider(provider)
                            added += 1
                            
                        except Exception as e:
                            logger.debug(f"Error processing Yelp result: {e}")
                            continue
                    
                    time.sleep(1)  # Rate limiting between requests
                    
                except requests.RequestException as e:
                    logger.debug(f"Error searching Yelp for {city}: {e}")
                    continue
            
            logger.info(f"Found {added} providers from Yelp")
            return added
            
        except Exception as e:
            logger.error(f"Error with Yelp scraping: {e}")
            return 0
    
    def parse_address(self, formatted_address: str) -> Tuple[str, str, str]:
        """
        Parse formatted address string to extract city, state, zip.
        
        Returns:
            Tuple of (city, state, zip_code)
        """
        try:
            # Format is typically: Street, City, State ZIP
            parts = [p.strip() for p in formatted_address.split(',')]
            
            if len(parts) < 2:
                return '', '', ''
            
            # Last part usually has state and zip
            last_part = parts[-1]
            # Extract state code (2 letters) and zip
            match = re.search(r'([A-Z]{2})\s+(\d{5}(?:-\d{4})?)', last_part)
            
            if match:
                state = match.group(1)
                zip_code = match.group(2)
                city = parts[-2].strip() if len(parts) >= 2 else ''
                return city, state, zip_code
            
            return '', '', ''
        except Exception as e:
            logger.debug(f"Error parsing address: {e}")
            return '', '', ''
    
    def get_major_cities(self, state: str) -> List[str]:
        """Get list of major cities for a state."""
        major_cities = {
            'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
            'TX': ['Houston', 'Austin', 'Dallas', 'San Antonio'],
            'NY': ['New York', 'Buffalo', 'Rochester', 'Albany'],
            'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
            'IL': ['Chicago', 'Springfield', 'Naperville'],
            'CO': ['Denver', 'Boulder', 'Colorado Springs'],
            'WA': ['Seattle', 'Tacoma', 'Spokane'],
            'OR': ['Portland', 'Eugene', 'Salem'],
        }
        return major_cities.get(state, [state])
    
    def get_major_cities_us(self) -> List[str]:
        """Get list of major US cities for national search."""
        return [
            'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
            'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
            'Denver', 'Portland', 'Seattle', 'Austin', 'Miami'
        ]
    
    def geocode_address(self, city: str, state: str) -> Optional[Tuple[float, float]]:
        """Get latitude and longitude for a city."""
        if not city or not state:
            return None
        
        try:
            time.sleep(0.5)  # Rate limiting
            location = self.geocoder.geocode(f"{city}, {state}")
            if location:
                return (location.latitude, location.longitude)
        except GeocoderTimedOut:
            logger.debug(f"Geocoding timeout for {city}, {state}")
        except Exception as e:
            logger.debug(f"Geocoding error for {city}, {state}: {e}")
        
        return None
    
    def scrape_all(self, limit_states: List[str] = None, limit_specialties: List[str] = None):
        """
        Main scraping orchestrator.
        
        Args:
            limit_states: List of state codes to limit scraping (e.g., ['CA', 'NY'])
            limit_specialties: List of specialties to limit scraping
        """
        logger.info("="*60)
        logger.info("Starting provider scraping...")
        logger.info("="*60)
        
        states_to_search = limit_states or list(US_STATES.keys())[:10]  # Default: first 10 states
        specialties_to_search = limit_specialties or SPECIALTIES[:5]  # Default: first 5 specialties
        
        total_before = len(self.providers)
        
        # Scrape from Yelp
        if self.yelp_api_key:
            logger.info("\n--- Scraping Yelp ---")
            for specialty in specialties_to_search:
                for state in states_to_search[:3]:  # Yelp rate limiting
                    self.scrape_yelp(specialty, state)
                    time.sleep(1)
        else:
            logger.warning("Yelp API key not set. Skipping Yelp. Set YELP_API_KEY environment variable.")
        
        # Scrape from Google Places
        if self.google_api_key:
            logger.info("\n--- Scraping Google Places ---")
            for specialty in specialties_to_search:
                self.scrape_google_places(specialty)
                time.sleep(1)
        else:
            logger.warning("Google Maps API key not set. Skipping Google Places. Set GOOGLE_MAPS_API_KEY environment variable.")
        
        if not self.google_api_key and not self.yelp_api_key:
            logger.error("\nERROR: No API keys configured!")
            logger.error("Set GOOGLE_MAPS_API_KEY and/or YELP_API_KEY environment variables.")
            logger.error("\nGet API keys from:")
            logger.error("  - Google Maps: https://cloud.google.com/maps-platform")
            logger.error("  - Yelp: https://www.yelp.com/developers")
            return
        
        # Add missing coordinates via geocoding
        logger.info("\n--- Geocoding addresses ---")
        for provider in list(self.providers.values()):
            if not provider.latitude or not provider.longitude:
                coords = self.geocode_address(provider.city, provider.state)
                if coords:
                    provider.latitude, provider.longitude = coords
        
        total_after = len(self.providers)
        logger.info(f"\nTotal providers collected: {total_after} (new: {total_after - total_before})")
    
    def save_to_csv(self):
        """Save providers to CSV file."""
        if not self.providers:
            logger.error("No providers to save!")
            return False
        
        fieldnames = [
            'businessName', 'providerName', 'specialties', 'addressLine1',
            'city', 'state', 'zip', 'phone', 'website', 'description',
            'latitude', 'longitude', 'status'
        ]
        
        try:
            with open(self.output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                
                for provider in self.providers.values():
                    row = provider.to_dict()
                    # Ensure all fields exist
                    for field in fieldnames:
                        if field not in row:
                            row[field] = ''
                    writer.writerow({field: row.get(field, '') for field in fieldnames})
            
            logger.info(f"Successfully saved {len(self.providers)} providers to {self.output_file}")
            return True
        except Exception as e:
            logger.error(f"Error saving CSV: {e}")
            return False
    
    def validate_provider(self, provider: Provider) -> Tuple[bool, List[str]]:
        """Validate provider data before saving."""
        errors = []
        
        required_fields = ['businessName', 'city', 'state']
        for field in required_fields:
            value = getattr(provider, field, None)
            if not value:
                errors.append(f"Missing required field: {field}")
        
        if provider.state and provider.state.upper() not in US_STATES:
            errors.append(f"Invalid state: {provider.state}")
        
        if provider.phone and not re.match(r'^\+?1?\d{10,}$', provider.phone.replace('-', '')):
            errors.append(f"Invalid phone format: {provider.phone}")
        
        return len(errors) == 0, errors


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Scrape holistic healthcare providers from real APIs'
    )
    parser.add_argument(
        '--output', '-o',
        default='scraped_providers.csv',
        help='Output CSV file path (default: scraped_providers.csv)'
    )
    parser.add_argument(
        '--states', '-s',
        nargs='+',
        help='Limit to specific states (e.g., CA NY TX)'
    )
    parser.add_argument(
        '--specialties', '-sp',
        nargs='+',
        help='Limit to specific specialties (e.g., "Acupuncture" "Massage Therapy")'
    )
    
    args = parser.parse_args()
    
    # Validate state codes
    if args.states:
        invalid_states = [s.upper() for s in args.states if s.upper() not in US_STATES]
        if invalid_states:
            logger.error(f"Invalid state codes: {invalid_states}")
            sys.exit(1)
        args.states = [s.upper() for s in args.states]
    
    scraper = ProviderScraper(output_file=args.output)
    scraper.scrape_all(limit_states=args.states, limit_specialties=args.specialties)
    
    if scraper.save_to_csv():
        logger.info("\n" + "="*60)
        logger.info("SCRAPING COMPLETE")
        logger.info("="*60)
        logger.info(f"Output file: {args.output}")
        logger.info(f"Total providers: {len(scraper.providers)}")
        logger.info("\nNEXT STEPS:")
        logger.info("1. Review the CSV file and verify provider information")
        logger.info("2. Edit entries as needed - fix errors or add missing info")
        logger.info("3. Change status from 'PENDING' to 'APPROVED' for providers to add")
        logger.info("4. Import the CSV through the admin panel at /admin/import")
        logger.info("\nSTATUS VALUES:")
        logger.info("  PENDING  - Default status; providers won't appear on site")
        logger.info("  APPROVED - Provider is visible and searchable on the site")
        logger.info("  REJECTED - Provider was rejected and won't appear on site")
    else:
        sys.exit(1)


if __name__ == '__main__':
    main()
