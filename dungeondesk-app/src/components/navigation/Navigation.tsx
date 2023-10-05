import { useEffect, useState, useContext, FC } from 'react';
import { AuthContext } from '../firebase/firebase.auth.tsx';
import { useNavigate } from 'react-router-dom';
import { auth, signOut } from '../firebase/firebaseConfig.ts';
import { AppBar, Toolbar, IconButton, Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useLayoutContext } from '../../contexts/LayoutContext.tsx';

  
const Navigation: FC = () => {
    const context = useContext(AuthContext)
    const currentUser = context ? context.currentUser : null;
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { drawerOpen, setDrawerOpen } = useLayoutContext();


    useEffect(() => {
        setAnchorEl(null);
    }, [currentUser]);
    

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setAnchorEl(null);  // Reset the anchorEl state
            navigate('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar 
            position="fixed"
            sx={{
                background: '#0c0a26',
                height: '55px',
                color: currentUser ? '' : 'white',
                zIndex: 1300
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {currentUser && (
                    <IconButton 
                    color="inherit" 
                    aria-label="menu" 
                    onClick={() => setDrawerOpen(prevState => !prevState)}
                    sx={{
                        marginLeft: '0px',  // Adjust based on AppDrawer width
                        width: '30px',
                        height: '25px',
                        borderRadius: '3px',
                        '&:hover': {
                            backgroundColor: '#444654',
                        },
                    }}
                >
                    <MenuIcon />
                </IconButton>
                )}

                <div>
                    {currentUser ? (
                        <>
                            <IconButton 
                            color="inherit"
                            sx={{
                                color: '#F5F5F5',
                            }}
                            >
                                <NotificationsIcon />
                            </IconButton>
                            <IconButton 
                            color="inherit" 
                            onClick={handleMenu}
                            sx={{
                                color: '#F5F5F5',
                            }}
                            >
                                <AccountCircle />
                            </IconButton>
                            {anchorEl && (
                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>User Profile</MenuItem>
                                <MenuItem onClick={handleClose}>Account Settings</MenuItem>
                                <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                            </Menu>
                    )}
                        </>
                    ) : (
                        <>
                            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                            <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
                        </>
                    )}
                </div>
            </Toolbar>
        </AppBar>
    );
}


export default (Navigation);
