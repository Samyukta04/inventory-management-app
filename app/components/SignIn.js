'use client';

import React from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
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
    <Box className={styles.centeredBox}>
      <Paper className={styles.signInCard} elevation={3}>
        <Typography variant="h4" className={styles.title}>
          Welcome to Pantry App
        </Typography>
        <Typography variant="body1" className={styles.subtitle}>
          Please sign in with your Google account to continue.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Google />}
          onClick={handleSignIn}
          className={styles.signInButton}
        >
          Sign In with Google
        </Button>
      </Paper>
    </Box>
  );
};

export default SignIn;
