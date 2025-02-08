import supabase from '../../lib/supabase';

export default async function handler(req, res) {
    const { data, error } = await supabase
        .from('flags')
        .select('*')
        .order('continent');

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
}
