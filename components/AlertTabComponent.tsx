"use client";

import React, { useState } from 'react';
import { 
  Box, Button, Modal, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Chip, CircularProgress, Alert, TextField, 
  Select, MenuItem, FormControl, InputLabel, Grid, Switch, FormControlLabel
} from '@mui/material';
import { CanAccess, useList, useUpdate } from '@refinedev/core';
import { Warning, Error, Info, Schedule, Close } from '@mui/icons-material';
import { useTheme } from '@hooks/useTheme';
import { formatDistanceToNow } from 'date-fns';
import { DeleteButton, EditButton } from '@refinedev/mui';
import { useTranslations } from 'next-intl';

const AlertTabModal = () => {
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [alertForm, setAlertForm] = useState<any>({});
  const theme = useTheme();
  const t = useTranslations('Alerts');
  
  // Fetch active alerts
  const { data, isLoading, isError, refetch } = useList({
    resource: 'alerts',
    filters: [
      { field: 'is_active', operator: 'eq', value: 'true' }
    ],
    sorters: [{ field: 'severity', order: 'asc' }],
    pagination: { pageSize: 20 }
  });

  // Update hook
  const { mutate: updateAlert } = useUpdate();

  const alerts = data?.data || [];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Open edit modal and set current alert
  const handleEditClick = (alert: any) => {
    setCurrentAlert(alert);
    setAlertForm({
      title: alert.title,
      description: alert.description,
      alert_type: alert.alert_type,
      severity: alert.severity,
      end_time: alert.end_time ? new Date(alert.end_time).toISOString().slice(0, 16) : null,
      is_active: alert.is_active
    });
    setEditModalOpen(true);
  };

  // Handle form changes
  const handleFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setAlertForm({
      ...alertForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Submit updated alert
  const handleUpdateAlert = () => {
    if (!currentAlert) return;
    
    updateAlert({
      resource: 'alerts',
      id: currentAlert.id,
      values: {
        ...alertForm,
        end_time: alertForm.end_time || null
      },
    }, {
      onSuccess: () => {
        setEditModalOpen(false);
        refetch();
      }
    });
  };

  // Get icon based on alert type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'ongoing': return <Schedule color="info" />;
      default: return <Info color="info" />;
    }
  };

  // Get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  return (
    <>
      {/* Fixed trigger tab */}
      <Box
        sx={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2000,
        }}
      > 
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            minWidth: 0,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            py: 1.2,
            px: 0.5,
            width: 30,
            boxShadow: 3,
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
              transform: 'translateX(-4px)',
            },
            transition: 'all 0.3s ease',
            display: alerts.length === 0 ? 'none' : 'block',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              writingMode: 'vertical-rl', 
              transform: 'rotate(180deg)',
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
              fontWeight: 700
            }}
          >
            {t("NBALERTS")}
          </Typography>
        </Button>
      </Box>

      {/* Alerts Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 500,
            maxWidth: '90vw',
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("ActiveAlerts")}
            </Typography>
            <Button 
              onClick={handleClose} 
              sx={{ color: 'inherit', minWidth: 0 }}
            >
              <Close />
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                {t("Loading alerts")}...
              </Typography>
            </Box>
          ) : isError ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {t("Failed to load alerts")}
            </Alert>
          ) : alerts.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">
                {t("No active alerts at this time")}
              </Typography>
            </Box>
          ) : (
            <List sx={{ overflow: 'auto', flex: 1 }}>
              {alerts.map((alert) => (
                <ListItem 
                  key={alert.id}
                  sx={{ 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 1.5,
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getAlertIcon(alert.alert_type)}
                  </ListItemIcon>
                  
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
                          {alert.title}
                        </Typography>
                        <Chip 
                          label={alert.severity}
                          size="small"
                          color={getSeverityColor(alert.severity)}
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {alert.description}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                          {alert.end_time ? (
                            <>
                              <Box component="span" sx={{ fontWeight: 600 }}>
                                {t("Ends: ")}
                              </Box>
                              {' '}
                              {formatDistanceToNow(new Date(alert.end_time), { addSuffix: true })}
                            </>
                          ) : (
                            <Box component="span" sx={{ color: theme.palette.info.main, fontWeight: 600 }}>
                              {t("Ongoing")}
                            </Box>
                          )}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <CanAccess
                            resource="alerts"
                            action="edit"
                            params={{ id: alert.id }}
                          >
                            <EditButton 
                              resource="alerts"
                              onClick={() => handleEditClick(alert)}
                              />
                          </CanAccess>
                          <CanAccess
                            resource="alerts"
                            action="delete"
                            params={{ id: alert.id }}
                          >
                            <DeleteButton
                            resource="alerts"
                            recordItemId={alert.id}
                            />
                          </CanAccess>
                        </Box>
                      </Box>
                    }
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={handleClose}
              variant="outlined"
              size="small"
              fullWidth
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
              }}
            >
              {t("Close")}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit Alert Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 500,
            maxWidth: '90vw',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            outline: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              pb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Edit Alert
            </Typography>
            <Button 
              onClick={() => setEditModalOpen(false)} 
              size="small"
              sx={{ minWidth: 0 }}
            >
              <Close />
            </Button>
          </Box>

          {currentAlert && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={alertForm.title || ''}
                  onChange={handleFormChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={alertForm.description || ''}
                  onChange={handleFormChange}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Alert Type</InputLabel>
                  <Select
                    name="alert_type"
                    value={alertForm.alert_type || 'info'}
                    label="Alert Type"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="info">Information</MenuItem>
                    <MenuItem value="ongoing">Ongoing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Severity</InputLabel>
                  <Select
                    name="severity"
                    value={alertForm.severity || 'medium'}
                    label="Severity"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="End Time"
                  name="end_time"
                  type="datetime-local"
                  value={alertForm.end_time || ''}
                  onChange={handleFormChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <Typography variant="caption" color="textSecondary">
                  Leave empty for ongoing alerts
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={alertForm.is_active || false}
                      onChange={handleFormChange}
                      color="primary"
                    />
                  }
                  label="Active Alert"
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setEditModalOpen(false)}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleUpdateAlert}
                  color="primary"
                >
                  Update Alert
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default AlertTabModal;