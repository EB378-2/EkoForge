"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Avatar,
  Skeleton,
  IconButton,
  Divider,
  Container,
  Stack,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormHelperText
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useOne, useList, useGetIdentity, useUpdate, useDelete, CanAccess } from "@refinedev/core";
import { format, parseISO, isSameDay, addHours } from 'date-fns';
import ArrowBack from "@mui/icons-material/ArrowBack";
import CalendarToday from "@mui/icons-material/CalendarToday";
import AccessTime from "@mui/icons-material/AccessTime";
import LocationOn from "@mui/icons-material/LocationOn";
import Person from "@mui/icons-material/Person";
import Share from "@mui/icons-material/Share";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Event from "@mui/icons-material/Event";
import Save from "@mui/icons-material/Save";
import Close from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { ProfileAvatar, ProfileName, ProfileEmail } from "@components/functions/FetchFunctions";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  location: string;
  event_type: string;
  status: string;
  timezone: string;
  organizer_id: string;
  image_link?: string;
};

type EventFormData = {
  id: string;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  is_all_day: boolean;
  location: string;
  event_type: string;
  status: string;
  timezone: string;
};

const EventShowPage = () => {
  const theme = useTheme();
  const t = useTranslations("Calendar");
  const router = useRouter();
  const { mutate: deleteEvent } = useDelete();
  const { id } = useParams();
  type UserIdentity = { id: string } | null;
  const { data: userIdentity } = useGetIdentity<UserIdentity>();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EventFormData | null>(null);
  
  // Fetch event details
  const { data: eventData, isError, refetch } = useOne<CalendarEvent>({
    resource: "events",
    id: id as string,
    meta: { select: "*" }
  });

  const { mutate: updateEvent } = useUpdate();

  // Fetch related events
  const { data: relatedEvents } = useList<CalendarEvent>({
    resource: "events",
    filters: [
      { field: "id", operator: "ne", value: id },
      { field: "event_type", operator: "eq", value: eventData?.data?.event_type }
    ],
    pagination: { pageSize: 3 },
    sorters: [{ field: "start_time", order: "asc" }],
    queryOptions: {
      enabled: !!eventData?.data?.event_type
    }
  });

  const event = eventData?.data;

  useEffect(() => {
    if (event) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [event]);

  useEffect(() => {
    if (event && isEditing) {
      setFormData({
        id: event.id,
        title: event.title,
        description: event.description,
        start_time: parseISO(event.start_time),
        end_time: parseISO(event.end_time),
        is_all_day: event.is_all_day,
        location: event.location,
        event_type: event.event_type,
        status: event.status,
        timezone: event.timezone
      });
    }
  }, [event, isEditing]);

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: `Join me for ${event.title} on ${formatDate(event.start_time)}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Sharing failed', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(null);
  };

  const handleSave = () => {
    if (!formData) return;
    
    updateEvent(
      {
        resource: "events",
        id: formData.id,
        values: {
          ...formData,
          start_time: formData.start_time.toISOString(),
          end_time: formData.end_time.toISOString(),
        }
      },
      {
        onSuccess: () => {
          refetch();
          setIsEditing(false);
        }
      }
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent({
      resource: "events",
      id: id as string,
      successNotification: { 
        message: "Event deleted successfully!", 
        type: "success" 
      },
    });
      router.push("/calendar");
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'h:mm a');
  };

  const formatDateTimeRange = () => {
    if (!event) return "";
    
    const start = parseISO(event.start_time);
    const end = parseISO(event.end_time);
    
    if (event.is_all_day) {
      return isSameDay(start, end)
        ? formatDate(event.start_time) + " (All Day)"
        : `${formatDate(event.start_time)} - ${formatDate(event.end_time)}`;
    }
    
    return isSameDay(start, end)
      ? `${formatDate(event.start_time)} • ${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
      : `${formatDate(event.start_time)} ${formatTime(event.start_time)} - ${formatDate(event.end_time)} ${formatTime(event.end_time)}`;
  };

  const handleFormChange = (field: keyof EventFormData, value: any) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
    
    // Adjust end time if start time changes and it's before end time
    if (field === "start_time" && value instanceof Date) {
      if (value > formData.end_time) {
        setFormData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            end_time: addHours(value, 1)
          };
        });
      }
    }
  };

  if (isError) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)' 
          : 'linear-gradient(45deg, #f5f7fa 30%, #e4e8f0 90%)'
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
            {t("EventNotFound")}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            {t("The event you're looking for doesn't exist or may have been removed.")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/events')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              fontWeight: 600
            }}
          >
            {t("BackToEvents")}
          </Button>
        </Container>
      </Box>
    );
  }

  const eventTypeColor = () => {
    if (!event) return "primary";
    switch (event.event_type) {
      case 'meeting': return 'primary';
      case 'training': return 'secondary';
      case 'event': return 'success';
      case 'reminder': return 'warning';
      case 'holiday': return 'error';
      case 'personal': return 'info';
      default: return 'primary';
    }
  };

  const statusColor = () => {
    if (!event) return "success";
    switch (event.status) {
      case 'cancelled': return 'error';
      case 'tentative': return 'warning';
      default: return 'success';
    }
  };

  return (
    <Box sx={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)' 
        : 'linear-gradient(45deg, #f5f7fa 30%, #e4e8f0 90%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{
            mb: 3,
            color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
            '&:hover': { backgroundColor: theme.palette.action.hover }
          }}
        >
          {t("Back")}
        </Button>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Event Details Column */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              borderRadius: '16px', 
              overflow: 'hidden',
              mb: 4,
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
            }}>
              {isLoading ? (
                <Skeleton variant="rectangular" width="100%" height={400} />
              ) : event?.image_link ? (
                <CardMedia
                  component="img"
                  image={event.image_link}
                  alt={event.title}
                  sx={{ width: '100%', height: 400, objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ 
                  height: 400, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #2c387e 0%, #1e2a5a 100%)'
                    : 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)'
                }}>
                  <Event sx={{ fontSize: 80, color: 'white', mr: 2 }} />
                  <Typography variant="h2" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    textAlign: 'center'
                  }}>
                    {event?.title}
                  </Typography>
                </Box>
              )}
              
              <CardContent sx={{ p: 4 }}>
                {isLoading ? (
                  <>
                    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
                  </>
                ) : event ? (
                  isEditing && formData ? (
                    // EDIT MODE
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Stack spacing={3}>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 800, 
                            mb: 2,
                            color: theme.palette.primary.main
                          }}
                        >
                          {t("EditEvent")}
                        </Typography>
                        
                        <TextField
                          label={t("EventTitle")}
                          fullWidth
                          value={formData.title}
                          onChange={(e) => handleFormChange('title', e.target.value)}
                          required
                          sx={{ mb: 2 }}
                        />
                        
                        <TextField
                          label={t("Description")}
                          fullWidth
                          multiline
                          rows={4}
                          value={formData.description}
                          onChange={(e) => handleFormChange('description', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={formData.is_all_day} 
                              onChange={(e) => handleFormChange('is_all_day', e.target.checked)}
                            />
                          }
                          label={t("AllDayEvent")}
                          sx={{ mb: 2 }}
                        />
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} md={6}>
                            {formData.is_all_day ? (
                              <DateTimePicker
                                label={t("StartDate")}
                                value={formData.start_time}
                                onChange={(date) => date && handleFormChange('start_time', date)}
                                slotProps={{ textField: { fullWidth: true } }}
                              />
                            ) : (
                              <DateTimePicker
                                label={t("StartTime")}
                                value={formData.start_time}
                                onChange={(date) => date && handleFormChange('start_time', date)}
                                slotProps={{ textField: { fullWidth: true } }}
                              />
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            {formData.is_all_day ? (
                              <DateTimePicker
                                label={t("EndDate")}
                                value={formData.end_time}
                                onChange={(date) => date && handleFormChange('end_time', date)}
                                slotProps={{ textField: { fullWidth: true } }}
                                minDate={formData.start_time}
                              />
                            ) : (
                              <DateTimePicker
                                label={t("EndTime")}
                                value={formData.end_time}
                                onChange={(date) => date && handleFormChange('end_time', date)}
                                slotProps={{ textField: { fullWidth: true } }}
                                minDate={formData.start_time}
                              />
                            )}
                          </Grid>
                        </Grid>
                        
                        <TextField
                          label={t("Location")}
                          fullWidth
                          value={formData.location}
                          onChange={(e) => handleFormChange('location', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>{t("EventType")}</InputLabel>
                              <Select
                                value={formData.event_type}
                                label={t("EventType")}
                                onChange={(e) => handleFormChange('event_type', e.target.value)}
                              >
                                {['meeting', 'training', 'event', 'reminder', 'holiday', 'personal'].map(type => (
                                  <MenuItem key={type} value={type}>{t(type)}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>{t("Status")}</InputLabel>
                              <Select
                                value={formData.status}
                                label={t("Status")}
                                onChange={(e) => handleFormChange('status', e.target.value)}
                              >
                                {['confirmed', 'tentative', 'cancelled'].map(status => (
                                  <MenuItem key={status} value={status}>{t(status)}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        
                        <FormControl fullWidth>
                          <InputLabel>{t("Timezone")}</InputLabel>
                          <Select
                            value={formData.timezone}
                            label={t("Timezone")}
                            onChange={(e) => handleFormChange('timezone', e.target.value)}
                          >
                            {Intl.supportedValuesOf('timeZone').map(tz => (
                              <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </LocalizationProvider>
                  ) : (
                    // VIEW MODE
                    <>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        <Chip 
                          label={event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)} 
                          color={eventTypeColor()}
                          size="medium"
                          sx={{ fontWeight: 600, px: 1, py: 1.5 }} 
                        />
                        <Chip 
                          label={event.status.charAt(0).toUpperCase() + event.status.slice(1)} 
                          color={statusColor()}
                          size="medium"
                          sx={{ fontWeight: 600, px: 1, py: 1.5 }} 
                        />
                        {event.is_all_day && (
                          <Chip 
                            label="All Day" 
                            color="default"
                            size="medium"
                            sx={{ fontWeight: 600, px: 1, py: 1.5 }} 
                          />
                        )}
                      </Box>
                      
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 800, 
                          mb: 3,
                          lineHeight: 1.2,
                          color: theme.palette.mode === 'dark' 
                            ? 'text.primary' : 'primary.dark'
                        }}
                      >
                        {event.title}
                      </Typography>
                      
                      <Divider sx={{ mb: 4 }} />
                      
                      {/* Event Details */}
                      <List disablePadding>
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <CalendarToday sx={{ color: theme.palette.text.secondary }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={t("Date & Time")}
                            secondary={formatDateTimeRange()}
                            secondaryTypographyProps={{ sx: { fontWeight: 500 } }}
                          />
                        </ListItem>
                        
                        {event.location && (
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <LocationOn sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t("Location")}
                              secondary={event.location}
                              secondaryTypographyProps={{ sx: { fontWeight: 500 } }}
                            />
                          </ListItem>
                        )}
                        
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <AccessTime sx={{ color: theme.palette.text.secondary }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={t("Timezone")}
                            secondary={event.timezone}
                            secondaryTypographyProps={{ sx: { fontWeight: 500 } }}
                          />
                        </ListItem>
                      </List>
                      
                      <Divider sx={{ my: 4 }} />
                      
                      {/* Description */}
                      {event.description && (
                        <>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            {t("Description")}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              lineHeight: 1.8,
                              color: theme.palette.mode === 'dark' 
                                ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {event.description}
                          </Typography>
                        </>
                      )}
                    </>
                  )
                ) : null}
              </CardContent>
              
              {/* Action Buttons */}
              <Box sx={{ 
                p: 3, 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: 2,
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 40, 0.5)' 
                  : 'rgba(245, 245, 245, 0.7)'
              }}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Close />}
                      onClick={handleCancelEdit}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={!formData?.title.trim()}
                    >
                      {t("SaveChanges")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={handleShare}
                    >
                      {t("Share")}
                    </Button>
                    {userIdentity?.id === event?.organizer_id && (
                      <>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={handleDelete}
                        >
                          {t("Delete")}
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={handleEdit}
                        >
                          {t("Edit")}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Box>
            </Card>
          </Grid>
          
          {/* Sidebar Column */}
          {!isEditing && (
            <Grid item xs={12} md={4}>
              {/* Organizer Card */}
              <Card sx={{ 
                borderRadius: '16px', 
                mb: 4,
                p: 3,
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 40, 0.5)' 
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Person sx={{ mr: 1, fontSize: '1.2rem' }} />
                  {t("Organizer")}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ProfileAvatar profileId={event?.organizer_id || ""} />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      <ProfileName profileId={event?.organizer_id || ""} />
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                      <ProfileEmail profileId={event?.organizer_id || ""} />
                    </Typography>
                  </Box>
                </Box>
              </Card>
              
              {/* Related Events */}
              <Card sx={{ 
                borderRadius: '16px', 
                p: 3,
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 40, 0.5)' 
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Event sx={{ mr: 1, fontSize: '1.2rem' }} />
                  {t("SimilarEvents")}
                </Typography>
                
                <Stack spacing={2}>
                  {relatedEvents?.data.map((ev) => (
                    <Paper 
                      key={ev.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          cursor: 'pointer',
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                      onClick={() => router.push(`/events/${ev.id}`)}
                    >
                      <Typography 
                        variant="subtitle1" 
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {ev.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {formatDate(ev.start_time)}
                      </Typography>
                      <Chip 
                        label={ev.event_type} 
                        size="small"
                        color={ev.event_type === event?.event_type ? eventTypeColor() : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </Paper>
                  ))}
                  
                  {relatedEvents?.data.length === 0 && (
                    <Typography variant="body2" sx={{ 
                      textAlign: 'center', 
                      py: 2,
                      opacity: 0.7
                    }}>
                      {t("NoSimilarEvents")}
                    </Typography>
                  )}
                </Stack>
              </Card>

              {/* Add to Calendar */}
              <CanAccess resource="calendar" action="edit">
                <Card sx={{ 
                  borderRadius: '16px', 
                  mt: 4,
                  p: 3,
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(30, 30, 40, 0.5)' 
                    : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <CalendarToday sx={{ mr: 1, fontSize: '1.2rem' }} />
                    {t("AddToCalendar")} Coming Soon
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      mt: 1,
                      borderRadius: '8px',
                      py: 1.5,
                      fontWeight: 500
                    }}
                    onClick={() => alert('Calendar integration would go here')}
                  >
                    Google Calendar
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ 
                      mt: 2,
                      borderRadius: '8px',
                      py: 1.5,
                      fontWeight: 500,
                      backgroundColor: '#800080',
                      '&:hover': { backgroundColor: '#600060' }
                  }}
                    onClick={() => alert('Calendar integration would go here')}
                  >
                    Outlook
                  </Button>
                </Card>
              </CanAccess>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default EventShowPage;