'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Modal, Stack, TextField, Typography, Button, InputAdornment, AppBar, Toolbar, Container, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { auth, firestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, query, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';

// Image map for pantry items
const imageMap = {
  'chicken': '/images/whole-chicken.jpg',
  'carrots': '/images/carrots.jpg',
  'ginger': '/images/ginger.jpg',
  'milk': '/images/milk.jpg',
  'garlic': '/images/garlic.jpg',
  'potatoes': '/images/potatoes.jpg',
  'oranges': '/images/oranges.jpg',
  'red onions': '/images/red-onions.jpg',
  'white onions': '/images/white-onions.jpg',
  'eggs': '/images/eggs.jpg',
  'apples': '/images/apples.jpg',
  'tomatoes': '/images/tomatoes.jpg',
  'beef': '/images/beef.jpg',
  'bread': '/images/bread.jpg',
  'corn': '/images/corn.jpg',
  'salt': '/images/salt.jpg',
  'sugar': '/images/sugar.jpg',
  'toor dal': '/images/toor-dal.jpg',
  'water': '/images/tomatoes.jpg',
  // Add more mappings as needed
};

// Random background images
const backgrounds = [
  '/images/backgroundimage.jpg',
  '/images/backgroundimage2.jpg',

  // Add more background images as needed
];

// Utility function to get a random background image
const getRandomBackground = () => backgrounds[Math.floor(Math.random() * backgrounds.length)];

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [authData, setAuthData] = useState({ email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [removeQuantity, setRemoveQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);

  // Update inventory list from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  // Add item to inventory
  const addItem = async (item, quantity) => {
    if (!item || !quantity || quantity <= 0) return;
    const itemNameLower = item.toLowerCase();
    const docRef = doc(collection(firestore, 'inventory'), itemNameLower);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }
    await updateInventory();
  };

  // Remove item from inventory
  const removeItem = async (item, quantity) => {
    if (!item || !quantity || quantity <= 0) return;
    const itemNameLower = item.toLowerCase();
    const docRef = doc(collection(firestore, 'inventory'), itemNameLower);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      if (existingQuantity <= quantity) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: existingQuantity - quantity });
      }
      await updateInventory();
    }
  };

  useEffect(() => {
    if (user) {
      updateInventory();
    }
  }, [user]);

  useEffect(() => {
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [searchQuery, inventory]);

  // Handle authentication submit
  const handleAuthSubmit = async () => {
    try {
      if (authMode === 'signup') {
        if (authData.password !== authData.confirmPassword) {
          setAuthError('Passwords do not match');
          return;
        }
        await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        alert('Account created successfully');
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        alert('Signed in successfully');
      }
      setAuthError('');
      setUser(auth.currentUser);
      setOpenAuthModal(false);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      alert('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  // Clear modals and states on modal close
  const handleCloseModal = () => {
    setOpenAuthModal(false);
    setOpenAddModal(false);
    setOpenRemoveModal(false);
    setAuthData({ email: '', password: '', confirmPassword: '' });
    setAuthError('');
    setItemName('');
    setItemQuantity(1);
    setRemoveQuantity(1);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ 
        backgroundImage: `url(${getRandomBackground()})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <AppBar position="static" sx={{ background: '#333' }}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Pantry Management by Srinath Vislavath
          </Typography>
          {user && (
            <Button color="inherit" onClick={handleSignOut}>
              Sign Out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {!user ? (
        <Container
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 4, borderRadius: 2, marginTop: 4 }}
        >
          <Typography variant="h3" gutterBottom>Welcome to Pantry Management</Typography>
          <Typography variant="h5" gutterBottom>by Srinath Vislavath</Typography>
          <Box display="flex" gap={2} marginTop={2}>
            <Button variant="contained" color="primary" onClick={() => { setAuthMode('signin'); setOpenAuthModal(true); }}>
              Sign In
            </Button>
            <Button variant="contained" color="secondary" onClick={() => { setAuthMode('signup'); setOpenAuthModal(true); }}>
              Sign Up
            </Button>
          </Box>
        </Container>
      ) : (
        <Box
  display="flex"
  flexDirection="column"
  alignItems="center"
  gap={2}
  sx={{ marginTop: 4, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 2, borderRadius: 2 }}
>
  <Stack
    direction="row"
    spacing={2}
    alignItems="center"
    justifyContent="center"
    sx={{ width: '100%', marginBottom: 2 }}
  >
    <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>
      Add New Item
    </Button>
    <Button variant="contained" color="primary" onClick={() => setOpenRemoveModal(true)}>
      Remove Item
    </Button>
    <TextField
      variant="outlined"
      label="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  </Stack>

  <Grid container spacing={2} sx={{ maxWidth: '1200px' }}>
    {filteredInventory.map((item, index) => (
      <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          sx={{
            backgroundColor: '#f5f5f5',
            padding: 2,
            borderRadius: 1,
            boxShadow: 1,
            width: '100%',
            minWidth: '120px', // Adjust as needed
          }}
        >
          <Image
            src={imageMap[item.name.toLowerCase()] || '/placeholder.jpeg'}
            alt={item.name}
            width={80} // Adjust size as needed
            height={80} // Adjust size as needed
          />
          <Typography variant="body2" sx={{ marginTop: 1 }}>{item.name}</Typography>
          <Typography variant="body2">{item.quantity}</Typography>
        </Box>
      </Grid>
    ))}
  </Grid>
</Box>
      )}

      {/* Authentication Modal */}
      <Modal open={openAuthModal} onClose={handleCloseModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          bgcolor="background.paper"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant="h6">{authMode === 'signup' ? 'Sign Up' : 'Sign In'}</Typography>
          <TextField
            variant="outlined"
            fullWidth
            label="Email"
            type="email"
            value={authData.email}
            onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Password"
            type="password"
            value={authData.password}
            onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
          />
          {authMode === 'signup' && (
            <TextField
              variant="outlined"
              fullWidth
              label="Confirm Password"
              type="password"
              value={authData.confirmPassword}
              onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
            />
          )}
          {authError && <Typography color="error">{authError}</Typography>}
          <Button variant="contained" color="primary" onClick={handleAuthSubmit}>
            {authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </Button>
        </Box>
      </Modal>

      {/* Add Item Modal */}
      <Modal open={openAddModal} onClose={handleCloseModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          bgcolor="background.paper"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant="h6">Add New Item</Typography>
          <TextField
            variant="outlined"
            fullWidth
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Quantity"
            type="number"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(parseInt(e.target.value, 10))}
          />
          <Button variant="contained" color="primary" onClick={() => addItem(itemName, itemQuantity)}>
            Add Item
          </Button>
        </Box>
      </Modal>

      {/* Remove Item Modal */}
      <Modal open={openRemoveModal} onClose={handleCloseModal}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          bgcolor="background.paper"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <Typography variant="h6">Remove Item</Typography>
          <TextField
            variant="outlined"
            fullWidth
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Quantity"
            type="number"
            value={removeQuantity}
            onChange={(e) => setRemoveQuantity(parseInt(e.target.value, 10))}
          />
          <Button variant="contained" color="primary" onClick={() => removeItem(itemName, removeQuantity)}>
            Remove Item
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
