# 🔐 AWS RDS Database Configuration

## Setup Instructions

### 1. Create `.env` file

In the `backend` folder, create a file named `.env`:

```bash
cd backend
copy .env.example .env
```

### 2. Add Your AWS RDS Credentials

Edit `backend/.env` with your actual RDS details:

```env
DB_HOST=your-rds-instance.region.rds.amazonaws.com
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_actual_rds_password
DB_PORT=5432
```

### Example Configuration:

```env
DB_HOST=campaign-db.c1abc2defgh.us-east-1.rds.amazonaws.com
DB_NAME=campaign_management
DB_USER=admin
DB_PASSWORD=MySecurePassword123!
DB_PORT=5432
```

## How It Works

Both `database.py` and `load_database.py` now use `python-dotenv` to automatically load credentials from the `.env` file:

```python
from dotenv import load_dotenv
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'postgres'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'port': int(os.getenv('DB_PORT', 5432))
}
```

## Finding Your AWS RDS Connection Details

### Via AWS Console:
1. Go to **AWS Console** → **RDS** → **Databases**
2. Click on your database instance
3. In **Connectivity & security** tab:
   - **Endpoint**: Copy as `DB_HOST` (e.g., `my-db.abc123.us-east-1.rds.amazonaws.com`)
   - **Port**: Usually `5432`
4. In **Configuration** tab:
   - **DB name**: Copy as `DB_NAME`
   - **Master username**: Copy as `DB_USER`
5. Password was set during RDS creation

### Via AWS CLI:
```bash
aws rds describe-db-instances --db-instance-identifier your-instance-name
```

## AWS RDS Security Configuration

### 1. Security Group Rules
Your RDS must allow inbound PostgreSQL traffic:

- **Type**: PostgreSQL
- **Protocol**: TCP  
- **Port**: 5432
- **Source**: Your IP or `0.0.0.0/0` (dev only)

**To configure**: RDS → Instance → Connectivity & security → VPC security groups → Edit inbound rules

### 2. Public Accessibility
For development: **Publicly accessible** = **Yes**

### 3. Email Whitelist

In `backend/main.py` (line ~345):

```python
WHITELISTED_EMAILS = [
    "your_actual_email@gmail.com",
    "friend_email@gmail.com"
]
```

## 🔒 Security Best Practices

### Development:
- ✅ Use `.env` file with RDS credentials
- ✅ Add `.env` to `.gitignore`
- ✅ Never commit credentials

### Production:
- ✅ Use AWS Secrets Manager
- ✅ Enable SSL/TLS connections
- ✅ Restrict security groups to specific IPs
- ✅ Use IAM database authentication
- ✅ Enable RDS encryption at rest

## ✅ Verification Checklist

Test your AWS RDS connection:

```bash
cd backend
python -c "import database as db; print(db.get_default_tenant())"
```

Expected output:
```python
{'tenant_id': '<uuid>', 'tenant_name': 'Demo Store', 'created_at': '...'}
```

If connection fails, check:
1. ✓ RDS instance is **running** (not stopped)
2. ✓ Security group allows port 5432 from your IP
3. ✓ RDS is publicly accessible (for dev)
4. ✓ Credentials in `.env` are correct
5. ✓ `python-dotenv` is installed: `pip install python-dotenv`

## 🌍 Connecting from Different Locations

If connecting from a different network (home/office/cloud):
1. Get your current IP: `curl ifconfig.me`
2. Add it to RDS security group inbound rules
3. Or use `0.0.0.0/0` for open access (dev only!)

---

**Important:** Never push `.env` file to Git! It's already in `.gitignore`.
