-- DROP FUNCTION public.summarize_data_comparison(int4, varchar);

CREATE OR REPLACE FUNCTION public.summarize_data_comparison(p_year integer, p_property_name character varying DEFAULT NULL::character varying)
 RETURNS TABLE(data_source character varying, record_count bigint, total_amount numeric, match_status character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH comparison AS (
        SELECT * FROM compare_excel_with_database(p_year, p_property_name)
    )
    SELECT 
        'Database' AS data_source,
        COUNT(*) AS record_count,
        SUM(amount) AS total_amount,
        'Records Only in Database' AS match_status
    FROM 
        comparison
    WHERE 
        source = 'Database'
    
    UNION ALL
    
    SELECT 
        'Excel' AS data_source,
        COUNT(*) AS record_count,
        SUM(amount) AS total_amount,
        'Records Only in Excel' AS match_status
    FROM 
        comparison
    WHERE 
        source = 'Excel'
    
    UNION ALL
    
    SELECT 
        'Both' AS data_source,
        COUNT(*) AS record_count,
        SUM(db.amount) AS total_amount,
        'Matching Records' AS match_status
    FROM 
        fact_financial f
    JOIN 
        dim_property p ON f.property_key = p.property_key
    JOIN 
        dim_time t ON f.time_key = t.time_key
    JOIN 
        dim_account a ON f.account_key = a.account_key
    JOIN 
        dim_account_type at ON a.account_type_key = at.account_type_key
    JOIN 
        dim_account_class ac ON a.account_class_key = ac.account_class_key
    JOIN 
        dim_financial_type ft ON a.financial_type_key = ft.financial_type_key
    JOIN 
        dim_department d ON f.department_key = d.department_key
    JOIN 
        dim_department_type dt ON d.department_type_key = dt.department_type_key
    JOIN 
        excel_import excel ON  -- This would be your actual imported Excel data table
            p.operating_unit = excel.operating_unit AND
            t.year = excel.year::INTEGER AND
            t.month = excel.month::INTEGER AND
            ft.financial_type_name = excel.financial_type AND
            at.account_type_name = excel.account_type AND
            ac.account_class_name = excel.account_class AND
            dt.department_type_name = excel.department_type AND
            ABS(f.amount - excel.amount::NUMERIC) < 0.01  -- Allow for small rounding differences
    WHERE 
        t.year = p_year
        AND (p_property_name IS NULL OR p.operating_unit = p_property_name)
    
    ORDER BY 
        match_status;
END;
$function$
;
