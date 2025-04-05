// src/components/AddEntry.tsx
import React, { useState } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';

const AddEntry: React.FC = () => {
  const [entry, setEntry] = useState('');

  const handleAdd = () => {
    console.log('Entry added:', entry);
    setEntry('');
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6">Add New Entry</Typography>
      <TextField
        label="Entry"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        fullWidth
        sx={{ my: 1 }}
      />
      <Button variant="contained" onClick={handleAdd}>Add</Button>
    </Paper>
  );
};

export default AddEntry;
