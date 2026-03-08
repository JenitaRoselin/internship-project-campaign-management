# 🎯 Campaign Management System

AI-powered campaign management platform with PostgreSQL backend and dynamic customer segmentation.

## ✨ Features

- 🎨 **No CSV Uploads** - All data stored in AWS RDS PostgreSQL
- 🤖 **AI Segmentation** - Dynamic customer clustering with GPT
- 📊 **Real-time ROI** - Track opens, clicks, and engagement
- 📧 **Smart Emails** - AI-generated messages per segment
- 🎯 **CRM-Style Campaigns** - Budget, tone, objective, and more
- 🔄 **Run Again** - Re-launch campaigns with modifications

## 🚀 Quick Start

### 1. Configure AWS RDS
Create `backend/.env` with your RDS credentials:
```env
DB_HOST=your-instance.region.rds.amazonaws.com
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
```

See **[AWS_RDS_SETUP.md](AWS_RDS_SETUP.md)** for detailed instructions.

### 2. Install Dependencies
```bash
# Backend
cd backend
pip install psycopg2-binary pandas fastapi uvicorn python-multipart python-dotenv huggingface-hub google-auth-oauthlib google-api-python-client google-auth requests

# Frontend
cd frontend/campaign-manager
npm install
```

### 3. Load Data
```bash
cd backend
python load_database.py
```

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend/campaign-manager
npm run dev
```

### 5. Launch
Visit **http://localhost:3000** and create your first campaign!

## 📚 Documentation

- **[AWS_RDS_SETUP.md](AWS_RDS_SETUP.md)** - AWS RDS configuration guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[QUICK_START.md](QUICK_START.md)** - Step-by-step checklist
- **[DATABASE_CONFIG.md](DATABASE_CONFIG.md)** - Environment variables reference
- **[TEAMMATE_HANDOFF.md](TEAMMATE_HANDOFF.md)** - Continuation notes, verified behavior, and next-work checklist

## 🏗️ Architecture

```
Frontend (Next.js) → Backend (FastAPI) → AWS RDS PostgreSQL
                         ↓
                   AI Engine (HuggingFace)
                   Gmail API (Email)
```

## 📊 Database Schema

- **tenants** - Multi-tenant support
- **customers** - Customer profiles with AI segments
- **purchase_history** - Transaction records
- **campaigns** - Campaign metadata (budget, tone, objective)
- **campaign_details** - Segment-specific AI messages
- **engagement_history** - Email metrics (opens, clicks, replies)

## 🎬 Campaign Workflow

1. **Target Audience** - Filter customers by loyalty, frequency, spending
2. **AI Segmentation** - Dynamic clustering (2-N segments)
3. **Verification** - Review every customer in target group
4. **Campaign Details** - Set budget, language, objective, tone
5. **AI Generation** - Custom messages per segment (top 2 recommended)
6. **Run Campaign** - Send emails (whitelisted for dev)
7. **View ROI** - Real-time analytics and engagement tracking

## 🔐 Security

- ✅ `.env` for credentials (never committed)
- ✅ `.gitignore` configured
- ✅ AWS RDS security groups
- ✅ Email whitelist for testing
- ✅ OAuth 2.0 for Gmail

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL (AWS RDS)
- HuggingFace Inference API
- Gmail API
- psycopg2

**Frontend:**
- Next.js 16.1.6
- TypeScript
- TailwindCSS
- React Charts

## 📝 Environment Variables

Create `backend/.env`:
```env
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_PORT=5432
```

## 🧪 Testing

The system comes with a pre-loaded **"Diwali Offer 2025"** campaign:
- 100 recipients
- 70% open rate
- 35% click rate
- 10% reply rate

Use this as a benchmark for your campaigns!

## 🤝 Contributing

This is an internship project for campaign management system development.

## 📄 License

Private - Internship Project

---

**Need Help?** Check the troubleshooting section in [SETUP_GUIDE.md](SETUP_GUIDE.md)

**AWS RDS Issues?** See [AWS_RDS_SETUP.md](AWS_RDS_SETUP.md)

Made with ❤️ for effective campaign management
