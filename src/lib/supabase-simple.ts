import { createClient } from "@supabase/supabase-js";

// These environment variables need to be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a unique device ID for this browser
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("weather_app_device_id");
  if (!deviceId) {
    deviceId =
      "device_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    localStorage.setItem("weather_app_device_id", deviceId);
  }
  return deviceId;
};

// Types for our database tables
export interface UserPreferences {
  id: string;
  device_id: string;
  unit: "metric" | "imperial";
  theme: "light" | "dark";
  notifications_enabled: boolean;
  offline_access_enabled: boolean;
  default_location?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedLocation {
  id: string;
  device_id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  favorite: boolean;
  weather_data?: any;
  created_at: string;
  updated_at: string;
}

export interface WeatherSearch {
  id: string;
  device_id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  weather_data: any;
  created_at: string;
}

// Helper functions for database operations (no authentication required)
export const supabaseHelpers = {
  // User Preferences
  async getUserPreferences(): Promise<UserPreferences | null> {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("device_id", deviceId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found
      console.error("Error getting preferences:", error);
      return null;
    }
    return data;
  },

  async updateUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert({
        device_id: deviceId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Saved Locations
  async getSavedLocations(): Promise<SavedLocation[]> {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("saved_locations")
      .select("*")
      .eq("device_id", deviceId)
      .order("favorite", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting saved locations:", error);
      return [];
    }
    return data || [];
  },

  async saveLocation(
    location: Omit<
      SavedLocation,
      "id" | "device_id" | "created_at" | "updated_at"
    >
  ): Promise<SavedLocation> {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("saved_locations")
      .insert({
        device_id: deviceId,
        ...location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLocation(locationId: string): Promise<void> {
    const { error } = await supabase
      .from("saved_locations")
      .delete()
      .eq("id", locationId);

    if (error) throw error;
  },

  async toggleFavoriteLocation(
    locationId: string,
    favorite: boolean
  ): Promise<SavedLocation> {
    const { data, error } = await supabase
      .from("saved_locations")
      .update({ favorite, updated_at: new Date().toISOString() })
      .eq("id", locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Weather Searches
  async getWeatherSearches(limit: number = 20): Promise<WeatherSearch[]> {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("weather_searches")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error getting weather searches:", error);
      return [];
    }
    return data || [];
  },

  async saveWeatherSearch(
    search: Omit<WeatherSearch, "id" | "device_id" | "created_at">
  ): Promise<WeatherSearch> {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("weather_searches")
      .insert({
        device_id: deviceId,
        ...search,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clearWeatherSearches(): Promise<void> {
    const deviceId = getDeviceId();
    const { error } = await supabase
      .from("weather_searches")
      .delete()
      .eq("device_id", deviceId);

    if (error) throw error;
  },
};
