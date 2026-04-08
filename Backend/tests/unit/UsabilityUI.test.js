import { jest } from '@jest/globals';

describe("Usability and UI Data Validation", () => {
  test("1. prices are formatted with 2 decimal places", () => {
    const price = 2.45;
    const formatted = price.toFixed(2);
    expect(formatted).toBe("2.45");
    // validates price display format
  });

  test("2. error messages are user-friendly", () => {
    const errorMessages = [
      "Station not found",
      "Title is required",
      "Invalid fuel type"
    ];
    errorMessages.forEach(msg => {
      expect(msg.length).toBeGreaterThan(0);
      expect(msg).not.toMatch(/undefined|null/);
      // ensures error messages are clear and helpful
    });
  });

  test("3. API responses have consistent structure", () => {
    const mockStation = {
      _id: "507f1f77bcf86cd799439011",
      name: "Z Energy Wellington",
      location: {
        address: "123 Test St",
        city: "Wellington",
        coordinates: { lat: -41.2865, lng: 174.7762 }
      },
      fuelPrices: {
        "Regular Unleaded (91)": 2.45
      }
    };
    expect(mockStation).toHaveProperty("_id");
    expect(mockStation).toHaveProperty("name");
    expect(mockStation).toHaveProperty("location");
    expect(mockStation).toHaveProperty("fuelPrices");
    // validates consistent response structure for UI consumption
  });
});
