"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Avatar,
  LinearProgress,
  Pagination,
  Stack,
  Badge,
  Tooltip
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Refresh,
  Article,
  Publish,
  Drafts,
  Person,
  Search
} from "@mui/icons-material";
import { useList, useDelete } from "@refinedev/core";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import BlogEditModal from "@components/AdminComponents/BlogEditModal";
import BlogCreateModal from "@components/AdminComponents/BlogCreateModal";
import { Blog } from "@/types";
import { ProfileAvatar, ProfileName } from "@components/functions/FetchFunctions";

const BlogAdminDashboard = () => {
  const theme = useTheme();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);

  const { data, isLoading, refetch } = useList<Blog>({
    resource: "blogs",
    pagination: {
      current: currentPage,
      pageSize: pageSize,
    },
    sorters: [{ field: "created_at", order: "desc" }],
    filters: [
      {
        field: "title",
        operator: "contains",
        value: searchTerm,
      },
    ],
  });

  const { mutate: deleteBlog } = useDelete<Blog>({
    
  });
  // Calculate statistics
  const blogStats = {
    total: data?.total || 0,
    published: data?.data?.filter(blog => blog.published_at !== null).length || 0,
    drafts: data?.data?.filter(blog => blog.published_at === null).length || 0,
    authors: Array.from(new Set(data?.data?.map(blog => blog.profile_id))).length || 0
  };

  const handleEditClick = (blog: Blog) => {
    setCurrentBlog(blog);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    deleteBlog({
      resource: "blogs",
      id,
      mutationMode: "undoable",
      undoableTimeout: 5000,
    });
  };

  const handleViewClick = (id: string) => {
    router.push(`/blog/${id}`);
  };

  const formatDate = (dateString: string | null) => {
    return dateString ? dayjs(dateString).format("MMM D, YYYY") : "Draft";
  };

  return (
    <Box sx={{ p: 4, backgroundColor: theme.palette.background.default }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" fontWeight="bold">
          Blog Management Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setCreateModalOpen(true)}
          sx={{ borderRadius: "50px", px: 3 }}
        >
          Create New Blog
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Article />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Blogs</Typography>
                  <Typography variant="h4">{blogStats.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <Publish />
                </Avatar>
                <Box>
                  <Typography variant="h6">Published</Typography>
                  <Typography variant="h4">{blogStats.published}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <Drafts />
                </Avatar>
                <Box>
                  <Typography variant="h6">Drafts</Typography>
                  <Typography variant="h4">{blogStats.drafts}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6">Authors</Typography>
                  <Typography variant="h4">{blogStats.authors}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Box sx={{ display: "flex", mb: 3, gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <Search sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
          sx={{ borderRadius: "50px", px: 3 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Blog Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          {isLoading && <LinearProgress />}
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data?.map((blog) => (
                  <TableRow key={blog.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{blog.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {blog.content.substring(0, 60)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProfileAvatar profileId={blog.profile_id} />
                        <Typography>
                          <ProfileName profileId={blog.profile_id} />
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={blog.published_at ? "Published" : "Draft"}
                        color={blog.published_at ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(blog.published_at || blog.created_at)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Preview">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewClick(blog.id)}
                            color="info"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(blog)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(blog.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                
                {!isLoading && data?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Article sx={{ fontSize: 64, color: "text.disabled", mb: 1 }} />
                        <Typography variant="h6">No blog posts found</Typography>
                        <Typography color="text.secondary">
                          {searchTerm 
                            ? "Try adjusting your search query" 
                            : "Create your first blog post"}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          startIcon={<Add />} 
                          onClick={() => setCreateModalOpen(true)}
                          sx={{ mt: 2 }}
                        >
                          Create Blog Post
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {data?.total && data.total > pageSize && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {data.data.length} of {data.total} blog posts
              </Typography>
              
              <Pagination
                count={Math.ceil(data.total / pageSize)}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                shape="rounded"
              />
              
              <TextField
                select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {[5, 10, 25, 50].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size} per page
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BlogCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
          setCreateModalOpen(false);
        }}
      />
      
      {currentBlog && (
        <BlogEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          blog={currentBlog}
          onSuccess={() => {
            refetch();
            setEditModalOpen(false);
          }}
        />
      )}
    </Box>
  );
};

export default BlogAdminDashboard;