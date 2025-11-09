import React, { useContext, useEffect, useState } from 'react';
import { AppContent } from '../context/AppContext';
import axios from 'axios';

const Debug = () => {
  const { userData, backendUrl } = useContext(AppContent);
  const [authResponse, setAuthResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
          withCredentials: true
        });
        setAuthResponse(data);
      } catch (error) {
        setError(error.message);
      }
    };

    if (backendUrl) {
      checkAuth();
    }
  }, [backendUrl]);

  return ;
};

export default Debug; 