const { MongoStore } = require("connect-mongo");
const { url } = require('./db_config');

const sessionStore = new MongoStore({
  mongoUrl: url,
  collectionName: "sessions",
});

module.exports = {
    sessionStore,
}