// BlogCreateModal.tsx
import React, { useState, useRef } from 'react';
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
import { useCreate } from '@refinedev/core';
import { Delete, CloudUpload } from '@mui/icons-material';
import dayjs from 'dayjs';
import { Blog } from '@/types';
import { useGetIdentity } from '@refinedev/core';

const BlogCreateModal = ({ 
  open, 
  onClose, 
  onSuccess
}: { 
  open: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const { data: identity } = useGetIdentity<{ id: string }>();
  const [formState, setFormState] = useState<Partial<Blog>>({
    title: '',
    content: '',
    image_link: null,
    published_at: null,
    created_at: new Date().toISOString(),
    profile_id: identity?.id || '',
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createBlog } = useCreate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
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
            ...prev,
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
      ...prev,
      image_link: null
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!identity?.id) {
      console.error('User identity not available');
      return;
    }

    const finalValues = {
      ...formState,
      published_at: formState.published_at ? new Date().toISOString() : null,
      uid: identity.id,
      created_at: new Date().toISOString(),
      published: formState.published_at? true : false,
    };

    createBlog({
      resource: "blogs",
      values: finalValues,
    }, {
      onSuccess: () => {
        onSuccess();
        onClose();
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setFormState({
      title: '',
      content: '',
      image_link: null,
      published_at: null,
      created_at: new Date().toISOString(),
      profile_id: identity?.id || '',
    });
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
        <Typography variant="h6" mb={3}>Create New Blog Post</Typography>
        
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
                      ...prev,
                      published_at: isPublished ? new Date().toISOString() : null
                    }));
                  }}
                />
              }
              label="Publish Immediately"
            />
            
            {formState.published_at && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Will be published immediately
              </Typography>
            )}
          </Grid>
          
          {/* Created Date */}
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Created: {dayjs().format('MMM D, YYYY h:mm A')}
            </Typography>
          </Grid>
          
          {/* Actions */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={!formState.title || !formState.content}
            >
              Create Post
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default BlogCreateModal;