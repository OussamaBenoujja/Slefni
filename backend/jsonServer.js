const net = require("net");
const fs = require("fs");
const { verifyJWT, createJWT } = require("./jwt");
const { parseRequest, creatRes } = require("./utils");
const {
  login,
  getCreditTypes,
  getEmploymentTypes,
  getJobs,
  getSimulations,
  createSimulation,
  getApplications,
  createApplication,
  updateApplicationStatus,
  getNotifications,
  markNotificationSeen,
  getSettings,
  updateSettings,
  getStats,
  updateNotification,
  updateApplication,
  getApplicationById,
} = require("./handlers");

const port = process.env.SERVER_PORT;

const endPoints = {
  "/login": {
    POST: login,
  },

  "/credit-types": {
    GET: getCreditTypes,
  },
  "/employment-types": {
    GET: getEmploymentTypes,
  },
  "/jobs": {
    GET: getJobs,
  },

  "/settings": {
    GET: getSettings,
    adminSecure: true,
  },

  "/simulations": {
    GET: getSimulations,
    POST: createSimulation,
  },

  "/applications": {
    GET: getApplications,
    POST: createApplication,
    adminSecure: true,
  },

  "/applications/:id": {
    GET: getApplicationById,
    PATCH: updateApplication,
    adminSecure: true,
  },

  "/notifications": {
    GET: getNotifications,
    adminSecure: true,
  },

  "/notifications/:id": {
    PATCH: updateNotification,
    adminSecure: true,
  },

  "/stats": {
    GET: getStats,
    adminSecure: true,
  },
};

function connection(client) {
  try {
    let data = "";
    client.on("data", (chunk) => {
      data += chunk;
      const req = parseRequest(data);
      console.log(req);
      let res = null;
      if (req.path) {
        const endpoint = endPoints[req.path];
        if (endpoint.adminSecure) {
          let authHeader = req.headers.authorization;
          let user;
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res = creatRes("Missing or invalid Authorization header", 401);
          } else {
            const token = authHeader.split(" ")[1];
            user = verifyJWT(token);
          }
          if (user.valid) {
            res = endPoints[req.path][req.method](req);
          } else {
            res = creatRes("Invalid Token", 401);
          }
        } else {
          res = endPoints[req.path][req.method](req);
        }
      }
      if (res) {
        console.log(res);
        client.write(res);
        client.end();
      }
    });
  } catch (err) {
    console.log("ERR: " + err);
  }
}

const app = net.createServer(connection);

app.listen(port, () => {
  console.log("Server running on port 5000");
});
