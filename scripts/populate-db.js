const restify = require("restify");
const mongoose = require("mongoose");
const config = require("../config");
const fetch = require("node-fetch");
const Player = require("../models/Player");

const nameReverse = require("../lib/name-reverse/name-reverse");

const server = restify.createServer();

server.listen(config.PORT, () => {
  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });
});

const db = mongoose.connection;

db.on("error", err => console.error(err));

db.once("open", async () => {
  const res = await fetch(
    "https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster"
  );
  const json = await res.json();

  const { teams } = json;
  const rosters = teams.map(team => team.roster.roster);

  // For each player on each roster
  rosters.forEach(roster => {
    roster.forEach(async player => {
      const name = player.person.fullName;
      const reverseName = nameReverse(name);
      const id = player.person.id;

      try {
        // Create or update players in database
        const updated = await Player.findOneAndUpdate(
          { name, reverseName, id, },
          { name, reverseName, id, },
          { upsert: true, runValidators: true }
          );
          console.log(`${name} updated`);
      } catch (err) {
        console.log(`Update failed for ${name}`);
        console.error(err);
      }

    });
  });

  console.log(`Server started on port ${config.PORT}`);
});
