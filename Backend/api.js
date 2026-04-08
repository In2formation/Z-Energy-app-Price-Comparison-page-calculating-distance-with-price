//******Api routes*****//
//Common routes:

import { generateChatbotReply } from "./services/genai.js";









// Station & fuel price routes:
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Using raw MongoDB collections instead of Mongoose models.
// This gives direct access to the collections for flexible queries.
const Station = mongoose.connection.collection("stations");
const FuelPrice = mongoose.connection.collection("fuelprices");

// ROUTES 

// GET /api/stations/cheapest/:fuelType
router.get("/cheapest/:fuelType", async (req, res) => {
  try {
    // Decode fuelType from URL so it matches DB key exactly
    const fuelType = decodeURIComponent(req.params.fuelType);

    // Find the cheapest price for this fuel type by sorting ascending
    const cheapest = await FuelPrice.find({ fuelType })
      .sort({ pricePerLitre: 1 })
      .limit(1)
      .toArray();

    if (cheapest.length === 0) {
      return res.status(404).json({ error: "No prices found" });
    }

    //Convert station ID string into ObjectId for proper MongoDB lookup
    const stationId = new mongoose.Types.ObjectId(cheapest[0].station);

    // Fetch station details
    const station = await Station.findOne({ _id: stationId });

    // Attach only the requested fuel type price to station object
    station.fuelPrices = {
      [fuelType]: cheapest[0].pricePerLitre
    };

    res.json(station);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stations
router.get("/", async (req, res) => {
  try {
    // Fetch all stations first
    const stations = await Station.find().toArray();

    // For each station, fetch its fuel prices and attach them
    for (const station of stations) {
      const stationId = new mongoose.Types.ObjectId(station._id);

      const prices = await FuelPrice.find({ station: stationId }).toArray();

      station.fuelPrices = {};
      for (const p of prices) {
        station.fuelPrices[p.fuelType] = p.pricePerLitre;
      }

      // Debugging line commented out — useful for inspecting station objects
      // console.log("STATION DEBUG:", JSON.stringify(station, null, 2));
    }

    res.json(stations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/stations/:id
// Keep this route in team order; if :id isn’t a valid ObjectId, pass to next route.
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(); // WHY: Let other routes handle non-ObjectId paths
    }

    const id = new mongoose.Types.ObjectId(req.params.id);

    const station = await Station.findOne({ _id: id });
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Attach all fuel prices for this station
    const prices = await FuelPrice.find({ station: id }).toArray();

    station.fuelPrices = {};
    for (const p of prices) {
      station.fuelPrices[p.fuelType] = p.pricePerLitre;
    }

    res.json(station);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});











///////***Eleanor Routes line 126-167***//////









































///////***Katrina's Routes lines 167-212***//////











































/////////***Zeus routes 213-256***//////

//Extracts fuel type from user message by checking for keywords
function normalizeFuelTypeFromMessage(message) {
  const text = String(message || "").toLowerCase();

  //Check for diesel mentions
  if (text.includes("diesel")) return "Diesel";
  //Check for premium fuel mentions (95, 98, or premium keyword)
  if (text.includes("95") || text.includes("98") || text.includes("premium")) {
    return "Premium Unleaded (95/98)";
  }
  //Check for regular fuel mentions (91, unleaded, or regular keyword)
  if (text.includes("91") || text.includes("unleaded") || text.includes("regular")) {
    return "Regular Unleaded (91)";
  }

  return null; //No fuel type detected
}

//Calculates distance between two coordinates using Haversine formula
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371; //Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

//Builds location-based hints for AI chatbot by finding nearby stations and fuel prices
async function buildLocationHints(message, context) {
  const location = context?.userLocation;
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  //Return empty hints if location is invalid
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { stationHints: [], fuelHints: [] };
  }

  //Fetch all stations with valid coordinates
  const stations = await Station.find({
    "location.coordinates.lat": { $type: "number" },
    "location.coordinates.lng": { $type: "number" },
  })
    .project({
      name: 1,
      location: 1,
    })
    .toArray();

  //Calculate distance to each station and sort by proximity
  const nearestStations = stations
    .map((station) => {
      const stationLat = station?.location?.coordinates?.lat;
      const stationLng = station?.location?.coordinates?.lng;

      if (!Number.isFinite(stationLat) || !Number.isFinite(stationLng)) {
        return null;
      }

      return {
        ...station,
        distanceKm: haversineDistanceKm(lat, lng, stationLat, stationLng),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5); //Keep only 5 closest stations

  //Format station hints for AI context
  const stationHints = nearestStations.map((station) => ({
    name: station.name,
    city: station?.location?.city,
    region: station?.location?.region,
    distanceKm: Number(station.distanceKm.toFixed(2)),
  }));

  const stationIds = nearestStations.map((station) => station._id);
  if (stationIds.length === 0) {
    return { stationHints, fuelHints: [] };
  }

  //Try to detect fuel type from message, otherwise fetch all fuel types
  const inferredFuelType = normalizeFuelTypeFromMessage(message);
  const fuelQuery = inferredFuelType
    ? { station: { $in: stationIds }, fuelType: inferredFuelType }
    : { station: { $in: stationIds } };

  //Fetch fuel prices for nearby stations
  const nearbyPrices = await FuelPrice.find(fuelQuery)
    .project({ station: 1, fuelType: 1, pricePerLitre: 1 })
    .sort({ pricePerLitre: 1 }) //Sort by cheapest first
    .toArray();

  //Map station IDs to names for fuel hints
  const stationNameById = new Map(
    nearestStations.map((station) => [String(station._id), station.name])
  );

  //Format fuel price hints for AI context
  const fuelHints = nearbyPrices.slice(0, 6).map((price) => ({
    station: stationNameById.get(String(price.station)) || "Unknown station",
    fuelType: price.fuelType,
    pricePerLitre: price.pricePerLitre,
  }));

  return { stationHints, fuelHints };
}

// GET /api/stations/ai/status
//Returns backend and database connection status for health checks
router.get("/ai/status", (req, res) => {
  const dbReadyState = mongoose.connection.readyState; //1 = connected, 0 = disconnected

  res.status(200).json({
    backendOnline: true,
    databaseOnline: dbReadyState === 1,
    dbReadyState,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/stations/ai/chat
//Handles AI chatbot requests by enriching context with location-based hints
router.post("/ai/chat", async (req, res) => {
  try {
    const { message, context } = req.body ?? {};
    const baseContext = context && typeof context === "object" ? context : {};
    
    //Build hints about nearby stations and fuel prices based on user location
    const locationHints = await buildLocationHints(message, baseContext);

    //Merge location hints with existing context for AI
    const mergedContext = {
      ...baseContext,
      stationHints: [...(baseContext.stationHints || []), ...locationHints.stationHints],
      fuelHints: [...(baseContext.fuelHints || []), ...locationHints.fuelHints],
    };

    //Generate AI response using enriched context
    const reply = await generateChatbotReply(message, mergedContext);
    return res.status(200).json({ reply });
  } catch (err) {
    //Handle validation errors (400)
    if (
      err.message === "Message must be a string." ||
      err.message === "Message cannot be empty." ||
      err.message.includes("Message cannot exceed")
    ) {
      return res.status(400).json({ error: err.message });
    }

    //Handle missing API key (500)
    if (err.message === "Missing GEMINI_API_KEY environment variable.") {
      return res.status(500).json({ error: "AI service is not configured." });
    }
    //Handle AI service errors (502)
    return res.status(502).json({ error: err.message });
  }
});

export default router;










































/////////***Adrian's routes 257 onwards***/////




















































