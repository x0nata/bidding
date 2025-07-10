import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';



const AntiqueListingForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Simple form state without complex hooks
  const [formData, setFormData] = useState({
    // Basic product info
    title: '',
    description: '',
    startingBid: '',
    reservePrice: '',
    category: '',

    // Antique-specific fields
    era: '',
    period: '',
    provenance: '',
    condition: 'Good',
    conditionDetails: '',
    materials: '',
    techniques: '',
    historicalSignificance: '',
    makerName: '',
    makerNationality: '',
    makerLifespan: '',
    style: '',
    rarity: 'Common',

    // Auction settings
    auctionType: 'Timed',
    auctionStartDate: '',
    auctionEndDate: '',
    bidIncrement: 10,

    // Physical attributes
    height: '',
    width: '',
    lengthpic: '',
    weigth: '',
    mediumused: '',

    // Pickup address for logistics
    pickupAddress: '',
    pickupCity: '',
    pickupPhone: '',
    pickupInstructions: '',

    // Images
    images: []
  });

  const eraOptions = [
    'Ancient', 'Medieval', 'Renaissance', 'Baroque', 'Georgian', 
    'Victorian', 'Edwardian', 'Art Nouveau', 'Art Deco', 
    'Mid-Century Modern', 'Contemporary', 'Other'
  ];

  const conditionOptions = [
    'Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Restoration Required'
  ];

  const rarityOptions = [
    'Common', 'Uncommon', 'Rare', 'Very Rare', 'Extremely Rare', 'Unique'
  ];

  const auctionTypeOptions = [
    { value: 'Timed', label: 'Timed Auction' },
    { value: 'Live', label: 'Live Auction' },
    { value: 'Buy Now', label: 'Buy Now' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/category`);
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData || []);
        console.log('Categories loaded:', categoriesData);
      } else {
        console.error('Failed to load categories:', response.status);
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Simple input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Simple image upload handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Images selected:', files.length);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  // Simple form validation
  const validateForm = () => {
    console.log('Validating form...');
    const required = ['title', 'description', 'startingBid', 'category'];

    for (const field of required) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    console.log('Form validation passed');
    return true;
  };

  // Simple, clean form submission
  const submitForm = async () => {
    console.log('Starting form submission...');

    try {
      setSubmissionError(null);

      // Create FormData for submission
      const submitData = new FormData();

      // Add basic fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('startingBid', formData.startingBid);
      submitData.append('category', formData.category);
      submitData.append('auctionType', formData.auctionType);

      // Add optional fields only if they have values
      if (formData.reservePrice) submitData.append('reservePrice', formData.reservePrice);
      if (formData.era) submitData.append('era', formData.era);
      if (formData.period) submitData.append('period', formData.period);
      if (formData.provenance) submitData.append('provenance', formData.provenance);
      if (formData.condition) submitData.append('condition', formData.condition);
      if (formData.conditionDetails) submitData.append('conditionDetails', formData.conditionDetails);
      if (formData.historicalSignificance) submitData.append('historicalSignificance', formData.historicalSignificance);
      if (formData.style) submitData.append('style', formData.style);
      if (formData.rarity) submitData.append('rarity', formData.rarity);
      if (formData.bidIncrement) submitData.append('bidIncrement', formData.bidIncrement);

      // Add physical attributes
      if (formData.height) submitData.append('height', formData.height);
      if (formData.width) submitData.append('width', formData.width);
      if (formData.lengthpic) submitData.append('lengthpic', formData.lengthpic);
      if (formData.weigth) submitData.append('weigth', formData.weigth);
      if (formData.mediumused) submitData.append('mediumused', formData.mediumused);

      // Add pickup address fields
      if (formData.pickupAddress) submitData.append('pickupAddress', formData.pickupAddress);
      if (formData.pickupCity) submitData.append('pickupCity', formData.pickupCity);
      if (formData.pickupPhone) submitData.append('pickupPhone', formData.pickupPhone);
      if (formData.pickupInstructions) submitData.append('pickupInstructions', formData.pickupInstructions);

      // Add maker information as JSON if any field is filled
      if (formData.makerName || formData.makerNationality || formData.makerLifespan) {
        const maker = {
          name: formData.makerName || '',
          nationality: formData.makerNationality || '',
          lifespan: formData.makerLifespan || ''
        };
        submitData.append('maker', JSON.stringify(maker));
      }

      // Add materials and techniques as JSON arrays
      if (formData.materials) {
        const materialsArray = formData.materials.split(',').map(item => item.trim()).filter(item => item);
        if (materialsArray.length > 0) {
          submitData.append('materials', JSON.stringify(materialsArray));
        }
      }

      if (formData.techniques) {
        const techniquesArray = formData.techniques.split(',').map(item => item.trim()).filter(item => item);
        if (techniquesArray.length > 0) {
          submitData.append('techniques', JSON.stringify(techniquesArray));
        }
      }

      // Add auction dates if provided
      if (formData.auctionStartDate) submitData.append('auctionStartDate', formData.auctionStartDate);
      if (formData.auctionEndDate) submitData.append('auctionEndDate', formData.auctionEndDate);

      // Add images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(image => {
          submitData.append('images', image);
        });
      }

      console.log('FormData prepared, making API request...');

      // Make API request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/product`, {
        method: 'POST',
        body: submitData,
        credentials: 'include'
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Product creation successful:', result);

      // Show success message
      toast.success('Antique listing created successfully!');

      // Navigate to the product page
      if (result._id) {
        navigate(`/product/${result._id}`);
      } else if (result.data && result.data._id) {
        navigate(`/product/${result.data._id}`);
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionError(error.message);
      toast.error(error.message || 'Failed to create listing');
    }
  };

  // Simple form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorDismiss = () => {
    setSubmissionError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">List Your Antique</h2>

      {/* Simple Error Display */}
      {submissionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <p className="text-red-700">{submissionError}</p>
            <button
              onClick={handleErrorDismiss}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Victorian Mahogany Writing Desk"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <optgroup key={category._id} label={category.title}>
                    <option value={category._id}>{category.title}</option>
                    {category.subcategories?.map(sub => (
                      <option key={sub._id} value={sub._id}>
                        &nbsp;&nbsp;{sub.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the antique, including its history, condition, and unique features..."
              required
            />
          </div>
        </div>

        {/* Antique Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Antique Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Era
              </label>
              <select
                name="era"
                value={formData.era}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Era</option>
                {eraOptions.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {conditionOptions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rarity
              </label>
              <select
                name="rarity"
                value={formData.rarity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rarityOptions.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period
              </label>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1850-1870, Early 19th Century"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <input
                type="text"
                name="style"
                value={formData.style}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Chippendale, Louis XVI, Arts and Crafts"
              />
            </div>
          </div>
        </div>

        {/* Auction Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Auction Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Bid * ($)
              </label>
              <input
                type="number"
                name="startingBid"
                value={formData.startingBid}
                onChange={handleInputChange}
                min="1"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter starting bid amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reserve Price ($)
              </label>
              <input
                type="number"
                name="reservePrice"
                value={formData.reservePrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional reserve price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Type *
              </label>
              <select
                name="auctionType"
                value={formData.auctionType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {auctionTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bid Increment ($)
              </label>
              <input
                type="number"
                name="bidIncrement"
                value={formData.bidIncrement}
                onChange={handleInputChange}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          {formData.auctionType === 'Timed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Start Date
                  <span className="text-sm text-gray-500 ml-1">(optional - defaults to immediate start)</span>
                </label>
                <input
                  type="datetime-local"
                  name="auctionStartDate"
                  value={formData.auctionStartDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auction End Date
                  <span className="text-sm text-gray-500 ml-1">(optional - defaults to 7 days)</span>
                </label>
                <input
                  type="datetime-local"
                  name="auctionEndDate"
                  value={formData.auctionEndDate}
                  onChange={handleInputChange}
                  min={formData.auctionStartDate || new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pickup Address for Logistics */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Pickup Address</h3>
          <p className="text-sm text-gray-600 mb-4">
            Provide the address where our team can collect the item after the auction ends.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 123 Main Street, Apartment 4B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="pickupCity"
                value={formData.pickupCity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Addis Ababa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="pickupPhone"
                value={formData.pickupPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., +251 911 123456"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                name="pickupInstructions"
                value={formData.pickupInstructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ring doorbell twice, item is in the basement, available weekdays 9-5"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Images</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload multiple images of your antique. First image will be the main display image.
            </p>

            {formData.images && formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Images: {formData.images.length}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="text-sm text-gray-600 p-2 bg-white rounded border">
                      {image.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AntiqueListingForm;
