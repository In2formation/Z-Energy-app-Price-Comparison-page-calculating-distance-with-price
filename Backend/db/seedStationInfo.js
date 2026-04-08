import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

//Define schemas inline
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
  amenities: [String],
  openingHours: Object,
});

const fuelPriceSchema = new mongoose.Schema({
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  fuelType: { type: String, required: true },
  pricePerLitre: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

//Register models
const Station =
  mongoose.models.Station || mongoose.model("Station", stationSchema);
const FuelPrice =
  mongoose.models.FuelPrice || mongoose.model("FuelPrice", fuelPriceSchema);

//NZ Price Ranges (March 2026 realistic)
const PRICE_RANGES = {
  regular: [3.05, 3.65], // 91
  premium: [3.25, 3.85], // 95
  diesel: [2.7, 3.3], // Diesel
};

// Region-based adjustments
function regionAdjustment(region) {
  const map = {
    Auckland: [0.05, 0.12],
    Wellington: [0.03, 0.08],
    Christchurch: [-0.02, 0.03],
    Nelson: [-0.05, 0.0],
    Tasman: [-0.05, 0.0],
    Southland: [-0.08, -0.02],
    Rural: [0.05, 0.15],
  };

  const [min, max] = map[region] || [0, 0];
  return Math.random() * (max - min) + min;
}

//Random price generator
function randomPrice(min, max, adj = 0) {
  const base = Math.random() * (max - min) + min;
  return Number((base + adj).toFixed(3));
}

//Seed data
const stations = [
  {
    name: "Z Energy Porowini",
    location: {
      address: "19 Porowini Avenue, Whangārei 0110",
      city: "Whangārei",
      region: "Northland",
      coordinates: { lat: -35.7369, lng: 174.3237 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Kensington",
    location: {
      address: "31 Kamo Road, Kensington, Whangārei 0112",
      city: "Whangārei",
      region: "Northland",
      coordinates: { lat: -35.7078, lng: 174.3231 },
    },
    amenities: ["Shop", "Toilets", "Truck Stop", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Kamo",
    location: {
      address: "519 Kamo Road, Kamo, Whangārei 0112",
      city: "Whangārei",
      region: "Northland",
      coordinates: { lat: -35.6809, lng: 174.3119 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Kaikohe",
    location: {
      address: "1 Broadway, Kaikohe 0405",
      city: "Kaikohe",
      region: "Northland",
      coordinates: { lat: -35.4073, lng: 173.8024 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Kerikeri",
    location: {
      address: "1 Homestead Road, Kerikeri 0230",
      city: "Kerikeri",
      region: "Northland",
      coordinates: { lat: -35.2266, lng: 173.947 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Paihia",
    location: {
      address: "1 Marsden Road, Paihia 0200",
      city: "Paihia",
      region: "Northland",
      coordinates: { lat: -35.281, lng: 174.091 },
    },
    amenities: ["Shop", "Air Stop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Kaitaia",
    location: {
      address: "11 North Road, Kaitaia 0410",
      city: "Kaitaia",
      region: "Northland",
      coordinates: { lat: -35.1134, lng: 173.262 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

{
  name: "Z Whangārei",
  location: {
    address: "2 Kioreroa Road, Port Whangārei 0110",
    city: "Whangārei",
    region: "Northland",
    coordinates: { lat: -35.7422, lng: 174.3298 }
  },
  amenities: ["Truck Stop", "Diesel Only"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},


{
  name: "Z Kaitaia",
  location: {
    address: "25 North Road, Kaitaia 0410",
    city: "Kaitaia",
    region: "Northland",
    coordinates: { lat: -35.1089, lng: 173.2628 }
  },
  amenities: ["Truck Stop", "Diesel Only"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},


{
  name: "Z Kawakawa",
  location: {
    address: "State Highway 1, Kawakawa 0210",
    city: "Kawakawa",
    region: "Northland",
    coordinates: { lat: -35.3784, lng: 174.0669 }
  },
  amenities: ["Truck Stop", "Diesel Only", "Air Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

{
  name: "Z Dargaville",
  location: {
    address: "2 Normanby Street, Dargaville 0310",
    city: "Dargaville",
    region: "Northland",
    coordinates: { lat: -35.9336, lng: 173.8781 }
  },
  amenities: ["Truck Stop", "Diesel Only"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

  //Auckland

  {
    name: "Z Energy Quay Street",
    location: {
      address: "169 Quay Street, Auckland CBD 1010",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8436, lng: 174.7705 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Newton",
    location: {
      address: "100 Newton Road, Newton, Auckland 1010",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8604, lng: 174.7539 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Ponsonby",
    location: {
      address: "2–8 College Hill, Freemans Bay, Auckland 1011",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8479, lng: 174.7448 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Grafton",
    location: {
      address: "105 Grafton Road, Grafton, Auckland 1010",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8608, lng: 174.7664 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Parnell",
    location: {
      address: "60 Stanley Street, Parnell, Auckland 1010",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8537, lng: 174.7761 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Newmarket",
    location: {
      address: "317 Broadway, Newmarket, Auckland 1023",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8705, lng: 174.7773 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Grey Lynn",
    location: {
      address: "563 Great North Road, Grey Lynn, Auckland 1021",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8647, lng: 174.7358 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Mt Eden",
    location: {
      address: "425 Dominion Road, Mt Eden, Auckland 1024",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8821, lng: 174.7449 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Remuera",
    location: {
      address: "333 Remuera Road, Remuera, Auckland 1050",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8803, lng: 174.7994 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Orakei",
    location: {
      address: "97 Kepa Road, Orakei, Auckland 1071",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8585, lng: 174.8112 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Wairau Valley",
    location: {
      address: "75 Wairau Road, Wairau Valley, Auckland 0627",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.7789, lng: 174.7442 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Glenfield",
    location: {
      address: "424 Glenfield Road, Glenfield, Auckland 0629",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.778, lng: 174.7265 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Northcote",
    location: {
      address: "12 Onewa Road, Northcote, Auckland 0627",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8114, lng: 174.7447 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Birkenhead",
    location: {
      address: "61 Mokoia Road, Birkenhead, Auckland 0626",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.811, lng: 174.726 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Milford",
    location: {
      address: "202 East Coast Road, Milford, Auckland 0620",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.7655, lng: 174.764 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Albany",
    location: {
      address: "1 Oteha Valley Road, Albany, Auckland 0632",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.7369, lng: 174.7087 },
    },
    amenities: ["Shop", "Toilets", "Car Wash", "Air Stop"],
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
    name: "Z Energy Browns Bay",
    location: {
      address: "1 Beach Road, Browns Bay, Auckland 0630",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.7158, lng: 174.7488 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Henderson",
    location: {
      address: "325 Great North Road, Henderson, Auckland 0612",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8784, lng: 174.6287 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Lincoln Road",
    location: {
      address: "155 Lincoln Road, Henderson, Auckland 0610",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8649, lng: 174.6261 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Te Atatū South",
    location: {
      address: "1 Edmonton Road, Te Atatū South, Auckland 0610",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8718, lng: 174.6517 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy New Lynn",
    location: {
      address: "1 Clark Street, New Lynn, Auckland 0600",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9092, lng: 174.6845 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Westgate",
    location: {
      address: "1 Fernhill Drive, Westgate, Auckland 0814",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8299, lng: 174.6134 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Massey",
    location: {
      address: "1 Triangle Road, Massey, Auckland 0614",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8377, lng: 174.6269 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Manukau",
    location: {
      address: "33 Cavendish Drive, Manukau, Auckland 2104",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9884, lng: 174.8782 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Papatoetoe",
    location: {
      address: "1 East Tamaki Road, Papatoetoe, Auckland 2025",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9731, lng: 174.8554 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Ōtāhuhu",
    location: {
      address: "20 Atkinson Avenue, Ōtāhuhu, Auckland 1062",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9448, lng: 174.8447 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Māngere",
    location: {
      address: "1 Coronation Road, Māngere, Auckland 2022",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9682, lng: 174.8004 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Takanini",
    location: {
      address: "1 Spartan Road, Takanini, Auckland 2105",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -37.0442, lng: 174.9003 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Papakura",
    location: {
      address: "345 Great South Road, Papakura, Auckland 2110",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -37.0657, lng: 174.9431 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Airport",
    location: {
      address: "100 George Bolt Memorial Drive, Māngere, Auckland 2022",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -37.0029, lng: 174.7852 },
    },
    amenities: ["Shop", "Toilets"],
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
  name: "Z Energy Wiri",
  location: {
    address: "149 Roscommon Road, Wiri, Auckland 2104",
    city: "Auckland",
    region: "Auckland",
    coordinates: { lat: -37.0034, lng: 174.8511 }
  },
  amenities: ["Truck Stop", "Diesel Only"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

  {
    name: "Z Energy Panmure",
    location: {
      address: "521 Ellerslie-Panmure Highway, Panmure, Auckland 1060",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9002, lng: 174.8441 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Glen Innes",
    location: {
      address: "209 Apirana Avenue, Glen Innes, Auckland 1072",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8759, lng: 174.8557 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Mt Wellington",
    location: {
      address: "519 Ellerslie-Panmure Highway, Mt Wellington, Auckland 1060",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9009, lng: 174.8417 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Pakuranga",
    location: {
      address: "1 Pakuranga Road, Pakuranga, Auckland 2010",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.8991, lng: 174.8793 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Howick",
    location: {
      address: "219 Moore Street, Howick, Auckland 2014",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9006, lng: 174.9294 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Botany",
    location: {
      address: "316 Ti Rakau Drive, Botany Downs, Auckland 2013",
      city: "Auckland",
      region: "Auckland",
      coordinates: { lat: -36.9232, lng: 174.9008 },
    },
    amenities: ["Shop", "Toilets", "Car Wash", "Air Stop"],
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
    name: "Z Energy Warkworth",
    location: {
      address: "6 Mill Lane, Warkworth 0910",
      city: "Warkworth",
      region: "Auckland",
      coordinates: { lat: -36.3989, lng: 174.6627 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Wellsford",
    location: {
      address: "135 Rodney Street, Wellsford 0900",
      city: "Wellsford",
      region: "Auckland",
      coordinates: { lat: -36.2914, lng: 174.523 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Silverdale",
    location: {
      address: "20 Hibiscus Coast Highway, Silverdale 0932",
      city: "Silverdale",
      region: "Auckland",
      coordinates: { lat: -36.6244, lng: 174.6768 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Orewa",
    location: {
      address: "1 Florence Avenue, Orewa 0931",
      city: "Orewa",
      region: "Auckland",
      coordinates: { lat: -36.5811, lng: 174.6924 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

{
  name: "Z Energy Dairy Flat",
  location: {
    address: "1127 Dairy Flat Highway, Dairy Flat 0794",
    city: "Dairy Flat",
    region: "Auckland",
    coordinates: { lat: -36.6617, lng: 174.6612 }
  },
  amenities: ["Truck Stop", "Diesel Only"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

  {
    name: "Z Energy Kumeū",
    location: {
      address: "1 Main Road, Kumeū 0810",
      city: "Kumeū",
      region: "Auckland",
      coordinates: { lat: -36.7704, lng: 174.5507 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Huapai",
    location: {
      address: "302 Main Road, Huapai 0810",
      city: "Huapai",
      region: "Auckland",
      coordinates: { lat: -36.7709, lng: 174.5423 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Pōkeno Northbound",
    location: {
      address: "1 Great South Road, Pōkeno 2472",
      city: "Pōkeno",
      region: "Waikato",
      coordinates: { lat: -37.2489, lng: 175.0298 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Pōkeno Southbound",
    location: {
      address: "2 Great South Road, Pōkeno 2472",
      city: "Pōkeno",
      region: "Waikato",
      coordinates: { lat: -37.2507, lng: 175.0304 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Bombay",
    location: {
      address: "1103 Great South Road, Bombay 2675",
      city: "Bombay",
      region: "Waikato",
      coordinates: { lat: -37.2014, lng: 174.9921 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Drury",
    location: {
      address: "217 Great South Road, Drury 2113",
      city: "Drury",
      region: "Auckland",
      coordinates: { lat: -37.0928, lng: 174.9573 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
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
    name: "Z Energy Pukekohe",
    location: {
      address: "100 King Street, Pukekohe 2120",
      city: "Pukekohe",
      region: "Auckland",
      coordinates: { lat: -37.2021, lng: 174.9034 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Tuakau",
    location: {
      address: "1 George Street, Tuakau 2121",
      city: "Tuakau",
      region: "Waikato",
      coordinates: { lat: -37.2668, lng: 174.9521 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Waiuku",
    location: {
      address: "15 Kitchener Road, Waiuku 2123",
      city: "Waiuku",
      region: "Auckland",
      coordinates: { lat: -37.2478, lng: 174.7312 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Helensville",
    location: {
      address: "53 Commercial Road, Helensville 0800",
      city: "Helensville",
      region: "Auckland",
      coordinates: { lat: -36.6794, lng: 174.4507 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Te Rapa",
    location: {
      address: "651 Te Rapa Road, Hamilton 3200",
      city: "Hamilton",
      region: "Waikato",
      coordinates: { lat: -37.7442, lng: 175.2401 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Five Cross Roads",
    location: {
      address: "245 Peachgrove Road, Hamilton 3216",
      city: "Hamilton",
      region: "Waikato",
      coordinates: { lat: -37.7764, lng: 175.2891 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Greenwood Street",
    location: {
      address: "100 Greenwood Street, Frankton, Hamilton 3204",
      city: "Hamilton",
      region: "Waikato",
      coordinates: { lat: -37.7983, lng: 175.2664 },
    },
    amenities: ["Shop", "Toilets", "Truck Stop", "Air Stop"],
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
    name: "Z Energy Peachgrove",
    location: {
      address: "100 Peachgrove Road, Hamilton 3216",
      city: "Hamilton",
      region: "Waikato",
      coordinates: { lat: -37.7769, lng: 175.2867 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Cambridge",
    location: {
      address: "1 Queen Street, Cambridge 3434",
      city: "Cambridge",
      region: "Waikato",
      coordinates: { lat: -37.8915, lng: 175.4691 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Huntly",
    location: {
      address: "1 Tainui Bridge Road, Huntly 3700",
      city: "Huntly",
      region: "Waikato",
      coordinates: { lat: -37.5602, lng: 175.1593 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Ngaruawahia",
    location: {
      address: "2 Great South Road, Ngaruawahia 3720",
      city: "Ngaruawahia",
      region: "Waikato",
      coordinates: { lat: -37.6671, lng: 175.1512 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Morrinsville",
    location: {
      address: "1 Thames Street, Morrinsville 3300",
      city: "Morrinsville",
      region: "Waikato",
      coordinates: { lat: -37.6584, lng: 175.5291 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Matamata",
    location: {
      address: "45 Broadway, Matamata 3400",
      city: "Matamata",
      region: "Waikato",
      coordinates: { lat: -37.8102, lng: 175.7621 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Tokoroa",
    location: {
      address: "1 Bridge Street, Tokoroa 3420",
      city: "Tokoroa",
      region: "Waikato",
      coordinates: { lat: -38.2241, lng: 175.8702 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

{
  name: "Z Energy Spa Road",
  location: {
    address: "1 Spa Road, Taupō 3330",
    city: "Taupō",
    region: "Waikato",
    coordinates: { lat: -38.6867, lng: 176.0702 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

  {
    name: "Z Energy Rifle Range Road",
    location: {
      address: "67 Rifle Range Road, Taupō 3330",
      city: "Taupō",
      region: "Waikato",
      coordinates: { lat: -38.6931, lng: 176.0739 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Tirau",
    location: {
      address: "1 Main Road, Tirau 3410",
      city: "Tirau",
      region: "Waikato",
      coordinates: { lat: -37.9861, lng: 175.7571 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Thames",
    location: {
      address: "500 Pollen Street, Thames 3500",
      city: "Thames",
      region: "Coromandel",
      coordinates: { lat: -37.1384, lng: 175.5402 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Whitianga",
    location: {
      address: "1 Joan Gaskell Drive, Whitianga 3510",
      city: "Whitianga",
      region: "Coromandel",
      coordinates: { lat: -36.8319, lng: 175.6991 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Whangamatā",
    location: {
      address: "700 Port Road, Whangamatā 3620",
      city: "Whangamatā",
      region: "Coromandel",
      coordinates: { lat: -37.2093, lng: 175.8681 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Tairua",
    location: {
      address: "236 Main Road, Tairua 3508",
      city: "Tairua",
      region: "Coromandel",
      coordinates: { lat: -37.0167, lng: 175.8471 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Paeroa",
    location: {
      address: "1 Belmont Road, Paeroa 3600",
      city: "Paeroa",
      region: "Coromandel",
      coordinates: { lat: -37.3762, lng: 175.6714 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

{
  name: "Z Energy Cameron Road",
  location: {
    address: "751 Cameron Road, Tauranga 3112",
    city: "Tauranga",
    region: "Bay of Plenty",
    coordinates: { lat: -37.7089, lng: 176.1542 }
  },
  amenities: ["Shop", "Toilets", "Car Wash"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

  {
    name: "Z Energy 15th Ave",
    location: {
      address: "1 15th Avenue, Tauranga 3112",
      city: "Tauranga",
      region: "Bay of Plenty",
      coordinates: { lat: -37.7001, lng: 176.1578 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Hewletts Road",
    location: {
      address: "157 Hewletts Road, Mount Maunganui 3116",
      city: "Mount Maunganui",
      region: "Bay of Plenty",
      coordinates: { lat: -37.6734, lng: 176.1967 },
    },
    amenities: ["Shop", "Toilets", "Truck Stop"],
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
    name: "Z Energy Mount Maunganui",
    location: {
      address: "2 Totara Street, Mount Maunganui 3116",
      city: "Mount Maunganui",
      region: "Bay of Plenty",
      coordinates: { lat: -37.6551, lng: 176.1864 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Papamoa",
    location: {
      address: "20 Domain Road, Papamoa 3118",
      city: "Papamoa",
      region: "Bay of Plenty",
      coordinates: { lat: -37.7221, lng: 176.2874 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Te Puke",
    location: {
      address: "1 Jellicoe Street, Te Puke 3119",
      city: "Te Puke",
      region: "Bay of Plenty",
      coordinates: { lat: -37.7861, lng: 176.3241 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Rotorua Fenton",
    location: {
      address: "246 Fenton Street, Rotorua 3010",
      city: "Rotorua",
      region: "Bay of Plenty",
      coordinates: { lat: -38.1441, lng: 176.2512 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
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
    name: "Z Energy Fairy Springs",
    location: {
      address: "31 Fairy Springs Road, Rotorua 3015",
      city: "Rotorua",
      region: "Bay of Plenty",
      coordinates: { lat: -38.1189, lng: 176.2354 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Whakatāne",
    location: {
      address: "1 Commerce Street, Whakatāne 3120",
      city: "Whakatāne",
      region: "Bay of Plenty",
      coordinates: { lat: -37.9572, lng: 177.0021 },
    },
    amenities: ["Shop", "Toilets", "Air Stop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Kawerau",
    location: {
      address: "1 Islington Street, Kawerau 3127",
      city: "Kawerau",
      region: "Bay of Plenty",
      coordinates: { lat: -38.0901, lng: 176.6994 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy New Plymouth",
    location: {
      address: "268 Devon Street West, New Plymouth 4310",
      city: "New Plymouth",
      region: "Taranaki",
      coordinates: { lat: -39.0588, lng: 174.0645 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Vogeltown",
    location: {
      address: "1 Huatoki Street, New Plymouth 4310",
      city: "New Plymouth",
      region: "Taranaki",
      coordinates: { lat: -39.0861, lng: 174.0742 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Hāwera",
    location: {
      address: "1 High Street, Hāwera 4610",
      city: "Hāwera",
      region: "Taranaki",
      coordinates: { lat: -39.5914, lng: 174.2831 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Stratford",
    location: {
      address: "1 Broadway, Stratford 4332",
      city: "Stratford",
      region: "Taranaki",
      coordinates: { lat: -39.3391, lng: 174.2814 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Waitara",
    location: {
      address: "1 McLean Street, Waitara 4320",
      city: "Waitara",
      region: "Taranaki",
      coordinates: { lat: -39.0019, lng: 174.2387 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

{
  name: "Z Energy Rangitikei",
  location: {
    address: "527 Rangitikei Street, Palmerston North 4410",
    city: "Palmerston North",
    region: "Manawatū–Whanganui",
    coordinates: { lat: -40.3291, lng: 175.6114 }
  },
  amenities: ["Shop", "Toilets", "Car Wash"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

  {
    name: "Z Energy Fitzherbert",
    location: {
      address: "1 Fitzherbert Avenue, Palmerston North 4410",
      city: "Palmerston North",
      region: "Manawatū–Whanganui",
      coordinates: { lat: -40.3561, lng: 175.6119 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Whanganui",
    location: {
      address: "1 London Street, Whanganui 4500",
      city: "Whanganui",
      region: "Manawatū–Whanganui",
      coordinates: { lat: -39.9321, lng: 175.0504 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Dublin Street",
    location: {
      address: "100 Dublin Street, Whanganui 4500",
      city: "Whanganui",
      region: "Manawatū–Whanganui",
      coordinates: { lat: -39.9348, lng: 175.0411 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Levin",
    location: {
      address: "1 Oxford Street, Levin 5510",
      city: "Levin",
      region: "Manawatū–Whanganui",
      coordinates: { lat: -40.6231, lng: 175.2831 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Feilding",
    location: {
      address: "1 Kimbolton Road, Feilding 4702",
      city: "Feilding",
      region: "Manawatū–Whanganui",
      coordinates: { lat: -40.2261, lng: 175.5661 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Bulls",
    location: {
      address: "2 Bridge Street, Bulls 4818",
      city: "Bulls",
      region: "Manawatū–Whanganui",
      coordinates: { lat: -40.1741, lng: 175.3811 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

{
  name: "Z Energy Taradale Road",
  location: {
    address: "1 Taradale Road, Napier 4110",
    city: "Napier",
    region: "Hawke’s Bay",
    coordinates: { lat: -39.4991, lng: 176.9014 }
  },
  amenities: ["Shop", "Toilets", "Car Wash"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

  {
    name: "Z Energy Kennedy Road",
    location: {
      address: "100 Kennedy Road, Napier 4110",
      city: "Napier",
      region: "Hawke’s Bay",
      coordinates: { lat: -39.4928, lng: 176.8971 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Stortford Lodge",
    location: {
      address: "801 Heretaunga Street West, Hastings 4120",
      city: "Hastings",
      region: "Hawke’s Bay",
      coordinates: { lat: -39.6381, lng: 176.8339 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Havelock North",
    location: {
      address: "1 Te Mata Road, Havelock North 4130",
      city: "Havelock North",
      region: "Hawke’s Bay",
      coordinates: { lat: -39.6712, lng: 176.8801 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Waipukurau",
    location: {
      address: "1 Ruataniwha Street, Waipukurau 4200",
      city: "Waipukurau",
      region: "Hawke’s Bay",
      coordinates: { lat: -39.9921, lng: 176.5541 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Gisborne",
    location: {
      address: "1 Gladstone Road, Gisborne 4010",
      city: "Gisborne",
      region: "Gisborne",
      coordinates: { lat: -38.6623, lng: 178.0176 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Palmerston Road",
    location: {
      address: "337 Palmerston Road, Gisborne 4010",
      city: "Gisborne",
      region: "Gisborne",
      coordinates: { lat: -38.6551, lng: 178.0204 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Wairoa",
    location: {
      address: "1 Marine Parade, Wairoa 4108",
      city: "Wairoa",
      region: "Gisborne",
      coordinates: { lat: -39.0334, lng: 177.3671 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Masterton",
    location: {
      address: "1 Chapel Street, Masterton 5810",
      city: "Masterton",
      region: "Wairarapa",
      coordinates: { lat: -40.9481, lng: 175.6621 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Carterton",
    location: {
      address: "199 High Street North, Carterton 5713",
      city: "Carterton",
      region: "Wairarapa",
      coordinates: { lat: -41.0201, lng: 175.5234 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Featherston",
    location: {
      address: "1 Fitzherbert Street, Featherston 5710",
      city: "Featherston",
      region: "Wairarapa",
      coordinates: { lat: -41.1131, lng: 175.3231 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Taranaki Street",
    location: {
      address: "174 Taranaki Street, Wellington 6011",
      city: "Wellington",
      region: "Wellington",
      coordinates: { lat: -41.2969, lng: 174.7774 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Vivian Street",
    location: {
      address: "174 Vivian Street, Wellington 6011",
      city: "Wellington",
      region: "Wellington",
      coordinates: { lat: -41.2961, lng: 174.7741 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 11pm",
      tuesday: "6am - 11pm",
      wednesday: "6am - 11pm",
      thursday: "6am - 11pm",
      friday: "6am - 11pm",
      saturday: "7am - 10pm",
      sunday: "7am - 10pm",
    },
  },

  {
    name: "Z Energy Kilbirnie",
    location: {
      address: "1 Rongotai Road, Kilbirnie, Wellington 6022",
      city: "Wellington",
      region: "Wellington",
      coordinates: { lat: -41.3161, lng: 174.7951 },
    },
    amenities: ["Shop", "Toilets", "Car Wash"],
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
    name: "Z Energy Johnsonville",
    location: {
      address: "3 Johnsonville Road, Johnsonville 6037",
      city: "Wellington",
      region: "Wellington",
      coordinates: { lat: -41.2241, lng: 174.8041 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Porirua",
    location: {
      address: "1 Titahi Bay Road, Porirua 5022",
      city: "Porirua",
      region: "Wellington",
      coordinates: { lat: -41.1351, lng: 174.8401 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Mana",
    location: {
      address: "1 Mana Esplanade, Mana 5026",
      city: "Porirua",
      region: "Wellington",
      coordinates: { lat: -41.0981, lng: 174.8671 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy High Street Lower Hutt",
    location: {
      address: "316 High Street, Lower Hutt 5010",
      city: "Lower Hutt",
      region: "Wellington",
      coordinates: { lat: -41.2091, lng: 174.9051 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Petone",
    location: {
      address: "1 Jackson Street, Petone 5012",
      city: "Lower Hutt",
      region: "Wellington",
      coordinates: { lat: -41.2261, lng: 174.8711 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Upper Hutt",
    location: {
      address: "1 Fergusson Drive, Upper Hutt 5018",
      city: "Upper Hutt",
      region: "Wellington",
      coordinates: { lat: -41.1241, lng: 175.0701 },
    },
    amenities: ["Shop", "Toilets"],
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
    name: "Z Energy Paraparaumu",
    location: {
      address: "1 Kapiti Road, Paraparaumu 5032",
      city: "Paraparaumu",
      region: "Wellington",
      coordinates: { lat: -40.9151, lng: 174.9981 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

  {
    name: "Z Energy Waikanae",
    location: {
      address: "1 Ngaio Road, Waikanae 5036",
      city: "Waikanae",
      region: "Kapiti Coast",
      coordinates: { lat: -40.8751, lng: 175.0671 },
    },
    amenities: ["Shop"],
    openingHours: {
      monday: "6am - 9pm",
      tuesday: "6am - 9pm",
      wednesday: "6am - 9pm",
      thursday: "6am - 9pm",
      friday: "6am - 9pm",
      saturday: "7am - 8pm",
      sunday: "7am - 8pm",
    },
  },

  {
    name: "Z Energy Ōtaki",
    location: {
      address: "1 Mill Road, Ōtaki 5512",
      city: "Ōtaki",
      region: "Kapiti Coast",
      coordinates: { lat: -40.7581, lng: 175.1501 },
    },
    amenities: ["Shop", "Toilets"],
    openingHours: {
      monday: "6am - 10pm",
      tuesday: "6am - 10pm",
      wednesday: "6am - 10pm",
      thursday: "6am - 10pm",
      friday: "6am - 10pm",
      saturday: "7am - 9pm",
      sunday: "7am - 9pm",
    },
  },

{
  name: "Z Energy Seaview",
  location: {
    address: "2 Seaview Road, Seaview, Lower Hutt 5010",
    city: "Lower Hutt",
    region: "Wellington",
    coordinates: { lat: -41.2361, lng: 174.9091 }
  },
  amenities: ["Truck Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},

{
  name: "Z Energy Porirua",
  location: {
    address: "15 John Seddon Drive, Porirua 5022",
    city: "Porirua",
    region: "Wellington",
    coordinates: { lat: -41.1359, lng: 174.8409 }
  },
  amenities: ["Truck Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Cashmere",
  location: {
    address: "25 Colombo Street, Cashmere, Christchurch 8022",
    city: "Christchurch",
    region: "Canterbury",
    coordinates: { lat: -43.5731, lng: 172.6421 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "6am - 10pm",
    tuesday: "6am - 10pm",
    wednesday: "6am - 10pm",
    thursday: "6am - 10pm",
    friday: "6am - 10pm",
    saturday: "7am - 9pm",
    sunday: "7am - 9pm"
  }
},
{
  name: "Z Energy Sockburn",
  location: {
    address: "68 Curletts Road, Sockburn, Christchurch 8042",
    city: "Christchurch",
    region: "Canterbury",
    coordinates: { lat: -43.5461, lng: 172.5871 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "6am - 10pm",
    tuesday: "6am - 10pm",
    wednesday: "6am - 10pm",
    thursday: "6am - 10pm",
    friday: "6am - 10pm",
    saturday: "7am - 9pm",
    sunday: "7am - 9pm"
  }
},
{
  name: "Z Energy Green Island",
  location: {
    address: "185 Main South Road, Green Island, Dunedin 9018",
    city: "Dunedin",
    region: "Otago",
    coordinates: { lat: -45.9031, lng: 170.3941 }
  },
  amenities: ["Shop", "Toilets", "Air Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Dee Street",
  location: {
    address: "206-214 Dee Street, Invercargill 9810",
    city: "Invercargill",
    region: "Southland",
    coordinates: { lat: -46.4131, lng: 168.3541 }
  },
  amenities: ["Shop", "Toilets", "Car Wash"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Andersons Bay",
  location: {
    address: "333 Andersons Bay Road, Dunedin 9013",
    city: "Dunedin",
    region: "Otago",
    coordinates: { lat: -45.8891, lng: 170.5201 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Caroline Bay",
  location: {
    address: "62 Theodosia Street, Timaru 7910",
    city: "Timaru",
    region: "Canterbury",
    coordinates: { lat: -44.3921, lng: 171.2541 }
  },
  amenities: ["Shop", "Toilets", "Car Wash", "EV Charging"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Rutherford",
  location: {
    address: "106 Rutherford Street, Nelson 7010",
    city: "Nelson",
    region: "Nelson",
    coordinates: { lat: -41.2731, lng: 173.2841 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Stoke",
  location: {
    address: "666 Main Road, Stoke, Nelson 7011",
    city: "Nelson",
    region: "Nelson",
    coordinates: { lat: -41.3121, lng: 173.2431 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Queenstown",
  location: {
    address: "846 Frankton Road, Queenstown 9300",
    city: "Queenstown",
    region: "Otago",
    coordinates: { lat: -45.0173, lng: 168.7161 }
  },
  amenities: ["Shop", "Toilets", "Car Wash", "EV Charging", "Air Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Greymouth",
  location: {
    address: "10 Whall Street, Greymouth 7805",
    city: "Greymouth",
    region: "West Coast",
    coordinates: { lat: -42.4495, lng: 171.2126 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "5:30am - 10pm",
    tuesday: "5:30am - 10pm",
    wednesday: "5:30am - 10pm",
    thursday: "5:30am - 10pm",
    friday: "5:30am - 10pm",
    saturday: "6am - 10pm",
    sunday: "6am - 10pm"
  }
},
{
  name: "Z Energy Springlands",
  location: {
    address: "165 Middle Renwick Road, Blenheim 7201",
    city: "Blenheim",
    region: "Marlborough",
    coordinates: { lat: -41.5096, lng: 173.9303 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "5am - 10pm",
    tuesday: "5am - 10pm",
    wednesday: "5am - 10pm",
    thursday: "5am - 10pm",
    friday: "5am - 10pm",
    saturday: "5am - 10pm",
    sunday: "5am - 10pm"
  }
},
{
  name: "Z Energy Oamaru",
  location: {
    address: "22 Severn Street, Oamaru 9400",
    city: "Oamaru",
    region: "Otago",
    coordinates: { lat: -45.0983, lng: 170.9681 }
  },
  amenities: ["Shop", "Toilets", "Car Wash"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Ashburton",
  location: {
    address: "141 West Street, Ashburton 7700",
    city: "Ashburton",
    region: "Canterbury",
    coordinates: { lat: -43.9049, lng: 171.7454 }
  },
  amenities: ["Shop", "Toilets", "EV Charging"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Dunedin Truck Stop",
  location: {
    address: "Corner Cumberland & Wolseley Street, Dunedin 9016",
    city: "Dunedin",
    region: "Otago",
    coordinates: { lat: -45.8841, lng: 170.5011 }
  },
  amenities: ["Truck Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Kaikorai Valley",
  location: {
    address: "248 Kaikorai Valley Road, Dunedin 9011",
    city: "Dunedin",
    region: "Otago",
    coordinates: { lat: -45.8726, lng: 170.4723 }
  },
  amenities: ["Shop", "Toilets", "Car Wash"],
  openingHours: {
    monday: "6am - 10pm",
    tuesday: "6am - 10pm",
    wednesday: "6am - 10pm",
    thursday: "6am - 10pm",
    friday: "6am - 10pm",
    saturday: "6am - 10pm",
    sunday: "6am - 10pm"
  }
},
{
  name: "Z Energy Balclutha",
  location: {
    address: "High Street, Balclutha 9230",
    city: "Balclutha",
    region: "Otago",
    coordinates: { lat: -46.2417, lng: 169.7315 }
  },
  amenities: ["Shop"],
  openingHours: {
    monday: "6am - 9pm",
    tuesday: "6am - 9pm",
    wednesday: "6am - 9pm",
    thursday: "6am - 9pm",
    friday: "6am - 9pm",
    saturday: "6am - 9pm",
    sunday: "6am - 9pm"
  }
},
{
  name: "Z Energy Cromwell",
  location: {
    address: "Corner Barry Avenue & Murray Terrace, Cromwell 9310",
    city: "Cromwell",
    region: "Otago",
    coordinates: { lat: -45.0365, lng: 169.1988 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "6am - 11pm",
    tuesday: "6am - 11pm",
    wednesday: "6am - 11pm",
    thursday: "6am - 11pm",
    friday: "6am - 11pm",
    saturday: "6am - 11pm",
    sunday: "6am - 11pm"
  }
},
{
  name: "Z Energy Gore",
  location: {
    address: "Corner Hokonui Drive & Irwell Street, Gore 9710",
    city: "Gore",
    region: "Southland",
    coordinates: { lat: -46.0974, lng: 168.9450 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "6am - 9pm",
    tuesday: "6am - 9pm",
    wednesday: "6am - 9pm",
    thursday: "6am - 9pm",
    friday: "6am - 9pm",
    saturday: "6am - 9pm",
    sunday: "6am - 9pm"
  }
},
{
  name: "Z Energy Greymouth Truck Stop",
  location: {
    address: "10 Whall Street, Greymouth 7805",
    city: "Greymouth",
    region: "West Coast",
    coordinates: { lat: -42.4495, lng: 171.2126 }
  },
  amenities: ["Truck Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Picton",
  location: {
    address: "101 High Street, Picton 7220",
    city: "Picton",
    region: "Marlborough",
    coordinates: { lat: -41.2921, lng: 174.0065 }
  },
  amenities: ["Shop", "Toilets", "EV Charging"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Kaikoura Truck Stop",
  location: {
    address: "55 Beach Road, Kaikoura 7300",
    city: "Kaikoura",
    region: "Canterbury",
    coordinates: { lat: -42.3908, lng: 173.6795 }
  },
  amenities: ["Truck Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Cromwell Truck Stop",
  location: {
    address: "McNaulty Road, Cromwell 9310",
    city: "Cromwell",
    region: "Otago",
    coordinates: { lat: -45.0476, lng: 169.1763 }
  },
  amenities: ["Truck Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Ashburton South Truck Stop",
  location: {
    address: "128 South Street, Ashburton 7700",
    city: "Ashburton",
    region: "Canterbury",
    coordinates: { lat: -43.9120, lng: 171.7464 }
  },
  amenities: ["Truck Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Gladstone",
  location: {
    address: "455 Dee Street, Invercargill 9810",
    city: "Invercargill",
    region: "Southland",
    coordinates: { lat: -46.3929, lng: 168.3476 }
  },
  amenities: ["Shop", "Toilets", "Car Wash"],
  openingHours: {
    monday: "6am - 9pm",
    tuesday: "6am - 9pm",
    wednesday: "6am - 9pm",
    thursday: "6am - 9pm",
    friday: "6am - 9pm",
    saturday: "6am - 9pm",
    sunday: "6am - 9pm"
  }
},
{
  name: "Z Energy Andy Bay",
  location: {
    address: "333 Andersons Bay Road, Dunedin 9013",
    city: "Dunedin",
    region: "Otago",
    coordinates: { lat: -45.8926, lng: 170.5032 }
  },
  amenities: ["Shop", "Toilets", "Car Wash"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Nelson Port Truck Stop",
  location: {
    address: "Corner Wildman Avenue & Hay Street, Nelson 7010",
    city: "Nelson",
    region: "Nelson",
    coordinates: { lat: -41.2645, lng: 173.2754 }
  },
  amenities: ["Truck Stop"],
  openingHours: {
    monday: "24 Hours",
    tuesday: "24 Hours",
    wednesday: "24 Hours",
    thursday: "24 Hours",
    friday: "24 Hours",
    saturday: "24 Hours",
    sunday: "24 Hours"
  }
},
{
  name: "Z Energy Alexandra",
  location: {
    address: "105 Tarbert Street, Alexandra 9320",
    city: "Alexandra",
    region: "Otago",
    coordinates: { lat: -45.2481, lng: 169.3731 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "6am - 9pm",
    tuesday: "6am - 9pm",
    wednesday: "6am - 9pm",
    thursday: "6am - 9pm",
    friday: "6am - 9pm",
    saturday: "6am - 9pm",
    sunday: "6am - 9pm"
  }
},
{
  name: "Z Energy Blenheim",
  location: {
    address: "Corner Grove Road & Nelson Street, Blenheim 7201",
    city: "Blenheim",
    region: "Marlborough",
    coordinates: { lat: -41.5181, lng: 173.9621 }
  },
  amenities: ["Shop", "Toilets"],
  openingHours: {
    monday: "6am - 10pm",
    tuesday: "6am - 10pm",
    wednesday: "6am - 10pm",
    thursday: "6am - 10pm",
    friday: "6am - 10pm",
    saturday: "7am - 9pm",
    sunday: "7am - 9pm"
  }
},
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const stationData of stations) {
      //UPSERT STATION (insert if new, update if exists)
      const result = await Station.updateOne(
        { name: stationData.name }, // match by station name
        { $set: stationData }, // update fields
        { upsert: true }, // insert if not found
      );

      // Fetch the station document (needed for _id)
      const station = await Station.findOne({ name: stationData.name });

      if (result.upsertedCount > 0) {
        console.log(`Inserted station: ${stationData.name}`);
      } else {
        console.log(`Updated station: ${stationData.name}`);
      }

      // REGION ADJUSTMENT
      const adj = regionAdjustment(station.location.region);

      // UPSERT FUEL PRICES (update if exists, insert if new)
      const fuelTypes = [
        { type: "Regular Unleaded (91)", range: PRICE_RANGES.regular },
        { type: "Premium Unleaded (95/98)", range: PRICE_RANGES.premium },
        { type: "Diesel", range: PRICE_RANGES.diesel },
      ];

      for (const fuel of fuelTypes) {
        await FuelPrice.updateOne(
          { station: station._id, fuelType: fuel.type },
          {
            $set: {
              pricePerLitre: randomPrice(...fuel.range, adj),
              lastUpdated: new Date(),
            },
          },
          { upsert: true }
        );
      }


    }

    process.exit();
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
