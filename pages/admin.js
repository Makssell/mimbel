import { useState, useEffect, useRef } from 'react';
import styles from '../styles/admin.module.css';

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
  const [activeTab, setActiveTab] = useState('flags'); // 'flags', 'continents', 'regional-countries', 'division-types', 'regional-flags'
  const [newFlag, setNewFlag] = useState({
    name: '',
    territory: false,
    image_url: '',
    continent_id: ''
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
  const [territoryFilter, setTerritoryFilter] = useState('all'); // 'all', 'countries', 'territories'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'continent', 'territory'

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
    is_active: true
  });
  const [newDivisionType, setNewDivisionType] = useState({
    type_name: '',
    is_active: true
  });
  const [newRegionalFlag, setNewRegionalFlag] = useState({
    name: '',
    image_url: '',
    abbreviation: '',
    code: ''
  });

  // JWT token for API requests
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchFlags();
      fetchContinents();
      fetchRegionalCountries();
    }
  }, [isAuthenticated]);

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

  // Filter and sort flags
  const filteredAndSortedFlags = flags
    .filter(flag => {
      // Search filter
      const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Continent filter
      const matchesContinent = selectedContinentFilter === 'all' || 
        flag.country_continent?.some(cc => cc.continent_id.toString() === selectedContinentFilter);
      
      // Territory filter
      const matchesTerritory = territoryFilter === 'all' || 
        (territoryFilter === 'countries' && !flag.territory) ||
        (territoryFilter === 'territories' && flag.territory);
      
      return matchesSearch && matchesContinent && matchesTerritory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'continent':
          const continentA = a.continents?.[0]?.name || 'Unknown';
          const continentB = b.continents?.[0]?.name || 'Unknown';
          return continentA.localeCompare(continentB);
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
          continent_id: editingFlag.continent_id
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
      setNewFlag({ name: '', territory: false, image_url: '', continent_id: '', fileName: null });
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
      setNewRegionalCountry({ name: '', flag_image_url: '', is_active: true });
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
          is_active: editingRegionalCountry.is_active
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
          ...newRegionalFlag,
          country_id: selectedCountry.id,
          division_type_id: selectedDivisionType.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add regional flag');
      }

      setMessage('Regional flag added successfully!');
      setNewRegionalFlag({ name: '', image_url: '', abbreviation: '', code: '' });
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
          image_url: editingRegionalFlag.image_url,
          abbreviation: editingRegionalFlag.abbreviation,
          code: editingRegionalFlag.code
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
    setNewRegionalFlag({ name: '', image_url: '', abbreviation: '', code: '' });
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
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="Abbreviation (optional, e.g., CA, TX)"
                  value={newRegionalFlag.abbreviation}
                  onChange={(e) => setNewRegionalFlag({ ...newRegionalFlag, abbreviation: e.target.value })}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Code (optional, e.g., US-CA, US-TX)"
                  value={newRegionalFlag.code}
                  onChange={(e) => setNewRegionalFlag({ ...newRegionalFlag, code: e.target.value })}
                  className={styles.input}
                />
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
                        <input
                          type="text"
                          placeholder="Abbreviation"
                          value={editingRegionalFlag.abbreviation || ''}
                          onChange={(e) => setEditingRegionalFlag({ ...editingRegionalFlag, abbreviation: e.target.value })}
                          className={styles.input}
                        />
                        <input
                          type="text"
                          placeholder="Code"
                          value={editingRegionalFlag.code || ''}
                          onChange={(e) => setEditingRegionalFlag({ ...editingRegionalFlag, code: e.target.value })}
                          className={styles.input}
                        />
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
                          {regionalFlag.abbreviation && <p>Abbr: {regionalFlag.abbreviation}</p>}
                          {regionalFlag.code && <p>Code: {regionalFlag.code}</p>}
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
    </div>
  );
};

export default AdminPage; 