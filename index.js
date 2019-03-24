const restify = require("restify");
const mongoose = require("mongoose");
const config = require("./config");
const corsMiddleware = require("restify-cors-middleware");
const AutoComplete = require("./lib/autocomplete/index");
const Player = require("./models/Player");

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: [
    "http://localhost:3000",
    "https://hockey-scrub.site",
    "https://www.hockey-scrub.site"
  ],
  allowHeaders: ["API-token"],
  exposeHeaders: ["API-Token-Expiry"]
});

const server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.pre(cors.preflight);
server.use(cors.actual);

server.listen(config.PORT, () => {
  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });
});

const db = mongoose.connection;

db.on("error", err => console.error(err));

db.once("open", () => {
  // Create an autocomplete trie and add every player in database to it
  const trie = new AutoComplete();
  const init = async () => {
    console.log("adding players to trie");
    players = await Player.find({});
    players.forEach(player => {
      const { name, reverseName } = player;
      trie.add(name);
      trie.add(reverseName);
    });
  };
  init();

  require("./routes/autocomplete")(server, trie);
  console.log(`Server started on port ${config.PORT}`);
});
