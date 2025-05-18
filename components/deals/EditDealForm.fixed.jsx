// components/deals/EditDealForm.fixed.jsx
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
      
      const data = await response.json();
      console.log('Deal data fetched successfully:', data);
      
      // Ensure we have good default values for all tabs
      const enhancedData = ensureTabDefaultValues(data);
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
    // Make a copy of the data to avoid mutation
    const enhancedData = { ...data };
    
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
    
    // Other important default values
    if (!enhancedData.adr_base) enhancedData.adr_base = 180;
    if (!enhancedData.inflation_rate_general) enhancedData.inflation_rate_general = 3.0;
    if (!enhancedData.stabilized_occupancy) enhancedData.stabilized_occupancy = 75;
    
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
      const result = await saveDealAssumptionTab(tabName, dealId, formData);
      
      setMessage({
        type: 'success',
        text: `${tabName.charAt(0).toUpperCase() + tabName.slice(1)} data saved successfully`
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
      return true;
    } catch (error) {
      console.error(`Error saving ${tabName} tab:`, error);
      setMessage({
        type: 'error',
        text: `Error saving data: ${error.message}`
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
      // Save current tab first
      await saveCurrentTab(activeTab);
      
      // Then update the main deal record with basic details
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deal_name: formData.deal_name || `${formData.property_name} Investment`,
          property_name: formData.property_name,
          property_address: formData.property_address,
          city: formData.city,
          state: formData.state,
          number_of_rooms: formData.number_of_rooms,
          property_type: formData.property_type,
          status: formData.status || 'Active'
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update deal');
      }
      
      setMessage({
        type: 'success',
        text: 'Deal updated successfully'
      });
      
      // Navigate back to deal details after 2 seconds
      setTimeout(() => {
        router.push(`/deals/${dealId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating deal:', error);
      setMessage({
        type: 'error',
        text: `Error updating deal: ${error.message}`
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
      <div className="w-56 flex-shrink-0 h-full border-r border-gray-200">
        <div className="flex flex-col space-y-1 py-2">
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
  ]);
    return (
    <div className="container max-w-full mx-auto px-2">
      <div className="mb-6 flex justify-between items-center">
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
      <div className={`bg-white rounded-lg shadow-xl border-l-4 border-secondary p-5 mb-6 ${metricsChanged ? 'bg-opacity-95' : ''}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-800">Key Performance Indicators</h3>
          <div className="text-sm text-secondary font-medium px-3 py-1 bg-secondary bg-opacity-10 rounded-full">
            Live Updates
          </div>
        </div>
        <p className="text-sm text-gray-500 italic mb-4">
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
      `}</style>
      
      <div className="flex border rounded-lg bg-white mt-4">
        {renderTabsNav()}
        
        <div className="flex-grow p-6">
          {renderActiveTab()}
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={() => saveCurrentTab(activeTab)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              disabled={isSaving}
            >
        <button
          onClick={saveAllTabs}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save & Exit'}
        </button>
      </div>
    </div>
  );
};

export default EditDealForm;
