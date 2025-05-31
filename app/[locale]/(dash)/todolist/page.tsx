"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  ListItemSecondaryAction,
  Stack,
  Divider,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Checkbox,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Fab,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  InputAdornment,
  Menu,
  Badge,
  Avatar,
  useMediaQuery,
  Collapse
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  ExpandMore,
  Close,
  CheckCircle,
  RadioButtonUnchecked,
  Search,
  Sort,
  Star,
  StarBorder,
  Archive,
  ViewKanban,
  ViewList,
  Task,
  Repeat,
  EventRepeat,
} from "@mui/icons-material";
import { format, addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from 'date-fns';
import { useTheme } from "@mui/material/styles";
import { useGetIdentity, useOne, useUpdate, HttpError } from "@refinedev/core";

import { Priority, ViewMode, SortOption, ProfileSection, ProfileData, Recurrence, ProfileTask } from "@/types/ProfileTypes"; // Adjust the import path as necessary

const TASKS_PER_PAGE = 10;


export default function TasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  
  // Data fetching
  const { data: identity } = useGetIdentity<{ id: string }>();
  const userId = identity?.id ?? "";
  const { data, isLoading, isError } = useOne<ProfileData, HttpError>({
    resource: "profiles",
    id: userId,
    meta: { select: "*" },
  });

  // State management
  const [tasks, setTasks] = useState<ProfileTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTask, setEditingTask] = useState<ProfileTask | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTaskContent, setEditTaskContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [showCompleted, setShowCompleted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [dueDateFilter, setDueDateFilter] = useState<string>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence>({ type: 'none', interval: 1 });
  const [activeSection, setActiveSection] = useState<boolean>(false);
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [taskSection, setTaskSection] = useState<string>('all');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const { mutate: updateProfile } = useUpdate<ProfileData>();
  const profile = data?.data;

  // Available sections
  const availableSections: ProfileSection[] = useMemo(() => {
    const defaultSections: ProfileSection[] = [
      { id: "all", name: "All Tasks" },
      { id: "personal", name: "Personal" },
      { id: "archived", name: "Archived" },
    ];
    const customSections: ProfileSection[] = profile?.sections || [];
    const custom = customSections.filter(
      sec => !["all", "personal", "archived"].includes(sec.id)
    );
    return [...defaultSections, ...custom];
  }, [profile?.sections]);

  // Initialize tasks
  useEffect(() => {
    if (profile) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const updatedTasks = profile.tasks?.map(task => ({
        ...task,
        section: task.section || "all",
        priority: task.priority || 'medium',
        dueDate: task.dueDate || null,
        labels: task.labels || [],
        starred: task.starred || false,
        createdAt: task.createdAt || new Date().toISOString(),
        recurrence: task.recurrence || undefined,
        lastCompleted: task.lastCompleted || undefined,
        completed: task.lastCompleted === today
      })) || [];
      
      setTasks(updatedTasks);
    }
  }, [profile]);


  const updateTaskRecurrence = useCallback((id: string, newRecurrence: Recurrence) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { 
        ...task, 
        recurrence: newRecurrence.type !== 'none' ? newRecurrence : undefined
      } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
    showSnackbar(`Recurrence updated to ${newRecurrence.type}`);
  }, [tasks, profile?.id, updateProfile]);
  const calculateNextDueDate = (task: ProfileTask): string | null => {
    if (!task.recurrence || task.recurrence.type === 'none') return null;
    
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : now;
    const lastCompleted = task.lastCompleted ? new Date(task.lastCompleted) : now;
    let nextDate = new Date(lastCompleted);
    
    switch (task.recurrence.type) {
      case 'daily': nextDate = addDays(nextDate, task.recurrence.interval); break;
      case 'weekly': nextDate = addWeeks(nextDate, task.recurrence.interval); break;
      case 'monthly': 
        nextDate = addMonths(nextDate, task.recurrence.interval);
        if (task.recurrence.dayOfMonth) {
          const daysInMonth = new Date(
            nextDate.getFullYear(), 
            nextDate.getMonth() + 1, 
            0
          ).getDate();
          nextDate.setDate(Math.min(task.recurrence.dayOfMonth, daysInMonth));
        }
        break;
      case 'yearly': nextDate = addYears(nextDate, task.recurrence.interval); break;
    }
    
    if (task.recurrence.endDate && isAfter(nextDate, new Date(task.recurrence.endDate))) {
      return null;
    }
    
    return format(nextDate, 'yyyy-MM-dd');
  };
  // Reset daily tasks at midnight
  const resetDailyTasks = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const updatedTasks = tasks.map(task => {
      if (task.completed && task.lastCompleted !== today) {
        return {
          ...task,
          completed: false,
          lastCompleted: task.lastCompleted,
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
  }, [tasks, profile?.id, updateProfile]);

  useEffect(() => {
    const checkForDateChange = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetDailyTasks();
        tasks.forEach(task => calculateNextDueDate(task));
      }
    };

    const interval = setInterval(checkForDateChange, 60000);
    return () => clearInterval(interval);
  }, [resetDailyTasks, tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    let result = tasks.map(task => {
      const isCompletedToday = task.completed && task.lastCompleted === today;
      return {
        ...task,
        completed: isCompletedToday,
      };
    });
    
    // Apply filters
    if (sectionFilter !== 'all') result = result.filter(t => t.section === sectionFilter);
  
    
    if (searchQuery) result = result.filter(t => t.task.toLowerCase().includes(searchQuery.toLowerCase()));
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);
    
    if (dueDateFilter === 'today') {
      const today = format(new Date(), 'yyyy-MM-dd');
      result = result.filter(t => t.dueDate === today);
    } else if (dueDateFilter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(t => t.dueDate && t.dueDate < today && !t.completed);
    } else if (dueDateFilter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(t => t.dueDate && t.dueDate > today && !t.completed);
    }

    if (activeSection) {
      result = result.filter(t => t.active);
    }
    
    if (!showCompleted) {
      result = result.filter(t => !t.completed);
    }
    
    // Apply sorting
    if (sortOption === 'date') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      result.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    } else if (sortOption === 'dueDate') {
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }
    
    // Starred tasks first
    result.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
    
    return result;
  }, [tasks, activeSection, searchQuery, priorityFilter, dueDateFilter, showCompleted, sortOption, sectionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  // Task operations
  const addTask = useCallback(() => {
    if (!newTask.trim()) return;
    
    const newTaskItem: ProfileTask = {
      id: Date.now().toString(),
      task: newTask.trim(),
      section: taskSection,
      active: true,
      completed: false,
      priority: 'medium',
      dueDate: null,
      labels: [],
      starred: false,
      createdAt: new Date().toISOString(),
      recurrence: recurrence.type !== 'none' ? { ...recurrence } : undefined
    };

    const updatedTasks = [...tasks, newTaskItem];
    setTasks(updatedTasks);
    setNewTask("");
    setRecurrence({ type: 'none', interval: 1 });
    setShowRecurrenceOptions(false);
    
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });

    setCurrentPage(1);
    showSnackbar("Task added successfully!");
  }, [newTask, taskSection, tasks, profile?.id, updateProfile, recurrence]);

  const toggleTaskCompletion = useCallback((id: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    const updatedTasks = tasks.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !(task.completed && task.lastCompleted === today),
        section: task.section || "all",
        lastCompleted: task.completed && task.lastCompleted === today ? undefined : today
      } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
    showSnackbar(taskToUpdate.completed ? "Task marked as active" : "Task completed for today!");
  }, [tasks, profile?.id, updateProfile]);

  const toggleTaskStar = useCallback((id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, starred: !task.starred } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
  }, [tasks, profile?.id, updateProfile]);

  const toggleTaskActive = useCallback((id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, active: !task.active } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
  }, [tasks, profile?.id, updateProfile]);

  const openEditModal = useCallback((task: ProfileTask) => {
    setEditingTask(task);
    setEditTaskContent(task.task);
    setEditModalOpen(true);
  }, []);

  const saveEditedTask = useCallback(() => {
    if (!editingTask || !editTaskContent.trim()) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === editingTask.id ? { 
        ...t, 
        task: editTaskContent,
        recurrence: editingTask.recurrence
      } : t
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
    
    setEditModalOpen(false);
    showSnackbar("Task updated successfully!");
  }, [editingTask, editTaskContent, tasks, profile?.id, updateProfile]);

  const changeTaskSection = useCallback((id: string, newSectionId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { 
        ...task, 
        section: newSectionId,
      } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
    showSnackbar(`Task moved to ${availableSections.find(s => s.id === newSectionId)?.name || newSectionId}`);
  }, [tasks, profile?.id, updateProfile, availableSections]);

  const deleteTask = useCallback((id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });

    if (filteredTasks.length % TASKS_PER_PAGE === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
    showSnackbar("Task deleted successfully!");
  }, [tasks, profile?.id, updateProfile, filteredTasks.length, currentPage]);

  const updateTaskPriority = useCallback((id: string, priority: Priority) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, priority } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
    showSnackbar(`Priority updated to ${priority}`);
  }, [tasks, profile?.id, updateProfile]);

  const updateTaskDueDate = useCallback((id: string, dueDate: string | null) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, dueDate } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
    showSnackbar(`Due date ${dueDate ? 'updated' : 'removed'}`);
  }, [tasks, profile?.id, updateProfile]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Helper functions
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'error.main';
      case 'medium': return 'warning.main';
      case 'low': return 'success.main';
      default: return 'text.secondary';
    }
  };

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  }, []);
  
  const selectAllTasks = useCallback(() => {
    if (selectedTasks.length === paginatedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(paginatedTasks.map(t => t.id));
    }
  }, [paginatedTasks, selectedTasks.length]);
  
  const isTaskSelected = useCallback((taskId: string) => {
    return selectedTasks.includes(taskId);
  }, [selectedTasks]);


  // Recurrence selector component
  const RecurrenceSelector = ({ 
    recurrence, 
    onChange 
  }: { 
    recurrence: Recurrence, 
    onChange: (newRecurrence: Recurrence) => void 
  }) => {
    const handleTypeChange = (type: Recurrence['type']) => {
      onChange({
        type,
        interval: recurrence.interval,
        daysOfWeek: type === 'weekly' ? [new Date().getDay()] : undefined,
        dayOfMonth: type === 'monthly' ? new Date().getDate() : undefined,
        endDate: recurrence.endDate
      });
    };

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recurrence
        </Typography>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Recurrence Type</InputLabel>
          <Select
            value={recurrence.type}
            label="Recurrence Type"
            onChange={(e) => handleTypeChange(e.target.value as Recurrence['type'])}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>

        {recurrence.type !== 'none' && (
          <>
            <TextField
              label="Interval"
              type="number"
              size="small"
              value={recurrence.interval}
              onChange={(e) => onChange({
                ...recurrence,
                interval: Math.max(1, parseInt(e.target.value))
              })}
              sx={{ mb: 2 }}
              InputProps={{ inputProps: { min: 1 } }}
            />

            {recurrence.type === 'weekly' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Repeat on:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <Tooltip key={day} title={day}>
                      <Checkbox
                        checked={recurrence.daysOfWeek?.includes(index) || false}
                        onChange={(e) => {
                          const days = recurrence.daysOfWeek || [];
                          const newDays = e.target.checked 
                            ? [...days, index]
                            : days.filter(d => d !== index);
                          onChange({
                            ...recurrence,
                            daysOfWeek: newDays.length ? newDays : undefined
                          });
                        }}
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={<CheckCircle />}
                        size="small"
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}

            {recurrence.type === 'monthly' && (
              <TextField
                label="Day of Month"
                type="number"
                size="small"
                value={recurrence.dayOfMonth || new Date().getDate()}
                onChange={(e) => onChange({
                  ...recurrence,
                  dayOfMonth: Math.min(31, Math.max(1, parseInt(e.target.value)))
                })}
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 1, max: 31 } }}
              />
            )}

            <TextField
              label="End Date (optional)"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={recurrence.endDate || ''}
              onChange={(e) => onChange({
                ...recurrence,
                endDate: e.target.value || undefined
              })}
              fullWidth
            />
          </>
        )}
      </Box>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mt: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} />
      </Paper>
    );
  }

  // Error state
  if (isError) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'error.light' }}>
        <Typography color="error">
          Error loading tasks. Please try again later.
        </Typography>
      </Paper>
    );
  }

  function setTaskSections(sections: string): void {
    setTaskSection(sections);
    setSectionFilter(sections);
    setCurrentPage(1);
  }
  return (
    <>
      {/* Edit Task Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2
        }}>
          <Typography variant="h6" fontWeight={600}>
            Edit Task
          </Typography>
          <IconButton onClick={() => setEditModalOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            variant="outlined"
            value={editTaskContent}
            onChange={(e) => setEditTaskContent(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
          
          {editingTask && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={editingTask.priority}
                      onChange={(e) => updateTaskPriority(editingTask.id, e.target.value as Priority)}
                      label="Priority"
                    >
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Due Date"
                    InputLabelProps={{ shrink: true }}
                    value={editingTask.dueDate || ''}
                    onChange={(e) => updateTaskDueDate(editingTask.id, e.target.value || null)}
                  />
                </Grid>
              </Grid>

              <RecurrenceSelector 
                recurrence={editingTask.recurrence || { type: 'none', interval: 1 }}
                onChange={(newRecurrence) => {
                  setEditingTask({
                    ...editingTask,
                    recurrence: newRecurrence.type !== 'none' ? newRecurrence : undefined
                  });
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Button 
            onClick={() => setEditModalOpen(false)}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveEditedTask}
            variant="contained"
            disabled={!editTaskContent.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Tasks Component */}
      <Paper sx={{ 
        p: 2, 
        borderRadius: 2,
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Task sx={{ color: theme.palette.primary.main }} /> 
            Task Manager
          </Typography>

          {/* Views and Sort */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* List Veiw */}
            <Tooltip title="List View">
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            {/* KanBan View*/}
            <Tooltip title="Kanban View">
              <IconButton
                onClick={() => setViewMode('kanban')}
                color={viewMode === 'kanban' ? 'primary' : 'default'}
              >
                <ViewKanban />
              </IconButton>
            </Tooltip>
            {/* Sort By */}
            <Tooltip title="Sort By">            
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <Sort />
              </IconButton>
            </Tooltip>
            {/* Sort menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem 
                onClick={() => {
                  setSortOption('date');
                  setAnchorEl(null);
                }}
                selected={sortOption === 'date'}
              >
                Sort by Date
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  setSortOption('priority');
                  setAnchorEl(null);
                }}
                selected={sortOption === 'priority'}
              >
                Sort by Priority
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  setSortOption('dueDate');
                  setAnchorEl(null);
                }}
                selected={sortOption === 'dueDate'}
              >
                Sort by Due Date
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Filters and Search */}
        <Box 
          sx={{ 
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            bgcolor: 'background.paper',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center'
          }}
        >
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          
          {/* Active tasks toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={activeSection}
                onChange={(e) => {
                  setActiveSection(e.target.checked);
                }}
                color="primary"
              />
            }
            label="Active Tasks"
            sx={{ 
              ml: 0,
              '& .MuiTypography-root': {
                fontWeight: activeSection ? 600 : 'normal'
              }
            }}
          />
          
          {/* Other sections filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sections</InputLabel>
            <Select
              value={sectionFilter}
              label="Other Sections"
              onChange={(e) => {
                setSectionFilter(e.target.value as string);
                setCurrentPage(1);
              }}
            >
              {availableSections.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {section.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Priority filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          
          {/* Due date filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Due Date</InputLabel>
            <Select
              value={dueDateFilter}
              label="Due Date"
              onChange={(e) => setDueDateFilter(e.target.value as string)}
            >
              <MenuItem value="all">All Dates</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
            </Select>
          </FormControl>
          
          {/* Show completed toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                color="primary"
              />
            }
            label="Show Completed"
            sx={{ ml: 'auto' }}
          />
        </Box>

        {/* Add Task Form */}
        <Box sx={{ 
          mb: 3,
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="What needs to be done? (Press Enter to add)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
          
          {showRecurrenceOptions && (
            <Box sx={{ mt: 2 }}>
              <RecurrenceSelector 
                recurrence={recurrence}
                onChange={setRecurrence}
              />
            </Box>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1.5
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Make Recurring">
                <IconButton
                  size="small"
                  onClick={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
                  color={recurrence.type !== 'none' ? 'primary' : 'default'}
                >
                  <EventRepeat />
                </IconButton>
              </Tooltip>
              <Select
                value={sectionFilter}
                onChange={(e) => setTaskSections(e.target.value)}
                label="Section"
              >
                {availableSections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            
            <Button
              variant="contained"
              onClick={addTask}
              startIcon={<Add />}
              disabled={!newTask.trim()}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Add Task
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tasks Stats */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          bgcolor: 'background.default',
          borderRadius: 1,
          flexWrap: 'wrap',
          gap: 1
        }}>
          {/* Add this near the other filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Checkbox
              indeterminate={
                selectedTasks.length > 0 && 
                selectedTasks.length < paginatedTasks.length
              }
              checked={
                paginatedTasks.length > 0 && 
                selectedTasks.length === paginatedTasks.length
              }
              onChange={selectAllTasks}
              disabled={paginatedTasks.length === 0}
            />
            <Typography variant="body2" color="text.secondary">
              Select All
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Total: <strong>{filteredTasks.length}</strong> tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active: <strong>{filteredTasks.filter(t => t.active).length}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Starred: <strong>{filteredTasks.filter(t => t.starred).length}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overdue: <strong>{
              filteredTasks.filter(t => 
                t.dueDate && 
                isBefore(new Date(t.dueDate), new Date()) && 
                !t.completed
              ).length
            }</strong>
          </Typography>
        </Box>

        {/* Bulk Actions Toolbar */}
        {selectedTasks.length > 0 && (
          <Paper elevation={2} sx={{ 
            position: 'sticky',
            top: 0,
            zIndex: 10,
            mb: 2,
            p: 1,
            bgcolor: 'primary.main',
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="subtitle2">
              {selectedTasks.length} selected
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Move selected">
                <IconButton 
                  size="small" 
                  color="inherit"
                  onClick={() => {
                    // Implement move logic here
                    const newSection = prompt("Enter section ID to move to:");
                    if (newSection) {
                      const updatedTasks = tasks.map(task => 
                        selectedTasks.includes(task.id) 
                          ? { ...task, section: newSection } 
                          : task
                      );
                      setTasks(updatedTasks);
                      updateProfile({
                        resource: "profiles",
                        id: profile?.id || "",
                        values: { tasks: updatedTasks },
                      });
                      setSelectedTasks([]);
                      showSnackbar(`Moved ${selectedTasks.length} tasks`);
                    }
                  }}
                >
                  <Archive fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete selected">
                <IconButton 
                  size="small" 
                  color="inherit"
                  onClick={() => {
                    if (confirm(`Delete ${selectedTasks.length} tasks?`)) {
                      const updatedTasks = tasks.filter(t => !selectedTasks.includes(t.id));
                      setTasks(updatedTasks);
                      updateProfile({
                        resource: "profiles",
                        id: profile?.id || "",
                        values: { tasks: updatedTasks },
                      });
                      setSelectedTasks([]);
                      showSnackbar(`Deleted ${selectedTasks.length} tasks`);
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Clear selection">
                <IconButton 
                  size="small" 
                  color="inherit"
                  onClick={() => setSelectedTasks([])}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        )}

        {/* Tasks List or Kanban */}
        {filteredTasks.length > 0 ? (
          viewMode === 'list' ? (
            <>
              <List sx={{ 
                '& .MuiListItem-root': {
                  px: 0,
                  py: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:last-child': { borderBottom: 'none' }
                }
              }}>
                {paginatedTasks.map((task) => {
                  const isCompletedToday = task.completed;
                  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isCompletedToday;
                  
                  return (
                    <React.Fragment key={task.id}>
                    <ListItem
                      sx={{
                        bgcolor: expandedTask === task.id ? 'action.hover' : 'background.paper',
                        transition: 'background-color 0.2s ease',
                        borderRadius: 1,
                        borderLeft: isTaskSelected(task.id) 
                          ? `4px solid ${theme.palette.primary.main}`
                          : 'none'
                      }}
                    >
                      <Checkbox
                        checked={isTaskSelected(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        sx={{ mr: 1 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <IconButton
                          onClick={() => toggleTaskStar(task.id)}
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          {task.starred ? (
                            <Star color="warning" />
                          ) : (
                            <StarBorder />
                          )}
                        </IconButton>
                        <IconButton
                          onClick={() => toggleTaskActive(task.id)}
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          {task.active ? (
                            <Star color="success" />
                          ) : (
                            <StarBorder />
                          )}
                        </IconButton>
                      </Box>
                      
                      <IconButton
                        onClick={() => toggleTaskCompletion(task.id)}
                        sx={{ mr: 1 }}
                      >
                        {isCompletedToday ? (
                          <CheckCircle color="success" />
                        ) : (
                          <RadioButtonUnchecked />
                        )}
                      </IconButton>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography
                              sx={{ 
                                textDecoration: isCompletedToday ? 'line-through' : 'none',
                                color: isCompletedToday ? 'text.secondary' : 'text.primary',
                                whiteSpace: 'pre-line',
                                fontWeight: task.starred ? 600 : 'normal'
                              }}
                            >
                              {task.task}
                              {task.recurrence?.type !== 'none' && (
                                <Tooltip title={`Recurring: ${task.recurrence?.type} (every ${task.recurrence?.interval})`}>
                                  <Repeat fontSize="small" sx={{ 
                                    color: 'text.secondary',
                                    ml: 1,
                                    verticalAlign: 'middle'
                                  }} />
                                </Tooltip>
                              )}
                            </Typography>
                            {task.dueDate && (
                              <Chip
                                size="small"
                                label={`Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`}
                                sx={{ 
                                  mt: 0.5,
                                  bgcolor: isOverdue 
                                    ? 'error.light' 
                                    : 'primary.light',
                                  color: 'common.white'
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip 
                              label={availableSections.find(s => s.id === task.section)?.name || 'Uncategorized'}
                              size="small"
                              sx={{ 
                                bgcolor: task.section === 'archived' 
                                  ? 'grey.100' 
                                  : task.section === 'completed'
                                    ? 'success.light'
                                    : task.section === 'active'
                                      ? 'primary.light'
                                      : 'secondary.light',
                                color: task.section === 'archived' 
                                  ? 'text.secondary' 
                                  : 'common.white'
                              }}
                            />
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{ 
                                bgcolor: getPriorityColor(task.priority),
                                color: 'common.white'
                              }}
                            />
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                          <IconButton 
                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                            size="small"
                          >
                            <ExpandMore sx={{ 
                              transform: expandedTask === task.id ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s'
                            }} />
                          </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>

                    <Collapse in={expandedTask === String(task.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ 
                        pl: 9, // Align with the star icon
                        pr: 2, 
                        py: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        mb: 1
                      }}>
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Move to</InputLabel>
                            <Select
                              value={task.section}
                              onChange={(e) => changeTaskSection(String(task.id), e.target.value as string)}
                              label="Move to"
                            >
                              {availableSections.map((section) => (
                                <MenuItem key={section.id} value={section.id}>
                                  {section.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <Stack direction="row" spacing={1}>                            
                            <IconButton 
                              onClick={() => openEditModal(task)}
                              size="small"
                              sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            
                            <IconButton 
                              onClick={() => deleteTask(task.id)}
                              size="small"
                              sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                  bgcolor: 'error.light',
                                  color: 'error.contrastText'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Box>
                      </Box>
                    </Collapse>
                  </React.Fragment>
                  );
                })}
              </List>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: 3,
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    shape="rounded"
                    color="primary"
                    size="large"
                    sx={{ '& .MuiPaginationItem-root': { fontWeight: 500 } }}
                  />
                </Box>
              )}
            </>
          ) : (
            // Kanban View
            <Grid container spacing={2}>
              {/* Active tasks column */}
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ 
                    bgcolor: 'primary.light',
                    color: 'common.white',
                    py: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Active
                      </Typography>
                      <Chip 
                        label={filteredTasks.filter(t => t.section === 'active').length}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'inherit'
                        }}
                      />
                    </Box>
                  </CardContent>
                  
                  <CardContent sx={{ 
                    p: 0,
                    height: isMobile ? 'auto' : 'calc(100vh - 400px)',
                    overflowY: 'auto',
                    minHeight: 200
                  }}>
                    {filteredTasks.filter(t => t.section === 'active').length > 0 ? (
                      filteredTasks
                        .filter(t => t.section === 'active')
                        .map((task) => (
                          <TaskCard 
                            key={task.id}
                            task={task}
                            onToggleCompletion={toggleTaskCompletion}
                            onToggleStar={toggleTaskStar}
                            onToggleActive={toggleTaskActive}
                            onEdit={openEditModal}
                            onDelete={deleteTask}
                            getPriorityColor={getPriorityColor}
                            availableSections={availableSections}
                          />
                        ))
                    ) : (
                      <EmptySection message="No active tasks" />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Other sections */}
              {availableSections
                .filter(s => s.id !== 'all' && s.id !== 'active')
                .map((section) => {
                  const sectionTasks = filteredTasks.filter(t => t.section === section.id);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={section.id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ 
                          bgcolor: section.id === 'completed'
                            ? 'success.light'
                            : section.id === 'archived'
                              ? 'grey.100'
                              : 'secondary.light',
                          color: section.id === 'archived' ? 'text.primary' : 'common.white',
                          py: 1,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {section.name}
                            </Typography>
                            <Chip 
                              label={sectionTasks.length}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'inherit'
                              }}
                            />
                          </Box>
                        </CardContent>
                        
                        <CardContent sx={{ 
                          p: 0,
                          height: isMobile ? 'auto' : 'calc(100vh - 400px)',
                          overflowY: 'auto',
                          minHeight: 200
                        }}>
                          {sectionTasks.length > 0 ? (
                            sectionTasks.map((task) => (
                              <TaskCard 
                                key={task.id}
                                task={task}
                                onToggleCompletion={toggleTaskCompletion}
                                onToggleStar={toggleTaskStar}
                                onToggleActive={toggleTaskActive}
                                onEdit={openEditModal}
                                onDelete={deleteTask}
                                getPriorityColor={getPriorityColor}
                                availableSections={availableSections}
                              />
                            ))
                          ) : (
                            <EmptySection message={`No tasks in ${section.name}`} />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          )
        ) : (
          <EmptyState 
            searchQuery={searchQuery}
            activeSection={activeSection}
            sectionFilter={sectionFilter}
            availableSections={availableSections}
            onResetFilters={() => {
              setNewTask('');
              setActiveSection(true);
              setSectionFilter('all');
              setSearchQuery('');
            }}
          />
        )}
      </Paper>
      
      {/* Quick Add FAB */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => {
          addTask()
        }}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
        }}
      >
        <Add />
      </Fab>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={10000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

// Sub-components
function TaskCard({
  task,
  onToggleCompletion,
  onToggleStar,
  onToggleActive,
  onEdit,
  onDelete,
  getPriorityColor,
  availableSections
}: {
  task: ProfileTask;
  onToggleCompletion: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleActive: (id: string) => void;
  onEdit: (task: ProfileTask) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: Priority) => string;
  availableSections: ProfileSection[];
}) {
  const theme = useTheme();
  const isCompletedToday = task.completed;
  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isCompletedToday;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        m: 1,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        '&:hover': { boxShadow: 1 }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        mb: 1
      }}>
        <IconButton
          onClick={() => onToggleStar(task.id)}
          size="small"
        >
          {task.starred ? (
            <Star color="warning" fontSize="small" />
          ) : (
            <StarBorder fontSize="small" />
          )}
        </IconButton>
        <IconButton
          onClick={() => onToggleActive(task.id)}
          size="small"
        >
          {task.active ? (
            <Star color="success" fontSize="small" />
          ) : (
            <StarBorder fontSize="small" />
          )}
        </IconButton>
        
        
        <Box>
          <IconButton
            onClick={() => onToggleCompletion(task.id)}
            size="small"
          >
            {isCompletedToday ? (
              <CheckCircle color="success" fontSize="small" />
            ) : (
              <RadioButtonUnchecked fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>
      
      <Typography
        sx={{ 
          textDecoration: isCompletedToday ? 'line-through' : 'none',
          color: isCompletedToday ? 'text.secondary' : 'text.primary',
          mb: 1
        }}
      >
        {task.task}
        {task.recurrence?.type !== 'none' && (
          <Tooltip title={`Recurring: ${task.recurrence?.type} (every ${task.recurrence?.interval})`}>
            <Repeat fontSize="small" sx={{ 
              color: 'text.secondary',
              ml: 1,
              verticalAlign: 'middle'
            }} />
          </Tooltip>
        )}
      </Typography>
      
      {task.dueDate && (
        <Chip
          size="small"
          label={`Due: ${format(new Date(task.dueDate), 'MMM dd')}`}
          sx={{ 
            mr: 1,
            mb: 1,
            bgcolor: isOverdue 
              ? 'error.light' 
              : 'primary.light',
            color: 'common.white'
          }}
        />
      )}
      
      <Chip
        label={task.priority}
        size="small"
        sx={{ 
          bgcolor: getPriorityColor(task.priority),
          color: 'common.white'
        }}
      />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        mt: 1,
        gap: 0.5
      }}>
        <IconButton 
          onClick={() => onEdit(task)}
          size="small"
        >
          <Edit fontSize="small" />
        </IconButton>
        
        <IconButton 
          onClick={() => onDelete(task.id)}
          size="small"
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <Box sx={{ 
      p: 3, 
      textAlign: 'center',
      color: 'text.secondary'
    }}>
      <Typography variant="body2">
        {message}
      </Typography>
    </Box>
  );
}

function EmptyState({
  searchQuery,
  activeSection,
  sectionFilter,
  availableSections,
  onResetFilters
}: {
  searchQuery: string;
  activeSection: boolean;
  sectionFilter: string;
  availableSections: ProfileSection[];
  onResetFilters: () => void;
}) {
  return (
    <Box sx={{ 
      p: 4, 
      textAlign: 'center',
      bgcolor: 'background.default',
      borderRadius: 2
    }}>
      <Typography variant="body1" color="text.secondary">
        {searchQuery 
          ? "No tasks match your search criteria." 
          : activeSection 
            ? "You don't have any active tasks yet." 
            : `No tasks in ${availableSections.find(s => s.id === sectionFilter)?.name || 'this section'}.`}
      </Typography>
      <Button 
        variant="text" 
        onClick={onResetFilters}
        sx={{ mt: 1 }}
      >
        Create your first task
      </Button>
    </Box>
  );
}