"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  Button,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useNotification, useGetIdentity } from "@refinedev/core";
import { useTranslations } from "next-intl";
import { useTheme } from "@hooks/useTheme";
import { useParams, useRouter } from "next/navigation";
import { ProfileData } from '@/types/index';

export default function ProfileEditPage() {
  const t = useTranslations("Profile");
  const theme = useTheme();
  const { open } = useNotification();
  const { data: identity } = useGetIdentity();
  const [emailChanged, setEmailChanged] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    saveButtonProps,
    refineCore: { queryResult, formLoading },
    control,
    register,
    reset,
    formState: { errors },
  } = useForm<ProfileData>({
    refineCoreProps: {
      resource: "profiles",
      id: id,
      action: "edit",
      meta: { select: "*" },
    },
  });

  const profile = queryResult?.data?.data;
  const ratingOptions = ["Student", "LAPL", "PPL", "CPL", "ATPL", "Kvetch"];
  const roleOptions = ["admin", "pilot", "staff"];
  const statusOptions = ["active", "pending", "suspended"];

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    
    try {
      // Update role/status if admin
      if (profile) {
        const response = await fetch('/api/users/update-role-status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: id,
            role: profile.role,
            status: profile.status
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update user');
        }
      }

      // Update email if changed
      if (emailChanged && profile?.email) {
        const emailResponse = await fetch('/api/users/update-email', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: id,
            newEmail: profile.email
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(errorData.error || 'Email update failed');
        }
      }

      // Update profile data and redirect on success
      await saveButtonProps.onClick(e);
      
      // Show success message
      open?.({
        type: "success",
        message: "Profile updated successfully",
      });
      
      // Redirect to admin users page
      router.push("/admin/users");

    } catch (error: any) {
      open?.({
        type: "error",
        message: "Update failed",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (profile) {
      reset(profile);
      setOriginalEmail(profile.email);
    }
  }, [profile, reset]);

  if (formLoading || !id) return <Typography>Loading profile...</Typography>;
  if (!profile) return <Typography>Error loading profile</Typography>;

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Edit isLoading={formLoading} saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit }} goBack={false} 
      headerProps={{
        title: t("edit"),        
      }}
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button 
            variant="contained"
            color="secondary"
            onClick={() => router.push("/admin/users")}
          >
            Go back
          </Button>
        </>
      )}
    >
      <Box component="form" sx={{ p: 4 }} autoComplete="off">
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  backgroundColor: theme.palette.third.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{
                  width: 100,
                  minHeight: 100,
                  borderRadius: "50%",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {profile.avatar_url ? (
                    <Avatar src={profile.avatar_url} alt="Profile" sx={{ width: "100%", height: "100%" }} />
                  ) : (
                    <Typography variant="h4" color="primary">
                      {getInitials(profile.fullname)}
                    </Typography>
                  )}
                </Box>
              </CardMedia>
              <CardContent>
                <TextField
                  fullWidth
                  label="Change Avatar"
                  {...register("avatar_url")}
                  error={!!errors.avatar_url}
                  helperText={errors.avatar_url?.message?.toString()}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register("fullname", { required: "Full name is required" })}
                  error={!!errors.fullname}
                  helperText={errors.fullname?.message?.toString()}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  {...register("email", {
                    required: "Email is required",
                    onChange: (e) => setEmailChanged(e.target.value !== originalEmail)
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message?.toString()}
                />
              </Grid>


              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Role"  value={field.value || profile?.role || ''}>
                        {roleOptions.map(option => (
                          <MenuItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Status" value={field.value || profile?.status || ''}>
                        {statusOptions.map(option => (
                          <MenuItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>            

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register("phone")}
                  error={!!errors.phone}
                  helperText={errors.phone?.message?.toString()}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Licence"
                  {...register("licence")}
                  error={!!errors.licence}
                  helperText={errors.licence?.message?.toString()}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="ratings"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset" fullWidth>
                      <Typography variant="h6">Aviation Ratings</Typography>
                      <FormGroup row>
                        {ratingOptions.map(option => (
                          <FormControlLabel
                            key={option}
                            control={
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onChange={(e) => {
                                    const newRatings: string[] = e.target.checked
                                    ? [...(field.value || []), option]
                                    : (field.value || []).filter((r: string) => r !== option);
                                  field.onChange(newRatings);
                                }}
                              />
                            }
                            label={option}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Edit>
  );
}