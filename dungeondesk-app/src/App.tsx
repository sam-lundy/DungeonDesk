import { useContext, useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthContext } from './components/firebase/firebase.auth';
import './App.css';
import Login from './components/firebase/firebaseLogin';
import Register from './components/firebase/firebaseRegister';
import Navigation from './components/navigation/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import Characters from './components/characters/Characters';
import CharacterSheet from './components/characters/CharSheet';
import CharacterCreate from './components/characters/CharacterCreate';
import CharRace from './components/characters/CharRace';
import CharClass from './components/characters/CharClass';
import CharAbilities from './components/characters/CharAbilities';
import CharEquip from './components/characters/CharEquip';
import CharPreview from './components/characters/CharPreview';
import { CharacterCreationProvider } from './contexts/CharCreationContext';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import AppDrawer from './components/navigation/AppDrawer';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Box } from '@mui/material';
import UserProfile from './components/profile/UserProfile';


const client = new ApolloClient({
  uri: 'https://www.dnd5eapi.co/graphql',
  cache: new InMemoryCache()
});


const theme = createTheme({
  palette: {
    primary: {
      main: '#0C0A26',
    },
    secondary: {
      main: '#0C0A26',
    },
    background: {
      default: '#d2d1cd',
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused fieldset': {
            borderColor: '#0C0A26',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          '&.Mui-focused': {
            color: '#0C0A26',
          },
        },
      },
    },
  },
});




const App = () => {
  const authContext = useContext(AuthContext);
  const currentUser = authContext && authContext.currentUser;


  const [drawerOpen, setDrawerOpen] = useState(true);


  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prevState => !prevState);
  }, []);


  return (
    <>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
            <Router>
              <div className='App'>
                {currentUser && <AppDrawer drawerOpen={drawerOpen} />}
                <Navigation toggleDrawer={toggleDrawer} drawerOpen={drawerOpen} />
              <Box sx={{
                marginLeft: currentUser && drawerOpen ? '265px' : '180px',
                marginTop: '50px',
                height: 'calc(100vh - 64px)',
                width: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px',
                padding: '16px'
              }}>
              <Routes>
                  <Route path='/' element={
                    <div>
                    <header className='App-header' style={{ marginTop: '-500px' }}>
                        <h1>DungeonDesk</h1>
                        <p>Welcome to DungeonDesk, your ultimate fantasy campaign manager!</p>
                    </header>
                    </div>
                  } />
                  <Route path='/profile' element={<UserProfile />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/register' element={<Register />} />
                  <Route path='/dashboard' element={<Dashboard />} />
                  <Route path='/characters' element={<Characters />} />
                  <Route path="/character-sheet/:characterId" element={<CharacterSheet />} />
                  <Route path='/character-create/*' element={
                    <CharacterCreationProvider>
                      <Routes>
                          <Route index element={<CharacterCreate />} />
                          <Route path='race' element={<CharRace />} />
                          <Route path='class' element={<CharClass />} />
                          <Route path='abilities' element={<CharAbilities />} />
                          <Route path='equipment' element={<CharEquip />} />
                          <Route path='preview' element={<CharPreview />} />
                      </Routes>
                    </CharacterCreationProvider>
                  }/>
              </Routes>
                </Box>
              </div>
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </>
  )
}

export default App
