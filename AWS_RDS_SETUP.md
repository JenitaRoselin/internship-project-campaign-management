# AWS RDS Quick Setup Guide

## ✅ Your Active RDS Instance

- **DB instance ID:** `muli-tenant-db-2`
- **Endpoint:** `muli-tenant-db-2.clisqo4mw2b7.ap-southeast-2.rds.amazonaws.com`
- **Port:** `5432`
- **Database name:** `multi_tenant_db_2`
- **Master username:** `multi_tenant_db2`
- **Engine:** PostgreSQL `18.1`
- **Region:** `ap-southeast-2`

The backend is already configured to use this instance via `backend/.env`.

## Step-by-Step Setup for AWS RDS

### 1️⃣ Locate Your AWS RDS Credentials

**Via AWS Console:**
```
AWS Console → RDS → Databases → Click your instance name
```

**Copy these values:**
- **Endpoint**: Found in "Connectivity & security" tab
- **Port**: Usually 5432
- **DB name**: Found in "Configuration" tab  
- **Master username**: Found in "Configuration" tab
- **Master password**: You set this when creating RDS

### 2️⃣ Create .env File

```bash
cd backend
copy .env.example .env
```

### 3️⃣ Edit .env with Your RDS Details

Open `backend/.env` and paste your credentials:

```env
DB_HOST=muli-tenant-db-2.clisqo4mw2b7.ap-southeast-2.rds.amazonaws.com
DB_NAME=multi_tenant_db_2
DB_USER=multi_tenant_db2
DB_PASSWORD=your_master_password
DB_PORT=5432
DB_SSLMODE=verify-full
DB_SSLROOTCERT=certs/global-bundle.pem
```

### 3.1️⃣ Direct `psql` command (your instance)

**PowerShell**
```powershell
$env:RDSHOST="muli-tenant-db-2.clisqo4mw2b7.ap-southeast-2.rds.amazonaws.com"
$env:PGPASSWORD="<your_password>"
psql "host=$env:RDSHOST port=5432 dbname=multi_tenant_db_2 user=multi_tenant_db2 sslmode=verify-full sslrootcert=certs/global-bundle.pem"
```

**Bash / Linux / macOS**
```bash
export RDSHOST="muli-tenant-db-2.clisqo4mw2b7.ap-southeast-2.rds.amazonaws.com"
export PGPASSWORD="<your_password>"
psql "host=$RDSHOST port=5432 dbname=multi_tenant_db_2 user=multi_tenant_db2 sslmode=verify-full sslrootcert=/certs/global-bundle.pem"
```

### 4️⃣ Configure RDS Security (CRITICAL!)

Your RDS won't be accessible without this:

**A. Allow Your IP:**
1. Go to RDS → Your instance → **Connectivity & security**
2. Click the **VPC security groups** link
3. Click **Edit inbound rules**
4. Add rule:
   - Type: **PostgreSQL**
   - Port: **5432**
   - Source: **My IP** (or paste your IP)
5. **Save rules**

**B. Enable Public Access:**
1. RDS → Your instance → **Modify**
2. Scroll to **Connectivity**
3. Set **Public access** to **Yes**
4. Click **Continue** → **Apply immediately**

### 5️⃣ Install python-dotenv

```bash
pip install python-dotenv
```

### 6️⃣ Test Connection

```bash
cd backend
python -c "from dotenv import load_dotenv; load_dotenv(); import database as db; print(db.get_default_tenant())"
```

**Success:**
```
{'tenant_id': 'xxxx-xxxx-xxxx', 'tenant_name': 'Demo Store', ...}
```

**Failure?** Check:
- ✓ RDS instance is **running** (not stopped)
- ✓ Security group allows port 5432
- ✓ `.env` file exists in `backend/` folder
- ✓ Credentials are correct
- ✓ RDS is publicly accessible

### 7️⃣ Load Data into RDS

```bash
cd backend
python load_database.py
```

Expected output:
```
✓ Connected to PostgreSQL database
✓ Loaded CSV with XXXX rows
✓ Synced XXX customers
✓ Created Diwali campaign
✓ DATABASE SYNC COMPLETED SUCCESSFULLY!
```

### 8️⃣ Run the Application

**Terminal 1:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2:**
```bash
cd frontend/campaign-manager
npm run dev
```

Visit: `http://localhost:3000`

---

## Troubleshooting

### Error: "could not connect to server"
- **Check**: Is your IP whitelisted in RDS security group?
- **Fix**: Add your IP to inbound rules (port 5432)

### Error: "password authentication failed"
- **Check**: Is the password in `.env` correct?
- **Fix**: Verify password matches RDS master password

### Error: "database does not exist"
- **Check**: Does the database name match what's in RDS?
- **Fix**: Update `DB_NAME` in `.env` or create database in RDS

### Error: "timeout"
- **Check**: Is RDS publicly accessible?
- **Fix**: Modify RDS → Set public access to Yes

### Get Your Current IP
```bash
curl ifconfig.me
```

---

## Security Reminder

🔒 **Never commit `.env` file to Git!**

The `.gitignore` file already excludes it, but double-check:
```bash
git status
```

If you see `.env` listed, add it to `.gitignore`:
```bash
echo .env >> .gitignore
```

---

## Next Steps

Once connected to AWS RDS:
1. ✅ Your data is now in the cloud
2. ✅ No local PostgreSQL installation needed
3. ✅ Access from anywhere with proper security
4. ✅ Ready for production scaling

Happy campaigning! 🚀
