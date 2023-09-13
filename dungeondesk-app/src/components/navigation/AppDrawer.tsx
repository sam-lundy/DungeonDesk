import { Link } from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';  
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';

interface AppDrawerProps {
  drawerOpen: boolean;
}

const AppDrawer: React.FC<AppDrawerProps> = ({ drawerOpen }) => {
  return (
    <MuiDrawer
      variant="persistent"
      anchor="left"
      open={drawerOpen}
      sx={{
        '& .MuiDrawer-paper, & .MuiDrawer-paper.MuiPaper-root': {
          width: 200,
          // flexShrink: 0,
          backgroundColor: '#444654',
          color: '#F3F3F4',
          zIndex: '1050'
        }
      }}
    >
      {/* Logo container */}
      <Box 
        sx={{ 
          padding: 2,
          borderBottom: '1px solid #F3F3F4',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
      </Box>

      {/* Margin */}
      <Box sx={{ height: '20px' }}></Box>

      <List>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemText primary="My Dashboard" />
          </ListItemButton>
        </Link>
        <Link to="/characters" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemText primary="Characters" />
          </ListItemButton>
        </Link>
        {/* ... add more items as needed */}
      </List>
    </MuiDrawer>
  );
}

export default AppDrawer;
