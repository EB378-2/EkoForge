"use client";

import { Box, Grid, Typography, Paper, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";

const WebCamPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("WebCam");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    const timer = setTimeout(() => setLoading(false), 1500);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const webcams = [
    {
      url: "https://atis.efnu.fi/webcam/cam-efnu-wx1.jpg",
      label: t("Runway27"),
      description: t("ViewOfMainRunwayApproach")
    },
    {
      url: "https://atis.efnu.fi/webcam/cam-efnu-wx2.jpg",
      label: t("RunwayIntersection"),
      description: t("TaxiwayAndRunwayIntersection")
    },
    {
      url: "https://atis.efnu.fi/webcam/cam-efnu-wx3.jpg",
      label: t("GliderRunway22"),
      description: t("GliderOperationsArea")
    }
  ];

  return (
    <Box sx={{
      p: { xs: 2, md: 4 },
      maxWidth: "1800px",
      margin: "0 auto"
    }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        fontWeight: 600,
        mb: 4,
        color: "text.primary"
      }}>
        {t("EFNUWebcams")}
      </Typography>
      
      <Typography variant="body1" paragraph sx={{ mb: 4, color: "text.secondary" }}>
        {t("Description")}
      </Typography>

      <Grid container spacing={4}>
        {webcams.map((webcam, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper elevation={3} sx={{
              borderRadius: '12px',
              boxShadow: '0 0 40px -10px rgba(34, 211, 238, 0.5)',
              overflow: "hidden",
              transition: "transform 0.3s ease-in-out",
              '&:hover': {
                transform: "translateY(-4px)"
              }
            }}>
              <Box sx={{
                position: "relative",
                width: "100%",
                height: 0,
                paddingTop: "56.25%", // 16:9 aspect ratio
                backgroundColor: "grey.200"
              }}>
                {loading ? (
                  <Skeleton 
                    variant="rectangular" 
                    width="100%" 
                    height="100%" 
                    sx={{ position: "absolute", top: 0, left: 0 }}
                  />
                ) : (
                  <NextImage
                    src={webcam.url}
                    alt={webcam.label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      objectFit: "cover"
                    }}
                  />
                )}
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {webcam.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {webcam.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ 
                  mt: 1,
                  color: "text.disabled",
                  fontStyle: "italic"
                }}>
                  {t("LastUpdated")}: {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WebCamPage;