import React from 'react';
import { Modal, Box, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Typography, SelectChangeEvent } from '@mui/material';
import { useCreate } from '@refinedev/core';
import dayjs from 'dayjs';
import { AlertItem } from '@/types';

const AlertCreateModal = ({ 
  open, 
  onClose, 
  onSuccess
}: { 
  open: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  // Initial state for new alert
  const [formState, setFormState] = React.useState<Omit<AlertItem, 'id'>>({
    title: '',
    description: '',
    alert_type: 'info',
    severity: 'medium',
    start_time: dayjs().format('YYYY-MM-DDTHH:mm'),
    is_active: true,
    created_at: dayjs().toISOString(),
    updated_at: dayjs().toISOString(),
  });

  const { mutate: createAlert } = useCreate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    createAlert({
      resource: "alerts",
      values: formState,
    }, {
      onSuccess: () => {
        onSuccess();
        onClose();
      }
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
      const { name, value } = e.target;
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography variant="h6" mb={3}>Create New Alert</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formState.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Alert Type</InputLabel>
              <Select
                name="alert_type"
                value={formState.alert_type}
                label="Alert Type"
                onChange={handleSelectChange}
              >
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="info">Information</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                name="severity"
                value={formState.severity}
                label="Severity"
                onChange={handleSelectChange}
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              name="start_time"
              value={formState.start_time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="End Time (Optional)"
              type="datetime-local"
              name="end_time"
              value={formState.end_time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="is_active"
                  checked={formState.is_active}
                  onChange={handleChange}
                />
              }
              label="Active Alert"
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={!formState.title.trim()} // Require title
            >
              Create Alert
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AlertCreateModal;