-- Seed initial portal status
-- Run this SQL in Prisma Studio or your database client
INSERT INTO portal_status (
        id,
        status,
        message,
        next_scheduled_maintenance,
        scheduled_maintenance_message,
        updated_at,
        updated_by
    )
VALUES (
        'portal_status_default',
        'online',
        'E-Banking Portal is operational and ready to use',
        NULL,
        NULL,
        CURRENT_TIMESTAMP,
        NULL
    );
-- Verify the record was created
SELECT *
FROM portal_status;