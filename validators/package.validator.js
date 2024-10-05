const { check } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const path = require('path')

const createPackageValidator = [
  check("name").notEmpty().withMessage("name is required"),
  check("capacity").isNumeric().withMessage("capacity must be a number"),
  check("price").isNumeric().withMessage("price must be a number"),
  check("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("file is required");
    }
    // set admin
    req.body.admin = req.user._id
    return true;
  }),
  validatorMiddleware,
];

const updatePackageValidator = [
  check('id')
  .isMongoId().withMessage('Invalid package ID format'),
  check("name")
    .optional()
    .notEmpty()
    .withMessage("name must not be empty"),
    
    check("capacity")
    .optional()
    .isNumeric()
    .withMessage("capacity must be a number"),
  
    check("price")
    .optional()
    .isNumeric()
    .withMessage("price must be a number"),
    
    check("file").custom((value, { req }) => {
    if (req.file && !req.file.filename) {
      throw new Error("File is required");
    }
    return true;
  }),
  validatorMiddleware,
]



const getDeletePackageValidator = [
  check('id')
  .isMongoId().withMessage('Invalid package ID format'),
  validatorMiddleware,
]


module.exports = {
  createPackageValidator,
  updatePackageValidator,
  getDeletePackageValidator
};
