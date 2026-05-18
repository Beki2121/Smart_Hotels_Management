require("dotenv").config();
const { Sequelize } = require("sequelize");
const dbConfig = require("./config/database");
const defineModels = require("./models");

const env = process.env.NODE_ENV || "development";
const config = dbConfig[env] || dbConfig.development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

// Initialize all models
const modelsObj = defineModels(sequelize);

// Attach sequelize and Sequelize instances
modelsObj.sequelize = sequelize;
modelsObj.Sequelize = Sequelize;

module.exports = modelsObj;
