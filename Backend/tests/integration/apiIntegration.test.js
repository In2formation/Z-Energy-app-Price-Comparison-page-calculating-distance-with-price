import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import stationRoutes from "../../api.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/stations", stationRoutes);

let Station;
let FuelPrice;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // connecting to actual database to verify routes are getting real data
  Station = mongoose.connection.collection("stations");
  FuelPrice = mongoose.connection.collection("fuelprices");
});

afterAll(async () => {
  await mongoose.connection.close();
  // closing connection prevents resource leaks
});

describe("Station API Integration - Data Retrieval", () => {
  test("1. GET /api/stations returns valid station array and handles large datasets", async () => {
    const res = await request(app).get("/api/stations");
    
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    // Verify EVERY station has complete, valid data
    res.body.forEach((station, index) => {
      // ID validation
      expect(station._id).toBeDefined();
      expect(typeof station._id).toBe("string");
      expect(mongoose.isValidObjectId(station._id)).toBe(true);
      
      // Name validation
      expect(station.name).toBeDefined();
      expect(typeof station.name).toBe("string");
      expect(station.name.trim().length).toBeGreaterThan(0);
      expect(station.name.length).toBeLessThan(200);
      
      // Location validation
      expect(station.location).toBeDefined();
      expect(typeof station.location).toBe("object");
      expect(station.location).not.toBeNull();
      
      // Coordinates validation
      expect(station.location.coordinates).toBeDefined();
      expect(typeof station.location.coordinates).toBe("object");
      
      const { lat, lng } = station.location.coordinates;
      expect(lat).toBeDefined();
      expect(lng).toBeDefined();
      expect(typeof lat).toBe("number");
      expect(typeof lng).toBe("number");
      expect(Number.isFinite(lat)).toBe(true);
      expect(Number.isFinite(lng)).toBe(true);
      expect(lat).not.toBe(0); // No station at 0,0
      expect(lng).not.toBe(0);
      
      // NZ bounds check
      expect(lat).toBeGreaterThanOrEqual(-48);
      expect(lat).toBeLessThanOrEqual(-33);
      expect(lng).toBeGreaterThanOrEqual(165);
      expect(lng).toBeLessThanOrEqual(180);
      
      // Fuel prices validation
      expect(station.fuelPrices).toBeDefined();
      expect(typeof station.fuelPrices).toBe("object");
      expect(station.fuelPrices).not.toBeNull();
      expect(Array.isArray(station.fuelPrices)).toBe(false);
      
      // Validate each fuel price
      Object.entries(station.fuelPrices).forEach(([fuelType, price]) => {
        expect(typeof fuelType).toBe("string");
        expect(fuelType.length).toBeGreaterThan(0);
        expect(typeof price).toBe("number");
        expect(Number.isFinite(price)).toBe(true);
        expect(price).toBeGreaterThan(0);
        expect(price).toBeLessThan(20);
      });
    });
    
    // Check for duplicate station IDs
    const ids = res.body.map(s => s._id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("2. GET /api/stations/:id returns complete station data with proper error handling", async () => {
    const stations = await Station.find().limit(1).toArray();
    expect(stations.length).toBeGreaterThan(0);
    
    const stationId = stations[0]._id.toString();
    const res = await request(app).get(`/api/stations/${stationId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body._id).toBe(stationId);
    
    // Verify complete station structure
    expect(res.body.name).toBeDefined();
    expect(typeof res.body.name).toBe("string");
    expect(res.body.name.length).toBeGreaterThan(0);
    
    expect(res.body.location).toBeDefined();
    expect(res.body.location.coordinates).toBeDefined();
    expect(typeof res.body.location.coordinates.lat).toBe("number");
    expect(typeof res.body.location.coordinates.lng).toBe("number");
    
    // Fuel prices must exist and be valid
    expect(res.body.fuelPrices).toBeDefined();
    expect(typeof res.body.fuelPrices).toBe("object");
    
    const priceKeys = Object.keys(res.body.fuelPrices);
    
    // Verify fuel prices match database
    const dbPrices = await FuelPrice.find({ station: stations[0]._id }).toArray();
    expect(priceKeys.length).toBe(dbPrices.length);
    
    // Each price must be valid
    priceKeys.forEach(fuelType => {
      const price = res.body.fuelPrices[fuelType];
      expect(typeof price).toBe("number");
      expect(Number.isFinite(price)).toBe(true);
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(20);
      
      // Verify price matches database
      const dbPrice = dbPrices.find(p => p.fuelType === fuelType);
      expect(dbPrice).toBeDefined();
      expect(price).toBe(dbPrice.pricePerLitre);
    });
  });

  test("3. GET /api/stations/:id handles all invalid ID formats correctly", async () => {
    const invalidIds = [
      "invalid",
      "12345",
      "not-an-objectid",
      "",
      "null",
      "undefined",
      "507f1f77bcf86cd79943901", // 23 chars
      "507f1f77bcf86cd799439011z", // invalid char
      "ZZZZZZZZZZZZZZZZZZZZZZZZ", // 24 chars but not hex
      "../../../etc/passwd", // path traversal attempt
      "<script>alert('xss')</script>", // XSS attempt
    ];
    
    for (const id of invalidIds) {
      const res = await request(app).get(`/api/stations/${id}`);
      expect([404, 500]).toContain(res.statusCode);
      expect(res.statusCode).not.toBe(200);
      
      if (res.body) {
        expect(res.body).not.toHaveProperty("_id");
      }
    }
  });

  test("4. GET /api/stations/:id with non-existent valid ObjectId returns proper 404", async () => {
    const fakeIds = [
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
    ];
    
    for (const fakeId of fakeIds) {
      const res = await request(app).get(`/api/stations/${fakeId}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
      expect(typeof res.body.error).toBe("string");
      expect(res.body.error.length).toBeGreaterThan(0);
      expect(res.body.error.toLowerCase()).toMatch(/not found|station/);
    }
  });

  test("5. GET /api/stations/cheapest/:fuelType returns actual cheapest and validates correctness", async () => {
    const fuelTypes = ["Diesel", "Regular Unleaded (91)", "Premium Unleaded (95/98)"];
    
    for (const fuelType of fuelTypes) {
      const res = await request(app).get(`/api/stations/cheapest/${encodeURIComponent(fuelType)}`);
      
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("fuelPrices");
        expect(res.body.fuelPrices).toHaveProperty(fuelType);
        
        const returnedPrice = res.body.fuelPrices[fuelType];
        expect(typeof returnedPrice).toBe("number");
        expect(Number.isFinite(returnedPrice)).toBe(true);
        expect(returnedPrice).toBeGreaterThan(0);
        expect(returnedPrice).toBeLessThan(20);
        
        // CRITICAL: Verify this is ACTUALLY the cheapest by querying database
        const allPrices = await FuelPrice.find({ fuelType }).toArray();
        expect(allPrices.length).toBeGreaterThan(0);
        
        const minPrice = Math.min(...allPrices.map(p => p.pricePerLitre));
        expect(returnedPrice).toBe(minPrice);
        
        // Verify no other station has a cheaper price
        const cheaperPrices = allPrices.filter(p => p.pricePerLitre < returnedPrice);
        expect(cheaperPrices.length).toBe(0);
      } else {
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error");
      }
    }
  });

  test("6. GET /api/stations/cheapest/:fuelType rejects all invalid fuel types", async () => {
    const invalidFuelTypes = [
      "Electric",
      "Hydrogen",
      "InvalidFuel",
      "",
      "123",
      "null",
      "undefined",
      "<script>alert('xss')</script>",
      "../../../etc/passwd",
      "Diesel' OR '1'='1", // SQL injection attempt
      "A".repeat(1000), // Very long string
    ];
    
    for (const fuelType of invalidFuelTypes) {
      const res = await request(app).get(`/api/stations/cheapest/${encodeURIComponent(fuelType)}`);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
      expect(typeof res.body.error).toBe("string");
    }
  });

  test("7. POST /api/stations/ai/chat validates message thoroughly", async () => {
    const invalidMessages = [
      { message: "" },
      { message: "   " }, // Only whitespace
      { message: 123 },
      { message: null },
      { message: undefined },
      { message: {} },
      { message: [] },
      { message: true },
      { message: false },
      {}, // No message field
      { message: "A".repeat(10000) }, // Very long message
    ];
    
    for (const payload of invalidMessages) {
      const res = await request(app)
        .post("/api/stations/ai/chat")
        .send(payload);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(typeof res.body.error).toBe("string");
      expect(res.body.error.length).toBeGreaterThan(0);
    }
  });

  test("8. API handles concurrent requests without data corruption", async () => {
    const requests = Array(10).fill(null).map(() => 
      request(app).get("/api/stations")
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach(res => {
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
    
    // All responses should have same number of stations
    const counts = responses.map(r => r.body.length);
    const uniqueCounts = new Set(counts);
    expect(uniqueCounts.size).toBe(1);
  });

  test("9. API returns consistent data structure across multiple calls", async () => {
    const res1 = await request(app).get("/api/stations");
    const res2 = await request(app).get("/api/stations");
    
    expect(res1.body.length).toBe(res2.body.length);
    
    // Compare first station structure
    const station1 = res1.body[0];
    const station2 = res2.body[0];
    
    expect(Object.keys(station1).sort()).toEqual(Object.keys(station2).sort());
    expect(station1._id).toBe(station2._id);
    expect(station1.name).toBe(station2.name);
  });
});
