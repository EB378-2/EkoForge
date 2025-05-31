import React from 'react';
import { Modal, Box, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useUpdate } from '@refinedev/core';
import dayjs from 'dayjs';
import { AlertItem } from '@/types';

const AlertEditModal = ({ 
  open, 
  onClose, 
  alert,
  onSuccess
}: { 
  open: boolean; 
  onClose: () => void; 
  alert: AlertItem;
  onSuccess: () => void;
}) => {
  const [formState, setFormState] = React.useState(alert);
  const { mutate: updateAlert } = useUpdate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    updateAlert({
      resource: "alerts",
      id: alert.id,
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
        <Typography variant="h6" mb={3}>Edit Alert</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formState.title}
              onChange={handleChange}
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
              value={dayjs(formState.start_time).format('YYYY-MM-DDTHH:mm')}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              name="end_time"
              value={formState.end_time ? dayjs(formState.end_time).format('YYYY-MM-DDTHH:mm') : ''}
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
            <Button variant="contained" onClick={handleSubmit}>Save Changes</Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AlertEditModal;