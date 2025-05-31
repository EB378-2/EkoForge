"use client";

import React from "react";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Box, TextField, Paper } from "@mui/material";
import { Blog } from "@/types/miscTypes";
import { useTheme } from "@hooks/useTheme";


export default function BlogEditPage() {
  const theme = useTheme();
  // useForm automatically fetches the record and populates defaultValues.
  const {
    register,
    formState: { errors },
    saveButtonProps,
  } = useForm<Blog>();

  
  return (
    <Edit title="Edit Blog Post" saveButtonProps={saveButtonProps}>
      <Paper sx={{ p: 3, m: 2 }}>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Title"
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={typeof errors.title?.message === "string" ? errors.title.message : ""}
          />
          <TextField
            label="Content"
            multiline
            rows={6}
            {...register("content", { required: "Content is required" })}
            error={!!errors.content}
            helperText={typeof errors.content?.message === "string" ? errors.content.message : ""}
          />
          <TextField
            label="Image Link"
            rows={6}
            {...register("image_link")}
            error={!!errors.image_link}
            helperText={typeof errors.image_link?.message === "string" ? errors.image_link.message : ""}
          />
        </Box>
      </Paper>
    </Edit>
  );
}
