// MongoDB Gallery component for displaying persons and their images

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MongoGallery.css';

interface Person {
  person_id: string;
  images: string[];
}

interface Stats {
  total_persons: number;
  total_images: number;
  avg_images_per_person: number;
  max_images_for_single_person: number;
  min_images_for_single_person: number;
}

const MongoGallery: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  // Fetch persons data from MongoDB API
  const fetchPersons = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/mongo/persons');
      const data = response.data;
      setPersons(data.persons || []);
      setStats(data.stats || {});
    } catch (err: any) {
      console.error('Error fetching persons:', err);
      if (err.response?.status === 503) {
        setError('MongoDB service is not available in production environment');
      } else if (err.response?.status === 504) {
        setError('MongoDB operation timed out. The database may be overloaded. Please try again later.');
      } else {
        setError(err.response?.data?.message || err.message || `HTTP error! status: ${err.response?.status || 'unknown'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  // Open lightbox for person images
  const openLightbox = (person: Person, imageIndex: number = 0) => {
    setSelectedPerson(person);
    setLightboxImageIndex(imageIndex);
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedPerson(null);
    setLightboxImageIndex(0);
  };

  // Navigate lightbox images
  const nextImage = () => {
    if (selectedPerson && lightboxImageIndex < selectedPerson.images.length - 1) {
      setLightboxImageIndex(lightboxImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (lightboxImageIndex > 0) {
      setLightboxImageIndex(lightboxImageIndex - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedPerson) {
        switch (e.key) {
          case 'Escape':
            closeLightbox();
            break;
          case 'ArrowRight':
            nextImage();
            break;
          case 'ArrowLeft':
            prevImage();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedPerson, lightboxImageIndex]);

  if (loading) {
    return (
      <div className="mongo-gallery">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading persons data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mongo-gallery">
        <div className="error">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchPersons} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mongo-gallery">
      <header className="gallery-header">
        <h1>MongoDB Persons Gallery</h1>
        <button onClick={fetchPersons} className="refresh-btn">
          Refresh Data
        </button>
      </header>

      {/* Statistics */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Persons</h3>
            <div className="stat-value">{stats.total_persons}</div>
          </div>
          <div className="stat-card">
            <h3>Total Images</h3>
            <div className="stat-value">{stats.total_images}</div>
          </div>
          <div className="stat-card">
            <h3>Avg Images per Person</h3>
            <div className="stat-value">{stats.avg_images_per_person.toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <h3>Max Images</h3>
            <div className="stat-value">{stats.max_images_for_single_person}</div>
          </div>
        </div>
      )}

      {/* Persons Grid */}
      <div className="persons-grid">
        {persons.map((person) => (
          <div key={person.person_id} className="person-card">
            <div className="person-header">
              <span className="person-id">Person {person.person_id.substring(0, 8)}...</span>
              <span className="image-count">{person.images.length} images</span>
            </div>
            
            {person.images.length > 0 ? (
              <div className="person-image-container">
                <img
                  src={person.images[0]}
                  alt={`Person ${person.person_id}`}
                  className="person-image"
                  onClick={() => openLightbox(person, 0)}
                />
                {person.images.length > 1 && (
                  <div className="image-overlay">
                    +{person.images.length - 1} more
                  </div>
                )}
              </div>
            ) : (
              <div className="no-image">
                <div className="no-image-icon">📷</div>
                <p>No images available</p>
              </div>
            )}
            
            <div className="person-footer">
              <button
                onClick={() => openLightbox(person, 0)}
                className="view-images-btn"
                disabled={person.images.length === 0}
              >
                View Images
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPerson && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeLightbox}>
              ×
            </button>
            
            <div className="lightbox-header">
              <h3>Person {selectedPerson.person_id.substring(0, 10)}...</h3>
              <span className="image-counter">
                {lightboxImageIndex + 1} / {selectedPerson.images.length}
              </span>
            </div>
            
            <div className="lightbox-image-container">
              {selectedPerson.images.length > 1 && (
                <button 
                  className="nav-btn nav-prev" 
                  onClick={prevImage}
                  disabled={lightboxImageIndex === 0}
                >
                  ‹
                </button>
              )}
              
              <img
                src={selectedPerson.images[lightboxImageIndex]}
                alt={`Person ${selectedPerson.person_id} - Image ${lightboxImageIndex + 1}`}
                className="lightbox-image"
              />
              
              {selectedPerson.images.length > 1 && (
                <button 
                  className="nav-btn nav-next" 
                  onClick={nextImage}
                  disabled={lightboxImageIndex === selectedPerson.images.length - 1}
                >
                  ›
                </button>
              )}
            </div>
            
            {/* Thumbnails */}
            {selectedPerson.images.length > 1 && (
              <div className="thumbnails-container">
                {selectedPerson.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${index === lightboxImageIndex ? 'active' : ''}`}
                    onClick={() => setLightboxImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MongoGallery;
