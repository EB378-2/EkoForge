"use client";

import { useForm } from '@refinedev/react-hook-form';
import { Create } from '@refinedev/mui';
import {
  Box,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTheme } from '@hooks/useTheme';
import { PriorNotice } from "@/types/index";
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const PNCreate = () => {
  const t = useTranslations('PN');
  const theme = useTheme();
  const router = useRouter();
  const {
    refineCore: { formLoading, onFinish },
    saveButtonProps,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PriorNotice>({
    refineCoreProps: {
      resource: 'pn_forms',
      redirect: false, // Disable default redirect
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onFinish(data);
      router.push('/priornotice');
    } catch (error) {
      // Handle error here
      console.error("Form submission error:", error);
    }
  });

  return (
    <Create
      isLoading={formLoading}
      saveButtonProps={{
        ...saveButtonProps,
        onClick: (e) => {
          e.preventDefault();
          handleFormSubmit();
        },
      }}
      goBack
      title={
        <Typography variant="h4">
          {t("title")}
        </Typography>
      }
    >
      <Box component="form" sx={{ mt: 3 }} onSubmit={handleFormSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body1" color={theme.palette.error.main}>
              {t("subtitle")}
            </Typography>
          </Grid>

          {/* Departure Location */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('from_location', {
                required: t("DepartureLocationRequired"),
              })}
              error={!!errors.from_location}
              helperText={errors.from_location?.message as string}
              fullWidth
              label={t("DepartureLocation")}
              placeholder={t("Enterlocationhere")}
            />
          </Grid>

          {/* Arrival Location */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('to_location', {
                required: t("ArrivalLocationRequired"),
              })}
              error={!!errors.to_location}
              helperText={errors.to_location?.message as string}
              fullWidth
              label={t("ArrivalLocation")}
              placeholder={t("Enterlocationhere")}
            />
          </Grid>

          {/* Departure Time */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('dep_time', {
                required: t("DepartureTimeRequired"),
                pattern: {
                  value: /^([0-1][0-9]|2[0-3])[0-5][0-9]$/,
                  message: t("InvalidTimeFormat"),
                },
              })}
              error={!!errors.dep_time}
              helperText={errors.dep_time?.message as string}
              fullWidth
              label={t("DEP (UTC HHMM)")}
              placeholder={t("Enterdeptimehere")}
            />
          </Grid>

          {/* Arrival Time */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('arr_time', {
                required: t("ArrivalTimeRequired"),
                pattern: {
                  value: /^([0-1][0-9]|2[0-3])[0-5][0-9]$/,
                  message: t("InvalidTimeFormat"),
                },
              })}
              error={!!errors.arr_time}
              helperText={errors.arr_time?.message as string}
              fullWidth
              label={t("ARR (UTC HHMM)")}
              placeholder={t("Enterarrtimehere")}
            />
          </Grid>

          {/* Departure Date */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('dep_date')}
              fullWidth
              type="date"
              label={t("DEP Date")}
              defaultValue={new Date().toISOString().split('T')[0]}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Arrival Date */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('arr_date')}
              fullWidth
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              label={t("ARR Date")}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Aircraft Registration */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('aircraft_reg', {
                required: t("AircraftRegRequired"),
              })}
              error={!!errors.aircraft_reg}
              helperText={errors.aircraft_reg?.message as string}
              fullWidth
              label={t("Aircraft registration")}
            />
          </Grid>

          {/* MTOW */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('mtow', {
                required: t("MTOWRequired"),
                min: { value: 1, message: t("InvalidMTOW") },
                max: { value: 10000, message: t("MTOWTooHigh") },
                valueAsNumber: true,
              })}
              error={!!errors.mtow}
              helperText={errors.mtow?.message as string}
              fullWidth
              type="number"
              label={t("MTOW (Kg)")}
            />
          </Grid>

          {/* PIC Name */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('pic_name', { 
                required: t("PICNameRequired") 
              })}
              error={!!errors.pic_name}
              helperText={errors.pic_name?.message as string}
              fullWidth
              label={t("PIC (Full name)")}
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12} md={6}>
            <TextField
              {...register('phone', {
                required: t("PhoneRequired"),
                pattern: {
                  value: /^\+?[0-9\s-]+$/,
                  message: t("InvalidPhone"),
                },
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message as string}
              fullWidth
              label={t("Phone")}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              {...register('email', {
                required: t("EmailRequired"),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("InvalidEmail"),
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message as string}
              fullWidth
              label={t("PIC email")}
            />
          </Grid>

          {/* IFR Arrival */}
          <Grid item xs={12}>
            <Controller
              control={control}
              name="ifr_arrival"
              defaultValue={false}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} color="primary" />}
                  label={t("IFR Arrival")}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Create>
  );
};

export default PNCreate;