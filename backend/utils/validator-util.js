const validator = require("express-validator");

const firstNameValidator = validator
  .check("firstName")
  .notEmpty()
  .withMessage("First Name is Required")
  .trim()
  .isLength({ min: 2 })
  .withMessage("First name should be least 2 Characters Long")
  .matches(/^[a-zA-Z]+$/)
  .withMessage("First Name can only Contain English Alphabets");

const lastNameValidator = validator
  .check("lastName")
  .notEmpty()
  .withMessage("Last Name is Required")
  .trim()
  .isLength({ min: 2 })
  .withMessage("Last name should be least 2 Characters Long")
  .matches(/^[a-zA-Z]+$/)
  .withMessage("Last Name can only Contain English Alphabets");

const emailValidator = validator
  .check("email")
  .notEmpty()
  .withMessage("Email is Required")
  .trim()
  .isEmail()
  .withMessage("Please provide a valid Email Address")
  .normalizeEmail();

const passwordValidator = validator
  .check("password")
  .notEmpty()
  .withMessage("Password is Required")
  .isLength({ min: 8 })
  .withMessage("Password should be at least 8 Characters Long")
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage(
    "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
  );

const confirmPasswordValidator = validator
  .check("confirmPassword")
  .notEmpty()
  .withMessage("Confirm Password is Required")
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Confirm Password does not match Password");
    }
    return true;
  });

const userTypeValidator = validator
  .check("userType")
  .notEmpty()
  .withMessage("User Type is Required")
  .isIn(["admin", "user"])
  .withMessage("User Type must be either Admin or User");

const termsValidator = validator
  .check("terms")
  .notEmpty()
  .withMessage("You must accept Terms and Conditions");

module.exports = {
    firstNameValidator,
    lastNameValidator,
    passwordValidator,
    confirmPasswordValidator,
    userTypeValidator,
    termsValidator,
    emailValidator
}