-- Simplified Database Schema for Weather App (No Authentication Required)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Preferences Table (using device_id instead of user_id)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  unit TEXT DEFAULT 'metric' CHECK (unit IN ('metric', 'imperial')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN DEFAULT false,
  offline_access_enabled BOOLEAN DEFAULT false,
  default_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Locations Table
CREATE TABLE IF NOT EXISTS saved_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  favorite BOOLEAN DEFAULT false,
  weather_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather Searches Table
CREATE TABLE IF NOT EXISTS weather_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  weather_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_locations_device_id ON saved_locations(device_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_favorite ON saved_locations(favorite);
CREATE INDEX IF NOT EXISTS idx_weather_searches_device_id ON weather_searches(device_id);
CREATE INDEX IF NOT EXISTS idx_weather_searches_created_at ON weather_searches(created_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_locations_updated_at BEFORE UPDATE ON saved_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- No Row Level Security needed since we're using device_id
-- Data is separated by device_id instead of user authentication
