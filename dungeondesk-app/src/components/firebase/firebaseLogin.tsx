import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            let userEmail = identifier;
            
            // If identifier doesn't include @, assume username
            if (!identifier.includes('@')) {
                //fetch email associated with username in backend
                const response = await fetch(`http://localhost:5000/api/get-email?username=${identifier}`);
                const data = await response.json();
                userEmail = data.email;
            }

            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
            const user = userCredential.user;

            // Fetch the JWT
            const idToken = await user.getIdToken(true);

            // Store JWT in local storage or context
            localStorage.setItem('jwt', idToken);
            
            // Redirect to home after successful login
            navigate('/dashboard');
        } catch (error) {
            // Handle Errors here.
            console.error(error);
        }
    };
  
    return (
        <div className="flex flex-col items-center justify-start h-[80vh] max-w-xs mx-auto">
            <h5 className="text-center text-2xl font-semibold mb-6">Please Sign-In</h5>
            <form className="w-full space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        className="w-[300px] p-3 border border-gray-300 rounded-md outline-none focus:border-indigo-500"
                        placeholder="Email or Username"
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
                    onClick={handleLogin}
                    className="w-[100px] p-2 bg-[#0c0a26] text-white rounded-md hover:bg-[#444654] transition-colors"
                >
                    Login
                </button>
            </form>
        </div>
    );
    
}
  
export default Login;
