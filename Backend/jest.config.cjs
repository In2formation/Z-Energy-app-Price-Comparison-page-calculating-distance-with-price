module.exports = {
  // Sets the test environment to Node.js.
  // This is important because Jest defaults to a browser-like environment (jsdom),
  // but backend tests (e.g., Express, MongoDB) need Node APIs.
  testEnvironment: "node",

  // Enables verbose output so Jest shows individual test results.
  // This helps developers quickly see which tests passed/failed instead of just a summary.
  verbose: true
};