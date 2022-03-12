const express = require("express");
const router = express.Router();
const request = require("request");
const fs = require("fs");
const axios = require("axios");

const Pokemon = require("../model/model");
const pokemonValidation = require("../helpers/validation");
const pokeAPI = "https://pokeapi.co/api/v2/pokemon/";

router.get("/populate-database", async (req, res, next) => {
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
  for (let i = 0; i < result.length; i++) {
    let pokemon = await axios.get(result[i].url);
    pokemonsWithAllStats.push(pokemon.data);
  }

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

  await Pokemon.insertMany(finalPokemons);
  console.log(finalPokemons);
  res.send(finalPokemons);
});

router.post(
  "/create-pokemon",
  async (req, res, next) => {
    const { name, height, weight, abilities } = req.body;
    try {
      const newPokemon = new Pokemon({
        name,
        height,
        weight,
        abilities,
      });
      await newPokemon.save();
      console.log(newPokemon);
      // res.send(newPokemon);
      next();
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getAllPokemons
);

router.post(
  "/update-pokemon",
  async (req, res, next) => {
    const { id, name, height, weight, abilities } = req.body;
    try {
      const pokemon = await Pokemon.findOne({ _id: id });
      let newPokemon = {
        $set: {
          name: name,
          height: height,
          weight: weight,
          abilities: abilities,
        },
      };
      let updatedPokemon = await Pokemon.updateOne(pokemon, newPokemon);
      next();
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getAllPokemons
);

router.post("/get-pokemon-by-id", async (req, res) => {
  const { id } = req.body;
  try {
    let searchedPokemon = await Pokemon.findOne({ _id: id });
    res.status(200).send(searchedPokemon);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post(
  "/delete-pokemon",
  async (req, res, next) => {
    try {
      await Pokemon.deleteOne({ _id: req.body.id });
      next();
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getAllPokemons
);

router.post(
  "/delete-all-pokemons",
  async (req, res, next) => {
    try {
      await Pokemon.remove();
      next();
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getAllPokemons
);

router.get("/get-all-pokemons", async (req, res) => {
  try {
    const pokemons = await Pokemon.find();
    res.status(200).send(pokemons);
  } catch (err) {
    res.status(500).send(err);
  }
});

async function getAllPokemons(req, res) {
  try {
    const pokemon = await Pokemon.find();
    res.status(200).send(pokemon);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = router;
