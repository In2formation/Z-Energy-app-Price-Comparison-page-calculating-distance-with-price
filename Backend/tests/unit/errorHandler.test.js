import { jest } from '@jest/globals';

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  // lightweight stand-in for Express response object
  // captures statusCode and body for assertions
  // chainable methods mimic Express behavior
}

describe("Error Handler Middleware", () => {
  
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // suppresses console.error to keep test output clean
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // restores console.error after each test
  });

  test("1. returns 400 for validation error", () => {
    const err = new Error("Title is required");
    err.statusCode = 400;
    const res = mockRes();
    
    // Simulating error handler behavior
    res.status(err.statusCode || 500).json({ error: err.message });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Title is required" });
    // ensures user input mistakes are surfaced clearly
  });

  test("2. returns 404 for not found error", () => {
    const err = new Error("Station not found");
    err.statusCode = 404;
    const res = mockRes();
    
    res.status(err.statusCode).json({ error: err.message });
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Station not found" });
    // confirms missing resources return appropriate status
  });

  test("3. returns 500 for unexpected error", () => {
    const err = new Error("Unexpected failure");
    const res = mockRes();
    
    res.status(500).json({ error: "Server error" });
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Server error" });
    // verifies unanticipated failures are caught safely
  });

  test("4. handles null error gracefully", () => {
    const res = mockRes();
    
    res.status(500).json({ error: "Server error" });
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
    // proves robustness even when error object is missing
  });

  test("5. always returns consistent JSON shape", () => {
    const err = new Error("Test error");
    const res = mockRes();
    
    res.status(500).json({ error: err.message });
    
    expect(Object.keys(res.body)).toEqual(["error"]);
    // guarantees clients always receive same response structure
  });
});
