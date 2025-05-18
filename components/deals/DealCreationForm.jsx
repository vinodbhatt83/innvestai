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
            property_type: propertyType || 'Luxury' // Ensure property type has a value
        }));
        
        // Clear validation errors for property fields
        setValidationErrors({});
        
        // Automatically submit the form after a short delay
        setTimeout(() => {
            // Create deal data
            const dealData = {
                deal_name: `${propertyName} Investment`,
                property_key: property[propertyIdField],
                property_name: propertyName,
                property_address: propertyAddress,
                city: city,
                state: state,
                number_of_rooms: rooms,
                property_type: propertyType || 'Luxury',
                investment_amount: 1000000, // Default value
                expected_return: 8.5, // Default value
                hold_period: 5, // Default value
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
                status: 'Draft'
            };
            
            // Directly submit the deal data
            submitDeal(dealData);
        }, 500);
    };

    // Handle form submission (for manual submission)
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

        // Prepare data for submission
        const dealData = {
            deal_name: `${formData.property_name} Investment`,
            property_key: formData.property_key,
            property_name: formData.property_name,
            property_address: formData.property_address,
            city: formData.city,
            state: formData.state,
            number_of_rooms: formData.number_of_rooms,
            property_type: formData.property_type,
            investment_amount: formData.purchase_price || 1000000, // Default if not provided
            expected_return: formData.cap_rate_going_in || 8.5, // Default if not provided
            hold_period: formData.hold_period,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: 'Draft'
        };
        
        submitDeal(dealData);
    };
      // Handle success modal navigation
    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        if (createdDealId) {
            // Redirect to deal details page
            router.push(`/deals/${createdDealId}`);
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
    };

    // Save current tab data
    const saveCurrentTab = async () => {
        // Don't save if we're on property details or deal hasn't been created yet
        if (activeStep === 'property' || !dealCreated || !createdDealId) {
            return true;
        }
        
        setIsSavingTab(true);
        setMessage({ type: '', text: '' });
        
        try {
            await saveDealAssumptionTab(activeStep, createdDealId, formData);
            return true;
        } catch (error) {
            console.error(`Error saving ${activeStep} tab:`, error);
            setMessage({
                type: 'error',
                text: `Error saving data: ${error.message}`
            });
            return false;
        } finally {
            setIsSavingTab(false);
        }
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
    };

    // Handle moving to the next step
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