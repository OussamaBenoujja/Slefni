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

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5173/",
];

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
      let res = null;

      const origin = req.headers.origin;
      if (req.method === "OPTIONS") {
        if (allowedOrigins.includes(origin)) {
          const response =
            "HTTP/1.1 204 No Content\r\n" +
            `Access-Control-Allow-Origin: ${origin}\r\n` +
            "Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS\r\n" +
            "Access-Control-Allow-Headers: Content-Type, Authorization\r\n" +
            "Access-Control-Max-Age: 86400\r\n" +
            "Connection: keep-alive\r\n" +
            "\r\n";

          client.write(response);
        } else {
          const forbidden = creatRes(
            JSON.stringify({ error: "CORS origin not allowed" }),
            403,
          );
          client.write(forbidden);
        }
        client.end();
        return;
      }

      if (req.path) {
        // Try exact match first, then dynamic :id routes
        let endpoint = endPoints[req.path];
        if (!endpoint) {
          const dynamicKey = Object.keys(endPoints).find((key) => {
            if (!key.includes(":")) return false;
            // Escape regex special chars in the static parts first, then replace :param with a matcher
            const regexStr =
              "^" +
              key
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                .replace(/:[^/]+/g, "[^/]+") +
              "$";
            const pattern = new RegExp(regexStr);
            return pattern.test(req.path);
          });
          if (dynamicKey) endpoint = endPoints[dynamicKey];
        }

        if (endpoint) {
          if (endpoint.adminSecure) {
            let authHeader = req.headers.authorization;
            let user;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              res = creatRes("Missing or invalid Authorization header", 401);
            } else {
              const token = authHeader.split(" ")[1];
              user = verifyJWT(token);
            }
            if (user?.valid) {
              res = endpoint[req.method](req);
            } else {
              res = creatRes("Invalid Token", 401);
            }
          } else {
            res = endpoint[req.method](req);
          }
        } else {
          res = creatRes("Not Found", 404);
        }
      }

      if (res && allowedOrigins.includes(origin)) {
        const corsHeader = `Access-Control-Allow-Origin: ${origin}\r\n`;
        res = res.replace(
          "Connection: close\r\n",
          corsHeader + "Connection: close\r\n",
        );
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
