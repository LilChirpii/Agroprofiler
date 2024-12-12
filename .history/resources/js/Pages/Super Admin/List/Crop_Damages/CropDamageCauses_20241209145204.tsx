import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Button, Modal, Box, TextField } from '@mui/material';
import axios from 'axios';
import Authenticated from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ToastContainer } from 'react-toastify';
import { PageProps } from '@/types';
import { Pencil, Trash } from 'lucide-react';

const CropDamageCauses = ({auth} : PageProps) => {
  const [cropDamageCauses, setCropDamageCauses] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', desc: '' });
  const [isEdit, setIsEdit] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('/crop-damage-causes');
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
        await axios.put(`/crop-damage-causes/${formData.id}`, formData);
      } else {
        await axios.post('/crop-damage-causes', formData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/crop-damage-causes/${id}`);
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


          <button
                style={{ marginRight: 5 }}
                onClick={() => handleOpen(params.row)}
            >
                        <Pencil size={20} color="green" />
                    </button>

          <button onClick={() => handleDelete(params.row.id)}>
            <Trash size={20} color="red" />
        </button>
        </>
      ),
    },
  ];

  return (
    <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Crop Damages List
                </h2>
            }
        >
            <Head title="Crop Damage causes List" />
            <ToastContainer />
    <div style={{ height: 600, width: '100%' }}>
      <h1>Crop Damage Causes</h1>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add Cause
      </Button>
      <Box
                sx={{ height: "450px", padding: "10px", borderRadius: "10px" }}
            >
      <DataGrid
        rows={cropDamageCauses}
        columns={columns}
        initialState={{
            pagination: {
                paginationModel: { pageSize: 50 },
            },
        }}
        pageSizeOptions={[50, 100, 200, 350, 500]}
        slots={{ toolbar: GridToolbar }}
      />
      </Box>
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
    </Authenticated>
  );
};

export default CropDamageCauses;
