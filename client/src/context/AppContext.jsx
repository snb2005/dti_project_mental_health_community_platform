import React, { createContext, useEffect, useState } from "react";

import { toast } from "react-toastify";
import axios from 'axios';
axios.defaults.withCredentials = true;
export const AppContent=createContext();
export const AppcontextProvider=(props)=>{
    const backendUrl=import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData,setUserData]=useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const getAuthState=async ()=>{
        try{
            const {data}=await axios.get(`${backendUrl}/api/auth/is-auth`, {
                withCredentials: true
            });
            console.log('Auth check response:', data);
            if(data.success){
                setIsLoggedin(true);
                getUserData();
            }

        }
        catch(error){
            toast.error(error.message);
            setUserData(null);
        } finally {
            setIsLoading(false);
        }
    }
    const getUserData=async()=>{
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/data`, { withCredentials: true });
            if (data.success) {
            setUserData(data.userData);
            } else {
            toast.error(data.message);
            }
            console.log(data.userData);
            console.log(userData);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }
    useEffect(()=>{
        getAuthState(); 
    },[])
    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        isLoading
    };
    useEffect(()=>{
        console.log(userData)}
    ,[userData]);
    
    
    return(
        <AppContent.Provider value={value}>
            {props.children}

        </AppContent.Provider>
    )
}