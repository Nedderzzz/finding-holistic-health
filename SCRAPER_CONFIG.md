# Provider Scraper - Updated Configuration

## Current Configuration

### Specialty Distribution (as requested)
- **Primary Specialties (80%)**: Functional Medicine, Naturopathy
- **Secondary Specialties (20%)**: Chiropractic, Acupuncture, Integrative Medicine, and others

### State Distribution (as requested)  
- **High Population States (65%)**: CA, TX, FL, NY, PA, IL, OH, GA, NC, MI, NJ, VA, WA, AZ, MA, TN, IN, MD, MO, WI
- **Lower Population States (35%)**: CO, MN, SC, AL, LA, KY, OR, OK, CT, UT, and others

### API Configuration
- **Google Maps Places API**: ✅ Active
- **Yelp Fusion API**: ❌ Disabled (not being used)

## Google Maps API Setup

### API Key (Already Configured)
```
AIzaSyCd1qE8v_7deXzdg-Ua-yKtpd_abYK27Ko
```

### Required API Restrictions

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. **Application restrictions**: 
   - Select "None" (or "HTTP referrers" if deploying to web)
   
2. **API restrictions**:
   - Select "Restrict key"
   - Check **"Places API"** only
   - Save

This prevents unauthorized use while allowing the scraper to work.

## Quick Start

```bash
# Install dependencies (one-time)
pip install -r scraper_requirements.txt

# Run scraper with default weighted distribution
python scrape_providers.py

# Output: scraped_providers.csv with ~80% Functional Medicine/Naturopathy
```

## What the Script Does

### Weighted Searches
- Each **high population state** gets:
  - 8 searches for Functional Medicine
  - 8 searches for Naturopathy  
  - 2 searches for each secondary specialty
  
- Each **low population state** gets the same ratio but fewer total states searched

### Expected Results
- **Total providers**: 500-1,500+ depending on API responses
- **Functional Medicine**: ~40% of results
- **Naturopathy**: ~40% of results
- **Chiropractic & Others**: ~20% of results
- **State distribution**: ~65% from high pop states, ~35% from low pop states

## Usage Examples

```bash
# Default: All states with weighted distribution
python scrape_providers.py

# Specific states only (still applies 80/20 specialty split)
python scrape_providers.py --states CA TX NY FL

# Specific specialties only
python scrape_providers.py --specialties "Functional Medicine" "Naturopathy"

# Custom output file
python scrape_providers.py --output my_providers.csv
```

## Next Steps

1. **Run the scraper**: `python scrape_providers.py`
2. **Review CSV**: Check scraped_providers.csv in Excel
3. **Verify distribution**: Should see ~80% Functional Medicine/Naturopathy
4. **Approve entries**: Change status to "APPROVED" for providers to add
5. **Import**: Upload through admin panel at `/admin`

## Troubleshooting

### "API key not valid"
- Verify API restrictions in Google Cloud Console
- Ensure "Places API" is enabled
- Check for typos in .env file

### "Quota exceeded"  
- Google free tier: ~$7/month credit = 100-200 requests
- Wait for quota reset or upgrade to paid tier
- Consider running fewer states at once

### Script runs but no results
- Check internet connection
- Verify API key is correct
- Try running with single state: `python scrape_providers.py --states CA`

## Cost Estimate

With your weighted distribution:
- **Per state**: ~100 API requests (80 primary + 20 secondary)
- **All 20 high-pop states**: ~2,000 requests = ~$10-15
- **All states**: ~5,000 requests = ~$25-35

**Recommendation**: Start with a few states to test, then scale up.

## Files Created

- `.env` - Your API key (don't commit to git!)
- `scraped_providers.csv` - Output file (review before importing)

## Status Values Reminder

- **PENDING**: Default - won't show on site (for review)
- **APPROVED**: Will show on site (set this after reviewing)
- **REJECTED**: Won't show on site (for bad entries)
