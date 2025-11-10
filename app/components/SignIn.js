'use client';

import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Google } from '@mui/icons-material';
import { auth, GoogleAuthProvider } from '@/firebase';
import { signInWithPopup } from 'firebase/auth';
import styles from '../styles/SignIn.module.css';

const SignIn = ({ onSignIn }) => {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Signed in as:', result.user.displayName);
      if (onSignIn) onSignIn(result.user);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.content}>
        <Typography variant="h1" className={styles.title}>
          Pantry Manager
        </Typography>
        
        <Typography variant="h5" className={styles.subtitle}>
          Organize and track your inventory with ease
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<Google />}
          onClick={handleSignIn}
          className={styles.signInButton}
        >
          Continue with Google
        </Button>
        
        <Box className={styles.features}>
          <Box className={styles.featureItem}>
            <Typography variant="body2" className={styles.featureTitle}>Track Items</Typography>
            <Typography variant="caption" className={styles.featureDesc}>
              Keep tabs on quantity and categories
            </Typography>
          </Box>
          <Box className={styles.featureItem}>
            <Typography variant="body2" className={styles.featureTitle}>Expiry Dates</Typography>
            <Typography variant="caption" className={styles.featureDesc}>
              Never let food go to waste
            </Typography>
          </Box>
          <Box className={styles.featureItem}>
            <Typography variant="body2" className={styles.featureTitle}>Smart Search</Typography>
            <Typography variant="caption" className={styles.featureDesc}>
              Find what you need instantly
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn;
