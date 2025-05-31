"use client";

import React, { useState } from "react";
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
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Checkbox
} from "@mui/material";
import {
  useGetIdentity,
  useOne,
  useUpdate,
  HttpError,
} from "@refinedev/core";
import { Edit, Delete, Add, ExpandMore, Article, Close, CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import { MarkdownField } from "@refinedev/mui";
import { ProfileData, ProfileTask, ProfileSection } from "@/types/miscTypes";

const TASKS_PER_PAGE = 5;

export default function TasksComponent() {
  const theme = useTheme();
  
  // Get the current user's identity
  const { data: identity } = useGetIdentity<{ id: string }>();
  const userId = identity?.id ?? "";

  // Fetch the profile data
  const { data, isLoading, isError } = useOne<ProfileData, HttpError>({
    resource: "profiles",
    id: userId,
    meta: { select: "*" },
  });

  // Hook for updating the profile
  const { mutate: updateProfile } = useUpdate<ProfileData>();

  // State management
  const [tasks, setTasks] = useState<ProfileTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [taskFilter, setTaskFilter] = useState<string>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTask, setEditingTask] = useState<ProfileTask | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTaskContent, setEditTaskContent] = useState("");

  // Profile data
  const profile = data?.data;
  
  // Available sections
  const availableSections: ProfileSection[] = React.useMemo(() => {
    const defaultSections: ProfileSection[] = [
      { id: "all", name: "All Tasks" },
      { id: "active", name: "Active" },
      { id: "completed", name: "Completed" },
      { id: "archived", name: "Archived" },
    ];
    const customSections: ProfileSection[] = profile?.sections || [];
    const custom = customSections.filter(
      sec => !["active", "all", "completed", "archived"].includes(sec.id)
    );
    return [...defaultSections, ...custom];
  }, [profile?.sections]);

  // Initialize tasks when profile loads
  React.useEffect(() => {
    if (profile) {
      setTasks(
        profile.tasks?.map(task => ({
          ...task,
          section: task.section || "active",
        })) || []
      );
    }
  }, [profile]);

  // Task CRUD operations
  const addTask = () => {
    if (!newTask.trim()) return;
    
    const newTaskItem: ProfileTask = {
      id: Date.now().toString(),
      task: newTask.trim(),
      section: "all", // Always add new tasks as active
      completed: false,
      priority: "low",
      createdAt: Date.now().toString(),
      dueDate: null, // Default value for dueDate
      labels: [], // Default value for labels
      starred: false,
      active: true
    };

    const updatedTasks = [...tasks, newTaskItem];
    setTasks(updatedTasks);
    setNewTask("");
    
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });

    // Reset to first page when adding new task
    setCurrentPage(1);
  };

  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        section: task.completed ? "active" : "completed"
      } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
  };

  const openEditModal = (task: ProfileTask) => {
    setEditingTask(task);
    setEditTaskContent(task.task);
    setEditModalOpen(true);
  };

  const saveEditedTask = () => {
    if (!editingTask || !editTaskContent.trim()) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === editingTask.id ? { ...t, task: editTaskContent } : t
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
    
    setEditModalOpen(false);
    setEditingTask(null);
  };

  const changeTaskSection = (id: string, newSectionId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { 
        ...task, 
        section: newSectionId,
        completed: newSectionId === "completed" ? true : task.completed
      } : task
    );
    
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });
  };

  const deleteTask = (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { tasks: updatedTasks },
    });

    // Adjust page if we deleted the last task on the page
    if (filteredTasks.length % TASKS_PER_PAGE === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter tasks based on selected section
  const filteredTasks = taskFilter === "all" 
    ? tasks 
    : tasks.filter(t => t.section === taskFilter);

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          />
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
        p: 3, 
        borderRadius: 2,
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Article sx={{ mr: 1, color: theme.palette.primary.main }} /> 
            Task Manager
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by</InputLabel>
            <Select
              value={taskFilter}
              label="Filter by"
              onChange={(e) => {
                setTaskFilter(e.target.value as string);
                setCurrentPage(1); // Reset to first page when changing filter
              }}
              sx={{ 
                borderRadius: 2,
                '& .MuiSelect-select': {
                  py: 1.2
                }
              }}
            >
              {availableSections.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            placeholder="What needs to be done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            mt: 1.5
          }}>
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

        {/* Tasks List */}
        {filteredTasks.length > 0 ? (
          <>
            <List sx={{ 
              '& .MuiListItem-root': {
                px: 0,
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}>
              {paginatedTasks.map((task) => (
                <ListItem key={task.id} dense>
                  <IconButton
                    onClick={() => toggleTaskCompletion(task.id)}
                    sx={{ mr: 1 }}
                  >
                    {task.completed ? (
                      <CheckCircle color="success" />
                    ) : (
                      <RadioButtonUnchecked />
                    )}
                  </IconButton>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{ 
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.secondary' : 'text.primary',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {task.task}
                      </Typography>
                    }
                    secondary={
                      <Chip 
                        label={availableSections.find(s => s.id === task.section)?.name || 'Uncategorized'}
                        size="small"
                        sx={{ 
                          mt: 1,
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
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={task.section}
                          onChange={(e) => changeTaskSection(task.id, e.target.value as string)}
                          IconComponent={ExpandMore}
                          sx={{
                            borderRadius: 2,
                            '& .MuiSelect-select': {
                              py: 0.8,
                              fontSize: '0.875rem'
                            }
                          }}
                        >
                          {availableSections.filter(s => s.id !== 'all').map((section) => (
                            <MenuItem key={section.id} value={section.id}>
                              {section.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton 
                        onClick={() => openEditModal(task)}
                        size="small"
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
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
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
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
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: 'background.default',
            borderRadius: 2
          }}>
            <Typography variant="body1" color="text.secondary">
              {taskFilter === 'all' 
                ? "You don't have any tasks yet." 
                : `No tasks in ${availableSections.find(s => s.id === taskFilter)?.name || 'this section'}.`}
            </Typography>
            <Button 
              variant="text" 
              onClick={() => setNewTask('')}
              sx={{ mt: 1 }}
            >
              Create your first task
            </Button>
          </Box>
        )}
      </Paper>
    </>
  );
}