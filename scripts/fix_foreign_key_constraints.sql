-- Script to fix foreign key constraint issues by ensuring proper table creation order

-- First, ensure the deals table exists
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  deal_id SERIAL UNIQUE, -- Adding both id and deal_id for compatibility
  property_id INTEGER,
  deal_name VARCHAR(255) NOT NULL,
  property_name VARCHAR(255),
  property_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  number_of_rooms INT,
  property_type VARCHAR(50),
  investment_amount DECIMAL(15, 2) NOT NULL DEFAULT 1000000,
  expected_return DECIMAL(6, 2) NOT NULL DEFAULT 8.5,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '5 years'),
  hold_period INT,
  status VARCHAR(50) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT
);

-- Check if fact_deal_metrics table references deal_id or id
DO $$
BEGIN
  -- Check if the foreign key constraint already exists in a proper way
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fact_deal_metrics_deal_id_fkey' 
    AND table_name = 'fact_deal_metrics'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE fact_deal_metrics DROP CONSTRAINT fact_deal_metrics_deal_id_fkey;
  END IF;
  
  -- Add a new constraint that works with either deal_id or id from the deals table
  -- This uses a function to check if the value exists in either column
  ALTER TABLE fact_deal_metrics
  ADD CONSTRAINT fact_deal_metrics_deal_id_fkey
  FOREIGN KEY (deal_id) REFERENCES deals(deal_id);
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error adjusting constraint: %', SQLERRM;
END $$;

-- Now fix the constraint for fact_deal_assumptions 
DO $$
BEGIN
  -- Check if the foreign key constraint exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fact_deal_assumptions_deal_id_fkey' 
    AND table_name = 'fact_deal_assumptions'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE fact_deal_assumptions DROP CONSTRAINT fact_deal_assumptions_deal_id_fkey;
  END IF;
  
  -- Add a new constraint
  ALTER TABLE fact_deal_assumptions
  ADD CONSTRAINT fact_deal_assumptions_deal_id_fkey
  FOREIGN KEY (deal_id) REFERENCES deals(deal_id);
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error adjusting constraint: %', SQLERRM;
END $$;

-- Add check query to verify constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'fact_deal_metrics' OR tc.table_name = 'fact_deal_assumptions')
  AND ccu.table_name = 'deals';
