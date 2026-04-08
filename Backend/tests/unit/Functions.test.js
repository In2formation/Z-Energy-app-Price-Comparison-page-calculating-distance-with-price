import { jest } from '@jest/globals';

//Haversine formula calculates distance between two coordinates on Earth's surface
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

//Extracts fuel type from user message by checking for keywords
function normalizeFuelTypeFromMessage(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("diesel")) return "Diesel";
  if (text.includes("95") || text.includes("98") || text.includes("premium")) {
    return "Premium Unleaded (95/98)";
  }
  if (text.includes("91") || text.includes("unleaded") || text.includes("regular")) {
    return "Regular Unleaded (91)";
  }

  return null;
}

describe("Helper Functions - Distance Calculations", () => {
  //Verifies distance calculation between two major NZ cities
  test("1. calculates distance between Wellington and Auckland accurately", () => {
    const wellingtonLat = -41.2865;
    const wellingtonLng = 174.7762;
    const aucklandLat = -36.8485;
    const aucklandLng = 174.7633;

    const distance = haversineDistanceKm(wellingtonLat, wellingtonLng, aucklandLat, aucklandLng);

    //Known distance is approximately 493km
    expect(distance).toBeGreaterThan(490);
    expect(distance).toBeLessThan(500);
  });

  //Ensures same location returns zero distance
  test("2. returns exactly 0 for identical coordinates", () => {
    const lat = -41.2865;
    const lng = 174.7762;

    const distance = haversineDistanceKm(lat, lng, lat, lng);

    expect(distance).toBe(0);
  });

  //Confirms distance from A to B equals distance from B to A
  test("3. distance calculation is symmetric", () => {
    const lat1 = -41.2865;
    const lng1 = 174.7762;
    const lat2 = -36.8485;
    const lng2 = 174.7633;

    const distanceAtoB = haversineDistanceKm(lat1, lng1, lat2, lng2);
    const distanceBtoA = haversineDistanceKm(lat2, lng2, lat1, lng1);

    expect(distanceAtoB).toBeCloseTo(distanceBtoA, 10);
  });

  //Tests accuracy for very short distances
  test("4. handles small distances with precision", () => {
    const lat1 = -41.2865;
    const lng1 = 174.7762;
    const lat2 = -41.2875; //~100m away
    const lng2 = 174.7772;

    const distance = haversineDistanceKm(lat1, lng1, lat2, lng2);

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1);
  });

  //Tests accuracy for maximum NZ distances
  test("5. handles extreme distances correctly", () => {
    //Northernmost to southernmost NZ points
    const northLat = -34.4;
    const northLng = 173.0;
    const southLat = -47.3;
    const southLng = 167.5;

    const distance = haversineDistanceKm(northLat, northLng, southLat, southLng);

    //NZ is roughly 1600km long
    expect(distance).toBeGreaterThan(1400);
    expect(distance).toBeLessThan(1800);
  });

  //Ensures distance is always positive regardless of input order
  test("6. returns positive distance regardless of coordinate order", () => {
    const distances = [
      haversineDistanceKm(-41, 174, -36, 175),
      haversineDistanceKm(-36, 175, -41, 174),
      haversineDistanceKm(41, -174, 36, -175),
    ];

    distances.forEach(d => {
      expect(d).toBeGreaterThan(0);
      expect(Number.isFinite(d)).toBe(true);
    });
  });
});

describe("Helper Functions - Fuel Type Normalization", () => {
  //Tests diesel recognition with case-insensitive matching
  test("7. recognizes diesel with various spellings", () => {
    expect(normalizeFuelTypeFromMessage("I need diesel")).toBe("Diesel");
    expect(normalizeFuelTypeFromMessage("DIESEL please")).toBe("Diesel");
    expect(normalizeFuelTypeFromMessage("DiEsEl")).toBe("Diesel");
    expect(normalizeFuelTypeFromMessage("Where can I get diesel?")).toBe("Diesel");
  });

  //Tests premium fuel recognition using multiple keywords
  test("8. recognizes premium fuel with multiple indicators", () => {
    expect(normalizeFuelTypeFromMessage("premium fuel")).toBe("Premium Unleaded (95/98)");
    expect(normalizeFuelTypeFromMessage("I want 95")).toBe("Premium Unleaded (95/98)");
    expect(normalizeFuelTypeFromMessage("98 octane")).toBe("Premium Unleaded (95/98)");
    expect(normalizeFuelTypeFromMessage("PREMIUM")).toBe("Premium Unleaded (95/98)");
  });

  //Tests regular unleaded recognition with various terms
  test("9. recognizes regular unleaded with various terms", () => {
    expect(normalizeFuelTypeFromMessage("regular unleaded")).toBe("Regular Unleaded (91)");
    expect(normalizeFuelTypeFromMessage("91 octane")).toBe("Regular Unleaded (91)");
    expect(normalizeFuelTypeFromMessage("just regular")).toBe("Regular Unleaded (91)");
    expect(normalizeFuelTypeFromMessage("unleaded")).toBe("Regular Unleaded (91)");
  });

  //Ensures null is returned for unsupported fuel types
  test("10. returns null for unrecognized fuel types", () => {
    expect(normalizeFuelTypeFromMessage("electric")).toBeNull();
    expect(normalizeFuelTypeFromMessage("hydrogen")).toBeNull();
    expect(normalizeFuelTypeFromMessage("")).toBeNull();
    expect(normalizeFuelTypeFromMessage("random text")).toBeNull();
  });

  //Tests graceful handling of null/undefined inputs
  test("11. handles null and undefined input safely", () => {
    expect(normalizeFuelTypeFromMessage(null)).toBeNull();
    expect(normalizeFuelTypeFromMessage(undefined)).toBeNull();
  });

  //Tests type coercion for non-string inputs
  test("12. handles non-string input by converting to string", () => {
    expect(normalizeFuelTypeFromMessage(123)).toBeNull();
    expect(normalizeFuelTypeFromMessage(true)).toBeNull();
    expect(normalizeFuelTypeFromMessage({})).toBeNull();
  });
});
