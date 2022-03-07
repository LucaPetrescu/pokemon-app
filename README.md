# pokemon-app

This is the final product of the pokemon-app. 

My task was to design a small app that will:

1.	Create a new pokemon
2.	Update an existing pokemon by id
3.	Delete a pokemon by id
4.	Read details about a pokemon by id
5.	Read the list of all pokemons default sorted descending by weight
6.	Delete all pokemons

First of all, the app connects

1. Create a new pokemon
    This request is handled by the /create-pokemon route. It takes the input from the body as a raw JSON (in POSTMAN) and it adds it to the database.
