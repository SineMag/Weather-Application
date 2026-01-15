import { createClient } from "@supabase/supabase-js";

// These environment variables need to be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface UserPreferences {
  id: string;
  user_id: string;
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
  user_id: string;
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
  user_id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  weather_data: any;
  created_at: string;
}

// Helper functions for database operations
export const supabaseHelpers = {
  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Saved Locations
  async getSavedLocations(userId: string): Promise<SavedLocation[]> {
    const { data, error } = await supabase
      .from("saved_locations")
      .select("*")
      .eq("user_id", userId)
      .order("favorite", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async saveLocation(
    userId: string,
    location: Omit<
      SavedLocation,
      "id" | "user_id" | "created_at" | "updated_at"
    >
  ): Promise<SavedLocation> {
    const { data, error } = await supabase
      .from("saved_locations")
      .insert({
        user_id: userId,
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
  async getWeatherSearches(
    userId: string,
    limit: number = 20
  ): Promise<WeatherSearch[]> {
    const { data, error } = await supabase
      .from("weather_searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async saveWeatherSearch(
    userId: string,
    search: Omit<WeatherSearch, "id" | "user_id" | "created_at">
  ): Promise<WeatherSearch> {
    const { data, error } = await supabase
      .from("weather_searches")
      .insert({
        user_id: userId,
        ...search,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clearWeatherSearches(userId: string): Promise<void> {
    const { error } = await supabase
      .from("weather_searches")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  },
};
