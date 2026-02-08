"use server";
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }
});

export async function authenticate(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    // 1. First, check if the tenant name exists at all
    const userCheck = await pool.query(
      'SELECT tenant_id FROM jenita_dev.tenants WHERE tenant_name = $1', 
      [username]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, error: 'invalid_user' };
    }

    // 2. If user exists, check if the UUID (password) matches
    const tenant = userCheck.rows[0];
    if (tenant.tenant_id !== password) {
      return { success: false, error: 'invalid_password' };
    }

    // 3. Success
    return { success: true, tenantId: tenant.tenant_id };

  } catch (err) {
    console.error("Database Error:", err);
    return { success: false, error: 'db_error' };
  }

}
