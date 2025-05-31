"use client";

import React from "react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { Box, Container, Typography, Button } from "@mui/material";
import { useTheme } from "@hooks/useTheme";

const AboutBusinessPage: React.FC = () => {
  const t = useTranslations("AboutBusiness");
  const theme = useTheme()

  // Animation variants for Framer Motion.
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 1 } },
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}>
        {t("title")}
      </Typography>

      <Box component={motion.div} initial="hidden" whileInView="visible" variants={fadeInUp}>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("introParagraph1")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("introParagraph2")}
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("harshRealityTitle")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("harshRealityText")}
        </Typography>
        <Box component="ul" sx={{ ml: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("harshRealityListItem1")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("harshRealityListItem2")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("harshRealityListItem3")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("harshRealityListItem4")}
          </Typography>
          <Typography component="li" variant="body1">
            {t("harshRealityListItem5")}
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("benefitsTitle")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("benefitsIntro")}
        </Typography>
        <Box component="ul" sx={{ ml: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("benefitListItem1")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("benefitListItem2")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("benefitListItem3")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("benefitListItem4")}
          </Typography>
          <Typography component="li" variant="body1">
            {t("benefitListItem5")}
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("packageTitle")}
        </Typography>
        <Box component="ul" sx={{ ml: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("packageListItem1")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("packageListItem2")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("packageListItem3")}
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            {t("packageListItem4")}
          </Typography>
          <Typography component="li" variant="body1">
            {t("packageListItem5")}
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("finalCallTitle")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
          {t("finalCallText")}
        </Typography>

        <NextLink href={`https://calendly.com/ekoforge`} passHref>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                color: theme.palette.common.white,
                fontWeight: "bold",
                borderRadius: 50,
                boxShadow: 3,
                textTransform: "none",
              }}
            >
              {t("bookNow")}
            </Button>
          </motion.div>
        </NextLink>
      </Box>
    </Container>
  );
};

export default AboutBusinessPage;