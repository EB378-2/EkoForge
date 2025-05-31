// BlogEditModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  Box, 
  Grid, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel, 
  Typography,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useUpdate } from '@refinedev/core';
import { Delete, CloudUpload } from '@mui/icons-material';
import dayjs from 'dayjs';
import { Blog } from '@/types';

const BlogEditModal = ({ 
  open, 
  onClose, 
  blog,
  onSuccess
}: { 
  open: boolean; 
  onClose: () => void; 
  blog: Blog;
  onSuccess: () => void;
}) => {
  const [formState, setFormState] = useState<Blog | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateBlog } = useUpdate();

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormState(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  // Initialize form when modal opens
  useEffect(() => {
    if (open && blog) {
      setFormState(blog);
      setImagePreview(blog.image_link || '');
    }
  }, [open, blog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...(prev || blog),
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      
      try {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setImagePreview(base64String);
          setFormState(prev => ({
            ...(prev || blog),
            image_link: base64String
          }));
          setIsUploading(false);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Image upload failed:', error);
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormState(prev => ({
      ...(prev || blog),
      image_link: null
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!formState) return;
    
    const updatedValues = {
      ...formState,
      published_at: formState.published_at 
        ? formState.published_at 
        : formState.published_at ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      published: formState.published_at? true : false,
    };

    updateBlog({
      resource: "blogs",
      id: blog.id,
      values: updatedValues,
    }, {
      onSuccess: () => {
        onSuccess();
        onClose();
      }
    });
  };

  if (!formState) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', md: 700 },
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <Typography variant="h6" mb={3}>Edit Blog Post</Typography>
        
        <Grid container spacing={2}>
          {/* Image Upload */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Featured Image
              </Typography>
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              
              {imagePreview ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                  <Avatar
                    variant="rounded"
                    src={imagePreview}
                    sx={{ width: '100%', height: 200 }}
                  />
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'error.main', color: 'white' }}
                    onClick={handleRemoveImage}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ 
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }} onClick={handleImageUploadClick}>
                  {isUploading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <CloudUpload sx={{ fontSize: 48, mb: 1, color: 'text.secondary' }} />
                      <Typography variant="body1" color="text.secondary">
                        Click to upload an image
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (or drag and drop)
                      </Typography>
                    </>
                  )}
                </Box>
              )}
              
              {/* URL Input as fallback */}
              <TextField
                fullWidth
                label="Or enter image URL"
                name="image_link"
                value={formState.image_link || ''}
                onChange={handleChange}
                sx={{ mt: 2 }}
                InputProps={{
                  endAdornment: (
                    <Button 
                      variant="outlined" 
                      onClick={() => setImagePreview(formState.image_link || '')}
                      sx={{ ml: 1 }}
                    >
                      Preview
                    </Button>
                  )
                }}
              />
            </Box>
          </Grid>
          
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              required
            />
          </Grid>
          
          {/* Content */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formState.content}
              onChange={handleChange}
              multiline
              rows={8}
              required
            />
          </Grid>
          
          {/* Publication Status */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  name="published"
                  checked={!!formState.published_at}
                  onChange={(e) => {
                    const isPublished = e.target.checked;
                    setFormState(prev => ({
                      ...(prev || blog),
                      published_at: isPublished ? (prev?.published_at || new Date().toISOString()) : null
                    }));
                  }}
                />
              }
              label="Published"
            />
            
            {formState.published_at && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Published: {dayjs(formState.published_at).format('MMM D, YYYY h:mm A')}
              </Typography>
            )}
          </Grid>
          
          {/* Created Date */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Created: {dayjs(formState.created_at).format('MMM D, YYYY h:mm A')}
            </Typography>
          </Grid>
          
          {/* Actions */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={!formState.title || !formState.content}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default BlogEditModal;