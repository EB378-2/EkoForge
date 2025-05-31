"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Avatar,
  Skeleton,
  IconButton,
  Divider,
  Container,
  Stack,
  useTheme
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useOne, useList } from "@refinedev/core";
import { format } from 'date-fns';
import ArrowBack from "@mui/icons-material/ArrowBack";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Person from "@mui/icons-material/Person";
import Share from "@mui/icons-material/Share";
import { useTranslations } from "next-intl";
import { ProfileAvatar, ProfileEmail, ProfileLicence, ProfileName, ProfilePhone, ProfileRole } from "@components/functions/FetchFunctions";

type Blog = {
  id: string;
  title: string;
  content: string;
  image_link: string | null;
  published_at: string | null;
  created_at: string;
  profile_id: string;
};

const BlogShowPage = () => {
  const theme = useTheme();
  const t = useTranslations("Blog");
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const id = useParams().id as string;

  // Fetch single blog post
  const { data, isError } = useOne<Blog>({
    resource: "blogs",
    id: id,
    meta: {
      select: "*"
    }
  });

  // Fetch related posts
  const { data: relatedPosts } = useList<Blog>({
    resource: "blogs",
    meta: {
      select: "*"
    },
    filters: [
      {
        field: "id",
        operator: "ne",
        value: id
      },
      {
        field: "published",
        operator: "eq",
        value: true,
      }
    ],
    pagination: {
      pageSize: 3
    },
    sorters: [
      {
        field: "published_at",
        order: "desc"
      }
    ]
  });

  const blog = data?.data;

  useEffect(() => {
    if (blog) {
      // Simulate loading delay for better UX
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [blog]);

  useEffect(() => {
    // Check if bookmarked in localStorage
    const bookmarks = JSON.parse(localStorage.getItem('blogBookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(id));
  }, [id]);

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.content.substring(0, 100),
          url: window.location.href
        });
      } catch (error) {
        console.error('Sharing failed', error);
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isError) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)' 
          : 'linear-gradient(45deg, #f5f7fa 30%, #e4e8f0 90%)'
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
            {t("PostNotFound")}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            {t("The blog post you're looking for doesn't exist or may have been removed.")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/blog')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              fontWeight: 600
            }}
          >
            {t("BackToBlog")}
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(45deg, #121212 30%, #1e1e1e 90%)' 
        : 'linear-gradient(45deg, #f5f7fa 30%, #e4e8f0 90%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{
            mb: 3,
            color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          {t("Back")}
        </Button>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Article Column */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              borderRadius: '16px', 
              overflow: 'hidden',
              mb: 4,
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
            }}>
              {isLoading ? (
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={400} 
                />
              ) : blog?.image_link ? (
                <CardMedia
                  component="img"
                  image={blog.image_link}
                  alt={blog.title}
                  sx={{ 
                    width: '100%', 
                    height: 400,
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <Box sx={{ 
                  height: 400, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)'
                }}>
                  <Typography variant="h3" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    textAlign: 'center',
                    p: 4
                  }}>
                    {blog?.title}
                  </Typography>
                </Box>
              )}
              
              <CardContent sx={{ p: 4 }}>
                {isLoading ? (
                  <>
                    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={30} sx={{ mb: 4 }} />
                  </>
                ) : (
                  <>
                    <Chip 
                      label={t("Article")} 
                      color="primary" 
                      size="medium"
                      sx={{ 
                        mb: 3,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        px: 1,
                        py: 1.5
                      }} 
                    />
                    
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontWeight: 800, 
                        mb: 3,
                        lineHeight: 1.2,
                        color: theme.palette.mode === 'dark' 
                          ? 'text.primary' : 'primary.dark'
                      }}
                    >
                      {blog?.title}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 4,
                      flexWrap: 'wrap',
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ProfileAvatar profileId={blog?.profile_id || ""} />
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            <ProfileName profileId={blog?.profile_id || ""} />
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <CalendarToday sx={{ 
                              fontSize: 14, 
                              mr: 0.5,
                              color: theme.palette.text.secondary
                            }} />
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {blog?.published_at 
                                ? format(new Date(blog.published_at), 'MMM dd, yyyy • hh:mm a') 
                                : 'Draft'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <IconButton 
                          onClick={handleShare}
                          sx={{
                            background: theme.palette.action.hover,
                            '&:hover': {
                              background: theme.palette.action.selected
                            }
                          }}
                        >
                          <Share />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 4 }} />
                    
                    <Box 
                      component="div"
                      sx={{
                        '& h2': {
                          fontSize: '1.8rem',
                          fontWeight: 700,
                          mt: 4,
                          mb: 2,
                          color: theme.palette.mode === 'dark' 
                            ? 'text.primary' : 'primary.dark'
                        },
                        '& h3': {
                          fontSize: '1.5rem',
                          fontWeight: 600,
                          mt: 3,
                          mb: 1.5
                        },
                        '& p': {
                          fontSize: '1.1rem',
                          lineHeight: 1.8,
                          mb: 2.5,
                          color: theme.palette.mode === 'dark' 
                            ? 'text.secondary' : 'text.primary'
                        },
                        '& img': {
                          maxWidth: '100%',
                          borderRadius: '12px',
                          my: 4
                        },
                        '& blockquote': {
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                          pl: 3,
                          py: 1,
                          my: 3,
                          background: theme.palette.mode === 'dark' 
                            ? 'rgba(79, 172, 254, 0.1)' 
                            : 'rgba(79, 172, 254, 0.05)',
                          fontStyle: 'italic'
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: blog?.content || '' }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Sidebar Column */}
          <Grid item xs={12} md={4}>
            {/* Author Card */}
            <Card sx={{ 
              borderRadius: '16px', 
              mb: 4,
              p: 3,
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 30, 40, 0.5)' 
                : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Person sx={{ mr: 1, fontSize: '1.2rem' }} />
                {t("AboutTheAuthor")}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ProfileAvatar profileId={blog?.profile_id || ""} />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <ProfileName profileId={blog?.profile_id || ""} />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                    <ProfileRole profileId={blog?.profile_id as string} />
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? 'text.secondary' : 'text.primary',
                lineHeight: 1.7
              }}>
                <ProfileEmail profileId={blog?.profile_id || ""} /> <br />
                <ProfilePhone profileId={blog?.profile_id || ""} /> <br />
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                sx={{ 
                  mt: 3,
                  borderRadius: '8px',
                  py: 1.5,
                  fontWeight: 500
                }}
                onClick={() => router.push(`/blog`)}
              >
                {t("ViewAllPosts")}
              </Button>
            </Card>
            
            {/* Related Posts */}
            <Card sx={{ 
              borderRadius: '16px', 
              p: 3,
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 30, 40, 0.5)' 
                : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <CalendarToday sx={{ mr: 1, fontSize: '1.2rem' }} />
                {t("RelatedPosts")}
              </Typography>
              
              <Stack spacing={3}>
                {relatedPosts?.data.map((post) => (
                  <Card 
                    key={post.id}
                    sx={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => router.push(`/blog/${post.id}`)}
                  >
                    <Box sx={{ display: 'flex' }}>
                      {post.image_link ? (
                        <CardMedia
                          component="img"
                          image={post.image_link}
                          alt={post.title}
                          sx={{ 
                            width: 100,
                            height: 100,
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <Box sx={{ 
                          width: 100,
                          height: 100,
                          background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: 'white', 
                            fontWeight: 600,
                            textAlign: 'center'
                          }}>
                            {post.title.substring(0, 30)}...
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ p: 2, flex: 1 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {post.title}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.8
                        }}>
                          {post.published_at 
                            ? format(new Date(post.published_at), 'MMM dd, yyyy') 
                            : 'Draft'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                ))}
                
                {relatedPosts?.data.length === 0 && (
                  <Typography variant="body2" sx={{ 
                    textAlign: 'center', 
                    py: 2,
                    opacity: 0.7
                  }}>
                    {t("NoRelatedPosts")}
                  </Typography>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BlogShowPage;