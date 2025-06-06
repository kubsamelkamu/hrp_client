// src/pages/properties/list.tsx

import { NextPage } from 'next';
import Head from 'next/head';
import {
  useState,
  FormEvent,
  ChangeEvent,
  useEffect,
  useContext,
} from 'react';
import { useRouter } from 'next/router';
import {
  BedDouble,
  Bath,
  Home,
  MapPin,
  Tag,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProperty, Property } from '@/store/slices/propertySlice';
import api from '@/utils/api';
import { motion } from 'framer-motion';
import UserLayout from '@/components/userLayout/Layout';
import { ThemeContext } from '@/components/context/ThemeContext';

const NewPropertyPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useContext(ThemeContext)!;

  const { user, status: authStatus } = useAppSelector((state) => state.auth);
  const { loading: creatingProperty, error: apiError } = useAppSelector(
    (state) => state.properties
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [rentPerMonth, setRentPerMonth] = useState('');
  const [numBedrooms, setNumBedrooms] = useState(1);
  const [numBathrooms, setNumBathrooms] = useState(1);
  const [propertyType, setPropertyType] = useState<
    'APARTMENT' | 'HOUSE' | 'STUDIO' | 'VILLA'
  >('APARTMENT');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [formError, setFormError] = useState<string>('');
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent('/properties/list')}`
      );
      return;
    }

    if (user.role !== 'LANDLORD') {
      alert('you must be a landlord to list properties');
      router.replace('/become-landlord');
    }
  }, [user, authStatus, router]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const lettersOnlyRegex = /^[A-Za-z\s.,]+$/;
    if (!lettersOnlyRegex.test(title.trim())) {
      setFormError('Title must contain only letters and spaces.');
      return;
    }
    if (!lettersOnlyRegex.test(description.trim())) {
      setFormError('Description must contain only letters and spaces.');
      return;
    }
    if (!lettersOnlyRegex.test(city.trim())) {
      setFormError('City must contain only letters and spaces.');
      return;
    }
    for (const amenity of amenities) {
      if (!lettersOnlyRegex.test(amenity.trim())) {
        setFormError('Each amenity must contain only letters and spaces.');
        return;
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      city: city.trim(),
      rentPerMonth,
      numBedrooms,
      numBathrooms,
      propertyType,
      amenities,
    };

    const resultAction = await dispatch(createProperty(payload));
    if (!createProperty.fulfilled.match(resultAction)) {
      return;
    }

    const created: Property = resultAction.payload;
    const propertyId = created.id;
    if (files.length) {
      setUploadingImages(true);
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      try {
        await api.post(`/api/properties/${propertyId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch {
        setFormError('Failed to upload images. Please try again.');
        return;
      } finally {
        setUploadingImages(false);
      }
    }

    router.push(`/properties/${propertyId}`);
  };

  const isSubmitting = creatingProperty || uploadingImages;

  return (
    <UserLayout>
      <Head>
        <title>Rentify | List a New Property</title>
        <meta
          name="description"
          content="Use Rentify to list your property and reach renters. Fill out the form to create a new listing."
        />
      </Head>
      <div
        className={`min-h-screen py-12 px-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-tr from-gray-900 to-gray-800'
            : 'bg-gradient-to-tr from-blue-50 to-white'
        }`}
      >
        <div
          className={`max-w-3xl mx-auto shadow-2xl rounded-2xl overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800 shadow-gray-900' : 'bg-white'
          }`}
        >
          <div
            className={`py-6 px-8 ${
              theme === 'dark' ? 'bg-blue-800 text-blue-100' : 'bg-blue-600 text-white'
            }`}
          >
            <h1 className="text-3xl font-extrabold">List a New Property</h1>
            <p className={`mt-1 ${theme === 'dark' ? 'opacity-90' : 'opacity-80'}`}>
              Reach hundreds of renters
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label
                className={`flex items-center text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                <Home
                  className={`w-5 h-5 mr-2 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />{' '}
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Cozy Apartment in Downtown"
                className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-gray-100'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className={`flex items-center text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                <ImageIcon
                  className={`w-5 h-5 mr-2 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />{' '}
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="This cozy apartment is located in the heart of downtown..."
                rows={4}
                className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-gray-100'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* City + Rent Per Month */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`flex items-center text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 mr-2 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />{' '}
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="e.g. Addis Ababa"
                  className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-gray-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`flex items-center text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <Tag
                    className={`w-5 h-5 mr-2 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />{' '}
                  Rent / month (ብር)
                </label>
                <div className="relative">
                  <span
                    className={`absolute inset-y-0 left-3 flex items-center ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    ብር
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min={1000}
                    value={rentPerMonth}
                    onChange={(e) => setRentPerMonth(e.target.value)}
                    required
                    placeholder="10000"
                    className={`w-full px-10 py-2 rounded-lg shadow-sm focus:ring-2 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-gray-100'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms + Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`flex items-center text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <BedDouble
                    className={`w-5 h-5 mr-2 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />{' '}
                  Bedrooms
                </label>
                <input
                  type="number"
                  min={1}
                  value={numBedrooms}
                  onChange={(e) => setNumBedrooms(Number(e.target.value))}
                  required
                  className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-gray-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`flex items-center text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <Bath
                    className={`w-5 h-5 mr-2 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />{' '}
                  Bathrooms
                </label>
                <input
                  type="number"
                  min={1}
                  value={numBathrooms}
                  onChange={(e) => setNumBathrooms(Number(e.target.value))}
                  required
                  className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-gray-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Property Type + Amenities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) =>
                    setPropertyType(
                      e.target.value as 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'VILLA'
                    )
                  }
                  className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-gray-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="STUDIO">Studio</option>
                  <option value="VILLA">Villa</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Amenities
                </label>
                <input
                  type="text"
                  value={amenities.join(', ')}
                  onChange={(e) =>
                    setAmenities(
                      e.target.value
                        .split(',')
                        .map((a) => a.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="WiFi, Parking, Air Conditioning"
                  className={`w-full px-4 py-2 rounded-lg shadow-sm focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400 text-gray-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Images Upload */}
            <div>
              <label
                className={`flex items-center text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                <ImageIcon
                  className={`w-5 h-5 mr-2 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                />{' '}
                Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                disabled={files.length >= 2}
                className={`block ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              />
              {files.length >= 2 && (
                <p
                  className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Maximum of 2 images uploaded.
                </p>
              )}
              {previews.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className={`relative w-full h-24 rounded-lg overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Show any form error */}
            {(formError || apiError) && (
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-500'
                }`}
              >
                {formError || apiError}
              </p>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full py-3 rounded-lg font-semibold shadow-lg disabled:opacity-50 ${
                isSubmitting
                  ? ''
                  : theme === 'dark'
                  ? 'bg-blue-700 text-blue-100 hover:bg-blue-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 inline-block text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : null}
              {isSubmitting ? 'Please wait…' : 'List Property'}
            </motion.button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default NewPropertyPage;
