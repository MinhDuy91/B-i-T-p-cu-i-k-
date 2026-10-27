/**
 * Điểm vào gốc (Route /)
 * Luôn điều hướng đến màn hình Đăng nhập nếu chưa xác thực, hoặc Trang chủ nếu đã đăng nhập.
 */
import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}
