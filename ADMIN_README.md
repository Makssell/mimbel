# Flag Game Admin Panel

This document describes the admin functionality for the Flag Game, which allows you to manage flags, countries, and continents through a web interface.

## Accessing the Admin Panel

1. Navigate to the main page of the flag game
2. Click on the "Admin" link (red button)
3. Enter the admin password
4. Click "Login"

## Features

### Flag Management

The admin panel allows you to:

- **View all flags**: See a complete list of all flags in the game with their images, country names, and continent assignments
- **Add new flags**: Add new countries/territories to the game
- **Edit existing flags**: Modify country names, flag images, continent assignments, and territory status
- **Delete flags**: Remove flags from the game (with confirmation)

### Continent Management

You can also manage continents:

- **View all continents**: See a list of all continents in the game
- **Add new continents**: Create new continent categories
- **Edit continent names**: Modify existing continent names
- **Delete continents**: Remove continents (only if no flags are assigned to them)

## How to Use

### Adding a New Flag

1. Click the "Add New Flag" button
2. Fill in the required information:
   - **Country name**: The name of the country or territory
   - **Flag image URL**: URL to the flag image (optional)
   - **Continent**: Select the continent this country belongs to (optional)
   - **Territory**: Check this box if it's a territory rather than a sovereign country
3. Click "Add Flag"

### Editing a Flag

1. Find the flag you want to edit in the list
2. Click the "Edit" button
3. Modify the information as needed
4. Click "Save" to apply changes or "Cancel" to discard changes

### Deleting a Flag

1. Find the flag you want to delete in the list
2. Click the "Delete" button
3. Confirm the deletion in the popup dialog

### Managing Continents

1. Click on the "Continents" tab
2. Use the "Add New Continent" button to create new continents
3. Edit or delete continents as needed
4. Note: You cannot delete a continent that has flags assigned to it

## Security

- The admin panel is protected by a simple password system
- In production, you should change this password to something more secure
- Consider implementing proper authentication for production use

## API Endpoints

The admin panel uses the following API endpoints:

- `GET /api/admin/flags` - Get all flags
- `POST /api/admin/flags` - Add a new flag
- `PUT /api/admin/flags` - Update an existing flag
- `DELETE /api/admin/flags?id={id}` - Delete a flag

- `GET /api/admin/continents` - Get all continents
- `POST /api/admin/continents` - Add a new continent
- `PUT /api/admin/continents` - Update an existing continent
- `DELETE /api/admin/continents?id={id}` - Delete a continent

## Database Structure

The admin panel works with the following database tables:

- `flags`: Stores flag information (id, name, territory, image_url)
- `continents`: Stores continent information (id, name)
- `country_continent`: Junction table linking flags to continents

## Tips for Maintaining the Game

1. **Keep flag images up to date**: Ensure flag image URLs are working and current
2. **Verify country names**: Make sure country names are spelled correctly and consistently
3. **Organize by continents**: Properly assign countries to continents for better game organization
4. **Mark territories appropriately**: Use the territory checkbox for non-sovereign territories
5. **Regular backups**: Consider backing up your database regularly

## Troubleshooting

- **Images not loading**: Check that the image URLs are valid and accessible
- **Changes not saving**: Ensure you have proper database permissions
- **Cannot delete continent**: Make sure no flags are assigned to the continent you want to delete
- **Login issues**: Verify you're using the correct admin password

## Customization

You can customize the admin panel by:

- Changing the admin password in the code
- Modifying the CSS styles in `admin.module.css`
- Adding additional fields or functionality as needed
- Implementing more sophisticated authentication

For questions or issues, refer to the main project documentation or contact the development team.
