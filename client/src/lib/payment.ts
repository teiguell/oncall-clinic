import { apiRequest } from "@/lib/queryClient";
import { getStoredSession } from "@/lib/auth";
import { PaymentFormData, Payment } from "@/types";

// Process payment for an appointment
export const processPayment = async (data: PaymentFormData): Promise<{success: boolean, payment?: Payment, message: string}> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest(
    "POST", 
    `/api/payments/${data.appointmentId}/process`, 
    {
      paymentMethod: data.paymentMethod,
      cardDetails: data.cardDetails
    },
    {
      headers: {
        Authorization: `Bearer ${sessionData.sessionId}`
      }
    }
  );
  
  return response.json();
};

// Format currency amount from cents to display format
export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(amount / 100);
};

// Validate credit card number using Luhn algorithm
export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  // Implement Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through digits in reverse order
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

// Validate card expiry date (MM/YY format)
export const validateCardExpiry = (expiry: string): boolean => {
  // Expected format: MM/YY
  const pattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  
  if (!pattern.test(expiry)) {
    return false;
  }
  
  const [month, year] = expiry.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
  const today = new Date();
  
  // Set to first day of the next month to allow for current month
  today.setDate(1);
  today.setHours(0, 0, 0, 0);
  
  return expiryDate >= today;
};

// Validate card CVC (3-4 digits)
export const validateCardCVC = (cvc: string): boolean => {
  return /^[0-9]{3,4}$/.test(cvc);
};

// Format card number with spaces for display (e.g., 4111 1111 1111 1111)
export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

// Get card type based on the card number
export const getCardType = (cardNumber: string): string => {
  const number = cardNumber.replace(/\D/g, '');
  
  // Visa
  if (number.startsWith('4')) {
    return 'visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(number)) {
    return 'mastercard';
  }
  
  // Amex
  if (/^3[47]/.test(number)) {
    return 'amex';
  }
  
  return 'unknown';
};
