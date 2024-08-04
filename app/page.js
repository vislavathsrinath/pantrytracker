'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Modal, Stack, TextField, Typography, Button, InputAdornment, AppBar, Toolbar, Container, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { auth, firestore } from '@/firebase'; // Ensure firebase initialization is correct
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, query, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics'; // Import necessary Firebase Analytics functions

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
  const [analytics, setAnalytics] = useState(null);

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

  useEffect(() => {
    const initializeAnalytics = async () => {
      if (typeof window !== 'undefined') {
        const supported = await isSupported();
        if (supported) {
          const analytics = getAnalytics();
          setAnalytics(analytics);
        }
      }
    };
    initializeAnalytics();
  }, []);

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
          <TextField
            label="Search Inventory"
            variant="outlined"
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
          <Grid container spacing={2} marginTop={2}>
            {filteredInventory.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.name}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  sx={{ backgroundColor: '#fff', borderRadius: 2, padding: 2, boxShadow: 3 }}
                >
                  <Image
                    src={imageMap[item.name.toLowerCase()] || '/images/placeholder.jpeg'}
                    alt={item.name}
                    width={200}
                    height={200}
                    style={{ borderRadius: '8px' }}
                  />
                  <Typography variant="h6" sx={{ marginTop: 1 }}>
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Typography>
                  <Typography variant="body1">
                    Quantity: {item.quantity}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box display="flex" gap={2} marginTop={2}>
            <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>
              Add Item
            </Button>
            <Button variant="contained" color="secondary" onClick={() => setOpenRemoveModal(true)}>
              Remove Item
            </Button>
          </Box>
        </Box>
      )}

      {/* Add Item Modal */}
      <Modal open={openAddModal} onClose={handleCloseModal}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: '80vw',
            maxWidth: '500px',
            height: '50vh',
            backgroundColor: '#fff',
            margin: 'auto',
            borderRadius: 2,
            padding: 2,
            boxShadow: 3,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Typography variant="h6" gutterBottom>Add Item to Inventory</Typography>
          <TextField
            label="Item Name"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quantity"
            type="number"
            variant="outlined"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              addItem(itemName, itemQuantity);
              handleCloseModal();
            }}
            sx={{ marginTop: 2 }}
          >
            Add Item
          </Button>
        </Box>
      </Modal>

      {/* Remove Item Modal */}
      <Modal open={openRemoveModal} onClose={handleCloseModal}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: '80vw',
            maxWidth: '500px',
            height: '50vh',
            backgroundColor: '#fff',
            margin: 'auto',
            borderRadius: 2,
            padding: 2,
            boxShadow: 3,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Typography variant="h6" gutterBottom>Remove Item from Inventory</Typography>
          <TextField
            label="Item Name"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quantity to Remove"
            type="number"
            variant="outlined"
            value={removeQuantity}
            onChange={(e) => setRemoveQuantity(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              removeItem(itemName, removeQuantity);
              handleCloseModal();
            }}
            sx={{ marginTop: 2 }}
          >
            Remove Item
          </Button>
        </Box>
      </Modal>

      {/* Authentication Modal */}
      <Modal open={openAuthModal} onClose={handleCloseModal}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: '80vw',
            maxWidth: '500px',
            height: '50vh',
            backgroundColor: '#fff',
            margin: 'auto',
            borderRadius: 2,
            padding: 2,
            boxShadow: 3,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Typography>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            value={authData.email}
            onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={authData.password}
            onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
            fullWidth
            margin="normal"
          />
          {authMode === 'signup' && (
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={authData.confirmPassword}
              onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
              fullWidth
              margin="normal"
            />
          )}
          {authError && (
            <Typography color="error" variant="body2" sx={{ marginTop: 1 }}>
              {authError}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleAuthSubmit}
            sx={{ marginTop: 2 }}
          >
            {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
