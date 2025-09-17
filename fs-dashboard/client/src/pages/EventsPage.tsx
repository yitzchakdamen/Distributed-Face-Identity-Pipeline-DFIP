import React, { useState, useEffect } from 'react';
import { getAllEvents } from '../services/eventService';
import type { IEvent } from '../@types/Event';
import EventImageModal from '../components/EventImageModal'; // This will be replaced later
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getAllEvents({ limit: 20 });
        if (response.success && response.data) {
          setEvents(response.data);
        } else {
          setError(response.error || 'Failed to fetch events');
        }
      } catch (err: any) {
        setError(err.message || 'Network error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleViewImage = (event: IEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const getChipColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ margin: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Face Recognition Events
      </Typography>
      <Grid container spacing={3}>
        {events.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No events found.</Typography>
          </Grid>
        ) : (
          events.map((event) => (
            <Grid item key={event._id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.timestamp).toLocaleString()}
                    </Typography>
                    <Chip
                      label={event.level?.toUpperCase() || 'UNKNOWN'}
                      color={getChipColor(event.level)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body1" component="p" gutterBottom>
                    <strong>Person ID:</strong> {event.person_id}
                  </Typography>
                  <Typography variant="body1" component="p" gutterBottom>
                    <strong>Camera:</strong> {event.camera_id}
                  </Typography>
                   <Typography variant="body2" color="text.secondary">
                    Confidence: {(event.metadata.confidence * 100).toFixed(1)}%
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewImage(event)}
                    disabled={!event._id}
                  >
                    View Image
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {selectedEvent && (
        <EventImageModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
};

export default EventsPage;
