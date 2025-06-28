import { useState, useEffect, useRef } from 'react';
import styles from '../styles/admin.module.css';

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
  const [activeTab, setActiveTab] = useState('flags'); // 'flags' or 'continents'
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

  // JWT token for API requests
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchFlags();
      fetchContinents();
    }
  }, [isAuthenticated]);

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

  const handleFileUpload = async (file, isEdit = false) => {
    if (!file) return;

    const setUploading = isEdit ? setUploadingEditImage : setUploadingImage;
    setUploading(true);

    try {
      // Convert file to base64
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
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const { url, fileName } = await response.json();

        if (isEdit) {
          setEditingFlag(prev => ({
            ...prev,
            image_url: url,
            fileName: fileName
          }));
        } else {
          setNewFlag(prev => ({
            ...prev,
            image_url: url,
            fileName: fileName
          }));
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
                    onChange={(e) => handleFileUpload(e.target.files[0])}
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
                                  onChange={(e) => handleFileUpload(e.target.files[0], true)}
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
    </div>
  );
};

export default AdminPage; 