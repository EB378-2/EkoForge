"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Skeleton,
  useTheme,
  Container,
  Stack,
  Pagination,
  Avatar
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Person from "@mui/icons-material/Person";
import { useList } from "@refinedev/core";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { ProfileAvatar, ProfileName } from "@components/functions/FetchFunctions";
import { Blog } from "@/types";

const BlogPage = () => {
  const theme = useTheme();
  const t = useTranslations("Blog");
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const { data, isLoading } = useList<Blog>({
    resource: "blogs",
    meta: {
      select: "*"
    },
    sorters: [
      {
        field: "published_at",
        order: "desc",
      },
    ],
    pagination: {
      current: page,
      pageSize: itemsPerPage,
    
    },
    filters: [
      {
        field: "published",
        operator: "eq",
        value: true,
      },
    ],
  });
  

  // Filter blogs based on search term
  const filteredBlogs = data?.data?.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Featured blog (first blog in the list)
  const featuredBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null;

  // Regular blogs (all except the first)
  const regularBlogs = filteredBlogs.length > 0 ? filteredBlogs.slice(1) : [];

  const handleBlogClick = (id: string) => {
    router.push(`/blog/${id}`);
  };

  return (
    <Box sx={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)' 
        : 'linear-gradient(45deg, #f5f7fa 30%, #e4e8f0 90%)',
      minHeight: '100vh',
      py: 6
    }}>
      <Container maxWidth="xl">
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          p: 4,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              mb: 2,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #ffffff 30%, #88d3ff 90%)' 
                : 'linear-gradient(45deg, #003366 30%, #000033 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t("title")}
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            {t("subtitle")}
          </Typography>
          
          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder={`${t("Search blog posts")}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              maxWidth: 600,
              mx: 'auto',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
                color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ 
                    color: theme.palette.mode === 'dark' ? 'white' : 'text.secondary' 
                  }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Featured Blog */}
        {featuredBlog && (
          <Card sx={{ 
            mb: 6, 
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            height: { xs: 'auto', md: 500 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            {featuredBlog.image_link ? (
              <CardMedia
                component="img"
                image={featuredBlog.image_link}
                alt={featuredBlog.title}
                sx={{ 
                  width: { xs: '100%', md: '50%' }, 
                  height: { xs: 300, md: '100%' },
                  objectFit: 'auto', 
                }}
              />
            ) : (
              <Box sx={{
                width: { xs: '100%', md: '50%' }, 
                height: { xs: 300, md: '100%' },
                background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  textAlign: 'center',
                  p: 4
                }}>
                  {featuredBlog.title}
                </Typography>
              </Box>
            )}
            
            <CardContent sx={{ 
              width: { xs: '100%', md: '50%' }, 
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)' 
                : 'white'
            }}>
              <Chip 
                label={t("Featured" )}
                color="primary" 
                size="small"
                sx={{ 
                  alignSelf: 'flex-start',
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }} 
              />
              
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  lineHeight: 1.2,
                  '&:hover': { 
                    textDecoration: 'underline',
                    cursor: 'pointer' 
                  }
                }}
                onClick={() => handleBlogClick(featuredBlog.id)}
              >
                {featuredBlog.title}
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  fontSize: '1.1rem',
                  color: theme.palette.mode === 'dark' 
                    ? 'text.secondary' : 'text.primary'
                }}
              >
                {featuredBlog.content.substring(0, 200)}...
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                <ProfileAvatar profileId={featuredBlog.profile_id} />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <ProfileName profileId={featuredBlog.profile_id} />
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ 
                      fontSize: 14, 
                      mr: 0.5,
                      color: theme.palette.mode === 'dark' 
                        ? 'text.secondary' : 'text.primary'
                    }} />
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {featuredBlog.published_at 
                        ? format(new Date(featuredBlog.published_at), 'MMM dd, yyyy') 
                        : 'Draft'}
                    </Typography>
                  </Box>
                </Box>
                
                <Button
                  variant="outlined"
                  sx={{ 
                    ml: 'auto',
                    borderRadius: '50px',
                    px: 3,
                    fontWeight: 600
                  }}
                  onClick={() => handleBlogClick(featuredBlog.id)}
                >
                  {t("readMore")}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Blog Grid */}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          {t("LatestUpdates")}
        </Typography>
        
        <Grid container spacing={4}>
          {isLoading ? (
            // Skeleton loading states
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : regularBlogs.length > 0 ? (
            regularBlogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog.id}>
                <Card sx={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <CardActionArea onClick={() => handleBlogClick(blog.id)}>
                    {blog.image_link ? (
                      <>
                        {console.log("Grid image_link:", blog.image_link, "title:", blog.title)}
                        <CardMedia
                          component="img"
                          src={blog.image_link}
                          alt={blog.title}
                          sx={{ 
                            height: 200,
                            objectFit: 'auto', 
                          }}
                        />
                      </>
                    ) : (
                      <Box sx={{ 
                        height: 200, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)'
                      }}>
                        <Typography variant="h5" sx={{ 
                          color: 'white', 
                          fontWeight: 600,
                          textAlign: 'center',
                          p: 2
                        }}>
                          {blog.title}
                        </Typography>
                      </Box>
                    )}
                    
                    <CardContent sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          minHeight: '3em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {blog.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 2,
                          color: theme.palette.mode === 'dark' 
                            ? 'text.secondary' : 'text.primary',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {blog.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                        <ProfileAvatar profileId={blog.profile_id} />
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            <ProfileName profileId={blog.profile_id} />
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarToday sx={{ 
                              fontSize: 12, 
                              mr: 0.5,
                              color: theme.palette.mode === 'dark' 
                                ? 'text.secondary' : 'text.primary'
                            }} />
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {blog.published_at 
                                ? format(new Date(blog.published_at), 'MMM dd, yyyy') 
                                : 'Draft'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 6,
                borderRadius: '16px',
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(30, 30, 40, 0.5)' 
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {t("noPosts")}
                </Typography>
                <Typography variant="body1">
                  {t("Try adjusting your search or check back later for new content")}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Pagination */}
        {data?.total && data.total > itemsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={Math.ceil(data.total / itemsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
                  fontWeight: 600
                },
                '& .Mui-selected': {
                  boxShadow: '0 4px 10px rgba(79, 172, 254, 0.4)'
                }
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default BlogPage;