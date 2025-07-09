// Common form handling utilities to reduce code duplication

import { useState, useCallback } from 'react';

// Generic form state manager
export const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes with support for nested objects
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: inputValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handle array inputs (comma-separated values)
  const handleArrayInput = useCallback((name, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [name]: items
    }));
  }, []);

  // Handle file uploads
  const handleFileUpload = useCallback((name, files) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      [name]: fileArray
    }));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  }, [initialState]);

  // Update specific field
  const updateField = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set multiple fields at once
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Set form errors
  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  // Clear specific error
  const clearError = useCallback((fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    setFormData,
    setErrors,
    setIsSubmitting,
    handleInputChange,
    handleArrayInput,
    handleFileUpload,
    resetForm,
    updateField,
    updateFields,
    setFormErrors,
    clearError
  };
};

// Common form submission handler
export const useFormSubmission = (submitFunction, options = {}) => {
  const {
    onSuccess = () => {},
    onError = () => {},
    resetOnSuccess = false,
    showSuccessMessage = true,
    showErrorMessage = true
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (formData, resetForm) => {
    setIsSubmitting(true);
    
    try {
      const result = await submitFunction(formData);
      
      if (result.success) {
        if (showSuccessMessage && result.message) {
          // Success message will be handled by the submitFunction
        }
        
        if (resetOnSuccess && resetForm) {
          resetForm();
        }
        
        onSuccess(result.data);
      } else {
        if (showErrorMessage && result.error) {
          // Error message will be handled by the submitFunction
        }
        
        onError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFunction, onSuccess, onError, resetOnSuccess, showSuccessMessage, showErrorMessage]);

  return {
    isSubmitting,
    handleSubmit
  };
};

// Common data fetching patterns
export const useFetchData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    refetch,
    setData,
    setError
  };
};

// Common search and filter patterns
export const useSearchAndFilter = (initialFilters = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
  }, [initialFilters]);

  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Build query parameters for API calls
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
    }
    
    return params;
  }, [searchTerm, filters, sortBy, sortOrder]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    buildQueryParams
  };
};

// Common pagination patterns
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const updatePagination = useCallback((paginationData) => {
    if (paginationData.totalPages) setTotalPages(paginationData.totalPages);
    if (paginationData.totalItems) setTotalItems(paginationData.totalItems);
    if (paginationData.currentPage) setCurrentPage(paginationData.currentPage);
    if (paginationData.limit) setLimit(paginationData.limit);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setTotalPages(0);
    setTotalItems(0);
  }, [initialPage]);

  return {
    currentPage,
    limit,
    totalPages,
    totalItems,
    setCurrentPage,
    setLimit,
    goToPage,
    nextPage,
    prevPage,
    updatePagination,
    resetPagination
  };
};
