'use client';

import { Box, Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNotification } from '@refinedev/core';
import { useForm } from '@refinedev/react-hook-form';
import { Controller } from 'react-hook-form';
import { useState } from 'react';
import { Add } from '@mui/icons-material';

export default function CreateUserModalWithButton() {
  const { open } = useNotification();
  const [openDialog, setOpenDialog] = useState(false);

 // In your MembersList component
  const { 
    refineCore: { onFinish: refineOnFinish, formLoading }, 
    register, 
    handleSubmit,
    control,
    reset 
  } = useForm({
    refineCoreProps: {
      resource: 'profiles',
      action: 'create',
      onMutationSuccess: () => {
        reset();
        setOpenDialog(false);
        open?.({
          type: 'success',
          message: 'Member created successfully',
        });
      }
    }
  });

  const onFinish = async (data: any) => {
    try {
      const response = await fetch('/api/users/create-users', {  // Updated endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          user_metadata: {
            fullname: data.fullname,
            status: data.status,
            role: data.role
          }
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }


      open?.({
        type: 'success',
        message: 'User created successfully',
      });
      
      setOpenDialog(false);
      reset();
    } catch (error: any) {
      open?.({
        type: 'error',
        message: error.message || 'Error creating user',
      });
    }
  };

  return (
    <Box>
        <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #2196f3, #1976d2)'
            }}
            onClick={() => setOpenDialog(true)}
        >
            Add User
        </Button>
      {/* Add Member Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onFinish)} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register('fullname', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...register('email', { required: true })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  {...register('password', { required: true })}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Controller
                    control={control}
                    name="status"
                    defaultValue="active"
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Controller
                    control={control}
                    name="role"
                    defaultValue="pilot"
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Role"
                      >
                        <MenuItem value="CEO">CEO</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="new">New</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit(onFinish)} 
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? 'Creating...' : 'Create Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}