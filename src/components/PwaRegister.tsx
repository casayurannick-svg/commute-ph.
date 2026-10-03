'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('CommutePH ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('CommutePH ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
