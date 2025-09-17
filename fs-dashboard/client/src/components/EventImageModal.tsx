import React, { useState, useEffect } from 'react';
import { getEventImage } from '../services/eventService';
import type { IEvent } from '../@types/Event';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  Alert,
  Grid,
  Divider,
} from '@mui/material';

interface EventImageModalProps {
  event: IEvent;
  isOpen: boolean;
  onClose: () => void;
}

const EventImageModal: React.FC<EventImageModalProps> = ({ event, isOpen, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when modal opens for a new event
    if (isOpen) {
      setImageUrl('');
      setLoading(true);
      setError(null);

      const loadEventImage = async () => {
        if (!event._id) {
            setError("Event ID is missing.");
            setLoading(false);
            return;
        }
        try {
          const imageResult = await getEventImage(event._id);
          if (imageResult.success && imageResult.data) {
            setImageUrl(imageResult.data);
          } else {
            setError(imageResult.error || 'No image available for this event');
          }
        } catch (err) {
          console.error('Error loading event image:', err);
          setError('Failed to load image due to a network or server error.');
        } finally {
          setLoading(false);
        }
      };
      loadEventImage();
    }

    // Cleanup blob URL
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isOpen, event]); // Rerun effect if the event object itself changes

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Event Details</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>Information</Typography>
            <Typography variant="body1" gutterBottom><strong>Person ID:</strong> {event.person_id}</Typography>
            <Typography variant="body1" gutterBottom><strong>Camera:</strong> {event.camera_id}</Typography>
            <Typography variant="body1" gutterBottom><strong>Timestamp:</strong> {new Date(event.timestamp).toLocaleString()}</Typography>
            <Typography variant="body1" gutterBottom><strong>Risk Level:</strong> {event.level?.toUpperCase()}</Typography>
            <Typography variant="body1" gutterBottom><strong>Confidence:</strong> {(event.metadata.confidence * 100).toFixed(1)}%</Typography>
            <Divider sx={{ my: 2 }}/>
            <Typography variant="caption" color="text.secondary">Event ID: {event._id}</Typography>
          </Grid>
          <Grid item xs={12} md={7}>
             <Typography variant="h6" gutterBottom>Event Image</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, border: '1px dashed grey', borderRadius: 1, p: 1 }}>
              {loading && <CircularProgress />}
              {error && !loading && <Alert severity="warning">{error}</Alert>}
              {!loading && !error && imageUrl && (
                <img
                  src={imageUrl}
                  alt={`Event ${event._id}`}
                  style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain' }}
                />
              )}
               {!loading && !error && !imageUrl && <Typography color="text.secondary">No image to display.</Typography>}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventImageModal;
