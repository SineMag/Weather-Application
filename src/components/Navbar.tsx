import React from "react";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { TiHomeOutline } from "react-icons/ti";
import { FaLocationDot } from "react-icons/fa6";
import { CiMap } from "react-icons/ci";
import { GrNotes } from "react-icons/gr";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";

export default function Navbar() {
  return (
    <div className="navSection">
      <div className="logo">
        <TiWeatherPartlySunny size={58} />
        <h3>Weather</h3>
      </div>
      <div className="midNav">
        <TiHomeOutline size={58} />
        <FaLocationDot size={58} />
        <CiMap size={58} />
        <GrNotes size={58} />
      </div>
      <div className="bottomNav">
        <FaUserAlt size={58} />
        <IoSettings size={58} />
      </div>
    </div>
  );
}
