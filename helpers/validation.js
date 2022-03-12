const Joi = require("Joi");

const pokemonValidation = (data) => {
  const abilities = Joi.array().items(
    Joi.object({
      is_hidden: Joi.boolean(),
      slot: Joi.number(),
      name: Joi.string(),
    })
  );
  const firstHeldItem = Joi.object({
    name: Joi.string(),
    url: Joi.string(),
  });
  const pokemon = Joi.object({
    name: Joi.string().required(),
    weight: Joi.number().required(),
    height: Joi.number().required(),
    abilities: abilities,
    first_held_item: firstHeldItem,
  });
  return pokemon.validate(data);
};

module.exports = pokemonValidation;
