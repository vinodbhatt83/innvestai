// components/deals/EditDealForm.jsx
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
import { saveDealAssumptionTab, calculateMetrics } from '../../utils/dealAssumptions';
import { useDealMetrics, useDealAssumptionTabs } from '../../hooks/dealHooks';

// Function to validate tab data before submission
const validateTabData = (tabName, formData) => {
  const errors = {};
  
  // Validate property tab fields
  if (tabName === 'property') {
    // Required fields for property tab
    if (!formData.deal_name?.trim()) {
      errors.deal_name = 'Deal name is required';
    }
    
    if (!formData.property_name?.trim()) {
      errors.property_name = 'Property name is required';
    }
    
    // Property address is required
    if (!formData.property_address?.trim()) {
      errors.property_address = 'Property address is required';
    }
    
    // City is required
    if (!formData.city?.trim()) {
      errors.city = 'City is required';
    }
    
    // State is required
    if (!formData.state?.trim()) {
      errors.state = 'State is required';
    }
    
    // Number of rooms should be a positive number
    if (!formData.number_of_rooms || formData.number_of_rooms <= 0) {
      errors.number_of_rooms = 'Number of rooms must be a positive number';
    }
  }
  
  // Add validations for other tabs as needed
  // ...
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

const EditDealForm = ({ dealId, initialData = {} }) => {
  const router = useRouter();
    // Set up form state using provided initial data
  const [formData, setFormData] = useState(initialData);
    // Track form changes
  const [formChanged, setFormChanged] = useState(false);
  
  // Track metrics changes
  const [metricsChanged, setMetricsChanged] = useState(false);
  
  // Set up active tab using custom hook
  const [activeTab, setActiveTab] = useDealAssumptionTabs('property', (newTab) => {
    // Save the current tab data when changing tabs
    if (dealId) saveCurrentTab(activeTab);
  });
  
  // Set up metrics using custom hook
  const [metrics, setMetrics, previousMetrics, setPreviousMetrics] = useDealMetrics({
    irr: 12.5,
    capRate: 8.5,
    cashOnCash: 9.2,
    adr: 195.0
  }, formData, true);
  
  // Loading/saving state
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});
    // Fetch deal data on component mount
  useEffect(() => {
    if (dealId) {
      fetchDealData(dealId);
    }
  }, [dealId]);
  // Fetch deal data from API
  const fetchDealData = async (id) => {
    try {
      console.log(`Fetching deal data for ID: ${id} from assumptions endpoint`);
      const response = await fetch(`/api/deals/${id}/assumptions`);
      
      if (!response.ok) {
        console.error(`API response not OK: ${response.status} ${response.statusText}`);
        // Try to get detailed error from response if available
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || response.statusText || 'Failed to fetch deal data');
        } catch (jsonError) {
          throw new Error(`${response.status}: ${response.statusText || 'Failed to fetch deal data'}`);
        }
      }
      
      // Make sure we can parse the JSON
      let data;
      try {
        data = await response.json();
        console.log('Deal data fetched successfully:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response format from server');
      }
      
      // Safety check for empty or null data
      if (!data || Object.keys(data).length === 0) {
        console.warn('Received empty data from API, using default values');
        data = {};
      }
      
      // Ensure we have good default values for all tabs
      const enhancedData = ensureTabDefaultValues(data);
      console.log('Enhanced data with defaults:', enhancedData);
      setFormData(enhancedData);
      
      // Calculate initial metrics
      const initialMetrics = calculateMetrics(enhancedData);
      setMetrics(initialMetrics);
      
    } catch (error) {
      console.error('Error fetching deal data:', error);
      setMessage({
        type: 'error',
        text: `Error loading deal: ${error.message}`
      });
    }
  };
  // Helper function to ensure we have default values for all tabs
  const ensureTabDefaultValues = (data) => {
    // Safety check for null/undefined input
    if (!data) {
      console.warn('Null or undefined data passed to ensureTabDefaultValues');
      data = {};
    }
    
    // Make a copy of the data to avoid mutation
    const enhancedData = { ...data };
    
    console.log('Ensuring default values for form data:', enhancedData);
    
    // Deal information
    if (!enhancedData.deal_name) enhancedData.deal_name = 'New Hotel Investment';
    
    // Default values for property details
    if (!enhancedData.property_name) enhancedData.property_name = '';
    if (!enhancedData.property_address) enhancedData.property_address = '';
    if (!enhancedData.city) enhancedData.city = '';
    if (!enhancedData.state) enhancedData.state = '';
    if (!enhancedData.property_type) enhancedData.property_type = 'Hotel';
    if (!enhancedData.number_of_rooms) enhancedData.number_of_rooms = 100;
    
    // Default values for acquisition tab
    if (!enhancedData.acquisition_month) enhancedData.acquisition_month = new Date().getMonth() + 1;
    if (!enhancedData.acquisition_year) enhancedData.acquisition_year = new Date().getFullYear();
    if (!enhancedData.purchase_price) enhancedData.purchase_price = 10000000;
    if (!enhancedData.cap_rate_going_in) enhancedData.cap_rate_going_in = 8.0;
    if (!enhancedData.hold_period) enhancedData.hold_period = 5;
    
    // Default values for financing tab
    if (!enhancedData.loan_to_value) enhancedData.loan_to_value = 65;
    if (!enhancedData.interest_rate) enhancedData.interest_rate = 6.5;
    if (!enhancedData.loan_term) enhancedData.loan_term = 5;
    if (!enhancedData.amortization_period) enhancedData.amortization_period = 25;
    
    // Default values for disposition tab
    if (!enhancedData.exit_cap_rate) enhancedData.exit_cap_rate = 8.5;
    if (!enhancedData.selling_costs) enhancedData.selling_costs = 2.0;
    
    // Capital expense tab
    if (!enhancedData.capex_budget) enhancedData.capex_budget = 1000000;
    if (!enhancedData.capex_contingency) enhancedData.capex_contingency = 10;
    
    // Inflation tab
    if (!enhancedData.inflation_rate_general) enhancedData.inflation_rate_general = 3.0;
    if (!enhancedData.inflation_rate_revenue) enhancedData.inflation_rate_revenue = 3.5;
    if (!enhancedData.inflation_rate_expenses) enhancedData.inflation_rate_expenses = 3.2;
    
    // Penetration tab
    if (!enhancedData.stabilized_occupancy) enhancedData.stabilized_occupancy = 75;
    if (!enhancedData.market_penetration) enhancedData.market_penetration = 100;
    
    // Revenue tab
    if (!enhancedData.adr_base) enhancedData.adr_base = 180;
    if (!enhancedData.revpar_base) enhancedData.revpar_base = enhancedData.adr_base * (enhancedData.stabilized_occupancy / 100);
    if (!enhancedData.other_revenue_percentage) enhancedData.other_revenue_percentage = 5;
    
    // Departmental expenses tab
    if (!enhancedData.rooms_department_expense) enhancedData.rooms_department_expense = 25;
    if (!enhancedData.food_beverage_expense) enhancedData.food_beverage_expense = 75;
      // Management tab
    if (!enhancedData.management_fee_percentage) enhancedData.management_fee_percentage = 3;
    if (!enhancedData.franchise_fee_percentage) enhancedData.franchise_fee_percentage = 5;
    
    // Undistributed expenses 1 tab
    if (!enhancedData.admin_general_percentage) enhancedData.admin_general_percentage = 10;
    if (!enhancedData.sales_marketing_percentage) enhancedData.sales_marketing_percentage = 8;
    if (!enhancedData.property_operations_percentage) enhancedData.property_operations_percentage = 5;
    
    // Undistributed expenses 2 tab
    if (!enhancedData.utility_costs_percentage) enhancedData.utility_costs_percentage = 4;
    if (!enhancedData.it_systems_percentage) enhancedData.it_systems_percentage = 2;
    
    // Non-operating expenses tab
    if (!enhancedData.property_tax_percentage) enhancedData.property_tax_percentage = 2.5;
    if (!enhancedData.insurance_percentage) enhancedData.insurance_percentage = 1.5;
    
    // FF&E Reserve tab
    if (!enhancedData.ffe_reserve_percentage) enhancedData.ffe_reserve_percentage = 4;
    if (!enhancedData.ffe_reserve_minimum) enhancedData.ffe_reserve_minimum = 500;
    
    return enhancedData;
  };
    // Handle form field changes
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
    
    // Store metrics before update if it's a key field that affects metrics
    const isKeyMetricField = /hold_period|cap_rate|purchase|rooms|exit|adr|revenue|expense|debt|equity/.test(name.toLowerCase());
    if (isKeyMetricField) {
      // This will trigger the metrics update effect
      setPreviousMetrics(metrics);
      setMetricsChanged(true);
      
      // Reset metrics changed flag after animation duration
      setTimeout(() => {
        setMetricsChanged(false);
      }, 2000);
    }
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Flag that form has been changed
    setFormChanged(true);
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
    // Save current tab data
  const saveCurrentTab = async (tabName) => {
    if (!dealId) return true;
    
    setIsSaving(true);
    setMessage({ type: '', text: '' });
      try {
      console.log(`Saving tab ${tabName} for deal ${dealId}`);
      
      // Validate required fields before sending to the API
      const validationResult = validateTabData(tabName, formData);
      if (!validationResult.valid) {
        setValidationErrors(validationResult.errors);
        setMessage({
          type: 'error',
          text: `Please fix the following errors: ${Object.values(validationResult.errors).join(', ')}`
        });
        return false;
      }
      
      const result = await saveDealAssumptionTab(tabName, dealId, formData);
      
      console.log(`Tab ${tabName} saved successfully:`, result);
      setMessage({
        type: 'success',
        text: `${tabName.charAt(0).toUpperCase() + tabName.slice(1)} data saved successfully`
      });
      
      // Flag that form changes have been saved
      setFormChanged(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
      return true;
    } catch (error) {
      console.error(`Error saving ${tabName} tab:`, error);
      
      // Enhanced error reporting
      let errorMessage = error.message || 'Unknown error';
      
      // Handle API errors with additional details
      if (error.status) {
        errorMessage += ` (Status: ${error.status})`;
      }
      
      if (error.response) {
        if (typeof error.response === 'object') {
          // If error.response is already parsed, extract message or detail
          errorMessage = error.response.message || error.response.details || error.response.error || errorMessage;
        } else {
          try {
            const errorData = JSON.parse(error.response);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If we can't parse the JSON, use the error message as is
          }
        }
      }
      
      setMessage({
        type: 'error',
        text: `Error saving ${tabName} tab: ${errorMessage}`
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };
    // Save all tabs
  const saveAllTabs = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      console.log("Starting save all tabs operation");
      
      // Save current tab first
      const currentTabSaved = await saveCurrentTab(activeTab);
      
      if (!currentTabSaved) {
        console.log("Current tab save failed, stopping save all operation");
        return; // Don't continue if the current tab couldn't be saved
      }
      
      // Save property details tab if it's not the current tab
      if (activeTab !== 'property') {
        console.log("Saving property tab as part of save all");
        const propertyTabSaved = await saveCurrentTab('property');
        if (!propertyTabSaved) {
          console.log("Property tab save failed");
          return;
        }
      }
            
      setMessage({
        type: 'success',
        text: 'Deal updated successfully'
      });
      
      // Flag that form changes have been saved
      setFormChanged(false);
      
      // Navigate back to deal details after 2 seconds
      setTimeout(() => {
        router.push(`/deals/${dealId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating deal:', error);
      
      // Enhanced error handling
      let errorMsg = error.message || 'Unknown error';
      
      // Try to extract more detailed error information
      if (error.response) {
        try {
          const errorData = await error.response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `${error.response.status}: ${error.response.statusText}`;
        }
      }
      
      setMessage({
        type: 'error',
        text: `Error updating deal: ${errorMsg}`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Cancel and go back to deal details
  const handleCancel = () => {
    router.push(`/deals/${dealId}`);
  };
    // Render tabs navigation
  const renderTabsNav = () => {
    const tabs = [
      { id: 'property', label: 'Property Details' },
      { id: 'acquisition', label: 'Acquisition' },
      { id: 'financing', label: 'Financing' },
      { id: 'disposition', label: 'Disposition' },
      { id: 'capital', label: 'Capital Expense' },
      { id: 'inflation', label: 'Inflation' },
      { id: 'penetration', label: 'Penetration' },
      { id: 'operating-revenue', label: 'Operating Revenue' },
      { id: 'departmental-expenses', label: 'Dept. Expenses' },
      { id: 'management-franchise', label: 'Management' },
      { id: 'undistributed-expenses-1', label: 'Undist. Exp 1' },
      { id: 'undistributed-expenses-2', label: 'Undist. Exp 2' },
      { id: 'non-operating-expenses', label: 'Non-Op Exp' },
      { id: 'ffe-reserve', label: 'FF&E Reserve' }
    ];
    
    return (
      <div className="w-72 flex-shrink-0 h-full border-r border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-0 py-2">
          <h3 className="px-4 py-2 font-medium text-lg text-gray-700 border-b border-gray-200 mb-2">Form Sections</h3>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-left text-sm font-medium border-l-4 transition-all duration-200
                ${activeTab === tab.id 
                  ? 'border-l-secondary bg-secondary bg-opacity-10 text-secondary' 
                  : 'border-l-transparent text-neutral-600 hover:bg-gray-50 hover:border-l-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render the active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'property':
        return <EnhancedPropertyDetailsForm formData={formData} handleChange={handleChange} validationErrors={validationErrors} />;
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
  };
  
  // Render notification message
  const renderMessage = () => {
    if (!message.text) return null;
    
    const bgColor = message.type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const textColor = message.type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconColor = message.type === 'success' ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className={`mb-4 p-4 ${bgColor} border-l-4 ${message.type === 'success' ? 'border-green-400' : 'border-red-400'} rounded-md`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {message.type === 'success' ? (
              <svg className={`h-5 w-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={`h-5 w-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm ${textColor}`}>{message.text}</p>
          </div>
        </div>
      </div>
    );
  };
    // Effect to update metrics when form data changes
  useEffect(() => {
    // Skip if we're on property details tab
    if (activeTab === 'property') return;
    
    // Calculate updated metrics based on form data
    const updatedMetrics = calculateMetrics(formData);
    
    // Store current metrics as previous before updating
    setPreviousMetrics({ ...metrics });
    
    // Add animation effect by using setTimeout
    const timer = setTimeout(() => {
      setMetrics(updatedMetrics);
      // Flag that metrics have changed
      setMetricsChanged(true);
      
      // Reset the flag after animation completes
      setTimeout(() => {
        setMetricsChanged(false);
      }, 1500);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [
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
    activeTab
  ]);    return (
    <div className="max-w-full mx-auto px-1">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Edit Deal: {formData.deal_name || 'Loading...'}</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={saveAllTabs}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Deal'}
          </button>
        </div>
      </div>
        {renderMessage()}
        {/* Always show metrics at the top of the form */}
      <div className={`bg-white rounded-lg shadow-md border-l-4 border-secondary p-4 mb-4 ${metricsChanged ? 'bg-opacity-95' : ''}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-800">Key Performance Indicators</h3>
          <div className="text-sm text-secondary font-medium px-3 py-1 bg-secondary bg-opacity-10 rounded-full">
            Live Updates
          </div>
        </div>
        <p className="text-sm text-gray-500 italic mb-3">
          These metrics update automatically as you make changes to your investment assumptions.
        </p>
        <DealMetrics 
          metrics={metrics}
          previousMetrics={previousMetrics}
          className={`${metricsChanged ? 'highlight-container' : ''}`} 
        />
      </div>
      
      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes highlight {
          0% { background-color: rgba(79, 70, 229, 0.1); }
          100% { background-color: transparent; }
        }
        .highlight-container {
          animation: highlight 1.5s ease-out;
        }
      `}</style>        <div className="flex border rounded-lg bg-white mt-4 shadow-sm">
        {renderTabsNav()}
        
        <div className="flex-grow p-5">
          <div className="bg-white rounded-lg">
            {renderActiveTab()}
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={() => saveCurrentTab(activeTab)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Current Tab'}
            </button>
            <button
              onClick={saveAllTabs}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Exit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDealForm;
