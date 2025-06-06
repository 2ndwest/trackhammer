const cors = require("cors");

const devCors = cors({
	origin: "http://localhost:3000",
	credentials: true,
	methods: ["GET", "POST"],
});

module.exports = devCors;
