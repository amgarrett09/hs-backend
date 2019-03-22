const restify = require("restify");
const mongoose = require("mongoose");
const config = require("./config");
const corsMiddleware = require("restify-cors-middleware");

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ["http://localhost:3000", "https://hockey-scrub.herokuapp.com"],
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
  require("./routes/autocomplete")(server);
  console.log(`Server started on port ${config.PORT}`);
});
