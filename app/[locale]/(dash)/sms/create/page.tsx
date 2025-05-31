"use client";

import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Avatar,
  Grid,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import { useCreate, useNavigation } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { useGetIdentity } from "@refinedev/core";
import React, { useState } from "react";
import { CreateSafetyReport, SeverityLevel, ReportCategory } from "@/types"; // Adjust the import path as necessary
import { useTranslations } from "next-intl";

const ReportCreatePage = () => {
  const t = useTranslations("SafetyReports");
  interface Identity {
    id?: string | number;
    [key: string]: any;
  }
  const { data: identity = {} as Identity } = useGetIdentity<Identity>();
  const { goBack } = useNavigation();
  const [severity, setSeverity] = useState<SeverityLevel>("medium");

  const {
    saveButtonProps,
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSafetyReport>({
    refineCoreProps: {
      resource: "sms",
      action: "create",
    },
    defaultValues: {
      status: "open",
      reported_by: identity?.id,
      severity: "medium",
    },
  });

  const severityColors = {
    low: "#4caf50",
    medium: "#ff9800",
    high: "#f44336",
    critical: "#d32f2f",
  };

  const categories: ReportCategory[] = [
    'inflight', 
    'infrastructure', 
    'aircraft', 
    'medical', 
    'security', 
    'enviromental', 
    'communication', 
    'other'
  ];

  const severities: SeverityLevel[] = ["low", "medium", "high", "critical"];

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: "0 auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          {t("Create.title")}
        </Typography>
      </Stack>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={saveButtonProps.onClick}>
          <Grid container spacing={3}>
            {/* Left Column - Severity Indicator */}
            <Grid item xs={12} md={3}>
              <Stack alignItems="center" justifyContent="center" height="100%">
                <Avatar
                  sx={{
                    bgcolor: severityColors[severity] || "#9e9e9e",
                    width: 120,
                    height: 120,
                    mb: 2,
                  }}
                >
                  <Warning sx={{ fontSize: 60 }} />
                </Avatar>
                <Chip
                  label={t(severity).toUpperCase()}
                  sx={{
                    bgcolor: severityColors[severity],
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    px: 3,
                    py: 1,
                  }}
                />
              </Stack>
            </Grid>

            {/* Right Column - Form Fields */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t("Create.ReportTitle")}
                    {...register("title", {
                      required: "Title is required",
                      minLength: {
                        value: 10,
                        message: "Title must be at least 10 characters",
                      },
                    })}
                    error={!!errors.title}
                    helperText={errors.title?.message?.toString()}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t("Create.Description")}
                    multiline
                    minRows={4}
                    {...register("description", {
                      required: "Description is required",
                    })}
                    error={!!errors.description}
                    helperText={errors.description?.message?.toString()}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t("Create.Category")}</InputLabel>
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label={t("Create.Category")}
                          error={!!errors.category}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {t(category)}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <Typography color="error" variant="caption">
                        {errors.category.message?.toString()}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t("Create.SeverityLevel")}</InputLabel>
                    <Controller
                      name="severity"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label={t("Create.SeverityLevel")}
                          onChange={(e) => {
                            field.onChange(e);
                            setSeverity(e.target.value as SeverityLevel);
                          }}
                        >
                          {severities.map((level) => (
                            <MenuItem key={level} value={level}>
                              {t(level).charAt(0).toUpperCase() + level.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t("Create.Location")}
                    {...register("location")}
                    placeholder="RWY, CUMULUS, etc."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" onClick={goBack}>
                      {t("Create.Cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ minWidth: 120 }}
                    >
                      {t("Create.SubmitReport")}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ReportCreatePage;