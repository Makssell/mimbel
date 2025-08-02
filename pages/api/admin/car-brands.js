import { supabaseAdmin } from '../../../lib/supabase-admin';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
    // JWT token authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    switch (req.method) {
        case 'GET':
            try {
                const { data, error } = await supabaseAdmin
                    .from('car_brands')
                    .select('*')
                    .order('name');

                if (error) throw error;
                res.status(200).json(data);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
            break;

        case 'POST':
            try {
                const { name, logo_url, region, is_defunct, founded_year, country_of_origin, parent_company } = req.body;

                if (!name || !logo_url || !region) {
                    return res.status(400).json({ error: 'Name, logo_url, and region are required' });
                }

                const { data, error } = await supabaseAdmin
                    .from('car_brands')
                    .insert([{
                        name,
                        logo_url,
                        region,
                        is_defunct: is_defunct || false,
                        founded_year,
                        country_of_origin,
                        parent_company
                    }])
                    .select();

                if (error) throw error;
                res.status(201).json(data[0]);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id, name, logo_url, region, is_defunct, founded_year, country_of_origin, parent_company } = req.body;

                if (!id) {
                    return res.status(400).json({ error: 'ID is required' });
                }

                const updateData = {};
                if (name !== undefined) updateData.name = name;
                if (logo_url !== undefined) updateData.logo_url = logo_url;
                if (region !== undefined) updateData.region = region;
                if (is_defunct !== undefined) updateData.is_defunct = is_defunct;
                if (founded_year !== undefined) updateData.founded_year = founded_year;
                if (country_of_origin !== undefined) updateData.country_of_origin = country_of_origin;
                if (parent_company !== undefined) updateData.parent_company = parent_company;

                const { data, error } = await supabaseAdmin
                    .from('car_brands')
                    .update(updateData)
                    .eq('id', id)
                    .select();

                if (error) throw error;
                res.status(200).json(data[0]);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;

                if (!id) {
                    return res.status(400).json({ error: 'ID is required' });
                }

                const { error } = await supabaseAdmin
                    .from('car_brands')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                res.status(200).json({ message: 'Car brand deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 