import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Paper,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Person {
  person_id: string;
  images: string[];
}

interface Stats {
  total_persons: number;
  total_images: number;
  avg_images_per_person: number;
}

const MongoGallery: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  const fetchPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/mongo/persons');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPersons(data.persons || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const openLightbox = (person: Person, imageIndex: number = 0) => {
    setSelectedPerson(person);
    setLightboxImageIndex(imageIndex);
  };
  const closeLightbox = () => setSelectedPerson(null);

  const nextImage = () => {
    if (selectedPerson) {
      setLightboxImageIndex((prev) => (prev + 1) % selectedPerson.images.length);
    }
  };
  const prevImage = () => {
    if (selectedPerson) {
      setLightboxImageIndex((prev) => (prev - 1 + selectedPerson.images.length) % selectedPerson.images.length);
    }
  };

  if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" action={<Button onClick={fetchPersons}>Retry</Button>}>{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Persons Gallery</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchPersons}>Refresh Data</Button>
      </Box>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}><Paper sx={{p: 2, textAlign: 'center'}}><Typography variant='h5'>{stats.total_persons}</Typography><Typography>Total Persons</Typography></Paper></Grid>
            <Grid item xs={12} sm={4}><Paper sx={{p: 2, textAlign: 'center'}}><Typography variant='h5'>{stats.total_images}</Typography><Typography>Total Images</Typography></Paper></Grid>
            <Grid item xs={12} sm={4}><Paper sx={{p: 2, textAlign: 'center'}}><Typography variant='h5'>{stats.avg_images_per_person.toFixed(1)}</Typography><Typography>Avg Images/Person</Typography></Paper></Grid>
        </Grid>
      )}

      <ImageList variant="masonry" cols={4} gap={8}>
        {persons.map((person) => (
          <ImageListItem key={person.person_id} sx={{cursor: 'pointer'}}>
            <img src={person.images[0]} alt={person.person_id} loading="lazy" onClick={() => openLightbox(person, 0)} />
            <ImageListItemBar
              title={`Person: ${person.person_id.substring(0, 8)}...`}
              subtitle={`${person.images.length} images`}
              actionIcon={
                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.54)' }} onClick={() => openLightbox(person, 0)}>
                  <InfoIcon />
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog open={!!selectedPerson} onClose={closeLightbox} maxWidth="lg" fullWidth>
        <DialogTitle>
            Person: {selectedPerson?.person_id.substring(0, 10)}...
            <Typography variant="caption" sx={{ml: 2}}>({lightboxImageIndex + 1} / {selectedPerson?.images.length})</Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
            <IconButton onClick={prevImage}><ArrowBackIosNewIcon /></IconButton>
            <Box component="img" src={selectedPerson?.images[lightboxImageIndex]} alt="lightbox" sx={{ maxHeight: '80vh', maxWidth: '80%', objectFit: 'contain' }} />
            <IconButton onClick={nextImage}><ArrowForwardIosIcon /></IconButton>
        </DialogContent>
        <DialogActions>
            <Button onClick={closeLightbox}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MongoGallery;
