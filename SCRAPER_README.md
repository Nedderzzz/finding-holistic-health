# Provider Scraping & Management System

## Overview
This system scrapes healthcare provider data from Google Places API and manages it through a master CSV file for your website.

## Files
- **scrape_providers.py** - Scrapes providers from Google Places API
- **merge_providers.py** - Merges scraped CSVs into master file
- **data/scraped/** - Individual scraper runs (timestamped)
- **data/providers_master.csv** - Master file for the website
- **.env** - Contains GOOGLE_MAPS_API_KEY

## Workflow

### 1. Scrape Providers

```bash
# Scrape all specialties from all states (80% Functional Medicine/Naturopathy, 20% others)
python scrape_providers.py

# Scrape specific states
python scrape_providers.py --states CA TX FL

# Scrape specific specialties
python scrape_providers.py --specialties "Functional Medicine" "Acupuncture"

# Combine options
python scrape_providers.py --states CA NY --specialties "Naturopathy"
```

**Output:** Saves to `data/scraped/providers_YYYYMMDD_HHMMSS.csv`

### 2. Merge to Master CSV

```bash
# Merge all CSVs in data/scraped/
python merge_providers.py

# Merge a specific CSV
python merge_providers.py --file data/scraped/providers_20260220_105804.csv
```

**Output:** Updates `data/providers_master.csv` with new providers (skips duplicates)

### 3. Review & Approve

1. Open `data/providers_master.csv` in Excel or text editor
2. Review provider information
3. Change `status` from `PENDING` to `APPROVED` for providers you want on the site
4. Save the file

### 4. Import to Website

- Go to `/admin/import` in your browser
- Upload the CSV file
- Providers with status=APPROVED will appear on the site

## Provider Status Values

- **PENDING** - Default; won't appear on site (use for review)
- **APPROVED** - Visible and searchable on the website
- **REJECTED** - Won't appear on site (use for bad data)

## Configuration

The scraper is pre-configured with:
- **80%** Functional Medicine & Naturopathy
- **20%** Chiropractic, Acupuncture, and other alternative specialties
- **65%** results from high-population states (CA, TX, FL, NY, etc.)
- **35%** results from lower-population states (CO, MN, SC, etc.)
- City-based searches (5 major cities per state)

## API Rate Limiting

The scraper automatically:
- Waits 1.5 seconds between city searches
- Handles API errors gracefully
- Deduplicates results by business name + location

## Google API Billing

- You have $300 in free credits (90 days)
- Text Search API costs $32 per 1,000 requests
- Each state search = 5 cities × 2 specialties = 10 requests
- Cost per state ≈ $0.32
- Your 50 states ≈ 500 requests ≈ $16 total

## Tips

1. **Review scraped data before merging** - Check the timestamped CSV first
2. **Bulk approve in Excel** - Use find/replace to change PENDING → APPROVED
3. **Run incrementally** - Start with a few states, review, then expand
4. **Master CSV is cumulative** - Each merge adds to it without duplicates
5. **Keep scraped files** - They're your backup and scraping history

## Example Complete Workflow

```bash
# 1. Scrape California and Texas
python scrape_providers.py --states CA TX

# Output: Created data/scraped/providers_20260220_105804.csv (308 providers)

# 2. Merge into master
python merge_providers.py

# Output: Updated data/providers_master.csv (308 total)

# 3. Open in Excel, approve the good ones
# Edit data/providers_master.csv: Change status to APPROVED

# 4. Import through admin panel
# Visit http://localhost:3000/admin/import
# Upload data/providers_master.csv
```

## Troubleshooting

### "No results found"
- Check that billing is enabled in Google Cloud Console
- Verify API key in .env file
- Try running with --states CA (California usually has the most results)

### "Address parsing failed"
- The scraper has improved address parsing that handles most formats
- Check the debug output to see which addresses failed
- You can manually fix addresses in the CSV before importing

### Duplicates appearing
- The scraper deduplicates by: business name + address + state
- Slight variations in names may create duplicates
- Manually remove duplicates from master CSV before importing

## Support

Need help? Check these files:
- SCRAPER_GUIDE.md - Detailed setup instructions
- FIX_API_ERROR.md - API troubleshooting
- SCRAPER_CONFIG.md - Configuration details
