import { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import "./App.css";
import Navbar from "./components/Navbar";
import MainSection from "./layout/MainSection";
import Searchbar from "./components/Searchbar";
import WeatherCard from "./components/WeatherCard";

type NavItem = "home" | "location" | "map" | "notes" | "profile" | "settings";

function App() {
  const [currentSection, setCurrentSection] = useState<NavItem>(() => {
    const stored = localStorage.getItem("activeSection");
    return (stored as NavItem) || "home";
  });

  useEffect(() => {
    localStorage.setItem("activeSection", currentSection);
  }, [currentSection]);

  const handleNavigation = (section: NavItem) => {
    setCurrentSection(section);
    console.log(`Navigated to: ${section}`);
    // Here you can add logic to show different content based on the selected section
  };

  const renderMainContent = () => {
    switch (currentSection) {
      case "home":
        return (
          <div className="home-content">
            <MainSection />
          </div>
        );
      case "location":
        return (
          <div className="location-content">
            <h2>Current Location Weather</h2>
            <p>
              Weather information for your current location will appear here.
            </p>
          </div>
        );
      case "map":
        return (
          <div className="map-content">
            <h2>Weather Map</h2>
            <p>Interactive weather map will be displayed here.</p>
          </div>
        );
      case "notes":
        return (
          <div className="notes-content">
            <h2>Weather Notes</h2>
            <p>Your weather observations and notes will be shown here.</p>
          </div>
        );
      case "profile":
        return (
          <div className="profile-content">
            <h2>User Profile</h2>
            <p>Manage your profile settings and preferences.</p>
          </div>
        );
      case "settings":
        return (
          <div className="settings-content">
            <h2>Settings</h2>
            <p>Configure your weather application settings.</p>
          </div>
        );
      default:
        return (
          <div className="home-content">
            <h2>Weather</h2>
            <p>Hello and Welcome</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="navbar">
          <Navbar activeItem={currentSection} onNavigate={handleNavigation} />
        </div>
        <main className="main-content">
          {/* top section with search and profile sections */}
          <div className="topNavBar">
            <div>
              {/* searchbar using city names ..search for weather */}
              <Searchbar />
            </div>
            <div
              className="topRightNav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "nowrap",
              }}
            >
              <div
                className="topRightItem"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                }}
              >
                <FaLocationDot size={20} />
              </div>
              <div
                className="topRightItem"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                }}
              >
                <FaUser size={20} />
              </div>
            </div>
          </div>

          {/* Dynamic content based on selected navigation */}
          <div className="content-area">{renderMainContent()}</div>

          {/* Original layout sections - can be shown conditionally */}
          {currentSection === "home" && (
            <>
              {/* card details according to each corresponding day */}
              <div className="details">
                <div className="cardDetails"></div>
                {/* chances of rain data insights */}
                <div className="chanceOfRain"></div>
              </div>
              <div className="mapAndCities">
                <div className="globalMap"></div>
                <div className="citiesNearby"></div>
              </div>
            </>
          )}
          <div>
            <WeatherCard />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
