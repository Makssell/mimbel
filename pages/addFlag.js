import { useState } from 'react';
import supabase from '../lib/supabase';

const AddFlag = () => {
  const [name, setName] = useState('');
  const [continent, setContinent] = useState('');
  const [territory, setTerritory] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name || !continent || !image) {
      setMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Upload the image to Supabase storage
    const { data, error: uploadError } = await supabase.storage
      .from('flags')
      .upload(`${name.toLowerCase()}.jpg`, image);

    if (uploadError) {
      setMessage(`Error uploading image: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    // Get the public URL of the uploaded image
    const { publicURL, error: urlError } = supabase.storage
      .from('flags')
      .getPublicUrl(`${name.toLowerCase()}.jpg`);

    if (urlError) {
      setMessage(`Error fetching image URL: ${urlError.message}`);
      setLoading(false);
      return;
    }

    // Insert the flag data into the Supabase table
    const { error: insertError } = await supabase.from('flags').insert([
      {
        name,
        continent,
        image_url: publicURL,
        territory,
      },
    ]);

    if (insertError) {
      setMessage(`Error adding flag: ${insertError.message}`);
      setLoading(false);
      return;
    }

    setMessage('Flag added successfully!');
    setLoading(false);
    setName('');
    setContinent('');
    setTerritory(false);
    setImage(null);
  };

  return (
    <div>
      <h1>Add Flag</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Country Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter country name"
            required
          />
        </div>

        <div>
          <label>Continent</label>
          <select
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
            required
          >
            <option value="">Select continent</option>
            <option value="Africa">Africa</option>
            <option value="Asia">Asia</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Oceania">Oceania</option>
            <option value="Antarctica">Antarctica</option>
          </select>
        </div>

        <div>
          <label>Is it a Territory?</label>
          <input
            type="checkbox"
            checked={territory}
            onChange={() => setTerritory(!territory)}
          />
        </div>

        <div>
          <label>Flag Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Add Flag'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AddFlag;
