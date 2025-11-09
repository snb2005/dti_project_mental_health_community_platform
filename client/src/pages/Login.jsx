import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';

function Login() {
  const {backendUrl, setIsLoggedin, getUserData, userData} = useContext(AppContent);
  const [state, setState] = useState('Sign Up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onSubmitHandler = async(e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;
      if(state === 'Sign Up') {
        const {data} = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password
        }, { withCredentials: true });
        if(data.success) {
          setIsLoggedin(true);
          getUserData();
          toast.success("Registration successful! Please verify your email to access all features.");
          navigate('/emailVerify');
        } else {
          toast.error(data.message);
        }
      } else {
        const {data} = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password
        }, { withCredentials: true });
        if(data.success) {
          setIsLoggedin(true);
          await getUserData();
          // Check if email is verified after getting user data
          setTimeout(() => {
            if(userData && !userData.isAccountVerified) {
              toast.info("Please verify your email to access all features.");
              navigate('/emailVerify');
            } else {
              navigate('/');
            }
          }, 100);
        } else {
          toast.error(data.message);
        }
      }
    } catch(error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen pattern-bg">
      
      <div className="relative w-full sm:w-96 max-w-md mx-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-light/20 to-primary-lighter/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-card-border">
          <h2 className="text-3xl font-bold text-gradient text-center mb-3">
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {state === 'Sign Up' ? 'Join our supportive community' : 'Login to your account'}
          </p>
          
          <form onSubmit={onSubmitHandler} className="space-y-4">
            {state === 'Sign Up' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={assets.person_icon || "/placeholder.svg"} alt="" className="w-5 h-5" />
                </div>
                <input 
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="input-field pl-10 w-full"
                  type="text" 
                  placeholder="Full Name" 
                  required 
                />
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={assets.mail_icon || "/placeholder.svg"} alt="" className="w-5 h-5" />
              </div>
              <input 
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="input-field pl-10 w-full"
                type="email" 
                placeholder="Email Address" 
                required 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={assets.lock_icon || "/placeholder.svg"} alt="" className="w-5 h-5" />
              </div>
              <input 
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="input-field pl-10 w-full"
                type="password" 
                placeholder="Password" 
                required 
              />
            </div>
            
            {state === 'Login' && (
              <p 
                onClick={() => navigate('/resetPassword')} 
                className="text-sm text-primary hover:text-primary-dark cursor-pointer transition-colors text-right"
              >
                Forgot Password?
              </p>
            )}

            <button 
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl shadow-button hover:shadow-lg transition-all duration-300 transform hover:scale-102"
            >
              {state}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            {state === 'Sign Up' ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{' '}
                <span 
                  onClick={() => setState("Login")}
                  className="text-primary cursor-pointer hover:text-primary-dark transition-colors font-medium"
                >
                  Login Here
                </span>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Don't have an account?{' '}
                <span 
                  onClick={() => setState("Sign Up")} 
                  className="text-primary cursor-pointer hover:text-primary-dark transition-colors font-medium"
                >
                  Sign Up Here
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
