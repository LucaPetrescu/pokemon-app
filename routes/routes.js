const express = require("express");
const router = express.Router();
const fs = require("fs");
const axios = require("axios");
const createError = require("http-errors");
const httpCodes = require("http-status-codes");

const Pokemon = require("../model/model");
const pokemonValidation = require("../helpers/validation");

const pokeAPI = "https://pokeapi.co/api/v2/pokemon/";

//I hope the axios request is ok now

router.get("/populate-database", async (req, res) => {
  try {
    let response = await axios.get(pokeAPI);
    console.log(response.data.next);
    let pokemonsWithAllStats = [];
    let pokemon = {};
    let result = [];
    let finalPokemons = [];
    for (let i = 0; i < 5; i++) {
      let pokemonUrl = response.data.next;
      let urlResponse = await axios.get(pokemonUrl);
      let x = 0;
      while (urlResponse.data.results[x]) {
        result.push(urlResponse.data.results[x]);
        x += 1;
      }
      response = urlResponse;
    }
    //Push all the pokemons in an array
    for (let i = 0; i < result.length; i++) {
      let pokemon = await axios.get(result[i].url);
      pokemonsWithAllStats.push(pokemon.data);
    }
    //Create the pokemon object and push it into a new array
    for (let i = 0; i < pokemonsWithAllStats.length; i++) {
      let pokemonRes = {
        name: pokemonsWithAllStats[i].name,
        height: pokemonsWithAllStats[i].height,
        weight: pokemonsWithAllStats[i].weight,
        abilities: pokemonsWithAllStats[i].abilities.map((ability) => {
          return {
            name: ability.ability.name,
            slot: ability.slot,
            is_hidden: ability.is_hidden,
          };
        }),
        first_held_item:
          pokemonsWithAllStats[i].held_items[0] === undefined
            ? null
            : {
                name: pokemonsWithAllStats[i].held_items[0].item.name,
                url: pokemonsWithAllStats[i].held_items[0].item.url,
              },
      };
      finalPokemons.push(pokemonRes);
    }
    //Using mass add for actualizing the database
    await Pokemon.insertMany(finalPokemons);
    console.log(finalPokemons);
    res.send(finalPokemons);
  } catch (err) {
    let e = createError(500, { error: err.message });
    res.send(e);
  }
});

//Creating a new pokemon with name, height, weight and abilities
router.post("/create-pokemon", async (req, res) => {
  const { value, error } = pokemonValidation(req.body);
  try {
    if (error) {
      let err = createError(404, { error: error.details[0].message });
      res.send(err);
    } else {
      const newPokemon = new Pokemon({
        name: value.name,
        height: value.height,
        weight: value.weight,
        abilities: value.abilities,
      });
      //Save the pokemons in the database
      const newPoke = await newPokemon.save();
      res.status(200).send(newPoke);
    }
  } catch (err) {
    let e = createError(500, { error: err.message });
    res.send(e);
  }
});

//Update a pokemon according to an id
router.post("/update-pokemon", async (req, res) => {
  const { id, name, height, weight, abilities } = req.body;
  const { value, error } = pokemonValidation({
    name,
    height,
    weight,
    abilities,
  });
  try {
    if (error) {
      let err = createError(404, { error: error.details[0].message });
      res.send(err);
    } else {
      //Find the pokemon via id
      const pokemon = await Pokemon.findOne({ _id: id });
      let newPokemon = {
        $set: {
          name: value.name,
          height: value.height,
          weight: value.weight,
          abilities: value.abilities,
        },
      };
      //Update the pokemon with the newo pokemon object
      let updatedPokemon = await Pokemon.updateOne(pokemon, newPokemon);
      res.status(200).send(newPokemon);
    }
  } catch (err) {
    let e = createError(500, { error: err.message });
    res.send(e);
  }
});

//Get the pokemon by id
router.post("/get-pokemon-by-id", async (req, res) => {
  const { id } = req.body;
  //Search the database by id and find the desired pokemon
  try {
    let searchedPokemon = await Pokemon.findOne({ _id: id });
    res.status(200).send(searchedPokemon);
  } catch (err) {
    let e = createError(500, { error: err.message });
    res.send(e);
  }
});

//Delete a pokemon via id
router.post("/delete-pokemon", async (req, res) => {
  //Find the desired pokemon via ID
  try {
    await Pokemon.deleteOne({ _id: req.body.id });
    res.send("NO_CONTENT");
  } catch (err) {
    let e = createError(500, { error: err.message });
    res.send(e);
  }
});

//Deletes all pokemons in the collection
router.post("/delete-all-pokemons", async (req, res) => {
  try {
    await Pokemon.remove();
    res.send("All items deleted");
  } catch (err) {
    let e = createError(500, { error: err.message });
    res.send(e);
  }
});

//Gets all the pokemons in the collection
router.get("/get-all-pokemons", async (req, res) => {
  try {
    const pokemons = await Pokemon.find();
    res.status(200).send(pokemons);
  } catch (err) {
    let e = createError(500, { error: err.message });
    res.send(e);
  }
});
//This function was used as a next() function, but it is not used anymore, but i decided to leave it here
async function getAllPokemons(req, res) {
  try {
    const pokemon = await Pokemon.find();
    res.status(200).send(pokemon);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = router;
