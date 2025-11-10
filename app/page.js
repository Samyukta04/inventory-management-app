'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Fade,
  Card,
  CardContent,
  Grid,
  Divider,
  Autocomplete,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Close,
  Search,
  Logout,
  CalendarToday,
  Category as CategoryIcon,
  ClearAll,
  Edit,
  MoreVert,
  TrendingUp,
  Inventory2,
  Download,
  Delete,
  Sort,
  DarkMode,
  LightMode,
  Warning
} from '@mui/icons-material';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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
  const [category, setCategory] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [log, setLog] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filterCategory, setFilterCategory] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedItems, setSelectedItems] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const body = document.querySelector('body');
      if (body) {
        if (darkMode) {
          body.classList.add('dark-mode');
        } else {
          body.classList.remove('dark-mode');
        }
      }
    }
  }, [darkMode]);


  const addItem = async () => {
    if (!itemName || !itemCount) return;

    const newItem = {
      name: itemName,
      count: parseInt(itemCount),
      category: category || 'Uncategorized',
      expiryDate: expiryDate || null,
      dateAdded: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(firestore, 'inventory'), newItem);
      setLog(prev => [...prev, { ...newItem, id: docRef.id, action: 'added' }]);
      setItemName('');
      setItemCount('');
      setCategory(null);
      setExpiryDate('');
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

  const bulkDelete = async () => {
    try {
      await Promise.all(selectedItems.map(id => deleteDoc(doc(firestore, 'inventory', id))));
      setSelectedItems([]);
    } catch (err) {
      console.error('Error bulk deleting:', err);
    }
  };

  const updateItemQuantity = async (id, newCount) => {
    try {
      await updateDoc(doc(firestore, 'inventory', id), { count: newCount });
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const openEditDialog = (item) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      count: item.count,
      category: item.category,
      expiryDate: item.expiryDate || ''
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      await updateDoc(doc(firestore, 'inventory', editingItem.id), {
        name: editingItem.name,
        count: parseInt(editingItem.count),
        category: editingItem.category,
        expiryDate: editingItem.expiryDate || null
      });
      setEditDialogOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Quantity', 'Category', 'Expiry Date', 'Date Added'];
    const csvData = inventory.map(item => [
      item.name,
      item.count,
      item.category,
      item.expiryDate || 'N/A',
      new Date(item.dateAdded).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pantry-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearActivityLog = () => {
    setLog([]);
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const sortedAndFilteredItems = inventory
    .filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'count':
          aVal = parseInt(a.count) || 0;
          bVal = parseInt(b.count) || 0;
          break;
        case 'expiryDate':
          aVal = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          bVal = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          break;
        case 'dateAdded':
        default:
          aVal = new Date(a.dateAdded).getTime();
          bVal = new Date(b.dateAdded).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const uniqueCategories = [...new Set(inventory.map(item => item.category).filter(Boolean))];
  const categories = ['All', ...uniqueCategories];

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isLowStock = (count) => {
    return parseInt(count) <= lowStockThreshold;
  };

  const totalItems = inventory.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);
  const expiringCount = inventory.filter(item => isExpiringSoon(item.expiryDate)).length;
  const expiredCount = inventory.filter(item => isExpired(item.expiryDate)).length;
  const lowStockCount = inventory.filter(item => isLowStock(item.count)).length;

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <Box className={`${styles.background} ${darkMode ? styles.darkMode : ''}`}>
      <Box className={styles.navbar}>
        <Box className={styles.navLeft}>
          <Inventory2 className={styles.navIcon} />
          <Typography variant="h6" className={styles.logo}>
            Pantry Manager
          </Typography>
        </Box>
        <Box className={styles.navRight}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                icon={<LightMode />}
                checkedIcon={<DarkMode />}
              />
            }
            label=""
          />
          <Typography variant="body2" className={styles.userName}>
            {user.displayName}
          </Typography>
          <Avatar src={user.photoURL} className={styles.avatar} />
          <IconButton onClick={() => signOut(auth)} className={styles.logoutBtn}>
            <Logout fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box className={styles.container}>
        <Box className={styles.statsBar}>
          <Box className={styles.statItem}>
            <Typography variant="h4" className={styles.statNumber}>{inventory.length}</Typography>
            <Typography variant="body2" className={styles.statLabel}>Items</Typography>
          </Box>
          <Box className={styles.statItem}>
            <Typography variant="h4" className={styles.statNumber}>{totalItems}</Typography>
            <Typography variant="body2" className={styles.statLabel}>Total Quantity</Typography>
          </Box>
          <Box className={styles.statItem}>
            <Typography variant="h4" className={styles.statNumber} style={{ color: '#ff9800' }}>{expiringCount}</Typography>
            <Typography variant="body2" className={styles.statLabel}>Expiring Soon</Typography>
          </Box>
          <Box className={styles.statItem}>
            <Typography variant="h4" className={styles.statNumber} style={{ color: '#f44336' }}>{expiredCount}</Typography>
            <Typography variant="body2" className={styles.statLabel}>Expired</Typography>
          </Box>
          <Box className={styles.statItem}>
            <Typography variant="h4" className={styles.statNumber} style={{ color: '#ff5722' }}>{lowStockCount}</Typography>
            <Typography variant="body2" className={styles.statLabel}>Low Stock</Typography>
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          className={styles.tabs}
        >
          <Tab label="Inventory" className={styles.tab} />
          <Tab
            label={
              <Badge badgeContent={log.length} color="primary" max={99}>
                Activity
              </Badge>
            }
            className={styles.tab}
          />
        </Tabs>

        {tabValue === 0 && (
          <Fade in={true}>
            <Box className={styles.content}>
              <Box className={styles.addSection}>
                <Typography variant="h5" className={styles.sectionTitle}>
                  Add New Item
                </Typography>
                <Grid container spacing={2} className={styles.inputGrid}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Item name"
                      variant="outlined"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      fullWidth
                      className={styles.input}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Quantity"
                      type="number"
                      variant="outlined"
                      value={itemCount}
                      onChange={(e) => setItemCount(e.target.value)}
                      fullWidth
                      className={styles.input}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Autocomplete
                      freeSolo
                      options={uniqueCategories}
                      value={category}
                      onChange={(e, newValue) => setCategory(newValue)}
                      onInputChange={(e, newInputValue) => setCategory(newInputValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Category"
                          variant="outlined"
                          className={styles.input}
                        />
                      )}
                    />

                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Expiry date"
                      type="date"
                      variant="outlined"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      className={styles.input}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={2}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={addItem}
                      fullWidth
                      className={styles.addButton}
                      disabled={!itemName || !itemCount}
                    >
                      Add Item
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider className={styles.divider} />

              <Box className={styles.filterSection}>
                <Box className={styles.filterRow}>
                  <TextField
                    placeholder="Search items..."
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search className={styles.searchIcon} />,
                    }}
                    className={styles.searchInput}
                  />

                  <Box className={styles.filterControls}>
                    <FormControl size="small" className={styles.sortSelect}>
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        label="Sort By"
                      >
                        <MenuItem value="dateAdded">Date Added</MenuItem>
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="count">Quantity</MenuItem>
                        <MenuItem value="expiryDate">Expiry Date</MenuItem>
                      </Select>
                    </FormControl>

                    <IconButton
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className={styles.sortOrderBtn}
                    >
                      <Sort style={{ transform: sortOrder === 'desc' ? 'scaleY(-1)' : 'none' }} />
                    </IconButton>

                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={exportToCSV}
                      className={styles.exportBtn}
                    >
                      Export CSV
                    </Button>

                    {selectedItems.length > 0 && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={bulkDelete}
                        className={styles.bulkDeleteBtn}
                      >
                        Delete ({selectedItems.length})
                      </Button>
                    )}
                  </Box>
                </Box>

                <Box className={styles.categoryFilters}>
                  {categories.map(cat => (
                    <Chip
                      key={cat}
                      label={`${cat} (${cat === 'All' ? inventory.length : inventory.filter(i => i.category === cat).length})`}
                      onClick={() => setFilterCategory(cat)}
                      className={filterCategory === cat ? styles.activeChip : styles.chip}
                    />
                  ))}
                </Box>
              </Box>

              <Grid container spacing={3} className={styles.inventoryGrid}>
                {sortedAndFilteredItems.length ? (
                  sortedAndFilteredItems.map(item => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card className={`${styles.itemCard} ${isExpired(item.expiryDate) ? styles.expiredCard : isExpiringSoon(item.expiryDate) ? styles.expiringSoonCard : isLowStock(item.count) ? styles.lowStockCard : ''}`}>
                        <CardContent className={styles.cardContent}>
                          <Box className={styles.cardHeader}>
                            <Box className={styles.cardHeaderLeft}>
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                                size="small"
                              />
                              <Typography variant="h6" className={styles.itemName}>
                                {item.name}
                              </Typography>
                            </Box>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, item)}
                                className={styles.menuBtn}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          <Box className={styles.itemInfo}>
                            <Box className={styles.quantityBox}>
                              <IconButton
                                size="small"
                                onClick={() => updateItemQuantity(item.id, Math.max(0, item.count - 1))}
                                className={styles.quantityBtn}
                              >
                                -
                              </IconButton>
                              <Typography variant="h6" className={styles.quantity}>
                                {item.count}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => updateItemQuantity(item.id, item.count + 1)}
                                className={styles.quantityBtn}
                              >
                                +
                              </IconButton>
                            </Box>
                            <Chip
                              label={item.category}
                              size="small"
                              className={styles.categoryChip}
                              icon={<CategoryIcon />}
                            />
                          </Box>

                          {isLowStock(item.count) && (
                            <Box className={styles.lowStockWarning}>
                              <Warning fontSize="small" />
                              <Typography variant="caption">Low Stock</Typography>
                            </Box>
                          )}

                          {item.expiryDate && (
                            <Box className={styles.expiryInfo}>
                              <CalendarToday fontSize="small" className={styles.calendarIcon} />
                              <Typography variant="caption">
                                {isExpired(item.expiryDate) ? 'Expired' : 'Expires'}: {new Date(item.expiryDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}

                          <Typography variant="caption" className={styles.addedDate}>
                            Added {new Date(item.dateAdded).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box className={styles.emptyState}>
                      <Inventory2 sx={{ fontSize: 64, color: '#999', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        No items found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Start by adding your first item
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Fade>
        )}

        {tabValue === 1 && (
          <Fade in={true}>
            <Box className={styles.content}>
              <Box className={styles.activityHeader}>
                <Typography variant="h5" className={styles.sectionTitle}>
                  Activity Log
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<ClearAll />}
                  onClick={clearActivityLog}
                  className={styles.clearBtn}
                  disabled={log.length === 0}
                >
                  Clear Log
                </Button>
              </Box>

              <Box className={styles.activityLog}>
                {log.length ? (
                  log.slice(-50).reverse().map((entry, idx) => (
                    <Box key={idx} className={styles.logEntry}>
                      <Box className={styles.logLeft}>
                        <Box className={`${styles.logDot} ${entry.action === 'added' ? styles.logDotAdded : styles.logDotDeleted}`} />
                        <Box>
                          <Typography variant="body1">
                            <strong>{entry.name}</strong> was {entry.action}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {entry.category} • Qty: {entry.count}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(entry.dateAdded).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box className={styles.emptyState}>
                    <TrendingUp sx={{ fontSize: 64, color: '#999', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      No activity yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Your activity will appear here
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Item name"
              value={editingItem?.name || ''}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Quantity"
              type="number"
              value={editingItem?.count || ''}
              onChange={(e) => setEditingItem({ ...editingItem, count: e.target.value })}
              fullWidth
            />
            <Autocomplete
              freeSolo
              options={uniqueCategories}
              value={editingItem?.category || ''}
              onChange={(e, newValue) => setEditingItem({ ...editingItem, category: newValue })}
              renderInput={(params) => (
                <TextField {...params} label="Category" />
              )}
            />
            <TextField
              label="Expiry date"
              type="date"
              value={editingItem?.expiryDate || ''}
              onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => openEditDialog(selectedItem)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { deleteItem(selectedItem?.id); handleMenuClose(); }}>
          <ListItemIcon>
            <Close fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
