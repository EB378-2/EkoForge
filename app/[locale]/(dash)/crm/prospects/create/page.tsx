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
} from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useRouter } from "next/navigation";
import { HttpError } from "@refinedev/core";

interface ProspectFormValues {
  id?: string; // Added id property
  company_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  website?: string;
  status: string;
  notes?: string;
}

export default function ProspectCreate() {
  const router = useRouter();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
  } = useForm<ProspectFormValues, HttpError, ProspectFormValues>({
    refineCoreProps: {
      resource: "prospects",
      redirect: false,
      onMutationSuccess: (data) => {
        router.push(`/crm/prospects/show/${data.data.id}`);
      },
    },
  });

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

  return (
    <Create
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      headerProps={{
        sx: {
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
          mb: 3,
        },
      }}
      headerButtons={
        <Button
          variant="outlined"
          onClick={() => router.push("/prospects")}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
      }
    >
      <Card elevation={3} sx={{ p: 3 }}>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                required
                variant="outlined"
                size="small"
                {...register("company_name", { required: true })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Name"
                variant="outlined"
                size="small"
                {...register("contact_name")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                variant="outlined"
                size="small"
                {...register("email", { required: true })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                variant="outlined"
                size="small"
                {...register("phone")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                variant="outlined"
                size="small"
                placeholder="example.com"
                {...register("website")}
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 1 }}>https://</Typography>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  defaultValue="1. new"
                  {...register("status")}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                variant="outlined"
                size="small"
                {...register("notes")}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Create>
  );
}