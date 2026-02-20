# Healthcare Provider Web Scraper Guide

This script scrapes real healthcare provider data from multiple APIs and generates a CSV file for review before importing into your site.

## Features

- **Multi-API Support**: Scrapes from Google Maps Places API and Yelp Fusion API
- **Deduplication**: Automatically removes duplicate providers
- **Geocoding**: Adds latitude/longitude coordinates to all providers
- **Filtering**: Search by state and specialty
- **Manual Review**: All providers start as PENDING for your review before approval

## Setup

### 1. Install Dependencies

```bash
pip install requests geopy python-dotenv
```

### 2. Get API Keys

#### Google Maps API
1. Go to [Google Cloud Console](https://cloud.google.com/console)
2. Create a new project
3. Enable these APIs:
   - Places API
   - Maps JavaScript API
4. Create an API key (Credentials > Create Credentials > API Key)
5. Copy the key to your `.env` file

#### Yelp Fusion API
1. Go to [Yelp Developers](https://www.yelp.com/developers)
2. Create an account or sign in
3. Go to [Manage Apps](https://www.yelp.com/developers/v3/manage_app)
4. Create a new app
5. Copy the API key to your `.env` file

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
GOOGLE_MAPS_API_KEY=your_key_here
YELP_API_KEY=your_key_here
```

Or use the provided `.env.example` as a template:

```bash
cp .env.example .env
# Then edit .env with your API keys
```

## Usage

### Basic Usage - Search All Specialties in Top 10 States

```bash
python scrape_providers.py
```

This generates `scraped_providers.csv` with providers across multiple specialties and states.

### Search Specific States

```bash
python scrape_providers.py --states CA NY TX IL
```

### Search Specific Specialties

```bash
python scrape_providers.py --specialties "Acupuncture" "Massage Therapy" "Chiropractic"
```

### Custom Output File

```bash
python scrape_providers.py --output my_providers.csv
```

### Combine Options

```bash
python scrape_providers.py \
  --states CA CO OR WA \
  --specialties "Naturopathy" "Functional Medicine" \
  --output west_coast_providers.csv
```

## Workflow

### Step 1: Scrape Data
```bash
python scrape_providers.py --states IL CA TX
```

### Step 2: Review CSV
- Open `scraped_providers.csv` in Excel or Google Sheets
- Review provider information
- Fix any errors or missing data
- Add descriptions or notes if needed

### Step 3: Set Status
- Change status from `PENDING` to `APPROVED` for providers you want to add
- Keep as `PENDING` if you want to review later
- Set to `REJECTED` if you don't want the provider on your site

### Step 4: Import
1. Go to Admin Panel: `/admin`
2. Click "Import Providers"
3. Upload your edited CSV file
4. Review the import summary

## CSV Format

The output CSV has these columns (matching your import requirements):

| Column | Required | Description |
|--------|----------|-------------|
| businessName | Yes | Provider/clinic name |
| providerName | No | Individual practitioner name |
| specialties | No | Semicolon-separated list (e.g., "Acupuncture;TCM") |
| addressLine1 | No | Street address |
| city | Yes | City name |
| state | Yes | 2-letter state code (CA, NY, etc.) |
| zip | No | ZIP code |
| phone | No | Contact phone |
| website | No | Website URL |
| description | No | About the provider |
| latitude | No | Geographic latitude (auto-filled) |
| longitude | No | Geographic longitude (auto-filled) |
| status | No | PENDING, APPROVED, or REJECTED |

## Status Values

- **PENDING**: Default status. Providers won't appear on your site. Use this for entries you want to review manually before approving.
- **APPROVED**: Providers are visible and searchable on your site. This is the status needed for live providers.
- **REJECTED**: Providers won't appear on your site. Use this for duplicates or unsuitable entries.

## Supported Specialties

The scraper searches for these holistic healthcare specialties:

- Acupuncture
- Naturopathy
- Chiropractic
- Functional Medicine
- Herbalism
- Massage Therapy
- Nutritionist
- Integrative Medicine
- Ayurveda
- Homeopathy
- Reiki
- Traditional Chinese Medicine
- Yoga Therapy
- Holistic Wellness

## Rate Limiting

The script includes rate limiting to respect API quotas:
- 0.5-second delay between API requests
- 1-second delay between city searches
- Geopy (geocoding) has built-in rate limiting

## Troubleshooting

### "No API keys found" Error
```bash
# Set environment variables:
# Option 1: Create .env file with GOOGLE_MAPS_API_KEY and YELP_API_KEY
# Option 2: Set as system environment variables
```

### API Errors
- Check that API keys are valid and not expired
- Verify APIs are enabled in your Google Cloud project
- Check your API rate limits and quotas

### No Results Found
- Verify you have API key(s) configured
- Try searching for different specialties
- Check that your state codes are valid (2-letter codes)

### Duplicate Entries
The script automatically deduplicates based on business name, city, and state. If you see duplicates in the CSV, they likely have slightly different names or addresses.

## Tips

1. **Start Small**: Test with one state first to understand the data quality
2. **Manual Review**: Always review scraped data before approving - web data can have errors
3. **Batch Processing**: For national coverage, run multiple times with different state combinations
4. **Regular Updates**: Run periodically to find new providers in your area
5. **Quality Control**: Check phone numbers, websites, and addresses before approving

## Example Workflow

```bash
# 1. Find all acupuncture providers in California
python scrape_providers.py \
  --states CA \
  --specialties "Acupuncture" \
  --output ca_acupuncture.csv

# 2. Open ca_acupuncture.csv and review/edit entries

# 3. Update status to APPROVED for good entries

# 4. Upload through admin panel at /admin

# 5. Repeat for other specialties/regions
```

## Performance

- Google Places: ~50 results per search
- Yelp: ~50 results per city search
- Full national search: Can take 15-30+ minutes depending on API response times
- Geocoding: ~30+ minutes for 1000 addresses due to rate limiting

## API Limits

### Google Maps Places API
- Free tier: $7 credit/month = ~100-200 requests
- Paid tier: $2-7 per 1000 requests

### Yelp Fusion API
- Free tier: 5,000 calls/day
- Commercial use requires agreement

## Support

For API issues:
- [Google Maps API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Yelp Fusion API Docs](https://www.yelp.com/developers/documentation/v3)

For scraper issues, check the logs for detailed error messages.
