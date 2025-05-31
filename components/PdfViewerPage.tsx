"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 

} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from "@hooks/useTheme";

const PdfViewerPage = () => {
  const t = useTranslations("PdfViewer");
  const theme = useTheme();


  // PDF file path - could also come from props or context
  const pdfPath = "https://efnu.fi/wp-content/uploads/EFNU_toimintakasikirja.pdf";


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Title Section */}
      <Box sx={{ 
        textAlign: "center", 
        mb: 4,
        position: "relative"
      }}>
        <Typography variant="h3" sx={{ 
          fontWeight: "bold", 
          mb: 2,
          background: theme.palette.mode === "dark" 
            ? "linear-gradient(45deg, #4facfe, #00f2fe)" 
            : "linear-gradient(45deg, #1976d2, #2196f3)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          {t("title")}
        </Typography>
        
        <Typography variant="subtitle1" sx={{ 
          mb: 3, 
          color: "text.secondary",
          maxWidth: 600,
          mx: "auto"
        }}>
          {t("description")}
        </Typography>
        
        {/* Download Button */}
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          href={pdfPath}
          download
          sx={{
            px: 4,
            py: 1.5,
            background: theme.palette.mode === "dark" 
              ? "linear-gradient(45deg, #43e97b, #38f9d7)" 
              : "linear-gradient(45deg, #2e7d32, #4caf50)",
            color: "white",
            fontWeight: "bold",
            borderRadius: 50,
            boxShadow: 3,
            textTransform: "none",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 6
            }
          }}
        >
          {t("OpenButton")}
        </Button>
      </Box>
    </Container>
  );
};

export default PdfViewerPage;