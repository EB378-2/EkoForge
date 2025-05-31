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
  Pagination
} from "@mui/material";
import {
  useGetIdentity,
  useOne,
  useUpdate,
  HttpError,
} from "@refinedev/core";
import { Edit, Delete, Add, ExpandMore, Article, Close } from "@mui/icons-material";
import { MarkdownField } from "@refinedev/mui";
import { ProfileData, ProfileNote, ProfileSection } from "@/types/miscTypes";

const NOTES_PER_PAGE = 5;

export default function NotesComponent() {
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
  const [notes, setNotes] = useState<ProfileNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteFilter, setNoteFilter] = useState<string>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingNote, setEditingNote] = useState<ProfileNote | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editNoteContent, setEditNoteContent] = useState("");

  // Profile data
  const profile = data?.data;
  
  // Available sections
  const availableSections: ProfileSection[] = React.useMemo(() => {
    const defaultSections: ProfileSection[] = [
      { id: "all", name: "All Notes" },
      { id: "active", name: "Active" },
      { id: "archived", name: "Archived" },
    ];
    const customSections: ProfileSection[] = profile?.sections || [];
    const custom = customSections.filter(
      sec => !["active", "all", "archived"].includes(sec.id)
    );
    return [...defaultSections, ...custom];
  }, [profile?.sections]);

  // Initialize notes when profile loads
  React.useEffect(() => {
    if (profile) {
      setNotes(
        profile.notes?.map(note => ({
          ...note,
          section: note.section || "active",
        })) || []
      );
    }
  }, [profile]);

  // Note CRUD operations
  const addNote = () => {
    if (!newNote.trim()) return;
    
    const newNoteItem: ProfileNote = {
      id: Date.now(),
      note: newNote.trim(),
      section: noteFilter === "all" ? "active" : noteFilter,
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

    // Reset to first page when adding new note
    setCurrentPage(1);
  };

  const openEditModal = (note: ProfileNote) => {
    setEditingNote(note);
    setEditNoteContent(note.note);
    setEditModalOpen(true);
  };

  const saveEditedNote = () => {
    if (!editingNote || !editNoteContent.trim()) return;
    
    const updatedNotes = notes.map(n => 
      n.id === editingNote.id ? { ...n, note: editNoteContent } : n
    );
    
    setNotes(updatedNotes);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { notes: updatedNotes },
    });
    
    setEditModalOpen(false);
    setEditingNote(null);
  };

  const changeNoteSection = (id: string, newSectionId: string) => {
    const updatedNotes = notes.map(note => 
      note.id === Number(id) ? { ...note, section: newSectionId } : note
    );
    
    setNotes(updatedNotes);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { notes: updatedNotes },
    });
  };

  const deleteNote = (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    const updatedNotes = notes.filter(n => n.id !== Number(id));
    setNotes(updatedNotes);
    updateProfile({
      resource: "profiles",
      id: profile?.id || "",
      values: { notes: updatedNotes },
    });

    // Adjust page if we deleted the last note on the page
    if (filteredNotes.length % NOTES_PER_PAGE === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter notes based on selected section
  const filteredNotes = noteFilter === "all" 
    ? notes 
    : notes.filter(n => n.section === noteFilter);

  // Pagination logic
  const totalPages = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * NOTES_PER_PAGE,
    currentPage * NOTES_PER_PAGE
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
          Error loading notes. Please try again later.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      {/* Edit Note Modal */}
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
            Edit Note
          </Typography>
          <IconButton onClick={() => setEditModalOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            multiline
            minRows={6}
            variant="outlined"
            value={editNoteContent}
            onChange={(e) => setEditNoteContent(e.target.value)}
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
            onClick={saveEditedNote}
            variant="contained"
            disabled={!editNoteContent.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Notes Component */}
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
            Personal Notes
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by</InputLabel>
            <Select
              value={noteFilter}
              label="Filter by"
              onChange={(e) => {
                setNoteFilter(e.target.value as string);
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
            multiline
            minRows={3}
            maxRows={6}
            variant="outlined"
            placeholder="Write your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
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

        {/* Notes List */}
        {filteredNotes.length > 0 ? (
          <>
            <List sx={{ 
              '& .MuiListItem-root': {
                px: 0,
                py: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}>
              {paginatedNotes.map((note) => (
                <ListItem key={note.id} dense>
                  <ListItemText
                    primary={
                      <Box sx={{ whiteSpace: 'pre-line' }}>
                        <MarkdownField value={note.note} />
                      </Box>
                    }
                    secondary={
                      <Chip 
                        label={availableSections.find(s => s.id === note.section)?.name || 'Uncategorized'}
                        size="small"
                        sx={{ 
                          mt: 1,
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
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={note.section}
                          onChange={(e) => changeNoteSection(note.id.toString(), e.target.value as string)}
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
                        onClick={() => openEditModal(note)}
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
                        onClick={() => deleteNote(note.id.toString())}
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
              {noteFilter === 'all' 
                ? "You don't have any notes yet." 
                : `No notes in ${availableSections.find(s => s.id === noteFilter)?.name || 'this section'}.`}
            </Typography>
            <Button 
              variant="text" 
              onClick={() => setNewNote('')}
              sx={{ mt: 1 }}
            >
              Create your first note
            </Button>
          </Box>
        )}
      </Paper>
    </>
  );
}