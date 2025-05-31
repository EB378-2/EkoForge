"use client";

import React from "react";
import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import { Box, Typography, Paper, CardMedia } from "@mui/material";
import { Blog } from "@/types/miscTypes";
import { AuthorName } from "@/components/functions/FetchFunctions";
import { useTheme } from "@hooks/useTheme";


export default function BlogShowPage() {
  const theme = useTheme();
  const { queryResult } = useShow<Blog>({ resource: "blogs", meta: { select: "*" } });
  const blog = queryResult?.data?.data;

  if (!blog) return <Typography>Loading...</Typography>;

  return (
    <Show title="Blog Details">
      <Paper sx={{ p: 3, m: 2 }}>
        <CardMedia
          component="img"
          height="300"
          image={blog.image_link || "/ihq.jpeg"}
          alt={blog.title}
          sx={{ borderRadius: 1, mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          {blog.title}
        </Typography>
        {blog.published_at && (
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Published: {new Date(blog.published_at).toLocaleString()}
          </Typography>
        )}
        <Box sx={{ my: 2 }}>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
            {blog.content}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" display="block">
            Created At: {new Date(blog.created_at).toLocaleString()}
          </Typography>
          <Typography variant="caption" display="block">
            Updated At: {new Date(blog.updated_at).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Author:</Typography>
          <AuthorName profileId={blog.profile_id} />
        </Box>
      </Paper>
    </Show>
  );
}
