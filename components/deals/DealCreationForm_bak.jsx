import React, { useState } from 'react';
import PropertyDetailsForm from './PropertyDetailsForm';
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

function DealCreationForm() {
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

        // All other form fields...
    });

    // Success/Error message state
    const [message, setMessage] = useState({ type: '', text: '' });

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        setMessage({ type: '', text: '' });

        try {
            // Create the deal in the database
            const response = await fetch('/api/deals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deal_name: `${formData.property_name} Investment`,
                    property_id: null,
                    investment_amount: formData.purchase_price,
                    expected_return: formData.cap_rate_going_in,
                    start_date: new Date().toISOString(),
                    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(formData.hold_period || 5))).toISOString(),
                    status: 'Draft',
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Deal created successfully! Redirecting to deals page...'
                });

                setTimeout(() => {
                    window.location.href = `/deals/${result.id}`;
                }, 1500);
            } else {
                throw new Error(result.error || 'Failed to create deal');
            }
        } catch (error) {
            console.error('Error creating deal:', error);
            setMessage({
                type: 'error',
                text: 'Error creating deal. Please try again.'
            });
        }
    };

    // Handle moving to the next step
    const handleNext = () => {
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                >
                    {activeStep === 'ffe-reserve' ? 'Submit' : 'Next'}
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

    // Render the active step
    const renderActiveStep = () => {
        switch (activeStep) {
            case 'property':
                return <PropertyDetailsForm formData={formData} handleChange={handleChange} />;
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
                <h1 className="text-2xl font-bold mb-6">Create New Investment Deal</h1>
                {renderMessage()}
                {renderActiveStep()}
                {renderStepNav()}
            </div>
        </div>
    );
}

export default DealCreationForm;