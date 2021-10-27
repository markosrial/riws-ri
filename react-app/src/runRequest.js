import http from 'http';
import fetch from 'node-fetch';

const httpAgent = new http.Agent();
const hostES = "http://localhost:9200"

export default async function runRequest(body) {

  const response = await fetch(`${hostES}/riws_concerts/_search`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body),
    httpAgent
  });

  return await response.json();
}
