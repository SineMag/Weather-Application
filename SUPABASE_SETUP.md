# Supabase Integration Setup

This document explains how to set up Supabase for the Weather Application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization or create a new one
4. Enter project details:
   - **Project Name**: Weather Application (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

### 2. Get Your Project Credentials

1. In your Supabase project dashboard, go to **Project Settings** (click the gear icon)
2. Navigate to the **API** section
3. You'll find:
   - **Project URL**: Your Supabase project URL
   - **anon public**: Your anonymous/public API key

### 3. Set Up Environment Variables

1. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=your_actual_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   ```

### 4. Set Up Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` from this repository
4. Paste it into the SQL editor
5. Click "Run" to execute the schema creation

### 5. Enable Authentication

1. In your Supabase project dashboard, go to **Authentication** > **Settings**
2. Ensure "Enable email confirmations" is set to your preference
3. Configure your site URL and redirect URLs:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173` and `http://localhost:5173/**`
4. Save your changes

## Features Enabled by Supabase

### 1. User Authentication

- Sign up / Sign in with email and password
- Password reset functionality
- Session management
- Protected routes

### 2. Data Persistence

- **User Preferences**: Store unit preferences, theme, notification settings
- **Saved Locations**: Save favorite weather locations
- **Search History**: Keep track of weather searches across devices

### 3. Real-time Updates

- Live weather data synchronization
- Cross-device data sync
- Offline data caching

### 4. Security

- Row Level Security (RLS) policies
- Users can only access their own data
- Secure API endpoints

## Usage in the Application

### Authentication Hook

```typescript
import { useAuth } from "./hooks/useAuth";

const { user, signIn, signUp, signOut } = useAuth();
```

### Database Operations

```typescript
import { supabaseHelpers } from "./lib/supabase";

// Save user preferences
await supabaseHelpers.updateUserPreferences(user.id, {
  unit: "metric",
  theme: "dark",
});

// Get saved locations
const locations = await supabaseHelpers.getSavedLocations(user.id);
```

## Development Notes

- The app uses localStorage as a fallback when Supabase is not configured
- All Supabase operations are wrapped in try-catch blocks for graceful error handling
- The authentication state is automatically managed by the `AuthProvider` component

## Production Deployment

When deploying to production:

1. Update your environment variables with production Supabase URLs
2. Add your production domain to the Supabase redirect URLs
3. Enable additional security features like email confirmations
4. Consider setting up custom auth providers if needed

## Troubleshooting

### Common Issues

1. **"Invalid URL" error**: Check that your Supabase URL is correct in the `.env` file
2. **"Invalid API key" error**: Verify your anon key is copied correctly
3. **Authentication not working**: Ensure your redirect URLs are configured correctly
4. **Database errors**: Make sure you've run the SQL schema setup

### Getting Help

- Check the Supabase documentation at https://supabase.com/docs
- Review the browser console for detailed error messages
- Ensure your environment variables are properly loaded
