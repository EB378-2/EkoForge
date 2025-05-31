"use client";

import React from "react";
import { Typography, Button, TextField, Divider, Stack } from "@mui/material";
import { Note, Edit, Check, Close } from "@mui/icons-material";
import { useGetIdentity, useOne, useUpdate, HttpError } from "@refinedev/core";
import { ProfileData } from "@/types/miscTypes";

export default function QuickNote() {
  const { data: identity } = useGetIdentity<{ id: string }>();
  const userId = identity?.id ?? "";

  // Fetch the profile data
  const { data } = useOne<ProfileData, HttpError>({
    resource: "profiles",
    id: userId,
    meta: { select: "*" },
  });

  // Hook for updating the profile
  const { mutate: updateProfile } = useUpdate<ProfileData>();

  const profile = data?.data;
  const [quickNote, setQuickNote] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempNote, setTempNote] = React.useState("");

  // Initialize note when profile loads
  React.useEffect(() => {
    if (profile) {
      // Find the dashboard note or initialize empty
      const dashboardNote = profile.notes?.find(n => n.section === "dashboard");
      setQuickNote(dashboardNote?.note || "");
    }
  }, [profile]);

  const handleEditNote = () => {
    setTempNote(quickNote);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    const updatedNote = {
      id: Date.now().toString(), // Use timestamp as ID
      note: tempNote,
      section: "dashboard" // Always save under dashboard section
    };

    // Create updated notes array
    const existingNotes = profile?.notes?.filter(n => n.section !== "dashboard") || [];
    const updatedNotes = [...existingNotes, updatedNote];

    // Update local state
    setQuickNote(tempNote);
    setIsEditing(false);

    // Update profile
    updateProfile({
      resource: "profiles",
      id: userId,
      values: { notes: updatedNotes },
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Note sx={{ mr: 1 }} /> Quick Note
      </Typography>
      {isEditing ? (
        <>
          <TextField
            multiline
            fullWidth
            rows={4}
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            variant="outlined"
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleSaveNote}
              startIcon={<Check />}
            >
              Save
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleCancelEdit}
              startIcon={<Close />}
            >
              Cancel
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
            {quickNote || "No note saved yet. Click 'Edit Note' to add one."}
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleEditNote}
            startIcon={<Edit />}
          >
            Edit Note
          </Button>
        </>
      )}
    </>
  );
}