"""
Database Data Loader Script
Loads campaign_dataset_refined.csv into PostgreSQL database
Creates dummy tenant, customers, purchases, and Diwali campaign with engagement history
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection parameters - automatically loads from .env file
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'postgres'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'port': int(os.getenv('DB_PORT', 5432))
}

ssl_mode = os.getenv('DB_SSLMODE')
ssl_root_cert = os.getenv('DB_SSLROOTCERT')
connect_timeout = os.getenv('DB_CONNECT_TIMEOUT')

if ssl_mode:
    DB_CONFIG['sslmode'] = ssl_mode

if ssl_root_cert:
    cert_path = ssl_root_cert
    if not os.path.isabs(cert_path):
        cert_path = str((Path(__file__).resolve().parent / cert_path).resolve())
    DB_CONFIG['sslrootcert'] = cert_path

if connect_timeout:
    DB_CONFIG['connect_timeout'] = int(connect_timeout)

def connect_db():
    """Create database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        print("✓ Connected to PostgreSQL database")
        return conn
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        raise

def load_csv_data(csv_path):
    """Load and validate CSV data"""
    try:
        df = pd.read_csv(csv_path)
        print(f"✓ Loaded CSV with {len(df)} rows")
        return df
    except Exception as e:
        print(f"✗ Failed to load CSV: {e}")
        raise

def create_tenant(cursor):
    """Create a demo tenant and return tenant_id"""
    cursor.execute("""
        INSERT INTO jenita_dev.tenants (tenant_name)
        VALUES ('Demo Store')
        ON CONFLICT DO NOTHING
        RETURNING tenant_id;
    """)
    result = cursor.fetchone()
    
    if result:
        tenant_id = result[0]
    else:
        # Tenant already exists, fetch it
        cursor.execute("SELECT tenant_id FROM jenita_dev.tenants WHERE tenant_name = 'Demo Store';")
        tenant_id = cursor.fetchone()[0]
    
    print(f"✓ Created/Retrieved tenant: {tenant_id}")
    return tenant_id

def sync_customers(cursor, df, tenant_id):
    """Sync customers from CSV to database"""
    # Extract unique customers
    customer_cols = ['customer_id', 'customer_loyalty_status', 'customer_purchase_frequency']
    customers_df = df[customer_cols].drop_duplicates(subset=['customer_id'])
    
    # Prepare customer data with generated emails
    customer_data = []
    for _, row in customers_df.iterrows():
        customer_data.append((
            row['customer_id'],
            tenant_id,
            f"Customer {row['customer_id'][:8]}",  # Name
            f"+91{hash(row['customer_id']) % 10000000000:010d}",  # Phone
            f"customer.{row['customer_id'][:8]}@example.com",  # Email
            row['customer_loyalty_status'],
            "India",  # Address
            int(row['customer_purchase_frequency']),
            None  # segment_tag (will be added dynamically)
        ))
    
    # Insert customers
    insert_query = """
        INSERT INTO jenita_dev.customers 
        (customer_id, tenant_id, customer_name, customer_phone, customer_email, 
         customer_loyalty_status, customer_address, customer_purchase_frequency, segment_tag)
        VALUES %s
        ON CONFLICT (customer_id) DO UPDATE SET
            customer_loyalty_status = EXCLUDED.customer_loyalty_status,
            customer_purchase_frequency = EXCLUDED.customer_purchase_frequency;
    """
    
    execute_values(cursor, insert_query, customer_data)
    print(f"✓ Synced {len(customer_data)} customers")

def sync_purchases(cursor, df, tenant_id):
    """Sync purchase history from CSV to database"""
    purchase_data = []
    
    for _, row in df.iterrows():
        # Parse timestamp
        try:
            timestamp = pd.to_datetime(row['send_timestamp'])
        except:
            timestamp = datetime.now()
        
        purchase_data.append((
            tenant_id,
            row['customer_id'],
            f"ITEM-{hash(row['item']) % 100000:05d}",  # item_id
            row['item'],  # item_name
            row['item_category'],
            float(row['item_price']),
            float(row['discount_given']),
            timestamp
        ))
    
    insert_query = """
        INSERT INTO jenita_dev.purchase_history 
        (tenant_id, customer_id, item_id, item_name, item_category, 
         item_price, discount_given, purchase_timestamp)
        VALUES %s;
    """
    
    execute_values(cursor, insert_query, purchase_data)
    print(f"✓ Synced {len(purchase_data)} purchase records")

def sync_consent(cursor, df, tenant_id):
    """Sync customer consent preferences"""
    consent_data = []
    
    for customer_id in df['customer_id'].unique():
        customer_row = df[df['customer_id'] == customer_id].iloc[0]
        consent_data.append((
            tenant_id,
            customer_id,
            bool(customer_row.get('email_consent', 1)),
            bool(customer_row.get('sms_consent', 1)),
            bool(customer_row.get('whatsapp_consent', 1))
        ))
    
    insert_query = """
        INSERT INTO jenita_dev.consent 
        (tenant_id, customer_id, email_consent, sms_consent, whatsapp_consent)
        VALUES %s
        ON CONFLICT (tenant_id, customer_id) DO UPDATE SET
            email_consent = EXCLUDED.email_consent,
            sms_consent = EXCLUDED.sms_consent,
            whatsapp_consent = EXCLUDED.whatsapp_consent;
    """
    
    execute_values(cursor, insert_query, consent_data)
    print(f"✓ Synced consent for {len(consent_data)} customers")

def sync_usage_preferences(cursor, df, tenant_id):
    """Sync customer usage preferences"""
    usage_data = []
    
    for customer_id in df['customer_id'].unique():
        customer_row = df[df['customer_id'] == customer_id].iloc[0]
        
        # Map preferred channel
        channel_map = {'E': 'email', 'S': 'sms', 'W': 'whatsapp'}
        channel = channel_map.get(customer_row.get('preferred_channel', 'E'), 'email')
        
        # Map preferred time
        time_map = {'morning': 9, 'afternoon': 14, 'evening': 18, 'night': 21}
        pref_time = time_map.get(str(customer_row.get('preferred_time', 'morning')).lower(), 14)
        
        usage_data.append((
            tenant_id,
            customer_id,
            channel,
            pref_time
        ))
    
    insert_query = """
        INSERT INTO jenita_dev.usage 
        (tenant_id, customer_id, preferred_channel, preferred_time)
        VALUES %s
        ON CONFLICT (tenant_id, customer_id) DO UPDATE SET
            preferred_channel = EXCLUDED.preferred_channel,
            preferred_time = EXCLUDED.preferred_time;
    """
    
    execute_values(cursor, insert_query, usage_data)
    print(f"✓ Synced usage preferences for {len(usage_data)} customers")

def create_diwali_campaign(cursor, df, tenant_id):
    """Create a dummy Diwali campaign with engagement history"""
    # Create campaign
    cursor.execute("""
        INSERT INTO jenita_dev.campaigns 
        (tenant_id, campaign_name, budget, language, objective, tone, status, run_count, last_run_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING campaign_id;
    """, (
        tenant_id,
        'Diwali Offer 2025',
        50000.00,
        'English',
        'Sales',
        'Festive',
        'completed',
        1,
        datetime(2025, 11, 5),
        datetime(2025, 10, 15)
    ))
    
    campaign_id = cursor.fetchone()[0]
    print(f"✓ Created Diwali campaign: {campaign_id}")
    
    # Add campaign details for segments
    segments = [
        {'name': 'Premium Loyalists', 'message': 'Exclusive Diwali Offer: Get 30% off on premium products!', 'is_recommended': True, 'count': 150},
        {'name': 'Price-Sensitive Shoppers', 'message': 'Diwali Bonanza: Up to 50% off on selected items!', 'is_recommended': True, 'count': 200},
        {'name': 'Occasional Buyers', 'message': 'Light up your Diwali with our special festive collection!', 'is_recommended': False, 'count': 120}
    ]
    
    for segment in segments:
        cursor.execute("""
            INSERT INTO jenita_dev.campaign_details 
            (campaign_id, segment_name, is_recommended, generated_message, customer_count)
            VALUES (%s, %s, %s, %s, %s);
        """, (campaign_id, segment['name'], segment['is_recommended'], segment['message'], segment['count']))
    
    print("✓ Added campaign details for 3 segments")
    
    # Create engagement history for sample customers
    sample_customers = df['customer_id'].head(100).tolist()
    engagement_data = []
    
    for i, customer_id in enumerate(sample_customers):
        # Simulate realistic engagement metrics
        opens = 1 if i < 70 else 0  # 70% open rate
        clicks = 1 if i < 35 else 0  # 35% click rate (50% of opens)
        replies = 1 if i < 10 else 0  # 10% reply rate
        
        engagement_data.append((
            tenant_id,
            campaign_id,
            customer_id,
            clicks,
            opens,
            replies
        ))
    
    insert_query = """
        INSERT INTO jenita_dev.engagement_history 
        (tenant_id, campaign_id, customer_id, no_of_clicks, no_of_opens, replies)
        VALUES %s;
    """
    
    execute_values(cursor, insert_query, engagement_data)
    print(f"✓ Created engagement history for {len(engagement_data)} customers")
    print(f"   - Open Rate: 70%, Click Rate: 35%, Reply Rate: 10%")
    
    return campaign_id

def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("Campaign Management System - Database Data Loader")
    print("="*60 + "\n")
    
    script_dir = Path(__file__).resolve().parent
    candidate_paths = [
        script_dir / 'campaign_dataset_refined.csv',
        script_dir.parent / 'campaign_dataset_refined.csv',
    ]
    csv_path = next((str(path) for path in candidate_paths if path.exists()), None)

    if not csv_path:
        print("✗ CSV file not found. Looked in:")
        for path in candidate_paths:
            print(f"  - {path}")
        return
    
    conn = None
    try:
        # Connect to database
        conn = connect_db()
        cursor = conn.cursor()
        
        print("\n[Step 1] Loading CSV data...")
        df = load_csv_data(csv_path)
        
        print("\n[Step 2] Creating tenant...")
        tenant_id = create_tenant(cursor)
        
        print("\n[Step 3] Syncing customers...")
        sync_customers(cursor, df, tenant_id)
        
        print("\n[Step 4] Syncing purchase history...")
        sync_purchases(cursor, df, tenant_id)
        
        print("\n[Step 5] Syncing consent preferences...")
        sync_consent(cursor, df, tenant_id)
        
        print("\n[Step 6] Syncing usage preferences...")
        sync_usage_preferences(cursor, df, tenant_id)
        
        print("\n[Step 7] Creating Diwali campaign with engagement data...")
        campaign_id = create_diwali_campaign(cursor, df, tenant_id)
        
        # Commit all changes
        conn.commit()
        
        print("\n" + "="*60)
        print("✓ DATABASE SYNC COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"\nTenant ID: {tenant_id}")
        print(f"Diwali Campaign ID: {campaign_id}")
        print(f"Total Customers: {len(df['customer_id'].unique())}")
        print(f"Total Purchases: {len(df)}")
        print("\nYou can now run your application!")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"\n✗ Error occurred: {e}")
        raise
    finally:
        if conn:
            cursor.close()
            conn.close()
            print("\n✓ Database connection closed")

if __name__ == "__main__":
    main()
