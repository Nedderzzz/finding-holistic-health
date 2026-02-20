#!/usr/bin/env python3
"""
Provider CSV Merge Script
Merges all scraped provider CSVs into a master providers file.

Usage:
    python merge_providers.py                    # Merge all CSVs in data/scraped/
    python merge_providers.py --file data/scraped/providers_20260220_120000.csv  # Merge specific file
"""

import csv
import os
import sys
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Set

# Configure paths
SCRAPED_DIR = Path('data/scraped')
MASTER_CSV = Path('data/providers_master.csv')

# CSV Headers
HEADERS = [
    'businessName', 'providerName', 'specialties', 'addressLine1', 'addressLine2',
    'city', 'state', 'zip', 'phone', 'website', 'description',
    'latitude', 'longitude', 'status'
]


def generate_provider_key(row: Dict[str, str]) -> str:
    """Generate unique key for deduplication based on business name and location."""
    business = row.get('businessName', '').lower().strip()
    city = row.get('city', '').lower().strip()
    state = row.get('state', '').upper().strip()
    address = row.get('addressLine1', '').lower().strip()
    
    # Use address if available, otherwise city+state
    if address:
        return f"{business}_{address}_{state}"
    return f"{business}_{city}_{state}"


def load_existing_providers(master_path: Path) -> tuple[Dict[str, Dict], Set[str]]:
    """Load existing providers from master CSV."""
    providers = {}
    keys = set()
    
    if not master_path.exists():
        print(f"No existing master CSV found at {master_path}")
        return providers, keys
    
    try:
        with open(master_path, 'r', encoding='utf-8', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = generate_provider_key(row)
                keys.add(key)
                providers[key] = row
        
        print(f"Loaded {len(providers)} existing providers from master CSV")
        return providers, keys
        
    except Exception as e:
        print(f"Error loading master CSV: {e}")
        return providers, keys


def merge_csv_file(csv_path: Path, existing_keys: Set[str]) -> tuple[list, int, int]:
    """
    Merge a single CSV file.
    
    Returns:
        (new_providers, added_count, skipped_count)
    """
    new_providers = []
    added = 0
    skipped = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8', newline='') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                key = generate_provider_key(row)
                
                if key in existing_keys:
                    skipped += 1
                else:
                    # Ensure all required fields exist
                    complete_row = {header: row.get(header, '') for header in HEADERS}
                    new_providers.append(complete_row)
                    existing_keys.add(key)
                    added += 1
        
        print(f"  Processed {csv_path.name}: {added} new, {skipped} duplicates")
        return new_providers, added, skipped
        
    except Exception as e:
        print(f"  Error processing {csv_path.name}: {e}")
        return [], 0, 0


def write_master_csv(master_path: Path, all_providers: list):
    """Write all providers to master CSV."""
    try:
        # Create directory if needed
        master_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(master_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=HEADERS)
            writer.writeheader()
            writer.writerows(all_providers)
        
        print(f"\n✅ Master CSV updated: {master_path}")
        print(f"   Total providers: {len(all_providers)}")
        
    except Exception as e:
        print(f"Error writing master CSV: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description='Merge provider CSVs into master file')
    parser.add_argument('--file', help='Specific CSV file to merge (otherwise merges all in data/scraped/)')
    parser.add_argument('--master', default=str(MASTER_CSV), help='Path to master CSV file')
    args = parser.parse_args()
    
    master_path = Path(args.master)
    
    print("=" * 60)
    print("Provider CSV Merge Tool")
    print("=" * 60)
    
    # Load existing providers
    existing_providers, existing_keys = load_existing_providers(master_path)
    
    # Determine which files to merge
    if args.file:
        csv_files = [Path(args.file)]
        print(f"\nMerging single file: {args.file}")
    else:
        if not SCRAPED_DIR.exists():
            print(f"\n❌ Scraped directory not found: {SCRAPED_DIR}")
            print("   Run the scraper first: python scrape_providers.py")
            sys.exit(1)
        
        csv_files = sorted(SCRAPED_DIR.glob('providers_*.csv'))
        print(f"\nFound {len(csv_files)} CSV files in {SCRAPED_DIR}")
    
    if not csv_files:
        print("No CSV files to merge")
        sys.exit(0)
    
    # Merge all files
    total_added = 0
    total_skipped = 0
    all_new_providers = []
    
    print("\nMerging files:")
    for csv_file in csv_files:
        new_providers, added, skipped = merge_csv_file(csv_file, existing_keys)
        all_new_providers.extend(new_providers)
        total_added += added
        total_skipped += skipped
    
    # Combine existing + new providers
    all_providers = list(existing_providers.values()) + all_new_providers
    
    # Write master CSV
    if all_new_providers:
        write_master_csv(master_path, all_providers)
        print(f"\nSummary:")
        print(f"  New providers added: {total_added}")
        print(f"  Duplicates skipped: {total_skipped}")
    else:
        print(f"\n✅ No new providers to add (all {total_skipped} were duplicates)")
    
    print("\n" + "=" * 60)


if __name__ == '__main__':
    main()
