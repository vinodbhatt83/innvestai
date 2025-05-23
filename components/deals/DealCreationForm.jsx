import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedPropertyDetailsForm from './EnhancedPropertyDetailsForm';
import AcquisitionForm from './AcquisitionForm';
import FinancingForm from './FinancingForm';
import DispositionForm from './DispositionForm';
import CapitalExpenseForm from './CapitalExpenseForm';
import InflationForm from './InflationForm';
import PenetrationForm from './PenetrationForm';
import RevenueForm from './RevenueForm';
import DepartmentalExpensesForm from './DepartmentalExpensesForm';
import ManagementForm from './ManagementForm';
import UndistributedExpenses1Form from './UndistributedExpenses1Form';
import UndistributedExpenses2Form from './UndistributedExpenses2Form';
import NonOperatingForm from './NonOperatingForm';
import FFEReserveForm from './FFEReserveForm';
import DealMetrics from './DealMetrics';
import SuccessModal from '../common/SuccessModal';
import { validatePropertyDetailsForm, validateAcquisitionForm, validateFinalForm } from '../../utils/validation';
import { saveDealAssumptionTab, calculateMetrics } from '../../utils/dealAssumptions';

function DealCreationForm() {
    const router = useRouter();
    
    // Current active step
    const [activeStep, setActiveStep] = useState('property');
      // Deal metrics state
    const [metrics, setMetrics] = useState({
        irr: 12.5,
        capRate: 8.5,
        cashOnCash: 9.2,
        adr: 195.0
    });
    
    // Previous metrics state for change detection and animations
    const [previousMetrics, setPreviousMetrics] = useState(null);
    
    // Deal created flag
    const [dealCreated, setDealCreated] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        // Property Details
        property_name: '',
        property_address: '',
        city: '',
        state: '',
        number_of_rooms: '',
        property_type: '',
        key_money: '',
        version_name: '',
        property_key: null, // Will be populated if selected from dropdown

        // Acquisition
        acquisition_month: '',
        acquisition_year: new Date().getFullYear(),
        acquisition_costs: '',
        cap_rate_going_in: '',
        hold_period: 5,
        purchase_price: '',
        purchase_price_method: '',

        // All other form fields with defaults...
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
        status: 'Draft'
    });

    // Success/Error message state
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Validation errors state
    const [validationErrors, setValidationErrors] = useState({});
    
    // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingTab, setIsSavingTab] = useState(false);
    
    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdDealId, setCreatedDealId] = useState(null);    // Function to submit deal data directly
    const submitDeal = async (dealData) => {
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        
        console.log('Submitting deal data:', dealData);
        
        try {
            // Create the deal in the database
            const response = await fetch('/api/deals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dealData),
            });

            const result = await response.json();
            console.log('API response:', result);

            if (response.ok) {
                // Record that deal is created
                setDealCreated(true);
                
                // Store the created deal ID
                setCreatedDealId(result.deal_id || result.id);
                
                // Calculate initial metrics based on deal data
                const initialCapRate = parseFloat(dealData.expected_return) || 8.5;
                const holdPeriod = parseInt(dealData.hold_period) || 5;
                
                // Update metrics based on submitted deal data
                const initialMetrics = {
                    irr: 12.5 + (holdPeriod > 7 ? 1.5 : 0),
                    capRate: initialCapRate,
                    cashOnCash: initialCapRate * 1.08,
                    adr: 195.0
                };
                
                setMetrics(initialMetrics);
                  // If this is a final submission (from the last tab), save all tabs' data
                if (activeStep === 'ffe-reserve') {
                    try {
                        // Save the assumption data for the current tab first
                        await saveDealAssumptionTab('ffe-reserve', result.deal_id || result.id, formData);
                        console.log('Successfully saved FFE Reserve data');
                    } catch (error) {
                        console.error('Error saving FFE Reserve data:', error);
                        setMessage({
                            type: 'error',
                            text: `Error saving FFE Reserve data: ${error.message || 'Unknown error'}`
                        });
                    }
                }
                
                // Show success modal with option to stay or go to details
                setShowSuccessModal(true);
                
                // Set next step to acquisition tab but don't navigate yet
                // The user will decide whether to continue or view details via the modal
                setActiveStep('acquisition');
                
                // Track activity
                try {
                    await fetch('/api/activity-log', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            activity_type: 'deal_created',
                            deal_id: result.deal_id || result.id,
                            description: `Created deal for ${dealData.property_name}`,
                            data: JSON.stringify(dealData)
                        }),
                    });
                } catch (logError) {
                    console.error('Failed to log activity:', logError);
                    // Non-critical error, don't throw
                }
            } else {
                throw new Error(result.error || 'Failed to create deal');
            }
        } catch (error) {
            console.error('Error creating deal:', error);
            setMessage({
                type: 'error',
                text: `Error creating deal: ${error.message}`
            });
        } finally {
            setIsSubmitting(false);
        }
    };    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Handle numeric fields to prevent overflow errors
        let processedValue = value;
        
        // Check if the field is likely a numeric field based on name patterns
        const isNumericField = /price|rate|amount|cost|number|total|adr|revpar/.test(name.toLowerCase());
        
        if (isNumericField && value !== '') {
            // Ensure we have a valid number and limit its size
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                // Cap the value at a safe limit to prevent overflow (using SQL max int as guideline)
                const MAX_SAFE_VALUE = 2147483647;
                processedValue = Math.min(numValue, MAX_SAFE_VALUE);
                
                // If the value is a whole number and the field name suggests it should be, convert to integer
                if (Number.isInteger(numValue) && /number|count|quantity|rooms/.test(name.toLowerCase())) {
                    processedValue = Math.floor(processedValue);
                }
            }
        }
        
        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
      // Handle property selection from dropdown
    const handlePropertySelect = (property) => {
        console.log("Selected property:", property);
        
        // Get property ID field name
        const propertyIdField = property.property_key ? 'property_key' : 
                              property.property_id ? 'property_id' : 'id';
        
        // Extract all available property information
        const propertyName = property.property_name || property.name || '';
        const propertyAddress = property.property_address || property.address || '123 Main Street'; // Default value if missing
        const city = property.city || property.city_name || 'Brooklyn'; // Default value if missing
        const state = property.state || property.state_name || 'NY'; // Default value if missing
        const rooms = property.number_of_rooms || property.rooms || 100; // Default value if missing
        const propertyType = property.property_type || property.type || 'Luxury'; // Default value if missing
        
        // Set form data with selected property and ensure all required fields have values
        setFormData(prev => ({
            ...prev,
            property_key: property[propertyIdField],
            property_name: propertyName,
            property_address: propertyAddress,
            city: city,
            state: state,
            number_of_rooms: rooms,
            property_type: propertyType || 'Luxury', // Ensure property type has a value
            deal_name: `${propertyName} Investment` // Add deal_name to ensure it's available
        }));
        
        // Clear validation errors for property fields
        setValidationErrors({});
          // Automatically submit the form after a short delay
        setTimeout(() => {
            // Create deal data - using the prepareTabDataForSubmission to get any default values
            // This ensures property submission gets the same default handling as other tabs
            const preparedFormData = prepareTabDataForSubmission();
            
            const dealData = {
                deal_name: preparedFormData.deal_name,
                property_key: property[propertyIdField],
                property_name: preparedFormData.property_name,
                property_address: preparedFormData.property_address,
                city: preparedFormData.city,
                state: preparedFormData.state,
                number_of_rooms: preparedFormData.number_of_rooms,
                property_type: preparedFormData.property_type,
                investment_amount: preparedFormData.purchase_price || 1000000, // Default value
                expected_return: preparedFormData.cap_rate_going_in || 8.5, // Default value
                hold_period: preparedFormData.hold_period || 5, // Default value
                start_date: preparedFormData.start_date || new Date().toISOString().split('T')[0],
                end_date: preparedFormData.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
                status: 'Draft'
            };
            
            // Directly submit the deal data
            submitDeal(dealData);
        }, 500);
    };    // Handle form submission (for manual submission)
    const handleSubmit = async () => {
        setMessage({ type: '', text: '' });
        
        // Validate the form
        const validation = validateFinalForm(formData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            setActiveStep('property'); // Go back to property step if there are errors
            setMessage({
                type: 'error',
                text: 'Please fix the validation errors before submitting.'
            });
            return;
        }

        // If the deal has already been created, make sure we save the current tab first
        if (dealCreated && createdDealId) {
            console.log(`Deal already exists with ID: ${createdDealId}. Saving current tab first.`);
            const saved = await saveCurrentTab();
            if (!saved) {
                console.error(`Failed to save the current ${activeStep} tab. Stopping submission.`);
                return; // Don't proceed if there was an error saving the current tab
            }
        } else {
            console.log('Creating new deal from form submission');
        }

        // Prepare data for submission, using the prepared tab data function to get defaults
        const preparedData = prepareTabDataForSubmission();
        
        const dealData = {
            deal_name: preparedData.deal_name || `${preparedData.property_name} Investment`,
            property_key: preparedData.property_key,
            property_name: preparedData.property_name,
            property_address: preparedData.property_address,
            city: preparedData.city,
            state: preparedData.state,
            number_of_rooms: preparedData.number_of_rooms,
            property_type: preparedData.property_type,
            investment_amount: preparedData.purchase_price || 1000000, // Default if not provided
            expected_return: preparedData.cap_rate_going_in || 8.5, // Default if not provided
            hold_period: preparedData.hold_period || 5,
            start_date: preparedData.start_date || new Date().toISOString().split('T')[0],
            end_date: preparedData.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
            status: preparedData.status || 'Draft'
        };
        
        console.log('Submitting prepared deal data:', dealData);
        submitDeal(dealData);
    };// Handle success modal navigation
    const handleSuccessModalClose = async () => {
        setShowSuccessModal(false);
        
        // Show loading state
        setMessage({
            type: 'success',
            text: 'Finalizing deal data. Please wait...'
        });
        
        if (createdDealId) {
            try {
                // Save the first tab (ffe-reserve) data if we're on the final step
                // This ensures all data is saved before redirecting
                if (activeStep === 'ffe-reserve') {
                    const preparedData = prepareTabDataForSubmission();
                    await saveDealAssumptionTab('ffe-reserve', createdDealId, preparedData);
                }
                
                // Redirect to deal details page
                router.push(`/deals/${createdDealId}`);
            } catch (error) {
                console.error('Error saving final data:', error);
                setMessage({
                    type: 'error',
                    text: `Error finalizing deal: ${error.message || 'Unknown error'}`
                });
                
                // Still allow user to navigate after a delay even if there was an error
                setTimeout(() => {
                    router.push(`/deals/${createdDealId}`);
                }, 3000);
            }
        }
    };
      // Handle stay on the page and continue with assumptions
    const handleStayAndContinue = () => {
        setShowSuccessModal(false);
        // We've already set activeStep to acquisition in submitDeal
        
        // Show a temporary confirmation message
        setMessage({
            type: 'success',
            text: 'Deal created successfully! You can now continue adding assumptions tab by tab.'
        });
        
        // Clear the message after a few seconds
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 5000);
    };    // Save current tab data
    const saveCurrentTab = async () => {
        // Don't try to save if the deal hasn't been created yet
        if (!dealCreated || !createdDealId) {
            return true;
        }
        
        setIsSavingTab(true);
        setMessage({ type: '', text: '' });
        
        try {
            console.log(`Saving ${activeStep} tab for deal ${createdDealId}`);
            
            // Prepare form data with default values as needed
            const preparedData = prepareTabDataForSubmission();
            console.log(`Prepared ${activeStep} data with defaults:`, preparedData);
            
            // Always make sure deal_id is included in all tab data
            preparedData.deal_id = createdDealId;
            
            // Add a consistent key format that our API expects
            if (formData.property_key) {
                preparedData.property_key = formData.property_key;
            }
            
            // Save the tab data to the database 
            const result = await saveDealAssumptionTab(activeStep, createdDealId, preparedData);
            console.log(`Successfully saved ${activeStep} tab:`, result);
            
            // Show a temporary success message with proper tab name formatting
            const tabName = activeStep.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            setMessage({
                type: 'success',
                text: `${tabName} saved successfully!`
            });
            
            // Clear the message after 2 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 2000);
            
            // Calculate updated metrics if needed
            if (['acquisition', 'financing', 'disposition'].includes(activeStep)) {
                const updatedMetrics = calculateMetrics(formData);
                setPreviousMetrics(metrics);
                setMetrics(updatedMetrics);
            }
            
            return true;
        } catch (error) {
            console.error(`Error saving ${activeStep} tab:`, error);
            
            // Extract more detailed error message if available
            let errorMessage = error.message || 'Unknown error';
            if (error.response) {
                errorMessage = error.response.message || error.response.error || error.response.details || errorMessage;
            }
            
            // Provide more helpful context in the error message
            const tabName = activeStep.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            setMessage({
                type: 'error',
                text: `Error saving ${tabName} data: ${errorMessage}`
            });
            
            // Log detailed error for debugging
            console.error('Full error details:', {
                step: activeStep,
                dealId: createdDealId,
                errorDetails: error
            });
            
            return false;
        } finally {
            setIsSavingTab(false);
        }
    };// Ensure all required fields have default values before submitting
    const prepareTabDataForSubmission = () => {
        // Make a copy of form data to avoid modifying state directly
        const preparedData = { ...formData };
        
        console.log(`Preparing data for ${activeStep} tab submission`);
        
        // Add default deal_id to all submissions
        if (createdDealId) {
            preparedData.deal_id = createdDealId;
        }
        
        switch (activeStep) {
            case 'property':
                // Add defaults for property tab
                if (!preparedData.deal_name) preparedData.deal_name = `${preparedData.property_name || 'New'} Investment`;
                if (!preparedData.property_name) preparedData.property_name = 'New Property';
                if (!preparedData.property_address) preparedData.property_address = '';
                if (!preparedData.city) preparedData.city = '';
                if (!preparedData.state) preparedData.state = '';
                if (!preparedData.property_type) preparedData.property_type = 'Hotel';
                if (!preparedData.number_of_rooms) preparedData.number_of_rooms = 100;
                if (!preparedData.status) preparedData.status = 'Draft';
                break;
            
            case 'acquisition':
                // Add defaults for acquisition tab
                if (!preparedData.acquisition_month) preparedData.acquisition_month = new Date().getMonth() + 1;
                if (!preparedData.acquisition_year) preparedData.acquisition_year = new Date().getFullYear();
                if (!preparedData.acquisition_costs) preparedData.acquisition_costs = 0;
                if (!preparedData.cap_rate_going_in) preparedData.cap_rate_going_in = 8.0;
                if (!preparedData.hold_period) preparedData.hold_period = 5;
                if (!preparedData.purchase_price) preparedData.purchase_price = 1000000;
                if (!preparedData.purchase_price_method) preparedData.purchase_price_method = 'Per Room';
                if (!preparedData.purchase_price_per_key && preparedData.number_of_rooms && preparedData.purchase_price) {
                    preparedData.purchase_price_per_key = Math.round(preparedData.purchase_price / preparedData.number_of_rooms);
                } else if (!preparedData.purchase_price_per_key) {
                    preparedData.purchase_price_per_key = 100000;
                }
                break;
                
            case 'financing':
                // Add defaults for financing tab
                if (!preparedData.loan_to_value) preparedData.loan_to_value = 65;
                if (!preparedData.interest_rate) preparedData.interest_rate = 4.5;
                if (!preparedData.loan_term) preparedData.loan_term = 5;
                if (!preparedData.amortization_period) preparedData.amortization_period = 30;
                if (!preparedData.debt_amount) preparedData.debt_amount = preparedData.purchase_price ? Math.round(preparedData.purchase_price * 0.65) : 650000;
                if (!preparedData.equity_amount) preparedData.equity_amount = preparedData.purchase_price ? Math.round(preparedData.purchase_price * 0.35) : 350000;
                if (!preparedData.lender_fee) preparedData.lender_fee = 1.0;
                if (!preparedData.debt_coverage_ratio) preparedData.debt_coverage_ratio = 1.25;
                break;
                
            case 'disposition':
                // Add defaults for disposition tab
                if (!preparedData.cap_rate_exit) preparedData.cap_rate_exit = preparedData.cap_rate_going_in ? parseFloat(preparedData.cap_rate_going_in) + 0.5 : 8.5;
                if (!preparedData.sales_expense) preparedData.sales_expense = 2.0;
                if (!preparedData.disposition_month) preparedData.disposition_month = 12;
                if (!preparedData.disposition_year) {
                    const baseYear = preparedData.acquisition_year ? parseInt(preparedData.acquisition_year) : new Date().getFullYear();
                    const holdPeriod = preparedData.hold_period ? parseInt(preparedData.hold_period) : 5;
                    preparedData.disposition_year = baseYear + holdPeriod;
                }
                break;
                
            case 'capital':
                // Add defaults for Capital Expense tab
                if (!preparedData.capex_type) preparedData.capex_type = 'Standard';
                if (!preparedData.owner_funded_capex) preparedData.owner_funded_capex = 10.0;
                if (!preparedData.capital_expense_year1) preparedData.capital_expense_year1 = 0;
                if (!preparedData.capital_expense_year2) preparedData.capital_expense_year2 = 0;
                if (!preparedData.capital_expense_year3) preparedData.capital_expense_year3 = 0;
                if (!preparedData.capital_expense_year4) preparedData.capital_expense_year4 = 0;
                if (!preparedData.capital_expense_year5) preparedData.capital_expense_year5 = 0;
                break;
                
            case 'inflation':
                // Add defaults for Inflation tab
                if (!preparedData.inflation_rate_general) preparedData.inflation_rate_general = 2.5;
                if (!preparedData.inflation_rate_revenue) preparedData.inflation_rate_revenue = 3.0;
                if (!preparedData.inflation_rate_expenses) preparedData.inflation_rate_expenses = 2.8;
                if (!preparedData.inflation_assumptions) preparedData.inflation_assumptions = 'Standard';
                break;
                
            case 'penetration':
                // Add defaults for Penetration Analysis tab
                if (!preparedData.comp_name) preparedData.comp_name = 'Comp Set A';
                if (!preparedData.comp_nbr_of_rooms) preparedData.comp_nbr_of_rooms = preparedData.number_of_rooms || 100;
                if (!preparedData.market_adr_change) preparedData.market_adr_change = 3.0;
                if (!preparedData.market_occupancy_pct) preparedData.market_occupancy_pct = 70.0;
                if (!preparedData.market_penetration) preparedData.market_penetration = 100.0;
                if (!preparedData.occupied_room_growth_pct) preparedData.occupied_room_growth_pct = 2.0;
                if (!preparedData.property_adr_change) preparedData.property_adr_change = 3.5;
                if (!preparedData.sample_hotel_occupancy) preparedData.sample_hotel_occupancy = 75.0;
                break;
                
            case 'operating-revenue':
                // Add defaults for Operating Revenue tab
                if (!preparedData.adr_base) preparedData.adr_base = 195.0;
                if (!preparedData.adr_growth) preparedData.adr_growth = 3.0;
                if (!preparedData.other_revenue_percentage) preparedData.other_revenue_percentage = 25.0;
                if (!preparedData.revpar_base) preparedData.revpar_base = preparedData.adr_base * 0.75;
                if (!preparedData.revenues_total) preparedData.revenues_total = 0;
                break;
                
            case 'departmental-expenses':
                // Add defaults for Departmental Expenses tab
                if (!preparedData.rooms_expense_par) preparedData.rooms_expense_par = 35.0;
                if (!preparedData.rooms_expense_por) preparedData.rooms_expense_por = 25.0;
                if (!preparedData.food_beverage_expense_par) preparedData.food_beverage_expense_par = 20.0;
                if (!preparedData.food_beverage_expense_por) preparedData.food_beverage_expense_por = 75.0;
                if (!preparedData.other_dept_expense_par) preparedData.other_dept_expense_par = 10.0;
                if (!preparedData.other_dept_expense_por) preparedData.other_dept_expense_por = 50.0;
                if (!preparedData.expenses_total) preparedData.expenses_total = 0;
                break;
                
            case 'management-franchise':
                // Add defaults for Management & Franchise tab
                if (!preparedData.management_fee_base) preparedData.management_fee_base = 3.0;
                if (!preparedData.management_fee_incentive) preparedData.management_fee_incentive = 10.0;
                if (!preparedData.management_fee_percentage) preparedData.management_fee_percentage = 3.0;
                if (!preparedData.franchise_fee_base) preparedData.franchise_fee_base = 5.0;
                if (!preparedData.franchise_fee_percentage) preparedData.franchise_fee_percentage = 5.0;
                if (!preparedData.brand_marketing_fee) preparedData.brand_marketing_fee = 2.0;
                break;
                
            case 'undistributed-expenses-1':
                // Add defaults for Undistributed Expenses 1 tab
                if (!preparedData.admin_general_par) preparedData.admin_general_par = 15.0;
                if (!preparedData.admin_general_por) preparedData.admin_general_por = 6.0;
                if (!preparedData.sales_marketing_par) preparedData.sales_marketing_par = 12.0;
                if (!preparedData.sales_marketing_por) preparedData.sales_marketing_por = 5.0;
                if (!preparedData.property_ops_maintenance_par) preparedData.property_ops_maintenance_par = 15.0;
                if (!preparedData.property_ops_maintenance_por) preparedData.property_ops_maintenance_por = 6.0;
                break;
                
            case 'undistributed-expenses-2':
                // Add defaults for Undistributed Expenses 2 tab
                if (!preparedData.utilities_costs_par) preparedData.utilities_costs_par = 10.0;
                if (!preparedData.utilities_costs_por) preparedData.utilities_costs_por = 4.0;
                if (!preparedData.it_systems_par) preparedData.it_systems_par = 5.0;
                if (!preparedData.it_systems_por) preparedData.it_systems_por = 2.0;
                break;
                
            case 'non-operating-expenses':
                // Add defaults for Non-Operating Expenses tab
                if (!preparedData.property_taxes_par) preparedData.property_taxes_par = 25.0;
                if (!preparedData.property_taxes_por) preparedData.property_taxes_por = 4.5;
                if (!preparedData.insurance_par) preparedData.insurance_par = 8.0;
                if (!preparedData.insurance_por) preparedData.insurance_por = 1.5;
                if (!preparedData.income_tax_rate) preparedData.income_tax_rate = 21.0;
                break;
                
            case 'ffe-reserve':
                // Add defaults for FFE Reserve tab
                if (!preparedData.ffe_reserve_percentage) preparedData.ffe_reserve_percentage = 4.0;
                if (!preparedData.ffe_reserve_par) preparedData.ffe_reserve_par = 2000;
                if (!preparedData.ffe_reserve_minimum) preparedData.ffe_reserve_minimum = 1500;
                break;
        }
        
        return preparedData;
    };

    // Validate current step before moving to next
    const validateCurrentStep = () => {
        switch (activeStep) {
            case 'property':
                const propertyValidation = validatePropertyDetailsForm(formData);
                if (!propertyValidation.isValid) {
                    setValidationErrors(propertyValidation.errors);
                    setMessage({
                        type: 'error',
                        text: 'Please fix the validation errors before proceeding.'
                    });
                    return false;
                }
                return true;
                
            case 'acquisition':
                const acquisitionValidation = validateAcquisitionForm(formData);
                if (!acquisitionValidation.isValid) {
                    setValidationErrors(acquisitionValidation.errors);
                    setMessage({
                        type: 'error',
                        text: 'Please fix the validation errors before proceeding.'
                    });
                    return false;
                }
                return true;
                
            // Add similar validation for other steps as needed
                
            default:
                return true;
        }
    };    // Handle moving to the next step
    const handleNext = async () => {
        // Validate current step before proceeding
        if (!validateCurrentStep()) {
            return;
        }
        
        // Save current tab data if deal is created
        if (dealCreated && createdDealId) {
            const saved = await saveCurrentTab();
            if (!saved) {
                return;
            }
            
            // Show a temporary success message for tab save
            if (activeStep !== 'property') {
                setMessage({
                    type: 'success',
                    text: `${activeStep.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} data saved successfully! Proceeding to next step...`
                });
                
                // Give time for the user to see the success message
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        // Clear any previous error messages
        setMessage({ type: '', text: '' });
        
        switch (activeStep) {
            case 'property':
                setActiveStep('acquisition');
                break;
            case 'acquisition':
                setActiveStep('financing');
                break;
            case 'financing':
                setActiveStep('disposition');
                break;
            case 'disposition':
                setActiveStep('capital');
                break;
            case 'capital':
                setActiveStep('inflation');
                break;
            case 'inflation':
                setActiveStep('penetration');
                break;
            case 'penetration':
                setActiveStep('operating-revenue');
                break;
            case 'operating-revenue':
                setActiveStep('departmental-expenses');
                break;
            case 'departmental-expenses':
                setActiveStep('management-franchise');
                break;
            case 'management-franchise':
                setActiveStep('undistributed-expenses-1');
                break;
            case 'undistributed-expenses-1':
                setActiveStep('undistributed-expenses-2');
                break;
            case 'undistributed-expenses-2':
                setActiveStep('non-operating-expenses');
                break;
            case 'non-operating-expenses':
                setActiveStep('ffe-reserve');
                break;
            case 'ffe-reserve':
                handleSubmit();
                break;
            default:
                break;
        }
        window.scrollTo(0, 0);
    };

    // Handle moving to the previous step
    const handleBack = async () => {
        // Save current tab data if deal is created
        if (dealCreated && createdDealId) {
            const saved = await saveCurrentTab();
            if (!saved) {
                return;
            }
        }
        
        switch (activeStep) {
            case 'acquisition':
                setActiveStep('property');
                break;
            case 'financing':
                setActiveStep('acquisition');
                break;
            case 'disposition':
                setActiveStep('financing');
                break;
            case 'capital':
                setActiveStep('disposition');
                break;
            case 'inflation':
                setActiveStep('capital');
                break;
            case 'penetration':
                setActiveStep('inflation');
                break;
            case 'operating-revenue':
                setActiveStep('penetration');
                break;
            case 'departmental-expenses':
                setActiveStep('operating-revenue');
                break;
            case 'management-franchise':
                setActiveStep('departmental-expenses');
                break;
            case 'undistributed-expenses-1':
                setActiveStep('management-franchise');
                break;
            case 'undistributed-expenses-2':
                setActiveStep('undistributed-expenses-1');
                break;
            case 'non-operating-expenses':
                setActiveStep('undistributed-expenses-2');
                break;
            case 'ffe-reserve':
                setActiveStep('non-operating-expenses');
                break;
            default:
                break;
        }
        window.scrollTo(0, 0);
    };

    // Render form step navigation
    const renderStepNav = () => {
        return (
            <div className="flex justify-between mt-6">
                <button
                    onClick={handleBack}
                    disabled={activeStep === 'property'}
                    className={`px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium ${activeStep === 'property'
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                >
                    {isSubmitting ? 'Processing...' : activeStep === 'ffe-reserve' ? 'Submit' : 'Next'}
                </button>
            </div>
        );
    };    // Render status messages
    const renderMessage = () => {
        if (!message.text) return null;

        const isSuccess = message.type === 'success';
        
        return (
            <div className={`p-4 mb-6 rounded-md shadow-sm animate-fade-in border-l-4 ${
                isSuccess ? 'bg-green-50 text-green-800 border-green-500' : 'bg-red-50 text-red-800 border-red-500'
            }`}>
                <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                        {isSuccess ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <div className="text-sm font-medium">
                        {message.text}
                    </div>
                </div>
            </div>
        );
    };

    // Render validation errors
    const renderValidationErrors = () => {
        const errorKeys = Object.keys(validationErrors);
        if (errorKeys.length === 0) return null;
        
        return (
            <div className="p-4 mb-6 rounded-md bg-red-50">
                <h3 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
                <ul className="list-disc pl-5 text-sm text-red-700">
                    {errorKeys.map(key => (
                        <li key={key}>{validationErrors[key]}</li>
                    ))}
                </ul>
            </div>
        );
    };    // Effect to update metrics when form data changes
    useEffect(() => {
        // Skip if we're on property details step or if deal isn't created yet
        if (activeStep === 'property' || !dealCreated) return;
        
        // Calculate updated metrics based on form data
        const updatedMetrics = calculateMetrics(formData);
        
        // Store current metrics as previous before updating
        setPreviousMetrics(metrics);
        
        // Add animation effect by using setTimeout
        const timer = setTimeout(() => {
            setMetrics(updatedMetrics);
        }, 300);
        
        return () => clearTimeout(timer);
    },[
        formData.hold_period, 
        formData.cap_rate_going_in,
        formData.purchase_price,
        formData.number_of_rooms,
        formData.exit_cap_rate,
        formData.adr_base,
        formData.revenues_total,
        formData.expenses_total,
        formData.debt_amount,
        formData.equity_amount,
        activeStep, 
        dealCreated
    ]);

    // Render the active step
    const renderActiveStep = () => {
        // Render metrics component for tabs after Property Details when deal is created
        const showMetrics = activeStep !== 'property' && dealCreated;
        
        const formComponent = (() => {
            switch (activeStep) {
                case 'property':
                    return <EnhancedPropertyDetailsForm 
                            formData={formData} 
                            handleChange={handleChange} 
                            handlePropertySelect={handlePropertySelect}
                            validationErrors={validationErrors}
                            />;
                case 'acquisition':
                    return <AcquisitionForm formData={formData} handleChange={handleChange} />;
                case 'financing':
                    return <FinancingForm formData={formData} handleChange={handleChange} />;
                case 'disposition':
                    return <DispositionForm formData={formData} handleChange={handleChange} />;
                case 'capital':
                    return <CapitalExpenseForm formData={formData} handleChange={handleChange} />;
                case 'inflation':
                    return <InflationForm formData={formData} handleChange={handleChange} />;
                case 'penetration':
                    return <PenetrationForm formData={formData} handleChange={handleChange} />;
                case 'operating-revenue':
                    return <RevenueForm formData={formData} handleChange={handleChange} />;
                case 'departmental-expenses':
                    return <DepartmentalExpensesForm formData={formData} handleChange={handleChange} />;
                case 'management-franchise':
                    return <ManagementForm formData={formData} handleChange={handleChange} />;
                case 'undistributed-expenses-1':
                    return <UndistributedExpenses1Form formData={formData} handleChange={handleChange} />;
                case 'undistributed-expenses-2':
                    return <UndistributedExpenses2Form formData={formData} handleChange={handleChange} />;
                case 'non-operating-expenses':
                    return <NonOperatingForm formData={formData} handleChange={handleChange} />;
                case 'ffe-reserve':
                    return <FFEReserveForm formData={formData} handleChange={handleChange} />;
                default:
                    return null;
            }
        })();
          return (            <>                {showMetrics && (
                    <div className="mb-8 bg-white rounded-lg shadow-xl border-l-4 border-secondary p-5 animate-fade-in">
                        {/* Show guidance after deal creation */}
                        {activeStep === 'acquisition' && dealCreated && (
                            <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200 text-blue-700">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium">
                                            Your deal has been created! You can now add detailed assumptions tab by tab and watch how they impact the key metrics.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                          <DealMetrics 
                            metrics={metrics} 
                            previousMetrics={previousMetrics} 
                            className="metric-dashboard" 
                        />
                        
                        <div className="mt-2 flex items-center justify-end text-xs text-secondary">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Metrics update dynamically as you make changes</span>
                        </div>
                    </div>
                )}
                {formComponent}
            </>
        );
    };

    // Show steps on the left sidebar
    const renderStepSidebar = () => {
        const steps = [
            { id: 'property', label: 'Property Details' },
            { id: 'acquisition', label: 'Acquisition' },
            { id: 'financing', label: 'Financing' },
            { id: 'disposition', label: 'Disposition' },
            { id: 'capital', label: 'Capital Expense' },
            { id: 'inflation', label: 'Inflation Assumptions' },
            { id: 'penetration', label: 'Penetration Analysis' },
            { id: 'operating-revenue', label: 'Operating Revenue' },
            { id: 'departmental-expenses', label: 'Departmental Expenses' },
            { id: 'management-franchise', label: 'Management & Franchise Fees' },
            { id: 'undistributed-expenses-1', label: 'Undistributed Expenses (1)' },
            { id: 'undistributed-expenses-2', label: 'Undistributed Expenses (2)' },
            { id: 'non-operating-expenses', label: 'Non-Operating Expenses' },
            { id: 'ffe-reserve', label: 'FF&E Reserve' },
        ];

        return (
            <div className="w-64 bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Investment Model</h3>
                <ul>
                    {steps.map(step => (                        <li
                            key={step.id}
                            className={`py-2 px-3 mb-1 rounded-md cursor-pointer transition-all duration-200 ${
                                activeStep === step.id 
                                    ? 'bg-secondary text-white shadow-md transform scale-105' 
                                    : 'hover:bg-gray-200 hover:shadow-sm'
                                }`}
                            onClick={() => setActiveStep(step.id)}
                        >
                            <div className="flex items-center">
                                {dealCreated && step.id !== 'property' && (
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                )}
                                {step.label}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };    return (
        <div className="flex space-x-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {renderStepSidebar()}

            <div className="flex-1">                {renderMessage()}
                {renderValidationErrors()}
                <div className="form-step-transition">
                    {renderActiveStep()}
                </div>
                {renderStepNav()}
                  {/* Success Modal */}
                <SuccessModal
                    isOpen={showSuccessModal}
                    onClose={handleSuccessModalClose}
                    onStay={handleStayAndContinue}
                    title="Deal Created Successfully"
                    message={`Your investment deal "${formData.property_name}" has been created successfully. You can continue to add assumptions or view the deal details.`}
                    showStayButton={true}
                />
                  {/* Custom animations */}
                <style jsx global>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }                    .animate-fade-in {
                        animation: fadeIn 0.5s ease-in-out;
                    }
                    .form-step-transition {
                        animation: fadeIn 0.4s ease-out;
                    }
                    .metric-value {
                        transition: all 0.3s ease-in-out;
                        position: relative;
                    }
                    .metric-value.changed::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(255, 255, 0, 0.2);
                        border-radius: 0.25rem;
                        animation: highlightFade 1.5s ease-out forwards;
                    }
                    @keyframes highlightFade {
                        0% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default DealCreationForm;