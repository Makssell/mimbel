import { useEffect, useState } from 'react';
import supabase from '../lib/supabase'; // Ensure this file exists

const Site1 = () => {
    const [flags, setFlags] = useState([]);

    useEffect(() => {
        async function fetchFlags() {
            const { data, error } = await supabase
                .from('flags')
                .select('name, continent, image_url, territory');

            if (error) {
                console.error('Error fetching flags:', error);
                return;
            }

            setFlags(data);
        }

        fetchFlags();
    }, []);

    return (
        <div>
            <h1>Site 1</h1>
            <p>Welcome to Site XXX!</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {flags.map(flag => (
                    <div key={flag.name} style={{ textAlign: 'center' }}>
                        <img
                            src={flag.image_url}
                            alt={flag.name}
                            width="80"
                            height="50"
                            style={{ border: '1px solid #ddd', borderRadius: '5px' }}
                        />
                        <p style={{ fontSize: '14px', marginTop: '5px' }}>{flag.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Site1;
