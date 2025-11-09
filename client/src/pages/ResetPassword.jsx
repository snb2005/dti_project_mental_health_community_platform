import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, Lock } from 'lucide-react';

function ResetPassword() {
  const { backendUrl } = useContext(AppContent);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').split('');
    paste.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/sendresetotp`, { email });
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  };

  const onSubmitOtp = (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input.value);
    setOtp(otpArray.join(''));
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/resetPassword`, {
        email,
        otp,
        newPassword,
      });
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen pattern-bg">
      <img
        onClick={() => navigate('/')}
        src={assets.logo || "/placeholder.svg"}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <div className="relative w-full sm:w-96 max-w-md mx-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-light/20 to-primary-lighter/20 rounded-2xl blur-xl"></div>
        
        {!isEmailSent && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitEmail();
            }}
            className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-card-border animate-fadeIn"
          >
            <h1 className="text-3xl font-bold text-gradient text-center mb-4">Reset Password</h1>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">Enter your registered email address.</p>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="input-field pl-10 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl shadow-button hover:shadow-lg transition-all duration-300 transform hover:scale-102"
            >
              Send Reset Code
            </button>
            
            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <span 
                onClick={() => navigate('/login')}
                className="text-primary cursor-pointer hover:text-primary-dark transition-colors font-medium"
              >
                Login Here
              </span>
            </p>
          </form>
        )}

        {isEmailSent && !isOtpSubmitted && (
          <form 
            onSubmit={onSubmitOtp} 
            className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-card-border animate-fadeIn"
          >
            <h1 className="text-3xl font-bold text-gradient text-center mb-4">Verification Code</h1>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">
              Enter the 6-digit code sent to your email.
            </p>
            
            <div 
              className="flex justify-between mb-8 space-x-2" 
              onPaste={handlePaste}
            >
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    type="text"
                    maxLength="1"
                    key={index}
                    className="w-12 h-12 bg-primary-lighter/10 text-primary text-center text-xl rounded-lg border border-primary-lighter focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all"
                    ref={(el) => (inputRefs.current[index] = el)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    required
                  />
                ))}
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl shadow-button hover:shadow-lg transition-all duration-300 transform hover:scale-102"
            >
              Verify Code
            </button>
          </form>
        )}

        {isOtpSubmitted && (
          <form
            onSubmit={onSubmitNewPassword}
            className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-card-border animate-fadeIn"
          >
            <h1 className="text-3xl font-bold text-gradient text-center mb-4">New Password</h1>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-400">
              Create a new secure password.
            </p>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                placeholder="New Password"
                className="input-field pl-10 w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl shadow-button hover:shadow-lg transition-all duration-300 transform hover:scale-102"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
