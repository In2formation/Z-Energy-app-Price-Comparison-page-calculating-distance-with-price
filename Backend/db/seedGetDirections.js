import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    address: String,
    city: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  phone: String,
  amenities: [String],
  openingHours: Object,
});

const fuelPriceSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  fuelType: { type: String, required: true },
  pricePerLitre: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

const Station = mongoose.models.Station || mongoose.model("Station", stationSchema);
const FuelPrice = mongoose.models.FuelPrice || mongoose.model("FuelPrice", fuelPriceSchema);

const PRICE_RANGES = {
  regular: [3.05, 3.65],
  premium: [3.25, 3.85],
  diesel: [2.70, 3.30],
};

function regionAdjustment(region) {
  const map = {
    Auckland: [0.05, 0.12],
    Wellington: [0.03, 0.08],
  };
  const [min, max] = map[region] || [0, 0];
  return Math.random() * (max - min) + min;
}

function randomPrice(min, max, adj = 0) {
  const base = Math.random() * (max - min) + min;
  return Number((base + adj).toFixed(3));
}

const stations = [

  // ── Wellington ─────────────────────────────────────────────────────────────

  {
    name: "Z Hutt Rd",
    location: {
      address: "453 Hutt Road, Lower Hutt 5010",
      city: "Lower Hutt",
      region: "Wellington",
      coordinates: { lat: -41.2998, lng: 174.8714 },
    },
    phone: "04-5697582",
    amenities: [
      "Shop",
      "Toilets",
      "Car Wash",
      "Air Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Trailer Hire",
      "Pay in App",
      "LPG SwapnGo",
      "Compostable Cups",
      "24/7 Pay at Pump",
      "Z Espresso Coffee & Fresh Food",
    ],
    openingHours: {
      monday: "5:00am - 11:59pm",
      tuesday: "5:00am - 11:59pm",
      wednesday: "5:00am - 11:59pm",
      thursday: "5:00am - 11:59pm",
      friday: "5:00am - 11:59pm",
      saturday: "6:00am - 11:59pm",
      sunday: "6:00am - 11:59pm",
    },
  },

  // ── Auckland ───────────────────────────────────────────────────────────────
// TEST 04/02/2026
  {
    name: "Z Energy Ellerslie",
    location: {
      address: "108 Main Highway, Ellerslie, Auckland 1051",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8962, lng: 174.7975 },
    },
    amenities: [
      "Shop",
      "Toilets",
      "Car Wash",
      "Air Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Pay in App",
      "LPG SwapnGo",
      "Compostable Cups",
      "24/7 Pay at Pump",
      "Z Espresso Coffee & Fresh Food",
      "EV Charging",
    ],
    openingHours: {
      monday: "24 Hours",
      tuesday: "24 Hours",
      wednesday: "24 Hours",
      thursday: "24 Hours",
      friday: "24 Hours",
      saturday: "24 Hours",
      sunday: "24 Hours",
    },
  },

  {
    name: "Z Energy Epsom",
    location: {
      address: "321 Manukau Road, Epsom, Auckland 1023",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8893, lng: 174.7615 },
    },
    amenities: [
      "Shop",
      "Toilets",
      "Air Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Trailer Hire",
      "Pay in App",
      "Compostable Cups",
      "Z Espresso Coffee & Fresh Food",
    ],
    openingHours: {
      monday: "5:30am - 11:00pm",
      tuesday: "5:30am - 11:00pm",
      wednesday: "5:30am - 11:00pm",
      thursday: "5:30am - 11:00pm",
      friday: "5:30am - 11:00pm",
      saturday: "6:00am - 10:00pm",
      sunday: "6:00am - 10:00pm",
    },
  },

  {
    name: "Z Energy Onehunga",
    location: {
      address: "174 Onehunga Mall, Onehunga, Auckland 1061",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9261, lng: 174.7835 },
    },
    amenities: [
      "Shop",
      "Toilets",
      "Car Wash",
      "Air Stop",
      "Truck Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Pay in App",
      "LPG SwapnGo",
      "Compostable Cups",
      "24/7 Pay at Pump",
      "Z Espresso Coffee & Fresh Food",
      "EV Charging",
    ],
    openingHours: {
      monday: "24 Hours",
      tuesday: "24 Hours",
      wednesday: "24 Hours",
      thursday: "24 Hours",
      friday: "24 Hours",
      saturday: "24 Hours",
      sunday: "24 Hours",
    },
  },

  {
    name: "Z Energy Manukau",
    location: {
      address: "3 Cavendish Drive, Manukau City, Auckland 2104",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9931, lng: 174.8789 },
    },
    amenities: [
      "Shop",
      "Toilets",
      "Car Wash",
      "Air Stop",
      "Truck Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Trailer Hire",
      "Pay in App",
      "LPG SwapnGo",
      "Compostable Cups",
      "24/7 Pay at Pump",
      "Z Espresso Coffee & Fresh Food",
      "EV Charging",
    ],
    openingHours: {
      monday: "24 Hours",
      tuesday: "24 Hours",
      wednesday: "24 Hours",
      thursday: "24 Hours",
      friday: "24 Hours",
      saturday: "24 Hours",
      sunday: "24 Hours",
    },
  },

  {
    name: "Z Energy Pakuranga",
    location: {
      address: "1 Pakuranga Highway, Pakuranga, Auckland 2010",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9029, lng: 174.8615 },
    },
    amenities: [
      "Shop",
      "Toilets",
      "Air Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Pay in App",
      "LPG SwapnGo",
      "Compostable Cups",
      "Z Espresso Coffee & Fresh Food",
    ],
    openingHours: {
      monday: "5:00am - 11:00pm",
      tuesday: "5:00am - 11:00pm",
      wednesday: "5:00am - 11:00pm",
      thursday: "5:00am - 11:00pm",
      friday: "5:00am - 11:00pm",
      saturday: "6:00am - 10:00pm",
      sunday: "6:00am - 10:00pm",
    },
  },

  {
    name: "Z Energy Glen Innes",
    location: {
      address: "1 Line Road, Glen Innes, Auckland 1072",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8781, lng: 174.8473 },
    },
    amenities: [
      "Shop",
      "Toilets",
      "Car Wash",
      "Air Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Trailer Hire",
      "Pay in App",
      "Compostable Cups",
      "24/7 Pay at Pump",
      "Z Espresso Coffee & Fresh Food",
    ],
    openingHours: {
      monday: "24 Hours",
      tuesday: "24 Hours",
      wednesday: "24 Hours",
      thursday: "24 Hours",
      friday: "24 Hours",
      saturday: "24 Hours",
      sunday: "24 Hours",
    },
  },

  {
    name: "Z Energy Mount Roskill",
    location: {
      address: "1 Stoddard Road, Mount Roskill, Auckland 1041",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9133, lng: 174.7345 },
    },
    amenities: [
      "Shop",
      "Toilets",
      "Air Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Pay in App",
      "LPG SwapnGo",
      "Compostable Cups",
      "Z Espresso Coffee & Fresh Food",
      "EV Charging",
    ],
    openingHours: {
      monday: "5:30am - 11:00pm",
      tuesday: "5:30am - 11:00pm",
      wednesday: "5:30am - 11:00pm",
      thursday: "5:30am - 11:00pm",
      friday: "5:30am - 11:00pm",
      saturday: "6:00am - 10:00pm",
      sunday: "7:00am - 10:00pm",
    },
  },

  {
    name: "Z Energy New Lynn",
    location: {
      address: "3058 Great North Road, New Lynn, Auckland 0600",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9091, lng: 174.6855 },
    },
    amenities: [
      "Shop",
      "Toilets",
      "Car Wash",
      "Air Stop",
      "Truck Stop",
      "Pre-order Coffee",
      "Z2Go",
      "Trailer Hire",
      "Pay in App",
      "LPG SwapnGo",
      "Compostable Cups",
      "24/7 Pay at Pump",
      "Z Espresso Coffee & Fresh Food",
    ],
    openingHours: {
      monday: "24 Hours",
      tuesday: "24 Hours",
      wednesday: "24 Hours",
      thursday: "24 Hours",
      friday: "24 Hours",
      saturday: "24 Hours",
      sunday: "24 Hours",
    },
  },

];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const stationData of stations) {
      const result = await Station.updateOne(
        { name: stationData.name },
        { $set: stationData },
        { upsert: true },
      );

      const station = await Station.findOne({ name: stationData.name });

      if (result.upsertedCount > 0) {
        console.log(`Inserted station: ${stationData.name}`);
      } else {
        console.log(`Updated station: ${stationData.name}`);
      }

      await FuelPrice.deleteMany({ station: station._id });

      const adj = regionAdjustment(stationData.location.region);

      const fuels = [
        {
          station: new mongoose.Types.ObjectId(station._id),
          fuelType: "Regular Unleaded (91)",
          pricePerLitre: randomPrice(...PRICE_RANGES.regular, adj),
        },
        {
          station: new mongoose.Types.ObjectId(station._id),
          fuelType: "Premium Unleaded (95/98)",
          pricePerLitre: randomPrice(...PRICE_RANGES.premium, adj),
        },
        {
          station: new mongoose.Types.ObjectId(station._id),
          fuelType: "Diesel",
          pricePerLitre: randomPrice(...PRICE_RANGES.diesel, adj),
        },
      ];

      await FuelPrice.insertMany(fuels);
      console.log(`Replaced fuel prices for: ${stationData.name}`);
    }

    console.log("\nAll GetDirections stations seeded successfully.");
    process.exit();
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
