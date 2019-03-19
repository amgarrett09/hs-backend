const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  reverseName: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    required: true
  }
});

const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;
