import { useState } from 'react';
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

          {/* Social Media Post Creation */}
          <div className="mt-4">
            <textarea 
              className="w-full p-3 border rounded shadow-sm" 
              rows="4" 
              placeholder="What's on your mind?"></textarea>
            <button 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Post
            </button>
          </div>

          {/* List of Posts (You can render an array of posts here) */}
          <div className="mt-6 space-y-4">
            {/* Example of a post */}
            <div className="p-4 border rounded shadow-sm">
              <Typography variant="h6" gutterBottom>
                [Poster's Name]
              </Typography>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit...
              </Typography>
            </div>
          </div>
        </Paper>
      </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
