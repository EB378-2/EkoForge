"use client";

import React from "react";

const WeatherPage: React.FC = () => {

  return (
    <div className="fixed top-0 left-0 h-screen w-screen overflow-hidden m-0 p-0 border-none">
      <iframe 
        src="https://ilmailusaa.fi" 
        style={{
          position: "absolute",
          bottom: "10vh",
          height: "90vh",
          width: "100vw",
          border: "none",
          margin: 0,
          padding: 0,
          display: "block",
          background: "white",
        }}
        allowFullScreen
        title="Flyk Aviation Map"
        className="transition-all duration-300" // Smooth transitions
      />
    </div>
  );
};

export default WeatherPage;