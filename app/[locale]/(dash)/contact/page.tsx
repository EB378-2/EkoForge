"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Stack,
  Chip,
  useTheme,
} from "@mui/material";
import {
  MailOutline,
  PhoneIphone,
  LocationOn,
  Send,
  SupportAgent,
  Schedule,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const theme = useTheme();

  // Contact information data
  const contactInfo = [
    {
      id: "email",
      icon: <MailOutline sx={{ fontSize: 40 }} />,
      title: t("emailTitle"),
      value: "info@efnu.fi",
      color: "#4facfe",
    },
    {
      id: "phone",
      icon: <PhoneIphone sx={{ fontSize: 40 }} />,
      title: t("phoneTitle"),
      value: "+358503865368",
      color: "#43e97b",
    },
    {
      id: "address",
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      title: t("addressTitle"),
      value: "Lentokentäntie 5, 03100, Nummela",
      color: "#ff6b6b",
    },
  ];

  const supportHours = [
    { day: t("weekdays"), time: "08:00 - 20:00 UTC" },
    { day: t("weekends"), time: "10:00 - 18:00 UTC" },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(45deg, #121212 30%, #1e1e1e 90%)"
            : "linear-gradient(45deg, #f5f7fa 30%, #e4e8f0 90%)",
        minHeight: "100vh",
      }}
    >
      {/* Main Grid Layout */}
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 2, md: 4 },
              position: "relative",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)"
                    : "linear-gradient(45deg, #1976d2 0%, #2196f3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "1px",
              }}
            >
              {t("title")}
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 700, mx: "auto", mb: 3 }}>
              {t("subtitle")}
            </Typography>
          </Box>
        </Grid>

        {/* Contact Information Cards */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
              background:
                theme.palette.mode === "dark"
                  ? "rgba(30, 30, 40, 0.7)"
                  : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              p: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center" }}
              >
                <SupportAgent sx={{ mr: 1.5, fontSize: "1.6rem" }} />
                {t("contactInfo")}
              </Typography>

              <Stack spacing={3}>
                {contactInfo.map((info) => (
                  <Box
                    key={info.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderRadius: "12px",
                      background:
                        theme.palette.mode === "dark"
                          ? "rgba(50, 50, 60, 0.4)"
                          : "rgba(245, 248, 250, 0.6)",
                      boxShadow: theme.shadows[1],
                    }}
                  >
                    <Box
                      sx={{
                        mr: 2,
                        color: info.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background:
                          theme.palette.mode === "dark"
                            ? "rgba(25, 25, 35, 0.7)"
                            : "rgba(240, 245, 250, 0.8)",
                      }}
                    >
                      {info.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {info.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color:
                            theme.palette.mode === "dark"
                              ? "text.secondary"
                              : "text.primary",
                        }}
                      >
                        {info.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* Support Hours */}
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center" }}
                >
                  <Schedule sx={{ mr: 1.5, fontSize: "1.6rem" }} />
                  {t("supportHours")}
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(50, 50, 60, 0.4)"
                        : "rgba(245, 248, 250, 0.6)",
                    boxShadow: theme.shadows[1],
                  }}
                >
                  {supportHours.map((hours, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom:
                          index < supportHours.length - 1
                            ? `1px solid ${
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.1)"
                              }`
                            : "none",
                      }}
                    >
                      <Typography sx={{ fontWeight: 500 }}>{hours.day}</Typography>
                      <Typography>{hours.time}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
              background:
                theme.palette.mode === "dark"
                  ? "rgba(30, 30, 40, 0.7)"
                  : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              p: 3,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center" }}
              >
                <Send sx={{ mr: 1.5, fontSize: "1.6rem" }} />
                {t("sendMessage")}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t("nameLabel")}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t("emailLabel")}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t("subjectLabel")}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t("messageLabel")}
                    variant="outlined"
                    multiline
                    rows={6}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<Send />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: "12px",
                      fontWeight: 600,
                      background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 20px rgba(79, 172, 254, 0.5)",
                      },
                    }}
                  >
                    {t("sendButton")}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* FAQ Section */}
        <Grid item xs={12}>
          <Card
            sx={{
              mt: 3,
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
              background:
                theme.palette.mode === "dark"
                  ? "rgba(30, 30, 40, 0.7)"
                  : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              p: 3,
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                {t("faqTitle")}
              </Typography>

              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={12} md={6} key={item}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: "12px",
                        background:
                          theme.palette.mode === "dark"
                            ? "rgba(50, 50, 60, 0.4)"
                            : "rgba(245, 248, 250, 0.6)",
                        boxShadow: theme.shadows[1],
                        height: "100%",
                      }}
                    >
                      <Chip
                        label={`${t("question")} ${item}`}
                        sx={{
                          mb: 2,
                          background: "linear-gradient(45deg, #ff6b6b 0%, #ff8e53 100%)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {t(`question${item}Title`)}
                      </Typography>
                      <Typography variant="body1">
                        {t(`question${item}Answer`)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}