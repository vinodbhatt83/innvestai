import React, { useState } from 'react';
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
import SuccessModal from '../common/SuccessModal';
import { validatePropertyDetailsForm, validateAcquisitionForm, validateFinalForm } from '../../utils/validation';

function DealCreationForm() {
    const router = useRouter();
    
    // Current active step
    const [activeStep, setActiveStep] = useState('property');

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
    
    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdDealId, setCreatedDealId] = useState(null);

    // Function to submit deal data directly
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
                // Show success modal
                setCreatedDealId(result.deal_id || result.id);
                setShowSuccessModal(true);
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
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
    
    // Handle success modal close
    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        if (createdDealId) {
            // Redirect to deal details page
            router.push(`/deals/${createdDealId}`);
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
    const handleNext = () => {
        // Validate current step before proceeding
        if (!validateCurrentStep()) {
            return;
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
    const handleBack = () => {
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
    };

    // Render status messages
    const renderMessage = () => {
        if (!message.text) return null;

        return (
            <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                {message.text}
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
    };

    // Render the active step
    const renderActiveStep = () => {
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
                    {steps.map(step => (
                        <li
                            key={step.id}
                            className={`py-2 px-3 mb-1 rounded-md cursor-pointer ${activeStep === step.id ? 'bg-secondary text-white' : 'hover:bg-gray-200'
                                }`}
                            onClick={() => setActiveStep(step.id)}
                        >
                            {step.label}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="flex space-x-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {renderStepSidebar()}

            <div className="flex-1">
                {renderMessage()}
                {renderValidationErrors()}
                {renderActiveStep()}
                {renderStepNav()}
                
                {/* Success Modal */}
                <SuccessModal
                    isOpen={showSuccessModal}
                    onClose={handleSuccessModalClose}
                    title="Deal Created Successfully"
                    message={`Your investment deal "${formData.property_name}" has been created successfully. You will be redirected to the deal details page in 5 seconds.`}
                    autoCloseDelay={5000}
                />
            </div>
        </div>
    );
}

export default DealCreationForm;