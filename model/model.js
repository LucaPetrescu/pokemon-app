const mongoose = require("mongoose");

const PokemonSchema = new mongoose.Schema(
  {
    name: { type: "string", require: true, unique: true },
    height: { type: "number", require: true },
    weight: { type: "number", require: true },
    abilities: [
      {
        is_hidden: "boolean",
        slot: "number",
        name: "string",
      },
    ],
    held_items: {
      name: "string",
      url: "string",
    },
  },
  {
    collection: "pokemons",
  }
);

const model = mongoose.model("Pokemon", PokemonSchema);

module.exports = model;
