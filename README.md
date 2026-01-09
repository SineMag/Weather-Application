# Weather Services

A modern, feature-rich weather application built with React, TypeScript, and Vite. View your current location weather, search for specific locations, manage saved locations, and receive weather notifications.

## Features

- 🌍 **Current Location Weather**: Automatically detect and display weather for your current location (requires location permission)
- 🔍 **Location Search**: Search for weather in any city worldwide
- 📍 **Location Management**: Save, edit, and delete previously searched locations
- 🌙 **Theme Toggle**: Switch between light and dark themes
- 🔔 **Weather Notifications**: Receive alerts for severe weather conditions
- 📴 **Offline Support**: Access previously viewed weather data when offline

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Weather-Application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   Or if you're using yarn:
   ```bash
   yarn install
   ```

## Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   ```

   Or with yarn:

   ```bash
   yarn dev
   ```

2. **Open your browser**

   - The application will typically be available at `http://localhost:5173`
   - Check the terminal output for the exact URL

3. **Grant location permission**
   - When prompted, allow location access to view weather for your current location
   - If denied, you can still search for specific cities

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

## Usage

### Viewing Current Location Weather

1. On first load, the app will request location permission
2. If granted, your current location's weather will be displayed automatically
3. You can refresh the page to update the weather data

### Searching for a Location

1. Type a city name in the search bar at the top
2. Click "Search" or press Enter
3. The weather forecast for that location will be displayed

### Managing Saved Locations

1. **View Previous Searches**: Navigate to "Weather Notes" in the sidebar
2. **Save Current Location**: Click the save button when viewing current location
3. **Edit Location**: Click on any saved location to edit its name (coming soon)
4. **Delete Location**: Click the delete button next to any saved location
5. **Mark as Favorite**: Click the star icon to favorite/unfavorite a location

### Theme Toggle

1. Navigate to "Settings" in the sidebar
2. Toggle the "Theme" switch to switch between light and dark modes
3. Your preference is saved automatically

### Notifications

1. Navigate to "Settings" in the sidebar
2. Toggle the "Notifications" switch
3. Grant notification permission when prompted
4. You'll receive alerts for severe weather conditions

### Offline Support

1. Navigate to "Settings" in the sidebar
2. Toggle the "Offline Access" switch
3. Weather data you view while online will be cached
4. You can access cached data when offline

## Technology Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Icons**: Icon library
- **Open-Meteo API**: Weather data provider
- **Service Workers**: Offline support

## API Information

This application uses the [Open-Meteo API](https://open-meteo.com/) which provides:

- Free weather forecast data
- No API key required
- Global coverage
- Real-time weather updates

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Note: Location services and notifications require HTTPS or localhost.

## Troubleshooting

### Location not working

- Ensure you've granted location permission in your browser settings
- Make sure you're using HTTPS or localhost (required for geolocation API)

### Notifications not working

- Check that notifications are enabled in Settings
- Ensure notification permission is granted in browser settings
- Some browsers block notifications on HTTP (HTTPS required)

### Offline mode not working

- Ensure "Offline Access" is enabled in Settings
- Make sure you've viewed weather data while online first
- Service workers require HTTPS or localhost

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## LicenseThis project is open source and available under the MIT License.
