import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const { region, includeDefunct } = req.query;
                
                let query = supabase
                    .from('car_brands')
                    .select('*')
                    .order('name');

                // Filter by region if specified
                if (region && region !== 'world') {
                    query = query.eq('region', region);
                }

                // Filter out defunct brands unless explicitly requested
                if (includeDefunct !== 'true') {
                    query = query.eq('is_defunct', false);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('Error fetching car brands:', error);
                    return res.status(500).json({ error: error.message });
                }

                res.status(200).json(data || []);
            } catch (error) {
                console.error('Error in car-brands API:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
} 