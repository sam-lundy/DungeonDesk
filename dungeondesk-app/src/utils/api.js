// api.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000', // Assuming your Flask server is running on this address
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;


// import api from './api';

// // GET request example
// api.get('/endpoint')
//    .then(response => {
//      console.log(response.data);
//    })
//    .catch(error => {
//      console.error("There was an error!", error);
//    });

// // POST request example
// api.post('/endpoint', { data: 'yourData' })
//    .then(response => {
//      console.log(response.data);
//    })
//    .catch(error => {
//      console.error("There was an error!", error);
//    });
