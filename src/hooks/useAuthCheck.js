"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout, setLoading } from '@/redux/slices/authSlice';
import axios from 'axios';

export function useAuthCheck() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch(setLoading(true));
        const res = await axios.get('/api/auth/check');
        
        if (res.data.isAuthenticated) {
          dispatch(loginSuccess({ user: res.data.user }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch]);
}