"use client";

import React, { useState, useMemo } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Button, Tooltip, Avatar,
  TextField, MenuItem, Badge
} from "@mui/material";
import { 
  Warning, Error, Info, Schedule, Refresh, 
  Add, Visibility, Edit, Delete, NotificationsActive,
  CheckCircle, Cancel, EmergencyRecording, History
} from "@mui/icons-material";
import { useList, useDelete, useUpdate } from "@refinedev/core";
import dayjs from "dayjs";
import { useTheme } from "@hooks/useTheme";
import { AlertItem } from '@types';
import { TableFooter, Pagination } from "@mui/material";
import { DeleteButton } from "@refinedev/mui";
import AlertEditModal from "@components/AdminComponents/AlertEditModal"; // Assume we have this component
import AlertCreateModal from "@components/AdminComponents/AlertCreateModal"; // Assume we have this component

const AlertAdminDashboard = () => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null);
  
  // Fetch alerts data
  const { data: alertsData, isLoading, refetch } = useList<AlertItem>({ 
    resource: "alerts",
    pagination: { 
        current: currentPage,
        pageSize: pageSize,
    },
    sorters: [{ field: "start_time", order: "desc" }]
  });

  // Fetch alert history (resolved alerts)
  const { data: historyData } = useList<AlertItem>({ 
    resource: "alerts",
    filters: [{ field: "is_active", operator: "eq", value: false }],
    pagination: { pageSize: 5 }
  });

  // Calculate statistics
  const alertStats = useMemo(() => {
    const activeAlerts = alertsData?.data?.filter(a => a.is_active) || [];
    const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
    
    return {
      total: alertsData?.total || 0,
      active: activeAlerts.length,
      critical: criticalAlerts.length,
      resolved: historyData?.total || 0
    };
  }, [alertsData, historyData]);

  // Get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    };
  };

  // Get icon based on alert type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <EmergencyRecording fontSize="small" />;
      case 'warning': return <Warning fontSize="small" />;
      case 'ongoing': return <Schedule fontSize="small" />;
      default: return <Info fontSize="small" />;
    };
  };

  // Handle edit click
  const handleEditClick = (alert: AlertItem) => {
    setCurrentAlert(alert);
    setEditModalOpen(true);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: theme.palette.background.default }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" fontWeight="bold">
          Alert Management Dashboard
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateModalOpen(true)}>
          Create New Alert
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <NotificationsActive />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Alerts</Typography>
                  <Typography variant="h4">
                    {alertStats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Alerts</Typography>
                  <Typography variant="h4">
                    {alertStats.active}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <Error />
                </Avatar>
                <Box>
                  <Typography variant="h6">Critical Alerts</Typography>
                  <Typography variant="h4">
                    {alertStats.critical}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">Resolved Alerts</Typography>
                  <Typography variant="h4">
                    {alertStats.resolved}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Alerts Grid */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h6">Active Alerts</Typography>
            <Tooltip title="Refresh alerts">
              <IconButton onClick={() => refetch()}><Refresh /></IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            {alertsData?.data?.filter(a => a.is_active).map((alert) => (
              <Grid item xs={12} md={6} key={alert.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    borderLeft: `4px solid ${getSeverityColor(alert.severity) === 'error' 
                      ? theme.palette.error.main 
                      : theme.palette.warning.main}`,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getAlertIcon(alert.alert_type)}
                          {alert.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {alert.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label={alert.severity.toUpperCase()} 
                        color={getSeverityColor(alert.severity)}
                        size="small"
                      />
                    </Box>
                    
                    <Box mt={2} display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="caption" display="block">
                          <strong>Started:</strong> {dayjs(alert.start_time).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                        <Typography variant="caption" display="block">
                          <strong>Ends:</strong> {
                            alert.end_time 
                              ? dayjs(alert.end_time).format('DD/MM/YYYY HH:mm') 
                              : 'Ongoing'
                          }
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditClick(alert)}>
                          <Edit />
                        </IconButton>
                        <DeleteButton
                          size="small"
                          resource="alerts"
                          recordItemId={alert.id}
                          onSuccess={() => refetch()}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {alertsData?.data?.filter(a => a.is_active).length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  py: 4,
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 2
                }}>
                  <CheckCircle sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
                  <Typography variant="h6">No Active Alerts</Typography>
                  <Typography variant="body2" color="text.secondary">
                    All systems are operating normally
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Alert History */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h6">Recent Alert History</Typography>
            <Button variant="outlined" startIcon={<History />}>
              View Full History
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Alert</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData?.data?.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Typography fontWeight={500}>{alert.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.description.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={alert.alert_type} 
                        size="small"
                        icon={getAlertIcon(alert.alert_type)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={alert.severity} 
                        size="small"
                        color={getSeverityColor(alert.severity)}
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(alert.start_time).format('DD/MM/YY HH:mm')}
                    </TableCell>
                    <TableCell>
                      {alert.end_time 
                        ? dayjs(alert.end_time).format('DD/MM/YY HH:mm') 
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {alert.end_time 
                        ? dayjs(alert.end_time).diff(alert.start_time, 'hour') + 'h'
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={alert.is_active ? "Active" : "Resolved"} 
                        size="small"
                        color={alert.is_active ? "warning" : "success"}
                        icon={alert.is_active ? <Warning /> : <CheckCircle />}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditClick(alert)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditClick(alert)}>
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Showing {historyData?.data?.length} of {historyData?.total} resolved alerts
                      </Typography>
                      
                      <Pagination
                        count={Math.ceil((historyData?.total || 0) / 5)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {currentAlert && (
        <AlertEditModal 
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          alert={currentAlert}
          onSuccess={() => refetch()}
        />
      )}
      <AlertCreateModal 
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
          setCreateModalOpen(false);
        }}
      />
    </Box>
  );
};

export default AlertAdminDashboard;