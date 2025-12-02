'use client';

import { Toaster } from 'sonner';
import { css } from '@/styled-system/css';

const toastClass = css({
  bg: 'white',
  border: '2px solid #f3c35b',
  borderRadius: '12px',
  boxShadow: '0 4px 0 #f1b24a',
  fontSize: '14px',
  fontWeight: '500',
  color: '#4a2c00',
  p: '14px 16px',
  fontFamily: 'inherit',
});

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      theme="light"
      richColors
      toastOptions={{
        className: toastClass,
        style: {
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '12px',
        },
      }}
      visibleToasts={5}
      icons={{
        success: null,
        error: null,
        loading: null,
      }}
    />
  );
}
