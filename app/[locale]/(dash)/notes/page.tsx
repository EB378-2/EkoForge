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
  useMediaQuery,
  Collapse
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  ExpandMore,
  Close,
  Search,
  Sort,
  Star,
  StarBorder,
  Archive,
  ViewKanban,
  ViewList,
  Task,
} from "@mui/icons-material";
import { format } from 'date-fns';
import { useTheme } from "@mui/material/styles";
import { DeleteButton, EditButton } from "@refinedev/mui";
import { useGetIdentity, useOne, useUpdate, HttpError } from "@refinedev/core";

import { Priority, ViewMode, SortOption, ProfileSection, ProfileData, ProfileNote } from "@/types/ProfileTypes"; // Adjust the import path as necessary

const TASKS_PER_PAGE = 10;


export default function NotesPage() {
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
  const [notes, setNotes] = useState<ProfileNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingNote, setEditingNote] = useState<ProfileNote | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<boolean>(false);
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [noteSection, setNoteSection] = useState<string>('all');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  const { mutate: updateProfile } = useUpdate<ProfileData>();
  const profile = data?.data;

  // Available sections
  const availableSections: ProfileSection[] = useMemo(() => {
    const defaultSections: ProfileSection[] = [
      { id: "all", name: "All Notes" },
      { id: "personal", name: "Personal" },
      { id: "archived", name: "Archived" },
    ];
    const customSections: ProfileSection[] = profile?.sections || [];
    const custom = customSections.filter(
      sec => !["all", "personal", "archived"].includes(sec.id)
    );
    return [...defaultSections, ...custom];
  }, [profile?.sections]);

  // Initialize notes
  useEffect(() => {
    if (profile) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const updatedNotes = profile.notes?.map(note => ({
        ...note,
        section: note.section || "all",
        priority: note.priority || 'medium',
        labels: note.labels || [],
        starred: note.starred || false,
        createdAt: note.createdAt || new Date().toISOString(),
      })) || [];
      
      setNotes(updatedNotes);
    }
  }, [profile]);


  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = notes;
    
    // Apply filters
    if (sectionFilter !== 'all') result = result.filter(t => t.section === sectionFilter);
    if (searchQuery) result = result.filter(t => t.note.toLowerCase().includes(searchQuery.toLowerCase()));
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);
    if (activeSection) {
      result = result.filter(t => t.active);
    }
    
    // Apply sorting
    if (sortOption === 'date') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      result.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    }
    
    // Starred notes first
    result.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
    
    return result;
  }, [notes, activeSection, searchQuery, priorityFilter, sortOption, sectionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / TASKS_PER_PAGE);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  // Note operations
  const addNote = useCallback(() => {
    if (!newNote.trim()) return;
    
    const newNoteItem: ProfileNote = {
      id: Date.now().toString(),
      note: newNote.trim(),
      section: noteSection,
      active: true,
      priority: 'medium',
      labels: [],
      starred: false,
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [...notes, newNoteItem];
    setNotes(updatedNotes);
    setNewNote("");
    
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { notes: updatedNotes },
    });

    setCurrentPage(1);
    showSnackbar("Note added successfully!");
  }, [newNote, noteSection, notes, profile?.id, updateProfile]);

  const toggleNoteStar = useCallback((id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, starred: !note.starred } : note
    );
    
    setNotes(updatedNotes);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { notes: updatedNotes },
    });
  }, [notes, profile?.id, updateProfile]);

  const toggleNoteActive = useCallback((id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, active: !note.active } : note
    );
    
    setNotes(updatedNotes);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { notes: updatedNotes },
    });
  }, [notes, profile?.id, updateProfile]);

  const changeNoteSection = useCallback((id: string, newSectionId: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { 
        ...note, 
        section: newSectionId,
      } : note
    );
    
    setNotes(updatedNotes);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { notes: updatedNotes },
    });
    showSnackbar(`Note moved to ${availableSections.find(s => s.id === newSectionId)?.name || newSectionId}`);
  }, [notes, profile?.id, updateProfile, availableSections]);

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

  const getFirstLine = (text: string) => {
    return text.split('\n')[0].substring(0, 100); // Limit to 100 chars
  };

  const toggleNoteSelection = useCallback((noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId) 
        : [...prev, noteId]
    );
  }, []);
  
  const selectAllNotes = useCallback(() => {
    if (selectedNotes.length === paginatedNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(paginatedNotes.map(t => t.id));
    }
  }, [paginatedNotes, selectedNotes.length]);
  
  const isNoteSelected = useCallback((noteId: string) => {
    return selectedNotes.includes(noteId);
  }, [selectedNotes]);


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
          Error loading notes. Please try again later.
        </Typography>
      </Paper>
    );
  }

  function setNoteSections(sections: string): void {
    setNoteSection(sections);
    setSectionFilter(sections);
    setCurrentPage(1);
  }
  return (
    <>
      {/* Main Notes Component */}
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
            Note Manager
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
            placeholder="Search notes..."
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
          
          {/* Active notes toggle */}
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
            label="Active Notes"
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
        </Box>

        {/* Add Note Form */}
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
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1.5
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Select
                value={sectionFilter}
                onChange={(e) => setNoteSections(e.target.value)}
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
              onClick={addNote}
              startIcon={<Add />}
              disabled={!newNote.trim()}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Add Note
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Notes Stats */}
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
                selectedNotes.length > 0 && 
                selectedNotes.length < paginatedNotes.length
              }
              checked={
                paginatedNotes.length > 0 && 
                selectedNotes.length === paginatedNotes.length
              }
              onChange={selectAllNotes}
              disabled={paginatedNotes.length === 0}
            />
            <Typography variant="body2" color="text.secondary">
              Select All
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Total: <strong>{filteredNotes.length}</strong> notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active: <strong>{filteredNotes.filter(t => t.active).length}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Starred: <strong>{filteredNotes.filter(t => t.starred).length}</strong>
          </Typography>
        </Box>

        {/* Bulk Actions Toolbar */}
        {selectedNotes.length > 0 && (
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
              {selectedNotes.length} selected
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
                      const updatedNotes = notes.map(note => 
                        selectedNotes.includes(note.id) 
                          ? { ...note, section: newSection } 
                          : note
                      );
                      setNotes(updatedNotes);
                      updateProfile({
                        resource: "profiles",
                        id: profile?.id || "",
                        values: { notes: updatedNotes },
                      });
                      setSelectedNotes([]);
                      showSnackbar(`Moved ${selectedNotes.length} notes`);
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
                    if (confirm(`Delete ${selectedNotes.length} notes?`)) {
                      const updatedNotes = notes.filter(t => !selectedNotes.includes(t.id));
                      setNotes(updatedNotes);
                      updateProfile({
                        resource: "profiles",
                        id: profile?.id || "",
                        values: { notes: updatedNotes },
                      });
                      setSelectedNotes([]);
                      showSnackbar(`Deleted ${selectedNotes.length} notes`);
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
                  onClick={() => setSelectedNotes([])}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        )}

        {/* Notes List or Kanban */}
        {filteredNotes.length > 0 ? (
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
                {paginatedNotes.map((note) => {

                  return (
                    <React.Fragment key={note.id}>
                    <ListItem
                      sx={{
                        bgcolor: expandedNote === note.id ? 'action.hover' : 'background.paper',
                        transition: 'background-color 0.2s ease',
                        borderRadius: 1,
                        borderLeft: isNoteSelected(note.id) 
                          ? `4px solid ${theme.palette.primary.main}`
                          : 'none'
                      }}
                    >
                      <Checkbox
                        checked={isNoteSelected(note.id)}
                        onChange={() => toggleNoteSelection(note.id)}
                        sx={{ mr: 1 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <IconButton
                          onClick={() => toggleNoteStar(note.id)}
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          {note.starred ? (
                            <Star color="warning" />
                          ) : (
                            <StarBorder />
                          )}
                        </IconButton>
                        <IconButton
                          onClick={() => toggleNoteActive(note.id)}
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          {note.active ? (
                            <Star color="success" />
                          ) : (
                            <StarBorder />
                          )}
                        </IconButton>
                      </Box>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography
                              sx={{ 
                                whiteSpace: 'pre-line',
                                fontWeight: note.starred ? 600 : 'normal'
                              }}
                            >
                              {getFirstLine(note.note)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip 
                              label={availableSections.find(s => s.id === note.section)?.name || 'Uncategorized'}
                              size="small"
                              sx={{ 
                                bgcolor: note.section === 'archived' 
                                  ? 'grey.100' 
                                  : note.section === 'active'
                                    ? 'primary.light'
                                    : 'secondary.light',
                                color: note.section === 'archived' 
                                  ? 'text.secondary' 
                                  : 'common.white'
                              }}
                            />
                            <Chip
                              label={note.priority}
                              size="small"
                              sx={{ 
                                bgcolor: getPriorityColor(note.priority),
                                color: 'common.white'
                              }}
                            />
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                          <IconButton 
                            onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                            size="small"
                          >
                            <ExpandMore sx={{ 
                              transform: expandedNote === note.id ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s'
                            }} />
                          </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>

                    <Collapse in={expandedNote === String(note.id)} timeout="auto" unmountOnExit>
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
                              value={note.section}
                              onChange={(e) => changeNoteSection(String(note.id), e.target.value as string)}
                              label="Move to"
                            >
                              {availableSections.map((section) => (
                                <MenuItem key={section.id} value={section.id}>
                                  {section.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <EditButton 
                            hideText 
                            size="small" 
                            variant="outlined"  
                            resource="notes"
                            recordItemId={note.id} 
                          />
                          <DeleteButton
                            hideText 
                            size="small" 
                            variant="outlined"  
                            resource="notes"
                            recordItemId={note.id} 
                          />
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
              {/* Active notes column */}
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
                        label={filteredNotes.filter(t => t.section === 'active').length}
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
                    {filteredNotes.filter(t => t.section === 'active').length > 0 ? (
                      filteredNotes
                        .filter(t => t.section === 'active')
                        .map((note) => (
                          <NoteCard 
                            key={note.id}
                            note={note}
                            onToggleStar={toggleNoteStar}
                            onToggleActive={toggleNoteActive}
                            getPriorityColor={getPriorityColor}
                            availableSections={availableSections}
                          />
                        ))
                    ) : (
                      <EmptySection message="No active notes" />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Other sections */}
              {availableSections
                .filter(s => s.id !== 'all' && s.id !== 'active')
                .map((section) => {
                  const sectionNotes = filteredNotes.filter(t => t.section === section.id);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={section.id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ 
                          bgcolor: section.id === 'archived'
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
                              label={sectionNotes.length}
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
                          {sectionNotes.length > 0 ? (
                            sectionNotes.map((note) => (
                              <NoteCard 
                                key={note.id}
                                note={note}
                                onToggleStar={toggleNoteStar}
                                onToggleActive={toggleNoteActive}
                                getPriorityColor={getPriorityColor}
                                availableSections={availableSections}
                              />
                            ))
                          ) : (
                            <EmptySection message={`No notes in ${section.name}`} />
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
              setNewNote('');
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
          addNote()
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
function NoteCard({
  note,
  onToggleStar,
  onToggleActive,
  getPriorityColor,
  availableSections
}: {
  note: ProfileNote;
  onToggleStar: (id: string) => void;
  onToggleActive: (id: string) => void;
  getPriorityColor: (priority: Priority) => string;
  availableSections: ProfileSection[];
}) {
  const theme = useTheme();
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
          onClick={() => onToggleStar(note.id)}
          size="small"
        >
          {note.starred ? (
            <Star color="warning" fontSize="small" />
          ) : (
            <StarBorder fontSize="small" />
          )}
        </IconButton>
        <IconButton
          onClick={() => onToggleActive(note.id)}
          size="small"
        >
          {note.active ? (
            <Star color="success" fontSize="small" />
          ) : (
            <StarBorder fontSize="small" />
          )}
        </IconButton>
        
      </Box>
      
      <Typography
        sx={{ 
          mb: 1
        }}
      >
        {note.note}
      </Typography>

      <Chip
        label={note.priority}
        size="small"
        sx={{ 
          bgcolor: getPriorityColor(note.priority),
          color: 'common.white'
        }}
      />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        mt: 1,
        gap: 0.5
      }}>
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
          ? "No notes match your search criteria." 
          : activeSection 
            ? "You don't have any active notes yet." 
            : `No notes in ${availableSections.find(s => s.id === sectionFilter)?.name || 'this section'}.`}
      </Typography>
      <Button 
        variant="text" 
        onClick={onResetFilters}
        sx={{ mt: 1 }}
      >
        Create your first note
      </Button>
    </Box>
  );
}