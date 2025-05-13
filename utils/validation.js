/**
 * Validates the required fields in the property details form
 * @param {Object} formData - The form data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePropertyDetailsForm = (formData) => {
    const errors = {};
    
    // Required fields for property details
    if (!formData.property_name?.trim()) {
      errors.property_name = 'Property name is required';
    }
    
    if (!formData.property_address?.trim()) {
      errors.property_address = 'Property address is required';
    }
    
    if (!formData.city?.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.state?.trim()) {
      errors.state = 'State is required';
    }
    
    if (!formData.number_of_rooms) {
      errors.number_of_rooms = 'Number of rooms is required';
    } else if (formData.number_of_rooms <= 0) {
      errors.number_of_rooms = 'Number of rooms must be greater than 0';
    }
    
    if (!formData.property_type) {
      errors.property_type = 'Property type is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validates the acquisition form data
   * @param {Object} formData - The form data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  export const validateAcquisitionForm = (formData) => {
    const errors = {};
    
    if (!formData.acquisition_year) {
      errors.acquisition_year = 'Acquisition year is required';
    } else if (formData.acquisition_year < 2000 || formData.acquisition_year > 2100) {
      errors.acquisition_year = 'Please enter a valid year between 2000 and 2100';
    }
    
    if (!formData.hold_period) {
      errors.hold_period = 'Hold period is required';
    } else if (formData.hold_period <= 0) {
      errors.hold_period = 'Hold period must be greater than 0';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validates the financing form data
   * @param {Object} formData - The form data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  export const validateFinancingForm = (formData) => {
    const errors = {};
    
    if (!formData.interest_rate && formData.interest_rate !== 0) {
      errors.interest_rate = 'Interest rate is required';
    } else if (formData.interest_rate < 0 || formData.interest_rate > 100) {
      errors.interest_rate = 'Interest rate must be between 0 and 100';
    }
    
    if (!formData.ltv_ratio && formData.ltv_ratio !== 0) {
      errors.ltv_ratio = 'LTV ratio is required';
    } else if (formData.ltv_ratio < 0 || formData.ltv_ratio > 100) {
      errors.ltv_ratio = 'LTV ratio must be between 0 and 100';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validates the final form data before submission
   * @param {Object} formData - The complete form data
   * @returns {Object} Validation result with isValid and errors
   */
  export const validateFinalForm = (formData) => {
    // First validate the property details
    const propertyValidation = validatePropertyDetailsForm(formData);
    
    // If property details are invalid, return that result
    if (!propertyValidation.isValid) {
      return propertyValidation;
    }
    
    // Additional validations for the final form
    const errors = {};
    
    // Check if purchase price is defined (required for deal creation)
    if (!formData.purchase_price && formData.purchase_price !== 0) {
      errors.purchase_price = 'Purchase price is required for deal creation';
    }
    
    return {
      isValid: propertyValidation.isValid && Object.keys(errors).length === 0,
      errors: { ...propertyValidation.errors, ...errors }
    };
  };