"use client";

import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Chip, 
  Avatar, 
  Stack, 
  Pagination, 
  TextField,
  InputAdornment,
  Skeleton,
  Select,
  MenuItem
} from "@mui/material";
import { Search, Warning, CheckCircle, Assignment } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useTable, LogicalFilter, useGetIdentity } from "@refinedev/core";
import { CreateButton } from "@refinedev/mui";
import { ProfileName } from "@components/functions/FetchFunctions";
import { SafetyReport } from "@/types"; // Adjust the import path as necessary
import { useTranslations } from "next-intl";

const ReportListPage = () => {
  const t = useTranslations("SafetyReports");
  interface Identity {
    id?: string | number;
    [key: string]: any;
  }
  const { data: identity = {} as Identity } = useGetIdentity<Identity>();
  const [filter, setFilter] = useState({
    search: "",
    status: "all",
    category: "all"
  });

  const {
    tableQueryResult,
    current,
    setCurrent,
    pageCount,
    setFilters,
  } = useTable<SafetyReport>({
    resource: "sms",
    filters: {
      initial: [
        {
          field: "reported_by",
          operator: "eq",
          value: identity?.id, // Replace with actual user ID or logic to get current user
        }
      ]
    },
  });

  useEffect(() => {
    const filters: LogicalFilter[] = [];
    
    if (filter.search) {
      filters.push({
        field: "title",
        operator: "contains",
        value: filter.search,
      });
    }
    
    if (filter.status !== "all") {
      filters.push({
        field: "status",
        operator: "eq",
        value: filter.status,
      });
    }
    
    if (filter.category !== "all") {
      filters.push({
        field: "category",
        operator: "eq",
        value: filter.category,
      });
    }
    
    setFilters(filters);
  }, [filter]);

  const reports = tableQueryResult?.data?.data || [];
  const loading = tableQueryResult?.isLoading;

  // Returns an icon based on the severity level
  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "high":
        return <Warning color="error" fontSize="large" />;
      case "medium":
        return <Warning color="warning" fontSize="large" />;
      case "low":
        return <Warning color="info" fontSize="large" />;
      default:
        return <Warning color="disabled" fontSize="large" />;
    }
  }

  // Returns the color for the status chip
  function getStatusColor(status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
    switch (status) {
      case "open":
        return "warning";
      case "in-progress":
        return "info";
      case "resolved":
        return "success";
      default:
        return "default";
    }
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 },
      maxWidth: 1600,
      margin: '0 auto'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Assignment fontSize="large" />
          {t("SafetyReports")}
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          {t("Active safety reports and incident tracking")}
        </Typography>
        <CreateButton 
          resource="sms"
        />
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ 
        mb: 4,
        p: 2,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <TextField
          placeholder={t("Search reports")}
          variant="outlined"
          size="small"
          value={filter.search}
          onChange={(e) => setFilter({...filter, search: e.target.value})}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />

        <Select
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">{t("allStatuses")}</MenuItem>
          <MenuItem value="open">{t("open")}</MenuItem>
          <MenuItem value="in-progress">{t("in-progress")}</MenuItem>
          <MenuItem value="resolved">{t("resolved")}</MenuItem>
        </Select>

        <Select
          value={filter.category}
          onChange={(e) => setFilter({...filter, category: e.target.value})}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">{t("All Categories")}</MenuItem>
          <MenuItem value="inflight">{t("inflight")}</MenuItem>
          <MenuItem value="infrastructure">{t("infrastructure")}</MenuItem>
          <MenuItem value="aircraft">{t("aircraft")}</MenuItem>
          <MenuItem value="medical">{t("medical")}</MenuItem>
          <MenuItem value="security">{t("security")}</MenuItem>
          <MenuItem value="enviromental">{t("enviromental")}</MenuItem>
          <MenuItem value="communication">{t("communication")}</MenuItem>
          <MenuItem value="other">{t("other")}</MenuItem>
        </Select>
      </Paper>

      {/* Report List */}
      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))
        ) : (
          reports.map((report) => (
            <Grid item xs={12} md={6} lg={4} key={report.id}>
              <NextLink href={`/sms/show/${report.id}`} passHref>
                <Paper component="a" sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'block',
                  textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {getSeverityIcon(report.severity)}
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {report.title}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Chip 
                          label={t(report.status.replace('-', ' '))}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {t(report.category)}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {t("Reported by")} <ProfileName profileId={report.reported_by} />
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(report.reported_at))} {t("ago")}
                        </Typography>
                      </Stack>
                    </Box>

                    {report.status === 'resolved' && (
                      <CheckCircle color="success" />
                    )}
                  </Stack>
                </Paper>
              </NextLink>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination 
          count={pageCount} 
          page={current} 
          onChange={(_, page) => setCurrent(page)}
          color="primary" 
          shape="rounded"
          sx={{ '& .MuiPaginationItem-root': { borderRadius: 2 } }}
        />
      </Box>
    </Box>
  );
};

export default ReportListPage;