# 🚀 Quick Start Checklist

Follow these steps in order to get your campaign management system running:

## ☑️ Pre-Setup (One-Time)

- [ ] Ensure AWS RDS PostgreSQL access (host/user/password/database)
- [ ] Install Python dependencies: `pip install psycopg2-binary pandas fastapi uvicorn python-multipart huggingface-hub google-auth-oauthlib google-api-python-client google-auth requests python-dotenv`
- [ ] Install Node dependencies: `cd frontend/campaign-manager && npm install`

## ☑️ Configuration (One-Time)

- [ ] Create `.env` file: `cd backend && copy .env.example .env`
- [ ] Update `.env` with your AWS RDS credentials (host, database, user, password)
- [ ] Verify whitelist emails in `backend/main.py`:
	- `jeniroselin20@gmail.com`
	- `yuvasrieswara77@gmail.com`

## ☑️ Database Initialization (One-Time)

From the `backend` folder:
- [ ] Run `python bootstrap_rds.py` (creates DB if missing + applies base/enhanced schema)

- [ ] Run `python load_database.py`
- [ ] Verify success message with Diwali campaign created

## ☑️ Start Application (Every Time)

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```
✓ Backend running on http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend/campaign-manager
npm run dev
```
✓ Frontend running on http://localhost:3000

## ☑️ Test the System

- [ ] Visit http://localhost:3000
- [ ] Login with any company name
- [ ] See "Diwali Offer 2025" campaign on dashboard
- [ ] Click "View ROI" to see pre-loaded metrics
- [ ] Click "Create Campaign" to start new workflow

## ☑️ Email Setup (For Sending)

- [ ] Visit http://localhost:8000/api/auth/google
- [ ] Complete Google OAuth flow
- [ ] Verify `token.json` created in backend folder
- [ ] Now you can send emails!

## 🎉 You're Ready!

Your system is fully operational. Key features:
- ✅ Database-driven (no CSV uploads)
- ✅ Dynamic AI segmentation
- ✅ CRM-style campaign fields
- ✅ Real-time ROI tracking
- ✅ Campaign re-run capability
- ✅ Whitelisted email testing

---

**Having Issues?** See SETUP_GUIDE.md for detailed troubleshooting.
