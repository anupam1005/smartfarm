import { useState } from "react"; // Keep only necessary imports
import { Button, TextField, Typography, Container } from "@mui/material";

const CropAnalysis = () => {
  const [cropData, setCropData] = useState("");

  const analyzeCrop = () => {
    console.log("Analyzing crop:", cropData);
  };

  return (
    <Container>
      <Typography variant="h4">Crop Analysis</Typography>
      <TextField
        label="Enter Crop Name"
        variant="outlined"
        fullWidth
        value={cropData}
        onChange={(e) => setCropData(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={analyzeCrop}>
        Analyze
      </Button>
    </Container>
  );
};

export default CropAnalysis;
