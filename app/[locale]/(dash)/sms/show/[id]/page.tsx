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
  Grid
} from "@mui/material";
import { Warning, Edit } from "@mui/icons-material";
import { useShow, useNavigation } from "@refinedev/core";
import { useOne } from "@refinedev/core";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { ProfileName } from "@components/functions/FetchFunctions";
import React from "react";
import { useTranslations } from "next-intl";

const ReportShowPage = () => {
  const t = useTranslations("SafetyReports");
  const { id } = useParams();
  const { queryResult } = useShow({
    resource: "sms",
    id: id as string,
    queryOptions: {
      enabled: !!id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });
  const { data, isLoading } = queryResult;
  const report = data?.data;
  const { edit } = useNavigation();


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in-progress': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const colorMap = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#d32f2f'
    };
    
    return (
      <Avatar sx={{ 
        bgcolor: colorMap[severity as keyof typeof colorMap] || '#9e9e9e',
        width: 48,
        height: 48
      }}>
        <Warning fontSize="medium" />
      </Avatar>
    );
  };



  if (isLoading) {
    return <Typography>{t("Loading report")}</Typography>;
  }

  if (!report) {
    return <Typography>{t("Report not found")}</Typography>;
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          {t("Show.title")}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Edit />}
          onClick={() => report.id !== undefined && edit("sms", report.id)}
        >
          {t("Show.EditReport")}
        </Button>
      </Stack>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Stack direction="row" spacing={3} alignItems="flex-start">
          {getSeverityIcon(report.severity)}
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={600} mb={2}>
              {report.title}
            </Typography>
            
            <Stack direction="row" spacing={2} mb={2}>
              <Chip 
                label={t(report.status).replace('-', ' ')}
                color={getStatusColor(report.status)}
              />
              <Chip 
                label={t(report.category)}
                variant="outlined"
              />
              <Chip 
                label={t(report.severity)}
                variant="outlined"
                color="primary"
              />
            </Stack>
            
            <Typography variant="body1" mb={3}>
              {report.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("Show.Location")}
                </Typography>
                <Typography variant="body1" mb={2}>
                  {report.location || 'Not specified'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  {t("Show.ReportedBy")}
                </Typography>
                <Typography variant="body1" mb={2}>
                  <ProfileName profileId={report.reported_by} />
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("Show.ReportedAt")}
                </Typography>
                <Typography variant="body1" mb={2}>
                  {format(new Date(report.reported_at), 'MMM dd, yyyy HH:mm')}
                </Typography>
                
                {report.resolved_at && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t("Show.ResolvedAt")}
                    </Typography>
                    <Typography variant="body1" mb={2}>
                      {format(new Date(report.resolved_at), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Paper>
      
      {report.comments && (
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" mb={2}>
            {t("Show.Comments")}
          </Typography>
          <Typography variant="body1">
            {report.comments}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ReportShowPage;