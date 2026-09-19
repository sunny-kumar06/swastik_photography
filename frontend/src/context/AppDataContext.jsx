import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { bootstrapApi, galleryApi, servicesApi, packagesApi, reviewsApi, settingsApi } from '../api/client';
import { getCachedData, setCachedData } from '../utils/cache';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Preparing visual showcase...');

  // Data states with immediate fallback to localStorage cache
  const [photos, setPhotos] = useState(() => getCachedData('gallery_photos', []));
  const [services, setServices] = useState(() => getCachedData('services_list', []));
  const [packages, setPackages] = useState(() => getCachedData('packages_list', []));
  const [reviews, setReviews] = useState(() => getCachedData('reviews_list', []));
  const [bookedDates, setBookedDates] = useState(() => getCachedData('booked_dates', []));

  const loadAllData = useCallback(async () => {
    try {
      setLoadingStage('Connecting to cinematic studio...');
      // 1. Try unified bootstrap endpoint (1 single network call)
      const res = await bootstrapApi.get();
      if (res.data && res.data.success && res.data.data) {
        const { gallery, services: srvs, packages: pkgs, reviews: revs, bookedDates: bDates, settings } = res.data.data;

        if (gallery && gallery.length > 0) {
          setPhotos(gallery);
          setCachedData('gallery_photos', gallery);
        }
        if (srvs && srvs.length > 0) {
          setServices(srvs);
          setCachedData('services_list', srvs);
        }
        if (pkgs && pkgs.length > 0) {
          setPackages(pkgs);
          setCachedData('packages_list', pkgs);
        }
        if (revs && revs.length > 0) {
          setReviews(revs);
          setCachedData('reviews_list', revs);
        }
        if (bDates) {
          setBookedDates(bDates);
          setCachedData('booked_dates', bDates);
        }
        if (settings && Object.keys(settings).length > 0) {
          setCachedData('website_settings', settings);
        }

        setLoadingStage('Visual portfolio ready');
        setIsInitialDataLoaded(true);
        return;
      }
    } catch (bootstrapErr) {
      console.warn('[Bootstrap API fallback to parallel queries]:', bootstrapErr.message);
    }

    // 2. Fallback: Fetch in parallel using individual APIs if bootstrap is unavailable
    try {
      setLoadingStage('Fetching high-definition assets...');
      const [galRes, srvRes, pkgRes, revRes] = await Promise.allSettled([
        galleryApi.getAll(),
        servicesApi.getAll(),
        packagesApi.getAll(),
        reviewsApi.getAll(),
      ]);

      if (galRes.status === 'fulfilled' && galRes.value?.data?.data) {
        setPhotos(galRes.value.data.data);
        setCachedData('gallery_photos', galRes.value.data.data);
      }
      if (srvRes.status === 'fulfilled' && srvRes.value?.data?.data) {
        setServices(srvRes.value.data.data);
        setCachedData('services_list', srvRes.value.data.data);
      }
      if (pkgRes.status === 'fulfilled' && pkgRes.value?.data?.data) {
        setPackages(pkgRes.value.data.data);
        setCachedData('packages_list', pkgRes.value.data.data);
      }
      if (revRes.status === 'fulfilled' && revRes.value?.data?.data) {
        setReviews(revRes.value.data.data);
        setCachedData('reviews_list', revRes.value.data.data);
      }
    } catch (fallbackErr) {
      console.error('[Parallel data fetch error]:', fallbackErr);
    } finally {
      setLoadingStage('Visual portfolio ready');
      setIsInitialDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <AppDataContext.Provider
      value={{
        isInitialDataLoaded,
        loadingStage,
        photos,
        services,
        packages,
        reviews,
        bookedDates,
        refreshData: loadAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export default AppDataContext;
