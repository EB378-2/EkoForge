"use client";

import React from "react";
import { RefineThemedLayoutV2HeaderProps } from "@refinedev/mui";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@hooks/useTheme";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface NavbarProps extends RefineThemedLayoutV2HeaderProps {
  children?: React.ReactNode;
  locale?: string;
}

const LanguageSwitcher: React.FC<NavbarProps> = ({ locale }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || locale || "en";

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLocale = event.target.value;
    if (newLocale === currentLocale) return;
    const path = pathname.split("/").slice(2).join("/");
    router.push(`/${newLocale}/${path}`);
  };

  // Animation variants
  const hoverAnimation = {
    scale: 1.05,
    boxShadow: `0 4px 12px ${theme.palette.primary.light}30`,
    transition: { duration: 0.3 }
  };

  return (
    <Box
      component={motion.div}
      whileHover={hoverAnimation}
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "50px",
        bgcolor: theme.palette.mode === "dark" 
          ? "rgba(255,255,255,0.1)" 
          : "rgba(0,0,0,0.05)",
        p: 0.5,
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s ease",
      }}
    >
      <Select
        value={currentLocale}
        onChange={handleLanguageChange}
        variant="standard"
        disableUnderline
        sx={{
          minWidth: 80,
          color: theme.palette.text.primary,
          fontWeight: 500,
          "& .MuiSelect-select": {
            py: 1,
            px: 2,
            display: "flex",
            alignItems: "center",
          },
          "& .MuiSelect-icon": {
            color: theme.palette.text.secondary,
            right: 8,
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: `0 8px 24px ${theme.palette.mode === "dark" 
                ? "rgba(0,0,0,0.3)" 
                : "rgba(0,0,0,0.1)"}`,
              "& .MuiMenuItem-root": {
                px: 2,
                py: 1.5,
                "&.Mui-selected": {
                  bgcolor: theme.palette.primary.light + "20",
                },
              },
            },
          },
        }}
      >
        <MenuItem value="en">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">🇬🇧</Typography>
            <Typography variant="body2">EN</Typography>
            <Typography variant="body2"></Typography>
          </Box>
        </MenuItem>
        <MenuItem value="fi">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">🇫🇮</Typography>
            <Typography variant="body2">FI</Typography>
            <Typography variant="body2"></Typography>
          </Box>
        </MenuItem>
      </Select>
    </Box>
  );
};

export default LanguageSwitcher;