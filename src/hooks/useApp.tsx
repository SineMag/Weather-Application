import { useState, useEffect, useContext, createContext } from "react";
import type { ReactNode } from "react";
import { supabaseHelpers, getDeviceId } from "../lib/supabase-simple";

interface AppContextType {
  deviceId: string;
  loading: boolean;
  preferences: any;
  updatePreferences: (preferences: any) => Promise<void>;
  saveLocation: (location: any) => Promise<any>;
  getSavedLocations: () => Promise<any[]>;
  deleteLocation: (id: string) => Promise<void>;
  saveWeatherSearch: (search: any) => Promise<any>;
  getWeatherSearches: () => Promise<any[]>;
  clearWeatherSearches: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    // Initialize device ID and load preferences
    const initializeApp = async () => {
      try {
        // Generate or get device ID
        const storedDeviceId = getDeviceId();
        setDeviceId(storedDeviceId);

        // Load user preferences
        const userPrefs = await supabaseHelpers.getUserPreferences();
        setPreferences(userPrefs);
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const updatePreferences = async (newPreferences: any) => {
    try {
      const updatedPrefs = await supabaseHelpers.updateUserPreferences(
        newPreferences
      );
      setPreferences(updatedPrefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  const saveLocation = async (location: any) => {
    try {
      return await supabaseHelpers.saveLocation(location);
    } catch (error) {
      console.error("Error saving location:", error);
      throw error;
    }
  };

  const getSavedLocations = async () => {
    try {
      return await supabaseHelpers.getSavedLocations();
    } catch (error) {
      console.error("Error getting saved locations:", error);
      return [];
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      await supabaseHelpers.deleteLocation(id);
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  };

  const saveWeatherSearch = async (search: any) => {
    try {
      return await supabaseHelpers.saveWeatherSearch(search);
    } catch (error) {
      console.error("Error saving weather search:", error);
      throw error;
    }
  };

  const getWeatherSearches = async () => {
    try {
      return await supabaseHelpers.getWeatherSearches();
    } catch (error) {
      console.error("Error getting weather searches:", error);
      return [];
    }
  };

  const clearWeatherSearches = async () => {
    try {
      await supabaseHelpers.clearWeatherSearches();
    } catch (error) {
      console.error("Error clearing weather searches:", error);
      throw error;
    }
  };

  const value: AppContextType = {
    deviceId,
    loading,
    preferences,
    updatePreferences,
    saveLocation,
    getSavedLocations,
    deleteLocation,
    saveWeatherSearch,
    getWeatherSearches,
    clearWeatherSearches,
  };

  return (
    <AppContext.Provider value={value}>
      {!loading && children}
    </AppContext.Provider>
  );
};
