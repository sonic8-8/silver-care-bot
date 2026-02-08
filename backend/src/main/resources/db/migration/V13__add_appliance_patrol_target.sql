DO $$
BEGIN
    IF to_regtype(current_schema() || '.patrol_target') IS NOT NULL
        AND NOT EXISTS (
            SELECT 1
            FROM pg_enum e
                     JOIN pg_type t ON t.oid = e.enumtypid
                     JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = current_schema()
              AND t.typname = 'patrol_target'
              AND e.enumlabel = 'APPLIANCE'
        ) THEN
        EXECUTE format('ALTER TYPE %I.patrol_target ADD VALUE ''APPLIANCE''', current_schema());
    END IF;
END $$;
