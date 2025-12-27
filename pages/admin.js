import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/admin.module.css';

// Dynamically import MapOutlineSelector and MapOutlineViewer to avoid SSR issues
const MapOutlineSelector = dynamic(() => import('../components/MapOutlineSelector'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading map...</div>
});

const MapOutlineViewer = dynamic(() => import('../components/MapOutlineViewer'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading map...</div>
});

// Image compression function
const compressImage = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set maximum dimensions for flags (higher quality for flags)
      const maxWidth = 1200;
      const maxHeight = 900;
      
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Determine best format based on file type
      const isPNG = file.type === 'image/png';
      const outputType = isPNG ? 'image/png' : 'image/jpeg';
      const quality = isPNG ? 1.0 : 0.9; // PNG for transparency, higher JPEG quality
      
      // Convert to blob with quality setting
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, {
          type: outputType,
          lastModified: Date.now()
        }));
      }, outputType, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

const AdminPage = () => {
  // Check if admin access should be restricted to localhost
  const shouldRestrictToLocalhost = process.env.NEXT_PUBLIC_RESTRICT_ADMIN_TO_LOCALHOST === 'true';
  
  if (shouldRestrictToLocalhost && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return (
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <h1>Admin Access Restricted</h1>
          <p>Admin access is currently restricted to localhost for security reasons.</p>
          <p>To enable admin access from other domains, set NEXT_PUBLIC_RESTRICT_ADMIN_TO_LOCALHOST=false in your environment variables.</p>
        </div>
      </div>
    );
  }

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [flags, setFlags] = useState([]);
  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingFlag, setEditingFlag] = useState(null);
  const [editingContinent, setEditingContinent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddContinentForm, setShowAddContinentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('flags'); // 'flags', 'continents', 'subregions', 'regional-countries', 'division-types', 'regional-flags', 'feedback', 'challenges', 'map-outlines', 'geojson-editor'
  const [newFlag, setNewFlag] = useState({
    name: '',
    territory: false,
    image_url: '',
    continent_id: '',
    subregion: ''
  });
  const [newContinent, setNewContinent] = useState({
    name: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinentFilter, setSelectedContinentFilter] = useState('all');
  const [selectedSubregionFilter, setSelectedSubregionFilter] = useState('all');
  const [territoryFilter, setTerritoryFilter] = useState('all'); // 'all', 'countries', 'territories'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'continent', 'territory', 'subregion'

  // Regional management states
  const [regionalCountries, setRegionalCountries] = useState([]);
  const [divisionTypes, setDivisionTypes] = useState([]);
  const [regionalFlags, setRegionalFlags] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedDivisionType, setSelectedDivisionType] = useState(null);
  const [showAddRegionalCountryForm, setShowAddRegionalCountryForm] = useState(false);
  const [showAddDivisionTypeForm, setShowAddDivisionTypeForm] = useState(false);
  const [showAddRegionalFlagForm, setShowAddRegionalFlagForm] = useState(false);
  const [editingRegionalCountry, setEditingRegionalCountry] = useState(null);
  const [editingDivisionType, setEditingDivisionType] = useState(null);
  const [editingRegionalFlag, setEditingRegionalFlag] = useState(null);
  const [newRegionalCountry, setNewRegionalCountry] = useState({
    name: '',
    flag_image_url: '',
    is_active: true,
    featured: false
  });
  const [newDivisionType, setNewDivisionType] = useState({
    type_name: '',
    is_active: true
  });
  const [newRegionalFlag, setNewRegionalFlag] = useState({
    name: '',
    image_url: ''
  });

  // Feedback management states
  const [feedback, setFeedback] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState('all');

  // Challenges management states
  const [challenges, setChallenges] = useState([]);
  const [challengeSearchTerm, setChallengeSearchTerm] = useState('');
  const [challengeStatusFilter, setChallengeStatusFilter] = useState('all'); // 'all', 'active', 'expired'

  // Map outlines management states
  const [mapOutlines, setMapOutlines] = useState([]);
  const [editingMapOutline, setEditingMapOutline] = useState(null);
  const [viewingMapOutline, setViewingMapOutline] = useState(null);
  const [showMapTester, setShowMapTester] = useState(false);
  const [showMapViewer, setShowMapViewer] = useState(false);
  const [mapOutlineSearchTerm, setMapOutlineSearchTerm] = useState('');
  const [mapOutlineFilter, setMapOutlineFilter] = useState('all'); // 'all', 'with-outline', 'without-outline'

  // GeoJSON features editor states
  const [geojsonFeatures, setGeojsonFeatures] = useState([]);
  const [editingGeojsonFeature, setEditingGeojsonFeature] = useState(null);
  const [geojsonSearchTerm, setGeojsonSearchTerm] = useState('');
  const [geojsonFilter, setGeojsonFilter] = useState('all'); // 'all', 'missing-iso', 'has-iso'
  const [geojsonFileName, setGeojsonFileName] = useState('');

  // JWT token for API requests
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchFlags();
      fetchContinents();
      fetchRegionalCountries();
      fetchFeedback();
      fetchChallenges();
      fetchMapOutlines();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'geojson-editor') {
      fetchGeojsonFeatures();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (selectedCountry) {
      fetchDivisionTypes(selectedCountry.id);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedDivisionType) {
      fetchRegionalFlags(selectedDivisionType.id);
    }
  }, [selectedDivisionType]);

  // Get unique subregions from flags
  const uniqueSubregions = [...new Set(flags.map(f => f.subregion).filter(Boolean))].sort();

  // Filter and sort flags
  const filteredAndSortedFlags = flags
    .filter(flag => {
      // Search filter
      const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Continent filter
      const matchesContinent = selectedContinentFilter === 'all' || 
        flag.country_continent?.some(cc => cc.continent_id.toString() === selectedContinentFilter);
      
      // Subregion filter
      const matchesSubregion = selectedSubregionFilter === 'all' || 
        (selectedSubregionFilter === 'none' && !flag.subregion) ||
        (selectedSubregionFilter !== 'none' && flag.subregion === selectedSubregionFilter);
      
      // Territory filter
      const matchesTerritory = territoryFilter === 'all' || 
        (territoryFilter === 'countries' && !flag.territory) ||
        (territoryFilter === 'territories' && flag.territory);
      
      return matchesSearch && matchesContinent && matchesSubregion && matchesTerritory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'continent':
          const continentA = a.continents?.[0]?.name || 'Unknown';
          const continentB = b.continents?.[0]?.name || 'Unknown';
          return continentA.localeCompare(continentB);
        case 'subregion':
          const subregionA = a.subregion || 'zzz';
          const subregionB = b.subregion || 'zzz';
          if (subregionA === subregionB) {
            return a.name.localeCompare(b.name);
          }
          return subregionA.localeCompare(subregionB);
        case 'territory':
          if (a.territory === b.territory) {
            return a.name.localeCompare(b.name);
          }
          return a.territory ? 1 : -1;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Group flags for display
  const groupedFlags = () => {
    if (sortBy === 'continent') {
      const groups = {};
      filteredAndSortedFlags.forEach(flag => {
        const continentName = flag.continents?.[0]?.name || 'Unknown';
        if (!groups[continentName]) {
          groups[continentName] = [];
        }
        groups[continentName].push(flag);
      });
      return groups;
    } else if (sortBy === 'subregion') {
      const groups = {};
      filteredAndSortedFlags.forEach(flag => {
        const subregionName = flag.subregion || 'No Subregion';
        if (!groups[subregionName]) {
          groups[subregionName] = [];
        }
        groups[subregionName].push(flag);
      });
      return groups;
    } else if (sortBy === 'territory') {
      const groups = {
        'Countries': filteredAndSortedFlags.filter(flag => !flag.territory),
        'Territories': filteredAndSortedFlags.filter(flag => flag.territory)
      };
      return groups;
    } else {
      return { 'All Flags': filteredAndSortedFlags };
    }
  };

  // Filter and sort feedback
  const filteredFeedback = feedback
    .filter(item => {
      // Search filter
      const matchesSearch = !feedbackSearchTerm || 
        item.description.toLowerCase().includes(feedbackSearchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(feedbackSearchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = feedbackStatusFilter === 'all' || item.status === feedbackStatusFilter;
      
      // Category filter
      const matchesCategory = feedbackCategoryFilter === 'all' || item.category === feedbackCategoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Filter challenges
  const filteredChallenges = challenges
    .filter(challenge => {
      // Search filter
      const matchesSearch = !challengeSearchTerm || 
        challenge.challenge_code.toLowerCase().includes(challengeSearchTerm.toLowerCase()) ||
        JSON.stringify(challenge.game_settings || {}).toLowerCase().includes(challengeSearchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = challengeStatusFilter === 'all' || 
        (challengeStatusFilter === 'active' && challenge.is_active) ||
        (challengeStatusFilter === 'expired' && !challenge.is_active);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        setMessage('Successfully logged in!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Login failed');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/flags', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch flags');
      
      const data = await response.json();
      setFlags(data || []);
    } catch (error) {
      setMessage('Error fetching flags: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContinents = async () => {
    try {
      const response = await fetch('/api/admin/continents', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch continents');
      
      const data = await response.json();
      setContinents(data || []);
    } catch (error) {
      setMessage('Error fetching continents: ' + error.message);
    }
  };

  // Regional management API functions
  const fetchRegionalCountries = async () => {
    try {
      const response = await fetch('/api/admin/regional-countries', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch regional countries');
      
      const data = await response.json();
      setRegionalCountries(data || []);
    } catch (error) {
      setMessage('Error fetching regional countries: ' + error.message);
    }
  };

  const fetchDivisionTypes = async (countryId) => {
    try {
      const response = await fetch(`/api/admin/division-types?country_id=${countryId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch division types');
      
      const data = await response.json();
      setDivisionTypes(data || []);
    } catch (error) {
      setMessage('Error fetching division types: ' + error.message);
    }
  };

  const fetchRegionalFlags = async (divisionTypeId) => {
    try {
      const response = await fetch(`/api/admin/regional-flags?division_type_id=${divisionTypeId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch regional flags');
      
      const data = await response.json();
      setRegionalFlags(data || []);
    } catch (error) {
      setMessage('Error fetching regional flags: ' + error.message);
    }
  };

  // Feedback management API functions
  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/admin/feedback', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch feedback');
      
      const data = await response.json();
      setFeedback(data || []);
    } catch (error) {
      setMessage('Error fetching feedback: ' + error.message);
    }
  };

  // Challenges management API functions
  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/admin/challenges', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch challenges');
      
      const data = await response.json();
      setChallenges(data || []);
    } catch (error) {
      setMessage('Error fetching challenges: ' + error.message);
    }
  };

  // Map outlines management API functions
  const fetchMapOutlines = async () => {
    try {
      const response = await fetch('/api/admin/map-outlines', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch map outlines');
      
      const data = await response.json();
      setMapOutlines(data || []);
    } catch (error) {
      setMessage('Error fetching map outlines: ' + error.message);
    }
  };

  // GeoJSON features editor API functions
  const fetchGeojsonFeatures = async () => {
    try {
      const response = await fetch('/api/admin/geojson-features', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch GeoJSON features');
      
      const data = await response.json();
      setGeojsonFeatures(data.features || []);
      setGeojsonFileName(data.fileName || '');
    } catch (error) {
      setMessage('Error fetching GeoJSON features: ' + error.message);
    }
  };

  const handleUpdateGeojsonFeature = async (featureIndex, updates) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/geojson-features', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          featureIndex,
          ...updates,
          fileName: geojsonFileName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update GeoJSON feature');
      }

      setMessage('GeoJSON feature updated successfully!');
      setEditingGeojsonFeature(null);
      fetchGeojsonFeatures();
    } catch (error) {
      setMessage('Error updating GeoJSON feature: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMapOutline = async (flagId, mapOutlineMatch) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/map-outlines', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          flag_id: flagId,
          map_outline_match: mapOutlineMatch
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign map outline');
      }

      setMessage('Map outline assigned successfully!');
      setEditingMapOutline(null);
      setShowMapTester(false);
      fetchMapOutlines();
      fetchFlags(); // Refresh flags to get updated data
    } catch (error) {
      setMessage('Error assigning map outline: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMapOutline = async (flagId) => {
    if (!confirm('Are you sure you want to remove the map outline assignment?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/map-outlines?flag_id=${flagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove map outline');
      }

      setMessage('Map outline removed successfully!');
      fetchMapOutlines();
      fetchFlags();
    } catch (error) {
      setMessage('Error removing map outline: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!confirm('Are you sure you want to delete this challenge? This will also delete all its results.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/challenges?id=${challengeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete challenge');
      }

      setMessage('Challenge deleted successfully!');
      fetchChallenges();
    } catch (error) {
      setMessage('Error deleting challenge: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedback = async (feedbackId, updates) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: feedbackId,
          ...updates
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update feedback');
      }

      setMessage('Feedback updated successfully!');
      setEditingFeedback(null);
      fetchFeedback();
    } catch (error) {
      setMessage('Error updating feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/feedback?id=${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete feedback');
      }

      setMessage('Feedback deleted successfully!');
      fetchFeedback();
    } catch (error) {
      setMessage('Error deleting feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, isEdit = false, target = 'flag') => {
    if (!file) return;

    const setUploading = isEdit ? setUploadingEditImage : setUploadingImage;
    setUploading(true);

    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      // Convert compressed file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            file: base64,
            fileName: file.name
          })
        });

        if (!response.ok) {
          if (response.status === 413) {
            throw new Error('File size too large. Please select a smaller image file.');
          }
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const { url, fileName } = await response.json();

        // Update the appropriate state based on target and edit mode
        if (isEdit) {
          if (target === 'flag') {
            setEditingFlag(prev => ({
              ...prev,
              image_url: url,
              fileName: fileName
            }));
          } else if (target === 'regionalCountry') {
            setEditingRegionalCountry(prev => ({
              ...prev,
              flag_image_url: url
            }));
          } else if (target === 'regionalFlag') {
            setEditingRegionalFlag(prev => ({
              ...prev,
              image_url: url
            }));
          }
        } else {
          if (target === 'flag') {
            setNewFlag(prev => ({
              ...prev,
              image_url: url,
              fileName: fileName
            }));
          } else if (target === 'regionalCountry') {
            setNewRegionalCountry(prev => ({
              ...prev,
              flag_image_url: url
            }));
          } else if (target === 'regionalFlag') {
            setNewRegionalFlag(prev => ({
              ...prev,
              image_url: url
            }));
          }
        }

        setMessage('Image uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setMessage('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (fileName) => {
    if (!fileName) return;

    try {
      const response = await fetch(`/api/admin/delete-image?fileName=${fileName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete image');
      }

      setMessage('Image deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting image: ' + error.message);
    }
  };

  const handleEdit = (flag) => {
    setEditingFlag({
      ...flag,
      continent_id: flag.country_continent?.[0]?.continent_id || '',
      subregion: flag.subregion || '',
      fileName: flag.fileName || null
    });
  };

  const handleSave = async () => {
    if (!editingFlag.name.trim()) {
      setMessage('Country name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/flags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: editingFlag.id,
          name: editingFlag.name,
          territory: editingFlag.territory,
          image_url: editingFlag.image_url,
          continent_id: editingFlag.continent_id,
          subregion: editingFlag.subregion || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update flag');
      }

      setMessage('Flag updated successfully!');
      setEditingFlag(null);
      fetchFlags();
    } catch (error) {
      setMessage('Error updating flag: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flagId, fileName) => {
    if (!confirm('Are you sure you want to delete this flag?')) return;

    setLoading(true);
    try {
      // Delete the image first if it exists
      if (fileName) {
        await handleDeleteImage(fileName);
      }

      const response = await fetch(`/api/admin/flags?id=${flagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete flag');
      }

      setMessage('Flag deleted successfully!');
      fetchFlags();
    } catch (error) {
      setMessage('Error deleting flag: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newFlag.name.trim()) {
      setMessage('Country name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newFlag)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add flag');
      }

      setMessage('Flag added successfully!');
      setNewFlag({ name: '', territory: false, image_url: '', continent_id: '', subregion: '', fileName: null });
      setShowAddForm(false);
      fetchFlags();
    } catch (error) {
      setMessage('Error adding flag: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Continent management functions
  const handleEditContinent = (continent) => {
    setEditingContinent(continent);
  };

  const handleSaveContinent = async () => {
    if (!editingContinent.name.trim()) {
      setMessage('Continent name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/continents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: editingContinent.id,
          name: editingContinent.name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update continent');
      }

      setMessage('Continent updated successfully!');
      setEditingContinent(null);
      fetchContinents();
    } catch (error) {
      setMessage('Error updating continent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContinent = async (continentId) => {
    if (!confirm('Are you sure you want to delete this continent?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/continents?id=${continentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete continent');
      }

      setMessage('Continent deleted successfully!');
      fetchContinents();
    } catch (error) {
      setMessage('Error deleting continent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContinent = async () => {
    if (!newContinent.name.trim()) {
      setMessage('Continent name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/continents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newContinent)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add continent');
      }

      setMessage('Continent added successfully!');
      setNewContinent({ name: '' });
      setShowAddContinentForm(false);
      fetchContinents();
    } catch (error) {
      setMessage('Error adding continent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Regional Country CRUD functions
  const handleAddRegionalCountry = async () => {
    if (!newRegionalCountry.name.trim()) {
      setMessage('Country name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/regional-countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newRegionalCountry)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add regional country');
      }

      setMessage('Regional country added successfully!');
      setNewRegionalCountry({ name: '', flag_image_url: '', is_active: true, featured: false });
      setShowAddRegionalCountryForm(false);
      fetchRegionalCountries();
    } catch (error) {
      setMessage('Error adding regional country: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRegionalCountry = (country) => {
    setEditingRegionalCountry(country);
  };

  const handleSaveRegionalCountry = async () => {
    if (!editingRegionalCountry.name.trim()) {
      setMessage('Country name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/regional-countries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: editingRegionalCountry.id,
          name: editingRegionalCountry.name,
          flag_image_url: editingRegionalCountry.flag_image_url,
          is_active: editingRegionalCountry.is_active,
          featured: editingRegionalCountry.featured
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update regional country');
      }

      setMessage('Regional country updated successfully!');
      setEditingRegionalCountry(null);
      fetchRegionalCountries();
    } catch (error) {
      setMessage('Error updating regional country: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegionalCountry = async (countryId) => {
    if (!confirm('Are you sure you want to delete this regional country? This will also delete all its division types and regional flags.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/regional-countries?id=${countryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete regional country');
      }

      setMessage('Regional country deleted successfully!');
      setSelectedCountry(null);
      setSelectedDivisionType(null);
      fetchRegionalCountries();
    } catch (error) {
      setMessage('Error deleting regional country: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Division Type CRUD functions
  const handleAddDivisionType = async () => {
    if (!selectedCountry) {
      setMessage('Please select a country first!');
      return;
    }
    if (!newDivisionType.type_name.trim()) {
      setMessage('Division type name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/division-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...newDivisionType,
          country_id: selectedCountry.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add division type');
      }

      setMessage('Division type added successfully!');
      setNewDivisionType({ type_name: '', is_active: true });
      setShowAddDivisionTypeForm(false);
      fetchDivisionTypes(selectedCountry.id);
    } catch (error) {
      setMessage('Error adding division type: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDivisionType = (divisionType) => {
    setEditingDivisionType(divisionType);
  };

  const handleSaveDivisionType = async () => {
    if (!editingDivisionType.type_name.trim()) {
      setMessage('Division type name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/division-types', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: editingDivisionType.id,
          type_name: editingDivisionType.type_name,
          is_active: editingDivisionType.is_active
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update division type');
      }

      setMessage('Division type updated successfully!');
      setEditingDivisionType(null);
      fetchDivisionTypes(selectedCountry.id);
    } catch (error) {
      setMessage('Error updating division type: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDivisionType = async (divisionTypeId) => {
    if (!confirm('Are you sure you want to delete this division type? This will also delete all its regional flags.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/division-types?id=${divisionTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete division type');
      }

      setMessage('Division type deleted successfully!');
      setSelectedDivisionType(null);
      fetchDivisionTypes(selectedCountry.id);
    } catch (error) {
      setMessage('Error deleting division type: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Regional Flag CRUD functions
  const handleAddRegionalFlag = async () => {
    if (!selectedDivisionType) {
      setMessage('Please select a division type first!');
      return;
    }
    if (!newRegionalFlag.name.trim()) {
      setMessage('Regional flag name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/regional-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: newRegionalFlag.name,
          image_url: newRegionalFlag.image_url,
          country_id: selectedCountry.id,
          division_type_id: selectedDivisionType.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add regional flag');
      }

      setMessage('Regional flag added successfully!');
      setNewRegionalFlag({ name: '', image_url: '' });
      setShowAddRegionalFlagForm(false);
      fetchRegionalFlags(selectedDivisionType.id);
    } catch (error) {
      setMessage('Error adding regional flag: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRegionalFlag = (regionalFlag) => {
    setEditingRegionalFlag(regionalFlag);
  };

  const handleSaveRegionalFlag = async () => {
    if (!editingRegionalFlag.name.trim()) {
      setMessage('Regional flag name is required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/regional-flags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: editingRegionalFlag.id,
          name: editingRegionalFlag.name,
          image_url: editingRegionalFlag.image_url
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update regional flag');
      }

      setMessage('Regional flag updated successfully!');
      setEditingRegionalFlag(null);
      fetchRegionalFlags(selectedDivisionType.id);
    } catch (error) {
      setMessage('Error updating regional flag: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegionalFlag = async (regionalFlagId) => {
    if (!confirm('Are you sure you want to delete this regional flag?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/regional-flags?id=${regionalFlagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete regional flag');
      }

      setMessage('Regional flag deleted successfully!');
      fetchRegionalFlags(selectedDivisionType.id);
    } catch (error) {
      setMessage('Error deleting regional flag: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthToken('');
    setPassword('');
    setFlags([]);
    setContinents([]);
    setEditingFlag(null);
    setEditingContinent(null);
    setShowAddForm(false);
    setShowAddContinentForm(false);
    setActiveTab('flags');
    setSearchTerm('');
    setSelectedContinentFilter('all');
    setSelectedSubregionFilter('all');
    setTerritoryFilter('all');
    setSortBy('name');
    
    // Reset regional management states
    setRegionalCountries([]);
    setDivisionTypes([]);
    setRegionalFlags([]);
    setSelectedCountry(null);
    setSelectedDivisionType(null);
    setShowAddRegionalCountryForm(false);
    setShowAddDivisionTypeForm(false);
    setShowAddRegionalFlagForm(false);
    setEditingRegionalCountry(null);
    setEditingDivisionType(null);
    setEditingRegionalFlag(null);
    setNewRegionalCountry({ name: '', flag_image_url: '', is_active: true });
    setNewDivisionType({ type_name: '', is_active: true });
    setNewRegionalFlag({ name: '', image_url: '' });
    
    // Reset feedback states
    setFeedback([]);
    setEditingFeedback(null);
    setFeedbackSearchTerm('');
    setFeedbackStatusFilter('all');
    setFeedbackCategoryFilter('all');
    
    // Reset challenges states
    setChallenges([]);
    setChallengeSearchTerm('');
    setChallengeStatusFilter('all');
    
    // Reset map outlines states
    setMapOutlines([]);
    setEditingMapOutline(null);
    setViewingMapOutline(null);
    setShowMapTester(false);
    setShowMapViewer(false);
    setMapOutlineSearchTerm('');
    setMapOutlineFilter('all');
    
    // Reset GeoJSON editor states
    setGeojsonFeatures([]);
    setEditingGeojsonFeature(null);
    setGeojsonSearchTerm('');
    setGeojsonFilter('all');
    setGeojsonFileName('');
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.button}>
              Login
            </button>
          </form>
          {message && <div className={styles.message}>{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Flag Game Admin</h1>
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'flags' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('flags')}
        >
          Flags ({filteredAndSortedFlags.length}/{flags.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'continents' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('continents')}
        >
          Continents ({continents.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'subregions' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('subregions')}
        >
          Subregions ({uniqueSubregions.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'regional-countries' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('regional-countries')}
        >
          Regional Countries ({regionalCountries.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'division-types' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('division-types')}
        >
          Division Types ({divisionTypes.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'regional-flags' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('regional-flags')}
        >
          Regional Flags ({regionalFlags.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'feedback' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback ({filteredFeedback.length}/{feedback.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'challenges' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges ({filteredChallenges.length}/{challenges.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'map-outlines' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('map-outlines')}
        >
          Map Outlines ({mapOutlines.filter(m => m.map_outline_match).length}/{mapOutlines.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'geojson-editor' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('geojson-editor')}
        >
          GeoJSON Editor ({geojsonFeatures.filter(f => f.properties.ISO_A2 === '-99' || f.properties.ISO_A3 === '-99' || !f.properties.ISO_A2 || !f.properties.ISO_A3).length} need fixes)
        </button>
      </div>

      {activeTab === 'flags' && (
        <>
          <div className={styles.actions}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={styles.addButton}
            >
              {showAddForm ? 'Cancel' : 'Add New Flag'}
            </button>
          </div>

          {showAddForm && (
            <div className={styles.addForm}>
              <h3>Add New Flag</h3>
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="Country name"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.uploadSection}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], false, 'flag')}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadButton}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : newFlag.image_url ? 'Change Image' : 'Upload Flag Image'}
                  </button>
                  {newFlag.image_url && (
                    <div className={styles.imagePreview}>
                      <img src={newFlag.image_url} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setNewFlag({ ...newFlag, image_url: '', fileName: null });
                          if (newFlag.fileName) {
                            handleDeleteImage(newFlag.fileName);
                          }
                        }}
                        className={styles.removeImageButton}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <select
                  value={newFlag.continent_id}
                  onChange={(e) => setNewFlag({ ...newFlag, continent_id: e.target.value })}
                  className={styles.select}
                >
                  <option value="">Select Continent</option>
                  {continents.map(continent => (
                    <option key={continent.id} value={continent.id}>
                      {continent.name}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#666' }}>Subregion (optional)</label>
                  <input
                    type="text"
                    list="subregion-list"
                    value={newFlag.subregion}
                    onChange={(e) => setNewFlag({ ...newFlag, subregion: e.target.value })}
                    placeholder="Type or select subregion"
                    className={styles.input}
                  />
                  <datalist id="subregion-list">
                    {uniqueSubregions.map(subregion => (
                      <option key={subregion} value={subregion} />
                    ))}
                  </datalist>
                </div>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={newFlag.territory}
                    onChange={(e) => setNewFlag({ ...newFlag, territory: e.target.checked })}
                  />
                  Territory
                </label>
              </div>
              <button onClick={handleAdd} className={styles.button} disabled={loading}>
                {loading ? 'Adding...' : 'Add Flag'}
              </button>
            </div>
          )}

          <div className={styles.flagsList}>
            <div className={styles.filtersSection}>
              <div className={styles.filtersRow}>
                <input
                  type="text"
                  placeholder="Search flags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <select
                  value={selectedContinentFilter}
                  onChange={(e) => setSelectedContinentFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Continents</option>
                  {continents.map(continent => (
                    <option key={continent.id} value={continent.id}>
                      {continent.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedSubregionFilter}
                  onChange={(e) => setSelectedSubregionFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Subregions</option>
                  <option value="none">No Subregion</option>
                  {uniqueSubregions.map(subregion => (
                    <option key={subregion} value={subregion}>
                      {subregion} ({flags.filter(f => f.subregion === subregion).length})
                    </option>
                  ))}
                </select>
                <select
                  value={territoryFilter}
                  onChange={(e) => setTerritoryFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Types</option>
                  <option value="countries">Countries Only</option>
                  <option value="territories">Territories Only</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="name">Sort by Name</option>
                  <option value="continent">Sort by Continent</option>
                  <option value="subregion">Sort by Subregion</option>
                  <option value="territory">Sort by Type</option>
                </select>
              </div>
              <div className={styles.filterStats}>
                Showing {filteredAndSortedFlags.length} of {flags.length} flags
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            </div>

            <h2>Flags</h2>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.flagsContainer}>
                {Object.entries(groupedFlags()).map(([groupName, groupFlags]) => (
                  <div key={groupName} className={styles.flagGroup}>
                    <h3 className={styles.groupTitle}>
                      {groupName} ({groupFlags.length})
                    </h3>
                    <div className={styles.flagsGrid}>
                      {groupFlags.map(flag => (
                        <div key={flag.id} className={styles.flagCard}>
                          {editingFlag?.id === flag.id ? (
                            <div className={styles.editForm}>
                              <input
                                type="text"
                                value={editingFlag.name}
                                onChange={(e) => setEditingFlag({ ...editingFlag, name: e.target.value })}
                                className={styles.input}
                              />
                              <div className={styles.uploadSection}>
                                <input
                                  type="file"
                                  ref={editFileInputRef}
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e.target.files[0], true, 'flag')}
                                  style={{ display: 'none' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => editFileInputRef.current?.click()}
                                  className={styles.uploadButton}
                                  disabled={uploadingEditImage}
                                >
                                  {uploadingEditImage ? 'Uploading...' : editingFlag.image_url ? 'Change Image' : 'Upload Flag Image'}
                                </button>
                                {editingFlag.image_url && (
                                  <div className={styles.imagePreview}>
                                    <img src={editingFlag.image_url} alt="Preview" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingFlag({ ...editingFlag, image_url: '', fileName: null });
                                        if (editingFlag.fileName) {
                                          handleDeleteImage(editingFlag.fileName);
                                        }
                                      }}
                                      className={styles.removeImageButton}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                              <select
                                value={editingFlag.continent_id}
                                onChange={(e) => setEditingFlag({ ...editingFlag, continent_id: e.target.value })}
                                className={styles.select}
                              >
                                <option value="">Select Continent</option>
                                {continents.map(continent => (
                                  <option key={continent.id} value={continent.id}>
                                    {continent.name}
                                  </option>
                                ))}
                              </select>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#666' }}>Subregion (optional)</label>
                                <input
                                  type="text"
                                  list="subregion-list-edit"
                                  value={editingFlag.subregion || ''}
                                  onChange={(e) => setEditingFlag({ ...editingFlag, subregion: e.target.value })}
                                  placeholder="Type or select subregion"
                                  className={styles.input}
                                />
                                <datalist id="subregion-list-edit">
                                  {uniqueSubregions.map(subregion => (
                                    <option key={subregion} value={subregion} />
                                  ))}
                                </datalist>
                              </div>
                              <label className={styles.checkbox}>
                                <input
                                  type="checkbox"
                                  checked={editingFlag.territory}
                                  onChange={(e) => setEditingFlag({ ...editingFlag, territory: e.target.checked })}
                                />
                                Territory
                              </label>
                              <div className={styles.editActions}>
                                <button onClick={handleSave} className={styles.button} disabled={loading}>
                                  {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setEditingFlag(null)} className={styles.cancelButton}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={styles.flagImage}>
                                {flag.image_url ? (
                                  <img src={flag.image_url} alt={flag.name} />
                                ) : (
                                  <div className={styles.noImage}>No Image</div>
                                )}
                              </div>
                              <div className={styles.flagInfo}>
                                <h3>{flag.name}</h3>
                                <p>Continent: {flag.continents?.[0]?.name || 'Unknown'}</p>
                                {flag.subregion && <p>Subregion: {flag.subregion}</p>}
                                {flag.territory && <span className={styles.territoryBadge}>Territory</span>}
                              </div>
                              <div className={styles.flagActions}>
                                <button onClick={() => handleEdit(flag)} className={styles.editButton}>
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(flag.id, flag.fileName)} className={styles.deleteButton}>
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedFlags()).length === 0 && (
                  <div className={styles.noResults}>
                    No flags found matching your filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'subregions' && (
        <>
          <div className={styles.flagsList}>
            <h2>Subregions</h2>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Subregions are used for better map display bounds calculation. Countries can be assigned to subregions like "middle-east", "caribbean", "southeast-asia", etc.
            </p>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.continentsGrid}>
                {uniqueSubregions.length > 0 ? (
                  uniqueSubregions.map(subregion => {
                    const countriesInSubregion = flags.filter(f => f.subregion === subregion);
                    return (
                      <div key={subregion} className={styles.continentCard}>
                        <div className={styles.continentInfo}>
                          <h3>{subregion}</h3>
                          <p>{countriesInSubregion.length} countr{countriesInSubregion.length === 1 ? 'y' : 'ies'}</p>
                        </div>
                        <div className={styles.flagActions}>
                          <button
                            onClick={() => {
                              setSelectedSubregionFilter(subregion);
                              setActiveTab('flags');
                            }}
                            className={styles.button}
                          >
                            View Countries
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noResults}>
                    No subregions assigned yet. Assign subregions to countries in the Flags tab.
                  </div>
                )}
                <div className={styles.continentCard} style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div className={styles.continentInfo}>
                    <h3>No Subregion</h3>
                    <p>{flags.filter(f => !f.subregion).length} countr{flags.filter(f => !f.subregion).length === 1 ? 'y' : 'ies'}</p>
                  </div>
                  <div className={styles.flagActions}>
                    <button
                      onClick={() => {
                        setSelectedSubregionFilter('none');
                        setActiveTab('flags');
                      }}
                      className={styles.button}
                    >
                      View Countries
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'continents' && (
        <>
          <div className={styles.actions}>
            <button
              onClick={() => setShowAddContinentForm(!showAddContinentForm)}
              className={styles.addButton}
            >
              {showAddContinentForm ? 'Cancel' : 'Add New Continent'}
            </button>
          </div>

          {showAddContinentForm && (
            <div className={styles.addForm}>
              <h3>Add New Continent</h3>
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="Continent name"
                  value={newContinent.name}
                  onChange={(e) => setNewContinent({ name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <button onClick={handleAddContinent} className={styles.button} disabled={loading}>
                {loading ? 'Adding...' : 'Add Continent'}
              </button>
            </div>
          )}

          <div className={styles.flagsList}>
            <h2>Continents</h2>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.continentsGrid}>
                {continents.map(continent => (
                  <div key={continent.id} className={styles.continentCard}>
                    {editingContinent?.id === continent.id ? (
                      <div className={styles.editForm}>
                        <input
                          type="text"
                          value={editingContinent.name}
                          onChange={(e) => setEditingContinent({ ...editingContinent, name: e.target.value })}
                          className={styles.input}
                        />
                        <div className={styles.editActions}>
                          <button onClick={handleSaveContinent} className={styles.button} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditingContinent(null)} className={styles.cancelButton}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.continentInfo}>
                          <h3>{continent.name}</h3>
                        </div>
                        <div className={styles.flagActions}>
                          <button onClick={() => handleEditContinent(continent)} className={styles.editButton}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteContinent(continent.id)} className={styles.deleteButton}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'regional-countries' && (
        <>
          <div className={styles.actions}>
            <button
              onClick={() => setShowAddRegionalCountryForm(!showAddRegionalCountryForm)}
              className={styles.addButton}
            >
              {showAddRegionalCountryForm ? 'Cancel' : 'Add New Regional Country'}
            </button>
          </div>

          {showAddRegionalCountryForm && (
            <div className={styles.addForm}>
              <h3>Add New Regional Country</h3>
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="Country name"
                  value={newRegionalCountry.name}
                  onChange={(e) => setNewRegionalCountry({ ...newRegionalCountry, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.uploadSection}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], false, 'regionalCountry')}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadButton}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : newRegionalCountry.flag_image_url ? 'Change Flag' : 'Upload Country Flag'}
                  </button>
                  {newRegionalCountry.flag_image_url && (
                    <div className={styles.imagePreview}>
                      <img src={newRegionalCountry.flag_image_url} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setNewRegionalCountry({ ...newRegionalCountry, flag_image_url: '' })}
                        className={styles.removeImageButton}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={newRegionalCountry.is_active}
                    onChange={(e) => setNewRegionalCountry({ ...newRegionalCountry, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className={styles.formRow}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={newRegionalCountry.featured}
                    onChange={(e) => setNewRegionalCountry({ ...newRegionalCountry, featured: e.target.checked })}
                  />
                  Featured
                </label>
              </div>
              <button onClick={handleAddRegionalCountry} className={styles.button} disabled={loading}>
                {loading ? 'Adding...' : 'Add Regional Country'}
              </button>
            </div>
          )}

          <div className={styles.flagsList}>
            <h2>Regional Countries</h2>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.flagsGrid}>
                {regionalCountries.map(country => (
                  <div key={country.id} className={styles.flagCard}>
                    {editingRegionalCountry?.id === country.id ? (
                      <div className={styles.editForm}>
                        <input
                          type="text"
                          value={editingRegionalCountry.name}
                          onChange={(e) => setEditingRegionalCountry({ ...editingRegionalCountry, name: e.target.value })}
                          className={styles.input}
                        />
                        <div className={styles.uploadSection}>
                          <input
                            type="file"
                            ref={editFileInputRef}
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], true, 'regionalCountry')}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className={styles.uploadButton}
                            disabled={uploadingEditImage}
                          >
                            {uploadingEditImage ? 'Uploading...' : editingRegionalCountry.flag_image_url ? 'Change Flag' : 'Upload Flag'}
                          </button>
                          {editingRegionalCountry.flag_image_url && (
                            <div className={styles.imagePreview}>
                              <img src={editingRegionalCountry.flag_image_url} alt="Preview" />
                              <button
                                type="button"
                                onClick={() => setEditingRegionalCountry({ ...editingRegionalCountry, flag_image_url: '' })}
                                className={styles.removeImageButton}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={editingRegionalCountry.is_active}
                            onChange={(e) => setEditingRegionalCountry({ ...editingRegionalCountry, is_active: e.target.checked })}
                          />
                          Active
                        </label>
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={editingRegionalCountry.featured}
                            onChange={(e) => setEditingRegionalCountry({ ...editingRegionalCountry, featured: e.target.checked })}
                          />
                          Featured
                        </label>
                        <div className={styles.editActions}>
                          <button onClick={handleSaveRegionalCountry} className={styles.button} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditingRegionalCountry(null)} className={styles.cancelButton}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.flagImage}>
                          {country.flag_image_url ? (
                            <img src={country.flag_image_url} alt={country.name} />
                          ) : (
                            <div className={styles.noImage}>No Flag</div>
                          )}
                        </div>
                        <div className={styles.flagInfo}>
                          <h3>{country.name}</h3>
                          <p>Status: {country.is_active ? 'Active' : 'Inactive'}</p>
                          <p>Featured: {country.featured ? 'Yes' : 'No'}</p>
                          <button
                            onClick={() => {
                              setSelectedCountry(country);
                              setActiveTab('division-types');
                            }}
                            className={styles.button}
                            style={{ marginTop: '10px' }}
                          >
                            Manage Divisions
                          </button>
                        </div>
                        <div className={styles.flagActions}>
                          <button onClick={() => handleEditRegionalCountry(country)} className={styles.editButton}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteRegionalCountry(country.id)} className={styles.deleteButton}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'division-types' && (
        <>
          <div className={styles.actions}>
            {selectedCountry ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Managing: <strong>{selectedCountry.name}</strong>
                </span>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className={styles.secondaryButton}
                >
                  Change Country
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                Please select a country from the Regional Countries tab first
              </div>
            )}
            {selectedCountry && (
              <button
                onClick={() => setShowAddDivisionTypeForm(!showAddDivisionTypeForm)}
                className={styles.addButton}
              >
                {showAddDivisionTypeForm ? 'Cancel' : 'Add Division Type'}
              </button>
            )}
          </div>

          {showAddDivisionTypeForm && selectedCountry && (
            <div className={styles.addForm}>
              <h3>Add Division Type for {selectedCountry.name}</h3>
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="Division type name (e.g., States, Territories)"
                  value={newDivisionType.type_name}
                  onChange={(e) => setNewDivisionType({ ...newDivisionType, type_name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={newDivisionType.is_active}
                    onChange={(e) => setNewDivisionType({ ...newDivisionType, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <button onClick={handleAddDivisionType} className={styles.button} disabled={loading}>
                {loading ? 'Adding...' : 'Add Division Type'}
              </button>
            </div>
          )}

          <div className={styles.flagsList}>
            <h2>Division Types</h2>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : selectedCountry ? (
              <div className={styles.flagsGrid}>
                {divisionTypes.map(divisionType => (
                  <div key={divisionType.id} className={styles.flagCard}>
                    {editingDivisionType?.id === divisionType.id ? (
                      <div className={styles.editForm}>
                        <input
                          type="text"
                          value={editingDivisionType.type_name}
                          onChange={(e) => setEditingDivisionType({ ...editingDivisionType, type_name: e.target.value })}
                          className={styles.input}
                        />
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={editingDivisionType.is_active}
                            onChange={(e) => setEditingDivisionType({ ...editingDivisionType, is_active: e.target.checked })}
                          />
                          Active
                        </label>
                        <div className={styles.editActions}>
                          <button onClick={handleSaveDivisionType} className={styles.button} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditingDivisionType(null)} className={styles.cancelButton}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.flagInfo}>
                          <h3>{divisionType.type_name}</h3>
                          <p>Status: {divisionType.is_active ? 'Active' : 'Inactive'}</p>
                          <button
                            onClick={() => {
                              setSelectedDivisionType(divisionType);
                              setActiveTab('regional-flags');
                            }}
                            className={styles.button}
                            style={{ marginTop: '10px' }}
                          >
                            Manage Regional Flags
                          </button>
                        </div>
                        <div className={styles.flagActions}>
                          <button onClick={() => handleEditDivisionType(divisionType)} className={styles.editButton}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteDivisionType(divisionType.id)} className={styles.deleteButton}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                Please select a country from the Regional Countries tab to manage division types.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'regional-flags' && (
        <>
          <div className={styles.actions}>
            {selectedCountry && selectedDivisionType ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Managing: <strong>{selectedCountry.name}</strong> → <strong>{selectedDivisionType.type_name}</strong>
                </span>
                <button
                  onClick={() => setSelectedDivisionType(null)}
                  className={styles.secondaryButton}
                >
                  Change Division Type
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                Please select a country and division type from the previous tabs first
              </div>
            )}
            {selectedDivisionType && (
              <button
                onClick={() => setShowAddRegionalFlagForm(!showAddRegionalFlagForm)}
                className={styles.addButton}
              >
                {showAddRegionalFlagForm ? 'Cancel' : 'Add Regional Flag'}
              </button>
            )}
          </div>

          {showAddRegionalFlagForm && selectedDivisionType && (
            <div className={styles.addForm}>
              <h3>Add Regional Flag for {selectedCountry.name} - {selectedDivisionType.type_name}</h3>
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="Regional name (e.g., California, Texas)"
                  value={newRegionalFlag.name}
                  onChange={(e) => setNewRegionalFlag({ ...newRegionalFlag, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.uploadSection}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], false, 'regionalFlag')}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadButton}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : newRegionalFlag.image_url ? 'Change Flag' : 'Upload Regional Flag'}
                  </button>
                  {newRegionalFlag.image_url && (
                    <div className={styles.imagePreview}>
                      <img src={newRegionalFlag.image_url} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setNewRegionalFlag({ ...newRegionalFlag, image_url: '' })}
                        className={styles.removeImageButton}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={handleAddRegionalFlag} className={styles.button} disabled={loading}>
                {loading ? 'Adding...' : 'Add Regional Flag'}
              </button>
            </div>
          )}

          <div className={styles.flagsList}>
            <h2>Regional Flags</h2>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : selectedDivisionType ? (
              <div className={styles.flagsGrid}>
                {regionalFlags.map(regionalFlag => (
                  <div key={regionalFlag.id} className={styles.flagCard}>
                    {editingRegionalFlag?.id === regionalFlag.id ? (
                      <div className={styles.editForm}>
                        <input
                          type="text"
                          value={editingRegionalFlag.name}
                          onChange={(e) => setEditingRegionalFlag({ ...editingRegionalFlag, name: e.target.value })}
                          className={styles.input}
                        />
                        <div className={styles.uploadSection}>
                          <input
                            type="file"
                            ref={editFileInputRef}
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], true, 'regionalFlag')}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className={styles.uploadButton}
                            disabled={uploadingEditImage}
                          >
                            {uploadingEditImage ? 'Uploading...' : editingRegionalFlag.image_url ? 'Change Flag' : 'Upload Flag'}
                          </button>
                          {editingRegionalFlag.image_url && (
                            <div className={styles.imagePreview}>
                              <img src={editingRegionalFlag.image_url} alt="Preview" />
                              <button
                                type="button"
                                onClick={() => setEditingRegionalFlag({ ...editingRegionalFlag, image_url: '' })}
                                className={styles.removeImageButton}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                        <div className={styles.editActions}>
                          <button onClick={handleSaveRegionalFlag} className={styles.button} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditingRegionalFlag(null)} className={styles.cancelButton}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.flagImage}>
                          {regionalFlag.image_url ? (
                            <img src={regionalFlag.image_url} alt={regionalFlag.name} />
                          ) : (
                            <div className={styles.noImage}>No Flag</div>
                          )}
                        </div>
                        <div className={styles.flagInfo}>
                          <h3>{regionalFlag.name}</h3>
                        </div>
                        <div className={styles.flagActions}>
                          <button onClick={() => handleEditRegionalFlag(regionalFlag)} className={styles.editButton}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteRegionalFlag(regionalFlag.id)} className={styles.deleteButton}>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                Please select a country and division type from the previous tabs to manage regional flags.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'feedback' && (
        <>
          <div className={styles.flagsList}>
            <div className={styles.filtersSection}>
              <div className={styles.filtersRow}>
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={feedbackSearchTerm}
                  onChange={(e) => setFeedbackSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <select
                  value={feedbackStatusFilter}
                  onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={feedbackCategoryFilter}
                  onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Categories</option>
                  <option value="bug">Bug Report</option>
                  <option value="flag-error">Flag Data Error</option>
                  <option value="feedback">General Feedback</option>
                </select>
              </div>
              <div className={styles.filterStats}>
                Showing {filteredFeedback.length} of {feedback.length} feedback items
                {feedbackSearchTerm && ` matching "${feedbackSearchTerm}"`}
              </div>
            </div>

            <h2>User Feedback</h2>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.feedbackContainer}>
                {filteredFeedback.map(item => (
                  <div key={item.id} className={styles.feedbackCard}>
                    {editingFeedback?.id === item.id ? (
                      <div className={styles.editForm}>
                        <div className={styles.formRow}>
                          <label>Status:</label>
                          <select
                            value={editingFeedback.status}
                            onChange={(e) => setEditingFeedback({ ...editingFeedback, status: e.target.value })}
                            className={styles.select}
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                        <div className={styles.formRow}>
                          <label>Admin Notes:</label>
                          <textarea
                            value={editingFeedback.admin_notes || ''}
                            onChange={(e) => setEditingFeedback({ ...editingFeedback, admin_notes: e.target.value })}
                            className={styles.textarea}
                            rows={3}
                            placeholder="Add internal notes..."
                          />
                        </div>
                        <div className={styles.editActions}>
                          <button 
                            onClick={() => handleUpdateFeedback(item.id, {
                              status: editingFeedback.status,
                              admin_notes: editingFeedback.admin_notes
                            })} 
                            className={styles.button} 
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditingFeedback(null)} className={styles.cancelButton}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.feedbackHeader}>
                          <div className={styles.feedbackMeta}>
                            <span className={`${styles.statusBadge} ${styles[`status${item.status}`]}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                            <span className={styles.categoryBadge}>
                              {item.category === 'bug' ? '🐛 Bug' : 
                               item.category === 'flag-error' ? '🚩 Flag Error' : '💬 Feedback'}
                            </span>
                            <span className={styles.dateBadge}>
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className={styles.feedbackActions}>
                            <button onClick={() => setEditingFeedback(item)} className={styles.editButton}>
                              Edit
                            </button>
                            <button onClick={() => handleDeleteFeedback(item.id)} className={styles.deleteButton}>
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.feedbackContent}>
                          <div className={styles.feedbackDescription}>
                            <h4>Feedback:</h4>
                            <p>{item.description}</p>
                          </div>
                          
                          {item.email && item.email !== 'anonymous' && (
                            <div className={styles.feedbackEmail}>
                              <h4>Contact:</h4>
                              <p>{item.email}</p>
                            </div>
                          )}
                          
                          {item.game_context && Object.keys(item.game_context).length > 0 && (
                            <div className={styles.feedbackContext}>
                              <h4>Game Context:</h4>
                              <div className={styles.contextGrid}>
                                {Object.entries(item.game_context).map(([key, value]) => (
                                  <div key={key} className={styles.contextItem}>
                                    <strong>{key}:</strong> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {item.current_flag && (
                            <div className={styles.feedbackFlag}>
                              <h4>Flag Context:</h4>
                              <div className={styles.flagContext}>
                                <img src={item.current_flag.image_url} alt={item.current_flag.name} />
                                <span>{item.current_flag.name}</span>
                              </div>
                            </div>
                          )}
                          
                          {item.admin_notes && (
                            <div className={styles.feedbackNotes}>
                              <h4>Admin Notes:</h4>
                              <p>{item.admin_notes}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {filteredFeedback.length === 0 && (
                  <div className={styles.noResults}>
                    No feedback found matching your filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'challenges' && (
        <>
          <div className={styles.flagsList}>
            <div className={styles.filtersSection}>
              <div className={styles.filtersRow}>
                <input
                  type="text"
                  placeholder="Search challenges by code or settings..."
                  value={challengeSearchTerm}
                  onChange={(e) => setChallengeSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <select
                  value={challengeStatusFilter}
                  onChange={(e) => setChallengeStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Challenges</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired Only</option>
                </select>
              </div>
              <div className={styles.filterStats}>
                Showing {filteredChallenges.length} of {challenges.length} challenges
                {challengeSearchTerm && ` matching "${challengeSearchTerm}"`}
              </div>
            </div>

            <h2>Challenges</h2>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.challengesContainer}>
                {filteredChallenges.map(challenge => {
                  const settings = challenge.game_settings || {};
                  const createdDate = new Date(challenge.created_at);
                  const expiresDate = new Date(challenge.expires_at);
                  const now = new Date();
                  const isExpired = now > expiresDate;
                  const daysUntilExpiry = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={challenge.id} className={styles.challengeCard}>
                      <div className={styles.challengeHeader}>
                        <div className={styles.challengeMeta}>
                          <h3>Code: {challenge.challenge_code}</h3>
                          <span className={`${styles.statusBadge} ${isExpired ? styles.statusClosed : styles.statusNew}`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                          {!isExpired && (
                            <span className={styles.dateBadge}>
                              Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className={styles.challengeActions}>
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/?challenge=${challenge.challenge_code}`;
                              navigator.clipboard.writeText(url);
                              setMessage('Challenge URL copied to clipboard!');
                              setTimeout(() => setMessage(''), 3000);
                            }}
                            className={styles.button}
                            style={{ marginRight: '10px' }}
                          >
                            Copy URL
                          </button>
                          <button
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.challengeContent}>
                        <div className={styles.challengeInfo}>
                          <div className={styles.infoRow}>
                            <strong>Created:</strong> {createdDate.toLocaleString()}
                          </div>
                          <div className={styles.infoRow}>
                            <strong>Expires:</strong> {expiresDate.toLocaleString()}
                          </div>
                          <div className={styles.infoRow}>
                            <strong>Results:</strong> {challenge.result_count || 0} submission{challenge.result_count !== 1 ? 's' : ''}
                          </div>
                        </div>
                        
                        <div className={styles.challengeSettings}>
                          <h4>Game Settings:</h4>
                          <div className={styles.settingsGrid}>
                            {settings.gameMode && (
                              <div className={styles.settingItem}>
                                <strong>Game Mode:</strong> {settings.gameMode}
                              </div>
                            )}
                            {settings.gameType && (
                              <div className={styles.settingItem}>
                                <strong>Game Type:</strong> {settings.gameType}
                              </div>
                            )}
                            {settings.country && (
                              <div className={styles.settingItem}>
                                <strong>Country:</strong> {settings.country}
                              </div>
                            )}
                            {settings.region && (
                              <div className={styles.settingItem}>
                                <strong>Region:</strong> {settings.region}
                              </div>
                            )}
                            {settings.territories !== undefined && (
                              <div className={styles.settingItem}>
                                <strong>Territories:</strong> {settings.territories ? 'Yes' : 'No'}
                              </div>
                            )}
                            {settings.mode && (
                              <div className={styles.settingItem}>
                                <strong>Mode:</strong> {settings.mode}
                              </div>
                            )}
                            {settings.difficulty && (
                              <div className={styles.settingItem}>
                                <strong>Difficulty:</strong> {settings.difficulty}
                              </div>
                            )}
                            {settings.timeLimit && (
                              <div className={styles.settingItem}>
                                <strong>Time Limit:</strong> {Math.floor(settings.timeLimit / 1000)}s
                              </div>
                            )}
                            {settings.totalQuestions && (
                              <div className={styles.settingItem}>
                                <strong>Total Questions:</strong> {settings.totalQuestions}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredChallenges.length === 0 && (
                  <div className={styles.noResults}>
                    No challenges found matching your filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'map-outlines' && (
        <>
          <div className={styles.flagsList}>
            <div className={styles.filtersSection}>
              <div className={styles.filtersRow}>
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={mapOutlineSearchTerm}
                  onChange={(e) => setMapOutlineSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <select
                  value={mapOutlineFilter}
                  onChange={(e) => setMapOutlineFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Countries</option>
                  <option value="with-outline">With Outline</option>
                  <option value="without-outline">Without Outline</option>
                </select>
              </div>
              <div className={styles.filterStats}>
                Showing {mapOutlines.filter(flag => {
                  const matchesSearch = !mapOutlineSearchTerm || 
                    flag.name.toLowerCase().includes(mapOutlineSearchTerm.toLowerCase());
                  const hasOutline = flag.map_outline_match !== null;
                  const matchesFilter = mapOutlineFilter === 'all' ||
                    (mapOutlineFilter === 'with-outline' && hasOutline) ||
                    (mapOutlineFilter === 'without-outline' && !hasOutline);
                  return matchesSearch && matchesFilter;
                }).length} of {mapOutlines.length} countries
                {mapOutlineFilter === 'all' && ` (${mapOutlines.filter(m => m.map_outline_match).length} with outlines)`}
              </div>
            </div>

            <h2>Map Outline Assignments</h2>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Assign vector map outlines (from GeoJSON) to countries. These outlines can be used in game modes that display country shapes.
            </p>

            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <div className={styles.flagsGrid}>
                {mapOutlines
                  .filter(flag => {
                    // Search filter
                    const matchesSearch = !mapOutlineSearchTerm || 
                      flag.name.toLowerCase().includes(mapOutlineSearchTerm.toLowerCase());
                    
                    // Outline status filter
                    const hasOutline = flag.map_outline_match !== null;
                    const matchesFilter = mapOutlineFilter === 'all' ||
                      (mapOutlineFilter === 'with-outline' && hasOutline) ||
                      (mapOutlineFilter === 'without-outline' && !hasOutline);
                    
                    return matchesSearch && matchesFilter;
                  })
                  .map(flag => {
                    const hasOutline = flag.map_outline_match !== null;
                    const matchData = hasOutline ? (typeof flag.map_outline_match === 'string' 
                      ? JSON.parse(flag.map_outline_match) 
                      : flag.map_outline_match) : null;

                    return (
                      <div key={flag.id} className={styles.flagCard}>
                        <div className={styles.flagInfo}>
                          <h3>{flag.name}</h3>
                          {hasOutline ? (
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#155724' }}>
                                ✓ Map Outline Assigned
                              </p>
                              <div style={{ fontSize: '12px', color: '#155724' }}>
                                {matchData?.ISO_A3 && <div>ISO A3: {matchData.ISO_A3}</div>}
                                {matchData?.ISO_A2 && <div>ISO A2: {matchData.ISO_A2}</div>}
                                {matchData?.NAME && <div>Name: {matchData.NAME}</div>}
                                {matchData?.ADMIN && <div>Admin: {matchData.ADMIN}</div>}
                              </div>
                            </div>
                          ) : (
                            <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
                              No map outline assigned
                            </p>
                          )}
                        </div>
                        <div className={styles.flagActions}>
                          {hasOutline && (
                            <button
                              onClick={() => {
                                setViewingMapOutline(flag);
                                setShowMapViewer(true);
                              }}
                              className={styles.button}
                              style={{ marginRight: '8px' }}
                            >
                              View Outline
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingMapOutline(flag);
                              setShowMapTester(true);
                            }}
                            className={styles.editButton}
                          >
                            {hasOutline ? 'Change' : 'Assign'} Outline
                          </button>
                          {hasOutline && (
                            <button
                              onClick={() => handleRemoveMapOutline(flag.id)}
                              className={styles.deleteButton}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {mapOutlines.filter(flag => {
                  const matchesSearch = !mapOutlineSearchTerm || 
                    flag.name.toLowerCase().includes(mapOutlineSearchTerm.toLowerCase());
                  const hasOutline = flag.map_outline_match !== null;
                  const matchesFilter = mapOutlineFilter === 'all' ||
                    (mapOutlineFilter === 'with-outline' && hasOutline) ||
                    (mapOutlineFilter === 'without-outline' && !hasOutline);
                  return matchesSearch && matchesFilter;
                }).length === 0 && (
                  <div className={styles.noResults}>
                    No countries found matching your filters.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Tester Modal */}
          {showMapTester && editingMapOutline && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: 'white',
                margin: '20px',
                borderRadius: '8px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{ margin: 0 }}>
                    Assign Map Outline: {editingMapOutline.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowMapTester(false);
                      setEditingMapOutline(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Close
                  </button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                  <MapOutlineSelector
                    countryName={editingMapOutline.name}
                    onSelect={(matchData) => {
                      handleAssignMapOutline(editingMapOutline.id, matchData);
                    }}
                    currentMatch={editingMapOutline.map_outline_match}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Map Viewer Modal */}
          {showMapViewer && viewingMapOutline && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                backgroundColor: 'white',
                margin: '20px',
                borderRadius: '8px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{ margin: 0 }}>
                    View Map Outline: {viewingMapOutline.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowMapViewer(false);
                      setViewingMapOutline(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Close
                  </button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                  <MapOutlineViewer
                    countryName={viewingMapOutline.name}
                    mapOutlineMatch={viewingMapOutline.map_outline_match}
                    flagId={viewingMapOutline.id}
                    continents={viewingMapOutline.continents || []}
                    allFlags={flags}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'geojson-editor' && (
        <>
          <div className={styles.flagsList}>
            <div className={styles.filtersSection}>
              <div className={styles.filtersRow}>
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={geojsonSearchTerm}
                  onChange={(e) => setGeojsonSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <select
                  value={geojsonFilter}
                  onChange={(e) => setGeojsonFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Features</option>
                  <option value="missing-iso">Missing ISO Codes (-99 or empty)</option>
                  <option value="has-iso">Has ISO Codes</option>
                </select>
              </div>
              <div className={styles.filterStats}>
                Editing: <strong>{geojsonFileName}</strong> | 
                {geojsonFeatures.length} total features | 
                {geojsonFeatures.filter(f => f.properties.ISO_A2 === '-99' || f.properties.ISO_A3 === '-99' || !f.properties.ISO_A2 || !f.properties.ISO_A3).length} need ISO code fixes
              </div>
            </div>

            <h2>GeoJSON Features Editor</h2>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Edit ISO A2 and ISO A3 codes for vector map features. Countries with -99 or missing values need to be fixed.
            </p>

            {loading && geojsonFeatures.length === 0 ? (
              <div className={styles.loading}>Loading GeoJSON features...</div>
            ) : (
              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 10 }}>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>ISO A2</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>ISO A3</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Admin</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geojsonFeatures
                      .filter(feature => {
                        const matchesSearch = !geojsonSearchTerm || 
                          feature.name.toLowerCase().includes(geojsonSearchTerm.toLowerCase()) ||
                          (feature.properties.ISO_A2 && feature.properties.ISO_A2.toLowerCase().includes(geojsonSearchTerm.toLowerCase())) ||
                          (feature.properties.ISO_A3 && feature.properties.ISO_A3.toLowerCase().includes(geojsonSearchTerm.toLowerCase()));
                        
                        const hasMissingISO = feature.properties.ISO_A2 === '-99' || 
                          feature.properties.ISO_A3 === '-99' || 
                          !feature.properties.ISO_A2 || 
                          !feature.properties.ISO_A3;
                        
                        const matchesFilter = geojsonFilter === 'all' ||
                          (geojsonFilter === 'missing-iso' && hasMissingISO) ||
                          (geojsonFilter === 'has-iso' && !hasMissingISO);
                        
                        return matchesSearch && matchesFilter;
                      })
                      .map((feature) => {
                        const hasMissingISO = feature.properties.ISO_A2 === '-99' || 
                          feature.properties.ISO_A3 === '-99' || 
                          !feature.properties.ISO_A2 || 
                          !feature.properties.ISO_A3;
                        
                        return (
                          <tr 
                            key={feature.index} 
                            style={{ 
                              borderBottom: '1px solid #eee',
                              backgroundColor: hasMissingISO ? '#fff3cd' : 'white'
                            }}
                          >
                            <td style={{ padding: '12px' }}>
                              <strong>{feature.name}</strong>
                              {hasMissingISO && (
                                <span style={{ 
                                  marginLeft: '8px', 
                                  padding: '2px 6px', 
                                  backgroundColor: '#ffc107', 
                                  color: '#000',
                                  borderRadius: '3px',
                                  fontSize: '11px',
                                  fontWeight: 'bold'
                                }}>
                                  NEEDS FIX
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {editingGeojsonFeature?.index === feature.index ? (
                                <input
                                  type="text"
                                  value={editingGeojsonFeature.properties.ISO_A2 || ''}
                                  onChange={(e) => setEditingGeojsonFeature({
                                    ...editingGeojsonFeature,
                                    properties: {
                                      ...editingGeojsonFeature.properties,
                                      ISO_A2: e.target.value
                                    }
                                  })}
                                  style={{
                                    width: '80px',
                                    padding: '4px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                  placeholder="A2"
                                />
                              ) : (
                                <span style={{ 
                                  color: feature.properties.ISO_A2 === '-99' || !feature.properties.ISO_A2 ? '#dc3545' : '#333',
                                  fontWeight: feature.properties.ISO_A2 === '-99' || !feature.properties.ISO_A2 ? 'bold' : 'normal'
                                }}>
                                  {feature.properties.ISO_A2 || 'N/A'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {editingGeojsonFeature?.index === feature.index ? (
                                <input
                                  type="text"
                                  value={editingGeojsonFeature.properties.ISO_A3 || ''}
                                  onChange={(e) => setEditingGeojsonFeature({
                                    ...editingGeojsonFeature,
                                    properties: {
                                      ...editingGeojsonFeature.properties,
                                      ISO_A3: e.target.value
                                    }
                                  })}
                                  style={{
                                    width: '80px',
                                    padding: '4px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                  placeholder="A3"
                                />
                              ) : (
                                <span style={{ 
                                  color: feature.properties.ISO_A3 === '-99' || !feature.properties.ISO_A3 ? '#dc3545' : '#333',
                                  fontWeight: feature.properties.ISO_A3 === '-99' || !feature.properties.ISO_A3 ? 'bold' : 'normal'
                                }}>
                                  {feature.properties.ISO_A3 || 'N/A'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                              {feature.properties.ADMIN || 'N/A'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {editingGeojsonFeature?.index === feature.index ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleUpdateGeojsonFeature(feature.index, {
                                      ISO_A2: editingGeojsonFeature.properties.ISO_A2,
                                      ISO_A3: editingGeojsonFeature.properties.ISO_A3
                                    })}
                                    className={styles.button}
                                    disabled={loading}
                                    style={{ fontSize: '12px', padding: '4px 12px' }}
                                  >
                                    {loading ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => setEditingGeojsonFeature(null)}
                                    className={styles.cancelButton}
                                    style={{ fontSize: '12px', padding: '4px 12px' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingGeojsonFeature({
                                    index: feature.index,
                                    properties: { ...feature.properties },
                                    name: feature.name
                                  })}
                                  className={styles.editButton}
                                  style={{ fontSize: '12px', padding: '4px 12px' }}
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {geojsonFeatures.filter(feature => {
                  const matchesSearch = !geojsonSearchTerm || 
                    feature.name.toLowerCase().includes(geojsonSearchTerm.toLowerCase());
                  const hasMissingISO = feature.properties.ISO_A2 === '-99' || 
                    feature.properties.ISO_A3 === '-99' || 
                    !feature.properties.ISO_A2 || 
                    !feature.properties.ISO_A3;
                  const matchesFilter = geojsonFilter === 'all' ||
                    (geojsonFilter === 'missing-iso' && hasMissingISO) ||
                    (geojsonFilter === 'has-iso' && !hasMissingISO);
                  return matchesSearch && matchesFilter;
                }).length === 0 && (
                  <div className={styles.noResults}>
                    No features found matching your filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage; 