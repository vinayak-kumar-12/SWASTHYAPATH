require("dotenv").config();

const http = require("http");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

const startServer = async () => {
  try {
    server.listen(PORT, HOST, () => {
      console.log(`SWASTHYAPATH server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
