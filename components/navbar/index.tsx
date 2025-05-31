// components/MobileNav.tsx
"use client";

import React, { useState } from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction,
  Box,
  Divider,
  Fab,
  Paper,
  Grid,
  Typography,
  Modal,
  IconButton,
  Slide,
  styled,
  MenuItem 
} from '@mui/material';
import {
  ListAlt,  
  BroadcastOnHome,  
  CloudQueue,
  Map,
  PriorityHigh,
  LocalGasStation,
  CameraOutdoor,
  Book,
  Article,
  Info,
  Air,
  Lightbulb,
  AccountBox,
  EnhancedEncryption,
  Menu as MenuIcon,
  Add,
  Close,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import resources from '@/resources';
import { CanAccess } from "@refinedev/core";
import { useLogout } from '@refinedev/core';
import { useTheme } from '@hooks/useTheme';
import { useTranslations } from 'use-intl';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'relative',
  top: '-20px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: theme.shadows[6],
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[8],
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

export default function MobileNav() {
  const t = useTranslations("NavBar");
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  const pathname = usePathname();
  const { mutate: logout } = useLogout();

  // Define main navigation items
  const mainNavItems = ['home', 'atis', 'fuel', 'profile'];
  const mainNavResources = resources.filter(resource => mainNavItems.includes(resource.name));
  const menuResources = resources.filter(resource => !mainNavItems.includes(resource.name));

  // Derive active tab from current path
  const activeTab = mainNavResources.findIndex(resource => 
    pathname.startsWith(resource.list)
  );

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Navigation Modal */}
      <Modal
        open={menuOpen}
        onClose={handleMenuToggle}
        closeAfterTransition
      >
        <Slide in={menuOpen} direction="up">
          <Box sx={{
            position: 'absolute',
            bottom: "10vh", 
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 3,
            maxWidth: "100vw",
            maxHeight: "50vh",
            overflowY: 'auto',
            margin: '0 auto'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuIcon color="primary" />
                {t("NavigationMenu")}
              </Typography>
              <IconButton onClick={handleMenuToggle}>
                <Close />
              </IconButton>
            </Box>
            <Grid container spacing={2} flexDirection="column" justifyContent="space-between">
              {menuResources.map((resource) => (
                <CanAccess key={resource.name} resource={resource.name} action='list'>
                  <MenuItem 
                    onClick={handleMenuToggle}
                    component={Link}
                    href={resource.list}
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                      },
                      width: '100%',
                    }}
                  >
                    {resource.meta.icon && React.cloneElement(resource.meta.icon, {
                      sx: {
                        color: theme.palette.primary.main,
                        fontSize: '1.4rem',
                        mr: 2
                      }
                    })}
                    <Box sx={{ 
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      color: theme.palette.text.primary
                    }}>
                      {t(`${resource.meta.label}`)}
                    </Box>
                  </MenuItem>
                </CanAccess>
              ))}

              {menuResources.length > 0 && <Divider />}

              {/* Add Create Actions */}
              {resources
                .filter(r => r.create)
                .map((resource) => (
                  <CanAccess
                    key={`create-${resource.name}`}
                    resource={resource.name}
                    action='create'
                  >
                    <MenuItem
                      onClick={handleMenuToggle}
                      component={Link}
                      href={resource.create!}
                    >
                      <Add sx={{ mr: 2 }} />
                      {t("Create")} {t(`${resource.meta.label}`)}
                    </MenuItem>
                  </CanAccess>
                ))}

              <Divider />

              <MenuItem 
                onClick={() => {
                  logout();
                  handleMenuToggle();
                }}
                sx={{ color: theme.palette.error.main }}
              >
                <AccountBox sx={{ mr: 2 }} />
                {t("LogOut")}
              </MenuItem>
            </Grid>
          </Box>
        </Slide>
      </Modal>

      <Paper 
        sx={{ 
          position: 'fixed',
          minHeight: '10vh', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          backdropFilter: 'blur(20px)',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(18, 18, 18, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          borderTop: `1px solid ${theme.palette.divider}`,
          zIndex: 2200,
        }}
        elevation={0}
      >
        <BottomNavigation
          showLabels
          value={activeTab}
          sx={{
            height: "64px",
            backgroundColor: 'transparent',
            gap: 1,
            px: 1,
          }}
        >
          {/* Left Group */}
          {mainNavResources.slice(0, 2).map((resource) => (
            <BottomNavigationAction
              key={resource.name}
              label={t(`${resource.meta.label}`)}
              icon={resource.meta.icon}
              component={Link}
              href={resource.list}
              sx={{
                minWidth: '72px',
                color: pathname.startsWith(resource.list) 
                  ? theme.palette.primary.main 
                  : theme.palette.text.secondary,
                transition: 'color 0.2s, transform 0.2s',
                '&:hover': {
                  color: theme.palette.primary.dark,
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.7rem',
                  mt: 0.5,
                  fontWeight: pathname.startsWith(resource.list) ? 600 : 500,
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.8rem',
                  mb: 0.5,
                }
              }}
            />
          ))}

          {/* Floating Menu Button */}
          <Box 
            sx={{ 
              position: 'relative',
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StyledFab
              color="primary"
              aria-label="menu"
              onClick={handleMenuToggle}
              sx={{
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              <MenuIcon sx={{ fontSize: '1.8rem' }} />
            </StyledFab>
          </Box>

          {/* Right Group */}
          {mainNavResources.slice(2).map((resource) => (
            <BottomNavigationAction
              key={resource.name}
              label={t(`${resource.meta.label}`)}
              icon={resource.meta.icon}
              component={Link}
              href={resource.list}
              sx={{
                minWidth: '72px',
                color: pathname.startsWith(resource.list) 
                  ? theme.palette.primary.main 
                  : theme.palette.text.secondary,
                transition: 'color 0.2s, transform 0.2s',
                '&:hover': {
                  color: theme.palette.primary.dark,
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.7rem',
                  mt: 0.5,
                  fontWeight: pathname.startsWith(resource.list) ? 600 : 500,
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.8rem',
                  mb: 0.5,
                }
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
}