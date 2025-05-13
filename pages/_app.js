// pages/_app.js
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

// Prevent unnecessary re-renders during development
export default MyApp;