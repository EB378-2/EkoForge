"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from "@mui/material";
import {
  Business as CompanyIcon,
  Person as ContactIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import { Edit } from "@refinedev/mui";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "@refinedev/react-hook-form";
import { HttpError } from "@refinedev/core";
import dayjs from "dayjs";

interface ProspectFormValues {
  id?: string;
  company_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  website?: string;
  status: string;
  notes?: string;
  is_migrated?: boolean;
  converted_at?: string;
  created_at?: string;
}

const statusOptions = [
  "1. new",
  "2. contacted",
  "3. engaged",
  "4. interested",
  "5. salescall",
  "6. qualified",
  "7. negotitions",
  "8. signed",
];

const statusColors: Record<string, string> = {
  "1. new": "default",
  "2. contacted": "primary",
  "3. engaged": "info",
  "4. interested": "success",
  "5. salescall": "warning",
  "6. qualified": "secondary",
  "7. negotitions": "info",
  "8. signed": "success",
};

export default function ProspectEdit() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const {
    refineCore: { formLoading, queryResult },
    saveButtonProps,
    register,
    formState: { errors },
  } = useForm<ProspectFormValues, HttpError, ProspectFormValues>({
    refineCoreProps: {
      resource: "prospects",
      id,
      action: "edit",
      redirect: false,
      onMutationSuccess: (data) => {
        router.push(`/crm/prospects/show/${data.data.id}`);
      },
    },
  });

  const prospect = queryResult?.data?.data;

  if (queryResult?.isLoading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (queryResult?.isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load prospect data.</Alert>
      </Box>
    );
  }

  return (
    <Edit
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      canDelete
      resource="prospects"
    >
      <Card elevation={3} sx={{ p: 3 }}>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  required
                  variant="outlined"
                  size="small"
                  defaultValue={prospect?.company_name}
                  InputProps={{
                    startAdornment: (
                      <CompanyIcon sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                  error={!!errors?.company_name}
                  helperText={errors?.company_name?.message}
                  {...register("company_name", {
                    required: "Company name is required",
                  })}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  variant="outlined"
                  size="small"
                  defaultValue={prospect?.contact_name}
                  InputProps={{
                    startAdornment: (
                      <ContactIcon sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                  {...register("contact_name")}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  variant="outlined"
                  size="small"
                  defaultValue={prospect?.email}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                  error={!!errors?.email}
                  helperText={errors?.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  variant="outlined"
                  size="small"
                  defaultValue={prospect?.phone}
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                  {...register("phone")}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Website"
                  variant="outlined"
                  size="small"
                  placeholder="example.com"
                  defaultValue={prospect?.website}
                  InputProps={{
                    startAdornment: (
                      <>
                        <WebsiteIcon sx={{ color: "action.active", mr: 1 }} />
                        <Typography sx={{ mr: 1 }}>https://</Typography>
                      </>
                    ),
                  }}
                  {...register("website")}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    defaultValue={prospect?.status || "1. new"}
                    {...register("status")}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  variant="outlined"
                  size="small"
                  defaultValue={prospect?.notes}
                  InputProps={{
                    startAdornment: (
                      <NotesIcon sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                  {...register("notes")}
                />
              </Paper>
            </Grid>

            {prospect?.created_at && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Created: {dayjs(prospect.created_at).format("MMMM D, YYYY h:mm A")}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Card>
    </Edit>
  );
}