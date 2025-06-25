// src/components/SignIn.js (Upgraded UI)

import React from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { Google } from '@mui/icons-material';
import { auth, GoogleAuthProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import styled from '@emotion/styled';

const CenteredBox = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(to right, #e3f2fd, #bbdefb)',
  padding: '20px'
});

const SignInCard = styled(Paper)({
  padding: '40px',
  borderRadius: '20px',
  textAlign: 'center',
  backgroundColor: '#ffffffcc',
  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
});

const SignInButton = styled(Button)({
  marginTop: '20px',
  backgroundColor: '#1e88e5',
  color: '#fff',
  fontSize: '1rem',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
});

const SignIn = ({ onSignIn }) => {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Signed in as:', result.user.displayName);
      if (onSignIn) onSignIn(result.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <CenteredBox>
      <SignInCard>
        <Typography variant="h4" gutterBottom>
          Welcome to Pantry App
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please sign in with your Google account to continue.
        </Typography>
        <SignInButton
          variant="contained"
          startIcon={<Google />}
          onClick={handleSignIn}
        >
          Sign In with Google
        </SignInButton>
      </SignInCard>
    </CenteredBox>
  );
};

export default SignIn;
