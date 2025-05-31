"use client";

import React from "react";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Box, TextField, Paper } from "@mui/material";
import { Blog } from "@/types/miscTypes";
import { useTheme } from "@hooks/useTheme";
import { useTranslations } from "next-intl";

export default function BlogCreatePage() {
  const theme = useTheme();
  const t = useTranslations("Dashboard"); 

  const {
    register,
    formState: { errors },
    saveButtonProps,
  } = useForm<Blog>({
    defaultValues: {
      title: "",
      content: "",      
    },
  });


  return (
    <Create title="Create Blog Post" saveButtonProps={saveButtonProps}>
      <Paper sx={{ p: 3, m: 2 }}>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label={t("create.title")}
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={typeof errors.title?.message === "string" ? errors.title.message : ""}
            />
          <TextField
            label={t("create.content")}
            multiline
            rows={6}
            {...register("content", { required: "Content is required" })}
            helperText={typeof errors.content?.message === "string" ? errors.content.message : ""}
          />
           <TextField
            label={t("create.ImgLink")}
            rows={6}
            {...register("image_link")}
            helperText={typeof errors.image_link?.message === "string" ? errors.image_link.message : ""}
          />
        </Box>
      </Paper>
    </Create>
  );
}
