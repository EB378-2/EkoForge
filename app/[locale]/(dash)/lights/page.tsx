"use client";

import { Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import React from "react";
import { useTranslations } from "next-intl";

const RWYLightsPage: React.FC = () => {
  const t = useTranslations("RunwayLights");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-screen w-full flex flex-col bg-gray-900 relative overflow-hidden"
    >
      {/* Header */}
      <Typography 
        variant="h4"
        component={motion.h1}
        sx={{
          p: 4,
          position: 'relative',
          top: 0,
          left: 0,
          background: 'linear-gradient(45deg, #00e5ff, #0066ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          zIndex: 10,
        }}
      >
        {t("Runway Lights Guide")}
      </Typography>

      {/* Main Content Container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Video Container */}
        <motion.div
          className="relative"
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            width: 'auto',
            height: 'auto',
            aspectRatio: '16/9',
          }}
          whileHover={{ scale: 1.02 }}

        >

          {/* Video Element */}
          <video
            controls
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 0 40px -10px rgba(34, 211, 238, 0.5)',
            }}
            title="Runway Lights Guide"
          >
            <source
              src="https://efnu.fi/wp-content/uploads/efnu-lights-guide-2023-10-11.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default RWYLightsPage;