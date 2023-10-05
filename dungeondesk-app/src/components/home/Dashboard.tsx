import { Container, Grid, Paper, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Container>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} className="p-4">
            {/* Sidebar content goes here */}
            <Typography variant="h6">User Menu</Typography>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#">Profile</a>
              </li>
              <li>
                <a href="#">Campaigns</a>
              </li>
              <li>
                <a href="#">Settings</a>
              </li>
            </ul>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper elevation={3} className="p-4">
            <Typography variant="h3" gutterBottom>
              Welcome, [Username]
            </Typography>
            {/* Your main content goes here */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
