// src/components/Navigation.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Navigation: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          SmartFarm
        </Typography>
        <Button color="inherit">Dashboard</Button>
        <Button color="inherit">Add Entry</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
