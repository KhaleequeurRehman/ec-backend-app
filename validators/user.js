const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// Validation for user
exports.validateUser = (User) => {
  const schema = Joi.object({
    fullName: Joi.string().max(50).required().messages({
      'string.empty': 'Name is required',
    }),
    email: Joi.string()
      .email()
      .required()
      .error(new Error('email must be a valid email')),

    phone: Joi.string().max(50).required().messages({
      'string.empty': 'Phone Number is required',
    }),

  }).options({ allowUnknown: true });
  return schema.validate(User);
};

// Validation for driver
exports.validatedriver = (User) => {
  const schema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
      'string.empty': 'First name is required',
    }),
    lastName: Joi.string().max(50).required().messages({
      'string.empty': 'Last name is required',
    }),
    email: Joi.string().email().required()
      .error(new Error('email must be a valid email')),

    password: Joi.string().max(50).required().messages({
      'string.empty': 'Password is required',
    }),
    phone: Joi.string().max(50).required().messages({
      'string.empty': 'Phone Number is required',
    }),
    city: Joi.string().max(50).required().messages({
      'string.empty': 'City is required',
    }),
  }).options({ allowUnknown: true });
  return schema.validate(User);
};

// Validation for caterer
exports.validateCaterer = (User) => {
  const schema = Joi.object({
    merchantName: Joi.string().max(50).required().messages({
      'string.empty': 'Merchant name is required',
    }),
    address: Joi.string().max(50).required().messages({
      'string.empty': 'Address is required',
    }),
    idCard: Joi.string().max(50).required().messages({
      'string.empty': 'ID Card is required',
    }),
    ownerName: Joi.string().max(50).required().messages({
      'string.empty': 'Owner name is required',
    }),
    email: Joi.string()
      .email()
      .required()
      .error(new Error('email must be a valid email')),

    phone: Joi.string().max(50).required().messages({
      'string.empty': 'Phone Number is required',
    })
  }).options({ allowUnknown: true });
  return schema.validate(User);
};

// Validation for admin
exports.validateAdmin = (User) => {
  const schema = Joi.object({
    firstName: Joi.string().max(50).required().messages({
      'string.empty': 'First name is required',
    }),
    lastName: Joi.string().max(50).required().messages({
      'string.empty': 'Last name is required',
    }),
    email: Joi.string().email().required()
      .error(new Error('email must be a valid email')),

    password: Joi.string().max(50).required().messages({
      'string.empty': 'Password is required',
    }),
    phone: Joi.string().max(50).required().messages({
      'string.empty': 'Phone Number is required',
    }),
    type: Joi.string().max(50).required().messages({
      'string.empty': 'Type is required',
    }),
  }).options({ allowUnknown: true });
  return schema.validate(User);
};