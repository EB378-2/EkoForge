"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
  Avatar,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Divider,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Tooltip
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Check,
  Close,
  Event,
  Article,
  Note,
  AccessTime,
  Category,
  MoreVert,
  Work,
  Person,
  Archive,
  CheckCircle,
  RadioButtonUnchecked
} from "@mui/icons-material";
import { useTheme } from "@hooks/useTheme";
import VerseOfTheDay from "@components/(EkoDash)/VerseOfTheDay";
import { useGetIdentity } from "@refinedev/core";
import { ProfileName, ProfileAvatar } from "@components/functions/FetchFunctions";
import { MarkdownField } from "@refinedev/mui";
import QuickNote from "@components/(EkoDash)/Profile/QuickNote";
import NoteComponent from "@components/(EkoDash)/Profile/Notes";
import TaskComponent from "@components/(EkoDash)/Profile/TodoList";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  section: string;
}

interface Note {
  id: number;
  text: string;
  section: string;
}

interface Section {
  id: string;
  name: string;
}

export default function ForgeDashboard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: identityData } = useGetIdentity<{ id: string }>();
  
  // State for editable note
  const [quickNote, setQuickNote] = useState("Add your quick notes here...");
  const [isEditingQuickNote, setIsEditingQuickNote] = useState(false);
  const [tempQuickNote, setTempQuickNote] = useState(quickNote);
  
  // State for todo list and notes system
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newNote, setNewNote] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const [noteFilter, setNoteFilter] = useState("all");
  const [newSectionName, setNewSectionName] = useState("");
  
  // Define default sections
  const defaultSections: Section[] = [
    { id: "all", name: "All" },
    { id: "active", name: "Active" },
    { id: "archived", name: "Archived" },
    { id: "work", name: "Work" },
    { id: "personal", name: "Personal" }
  ];
  
  const [customSections, setCustomSections] = useState<Section[]>([]);
  const availableSections = [...defaultSections, ...customSections];
  
  // Current time state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Section handlers
  const addNewSection = () => {
    if (newSectionName.trim()) {
      const newSection: Section = {
        id: newSectionName.trim().toLowerCase().replace(/\s+/g, '-'),
        name: newSectionName.trim()
      };
      setCustomSections([...customSections, newSection]);
      setNewSectionName("");
    }
  };
  
  const deleteSection = (id: string) => {
    // Don't allow deletion of default sections
    if (defaultSections.some(section => section.id === id)) return;
    
    // Move tasks and notes from this section to 'active'
    setTasks(tasks.map(task => 
      task.section === id ? { ...task, section: "active" } : task
    ));
    setNotes(notes.map(note => 
      note.section === id ? { ...note, section: "active" } : note
    ));
    
    setCustomSections(customSections.filter(section => section.id !== id));
  };
  
  // Filter tasks and notes based on selected filter
  const filteredTasks = taskFilter === "all" 
    ? tasks 
    : tasks.filter(task => task.section === taskFilter);
  
  const filteredNotes = noteFilter === "all" 
    ? notes 
    : notes.filter(note => note.section === noteFilter);

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 },
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)' 
        : 'linear-gradient(45deg, #f5f7fa 30%, #e4e8f0 90%)',
      minHeight: '100vh'
    }}>
      {/* Main Grid Layout */}
      <Grid container spacing={3}>
        {/* Left Column - Profile and Verse */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Profile Card */}
            <Card sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                : 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: theme.shadows[6]
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <ProfileAvatar 
                    profileId={identityData?.id || ""} 
                  />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Welcome back, <br/><ProfileName profileId={identityData?.id || ""} />
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.9 }}>
                  {formattedDate}
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<Event />}
                    sx={{
                      borderRadius: 20,
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Events
                  </Button>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.5)',
                      borderRadius: 20,
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                    startIcon={<Article />}
                  >
                    Posts
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Verse of the Day */}
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              background: theme.palette.background.paper
            }}>
              <CardHeader 
                title="Verse of the Day" 
                titleTypographyProps={{ 
                  variant: 'h6',
                  color: 'text.primary',
                  fontWeight: 500 
                }}
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  pb: 1
                }}
              />
              <CardContent>
                <VerseOfTheDay />
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        
        {/* Middle Column - Time and Quick Note */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Time Card */}
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)'
                : 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)'
            }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 1
                }}>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 500
                  }}>
                    <AccessTime sx={{ mr: 1, color: theme.palette.mode === 'dark' ? 'white' : 'primary.dark' }} />
                    Current Time
                  </Typography>
                </Box>
                <Box sx={{ 
                  textAlign: 'center',
                  py: 2
                }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 300,
                    letterSpacing: 1,
                    color: theme.palette.mode === 'dark' ? 'white' : 'text.primary'
                  }}>
                    {formattedTime}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ 
                    mt: 1,
                    color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                  }}>
                    {formattedDate}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Quick Note */}
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              background: theme.palette.background.paper
            }}>
              <CardHeader 
                title="Quick Note" 
                titleTypographyProps={{ 
                  variant: 'h6',
                  color: 'text.primary',
                  fontWeight: 500 
                }}
                action={
                  <Tooltip title="Edit note">
                    <IconButton onClick={() => setIsEditingQuickNote(!isEditingQuickNote)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  pb: 1
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <QuickNote/>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        
        {/* Right Column - Upcoming Events */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            height: '100%',
            background: theme.palette.background.paper
          }}>
            <CardHeader 
              title="Upcoming Events" 
              titleTypographyProps={{ 
                variant: 'h6',
                color: 'text.primary',
                fontWeight: 500 
              }}
              action={
                <Tooltip title="Add event">
                  <IconButton>
                    <Add />
                  </IconButton>
                </Tooltip>
              }
              sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1
              }}
            />
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100% - 60px)',
                textAlign: 'center'
              }}>
                <Event sx={{ 
                  fontSize: 60, 
                  color: theme.palette.text.disabled,
                  mb: 2
                }} />
                <Typography variant="body1" color="text.secondary">
                  No upcoming events scheduled
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    mt: 3,
                    borderRadius: 20,
                    px: 3,
                    textTransform: 'none'
                  }}
                  startIcon={<Add />}
                >
                  Create New Event
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Second Row - Tasks and Notes */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Task List */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            background: theme.palette.background.paper
          }}>
            <CardHeader 
              title="Tasks" 
              titleTypographyProps={{ 
                variant: 'h6',
                color: 'text.primary',
                fontWeight: 500 
              }}
              sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1
              }}
            />
            <CardContent>
              <TaskComponent/>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Notes Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            background: theme.palette.background.paper
          }}>
            <CardHeader 
              title="Notes" 
              titleTypographyProps={{ 
                variant: 'h6',
                color: 'text.primary',
                fontWeight: 500 
              }}
              sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1
              }}
            />
            <CardContent>
              <NoteComponent/>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Third Row - Section Management */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            background: theme.palette.background.paper
          }}>
            <CardHeader 
              title="Manage Sections" 
              titleTypographyProps={{ 
                variant: 'h6',
                color: 'text.primary',
                fontWeight: 500 
              }}
              avatar={<Category />}
              sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1
              }}
            />
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 2
              }}>
                <TextField
                  fullWidth
                  label="New section name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewSection()}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  variant="contained" 
                  onClick={addNewSection}
                  startIcon={<Add />}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    px: 3,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Add Section
                </Button>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                '& .MuiChip-root': {
                  borderRadius: 1
                }
              }}>
                {availableSections.map((section) => (
                  <Chip
                    key={section.id}
                    label={section.name}
                    onDelete={
                      defaultSections.some(s => s.id === section.id) 
                        ? undefined 
                        : () => deleteSection(section.id)
                    }
                    color={
                      section.id === "all" ? "primary" : 
                      section.id === "active" ? "success" : 
                      section.id === "archived" ? "secondary" : "default"
                    }
                    variant={section.id === taskFilter || section.id === noteFilter ? "filled" : "outlined"}
                    onClick={() => {
                      setTaskFilter(section.id);
                      setNoteFilter(section.id);
                    }}
                    icon={
                      section.id === "work" ? <Work fontSize="small" /> :
                      section.id === "personal" ? <Person fontSize="small" /> :
                      section.id === "archived" ? <Archive fontSize="small" /> :
                      section.id === "active" ? <CheckCircle fontSize="small" /> : undefined
                    }
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}