const Joi = require("Joi");

const pokemonValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    weight: Joi.number().required(),
    height: Joi.number().required(),
    abilities: [
      {
        is_hidden: Joi.boolean(),
        slot: Joi.number(),
        name: Joi.string(),
      },
    ],
    first_held_item: {
      name: Joi.string(),
      url: Joi.string(),
    },
  });
  return schema.validate(data);
};

module.exports = pokemonValidation;
