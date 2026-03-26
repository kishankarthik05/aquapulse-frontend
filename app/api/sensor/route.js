// This acts as our temporary database in memory
let sensorState = {
  ph: 0,
  temperature: 0,
  tds: 0,
  turbidity: 0,

  lastFeedTriggerTime: 0, // manual feed window

  // 🐟 NEW FEATURES
  fishCount: 1,
  feedTime: "" // format "HH:MM"
};

// 1. RECEIVE DATA (From ESP32 or Website Button)
export async function POST(req) {
  try {
    const body = await req.json();

    // ---------------- SENSOR DATA ----------------
    if (
      body.ph !== undefined ||
      body.temperature !== undefined ||
      body.tds !== undefined ||
      body.turbidity !== undefined
    ) {
      if (body.ph !== undefined) sensorState.ph = body.ph;
      if (body.temperature !== undefined) sensorState.temperature = body.temperature;
      if (body.tds !== undefined) sensorState.tds = body.tds;
      if (body.turbidity !== undefined) sensorState.turbidity = body.turbidity;

      console.log(
        `[ESP32 UPDATE] pH: ${sensorState.ph.toFixed(2)} | Temp: ${sensorState.temperature.toFixed(2)}°C | TDS: ${sensorState.tds.toFixed(2)} ppm | Turbidity: ${sensorState.turbidity.toFixed(2)}`
      );
    }

    // ---------------- MANUAL FEED ----------------
    if (body.feed === true) {
      sensorState.lastFeedTriggerTime = Date.now();
      console.log("!!! [DATABASE] Manual Feed Triggered !!!");
    }

    // ---------------- SAVE SETTINGS ----------------
    if (body.fishCount !== undefined) {
      sensorState.fishCount = body.fishCount;
      console.log("Fish Count Set:", sensorState.fishCount);
    }

    if (body.feedTime !== undefined) {
      sensorState.feedTime = body.feedTime;
      console.log("Feed Time Set:", sensorState.feedTime);
    }

    return Response.json({ status: "success" });

  } catch (error) {
    console.error("POST Error:", error);
    return Response.json({ status: "error" }, { status: 400 });
  }
}

// 2. SEND DATA (To Website Dashboard or ESP32)
export async function GET() {
  const now = Date.now();

  // ---------------- MANUAL FEED WINDOW ----------------
  const manualFeedActive = (now - sensorState.lastFeedTriggerTime) < 10000;

  // ---------------- AUTO FEED LOGIC ----------------
  const currentTime = new Date().toTimeString().slice(0, 5);

  let autoFeedActive = false;

  if (sensorState.feedTime === currentTime) {
    autoFeedActive = true;
    sensorState.lastFeedTriggerTime = Date.now(); // trigger feed
    console.log("⏰ AUTO FEED TRIGGERED");
  }

  // ---------------- FINAL FEED STATE ----------------
  const isCurrentlyFeeding = manualFeedActive || autoFeedActive;

  const responseData = {
    ph: sensorState.ph,
    temperature: sensorState.temperature,
    tds: sensorState.tds,
    turbidity: sensorState.turbidity,

    feed: isCurrentlyFeeding,

    // 🐟 SEND TO ESP32
    fishCount: sensorState.fishCount
  };

  if (isCurrentlyFeeding) {
    console.log(">>> [SERVER] Sending Feed Command: TRUE");
  }

  return Response.json(responseData);
}