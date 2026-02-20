# Google Maps API Setup - Fix "REQUEST_DENIED" Error

## Issue
The scraper is getting `REQUEST_DENIED` from Google Places API. This means the API key needs proper configuration.

## Your API Key
```
AIzaSyCd1qE8v_7deXzdg-Ua-yKtpd_abYK27Ko
```

## Solution: Enable Places API and Set Restrictions

### Step 1: Enable Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if you don't have one)
3. Go to **APIs & Services** → **Library**
4. Search for **"Places API"**
5. Click on it and press **"Enable"**
6. Also enable **"Geocoding API"** (same process)

### Step 2: Configure API Key Restrictions

1. Go to **APIs & Services** → **Credentials**
2. Find your API key: `AIzaSyCd1qE8v_7deXzdg-Ua-yKtpd_abYK27Ko`
3. Click the edit icon (pencil) next to it

#### Application Restrictions
Set to **"None"** (or select "HTTP referrers" if deploying to web later)

#### API Restrictions
1. Select **"Restrict key"**
2. Check these APIs:
   - ✅ **Places API**  
   - ✅ **Geocoding API** (for address lookups)
   - ✅ **Maps JavaScript API** (optional, for displaying maps)

3. Click **"Save"**

### Step 3: Wait 1-2 Minutes
Changes can take a minute or two to propagate.

### Step 4: Test Again

```bash
python scrape_providers.py --states CA --specialties "Functional Medicine" --output test.csv
```

## Expected Results

If successful, you'll see:
```
Searching Google Places for 'Functional Medicine' in CA...
Found X providers from Google Places
Added: [Provider Name] in [City], CA
...
Successfully saved X providers to test.csv
```

## Troubleshooting

### Still Getting REQUEST_DENIED?
- Verify "Places API" is enabled (green checkmark)
- Check billing is enabled (Google requires it even for free tier)
- Wait 2-5 minutes for changes to propagate
- Try creating a new API key

### "Billing not enabled" Error?
1. Go to **Billing** in Google Cloud Console
2. Link a payment method (credit card)
3. You won't be charged if you stay within free tier ($200/month credit for first 90 days)
4. Free tier includes $7/month ongoing credit

### API Quota Exceeded?
- Free tier: ~100-200 requests/month included
- Monitor usage in Google Cloud Console → APIs & Services → Dashboard
- Consider paid tier for more requests (~$2-7 per 1,000 requests)

## After Setup Works

Once the scraper works with a test run, you can run it for real:

```bash
# Full run with all weighted states and specialties (will take 30-60 min)
python scrape_providers.py

# Or start with a few states
python scrape_providers.py --states CA TX NY FL
```

## API Restrictions Summary

✅ **Recommended Settings:**
- Application restrictions: None
- API restrictions: Places API, Geocoding API
- Billing: Enabled (required by Google)
- Usage limits: Monitor in Cloud Console

This prevents unauthorized use while allowing your scraper to work.
