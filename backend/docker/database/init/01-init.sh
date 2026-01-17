#!/bin/bash
set -e

# Create additional databases for testing and development
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create test database
    CREATE DATABASE aurumvault_test;
    GRANT ALL PRIVILEGES ON DATABASE aurumvault_test TO $POSTGRES_USER;
    
    -- Create development schemas
    \c aurumvault_dev;
    
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    
    -- Create audit schema for tracking changes
    CREATE SCHEMA IF NOT EXISTS audit;
    
    -- Create monitoring schema for metrics
    CREATE SCHEMA IF NOT EXISTS monitoring;
    
    -- Grant permissions
    GRANT USAGE ON SCHEMA audit TO $POSTGRES_USER;
    GRANT USAGE ON SCHEMA monitoring TO $POSTGRES_USER;
    GRANT CREATE ON SCHEMA audit TO $POSTGRES_USER;
    GRANT CREATE ON SCHEMA monitoring TO $POSTGRES_USER;
    
    -- Create audit function for tracking changes
    CREATE OR REPLACE FUNCTION audit.audit_trigger_function()
    RETURNS TRIGGER AS \$\$
    BEGIN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO audit.audit_log (
                table_name,
                operation,
                old_values,
                changed_by,
                changed_at
            ) VALUES (
                TG_TABLE_NAME,
                TG_OP,
                row_to_json(OLD),
                current_user,
                now()
            );
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO audit.audit_log (
                table_name,
                operation,
                old_values,
                new_values,
                changed_by,
                changed_at
            ) VALUES (
                TG_TABLE_NAME,
                TG_OP,
                row_to_json(OLD),
                row_to_json(NEW),
                current_user,
                now()
            );
            RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
            INSERT INTO audit.audit_log (
                table_name,
                operation,
                new_values,
                changed_by,
                changed_at
            ) VALUES (
                TG_TABLE_NAME,
                TG_OP,
                row_to_json(NEW),
                current_user,
                now()
            );
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
    \$\$ LANGUAGE plpgsql;
    
    -- Create audit log table
    CREATE TABLE IF NOT EXISTS audit.audit_log (
        id SERIAL PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        old_values JSONB,
        new_values JSONB,
        changed_by TEXT NOT NULL,
        changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    -- Create index for better performance
    CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit.audit_log(table_name);
    CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit.audit_log(changed_at);
    
EOSQL

echo "Database initialization completed successfully!"