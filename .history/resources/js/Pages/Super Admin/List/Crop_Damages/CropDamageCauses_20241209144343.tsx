import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Button, Modal, Box, TextField } from '@mui/material';
import axios from 'axios';

const CropDamageCauses = () => {
  const [cropDamageCauses, setCropDamageCauses] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', desc: '' });
  const [isEdit, setIsEdit] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/crop-damage-causes');
      setCropDamageCauses(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (data = { id: null, name: '', desc: '' }) => {
    setIsEdit(!!data.id);
    setFormData(data);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await axios.put(`/api/crop-damage-causes/${formData.id}`, formData);
      } else {
        await axios.post('/api/crop-damage-causes', formData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/crop-damage-causes/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'desc', headerName: 'Description', width: 300 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleOpen(params.row)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
            style={{ marginLeft: 8 }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>Crop Damage Causes</h1>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add Cause
      </Button>
      <DataGrid
        rows={cropDamageCauses}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        components={{ Toolbar: GridToolbar }}
      />
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <h2>{isEdit ? 'Edit Cause' : 'Add Cause'}</h2>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            style={{ marginTop: 16 }}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default CropDamageCauses;
