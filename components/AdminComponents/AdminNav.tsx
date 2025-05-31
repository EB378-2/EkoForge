'use client';

import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Button, styled, Box, IconButton, Avatar, Badge, Menu, MenuItem, Typography, Divider, keyframes } from '@mui/material';
import { Notifications, Settings, Logout, Dashboard, People, ListAlt, Flight, Menu as MenuIcon, ChevronLeft, LocalGasStation } from '@mui/icons-material';
import { useState } from 'react';
import { ProfileAvatar } from '@components/functions/FetchFunctions';
import { useGetIdentity } from '@refinedev/core';
import Link from '@node_modules/next/link';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(8px)',
  borderRadius: '0 0 16px 16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)'
  }
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '8px 20px',
  transition: 'all 0.3s ease',
  fontWeight: 600,
  letterSpacing: '0.5px',
  textTransform: 'capitalize',
  '&.MuiButton-contained': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    color: theme.palette.getContrastText(theme.palette.secondary.main),
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      animation: `${pulse} 1.5s infinite`
    }
  },
  '&.MuiButton-text': {
    color: theme.palette.common.white,
    opacity: 0.9,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-2px)',
      opacity: 1
    }
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 5,
    top: 5,
    border: `2px solid ${theme.palette.primary.dark}`,
    padding: '0 4px',
    background: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    animation: `${pulse} 2s infinite`
  }
}));

export default function AdminNav() {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: identityData } = useGetIdentity<{ id: string }>();
  const uid = identityData?.id as string;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotifAnchorEl(null);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Alerts', href: '/admin/alert', icon: <Dashboard />, active: pathname === '/admin/alert' },
    { label: 'Users', href: '/admin/users', icon: <People />, active: pathname.startsWith('/admin/users') },
    { label: 'Incidents', href: '/admin/incidents', icon: <ListAlt />, active: pathname.startsWith('/admin/incidents') },
    { label: 'Flights', href: '/admin/flights', icon: <Flight />, active: pathname.startsWith('/admin/flights') },
    { label: 'Fuel', href: '/admin/fuel', icon: <LocalGasStation />, active: pathname.startsWith('/admin/fuel') },
    { label: 'Blog', href: '/admin/blog', icon: <Dashboard />, active: pathname.startsWith('/admin/blog') },
  ];

  const notifications = [
    { id: 1, text: 'New user registration', time: '2 min ago', read: false },
    { id: 2, text: 'System maintenance scheduled', time: '1 hour ago', read: true },
    { id: 3, text: 'Flight delay alert', time: '3 hours ago', read: true },
  ];

  return (
    <GradientAppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: '72px!important', justifyContent: 'space-between' }}>
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleMobileMenu}
          sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
        >
          {mobileOpen ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>

        {/* Logo/Brand */}
        <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Flight sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              EkoAdmin
            </Typography>
          </Box>
        </Link>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {navItems.map((item) => (
            <NavButton
              key={item.href}
              href={item.href}
              variant={item.active ? 'contained' : 'text'}
              startIcon={item.icon}
            >
              {item.label}
            </NavButton>
          ))}
        </Box>

        {/* Right side icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" onClick={handleNotifOpen}>
            <NotificationBadge badgeContent={3} color="error">
              <Notifications />
            </NotificationBadge>
          </IconButton>

          <IconButton color="inherit">
            <Settings />
          </IconButton>

          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <ProfileAvatar profileId={uid} />
          </IconButton>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>
            <Avatar /> Profile
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Avatar /> My account
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 360,
              maxHeight: 400,
              overflow: 'auto',
              p: 0,
            },
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'common.white' }}>
            <Typography variant="h6">Notifications</Typography>
            <Typography variant="body2">You have 3 new notifications</Typography>
          </Box>
          {notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleClose}
              sx={{ 
                bgcolor: notification.read ? 'inherit' : 'action.hover',
                borderLeft: notification.read ? 'none' : '4px solid primary.main'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant="body1">{notification.text}</Typography>
                <Typography variant="caption" color="text.secondary">{notification.time}</Typography>
              </Box>
            </MenuItem>
          ))}
          <MenuItem sx={{ justifyContent: 'center', bgcolor: 'action.hover' }}>
            <Typography variant="body2" color="primary">View All Notifications</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Mobile Navigation */}
      <Box 
        sx={{ 
          display: { xs: mobileOpen ? 'flex' : 'none', md: 'none' }, 
          flexDirection: 'column', 
          p: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {navItems.map((item) => (
          <NavButton
            key={item.href}
            href={item.href}
            variant={item.active ? 'contained' : 'text'}
            startIcon={item.icon}
            fullWidth
            sx={{ mb: 1, justifyContent: 'flex-start' }}
          >
            {item.label}
          </NavButton>
        ))}
      </Box>
    </GradientAppBar>
  );
}