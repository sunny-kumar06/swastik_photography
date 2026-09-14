import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../api/client';

const defaultSettings = {
  businessName: 'Swastik Photography',
  tagline: 'Premium Photography & Cinematic Videography',
  phone: '9608782890',
  email: 'sk61398sny@gmail.com',
  whatsapp: '9608782890',
  address: 'Studio Swastik, Main Road, City Center',
  socialLinks: {
    instagram: 'https://www.instagram.com/swastik__photography__?stkn=MW1iMGR6bDAxbWZudQ==',
    facebook: '',
    youtube: '',
  },
  heroHeading: 'Creating Memories That Last Forever',
  heroSubtitle: 'Premium Photography & Cinematic Videography',
  aboutTitle: 'Capturing Timeless Stories With Cinematic Artistry',
  aboutText:
    'At Swastik Photography, we believe every frame tells a unique story. With over 8 years of passionate dedication, cutting-edge camera gear, and an editorial eye for raw emotion, we turn fleeting celebrations into timeless cinematic art. From intimate vows to grand weddings, we capture the soul of your most cherished moments.',
  experienceYears: 8,
  eventsCount: 650,
  happyClientsCount: 1200,
  cinematicFilmsCount: 250,
  footerText:
    'Swastik Photography — Transforming real emotions into everlasting visual legacies. Available worldwide for destination weddings and signature events.',
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.get();
      if (res.data && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.warn('[Settings fetch fallback to defaults]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettingsState = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettingsState,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
