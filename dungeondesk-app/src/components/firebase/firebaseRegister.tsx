import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.ts';


function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  

      const additionalUserData = {
        uid: user.uid,
        username: username,
        email: email
        // ... any other data like bio, profile_pic, etc.
      };

      // Fetch the JWT
      const idToken = await user.getIdToken(true);

      // store JWT in local storage or context
      localStorage.setItem('jwt', idToken);
  
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(additionalUserData)
      });
  
      const data = await response.json();
      
  
      if (data.success) {
        setMessage(`Welcome ${user.email}! Registration successful.`);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(data.error);
      }

    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-[80vh] max-w-xs mx-auto">
        <h5 className="text-center text-2xl font-semibold mb-6">Register to DungeonDesk</h5>
        <form className="w-full space-y-4">
            <div className="relative">
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-indigo-500"
                    placeholder="Username"
                />
            </div>
            <div className="relative">
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-indigo-500"
                    placeholder="Email"
                />
            </div>
            <div className="relative">
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-indigo-500"
                    placeholder="Password"
                />
            </div>
            <button 
                type="button"
                onClick={handleRegister}
                className="w-[100px] p-2 bg-[#0c0a26] text-white rounded-md hover:bg-[#444654] transition-colors"
            >
                Register
            </button>
            {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        </form>
    </div>
);

}

export default Register;