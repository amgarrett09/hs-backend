const errors = require("restify-errors");
const AutoComplete = require("../lib/autocomplete/index");

const Player = require("../models/Player");

// Create an autocomplete trie and add every player in database to it
const trie = new AutoComplete();
const init = async () => {
  players = await Player.find({});
  players.forEach(player => {
    const { name, reverseName } = player;
    trie.add(name);
    trie.add(reverseName);
  });
};
init();

module.exports = server => {
  server.get("/api/v1/autocomplete/:st", (req, res, next) => {
    if (req.params.st) {
      const out = trie.suggest(req.params.st);
      res.send({ suggestions: out });
      next();
    } else {
      return next(new errors.MissingParameterError("Need a string as input"));
    }
  });

  server.get("/api/v1/player/:name", async ({ params }, res, next) => {
    if (!params.name) {
      return next(new errors.MissingParameterError("Missing player name"));
    }

    const { name } = params;
    const cleanedName = name.split("%20").join(" ");
    const nameIsReversed = cleanedName.includes(",");

    try {
      if (nameIsReversed) {
        const player = await Player.findOne({ reverseName: cleanedName });
        res.send({ player });
        next();
      } else {
        const player = await Player.findOne({ name: cleanedName });
        res.send({ player });
        next();
      }
    } catch (err) {
      return next(new errors.InternalError(err));
    }
  });
};
