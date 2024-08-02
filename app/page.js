'use client'
import { useState, useEffect } from "react";
import { collection, doc, getDocs, query, deleteDoc, updateDoc, addDoc, where } from "firebase/firestore";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import { firestore } from "./firebase";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filterOpen, setFilterOpen] = useState(false);


    const updatePantry = async () => {
      const snapshot = query(collection(firestore, 'pantry'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    };

    const addItem = async () => {
      if (isNaN(newItemQuantity) || newItemQuantity <= 0) {
        setQuantityError('Please enter a valid quantity (number greater than 0).');
        return;
      }

      setQuantityError('');
      const normalizedItemName = normalizeName(newItemName);
      const itemQuery = query(collection(firestore, 'pantry'), where('name', '==', normalizedItemName));
      const itemDocs = await getDocs(itemQuery);

      if (!itemDocs.empty) {
        // Item already exists, update its quantity
        itemDocs.forEach(async (doc) => {
          const currentQuantity = doc.data().Quantity;
          await updateDoc(doc.ref, { Quantity: parseInt(currentQuantity) + parseInt(newItemQuantity) });
        });
      } else {
        // Item does not exist, add a new item
        await addDoc(collection(firestore, 'pantry'), { name: normalizedItemName, Quantity: parseInt(newItemQuantity) });
      }
      setNewItemName('');
      setNewItemQuantity('');
      updatePantry();
  };

  const editItem = async (itemId, newQuantity) => {
    await updateDoc(doc(firestore, 'pantry', itemId), { Quantity: newQuantity });
    setEditingItem(null);
    setDialogOpen(false);
    updatePantry();
  };

  const removeItem = async (itemId) => {
    await deleteDoc(doc(firestore, 'pantry', itemId));
    updatePantry();
  };

  const normalizeName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };


  useEffect(() => {
    updatePantry();
  }, []);

  const startEdit = (item) => {
    setEditingItem(item);
    setEditQuantity(item.Quantity);
    setDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (editingItem) {
      editItem(editingItem.id, editQuantity);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    if (sortConfig.key === 'Quantity') {
      return sortConfig.direction === 'asc' ? a.Quantity - b.Quantity : b.Quantity - a.Quantity;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }
  });

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#f5f5f5', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <Typography variant="h1" color="initial" gutterBottom sx={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#1976d2' }}>
        Pantry Inventory
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
        <TextField
          label="Item Name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          sx={{ marginRight: '10px', fontSize: '1rem', backgroundColor: '#fff', borderRadius: '4px' }}
        />
        <TextField
          label="Quantity"
          value={newItemQuantity}
          onChange={(e) => {
            setNewItemQuantity(e.target.value);
            setQuantityError(''); // Clear error message on input change
          }}
          type="number"
          sx={{ marginRight: '10px', fontSize: '1rem', backgroundColor: '#fff', borderRadius: '4px' }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={addItem}
          sx={{ height: 'fit-content', fontSize: '1rem', backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#1565c0' } }}
        >
          Add Item
        </Button>
      </Box>
      {quantityError && (
        <Typography color="error" sx={{ marginBottom: '20px', fontSize: '1rem' }}>
          {quantityError}
        </Typography>
      )}

      {/* Fixed filter button */}
      <IconButton
        onClick={() => setFilterOpen(true)}
        color="primary"
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#1976d2',
          color: 'white',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
          fontSize: '1.5rem'
        }}
      >
        <FilterListIcon />
      </IconButton>

      <TableContainer component={Paper} sx={{ maxWidth: '800px', margin: 'auto', marginBottom: '60px', overflowX: 'auto', backgroundColor: '#fff' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSort('name')}
                sx={{
                  cursor: 'pointer',
                  width: '50%',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: '#1976d2',
                  color: '#fff'
                }}
              >
                <Typography variant="h6" component="span">
                  Item Name
                </Typography>
                {sortConfig.key === 'name' && (
                  <Typography component="span" sx={{ fontSize: '1rem' }}>
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </Typography>
                )}
              </TableCell>
              <TableCell
                onClick={() => handleSort('Quantity')}
                sx={{
                  cursor: 'pointer',
                  width: '50%',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: '#1976d2',
                  color: '#fff'
                }}
              >
                <Typography variant="h6" component="span">
                  Quantity
                </Typography>
                {sortConfig.key === 'Quantity' && (
                  <Typography component="span" sx={{ fontSize: '1rem' }}>
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ width: '20%', fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center', padding: '8px', backgroundColor: '#1976d2', color: '#fff' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ textAlign: 'center', fontSize: '1.25rem' }}>
                  {item.name}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontSize: '1.25rem' }}>
                  {item.Quantity}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontSize: '1.25rem' }}>
                  <IconButton onClick={() => startEdit(item)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => removeItem(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Quantity Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Edit Quantity</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Enter the updated quantity for {editingItem?.name}</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            sx={{ marginBottom: '20px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
