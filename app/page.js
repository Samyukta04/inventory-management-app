// Updated Pantry Management App with Google Sign-In Integration & Prettier UI

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { AddCircle, Delete, Logout } from '@mui/icons-material';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import styled from '@emotion/styled';
import backgroundImage from '../public/background.jpg';
import SignIn from '../app/SignIn';

const Background = styled(Box)({
  backgroundImage: `url(${backgroundImage.src})`,
  backgroundSize: 'cover',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
});

const Container = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  padding: '30px',
  maxWidth: '900px',
  width: '100%',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
});

const StyledHeading = styled(Typography)({
  fontFamily: 'Segoe UI',
  fontWeight: '700',
  fontSize: '2.5rem',
  color: '#1e88e5',
  marginBottom: '10px',
});

const InputGroup = styled(Box)({
  display: 'flex',
  gap: '10px',
  marginBottom: '20px',
  flexWrap: 'wrap',
});

const InventoryItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  border: '1px solid #ccc',
  borderRadius: '10px',
  marginBottom: '12px',
  backgroundColor: '#f5f5f5',
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [log, setLog] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(firestore, 'inventory'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInventory(items);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const addItem = async () => {
    if (!itemName || !itemCount) return;
    const newItem = {
      name: itemName,
      count: parseInt(itemCount),
      category,
      dateAdded: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(firestore, 'inventory'), newItem);
      setLog(prev => [...prev, { ...newItem, id: docRef.id, action: 'added' }]);
      setItemName('');
      setItemCount('');
      setCategory('');
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const deleteItem = async (id) => {
    const item = inventory.find(i => i.id === id);
    try {
      await deleteDoc(doc(firestore, 'inventory', id));
      setLog(prev => [...prev, { ...item, action: 'deleted' }]);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const filteredItems = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return <Background><Container><SignIn onSignIn={setUser} /></Container></Background>;

  return (
    <Background>
      <Container>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <StyledHeading>Pantry Management</StyledHeading>
          <Tooltip title="Sign Out">
            <IconButton onClick={() => signOut(auth)}><Logout /></IconButton>
          </Tooltip>
        </Box>

        <InputGroup>
          <TextField label="Item" value={itemName} onChange={(e) => setItemName(e.target.value)} fullWidth />
          <TextField label="Count" type="number" value={itemCount} onChange={(e) => setItemCount(e.target.value)} />
          <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Button variant="contained" startIcon={<AddCircle />} onClick={addItem}>Add</Button>
        </InputGroup>

        <TextField
          label="Search Items"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ marginBottom: '20px' }}
        />

        <Divider sx={{ mb: 2 }} />

        {filteredItems.length ? filteredItems.map(item => (
          <InventoryItem key={item.id}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2">Count: {item.count}</Typography>
                <Typography variant="body2">Category: {item.category || 'N/A'}</Typography>
                <Typography variant="caption">Added: {new Date(item.dateAdded).toLocaleString()}</Typography>
              </Box>
              <Tooltip title="Delete">
                <IconButton onClick={() => deleteItem(item.id)} color="error">
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </InventoryItem>
        )) : (
          <Typography variant="body1" color="textSecondary">No items found.</Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Activity Log</Typography>
        {log.length ? log.map((entry, idx) => (
          <Box key={idx} mb={1} p={2} bgcolor="#e8f5e9" borderRadius={2}>
            <Typography variant="body1">{entry.name} - {entry.action}</Typography>
            <Typography variant="caption">{new Date(entry.dateAdded).toLocaleString()}</Typography>
          </Box>
        )) : (
          <Typography>No recent activity.</Typography>
        )}
      </Container>
    </Background>
  );
}
