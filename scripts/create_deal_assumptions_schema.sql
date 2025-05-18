-- Database Schema for Deal Assumptions and Metrics
-- Following star schema design with fact_deal table as center 
-- and dimension tables for various assumptions and metrics

-- ---------------------
-- DIMENSION TABLES
-- ---------------------

-- Property dimension table (already exists)
-- -------------------------------------
-- CREATE TABLE dim_property (
--     property_key SERIAL PRIMARY KEY,
--     property_name VARCHAR(255) NOT NULL,
--     property_address VARCHAR(255),
--     city VARCHAR(100),
--     state VARCHAR(50),
--     number_of_rooms INT,
--     property_type VARCHAR(50)
-- );

-- Acquisition dimension table
-- -------------------------------------
CREATE TABLE dim_acquisition (
    acquisition_id SERIAL PRIMARY KEY,
    acquisition_month VARCHAR(10) NOT NULL,
    acquisition_year INT NOT NULL,
    acquisition_costs NUMERIC(5,2), -- Percentage
    cap_rate_going_in NUMERIC(5,2), -- Percentage
    hold_period INT NOT NULL,
    purchase_price NUMERIC(15,2),
    purchase_price_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financing dimension table
-- -------------------------------------
CREATE TABLE dim_financing (
    financing_id SERIAL PRIMARY KEY,
    loan_to_value NUMERIC(5,2), -- Percentage
    loan_amount NUMERIC(15,2),
    interest_rate NUMERIC(5,2), -- Percentage
    loan_term INT, -- Years
    amortization_period INT, -- Years
    debt_coverage_ratio NUMERIC(5,2),
    lender_fee NUMERIC(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disposition dimension table
-- -------------------------------------
CREATE TABLE dim_disposition (
    disposition_id SERIAL PRIMARY KEY,
    exit_cap_rate NUMERIC(5,2), -- Percentage
    selling_costs NUMERIC(5,2), -- Percentage
    terminal_value NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Capital Expense dimension table
-- -------------------------------------
CREATE TABLE dim_capital_expense (
    capital_expense_id SERIAL PRIMARY KEY,
    capex_budget NUMERIC(15,2),
    capex_per_room NUMERIC(15,2),
    capex_contingency NUMERIC(5,2), -- Percentage
    capex_timeline_months INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inflation Assumptions dimension table
-- -------------------------------------
CREATE TABLE dim_inflation (
    inflation_id SERIAL PRIMARY KEY,
    revenue_inflation NUMERIC(5,2), -- Percentage
    expense_inflation NUMERIC(5,2), -- Percentage
    tax_inflation NUMERIC(5,2), -- Percentage
    insurance_inflation NUMERIC(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Penetration Analysis dimension table
-- -------------------------------------
CREATE TABLE dim_penetration (
    penetration_id SERIAL PRIMARY KEY,
    market_occupancy NUMERIC(5,2), -- Percentage
    fair_share NUMERIC(5,2), -- Percentage
    penetration_rate NUMERIC(5,2), -- Percentage
    stabilized_occupancy NUMERIC(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operating Revenue dimension table
-- -------------------------------------
CREATE TABLE dim_operating_revenue (
    revenue_id SERIAL PRIMARY KEY,
    adr_base NUMERIC(10,2),
    adr_growth NUMERIC(5,2), -- Percentage
    rooms_revenue_mix NUMERIC(5,2), -- Percentage
    fnb_revenue_mix NUMERIC(5,2), -- Percentage
    other_revenue_mix NUMERIC(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departmental Expenses dimension table
-- -------------------------------------
CREATE TABLE dim_departmental_expenses (
    dept_expense_id SERIAL PRIMARY KEY,
    rooms_expense_pct NUMERIC(5,2), -- Percentage
    fnb_expense_pct NUMERIC(5,2), -- Percentage
    other_expense_pct NUMERIC(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Management & Franchise Fees dimension table
-- -------------------------------------
CREATE TABLE dim_management_fees (
    mgmt_fee_id SERIAL PRIMARY KEY,
    mgmt_fee_pct NUMERIC(5,2), -- Percentage
    franchise_fee_pct NUMERIC(5,2), -- Percentage
    royalty_fee_pct NUMERIC(5,2), -- Percentage
    marketing_fee_pct NUMERIC(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Undistributed Expenses 1 dimension table
-- -------------------------------------
CREATE TABLE dim_undistributed_expenses_1 (
    undist1_id SERIAL PRIMARY KEY,
    admin_general_pct NUMERIC(5,2), -- Percentage
    info_telecom_pct NUMERIC(5,2), -- Percentage
    marketing_pct NUMERIC(5,2), -- Percentage
    prop_operations_pct NUMERIC(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Undistributed Expenses 2 dimension table
-- -------------------------------------
CREATE TABLE dim_undistributed_expenses_2 (
    undist2_id SERIAL PRIMARY KEY,
    utilities_pct NUMERIC(5,2), -- Percentage
    property_tax NUMERIC(15,2),
    insurance NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Non-Operating Expenses dimension table
-- -------------------------------------
CREATE TABLE dim_non_operating_expenses (
    nonop_expense_id SERIAL PRIMARY KEY,
    replacement_reserve_pct NUMERIC(5,2), -- Percentage
    interest_expense NUMERIC(15,2),
    depreciation NUMERIC(15,2),
    income_tax_rate NUMERIC(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FF&E Reserve dimension table
-- -------------------------------------
CREATE TABLE dim_ffe_reserve (
    ffe_id SERIAL PRIMARY KEY,
    ffe_reserve_pct NUMERIC(5,2), -- Percentage
    ffe_per_room NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------
-- METRICS TABLE
-- ---------------------

-- Key Metrics table
-- -------------------------------------
CREATE TABLE fact_deal_metrics (
    metric_id SERIAL PRIMARY KEY,
    deal_id INT NOT NULL,
    irr NUMERIC(5,2),
    cap_rate NUMERIC(5,2),
    cash_on_cash NUMERIC(5,2),
    adr NUMERIC(10,2),
    revpar NUMERIC(10,2),
    noi NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(deal_id) ON DELETE CASCADE
);

-- ---------------------
-- FACT TABLE
-- ---------------------

-- The central fact table connecting all dimensions
-- -------------------------------------
CREATE TABLE fact_deal_assumptions (
    assumption_id SERIAL PRIMARY KEY,
    deal_id INT NOT NULL,
    acquisition_id INT,
    financing_id INT,
    disposition_id INT,
    capital_expense_id INT,
    inflation_id INT,
    penetration_id INT,
    revenue_id INT,
    dept_expense_id INT,
    mgmt_fee_id INT,
    undist1_id INT,
    undist2_id INT,
    nonop_expense_id INT,
    ffe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    created_by INT NOT NULL,
    updated_by INT,
    FOREIGN KEY (deal_id) REFERENCES deals(deal_id) ON DELETE CASCADE,
    FOREIGN KEY (acquisition_id) REFERENCES dim_acquisition(acquisition_id),
    FOREIGN KEY (financing_id) REFERENCES dim_financing(financing_id),
    FOREIGN KEY (disposition_id) REFERENCES dim_disposition(disposition_id),
    FOREIGN KEY (capital_expense_id) REFERENCES dim_capital_expense(capital_expense_id),
    FOREIGN KEY (inflation_id) REFERENCES dim_inflation(inflation_id),
    FOREIGN KEY (penetration_id) REFERENCES dim_penetration(penetration_id),
    FOREIGN KEY (revenue_id) REFERENCES dim_operating_revenue(revenue_id),
    FOREIGN KEY (dept_expense_id) REFERENCES dim_departmental_expenses(dept_expense_id),
    FOREIGN KEY (mgmt_fee_id) REFERENCES dim_management_fees(mgmt_fee_id),
    FOREIGN KEY (undist1_id) REFERENCES dim_undistributed_expenses_1(undist1_id),
    FOREIGN KEY (undist2_id) REFERENCES dim_undistributed_expenses_2(undist2_id),
    FOREIGN KEY (nonop_expense_id) REFERENCES dim_non_operating_expenses(nonop_expense_id),
    FOREIGN KEY (ffe_id) REFERENCES dim_ffe_reserve(ffe_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ---------------------
-- API FUNCTIONS
-- ---------------------

-- Function to update metrics when assumptions change
CREATE OR REPLACE FUNCTION update_deal_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and update metrics based on changes
    -- This is a simplified example - actual calculations would be more complex
    INSERT INTO fact_deal_metrics (
        deal_id, 
        irr, 
        cap_rate,
        cash_on_cash,
        adr,
        revpar,
        noi,
        created_at,
        updated_at
    )
    SELECT 
        NEW.deal_id,
        COALESCE((SELECT cap_rate_going_in * 1.5 FROM dim_acquisition WHERE acquisition_id = NEW.acquisition_id), 12.5),
        COALESCE((SELECT cap_rate_going_in FROM dim_acquisition WHERE acquisition_id = NEW.acquisition_id), 8.5),
        COALESCE((SELECT cap_rate_going_in * 1.08 FROM dim_acquisition WHERE acquisition_id = NEW.acquisition_id), 9.2),
        COALESCE((SELECT adr_base FROM dim_operating_revenue WHERE revenue_id = NEW.revenue_id), 195.0),
        COALESCE((SELECT adr_base * stabilized_occupancy / 100 FROM dim_operating_revenue JOIN dim_penetration ON 1=1 WHERE revenue_id = NEW.revenue_id AND penetration_id = NEW.penetration_id), 156.0),
        1000000, -- Default NOI value
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ON CONFLICT (deal_id) 
    DO UPDATE SET
        irr = EXCLUDED.irr,
        cap_rate = EXCLUDED.cap_rate,
        cash_on_cash = EXCLUDED.cash_on_cash,
        adr = EXCLUDED.adr,
        revpar = EXCLUDED.revpar,
        noi = EXCLUDED.noi,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics when assumptions change
CREATE TRIGGER after_assumption_update
AFTER INSERT OR UPDATE ON fact_deal_assumptions
FOR EACH ROW
EXECUTE FUNCTION update_deal_metrics();
