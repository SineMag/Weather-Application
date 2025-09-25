import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <div>
        <div className="navbar">
          <Navbar />
        </div>
        <main>
          {/* top section with search and profile sections */}
          <div className="topNavBar">
            <div className="search"></div>
            <div className="topRightNav"></div>
          </div>

          {/* cards section for the weather layout */}

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
        </main>
      </div>
    </>
  );
}

export default App;
