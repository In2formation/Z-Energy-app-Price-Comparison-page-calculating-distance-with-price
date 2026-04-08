import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import mongoose from "mongoose";

dotenv.config();

let Station;
let FuelPrice;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  Station = mongoose.connection.collection("stations");
  FuelPrice = mongoose.connection.collection("fuelprices");
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Database Integration - Data Integrity and Consistency", () => {
  test("1. ALL stations have valid non-null coordinates with no exceptions", async () => {
    const totalCount = await Station.countDocuments();
    expect(totalCount).toBeGreaterThan(0);
    
    const stationsWithInvalidCoords = await Station.find({
      $or: [
        { "location.coordinates.lat": { $exists: false } },
        { "location.coordinates.lng": { $exists: false } },
        { "location.coordinates.lat": null },
        { "location.coordinates.lng": null },
        { "location.coordinates.lat": { $type: "string" } },
        { "location.coordinates.lng": { $type: "string" } },
        { "location": { $exists: false } },
        { "location.coordinates": { $exists: false } },
      ]
    }).toArray();
    
    if (stationsWithInvalidCoords.length > 0) {
      const badStations = stationsWithInvalidCoords.map(s => ({
        id: s._id,
        name: s.name,
        coords: s.location?.coordinates
      }));
      fail(`Found ${stationsWithInvalidCoords.length} stations with invalid coordinates: ${JSON.stringify(badStations, null, 2)}`);
    }
    
    expect(stationsWithInvalidCoords.length).toBe(0);
  });

  test("2. ALL station coordinates are within New Zealand geographic bounds", async () => {
    const stations = await Station.find().toArray();
    expect(stations.length).toBeGreaterThan(0);
    
    const outOfBoundsStations = [];
    
    stations.forEach(station => {
      const lat = station.location?.coordinates?.lat;
      const lng = station.location?.coordinates?.lng;
      
      if (typeof lat !== "number" || typeof lng !== "number") {
        outOfBoundsStations.push({
          id: station._id,
          name: station.name,
          issue: "Coordinates are not numbers",
          lat, lng
        });
        return;
      }
      
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        outOfBoundsStations.push({
          id: station._id,
          name: station.name,
          issue: "Coordinates are NaN or Infinity",
          lat, lng
        });
        return;
      }
      
      if (lat <= -48 || lat >= -33 || lng <= 165 || lng >= 180) {
        outOfBoundsStations.push({
          id: station._id,
          name: station.name,
          issue: "Coordinates outside NZ bounds",
          lat, lng
        });
      }
    });
    
    if (outOfBoundsStations.length > 0) {
      fail(`Found ${outOfBoundsStations.length} stations with out-of-bounds coordinates: ${JSON.stringify(outOfBoundsStations, null, 2)}`);
    }
    
    expect(outOfBoundsStations.length).toBe(0);
  });

  test("3. EVERY fuel price references an existing valid station with no orphans", async () => {
    const prices = await FuelPrice.find().toArray();
    expect(prices.length).toBeGreaterThan(0);
    
    const stations = await Station.find().toArray();
    const stationIds = new Set(stations.map(s => s._id.toString()));
    
    const orphanedPrices = [];
    
    prices.forEach(price => {
      if (!price.station) {
        orphanedPrices.push({
          priceId: price._id,
          fuelType: price.fuelType,
          issue: "Missing station reference"
        });
        return;
      }
      
      const stationIdStr = price.station.toString();
      if (!stationIds.has(stationIdStr)) {
        orphanedPrices.push({
          priceId: price._id,
          stationId: stationIdStr,
          fuelType: price.fuelType,
          issue: "References non-existent station"
        });
      }
    });
    
    if (orphanedPrices.length > 0) {
      fail(`Found ${orphanedPrices.length} orphaned fuel prices: ${JSON.stringify(orphanedPrices, null, 2)}`);
    }
    
    expect(orphanedPrices.length).toBe(0);
  });

  test("4. ALL fuel prices are realistic positive finite numbers", async () => {
    const prices = await FuelPrice.find().toArray();
    expect(prices.length).toBeGreaterThan(0);
    
    const invalidPrices = [];
    
    prices.forEach(price => {
      const p = price.pricePerLitre;
      
      if (typeof p !== "number") {
        invalidPrices.push({
          priceId: price._id,
          station: price.station,
          fuelType: price.fuelType,
          price: p,
          issue: "Price is not a number"
        });
        return;
      }
      
      if (!Number.isFinite(p)) {
        invalidPrices.push({
          priceId: price._id,
          station: price.station,
          fuelType: price.fuelType,
          price: p,
          issue: "Price is NaN or Infinity"
        });
        return;
      }
      
      if (p <= 0) {
        invalidPrices.push({
          priceId: price._id,
          station: price.station,
          fuelType: price.fuelType,
          price: p,
          issue: "Price is zero or negative"
        });
        return;
      }
      
      if (p < 1.0 || p > 10.0) {
        invalidPrices.push({
          priceId: price._id,
          station: price.station,
          fuelType: price.fuelType,
          price: p,
          issue: "Price outside realistic range ($1-$10)"
        });
      }
    });
    
    if (invalidPrices.length > 0) {
      fail(`Found ${invalidPrices.length} invalid fuel prices: ${JSON.stringify(invalidPrices, null, 2)}`);
    }
    
    expect(invalidPrices.length).toBe(0);
  });

  test("5. fuel type names are strictly consistent across ALL records", async () => {
    const validFuelTypes = [
      "Regular Unleaded (91)",
      "Premium Unleaded (95/98)",
      "Diesel"
    ];
    
    const prices = await FuelPrice.find().toArray();
    const invalidFuelTypes = [];
    
    prices.forEach(price => {
      if (!price.fuelType) {
        invalidFuelTypes.push({
          priceId: price._id,
          fuelType: price.fuelType,
          issue: "Missing fuel type"
        });
        return;
      }
      
      if (typeof price.fuelType !== "string") {
        invalidFuelTypes.push({
          priceId: price._id,
          fuelType: price.fuelType,
          issue: "Fuel type is not a string"
        });
        return;
      }
      
      if (!validFuelTypes.includes(price.fuelType)) {
        invalidFuelTypes.push({
          priceId: price._id,
          fuelType: price.fuelType,
          issue: "Invalid fuel type name"
        });
      }
    });
    
    if (invalidFuelTypes.length > 0) {
      fail(`Found ${invalidFuelTypes.length} invalid fuel types: ${JSON.stringify(invalidFuelTypes, null, 2)}`);
    }
    
    expect(invalidFuelTypes.length).toBe(0);
    
    const uniqueFuelTypes = [...new Set(prices.map(p => p.fuelType))];
    expect(uniqueFuelTypes).toContain("Diesel");
  });

  test("6. NO duplicate fuel prices exist for same station and fuel type combination", async () => {
    const prices = await FuelPrice.find().toArray();
    
    const combinations = new Map();
    const duplicates = [];
    
    prices.forEach(price => {
      const key = `${price.station.toString()}-${price.fuelType}`;
      
      if (combinations.has(key)) {
        duplicates.push({
          station: price.station,
          fuelType: price.fuelType,
          priceId1: combinations.get(key),
          priceId2: price._id
        });
      } else {
        combinations.set(key, price._id);
      }
    });
    
    if (duplicates.length > 0) {
      fail(`Found ${duplicates.length} duplicate fuel prices: ${JSON.stringify(duplicates, null, 2)}`);
    }
    
    expect(duplicates.length).toBe(0);
    expect(combinations.size).toBe(prices.length);
  });

  test("7. database has no duplicate station names at same location", async () => {
    const stations = await Station.find().toArray();
    
    const locationMap = new Map();
    const duplicates = [];
    
    stations.forEach(station => {
      const key = `${station.name}-${station.location?.coordinates?.lat}-${station.location?.coordinates?.lng}`;
      
      if (locationMap.has(key)) {
        duplicates.push({
          name: station.name,
          location: station.location?.coordinates,
          id1: locationMap.get(key),
          id2: station._id
        });
      } else {
        locationMap.set(key, station._id);
      }
    });
    
    if (duplicates.length > 0) {
      fail(`Found ${duplicates.length} duplicate stations: ${JSON.stringify(duplicates, null, 2)}`);
    }
    
    expect(duplicates.length).toBe(0);
  });
});
