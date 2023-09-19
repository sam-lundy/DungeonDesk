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
import { CharacterCreationProvider } from './components/characters/CharCreationContext';
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
      main: '#F3F3F4', // Your color
    },
    background: {
      default: '#d2d1cd'
    }
  }
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
                marginLeft: currentUser && drawerOpen ? '265px' : '150px',
                marginTop: '50px',
                height: 'calc(100vh - 64px)',
                width: '75%', // you can adjust this to control the width of the content box
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                // backgroundColor: '#ebe8e8', // optional, if you want the gray background
                borderRadius: '5px', // optional, to give the box rounded corners
                // border: '2px solid #E01C25',
                padding: '16px' // spacing inside the box
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
