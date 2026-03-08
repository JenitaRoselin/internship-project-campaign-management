import os
from pathlib import Path

import psycopg2
from psycopg2 import sql


def load_env_file(env_path: Path) -> None:
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding='utf-8').splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('#') or '=' not in stripped:
            continue
        key, value = stripped.split('=', 1)
        os.environ.setdefault(key.strip(), value.strip())


def load_config() -> dict:
    env_path = Path(__file__).with_name('.env')
    load_env_file(env_path)

    ssl_mode = os.getenv('DB_SSLMODE')
    ssl_root_cert = os.getenv('DB_SSLROOTCERT')
    connect_timeout = os.getenv('DB_CONNECT_TIMEOUT')

    config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'postgres'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', ''),
        'port': int(os.getenv('DB_PORT', '5432')),
    }

    if ssl_mode:
        config['sslmode'] = ssl_mode

    if ssl_root_cert:
        cert_path = Path(ssl_root_cert)
        if not cert_path.is_absolute():
            cert_path = Path(__file__).parent / cert_path
        config['sslrootcert'] = str(cert_path.resolve())

    if connect_timeout:
        config['connect_timeout'] = int(connect_timeout)

    return config


def ensure_database_exists(config: dict) -> None:
    target_db = config['database']
    admin_config = dict(config)
    admin_config['database'] = 'postgres'

    conn = psycopg2.connect(**admin_config)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT 1 FROM pg_database WHERE datname = %s', (target_db,))
            exists = cur.fetchone() is not None
            if exists:
                print(f'✓ Database already exists: {target_db}')
            else:
                cur.execute(sql.SQL('CREATE DATABASE {}').format(sql.Identifier(target_db)))
                print(f'✓ Created database: {target_db}')
    finally:
        conn.close()


def apply_sql_file(config: dict, sql_file: Path) -> None:
    if not sql_file.exists():
        raise FileNotFoundError(f'SQL file not found: {sql_file}')

    with psycopg2.connect(**config) as conn:
        with conn.cursor() as cur:
            script = sql_file.read_text(encoding='utf-8')
            cur.execute(script)
        conn.commit()

    print(f'✓ Applied schema: {sql_file.name}')


def main() -> None:
    config = load_config()
    print(f"Using RDS host: {config['host']}")
    print(f"Target database: {config['database']}")

    ensure_database_exists(config)

    project_root = Path(__file__).resolve().parent.parent
    base_schema = project_root / 'database' / 'postgres-schema.sql'
    enhanced_schema = project_root / 'database' / 'enhanced-schema.sql'

    apply_sql_file(config, base_schema)
    apply_sql_file(config, enhanced_schema)

    print('✓ RDS bootstrap complete')


if __name__ == '__main__':
    main()
