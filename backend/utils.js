function parseRequest(data) {
  let divFirst = data.split("\r\n\r\n");
  let body = divFirst[1];
  let sepratedData = divFirst[0].split("\r\n");
  let requestLine = sepratedData[0].split(" ");
  let method = requestLine[0];
  let path = requestLine[1];
  let httpVersion = requestLine[2];
  let headers = {};

  for (let i = 1; i < sepratedData.length; i++) {
    let header = sepratedData[i].split(": ");
    let name = header[0];
    let value = header[1];
    if (name) {
      headers[name.toLowerCase()] = value;
    }
  }

  let req = {};
  req.headers = headers;
  req.method = method;
  req.path = path;
  req.version = httpVersion;
  req.body = body || {};

  try {
    req.body = JSON.parse(req.body);
  } catch (err) {}

  return req;
}

function creatRes(data, status = 200, contentType = "application/json") {
  const statusMessage =
    {
      200: "OK",
      201: "Created",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
    }[status] || "OK";

  const response =
    `HTTP/1.1 ${status} ${statusMessage}\r\n` +
    `Content-Type: ${contentType}\r\n` +
    `Content-Length: ${Buffer.byteLength(data)}\r\n` +
    "Connection: close\r\n" +
    "\r\n" +
    data;

  return response;
}

module.exports = { parseRequest, creatRes };
