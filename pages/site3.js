import { createClient } from '@supabase/supabase-js';
const Site3 = () => {



  // Initialize Supabase client
  const supabase = createClient('https://jcucxwulsqjpvlzbpyep.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdWN4d3Vsc3FqcHZsemJweWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMzI0MTEsImV4cCI6MjA1NDYwODQxMX0.1VaopQWCnjelWIG3S8nP6i_PMtHrAIaRnjt-LinhR54');
  
  // Function to fetch flag data with filtering options
  async function fetchFlags(continent = null, showTerritories = true) {
    try {
      // Start building the query
      let query = supabase
        .from('flags')
        .select('id, name, continents, image_url, territory');
  
      // Apply continent filter if provided (using @> for arrays)
      if (continent) {
        query = query.contains('continents', [continent]);
      }
  
      // Apply territory filter based on the showTerritories boolean
      if (showTerritories !== undefined) {
        query = query.eq('territory', showTerritories);
      }
  
      // Execute the query and handle the response
      const { data, error } = await query;
  
      if (error) {
        throw new Error(error.message);
      }
  
      // Save the flag data (you can process this further or store it in state)
      console.log('Flag Data:', data);
      return data;
    } catch (error) {
      // Handle any errors
      console.error('Error fetching flags:', error);
      return null;
    }
  }
  
  // Example usage
  fetchFlags('Africa', false).then((flags) => {
    if (flags) {
      console.log('Fetched flags:', flags);
    } else {
      console.log('No flags found or error occurred');
    }
  });
  
};
export default Site3;