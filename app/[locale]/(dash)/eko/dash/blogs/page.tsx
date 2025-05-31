"use client";

import React, { useState, useEffect } from "react";
import { useGetIdentity, useList, useNavigation } from "@refinedev/core";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import { ProfileName } from "@components/functions/FetchFunctions";
import { useTheme } from "@hooks/useTheme";
import { DeleteButton, EditButton, ShowButton } from "@refinedev/mui";

const BlogPage: React.FC = () => {
  const t = useTranslations("Blog");
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { data: identity } = useGetIdentity<{ id: string }>();
  const { push } = useNavigation();

  // Get latest posts
  const { data: latestPosts, isLoading: isLoadingLatest } = useList({
    resource: "blogs",
    pagination: { current: 1, pageSize: 3 },
    sorters: [{ field: "created_at", order: "desc" }],
    queryOptions: {
      select: (data) => ({
        ...data,
        data: data.data.map((post: any) => ({
          ...post,
          created_at: new Date(post.created_at).toLocaleDateString(),
        })),
      }),
    },
  });

  // Get older posts
  const { data: olderPosts, isLoading: isLoadingOlder } = useList({
    resource: "blogs",
    pagination: { current: 1, pageSize: 50 },
    sorters: [{ field: "created_at", order: "desc" }],
    queryOptions: {
      enabled: expanded,
      select: (data) => ({
        ...data,
        data: data.data
          .slice(3)
          .map((post: any) => ({
            ...post,
            created_at: new Date(post.created_at).toLocaleDateString(),
          })),
      }),
    },
  });

  // Check ownership when selectedPost changes
  useEffect(() => {
    if (selectedPost && identity?.id) {
      setIsOwner(selectedPost.profile_id === identity.id);
    } else {
      setIsOwner(false);
    }
  }, [selectedPost, identity]);

  const toggleOlderPosts = () => {
    setExpanded(!expanded);
  };

  const handleOpenModal = (post: any) => {
    setSelectedPost(post);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPost(null);
  };

  const handleEdit = () => {
    if (!selectedPost) return;
    push(`/blog/edit/${selectedPost.id}`);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 10 }}>
      {/* Page Header */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
          {t("title")}
        </Typography>
        <Typography variant="h6" sx={{ color: theme.palette.text.secondary, maxWidth: 700, mx: "auto" }}>
          {t("subtitle")}
        </Typography>
      </Box>

      {/* Latest Posts */}
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarTodayIcon fontSize="small" />
          {t("latestPosts")}
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {isLoadingLatest ? (
            Array(3).fill(0).map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="80%" />
              </Grid>
            ))
          ) : (
            latestPosts?.data.map((post: any) => (
              <Grid item xs={12} md={4} key={post.id}>
                <motion.div variants={fadeInUp}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.3s ease, box-shadow 0.3s ease", "&:hover": { transform: "translateY(-5px)", boxShadow: theme.shadows[6] } }}>
                    <CardMedia component="img" height="200" image={post.image_link || "/ihq.jpeg"} alt={post.title} />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <PersonIcon fontSize="small" />
                          <ProfileName profileId={post.profile_id}/>
                        </Typography>
                        <Typography variant="caption">
                          {post.created_at}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Button variant="outlined" size="small" onClick={() => handleOpenModal(post)}>
                        {t("readMore")}
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>
      </motion.div>

      {/* Older Posts */}
      <Box sx={{ mb: 4 }}>
        <Accordion expanded={expanded} onChange={toggleOlderPosts} sx={{ bgcolor: "transparent", boxShadow: "none", "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, "& .MuiAccordionSummary-content": { justifyContent: "space-between", alignItems: "center" } }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {t("olderPosts")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {expanded ? t("hide") : t("show")} ({olderPosts?.total || 0})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3 }}>
            {isLoadingOlder ? (
              <Box sx={{ width: "100%" }}>
                {Array(5).fill(0).map((_, index) => (
                  <Skeleton key={index} height={60} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : (
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                {olderPosts?.data.map((post: any) => (
                  <motion.li key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <Box component="article" sx={{ py: 2, borderBottom: `1px solid ${theme.palette.divider}`, "&:hover": { bgcolor: theme.palette.action.hover } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, cursor: "pointer", "&:hover": { color: theme.palette.primary.main } }} onClick={() => handleOpenModal(post)}>
                            {post.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                            <span><ProfileName profileId={post.profile_id}/></span>
                            <span>•</span>
                            <span>{post.created_at}</span>
                          </Typography>
                        </Box>
                        <Chip label={post.category} size="small" sx={{ bgcolor: theme.palette.grey[200] }} />
                      </Box>
                    </Box>
                  </motion.li>
                ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Empty State */}
      {!isLoadingLatest && latestPosts?.data.length === 0 && (
        <Box sx={{ textAlign: "center", py: 10, bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("noPosts")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("checkBackLater")}
          </Typography>
        </Box>
      )}

      {/* Post Detail Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {selectedPost?.title}
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPost && (
            <>
              <Box sx={{ mb: 3 }}>
                <CardMedia component="img" height="300" image={selectedPost.image_link || "/ihq.jpeg"} alt={selectedPost.title} sx={{ borderRadius: 1, mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {selectedPost.content}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Typography variant="caption">
                  <ProfileName profileId={selectedPost.profile_id}/>
                </Typography>
                <Typography variant="caption">
                {t("published")}: {selectedPost.created_at}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Box>
            {isOwner && (
              <>
                <EditButton 
                  hideText 
                  size="small" 
                  variant="outlined" 
                  resource="blogs"
                  recordItemId={selectedPost?.id}
                  onClick={() => push(`/members/blogs/edit/${selectedPost?.id}`)}
                  sx={{ mr: 1 }}
                />
                <ShowButton 
                  hideText 
                  size="small" 
                  variant="outlined" 
                  resource="blogs"
                  recordItemId={selectedPost?.id}
                  onClick={() => push(`/members/blogs/show/${selectedPost?.id}`)}
                  sx={{ mr: 1 }}
                />
                <DeleteButton
                  size="small"
                  variant="outlined"
                  resource="blogs"
                  recordItemId={selectedPost?.id}
                  onSuccess={() => {
                    handleCloseModal();
                    window.location.reload();
                  }}
                  confirmTitle="Delete Post"
                  confirmOkText="Delete"
                  confirmCancelText="Cancel"
                  sx={{ mt: 1 }}
                />
              </>
            )}
          </Box>
          <Button onClick={handleCloseModal}> {t("close")}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BlogPage;