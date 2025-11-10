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
import { auth, firestore } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import SignIn from './components/SignIn';
import styles from './styles/Home.module.css';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [log, setLog] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
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
    if (!itemName || !itemCount) {
      alert('Please fill in both item name and count');
      return;
    }

    const newItem = {
      name: itemName,
      count: parseInt(itemCount),
      category: category || 'Uncategorized',
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
      alert('Failed to add item. Please try again.');
    }
  };

  const deleteItem = async (id) => {
    const item = inventory.find(i => i.id === id);
    try {
      await deleteDoc(doc(firestore, 'inventory', id));
      setLog(prev => [...prev, { ...item, action: 'deleted' }]);
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const filteredItems = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <Box className={styles.background}>
      <Box className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h3" className={styles.heading}>
            Pantry Management
          </Typography>
          <Tooltip title="Sign Out">
            <IconButton onClick={() => signOut(auth)} color="error">
              <Logout />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ marginBottom: '20px' }} />

        <Box className={styles.inputGroup}>
          <TextField
            label="Item Name"
            variant="outlined"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Count"
            type="number"
            variant="outlined"
            value={itemCount}
            onChange={(e) => setItemCount(e.target.value)}
          />
          <TextField
            label="Category"
            variant="outlined"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={addItem}
            className={styles.addButton}
          >
            Add
          </Button>
        </Box>

        <TextField
          label="Search Items"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ marginBottom: '20px' }}
        />

        <Box className={styles.inventoryList}>
          {filteredItems.length ? (
            filteredItems.map(item => (
              <Box key={item.id} className={styles.inventoryItem}>
                <Box className={styles.itemInfo}>
                  <Typography variant="h6" className={styles.itemName}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2">
                    Count: {item.count}
                  </Typography>
                  <Typography variant="body2">
                    Category: {item.category || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Added: {new Date(item.dateAdded).toLocaleString()}
                  </Typography>
                </Box>
                <IconButton onClick={() => deleteItem(item.id)} color="error">
                  <Delete />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography align="center" color="textSecondary">
              No items found.
            </Typography>
          )}
        </Box>

        <Divider sx={{ margin: '30px 0' }} />

        <Typography variant="h5" className={styles.logHeading}>
          Activity Log
        </Typography>
        <Box className={styles.activityLog}>
          {log.length ? (
            log.slice(-10).reverse().map((entry, idx) => (
              <Box key={idx} className={styles.logEntry}>
                <Typography variant="body1">
                  {entry.name} - <strong>{entry.action}</strong>
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(entry.dateAdded).toLocaleString()}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography align="center" color="textSecondary">
              No recent activity.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
