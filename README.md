# pokemon-app

This is the final product of the pokemon-app. 

My task was to design a small app that will:

1.	Create a new pokemon
2.	Update an existing pokemon by id
3.	Delete a pokemon by id
4.	Read details about a pokemon by id
5.	Return the list with all the pokemons
6.	Delete all pokemons

First of all, the app connects to the database via a MongoURI which is present in the keys.js file in the helpers folder. 
From there, the app connects to the database with the functions offered by the mongoose library. The routes are separated from the main app in the routes.js file located in the routes folder and are imported into the app.js so it makes the code much more cleaner, organised and easier to understand.

The pokemon model is created in the model.js file located in the model folder and it follows the exact structure given in the Microsoft Word document.
The model is then importde in the routes folder for using it in the creation of the pokemons.

1. Create a new pokemon
    This request is handled by the /create-pokemon route. It takes the input from the body as a raw JSON (in POSTMAN) and it adds it to the database.

2. Update an existing pokemon by id
    It is handled by the /update-pokemon route, which takes the id, name, height, weight and abilities parameters from the body and updates the pokemon via id. The coude       looks through the database given the id and finds the desired pokemon.

3. Delete a pokemon by id
    Takes the id of the pokemon and uses it to find the pokemon in the database then deletes it. It is handled by the /delete-pokemon route.

4. Read details about a pokemon by id
    Retrieves a pokemon within the database via id. It is handled by the /get-pokemon-by-id.
 
5. Return the list with all the pokemons
    Retruns all the pokemon entries from the database. This is also a function which is called via the next parameter everytime a change takes place in the database.         Route is handled by the /get-all-pokemons route.
    
6. Delete all pokemons
    Deletes all the pokemons from the database. It is handled by the delete-all-pokemons route.
    
    
Additional routes:
    
        1. get-uris - makes an api call to the pokemonAPI to get the first 20 pokemons with their url's
        2. populate-database - uses the results array from the created json file by the get-uris route to map over it and make a request for every url in the array to              get all the pokemons and the required properties about them. 
        
        Observation: I tried to also implement the feature where the request fetches the first 100 pokemons from teh API and I was partially successful. I tried a                  recursive approach and you can see thoes aproaches in the backup.txt file. 
        
        All the routes were tested using POSTMAN. 
