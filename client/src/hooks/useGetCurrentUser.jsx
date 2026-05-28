import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import axiosInstance from '../api/axiosInstance'

function useGetCurrentUser(routeKey = "") {
    const dispatch = useDispatch()

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    // If user is already stored, use it
    if (storedUser) {
      try {
        dispatch(setUserData(JSON.parse(storedUser)));
      } catch (error) {
        console.warn("Failed to parse stored user", error);
      }
    }

    // Only fetch if token exists (user is logged in)
    if (!token) {
      return;
    }

    const getCurrentUser = async () => {
      try {
        const { data } = await axiosInstance.get('/api/user/me');
        const user = data?.user ?? data;
        if (user && user._id) {
          dispatch(setUserData(user));
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (error) {
        // 401 is expected if token is invalid/expired
        if (error.response?.status === 401) {
          // Clear invalid token and user data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else if (error.response?.status !== 401) {
          console.error("Error fetching current user:", error.message);
        }
      }
    }
    getCurrentUser();
  }, [dispatch, routeKey])
}

export default useGetCurrentUser
