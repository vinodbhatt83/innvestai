-- Check table structure for deals table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deals'
ORDER BY ordinal_position;
