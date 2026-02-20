# Provider Scraper - Quick Reference

## Installation (One-time)

```bash
# Install Python dependencies
pip install -r scraper_requirements.txt

# Copy env template and add your API keys
cp .env.example .env
# Edit .env with your Google Maps and Yelp API keys
```

## Get API Keys (Free Tier)

### Google Maps Places API
1. Visit: https://cloud.google.com/console
2. Create new project
3. Enable "Places API"
4. Create API key in Credentials
5. Add to `.env` as `GOOGLE_MAPS_API_KEY`

### Yelp Fusion API
1. Visit: https://www.yelp.com/developers
2. Create account & go to "Manage Apps"
3. Create new app
4. Copy API key to `.env` as `YELP_API_KEY`

## Common Commands

```bash
# Search all specialties in California
python scrape_providers.py --states CA

# Search acupuncture providers nationwide
python scrape_providers.py --specialties "Acupuncture"

# Search multiple states and specialties
python scrape_providers.py \
  --states CA NY TX IL \
  --specialties "Acupuncture" "Massage Therapy" "Chiropractic"

# Custom output file
python scrape_providers.py --output west_coast.csv
```

## Workflow

1. **Run Scraper**: `python scrape_providers.py --states CA`
2. **Review CSV**: Open scraped_providers.csv in Excel
3. **Edit Data**: Fix errors, check phone/website validity
4. **Set Status**: Change to "APPROVED" for providers to add
5. **Import**: Upload CSV through `/admin` → Import Providers

## Provider Status Values

| Status | Meaning |
|--------|---------|
| PENDING | Won't show on site - for manual review |
| APPROVED | Shows on site - searches are available |
| REJECTED | Won't show on site - excluded entries |

## Specialties Included

Acupuncture • Naturopathy • Chiropractic • Functional Medicine • Herbalism • Massage Therapy • Nutritionist • Integrative Medicine • Ayurveda • Homeopathy • Reiki • Traditional Chinese Medicine • Yoga Therapy • Holistic Wellness

## Output Format

CSV with columns:
- businessName, providerName, specialties, addressLine1
- city, state, zip, phone, website, description
- latitude, longitude, status

Ready to import through admin panel!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No API keys found" | Check `.env` file has GOOGLE_MAPS_API_KEY and YELP_API_KEY |
| No results | Verify API keys are valid, try different specialty |
| Too slow | Normal for geocoding - takes 30+ min for 1000+ entries |
| API error | Check Google Cloud/Yelp console - verify APIs enabled |

## Costs (Monthly)

- **Google Maps**: Free tier covers ~100-200 requests (~$7 credit)
  - Additional: $2-7 per 1,000 requests
- **Yelp**: Free tier = 5,000 calls/day (no cost)
- **Total for 1,000 providers**: ~$15-20/month

## Documentation

- Full Guide: [SCRAPER_GUIDE.md](SCRAPER_GUIDE.md)
- Setup Details: [SCRAPER_SETUP.md](SCRAPER_SETUP.md)
- API Docs: Google Maps API • Yelp Fusion API (see SCRAPER_GUIDE.md for links)

## Pro Tips

- Start with one state to test data quality
- Always review provider data before approving
- Run monthly to find new providers
- Use relevant specialties (narrower = better results)
- Check phone numbers and websites are valid before approval
