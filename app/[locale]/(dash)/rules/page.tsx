"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Box, Container, Typography, Button, List, ListItem } from "@mui/material";
import { useTheme } from "@hooks/useTheme";

const AssociationRulesPage: React.FC = () => {
  const t = useTranslations("AssociationRules");
  const theme = useTheme();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}>
        {t("title")}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}>
        {t("effectiveDate")}
      </Typography>

      <Box component={motion.div} initial="hidden" whileInView="visible" variants={fadeInUp}>
        {/* Section 1: Name and Domicile */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section1.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section1.content")}
        </Typography>

        {/* Section 2: Purpose and Activities */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section2.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section2.p1")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section2.p2")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section2.p3")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section2.p4")}
        </Typography>

        {/* Section 3: Members */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section3.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section3.content")}
        </Typography>

        {/* Section 4: Membership Termination */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section4.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section4.p1")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section4.p2")}
        </Typography>

        {/* Section 5: Fees */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section5.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section5.content")}
        </Typography>

        {/* Section 6: Operations Manual */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section6.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section6.content")}
        </Typography>

        {/* Section 7: Board */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section7.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section7.p1")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section7.p2")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section7.p3")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section7.p4")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section7.p5")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section7.p6")}
        </Typography>

        {/* Section 8: Signing Authority */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section8.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section8.content")}
        </Typography>

        {/* Section 9: Fiscal Year */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section9.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section9.content")}
        </Typography>

        {/* Section 10: Meetings */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section10.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section10.p1")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section10.p2")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section10.p3")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section10.p4")}
        </Typography>

        {/* Section 11: Meeting Notices */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section11.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section11.p1")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section11.p2")}
        </Typography>

        {/* Section 12: Regular Meetings */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section12.title")}
        </Typography>
        
        <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3, mb: 2 }}>
          {t("section12.springMeeting.title")}
        </Typography>
        <List sx={{ listStyleType: 'disc', pl: 3, mb: 3 }}>
          {[...Array(7)].map((_, i) => (
            <ListItem key={i} sx={{ display: 'list-item', pl: 1 }}>
              <Typography variant="body1">
                {t(`section12.springMeeting.item${i + 1}`)}
              </Typography>
            </ListItem>
          ))}
        </List>
        
        <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3, mb: 2 }}>
          {t("section12.autumnMeeting.title")}
        </Typography>
        <List sx={{ listStyleType: 'disc', pl: 3, mb: 3 }}>
          {[...Array(9)].map((_, i) => (
            <ListItem key={i} sx={{ display: 'list-item', pl: 1 }}>
              <Typography variant="body1">
                {t(`section12.autumnMeeting.item${i + 1}`)}
              </Typography>
            </ListItem>
          ))}
        </List>
        
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section12.footer")}
        </Typography>

        {/* Section 13: Amendments and Dissolution */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
          {t("section13.title")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section13.p1")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section13.p2")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {t("section13.p3")}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t("section13.p4")}
        </Typography>
      </Box>
    </Container>
  );
};

export default AssociationRulesPage;