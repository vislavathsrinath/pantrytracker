// Authentication.js
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { Box, Button, TextField, Typography, Modal, Stack } from "@mui/material";

const Authentication = ({ open, onClose, setIsAuthenticated }) => {
  const [authModal, setAuthModal] = useState('signin'); // 'signin' or 'signup'
  const [authData, setAuthData] = useState({ email: '', password: '', confirmPassword: '' });

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async () => {
    try {
      if (authModal === 'signup') {
        if (authData.password !== authData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        alert('Account created successfully');
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        alert('Signed in successfully');
      }
      setIsAuthenticated(true);
      onClose();
    } catch (error) {
      console.error("Error during authentication:", error.message);
      alert(error.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width={400}
        bgcolor="white"
        border="3px solid black"
        boxShadow={25}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{ transform: 'translate(-50%, -50%)' }}
      >
        <Typography variant="h5">{authModal === 'signin' ? 'Sign In' : 'Sign Up'}</Typography>
        <Stack spacing={2}>
          <TextField
            variant="outlined"
            fullWidth
            label="Email"
            name="email"
            value={authData.email}
            onChange={handleAuthChange}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={authData.password}
            onChange={handleAuthChange}
          />
          {authModal === 'signup' && (
            <TextField
              variant="outlined"
              fullWidth
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={authData.confirmPassword}
              onChange={handleAuthChange}
            />
          )}
          <Button variant="contained" color="primary" onClick={handleAuthSubmit}>
            {authModal === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
          <Button
            variant="text"
            onClick={() => setAuthModal(authModal === 'signin' ? 'signup' : 'signin')}
          >
            {authModal === 'signin' ? 'Create an Account' : 'Already have an account? Sign In'}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default Authentication;
