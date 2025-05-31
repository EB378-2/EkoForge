'use client';

import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  TextField, 
  InputAdornment, 
  Stack, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Add,
  Flight,
  CheckCircle,
  Cancel,
  Pending,
  Edit,
  Delete
} from '@mui/icons-material';
import { useTable, useDelete, useNotification, useUpdate } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { Controller } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { PriorNotice } from '@/types/index';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(utc);
dayjs.extend(isSameOrAfter);

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
  cancelled: 'default'
};

const statusIcons: Record<string, JSX.Element> = {
  approved: <CheckCircle color="success" />,
  pending: <Pending color="warning" />,
  rejected: <Cancel color="error" />,
  cancelled: <Cancel />
};

export default function FlightsManagement() {
  const { open } = useNotification();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<PriorNotice | null>(null);
  const isNotOver = dayjs(selectedFlight?.dep_date).isAfter(dayjs());
  const [showPastFlights, setShowPastFlights] = useState(false);

  const { mutate: updateStatus } = useUpdate();
  const { mutate: deleteFlight } = useDelete();

  const {
    tableQueryResult,
  } = useTable<PriorNotice>({
    resource: 'pn_forms',
    filters: {
      permanent: [
        ...(filter === 'all'
          ? []
          : [{
              field: 'status',
              operator: "eq" as const,
              value: filter
            }]
        )
      ]
    },
    sorters: {
      permanent: [
        { field: 'dep_date', order: 'asc' },
        { field: 'dep_time', order: 'asc' }
      ]
    }
  });

  // Form for creating new flights
  const { 
    refineCore: { onFinish: onCreateFinish, formLoading: createLoading }, 
    register: createRegister, 
    handleSubmit: handleCreateSubmit,
    control: createControl,
    reset: resetCreateForm 
  } = useForm<PriorNotice>({
    refineCoreProps: {
      resource: 'pn_forms',
      action: 'create',
      onMutationSuccess: () => {
        resetCreateForm();
        setOpenCreateDialog(false);
        open?.({
          type: 'success',
          message: 'Flight notice created successfully',
        });
      }
    }
  });

  // Form for editing existing flights
  const { 
    refineCore: { onFinish: onEditFinish, formLoading: editLoading }, 
    register: editRegister, 
    handleSubmit: handleEditSubmit,
    control: editControl,
    reset: resetEditForm,
    setValue
  } = useForm<PriorNotice>({
    refineCoreProps: {
      resource: 'pn_forms',
      action: 'edit',
      onMutationSuccess: () => {
        setOpenEditDialog(false);
        setSelectedFlight(null);
        open?.({
          type: 'success',
          message: 'Flight notice updated successfully',
        });
      }
    }
  });

  const handleEditClick = (flight: PriorNotice) => {
    setSelectedFlight(flight);
    // Set form values for editing
    setValue('id', flight.id);
    setValue('aircraft_reg', flight.aircraft_reg);
    setValue('pic_name', flight.pic_name);
    setValue('dep_date', flight.dep_date);
    setValue('arr_date', flight.arr_date);
    setValue('dep_time', flight.dep_time);
    setValue('arr_time', flight.arr_time);
    setValue('from_location', flight.from_location);
    setValue('to_location', flight.to_location);
    setValue('mtow', flight.mtow);
    setValue('phone', flight.phone);
    setValue('email', flight.email);
    setValue('ifr_arrival', flight.ifr_arrival);
    setValue('status', flight.status);
    setOpenEditDialog(true);
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatus({
      resource: 'pn_forms',
      id,
      values: { status },
    }, {
      onSuccess: () => {
        open?.({
          type: 'success',
          message: 'Flight status updated',
        });
      },
      onError: () => {
        open?.({
          type: 'error',
          message: 'Failed to update flight status',
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteFlight({
      resource: 'pn_forms',
      id,
    }, {
      onSuccess: () => {
        open?.({
          type: 'success',
          message: 'Flight notice deleted',
        });
      },
      onError: () => {
        open?.({
          type: 'error',
          message: 'Failed to delete flight notice',
        });
      }
    });
  };

  const flights = (tableQueryResult?.data?.data || []).filter(flight => {
    if (showPastFlights) return true; // Show all flights when checkbox is checked
    
    // When checkbox is unchecked, show flights that are today or in the future
    const flightDateTime = dayjs.utc(`${flight.arr_date} ${flight.arr_time}`, 'YYYY-MM-DD HHmm');
    const now = dayjs.utc();
    return flightDateTime.isSameOrAfter(now, 'day');
  });

  useEffect(() => {
    console.log('Filtered flights:', flights);
    console.log('Show past flights:', showPastFlights);
  }, [flights, showPastFlights]);

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" sx={{ flexDirection: { xs: "column", sm: "row" } }} justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Flight Notices Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #2196f3, #1976d2)'
            }}
          >
            New Flight Notice
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search flights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPastFlights}
                    onChange={(e) => setShowPastFlights(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show past flights"
                sx={{ mr: 1 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Flights</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="outlined" 
                startIcon={<FilterList />}
                sx={{ borderRadius: 2 }}
              >
                Filters
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Aircraft</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>PIC</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flights.map((flight) => (
              <TableRow 
                key={flight.id} 
                hover 
                sx={(theme) => ({ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  borderLeft: isNotOver ? `4px solid ${theme.palette.primary.main}` : 'none',
                })}
              >
                <TableCell>
                  <Typography fontWeight="medium">{flight.aircraft_reg}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    MTOW: {flight.mtow}kg
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="medium">
                    {flight.from_location} → {flight.to_location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flight.ifr_arrival ? 'IFR' : 'VFR'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {dayjs(flight.dep_date).format('DD MMM YYYY')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flight.dep_time} - {flight.arr_time}  UTC
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>{flight.pic_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flight.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={flight.status} 
                    color={statusColors[flight.status.toLowerCase()] || 'default'} 
                    size="small"
                    icon={statusIcons[flight.status.toLowerCase()] || <Pending />}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell align="right">
                  
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {dayjs.utc(`${flight.arr_date} ${flight.arr_time}`, 'YYYY-MM-DD HHmm').isAfter(dayjs.utc()) ? (
                      // Future flight - show actions
                      <>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditClick(flight)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(flight.id)}>
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={flight.status}
                            onChange={(e) => handleStatusUpdate(flight.id, e.target.value)}
                            sx={{ height: 32, '.MuiSelect-select': { py: 0.5 } }}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    ) : (
                      // Past flight - show message or disabled state
                      <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                        Flight completed
                      </Typography>
                    )}
                  </Stack>
                  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Flight Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        fullWidth 
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            mb: '12vh'
          }
        }}
      >
        <DialogTitle>New Flight Notice</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateSubmit(onCreateFinish)} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Aircraft Registration"
                  {...createRegister('aircraft_reg', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PIC Name"
                  {...createRegister('pic_name', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Departure Date"
                  type="date"
                  {...createRegister('dep_date', { required: true })}
                  defaultValue={dayjs().format('YYYY-MM-DD')}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Arrival Date"
                  type="date"
                  {...createRegister('arr_date', { required: true })}
                  defaultValue={dayjs().format('YYYY-MM-DD')}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  {...createRegister('dep_time', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Arrival Time"
                  {...createRegister('arr_time', { required: true })}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Location"
                  {...createRegister('from_location', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="To Location"
                  {...createRegister('to_location', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MTOW (kg)"
                  type="number"
                  {...createRegister('mtow', { required: true, valueAsNumber: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  {...createRegister('phone', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  {...createRegister('email', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>IFR Arrival</InputLabel>
                  <Controller
                    control={createControl}
                    name="ifr_arrival"
                    defaultValue={false}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="IFR Arrival"
                        value={field.value ? 'yes' : 'no'}
                        onChange={(e) => field.onChange(e.target.value === 'yes')}
                      >
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSubmit(onCreateFinish)} 
            variant="contained"
            disabled={createLoading}
          >
            {createLoading ? 'Creating...' : 'Create Flight Notice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Flight Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedFlight(null);
        }} 
        fullWidth 
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            mb: '12vh'
          }
        }}
      >
        <DialogTitle>Edit Flight Notice</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit(onEditFinish)} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Aircraft Registration"
                  {...editRegister('aircraft_reg', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PIC Name"
                  {...editRegister('pic_name', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Departure Date"
                  type="date"
                  {...editRegister('dep_date', { required: true })}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Arrival Date"
                  type="date"
                  {...editRegister('arr_date', { required: true })}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  {...editRegister('dep_time', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Arrival Time"
                  {...editRegister('arr_time', { required: true })}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Location"
                  {...editRegister('from_location', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="To Location"
                  {...editRegister('to_location', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MTOW (kg)"
                  type="number"
                  {...editRegister('mtow', { required: true, valueAsNumber: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  {...editRegister('phone', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  {...editRegister('email', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>IFR Arrival</InputLabel>
                  <Controller
                    control={editControl}
                    name="ifr_arrival"
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="IFR Arrival"
                        value={field.value ? 'yes' : 'no'}
                        onChange={(e) => field.onChange(e.target.value === 'yes')}
                      >
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Controller
                    control={editControl}
                    name="status"
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditDialog(false);
            setSelectedFlight(null);
          }}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit(onEditFinish)} 
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? 'Updating...' : 'Update Flight Notice'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}