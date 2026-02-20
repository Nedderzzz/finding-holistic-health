#!/usr/bin/env python3
"""
Healthcare Provider Scraper
Scrapes holistic healthcare provider information from Google Maps Places API.

Configuration:
- 80% Functional Medicine & Naturopathy
- 20% Chiropractic & other alternative specialties  
- 65% high population states, 35% lower population states
- Yelp API disabled

Required API Key (set in .env file):
- GOOGLE_MAPS_API_KEY: Get from https://cloud.google.com/maps-platform

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

# Holistic healthcare specialties with weighted distribution
# Primary focus: Functional Medicine & Naturopathy (80%)
PRIMARY_SPECIALTIES = [
    'Functional Medicine',
    'Naturopathy',
]

# Secondary focus: Chiropractic & Alternative (20%)
SECONDARY_SPECIALTIES = [
    'Chiropractic',
    'Acupuncture',
    'Integrative Medicine',
    'Herbalism',
    'Massage Therapy',
    'Traditional Chinese Medicine',
    'Ayurveda',
    'Homeopathy',
]

# All specialties combined
SPECIALTIES = PRIMARY_SPECIALTIES + SECONDARY_SPECIALTIES

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

# High population states (65% of searches)
HIGH_POP_STATES = [
    'CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
    'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MD', 'MO', 'WI'
]

# Lower population states (35% of searches)
LOW_POP_STATES = [
    'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT',
    'IA', 'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'ID', 'WV', 'HI',
    'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'
]
# Major cities by state for targeted searches
STATE_CITIES = {
    'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
    'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
    'FL': ['Miami', 'Tampa', 'Orlando', 'Jacksonville'],
    'NY': ['New York', 'Buffalo', 'Rochester', 'Syracuse'],
    'PA': ['Philadelphia', 'Pittsburgh', 'Allentown'],
    'IL': ['Chicago', 'Aurora', 'Naperville'],
    'OH': ['Columbus', 'Cleveland', 'Cincinnati'],
    'GA': ['Atlanta', 'Augusta', 'Savannah'],
    'NC': ['Charlotte', 'Raleigh', 'Greensboro'],
    'MI': ['Detroit', 'Grand Rapids', 'Ann Arbor'],
    'NJ': ['Newark', 'Jersey City', 'Paterson'],
    'VA': ['Virginia Beach', 'Norfolk', 'Richmond'],
    'WA': ['Seattle', 'Spokane', 'Tacoma'],
    'AZ': ['Phoenix', 'Tucson', 'Mesa'],
    'MA': ['Boston', 'Worcester', 'Springfield'],
    'CO': ['Denver', 'Colorado Springs', 'Aurora'],
    'MN': ['Minneapolis', 'Saint Paul', 'Rochester'],
    'SC': ['Charleston', 'Columbia', 'Greenville'],
    'AL': ['Birmingham', 'Montgomery', 'Mobile'],
    'LA': ['New Orleans', 'Baton Rouge', 'Shreveport'],
    'KY': ['Louisville', 'Lexington', 'Bowling Green'],
    'OR': ['Portland', 'Salem', 'Eugene'],
    'OK': ['Oklahoma City', 'Tulsa', 'Norman'],
    'CT': ['Bridgeport', 'New Haven', 'Hartford'],
    'UT': ['Salt Lake City', 'Provo', 'West Jordan'],
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
    """Scrape healthcare provider information from Google Maps Places API."""
    
    def __init__(self, output_file: str = None):
        # Auto-generate timestamped filename if not provided
        if output_file is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_dir = 'data/scraped'
            os.makedirs(output_dir, exist_ok=True)
            output_file = f"{output_dir}/providers_{timestamp}.csv"
        
        self.output_file = output_file
        self.providers: Dict[str, Provider] = {}  # Use dict to deduplicate
        self.existing_keys: set = set()  # Keys from previous scrapes
        self.geocoder = Nominatim(user_agent="finding_health_scraper")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # API Key
        self.google_api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        
        if not self.google_api_key:
            logger.warning("Google Maps API key not found. Set GOOGLE_MAPS_API_KEY environment variable.")
        
        # Load existing providers from master CSV to avoid duplicates
        self._load_existing_providers()
    
    def _load_existing_providers(self):
        """Load existing providers from master CSV to avoid duplicates."""
        master_csv = 'data/providers_master.csv'
        
        if not os.path.exists(master_csv):
            logger.info("No existing master CSV found - will create new one")
            return
        
        try:
            with open(master_csv, 'r', encoding='utf-8', newline='') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Generate key same way as generate_provider_key
                    business = row.get('businessName', '').lower().strip()
                    city = row.get('city', '').lower().strip()
                    state = row.get('state', '').upper().strip()
                    
                    if business and city and state:
                        key = f"{business}_{city}_{state}"
                        self.existing_keys.add(key)
            
            logger.info(f"Loaded {len(self.existing_keys)} existing providers from master CSV - will skip duplicates")
        except Exception as e:
            logger.warning(f"Could not load existing providers: {e}")
    
    def generate_provider_key(self, provider: Provider) -> str:
        """Generate a unique key for deduplication."""
        return f"{provider.businessName.lower()}_{provider.city.lower()}_{provider.state.lower()}"
    
    def add_provider(self, provider: Provider):
        """Add provider to collection, avoiding duplicates from current run and previous scrapes."""
        key = self.generate_provider_key(provider)
        
        # Check if already exists in previous scrapes
        if key in self.existing_keys:
            logger.debug(f"Skipped (already scraped): {provider.businessName}")
            return
        
        # Check if already added in this run
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
        
        # Get cities for this state
        cities = STATE_CITIES.get(state, [state])  # Fall back to state name if no cities defined
        
        added = 0
        try:
            for city in cities:
                # Search in specific city
                search_query = f"{specialty} {city} {state}"
                url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                params = {
                    'query': search_query,
                    'key': self.google_api_key,
                }
                
                logger.info(f"Searching: '{search_query}'...")
                
                response = self.session.get(url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                logger.info(f"  API Status: {data.get('status')}, Results: {len(data.get('results', []))}")
                
                if data['status'] != 'OK':
                    if data['status'] == 'ZERO_RESULTS':
                        logger.debug(f"No results for: {search_query}")
                    else:
                        logger.warning(f"Google Places API error: {data.get('status', 'Unknown')}")
                    continue
                
                for result in data.get('results', []):
                    try:
                        logger.debug(f"Processing: {result.get('name', 'Unknown')}")
                        
                        # Extract phone and website (may not be in text search results)
                        phone = result.get('formatted_phone_number', '').replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
                        
                        # Parse address
                        address_parts = result.get('formatted_address', '').split(',')
                        address_line1 = address_parts[0].strip() if address_parts else ''
                        
                        # Extract city, state, zip from address
                        parsed_city, state_code, zip_code = self.parse_address(result.get('formatted_address', ''))
                        
                        logger.debug(f"  Address parsed - City: {parsed_city}, State: {state_code}, Zip: {zip_code}")
                        
                        if not parsed_city or not state_code:
                            logger.debug(f"  Skipped {result.get('name')} - invalid address")
                            continue
                        
                        provider = Provider(
                            businessName=result['name'],
                            specialties=specialty,
                            addressLine1=address_line1,
                            city=parsed_city,
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
                        
                    except Exception as e:
                        logger.debug(f"Error processing Google result: {e}")
                        continue
                
                time.sleep(1.5)  # Rate limiting between city searches
            
            logger.info(f"Found {added} providers total from Google Places")
            return added
            
        except requests.RequestException as e:
            logger.error(f"Error calling Google Places API: {e}")
            return 0
    
    def parse_address(self, formatted_address: str) -> Tuple[str, str, str]:
        """
        Parse formatted address string to extract city, state, zip.
        
        Returns:
            Tuple of (city, state, zip_code)
        """
        try:
            logger.debug(f"    Parsing address: {formatted_address}")
            
            # Format is typically: Street, City, State ZIP, Country
            parts = [p.strip() for p in formatted_address.split(',')]
            
            if len(parts) < 2:
                return '', '', ''
            
            # Last part usually has state and zip (or just USA)
            # Second to last usually has "State ZIP"
            state_zip_part = parts[-2] if len(parts) >= 3 else parts[-1]
            
            # Extract state code (2 letters) and zip - case insensitive
            match = re.search(r'([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)', state_zip_part)
            
            if match:
                state = match.group(1).upper()
                zip_code = match.group(2)
                # City is the part before state_zip_part
                city_index = parts.index(state_zip_part) - 1
                city = parts[city_index].strip() if city_index >= 0 and city_index < len(parts) else ''
                logger.debug(f"    Extracted - City: {city}, State: {state}, Zip: {zip_code}")
                return city, state, zip_code
            
            return '', '', ''
        except Exception as e:
            logger.debug(f"    Error parsing address: {e}")
            return '', '', ''
    
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
    
    def get_weighted_states(self, limit_states: List[str] = None) -> List[str]:
        """
        Get weighted list of states (65% high pop, 35% low pop).
        
        Args:
            limit_states: Optional list to limit states
            
        Returns:
            Weighted list of state codes
        """
        if limit_states:
            return limit_states
        
        # Select subset of states with 65% high-pop, 35% low-pop distribution
        # Use 20 total states: 13 high-pop (65%), 7 low-pop (35%)
        total_states = 20
        high_pop_count = int(total_states * 0.65)  # 13 states
        low_pop_count = total_states - high_pop_count  # 7 states
        
        weighted_states = HIGH_POP_STATES[:high_pop_count] + LOW_POP_STATES[:low_pop_count]
        return weighted_states
    
    def get_weighted_specialties(self, limit_specialties: List[str] = None) -> Dict[str, int]:
        """
        Get weighted specialty distribution (80% primary, 20% secondary).
        
        Args:
            limit_specialties: Optional list to limit specialties
            
        Returns:
            Dict of specialty -> number of searches to perform
        """
        if limit_specialties:
            # Use provided specialties with equal weight
            return {s: 1 for s in limit_specialties}
        
        # 80% primary (Functional Medicine & Naturopathy)
        # 20% secondary (split among others)
        specialty_weights = {}
        
        # Each primary specialty gets 40% (80% / 2 specialties)
        for specialty in PRIMARY_SPECIALTIES:
            specialty_weights[specialty] = 4  # 4 searches per state
        
        # Each secondary specialty gets ~2.5% (20% / 8 specialties)
        for specialty in SECONDARY_SPECIALTIES:
            specialty_weights[specialty] = 1  # 1 search per state
        
        return specialty_weights
    
    def scrape_all(self, limit_states: List[str] = None, limit_specialties: List[str] = None):
        """
        Main scraping orchestrator with weighted distribution.
        
        Args:
            limit_states: List of state codes to limit scraping (e.g., ['CA', 'NY'])
            limit_specialties: List of specialties to limit scraping
        """
        logger.info("="*60)
        logger.info("Starting provider scraping...")
        logger.info("="*60)
        
        if not self.google_api_key:
            logger.error("\nERROR: Google Maps API key not configured!")
            logger.error("Set GOOGLE_MAPS_API_KEY environment variable.")
            logger.error("\nGet API key from: https://cloud.google.com/maps-platform")
            logger.error("\nAPI Restrictions to set:")
            logger.error("  1. Application restrictions: None (or HTTP referrers if hosted)")
            logger.error("  2. API restrictions: Restrict to 'Places API'")
            return
        
        states_to_search = self.get_weighted_states(limit_states)
        specialty_weights = self.get_weighted_specialties(limit_specialties)
        
        logger.info(f"\nSearching {len(states_to_search)} states")
        logger.info(f"High population states (65%): {', '.join(states_to_search[:13])}")
        logger.info(f"Lower population states (35%): {', '.join(states_to_search[13:])}")
        logger.info(f"\nSpecialty distribution:")
        logger.info(f"  Primary (80%): {', '.join(PRIMARY_SPECIALTIES)}")
        logger.info(f"  Secondary (20%): {', '.join(SECONDARY_SPECIALTIES[:3])}...")
        
        total_before = len(self.providers)
        
        # Scrape from Google Places with weighted distribution
        logger.info("\n--- Scraping Google Places ---")
        
        for state in states_to_search:
            logger.info(f"\n=> Searching {state} ({US_STATES.get(state, state)})")
            
            for specialty, search_count in specialty_weights.items():
                for i in range(search_count):
                    try:
                        self.scrape_google_places(specialty, state)
                        time.sleep(1.5)  # Rate limiting
                    except Exception as e:
                        logger.error(f"Error scraping {specialty} in {state}: {e}")
                        continue
        
        # Add missing coordinates via geocoding
        logger.info("\n--- Geocoding addresses ---")
        geocoded = 0
        for provider in list(self.providers.values()):
            if not provider.latitude or not provider.longitude:
                coords = self.geocode_address(provider.city, provider.state)
                if coords:
                    provider.latitude, provider.longitude = coords
                    geocoded += 1
        
        logger.info(f"Geocoded {geocoded} addresses")
        
        total_after = len(self.providers)
        logger.info(f"\nTotal providers collected: {total_after} (new: {total_after - total_before})")
        
        # Show specialty breakdown
        specialty_counts = {}
        for provider in self.providers.values():
            spec = provider.specialties
            specialty_counts[spec] = specialty_counts.get(spec, 0) + 1
        
        logger.info("\n--- Specialty Breakdown ---")
        for specialty, count in sorted(specialty_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / total_after * 100) if total_after > 0 else 0
            logger.info(f"  {specialty}: {count} ({percentage:.1f}%)")
    
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
        description='Scrape holistic healthcare providers from Google Maps API'
    )
    parser.add_argument(
        '--output', '-o',
        default=None,
        help='Output CSV file path (default: auto-generated timestamped file in data/scraped/)'
    )
    parser.add_argument(
        '--states', '-s',
        nargs='+',
        help='Limit to specific states (e.g., CA NY TX)'
    )
    parser.add_argument(
        '--specialties', '-sp',
        nargs='+',
        help='Limit to specific specialties (e.g., "Functional Medicine" "Naturopathy")'
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
