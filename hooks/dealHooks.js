// Custom hooks for deal metrics and assumptions
import { useState, useEffect } from 'react';
import { calculateMetrics } from '../utils/dealAssumptions';

/**
 * Hook to manage and calculate deal metrics based on form data
 * @param {object} initialMetrics - Initial metrics values
 * @param {object} formData - Form data to calculate metrics from
 * @param {boolean} isActive - Whether the metrics should be actively calculated
 * @returns {object} - Current metrics and a function to update them
 */
export function useDealMetrics(initialMetrics, formData, isActive = true) {
  const [metrics, setMetrics] = useState(initialMetrics || {
    irr: 12.5,
    capRate: 8.5,
    cashOnCash: 9.2,
    adr: 195.0
  });
  
  // Add previous metrics state for tracking changes
  const [previousMetrics, setPreviousMetrics] = useState(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    // Store current metrics as previous before updating
    setPreviousMetrics(metrics);
    
    // Calculate updated metrics based on form data
    const updatedMetrics = calculateMetrics(formData);
    
    // Add animation effect by using setTimeout
    const timer = setTimeout(() => {
      setMetrics(updatedMetrics);
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
    isActive
  ]);
  
  return [metrics, setMetrics, previousMetrics, setPreviousMetrics];
}

/**
 * Hook to manage deal assumption tabs
 * @param {string} initialTab - The initial tab to display
 * @param {function} onTabChange - Optional callback when tab changes
 * @returns {Array} - Current tab and a function to change tabs
 */
export function useDealAssumptionTabs(initialTab = 'property', onTabChange = null) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const changeTab = (newTab) => {
    setActiveTab(newTab);
    if (onTabChange) {
      onTabChange(newTab);
    }
  };
  
  return [activeTab, changeTab];
}

/**
 * Hook to track if a deal has been created
 * @param {string} dealId - The deal ID, if one exists
 * @returns {Array} - Boolean indicating if deal is created and a function to set it
 */
export function useDealCreated(dealId = null) {
  const [dealCreated, setDealCreated] = useState(!!dealId);
  
  useEffect(() => {
    if (dealId && !dealCreated) {
      setDealCreated(true);
    }
  }, [dealId]);
  
  return [dealCreated, setDealCreated];
}
