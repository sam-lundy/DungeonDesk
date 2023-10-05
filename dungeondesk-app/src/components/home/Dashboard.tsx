import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { AuthContext } from '../firebase/firebase.auth.tsx';
import { HiOutlineThumbUp, HiOutlineThumbDown } from 'react-icons/hi';
import { MdOutlineDelete } from 'react-icons/md';
import './Dashboard.css'


type PostType = {
  id: number;
  username: string;
  content: string;
  timestamp?: string;
};


const Dashboard = () => {
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<PostType[]>([]);
  const authContext = useContext(AuthContext);
  const currentUser = authContext && authContext.currentUser;
  const [username, setUsername] = useState<string | null>(null);


  useEffect(() => {
    const fetchUsername = async () => {
        if (currentUser && currentUser.uid) {
            try {
                const response = await axios.get('http://localhost:5000/api/get-username', {
                    params: {
                        uid: currentUser.uid
                    }
                });
                
                if (response.data && response.data.success) {
                    setUsername(response.data.username);
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        }
    };

    fetchUsername();
  }, [currentUser]);



  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts');
        if (response.data) {
          setPosts(response.data || []);
        }
      } catch (error) {
      }
    };    

    fetchPosts();
}, []);



  const handlePost = async () => {
    if (!postContent || !username) return;

    try {
        const response = await axios.post('http://localhost:5000/api/posts', { 
            content: postContent,
            username: username,
        });
        
        if (response.data && response.data.success) {
          setPosts(prevPosts => [response.data.post, ...prevPosts]);
            setPostContent('');
        }
    } catch (error) {
        console.error("Error creating post:", error);
    }
  };


  const handleLikeDislike = async (postId: number, value: number) => {
    try {
        if (currentUser) {
            const response = await axios.post(`http://localhost:5000/api/posts/${postId}/like`, { 
                user_id: currentUser.uid,
                value  // equivalent to value: value
            });
        
            if (response.data && response.data.success && response.data.post) {
              const updatedPost = response.data.post;
              setPosts(prevPosts => {
                  return prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post);
              });
          }
          
        }
    } catch (error) {
        console.error("Error liking/disliking post:", error);
    }
};



  const handleDelete = async (postId: number) => {
    try {
        const response = await axios.delete(`http://localhost:5000/api/posts/${postId}`);
        if (response.data && response.data.success) {
          setPosts(prevPosts => {
            return prevPosts.filter(post => post.id !== postId);
        });
        }
    } catch (error) {
        console.error("Error deleting post:", error);
    }
  };



  return (
    <Container>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} className="p-4 dashboard-sidebar">
            {/* Sidebar content goes here */}
            <Typography variant="h6">My Links</Typography>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="/profile">Profile</a>
              </li>
              <li>
                <a href="#">Friends</a>
              </li>
              <li>
                <a href="#">Notifications</a>
              </li>
              <li>
                <a href="#">Settings</a>
              </li>
            </ul>
          </Paper>
        </Grid>

      {/* Main Content */}
      <Grid item xs={12} md={9}>
        <Paper elevation={3} className="p-8 mb-20 dashboard-main-content">
        <Typography variant="h4" gutterBottom>
            Welcome, {username ? username : "Guest"}
        </Typography>


          {/* Social Media Post Creation */}
          <div className="mt-4">
            <textarea 
                className="w-full p-3 border rounded shadow-sm dashboard-textarea"
                rows={4}
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
            />
            <button 
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-600"
                onClick={handlePost}
            >
                Post
            </button>

          </div>

          {/* List of Posts (You can render an array of posts here) */}
          <div className="mt-6 space-y-4">
          {posts.length === 0 ? (
            <p>Loading posts...</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-4 border rounded shadow-sm">
                    <Typography variant="h6" gutterBottom>
                        {post.username}
                    </Typography>
                    <Typography>
                        {post.content}
                    </Typography>
                    <Typography>
                        {post.timestamp}
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                      <HiOutlineThumbUp 
                          style={{ cursor: 'pointer', fontSize: '24px' }}  // increased size
                          onClick={() => handleLikeDislike(post.id, 1)} 
                      />
                      <HiOutlineThumbDown 
                          style={{ cursor: 'pointer', fontSize: '24px' }}  // increased size
                          onClick={() => handleLikeDislike(post.id, -1)} 
                      />
                      <MdOutlineDelete 
                          style={{ cursor: 'pointer', color: 'red', fontSize: '24px' }}  // increased size
                          onClick={() => handleDelete(post.id)} 
                      />
                  </div>
                </div>
              ))
            )}

        </div>
        </Paper>
      </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
