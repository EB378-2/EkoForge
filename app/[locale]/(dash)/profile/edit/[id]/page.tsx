"use client";

import React, { useEffect } from "react";
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
} from "@mui/material";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { useGetIdentity } from "@refinedev/core";
import { useTranslations } from "next-intl";
import { useTheme } from "@hooks/useTheme";
import { ProfileData } from '@/types/index';


export default function ProfileEditPage() {
  const t = useTranslations("Profile");
  const theme = useTheme();

  const { data: identity } = useGetIdentity<{ id: string }>();
  const userId = identity?.id ?? "";

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
      id: userId,
      action: "edit",
      meta: { select: "*" },
    },
    defaultValues: {},
  });

  const profile = queryResult?.data?.data;
  
  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  if (formLoading || !userId) {
    return <Typography>Loading profile...</Typography>;
  }

  if (!profile) {
    return <Typography>Error loading profile</Typography>;
  }

  // Get initials from fullname
  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box component="form" sx={{ p: 4,}} autoComplete="off">
        <Grid container spacing={4}>
          {/* Left Column: Avatar */}
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
                <Box
                  sx={{
                    width: 100,
                    minHeight: 100,
                    borderRadius: "50%",
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {profile.avatar_url ? (
                    <Avatar
                      src={profile.avatar_url}
                      alt="Profile"
                      sx={{ width: "100%", height: "100%" }}
                    />
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
                  defaultValue={profile.avatar_url}
                  {...register("avatar_url")}
                  error={!!errors.avatar_url}
                  helperText={errors.avatar_url?.message?.toString()}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Editable Fields */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  defaultValue={profile.fullname}
                  {...register("fullname", { required: "Full name is required" })}
                  error={!!errors.fullname}
                  helperText={errors.fullname?.message?.toString()}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue={profile.email}
                  {...register("email", { required: "Email is required" })}
                  error={!!errors.email}
                  helperText={errors.email?.message?.toString()}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  defaultValue={profile.phone}
                  {...register("phone")}
                  error={!!errors.phone}
                  helperText={errors.phone?.message?.toString()}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Edit>
  );
}