const express = require("express");
const router = express.Router();
const request = require("request");
const fs = require("fs");
const axios = require("axios");

const Pokemon = require("../model/model");
const pokemonValidation = require("../helpers/validation");
const pokeAPI = "https://pokeapi.co/api/v2/pokemon/";
/**
 * axios.get('/user?ID=12345')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });
 */

router.get("/get-uris", async (req, res, next) => {
  // request({ method: "GET", uri: pokeAPI }, (error, response, body) => {
  //   if (!error && response.statusCode == 200) {
  //     const pokemonsWithUrls = JSON.parse(body);
  //     fs.writeFile(
  //       "pokemons.json",
  //       JSON.stringify(pokemonsWithUrls, null, 2),
  //       (err) => {
  //         if (err) {
  //           throw err;
  //         }
  //       }
  //     );
  //     res.status(200).send(pokemonsWithUrls);
  //   }
  // });
  const response = await axios.get(pokeAPI);
  console.log(response.data.results);
  let i = 0;
  let pokemon = {};
  let result = [];
  while (response.data.results[i]) {
    pokemon = response.data.results[i];
    let pokemonUrl = pokemon.url;
    let urlResponse = await axios.get(pokemonUrl);
    result.push(urlResponse.data);
    i += 1;
  }
  // let result1 = JSON.parse(JSON.stringify(result));
  console.log(result);
  res.send(result);
});

router.get(
  "/populate-database",
  async (req, res, next) => {
    try {
      const pokemonsRawData = fs.readFileSync("pokemons.json");
      const pokemons = JSON.parse(pokemonsRawData);
      if (Pokemon.countDocuments({}) < 21) {
        console.log("Error");
      }
      const urls = pokemons.results;

      let productsToReturn = [];
      let newPokemons = [];
      let requests = urls.map((url) => {
        return new Promise((resolve, reject) => {
          request(
            {
              uri: url.url,
              method: "GET",
            },
            (error, response, body) => {
              if (error) {
                reject(error);
              }
              resolve(body);
            }
          );
        });
      });

      const body = await Promise.all(requests);
      body.forEach((res) => {
        productsToReturn.push(JSON.parse(res));
      });
      for (let i = 0; i < productsToReturn.length; i++) {
        let pokemonRes = {
          name: productsToReturn[i].name,
          height: productsToReturn[i].height,
          weight: productsToReturn[i].weight,
          abilities: productsToReturn[i].abilities.map((ability) => {
            return {
              name: ability.ability.name,
              slot: ability.slot,
              is_hidden: ability.is_hidden,
            };
          }),
          first_held_item:
            productsToReturn[i].held_items[0] === undefined
              ? null
              : {
                  name: productsToReturn[i].held_items[0].item.name,
                  url: productsToReturn[i].held_items[0].item.url,
                },
        };
        newPokemons.push(pokemonRes);
      }
      const { value, error } = pokemonValidation(newPokemons);
      console.log(value);
      for (let pokemon of newPokemons) {
        const newEntry = new Pokemon({
          name: pokemon.name,
          height: pokemon.height,
          weight: pokemon.weight,
          abilities: pokemon.abilities,
          first_held_item: pokemon.held_items,
        });
        await newEntry.save();
      }
      next();
    } catch (err) {
      res.status(500).send(err);
    }
  },
  getAllPokemons
);

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
