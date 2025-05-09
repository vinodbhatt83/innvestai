// scripts/setup-db.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Create dimension tables first (no foreign key constraints)
    const dimensionTablesQuery = `
      -- Create dimension tables if not exists
      CREATE TABLE IF NOT EXISTS dim_hotel_type (
        hotel_type_id SERIAL PRIMARY KEY,
        hotel_type_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_market (
        market_id SERIAL PRIMARY KEY,
        market_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_country (
        country_id SERIAL PRIMARY KEY,
        country_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_region (
        region_id SERIAL PRIMARY KEY,
        region_name VARCHAR(100) NOT NULL,
        country_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_state (
        state_id SERIAL PRIMARY KEY,
        state_name VARCHAR(100) NOT NULL,
        country_id INTEGER,
        region_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_city (
        city_id SERIAL PRIMARY KEY,
        city_name VARCHAR(100) NOT NULL,
        state_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_brand (
        brand_id SERIAL PRIMARY KEY,
        brand_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_chain_scale (
        chain_scale_id SERIAL PRIMARY KEY,
        chain_scale_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_department (
        department_id SERIAL PRIMARY KEY,
        department_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dim_account (
        account_id SERIAL PRIMARY KEY,
        account_name VARCHAR(100) NOT NULL,
        account_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(dimensionTablesQuery);
    console.log('Base dimension tables created successfully');

    // Create property table
    const propertyTableQuery = `
      CREATE TABLE IF NOT EXISTS dim_property (
        property_id SERIAL PRIMARY KEY,
        property_name VARCHAR(255) NOT NULL,
        hotel_type_id INTEGER,
        market_id INTEGER,
        country_id INTEGER,
        region_id INTEGER,
        state_id INTEGER,
        city_id INTEGER,
        brand_id INTEGER,
        chain_scale_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(propertyTableQuery);
    console.log('Property table created successfully');
    
    // Create the deals table
    const dealsTableQuery = `
      CREATE TABLE IF NOT EXISTS deals (
        deal_id SERIAL PRIMARY KEY,
        property_id INTEGER,
        deal_name VARCHAR(255) NOT NULL,
        deal_description TEXT,
        investment_amount DECIMAL(15, 2) NOT NULL,
        expected_return DECIMAL(6, 2) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(dealsTableQuery);
    console.log('Deals table created successfully');
    
    // Create time dimension table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dim_time (
        time_id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        day INTEGER NOT NULL,
        month INTEGER NOT NULL,
        quarter INTEGER NOT NULL,
        year INTEGER NOT NULL,
        is_weekend BOOLEAN NOT NULL,
        day_of_week INTEGER NOT NULL,
        week_of_year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Time table created successfully');
    
    // Create fact tables
    const factTablesQuery = `
      -- Create fact tables
      CREATE TABLE IF NOT EXISTS fact_financial (
        financial_id SERIAL PRIMARY KEY,
        property_id INTEGER,
        time_id INTEGER,
        department_id INTEGER,
        account_id INTEGER,
        amount DECIMAL(15, 2),
        is_budget BOOLEAN DEFAULT FALSE,
        is_forecast BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fact_market_data (
        market_data_id SERIAL PRIMARY KEY,
        market_id INTEGER,
        time_id INTEGER,
        revpar DECIMAL(10, 2),
        adr DECIMAL(10, 2),
        occupancy DECIMAL(5, 4),
        supply INTEGER,
        demand INTEGER,
        supply_growth DECIMAL(5, 4),
        demand_growth DECIMAL(5, 4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(factTablesQuery);
    console.log('Fact tables created successfully');
    
    // Create stored procedures
    console.log('Creating stored procedures...');
    const storedProceduresQuery = `
      -- Monthly Revenue Analysis
      CREATE OR REPLACE FUNCTION get_revenue_by_property(year INTEGER)
      RETURNS TABLE (
        property_id INTEGER,
        property_name VARCHAR,
        month INTEGER,
        revenue DECIMAL,
        revpar DECIMAL,
        adr DECIMAL,
        occupancy DECIMAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          p.property_id,
          p.property_name,
          t.month AS month,
          COALESCE(SUM(f.amount), 0) AS revenue,
          COALESCE(AVG(m.revpar), 0) AS revpar,
          COALESCE(AVG(m.adr), 0) AS adr,
          COALESCE(AVG(m.occupancy), 0) AS occupancy
        FROM dim_property p
        CROSS JOIN (
          SELECT DISTINCT month, year FROM dim_time WHERE year = $1
        ) t 
        LEFT JOIN fact_financial f ON p.property_id = f.property_id 
          AND f.time_id IN (SELECT time_id FROM dim_time WHERE month = t.month AND year = t.year)
        LEFT JOIN dim_market mk ON p.market_id = mk.market_id
        LEFT JOIN fact_market_data m ON mk.market_id = m.market_id 
          AND m.time_id IN (SELECT time_id FROM dim_time WHERE month = t.month AND year = t.year)
        GROUP BY p.property_id, p.property_name, t.month
        ORDER BY p.property_name, t.month;
      END;
      $$ LANGUAGE plpgsql;

      -- Regional Performance Analysis
      CREATE OR REPLACE FUNCTION get_performance_by_region(year INTEGER, market_segment VARCHAR)
      RETURNS TABLE (
        region_id INTEGER,
        region_name VARCHAR,
        total_revenue DECIMAL,
        avg_revpar DECIMAL,
        avg_occupancy DECIMAL,
        growth_rate DECIMAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          r.region_id,
          r.region_name,
          COALESCE(SUM(f.amount), 0) AS total_revenue,
          COALESCE(AVG(m.revpar), 0) AS avg_revpar,
          COALESCE(AVG(m.occupancy), 0) AS avg_occupancy,
          COALESCE(AVG(m.demand_growth), 0) AS growth_rate
        FROM dim_region r
        LEFT JOIN dim_property p ON r.region_id = p.region_id
        LEFT JOIN dim_hotel_type h ON p.hotel_type_id = h.hotel_type_id
        LEFT JOIN fact_financial f ON p.property_id = f.property_id
          AND f.time_id IN (SELECT time_id FROM dim_time WHERE year = $1)
        LEFT JOIN dim_market mk ON p.market_id = mk.market_id
        LEFT JOIN fact_market_data m ON mk.market_id = m.market_id
          AND m.time_id IN (SELECT time_id FROM dim_time WHERE year = $1)
        WHERE h.hotel_type_name = $2 OR $2 IS NULL
        GROUP BY r.region_id, r.region_name
        ORDER BY total_revenue DESC;
      END;
      $$ LANGUAGE plpgsql;

      -- Department Expense Analysis
      CREATE OR REPLACE FUNCTION get_expenses_by_department(year INTEGER, property_name VARCHAR)
      RETURNS TABLE (
        department_id INTEGER,
        department_name VARCHAR,
        total_expenses DECIMAL,
        percentage_of_total DECIMAL,
        year_over_year_change DECIMAL
      ) AS $$
      DECLARE
        total DECIMAL;
      BEGIN
        -- Calculate current year expenses
        CREATE TEMP TABLE current_year_expenses AS
        SELECT 
          d.department_id,
          d.department_name,
          COALESCE(SUM(f.amount), 0) AS expenses
        FROM dim_department d
        LEFT JOIN fact_financial f ON d.department_id = f.department_id
        LEFT JOIN dim_property p ON f.property_id = p.property_id
        LEFT JOIN dim_time t ON f.time_id = t.time_id
        LEFT JOIN dim_account a ON f.account_id = a.account_id
        WHERE 
          t.year = year
          AND (p.property_name = property_name OR property_name IS NULL)
          AND a.account_type = 'Expense'
        GROUP BY d.department_id, d.department_name;
        
        -- Calculate previous year expenses
        CREATE TEMP TABLE previous_year_expenses AS
        SELECT 
          d.department_id,
          COALESCE(SUM(f.amount), 0) AS expenses
        FROM dim_department d
        LEFT JOIN fact_financial f ON d.department_id = f.department_id
        LEFT JOIN dim_property p ON f.property_id = p.property_id
        LEFT JOIN dim_time t ON f.time_id = t.time_id
        LEFT JOIN dim_account a ON f.account_id = a.account_id
        WHERE 
          t.year = year - 1
          AND (p.property_name = property_name OR property_name IS NULL)
          AND a.account_type = 'Expense'
        GROUP BY d.department_id;
        
        -- Calculate total
        SELECT COALESCE(SUM(expenses), 0) INTO total FROM current_year_expenses;
        
        -- Return results
        RETURN QUERY
        SELECT 
          cy.department_id,
          cy.department_name,
          cy.expenses AS total_expenses,
          CASE WHEN total > 0 THEN cy.expenses / total ELSE 0 END AS percentage_of_total,
          CASE 
            WHEN py.expenses > 0 THEN (cy.expenses - py.expenses) / py.expenses
            ELSE 0
          END AS year_over_year_change
        FROM current_year_expenses cy
        LEFT JOIN previous_year_expenses py ON cy.department_id = py.department_id
        ORDER BY total_expenses DESC;
        
        -- Clean up temp tables
        DROP TABLE current_year_expenses;
        DROP TABLE previous_year_expenses;
      END;
      $$ LANGUAGE plpgsql;

      -- Quarterly Performance Tracking
      CREATE OR REPLACE FUNCTION get_quarterly_performance(year INTEGER, quarters INTEGER)
      RETURNS TABLE (
        property_id INTEGER,
        property_name VARCHAR,
        quarter INTEGER,
        revenue DECIMAL,
        expenses DECIMAL,
        profit DECIMAL,
        occupancy DECIMAL,
        adr DECIMAL,
        revpar DECIMAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          p.property_id,
          p.property_name,
          t.quarter,
          COALESCE(SUM(CASE WHEN a.account_type = 'Revenue' THEN f.amount ELSE 0 END), 0) AS revenue,
          COALESCE(SUM(CASE WHEN a.account_type = 'Expense' THEN f.amount ELSE 0 END), 0) AS expenses,
          COALESCE(SUM(CASE WHEN a.account_type = 'Revenue' THEN f.amount 
                            WHEN a.account_type = 'Expense' THEN -f.amount 
                            ELSE 0 END), 0) AS profit,
          COALESCE(AVG(m.occupancy), 0) AS occupancy,
          COALESCE(AVG(m.adr), 0) AS adr,
          COALESCE(AVG(m.revpar), 0) AS revpar
        FROM dim_property p
        CROSS JOIN (
          SELECT DISTINCT quarter FROM dim_time 
          WHERE year = $1 AND (quarter = $2 OR $2 IS NULL OR $2 > 4)
        ) t
        LEFT JOIN fact_financial f ON p.property_id = f.property_id
          AND f.time_id IN (SELECT time_id FROM dim_time WHERE year = $1 AND quarter = t.quarter)
        LEFT JOIN dim_account a ON f.account_id = a.account_id
        LEFT JOIN dim_market mk ON p.market_id = mk.market_id
        LEFT JOIN fact_market_data m ON mk.market_id = m.market_id
          AND m.time_id IN (SELECT time_id FROM dim_time WHERE year = $1 AND quarter = t.quarter)
        GROUP BY p.property_id, p.property_name, t.quarter
        ORDER BY p.property_name, t.quarter;
      END;
      $$ LANGUAGE plpgsql;

      -- Brand Performance Comparison
      CREATE OR REPLACE FUNCTION get_performance_by_brand(year INTEGER)
      RETURNS TABLE (
        brand_id INTEGER,
        brand_name VARCHAR,
        total_revenue DECIMAL,
        avg_revpar DECIMAL,
        avg_occupancy DECIMAL,
        property_count INTEGER
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          b.brand_id,
          b.brand_name,
          COALESCE(SUM(f.amount), 0) AS total_revenue,
          COALESCE(AVG(m.revpar), 0) AS avg_revpar,
          COALESCE(AVG(m.occupancy), 0) AS avg_occupancy,
          COUNT(DISTINCT p.property_id) AS property_count
        FROM dim_brand b
        LEFT JOIN dim_property p ON b.brand_id = p.brand_id
        LEFT JOIN fact_financial f ON p.property_id = f.property_id
          AND f.time_id IN (SELECT time_id FROM dim_time WHERE year = $1)
          AND f.account_id IN (SELECT account_id FROM dim_account WHERE account_type = 'Revenue')
        LEFT JOIN dim_market mk ON p.market_id = mk.market_id
        LEFT JOIN fact_market_data m ON mk.market_id = m.market_id
          AND m.time_id IN (SELECT time_id FROM dim_time WHERE year = $1)
        GROUP BY b.brand_id, b.brand_name
        ORDER BY total_revenue DESC;
      END;
      $$ LANGUAGE plpgsql;

      -- Occupancy Analysis
      CREATE OR REPLACE FUNCTION get_occupancy_by_property(year INTEGER, property_name VARCHAR)
      RETURNS TABLE (
        property_id INTEGER,
        property_name VARCHAR,
        month INTEGER,
        occupancy DECIMAL,
        market_occupancy DECIMAL,
        occupancy_index DECIMAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          p.property_id,
          p.property_name,
          t.month,
          COALESCE(AVG(pm.occupancy), 0) AS occupancy,
          COALESCE(AVG(mm.occupancy), 0) AS market_occupancy,
          CASE WHEN AVG(mm.occupancy) > 0 THEN
            AVG(pm.occupancy) / AVG(mm.occupancy)
          ELSE 0 END AS occupancy_index
        FROM dim_property p
        JOIN dim_market mk ON p.market_id = mk.market_id
        CROSS JOIN (
          SELECT DISTINCT month FROM dim_time 
          WHERE year = $1
        ) t
        LEFT JOIN fact_market_data pm ON p.market_id = pm.market_id
          AND pm.time_id IN (SELECT time_id FROM dim_time WHERE year = $1 AND month = t.month)
        LEFT JOIN fact_market_data mm ON mk.market_id = mm.market_id
          AND mm.time_id IN (SELECT time_id FROM dim_time WHERE year = $1 AND month = t.month)
        WHERE p.property_name = $2 OR $2 IS NULL
        GROUP BY p.property_id, p.property_name, t.month
        ORDER BY p.property_name, t.month;
      END;
      $$ LANGUAGE plpgsql;

      -- Market Trends Analysis
      CREATE OR REPLACE FUNCTION get_market_trends(market_name VARCHAR, start_year INTEGER, end_year INTEGER)
      RETURNS TABLE (
        year INTEGER,
        revpar DECIMAL,
        adr DECIMAL,
        occupancy DECIMAL,
        supply_growth DECIMAL,
        demand_growth DECIMAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          t.year,
          COALESCE(AVG(m.revpar), 0) AS revpar,
          COALESCE(AVG(m.adr), 0) AS adr,
          COALESCE(AVG(m.occupancy), 0) AS occupancy,
          COALESCE(AVG(m.supply_growth), 0) AS supply_growth,
          COALESCE(AVG(m.demand_growth), 0) AS demand_growth
        FROM dim_market mk
        CROSS JOIN (
          SELECT DISTINCT year FROM dim_time 
          WHERE year BETWEEN start_year AND end_year
        ) t
        LEFT JOIN fact_market_data m ON mk.market_id = m.market_id
          AND m.time_id IN (SELECT time_id FROM dim_time WHERE year = t.year)
        WHERE mk.market_name = market_name OR market_name IS NULL
        GROUP BY t.year
        ORDER BY t.year;
      END;
      $$ LANGUAGE plpgsql;

      -- Market Comparison
      CREATE OR REPLACE FUNCTION compare_markets(year INTEGER, top_count INTEGER)
      RETURNS TABLE (
        market_id INTEGER,
        market_name VARCHAR,
        avg_revpar DECIMAL,
        avg_adr DECIMAL,
        avg_occupancy DECIMAL,
        revpar_growth DECIMAL,
        rank INTEGER
      ) AS $$
      BEGIN
        RETURN QUERY
        WITH market_metrics AS (
          SELECT 
            mk.market_id,
            mk.market_name,
            COALESCE(AVG(m.revpar), 0) AS avg_revpar,
            COALESCE(AVG(m.adr), 0) AS avg_adr,
            COALESCE(AVG(m.occupancy), 0) AS avg_occupancy,
            COALESCE(AVG(m.demand_growth), 0) AS revpar_growth
          FROM dim_market mk
          LEFT JOIN fact_market_data m ON mk.market_id = m.market_id
            AND m.time_id IN (SELECT time_id FROM dim_time WHERE year = $1)
          GROUP BY mk.market_id, mk.market_name
        )
        SELECT 
          mm.market_id,
          mm.market_name,
          mm.avg_revpar,
          mm.avg_adr,
          mm.avg_occupancy,
          mm.revpar_growth,
          RANK() OVER (ORDER BY mm.avg_revpar DESC) AS rank
        FROM market_metrics mm
        ORDER BY avg_revpar DESC
        LIMIT CASE WHEN $2 > 0 THEN $2 ELSE NULL END;
      END;
      $$ LANGUAGE plpgsql;

      -- Budget vs Actual Analysis
      CREATE OR REPLACE FUNCTION get_budget_vs_actual(year INTEGER, property_name VARCHAR)
      RETURNS TABLE (
        month INTEGER,
        actual_revenue DECIMAL,
        budget_revenue DECIMAL,
        variance_revenue DECIMAL,
        variance_pct_revenue DECIMAL,
        actual_expense DECIMAL,
        budget_expense DECIMAL,
        variance_expense DECIMAL,
        variance_pct_expense DECIMAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          t.month,
          COALESCE(SUM(CASE WHEN f.is_budget = FALSE AND a.account_type = 'Revenue' THEN f.amount ELSE 0 END), 0) AS actual_revenue,
          COALESCE(SUM(CASE WHEN f.is_budget = TRUE AND a.account_type = 'Revenue' THEN f.amount ELSE 0 END), 0) AS budget_revenue,
          COALESCE(SUM(CASE WHEN a.account_type = 'Revenue' THEN 
            (CASE WHEN f.is_budget = FALSE THEN f.amount ELSE 0 END) - 
            (CASE WHEN f.is_budget = TRUE THEN f.amount ELSE 0 END)
          ELSE 0 END), 0) AS variance_revenue,
          CASE 
            WHEN SUM(CASE WHEN f.is_budget = TRUE AND a.account_type = 'Revenue' THEN f.amount ELSE 0 END) > 0 
            THEN COALESCE(
              SUM(CASE WHEN a.account_type = 'Revenue' THEN 
                (CASE WHEN f.is_budget = FALSE THEN f.amount ELSE 0 END) - 
                (CASE WHEN f.is_budget = TRUE THEN f.amount ELSE 0 END)
              ELSE 0 END) / 
              SUM(CASE WHEN f.is_budget = TRUE AND a.account_type = 'Revenue' THEN f.amount ELSE 0 END), 
              0
            )
            ELSE 0
          END AS variance_pct_revenue,
          COALESCE(SUM(CASE WHEN f.is_budget = FALSE AND a.account_type = 'Expense' THEN f.amount ELSE 0 END), 0) AS actual_expense,
          COALESCE(SUM(CASE WHEN f.is_budget = TRUE AND a.account_type = 'Expense' THEN f.amount ELSE 0 END), 0) AS budget_expense,
          COALESCE(SUM(CASE WHEN a.account_type = 'Expense' THEN 
            (CASE WHEN f.is_budget = FALSE THEN f.amount ELSE 0 END) - 
            (CASE WHEN f.is_budget = TRUE THEN f.amount ELSE 0 END)
          ELSE 0 END), 0) AS variance_expense,
          CASE 
            WHEN SUM(CASE WHEN f.is_budget = TRUE AND a.account_type = 'Expense' THEN f.amount ELSE 0 END) > 0 
            THEN COALESCE(
              SUM(CASE WHEN a.account_type = 'Expense' THEN 
                (CASE WHEN f.is_budget = FALSE THEN f.amount ELSE 0 END) - 
                (CASE WHEN f.is_budget = TRUE THEN f.amount ELSE 0 END)
              ELSE 0 END) / 
              SUM(CASE WHEN f.is_budget = TRUE AND a.account_type = 'Expense' THEN f.amount ELSE 0 END), 
              0
            )
            ELSE 0
          END AS variance_pct_expense
        FROM (
          SELECT DISTINCT month FROM dim_time 
          WHERE year = $1
        ) t
        JOIN dim_time dt ON dt.year = $1 AND dt.month = t.month
        JOIN dim_property p ON p.property_name = $2 OR $2 IS NULL
        LEFT JOIN fact_financial f ON p.property_id = f.property_id AND f.time_id = dt.time_id
        LEFT JOIN dim_account a ON f.account_id = a.account_id
        GROUP BY t.month
        ORDER BY t.month;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    try {
      await pool.query(storedProceduresQuery);
      console.log('Stored procedures created successfully');
    } catch (err) {
      console.error('Error creating stored procedures:', err.message);
      console.log('Continuing with setup...');
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();