import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { ArrowBack, Home } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <AppBar position="sticky">
      <Toolbar>
        {!isHome && (
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SmartFarm
        </Typography>
        {!isHome && (
          <IconButton color="inherit" onClick={() => navigate('/')}>
            <Home />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;