"use client";

import { Box } from '@mui/material';
import { useTheme } from '@hooks/useTheme';
import React, { useEffect, useState, useContext } from 'react';
import Image from 'next/image';
import { ColorModeContext } from "@contexts/color-mode";
interface SplashScreenProps {
  loading?: boolean;
  delay?: number; // Optional delay before unmounting
}

const SplashScreen = ({ loading = true, delay = 500 }: SplashScreenProps) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(loading);
  const { mode } = useContext(ColorModeContext);

  useEffect(() => {
    if (!loading) {
      // Delay unmounting to allow the fade-out animation to complete
      const timer = setTimeout(() => setMounted(false), delay);
      return () => clearTimeout(timer);
    } else {
      setMounted(true);
    }
  }, [loading, delay]);

  if (!mounted) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        gap: 4,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300, // Ensure it's above everything
        transition: 'opacity 0.5s ease-out',
        opacity: loading ? 1 : 0,
        pointerEvents: loading ? 'auto' : 'none',
      }}
    >
      {/* Logo with animation */}
      <Box
        sx={{
          width: 200,
          height: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
          animation: loading ? 'fadeIn 1.2s ease-in-out' : 'none',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.9)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1.5)',
            },
          },
        }}
      >
        <Image 
          src={mode === 'light' ? "/Logolight.svg" : "/Logo.svg"}
          alt="Application Logo" 
          width={200}
          height={200}
          style={{ 
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(100, 108, 255, 0.3))'
          }} 
        />
      </Box>      
    </Box>
  );
};

export default SplashScreen;