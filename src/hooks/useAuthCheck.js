"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout, setChecked, setLoading } from '@/redux/slices/authSlice';
import { usePathname } from 'next/navigation';
import axios from 'axios';

const AUTH_CHECK_PREFIXES = [
  "/dashboard",
  "/home",
  "/groups",
  "/expenses",
  "/notifications",
  "/profile",
  "/login",
  "/signup",
];

export function useAuthCheck() {
  const dispatch = useDispatch();
  const pathname = usePathname();

  useEffect(() => {
    const shouldCheckAuth = AUTH_CHECK_PREFIXES.some((prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`));

    if (!shouldCheckAuth) {
      dispatch(setLoading(false));
      dispatch(setChecked(true));
      return;
    }

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
        dispatch(setChecked(true));
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch, pathname]);
}
