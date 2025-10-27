const { verifyJWT, createJWT } = require("./jwt");
const { parseRequest, creatRes } = require("./utils");
const fs = require("fs");

function login(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));

  const { email, password } = req.body;

  const admin = db.users.find(
    (a) => a.email === email && a.password === password,
  );

  if (admin) {
    let token = createJWT(email);
    return creatRes(`{"token" : ${token}}`, 200);
  } else {
    return creatRes(`{"message" : "wrong credentials"}`, 401);
  }
}

function getCreditTypes() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  return creatRes(JSON.stringify(db.creditTypes), 200);
}

function getEmploymentTypes() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  return creatRes(JSON.stringify(db.employmentTypes), 200);
}

function getJobs() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  return creatRes(JSON.stringify(db.jobs), 200);
}

function getSimulations() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  return creatRes(JSON.stringify(db.simulations), 200);
}

function createSimulation(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  let data = req.body;
  let sim = {};
  if (data) {
    sim.id = db.simulations[db.simulations.length - 1].id + 1;
    sim = { ...data };
    db.simulations.push(sim);
    fs.writeFileSync("./db.json", JSON.stringify(db), (err) => {
      console.log(
        "error while writing to file endpoint :" +
          req.method +
          " path" +
          req.path,
      );
    });
  }
  return creatRes(JSON.stringify(sim), 201);
}

function getApplications() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  return creatRes(JSON.stringify(db.applications), 200);
}

function createApplication(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  const data = req.body;
  let app = {};

  if (data) {
    app.id = db.applications.length
      ? db.applications[db.applications.length - 1].id + 1
      : 1;
    app.status = "pending";
    app.priority = false;
    app.notes = [];
    app.createdAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    db.applications.push(app);

    const notif = {
      id: db.notifications.length
        ? db.notifications[db.notifications.length - 1].id + 1
        : 1,
      type: "NEW_APPLICATION",
      applicationId: app.id,
      title: "New Credit Application",
      seen: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.push(notif);

    fs.writeFileSync("./db.json", JSON.stringify(db));
  }

  return creatRes(JSON.stringify(app), 201);
}

function updateApplicationStatus(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  const { id, status } = req.body;
  const app = db.applications.find((a) => a.id === id);

  if (app) {
    app.status = status || app.status;
    app.updatedAt = new Date().toISOString();
    fs.writeFileSync("./db.json", JSON.stringify(db));
    return creatRes(JSON.stringify(app), 200);
  } else {
    return creatRes(`{"message":"application not found"}`, 404);
  }
}

function getNotifications() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  return creatRes(JSON.stringify(db.notifications), 200);
}

function markNotificationSeen(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  const { id } = req.body;
  const notif = db.notifications.find((n) => n.id === id);

  if (notif) {
    notif.seen = true;
    fs.writeFileSync("./db.json", JSON.stringify(db));
    return creatRes(JSON.stringify(notif), 200);
  } else {
    return creatRes(`{"message":"notification not found"}`, 404);
  }
}

function getSettings() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  return creatRes(JSON.stringify(db.settings), 200);
}

function updateSettings(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  const newSettings = req.body;
  db.settings = { ...db.settings, ...newSettings };
  fs.writeFileSync("./db.json", JSON.stringify(db));
  return creatRes(JSON.stringify(db.settings), 200);
}

function getApplicationById(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  const id = parseInt(req.path.split("/").pop());
  const app = db.applications.find((a) => a.id === id);

  if (app) {
    return creatRes(JSON.stringify(app), 200);
  } else {
    return creatRes(`{"message":"application not found"}`, 404);
  }
}

function updateApplication(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  const id = parseInt(req.path.split("/").pop());
  const data = req.body;
  const app = db.applications.find((a) => a.id === id);

  if (app) {
    for (let key in data) {
      app[key] = data[key];
    }
    app.updatedAt = new Date().toISOString();
    fs.writeFileSync("./db.json", JSON.stringify(db));
    return creatRes(JSON.stringify(app), 200);
  } else {
    return creatRes(`{"message":"application not found"}`, 404);
  }
}

function updateNotification(req) {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  const id = parseInt(req.path.split("/").pop());
  const notif = db.notifications.find((n) => n.id === id);

  if (notif) {
    notif.seen = true;
    fs.writeFileSync("./db.json", JSON.stringify(db));
    return creatRes(JSON.stringify(notif), 200);
  } else {
    return creatRes(`{"message":"notification not found"}`, 404);
  }
}

function getStats() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  const stats = {
    applications: db.applications.length,
    simulations: db.simulations.length,
    notifications: db.notifications.length,
    users: db.users.length,
  };
  return creatRes(JSON.stringify(stats), 200);
}

module.exports = {
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
};
