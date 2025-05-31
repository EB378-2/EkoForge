"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  IconButton
} from "@mui/material";
import { StarBorder, Star, ArrowBack, Edit, Delete } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import { ProfileData, ProfileNote, Priority } from "@/types/ProfileTypes";
import { HttpError, useGetIdentity, useOne, useUpdate } from "@refinedev/core";
import { useTheme } from "@mui/material/styles";
import { format } from "date-fns";

export default function NotesEditPage() {
  const router = useRouter();
  const theme = useTheme();
  const { id: noteId } = useParams<{ id: string }>();

  // Get the user ID from the auth provider
  const { data: identity } = useGetIdentity<{ id: string }>();
  const userId = identity?.id ?? "";

  // Fetch the profile data
  const { data: profileData, isLoading: profileLoading } = useOne<ProfileData, HttpError>({
    resource: "profiles",
    id: userId,
    meta: { select: "*" },
  });

  // Hook for updating the profile
  const { mutate: updateProfile } = useUpdate<ProfileData>();

  // Find the current note from the profile data
  const currentNote = profileData?.data?.notes?.find((note: ProfileNote) => note.id === noteId);
  const createdAt = currentNote?.createdAt || new Date().toISOString();

  // State for note content and metadata
  const [noteContent, setNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [section, setSection] = useState("all");
  const [starred, setStarred] = useState(false);
  const [active, setActive] = useState(true);

  // Available sections
  const availableSections = useMemo(() => {
    const defaultSections = [
      { id: "all", name: "All Notes" },
      { id: "personal", name: "Personal" },
      { id: "archived", name: "Archived" },
    ];
    const customSections = profileData?.data?.sections || [];
    const custom = customSections.filter(
      sec => !["all", "personal", "archived"].includes(sec.id)
    );
    return [...defaultSections, ...custom];
  }, [profileData?.data?.sections]);

  // Update function for saving changes
  const updateNote = useCallback(() => {
    if (!currentNote) return;
    
    setIsSaving(true);
    
    updateProfile(
      {
        resource: "profiles",
        id: userId,
        values: { 
          notes: (profileData?.data?.notes || []).map(note => 
            note.id === noteId ? { 
              ...note, 
              note: noteContent,
              priority,
              section,
              starred,
              active
            } : note
          ) 
        },
        successNotification: false,
        errorNotification: false,
      },
      {
        onSuccess: () => {
          setIsSaving(false);
          setLastSaved(new Date().toISOString());
        },
        onError: () => {
          setIsSaving(false);
        },
      }
    );
  }, [noteId, profileData, updateProfile, userId, noteContent, priority, section, starred, active, currentNote]);

  // Delete function
  const deleteNote = useCallback(() => {
    if (!currentNote || !confirm("Are you sure you want to delete this note?")) return;
    
    const updatedNotes = (profileData?.data?.notes || []).filter(note => note.id !== noteId);
    
    updateProfile(
      {
        resource: "profiles",
        id: userId,
        values: { notes: updatedNotes },
      },
      {
        onSuccess: () => {
          router.push("/notes");
        }
      }
    );
  }, [noteId, profileData, updateProfile, userId, router, currentNote]);

  // Set initial values when note data is loaded
  useEffect(() => {
    if (currentNote) {
      setNoteContent(currentNote.note);
      setPriority(currentNote.priority || "medium");
      setSection(currentNote.section || "all");
      setStarred(currentNote.starred || false);
      setActive(currentNote.active !== false);
      setLastSaved(new Date().toISOString());
    }
  }, [currentNote]);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (!currentNote || noteContent === currentNote.note) return;

    const timer = setTimeout(() => {
      updateNote();
    }, 2000);

    return () => clearTimeout(timer);
  }, [noteContent, currentNote, updateNote]);

  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentNote && !profileLoading) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6">Note not found</Typography>
        <Button 
          onClick={() => router.push("/notes")}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Go Back to Notes
        </Button>
      </Box>
    );
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'error.main';
      case 'medium': return 'warning.main';
      case 'low': return 'success.main';
      default: return 'text.secondary';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 3
        }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push("/notes")}
            variant="outlined"
          >
            Back to Notes
          </Button>
          
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={deleteNote}
              color="error"
              sx={{ border: `1px solid ${theme.palette.error.main}` }}
            >
              <Delete />
            </IconButton>
            
            <Button
              variant="contained"
              onClick={updateNote}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Note metadata */}
          <Box sx={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: 2,
            mb: 2
          }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={starred}
                  onChange={(e) => {
                    setStarred(e.target.checked);
                    updateNote();
                  }}
                  icon={<StarBorder />}
                  checkedIcon={<Star color="warning" />}
                />
              }
              label="Starred"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={active}
                  onChange={(e) => {
                    setActive(e.target.checked);
                    updateNote();
                  }}
                />
              }
              label="Active"
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => {
                  setPriority(e.target.value as Priority);
                  updateNote();
                }}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Section</InputLabel>
              <Select
                value={section}
                label="Section"
                onChange={(e) => {
                  setSection(e.target.value);
                  updateNote();
                }}
              >
                {availableSections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Chip
              label={`Created: ${format(new Date(createdAt), 'MMM d, yyyy')}`}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Note content */}
          <TextField
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            label="Note Content"
            multiline
            minRows={10}
            fullWidth
            variant="outlined"
            autoFocus
          />

          {/* Save status */}
          <Typography variant="caption" color="text.secondary">
            {isSaving ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={14} />
                <span>Saving...</span>
              </Box>
            ) : (
              `Last saved: ${lastSaved ? new Date(lastSaved).toLocaleTimeString() : 'Never'}`
            )}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}