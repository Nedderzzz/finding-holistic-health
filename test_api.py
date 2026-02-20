#!/usr/bin/env python3
"""Quick test of Google Places API"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GOOGLE_MAPS_API_KEY')

# Test with a very simple, known query
url = "https://maps.googleapis.com/maps/api/place/textsearch/json"

test_queries = [
    "Functional Medicine Los Angeles CA",
    "Functional Medicine doctor Los Angeles CA",
    "Naturopathic doctor Los Angeles CA",
    "Chiropractor Los Angeles CA",
    "Acupuncture Los Angeles CA",
]

print(f"API Key: {api_key[:20]}...")
print("\nTesting queries:\n")

for query in test_queries:
    params = {
        'query': query,
        'key': api_key,
    }
    
    print(f"Query: '{query}'")
    response = requests.get(url, params=params, timeout=10)
    data = response.json()
    
    print(f"  Status: {data.get('status')}")
    print(f"  Results: {len(data.get('results', []))}")
    
    if data.get('error_message'):
        print(f"  Error: {data.get('error_message')}")
    
    if len(data.get('results', [])) > 0:
        print(f"  First result: {data['results'][0].get('name')}")
    
    print()
