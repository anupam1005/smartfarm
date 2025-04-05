
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Pixel Pioneer
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/crop-analysis">
          Crop Analysis
        </Button>
        <Button color="inherit" component={Link} to="/weather">
          Weather
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
