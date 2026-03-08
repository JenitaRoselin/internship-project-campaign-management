# Campaign Management System - Setup Guide

## 🎯 Overview
Your campaign management system has been fully upgraded to use **AWS RDS PostgreSQL** instead of CSV uploads. All data is stored in the cloud.

## ⚡ Quick Start (AWS RDS)

**👉 For detailed AWS RDS setup, see [AWS_RDS_SETUP.md](AWS_RDS_SETUP.md)**

**In a nutshell:**
1. Create `backend/.env` with your RDS credentials
2. Run `pip install python-dotenv psycopg2-binary`
3. Run `python backend/load_database.py`
4. Start servers and launch!

## 📋 Prerequisites

1. **AWS RDS PostgreSQL Instance** (already created with `jenita_dev` schema)
2. **Python 3.8+** with pip
3. **Node.js 18+** with npm
4. **Git** (optional)

## 🗄️ Database Setup (AWS RDS)

### Step 1: AWS RDS PostgreSQL Database

Your AWS RDS PostgreSQL instance should already be created with the schema `jenita_dev`. If not:
1. Log into AWS Console
2. Navigate to RDS
3. Find your PostgreSQL instance
4. Note down the **Endpoint**, **Port**, **Database name**, **Username**

### Step 2: Configure Database Connection

Create a `.env` file in the `backend` folder:

```bash
cd backend
copy .env.example .env
```

Edit `.env` with your AWS RDS credentials:

```env
DB_HOST=your-instance.region.rds.amazonaws.com
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_rds_password
DB_PORT=5432
```

**Example:**
```env
DB_HOST=campaign-db.c1abc2defgh.us-east-1.rds.amazonaws.com
DB_NAME=campaign_management
DB_USER=admin
DB_PASSWORD=SecurePassword123
DB_PORT=5432
```

### Step 3: Verify Connection

Test your RDS connection:

```bash
cd backend
python -c "import database as db; print(db.get_default_tenant())"
```

If you see `None` or no error, the connection works!

### Step 4: Run Enhanced Schema (One-Time)

If the `jenita_dev` schema exists but is missing campaign fields:

```bash
psql -h your-instance.region.rds.amazonaws.com -U postgres -d campaign_management -f database/enhanced-schema.sql
```

Or use a database client (DBeaver, pgAdmin, DataGrip) to execute `enhanced-schema.sql`

## 📦 Backend Setup

### Step 1: Install Python Dependencies

```bash
cd backend
pip install psycopg2-binary pandas fastapi uvicorn python-multipart huggingface-hub google-auth-oauthlib google-api-python-client google-auth requests python-dotenv
```

### Step 2: Load CSV Data into Database

Make sure your `campaign_dataset_refined.csv` is in the root directory, then run:

```bash
python load_database.py
```

**Expected Output:**
```
✓ Connected to PostgreSQL database
✓ Loaded CSV with XXXX rows
✓ Created/Retrieved tenant: <uuid>
✓ Synced XXX customers
✓ Synced XXXX purchase records
✓ Synced consent for XXX customers
✓ Synced usage preferences for XXX customers
✓ Created Diwali campaign: <uuid>
✓ Created engagement history for 100 customers
   - Open Rate: 70%, Click Rate: 35%, Reply Rate: 10%

DATABASE SYNC COMPLETED SUCCESSFULLY!
```

### Step 3: Configure Email Whitelisting

In `backend/main.py`, campaign run currently sends only to this development whitelist:

```python
WHITELISTED_EMAILS = [
  "jeniroselin20@gmail.com",
  "yuvasrieswara77@gmail.com"
]
```

Update this list only when intentionally changing allowed test recipients.

### Step 4: Start Backend Server

```bash
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

## 🎨 Frontend Setup

### Step 1: Install Node Dependencies

```bash
cd frontend/campaign-manager
npm install
```

### Step 2: Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🚀 Using the Application

### 1. Login
- Visit `http://localhost:3000`
- Enter any company name
- You'll be redirected to the dashboard

### 2. View All Campaigns (Landing Page)
- Dashboard loads showing all existing campaigns
- You'll see the "Diwali Offer 2025" dummy campaign
- Click "View ROI" to see engagement metrics

### 3. Create New Campaign Workflow

#### Step 1: Click "Create Campaign"
- Fetches all customers from database
- No CSV upload needed!

#### Step 2: Target Audience (Filtering)
- Use filters to select specific customers:
  - By loyalty status
  - By purchase frequency
  - By spending range
- Confirm your selection

#### Step 3: AI Insights (Dynamic Segmentation)
- AI automatically segments filtered customers
- Number of segments is chosen dynamically
- View detailed breakdown of each segment
- See every customer name and ID

#### Step 4: Campaign Details (CRM-Style)
- **Campaign Name**: Give your campaign a name
- **Budget**: Enter budget amount
- **Language**: English, Hindi, Tamil, etc.
- **Objective**: 
  - Sales
  - Engagement
  - Retention
  - Awareness
  - Other (custom text input)
- **Tone**: 
  - Professional
  - Friendly
  - Urgent
  - Festive
  - Other (custom text input)
- **Additional Context**: Free text for AI guidance

#### Step 5: AI Message Generation
- AI generates custom messages for EACH segment
- Messages adapt to selected tone and objective
- **Top 2 segments** are marked as "Recommended for High ROI"
- Based on average customer spending

#### Step 6: Run Campaign
- Click "Run Campaign"
- Emails sent ONLY to whitelisted addresses (for testing)
- Campaign saved to database
- Engagement tracking begins

### 4. View ROI & Analytics
- Click "View ROI" in sidebar
- See all campaigns with live metrics:
  - Total sent
  - Open rate
  - Click-through rate
  - Reply rate
- Click on individual campaign for detailed breakdown
- See customer-level engagement

### 5. Run Campaign Again
- Click "Run Again" on any campaign card
- Starts new workflow with ability to:
  - Change target audience
  - Modify campaign details
  - Re-generate messages
- Creates new campaign instance

## 🔧 API Endpoints Reference

### Authentication
- `GET /api/auth/google` - Start OAuth flow
- `GET /callback` - OAuth callback

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/{id}` - Get campaign details
- `POST /api/campaigns` - Create new campaign
- `POST /api/campaigns/{id}/run` - Run campaign (send emails)
- `GET /api/campaigns/{id}/roi` - Get ROI metrics

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/segment-customers-dynamic` - Dynamically segment filtered customers

### Legacy (Backward Compatibility)
- `POST /api/segment-customers` - Upload CSV and segment
- `POST /api/generate-campaign` - Generate campaign copy
- `POST /api/send-email` - Send single email

## 🔍 Database Schema Overview

### Main Tables
1. **tenants** - Multi-tenant support
2. **customers** - Customer profiles with segments
3. **purchase_history** - Transaction records
4. **campaigns** - Campaign metadata with CRM fields
5. **campaign_details** - Segment-specific messages
6. **engagement_history** - Email engagement metrics
7. **consent** - Communication preferences
8. **usage** - Channel and time preferences
9. **message_status** - Delivery tracking
10. **message_log** - Complete message audit trail

### Key Features
- UUID primary keys
- Foreign key constraints
- Automatic timestamps
- JSONB for flexible data
- Performance indexes

## 🎯 Campaign Status Flow

```
draft → active → completed
         ↓
       paused
```

- **draft**: Being created
- **active**: Currently running
- **completed**: Finished
- **paused**: Temporarily stopped

## 📊 Success Metrics

The Diwali campaign comes pre-loaded with:
- 100 recipients
- 70% open rate
- 35% click rate
- 10% reply rate

These serve as benchmarks for your new campaigns.

## 🐛 Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running
- Verify credentials in `database.py`
- Ensure database exists

### "No customers found"
- Run `python load_database.py` again
- Check if CSV file is in correct location

### Email Not Sending
- Run OAuth flow: Visit `http://localhost:8000/api/auth/google`
- Check `token.json` exists in backend folder
- Verify recipient email is whitelisted

### Frontend Not Loading Campaigns
- Check backend is running on port 8000
- Check browser console for CORS errors
- Verify database has campaigns

## 🎉 You're All Set!

Your campaign management system is now fully integrated with PostgreSQL. You can:
- ✅ Create unlimited campaigns
- ✅ Target specific customer segments
- ✅ Generate AI-powered messages
- ✅ Track ROI in real-time
- ✅ Re-run successful campaigns
- ✅ No more CSV uploads!

## 📝 Next Steps

1. Run your first campaign
2. Monitor ROI metrics
3. Refine targeting based on results
4. Scale up to production emails (remove whitelist)
5. Add more custom fields as needed

---

**Need Help?** Check the console output for detailed error messages.
