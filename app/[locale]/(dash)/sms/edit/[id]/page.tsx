"use client";

import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Stack,
  Button,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Warning, Edit } from "@mui/icons-material";
import { useShow, useNavigation, useUpdate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { ProfileName } from "@components/functions/FetchFunctions";
import React, { useState, useEffect } from "react";
import {
  CreateSafetyReport,
  SeverityLevel,
  ReportCategory,
} from "@/types"; // Adjust the import path as necessary
import { useTranslations } from "next-intl";

const ReportEditPage = () => {
  const t = useTranslations("SafetyReports");
  const { id } = useParams();
  const { edit, goBack } = useNavigation();
  const { mutate: updateReport } = useUpdate();
  const [resolvedDate, setResolvedDate] = useState<string | null>(null);

  const {
    saveButtonProps,
    refineCore: { queryResult },
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    refineCoreProps: {
      resource: "sms",
      id: id as string,
      action: "edit",
      queryOptions: {
        enabled: !!id,
      },
    },
  });

  const report = queryResult?.data?.data;
  const currentStatus = watch("status");
  const currentSeverity = watch("severity");


  const getSeverityIcon = (severity: string) => {
    const colorMap = {
      low: "#4caf50",
      medium: "#ff9800",
      high: "#f44336",
      critical: "#d32f2f",
    };

    return (
      <Avatar
        sx={{
          bgcolor: colorMap[severity as keyof typeof colorMap] || "#9e9e9e",
          width: 48,
          height: 48,
        }}
      >
        <Warning fontSize="medium" />
      </Avatar>
    );
  };

  useEffect(() => {
    if (currentStatus === "resolved" && !resolvedDate) {
      const now = new Date().toISOString();
      setValue("resolved_at", now);
      setResolvedDate(now);
    } else if (currentStatus !== "resolved" && resolvedDate) {
      setValue("resolved_at", null);
      setResolvedDate(null);
    }
  }, [currentStatus, setValue, resolvedDate]);

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    saveButtonProps.onClick(e);
    goBack();
  };

  if (!report) {
    return <Typography>{t("Loading report")}</Typography>;
  }




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
  
    const severityOptions: SeverityLevel[] = ["low", "medium", "high", "critical"];
  

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: "0 auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          {t("Edit.title")}
        </Typography>
      </Stack>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column - Report Details */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                {getSeverityIcon(currentSeverity || report.severity)}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("Show.ReportedBy")}
                </Typography>
                <Typography variant="body1" mb={2}>
                  <ProfileName profileId={report.reported_by} />
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("Show.ReportedAt")}
                </Typography>
                <Typography variant="body1" mb={2}>
                  {format(new Date(report.reported_at), "MMM dd, yyyy HH:mm")}
                </Typography>
              </Box>

              {resolvedDate && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("Show.ResolvedAt")}
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    {format(new Date(resolvedDate), "MMM dd, yyyy HH:mm")}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("Edit.LastUpdated")}
                </Typography>
                <Typography variant="body1">
                  {format(new Date(report.updated_at), "MMM dd, yyyy HH:mm")}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Right Column - Editable Fields */}
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t("Create.ReportTitle")}
                    {...register("title", { required: "Title is required" })}
                    defaultValue={report.title}
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
                    defaultValue={report.description}
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
                      defaultValue={t(report.category)}
                      render={({ field }) => (
                        <Select {...field} label={t("Create.Category")}>
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {t(category)}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t("Create.SeverityLevel")}</InputLabel>
                    <Controller
                      name="severity"
                      control={control}
                      defaultValue={t(report.severity)}
                      render={({ field }) => (
                        <Select {...field} label={t("Create.SeverityLevel")}>
                          {severityOptions.map((level) => (
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
                    defaultValue={report.location}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" onClick={goBack}>
                      {t("Edit.Cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ minWidth: 120 }}
                    >
                      {t("Edit.Save Changes")}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReportEditPage;