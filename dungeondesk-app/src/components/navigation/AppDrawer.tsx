import { FC } from 'react'
import { Link } from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';  
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { useLayoutContext } from '../../contexts/LayoutContext';


const AppDrawer: FC = () => {
  const { drawerOpen } = useLayoutContext();

  return (
    <MuiDrawer
      variant="persistent"
      anchor="left"
      open={drawerOpen}
      sx={{
        '& .MuiDrawer-paper, & .MuiDrawer-paper.MuiPaper-root': {
          width: 200,
          backgroundColor: '#444654',
          color: '#F3F3F4',
          zIndex: '1050'
        }
      }}
    >
      {/* Pushes links down */}
      <Box 
        sx={{ 
          padding: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
      </Box>

      {/* Margin */}
      <Box sx={{ height: '20px' }}></Box>

      <List>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemText primary="Home" />
          </ListItemButton>
        </Link>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </Link>
        <Link to="/characters" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemText primary="Characters" />
          </ListItemButton>
        </Link>
        <Link to="/campaigns" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemText primary="Campaigns" />
          </ListItemButton>
        </Link>
      </List>
    </MuiDrawer>
  );
}

export default AppDrawer;
