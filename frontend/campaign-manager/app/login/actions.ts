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

// --- NEW FUNCTION: Fetch Tenant Name for Dashboard ---
export async function getTenantName(tenantId: string) {
  try {
    // Uses your specific schema 'jenita_dev' and maps tenant_id to tenant_name
    const result = await pool.query(
      'SELECT tenant_name FROM jenita_dev.tenants WHERE tenant_id = $1 LIMIT 1',
      [tenantId]
    );

    if (result.rows.length > 0) {
      return { success: true, name: result.rows[0].tenant_name };
    }
    return { success: false, error: 'tenant_not_found' };
  } catch (err) {
    console.error("Database Error in getTenantName:", err);
    return { success: false, error: 'db_error' };
  }
}

// --- EXISTING FUNCTION: Authenticate ---
export async function authenticate(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const userCheck = await pool.query(
      'SELECT tenant_id FROM jenita_dev.tenants WHERE tenant_name = $1', 
      [username]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, error: 'invalid_user' };
    }

    const tenant = userCheck.rows[0];
    if (tenant.tenant_id !== password) {
      return { success: false, error: 'invalid_password' };
    }

    return { success: true, tenantId: tenant.tenant_id };

  } catch (err) {
    console.error("Database Error:", err);
    return { success: false, error: 'db_error' };
  }
}
