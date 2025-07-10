import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CategoryDropDown, Caption, PrimaryButton, Title } from "../../router";
import { commonClassNameOfInput } from "../../components/common/Design";
import { createProduct, getAllProducts, getActiveAuctions, getProductById } from "../../redux/slices/productSlice";
import { getAllCategories } from "../../redux/slices/categorySlice";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";
import { verifyProductInListings } from "../../utils/dataFetching";
import { compressImages, validateFile, smartCompressImage } from "../../utils/imageCompression";

// Comprehensive antique categories
const ANTIQUE_CATEGORIES = [
  { id: 'furniture', name: 'Furniture', description: 'Antique chairs, tables, cabinets, and other furniture pieces' },
  { id: 'jewelry', name: 'Jewelry', description: 'Vintage and antique jewelry, watches, and accessories' },
  { id: 'ceramics-porcelain', name: 'Ceramics & Porcelain', description: 'Fine china, pottery, vases, and ceramic art' },
  { id: 'art-paintings', name: 'Art & Paintings', description: 'Original paintings, prints, sculptures, and fine art' },
  { id: 'coins-currency', name: 'Coins & Currency', description: 'Rare coins, paper money, and numismatic collectibles' },
  { id: 'books-manuscripts', name: 'Books & Manuscripts', description: 'Rare books, manuscripts, maps, and documents' },
  { id: 'textiles-clothing', name: 'Textiles & Clothing', description: 'Vintage clothing, tapestries, quilts, and fabrics' },
  { id: 'glassware', name: 'Glassware', description: 'Crystal, art glass, bottles, and decorative glass items' },
  { id: 'silverware', name: 'Silverware', description: 'Sterling silver, silver-plated items, and metalwork' },
  { id: 'clocks-watches', name: 'Clocks & Watches', description: 'Antique timepieces, pocket watches, and clock mechanisms' },
  { id: 'musical-instruments', name: 'Musical Instruments', description: 'Vintage instruments, music boxes, and audio equipment' },
  { id: 'toys-games', name: 'Toys & Games', description: 'Antique toys, dolls, board games, and collectible games' },
  { id: 'military-collectibles', name: 'Military Collectibles', description: 'Military artifacts, uniforms, medals, and weapons' },
  { id: 'religious-artifacts', name: 'Religious Artifacts', description: 'Religious art, icons, ceremonial items, and sacred objects' },
  { id: 'decorative-arts', name: 'Decorative Arts', description: 'Ornamental objects, home décor, and artistic accessories' }
];



const initialState = {
  title: "",
  description: "",
  price: "",
  startingBid: "",
  buyNowPrice: "",
  reservePrice: "",
  height: "",
  lengthpic: "",
  width: "",
  mediumused: "",
  weigth: "",
  category: "",
  // Antique-specific fields
  era: "",
  period: "",
  provenance: "",
  condition: "Excellent",
  conditionDetails: "",
  materials: "",
  techniques: "",
  // Certificate of Authenticity (mandatory)
  certificate: null,
  certificatePreview: null,
  historicalSignificance: "",
  maker: "",
  style: "",
  rarity: "Common",
  // Auction fields
  auctionType: "Timed",
  auctionStartDate: "",
  auctionEndDate: "",
  bidIncrement: "10",
  images: [],

  // Pickup address for logistics
  pickupAddress: "",
  pickupCity: "",
  pickupPhone: "",
  pickupInstructions: "",
};

export const AddProduct = () => {
  const [formData, setFormData] = useState(initialState);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.product);

  // Use local loading state for better control
  const isFormLoading = isSubmitting || isLoading;

  useEffect(() => {
    if (error) {
      dispatch(showError(error));
    }
  }, [error, dispatch]);

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const selectedFiles = Array.from(files);

      // Validate files first
      const validationErrors = [];
      for (const file of selectedFiles) {
        const validation = validateFile(file, {
          maxSizeMB: 10, // Allow larger files before compression
          allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        });

        if (!validation.isValid) {
          validationErrors.push(...validation.errors);
        }
      }

      if (validationErrors.length > 0) {
        dispatch(showError(validationErrors[0]));
        return;
      }

      // Show loading state
      setIsSubmitting(true);
      dispatch(showSuccess("Compressing images, please wait..."));

      try {
        // Compress images to reduce payload size
        const compressedFiles = await compressImages(selectedFiles, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
          maxSizeKB: 400 // Target 400KB per image
        });

        setImageFiles(compressedFiles);

        // Create previews
        const previews = compressedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);

        setFormData(prev => ({
          ...prev,
          image: compressedFiles[0], // Use first file as main image
          images: compressedFiles
        }));

        // Calculate total payload size
        const totalSize = compressedFiles.reduce((sum, file) => sum + file.size, 0);
        const totalSizeMB = totalSize / (1024 * 1024);

        console.log(`Total compressed payload: ${totalSizeMB.toFixed(2)}MB`);

        if (totalSizeMB > 3) {
          dispatch(showError("Total image size is still too large. Please use fewer or smaller images."));
          return;
        }

        dispatch(showSuccess(`Images compressed successfully! Total size: ${totalSizeMB.toFixed(2)}MB`));
      } catch (error) {
        console.error('Image compression failed:', error);
        dispatch(showError("Failed to compress images. Please try with smaller files."));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCertificateChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        dispatch(showError("Certificate must be a PDF, JPG, or PNG file"));
        return;
      }

      // Validate file size (5MB max before compression)
      if (file.size > 5 * 1024 * 1024) {
        dispatch(showError("Certificate file must be less than 5MB"));
        return;
      }

      let processedFile = file;
      let previewUrl = null;

      // Compress image certificates to reduce payload size
      if (file.type.startsWith('image/')) {
        try {
          setIsSubmitting(true);
          dispatch(showSuccess("Compressing certificate image..."));

          processedFile = await smartCompressImage(file);
          previewUrl = URL.createObjectURL(processedFile);

          const originalSizeMB = file.size / (1024 * 1024);
          const compressedSizeMB = processedFile.size / (1024 * 1024);

          console.log(`Certificate compressed: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`);
          dispatch(showSuccess(`Certificate compressed: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`));
        } catch (error) {
          console.error('Certificate compression failed:', error);
          dispatch(showError("Failed to compress certificate. Using original file."));
          previewUrl = URL.createObjectURL(file);
        } finally {
          setIsSubmitting(false);
        }
      }

      setFormData(prev => ({
        ...prev,
        certificate: processedFile,
        certificatePreview: previewUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted - starting validation...');

    // Prevent double submission
    if (isSubmitting) {
      console.log('Form already submitting, preventing double submission');
      return;
    }

    setIsSubmitting(true);

    try {
      // Enhanced validation
      if (!formData.title?.trim()) {
        throw new Error("Please enter a title for your antique");
      }

      if (!formData.description?.trim()) {
        throw new Error("Please provide a description");
      }

      if (!formData.category) {
        throw new Error("Please select a category");
      }

      if (!formData.startingBid || parseFloat(formData.startingBid) <= 0) {
        throw new Error("Please enter a valid starting bid greater than 0");
      }

      console.log('Validation passed, preparing form data...');

      // Create FormData for submission
      const submitData = new FormData();

      // Add basic fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('startingBid', formData.startingBid);
      submitData.append('category', formData.category);
      submitData.append('auctionType', formData.auctionType || 'Timed');

      // Add optional fields
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

      // Make direct API request
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
      dispatch(showSuccess('Antique listing created successfully!'));

      // Navigate to the product page
      if (result._id) {
        navigate(`/details/${result._id}`);
      } else if (result.data && result.data._id) {
        navigate(`/details/${result.data._id}`);
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      dispatch(showError(error.message || 'Failed to create listing'));
    } finally {
      setIsSubmitting(false);
    }

  };
  return (
    <>
      <section className="bg-white shadow-s1 p-8 rounded-xl">
        <Title level={5} className="font-normal mb-5">
          Create Antique Listing
        </Title>
        <hr className="my-5" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <Title level={6}>Basic Information</Title>

            <div className="w-full">
              <Caption className="mb-2">Title *</Caption>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={commonClassNameOfInput}
                placeholder="Enter antique title"
                required
                disabled={isFormLoading}
              />
            </div>

            <div className="w-full">
              <Caption className="mb-2">Category *</Caption>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${commonClassNameOfInput} focus:ring-green focus:border-green`}
                required
                disabled={isLoading}
              >
                <option value="">Select Antique Category</option>
                {ANTIQUE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id} title={cat.description}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formData.category && (
                <div className="mt-2 text-sm text-gray-600">
                  {ANTIQUE_CATEGORIES.find(cat => cat.id === formData.category)?.description}
                </div>
              )}
            </div>

            <div className="w-full">
              <Caption className="mb-2">Description *</Caption>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={commonClassNameOfInput}
                rows="4"
                placeholder="Detailed description of the antique"
                required
                disabled={isLoading}
              />
            </div>

            {/* Certificate of Authenticity Upload */}
            <div className="w-full">
              <Caption className="mb-2">Certificate of Authenticity *</Caption>
              <div className="space-y-4">
                <input
                  type="file"
                  name="certificate"
                  onChange={handleCertificateChange}
                  className={commonClassNameOfInput}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-600">
                  Upload a certificate of authenticity (PDF, JPG, or PNG, max 5MB)
                </p>

                {/* Certificate Preview */}
                {formData.certificate && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green rounded-lg flex items-center justify-center">
                          {formData.certificate.type === 'application/pdf' ? (
                            <span className="text-white font-bold text-xs">PDF</span>
                          ) : (
                            <span className="text-white font-bold text-xs">IMG</span>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{formData.certificate.name}</p>
                          <p className="text-gray-600 text-sm">
                            {(formData.certificate.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="text-green">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {formData.certificatePreview && (
                      <div className="mt-4">
                        <img
                          src={formData.certificatePreview}
                          alt="Certificate preview"
                          className="max-w-full h-48 object-contain rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Antique Details */}
          <div className="space-y-4">
            <Title level={6}>Antique Details</Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Caption className="mb-2">Era</Caption>
                <input
                  type="text"
                  name="era"
                  value={formData.era}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="e.g., Victorian, Art Deco"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Caption className="mb-2">Period</Caption>
                <input
                  type="text"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="e.g., 18th Century"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Caption className="mb-2">Condition</Caption>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  disabled={isLoading}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <Caption className="mb-2">Rarity</Caption>
                <select
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  disabled={isLoading}
                >
                  <option value="Common">Common</option>
                  <option value="Uncommon">Uncommon</option>
                  <option value="Rare">Rare</option>
                  <option value="Very Rare">Very Rare</option>
                  <option value="Extremely Rare">Extremely Rare</option>
                </select>
              </div>
            </div>

            <div className="w-full">
              <Caption className="mb-2">Provenance</Caption>
              <textarea
                name="provenance"
                value={formData.provenance}
                onChange={handleChange}
                className={commonClassNameOfInput}
                rows="3"
                placeholder="History and ownership details"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Physical Specifications */}
          <div className="space-y-4">
            <Title level={6}>Physical Specifications</Title>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Caption className="mb-2">Height (cm)</Caption>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="Height"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Caption className="mb-2">Length (cm)</Caption>
                <input
                  type="number"
                  name="lengthpic"
                  value={formData.lengthpic}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="Length"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Caption className="mb-2">Width (cm)</Caption>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="Width"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Caption className="mb-2">Weight (kg)</Caption>
                <input
                  type="number"
                  name="weigth"
                  value={formData.weigth}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="Weight"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Caption className="mb-2">Materials</Caption>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="e.g., Wood, Bronze, Ceramic (comma separated)"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Auction Settings */}
          <div className="space-y-4">
            <Title level={6}>Auction Settings</Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Caption className="mb-2">Auction Type</Caption>
                <select
                  name="auctionType"
                  value={formData.auctionType}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  disabled={isLoading}
                >
                  <option value="Timed">Timed Auction</option>
                  <option value="Live">Live Auction</option>
                </select>
              </div>
              <div>
                <Caption className="mb-2">Bid Increment ($)</Caption>
                <input
                  type="number"
                  name="bidIncrement"
                  value={formData.bidIncrement}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="10"
                  min="1"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Caption className="mb-2">Starting Bid ($) *</Caption>
                <input
                  type="number"
                  name="startingBid"
                  value={formData.startingBid}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="Starting bid amount"
                  min="1"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Caption className="mb-2">Reserve Price ($)</Caption>
                <input
                  type="number"
                  name="reservePrice"
                  value={formData.reservePrice}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="Minimum selling price"
                  min="0"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Caption className="mb-2">Buy Now Price ($)</Caption>
                <input
                  type="number"
                  name="buyNowPrice"
                  value={formData.buyNowPrice}
                  onChange={handleChange}
                  className={commonClassNameOfInput}
                  placeholder="Instant purchase price"
                  min="0"
                  disabled={isLoading}
                />
              </div>
            </div>

            {formData.auctionType === "Timed" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Caption className="mb-2">Auction Start Date *</Caption>
                  <input
                    type="datetime-local"
                    name="auctionStartDate"
                    value={formData.auctionStartDate}
                    onChange={handleChange}
                    className={commonClassNameOfInput}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Caption className="mb-2">Auction End Date *</Caption>
                  <input
                    type="datetime-local"
                    name="auctionEndDate"
                    value={formData.auctionEndDate}
                    onChange={handleChange}
                    className={commonClassNameOfInput}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Title level={6}>Images</Title>
            <div>
              <Caption className="mb-2">Upload Images (Multiple files allowed)</Caption>
              <input
                type="file"
                name="images"
                onChange={handleChange}
                className={commonClassNameOfInput}
                multiple
                accept="image/*"
                disabled={isLoading}
              />
              <Caption className="text-gray-500 text-sm mt-1">
                Upload high-quality images showing different angles of the antique. Images will be automatically compressed to optimize upload speed.
              </Caption>
              {imageFiles.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  <strong>Images ready:</strong> {imageFiles.length} file(s)
                  {imageFiles.length > 0 && (
                    <span className="ml-2">
                      (Total: {(imageFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)}MB)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pickup Address for Logistics */}
          <div className="space-y-4">
            <Title level={6}>Pickup Address</Title>
            <Caption className="text-gray-600">
              Provide the address where our team can collect the item after the auction ends.
            </Caption>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Caption className="mb-2">Street Address</Caption>
                <input
                  type="text"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  className={commonClassNameOfInput}
                  placeholder="e.g., 123 Main Street, Apartment 4B"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Caption className="mb-2">City</Caption>
                <input
                  type="text"
                  name="pickupCity"
                  value={formData.pickupCity}
                  onChange={handleInputChange}
                  className={commonClassNameOfInput}
                  placeholder="e.g., Addis Ababa"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Caption className="mb-2">Contact Phone</Caption>
                <input
                  type="tel"
                  name="pickupPhone"
                  value={formData.pickupPhone}
                  onChange={handleInputChange}
                  className={commonClassNameOfInput}
                  placeholder="e.g., +251 911 123456"
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <Caption className="mb-2">Special Instructions</Caption>
                <textarea
                  name="pickupInstructions"
                  value={formData.pickupInstructions}
                  onChange={handleInputChange}
                  rows={3}
                  className={commonClassNameOfInput}
                  placeholder="e.g., Ring doorbell twice, item is in the basement, available weekdays 9-5"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <PrimaryButton
              type="submit"
              className="flex-1 rounded-lg py-3"
              disabled={isFormLoading}
            >
              {isFormLoading ? "Creating..." : "Create Antique Listing"}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => navigate("/product")}
              className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isFormLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </>
  );
};
