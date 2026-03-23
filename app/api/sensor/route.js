// This acts as our temporary database in memory
let sensorState = {
  ph: 0,
  temperature: 0,
  tds: 0,
  turbidity: 0,
  lastFeedTriggerTime: 0 // 10-second feed window
};

// 1. RECEIVE DATA (From ESP32 or Website Button)
export async function POST(req) {
  try {
    const body = await req.json();

    // CASE A: Update sensor values from ESP32
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

    // CASE B: Trigger from Website Button
    if (body.feed === true) {
      sensorState.lastFeedTriggerTime = Date.now();
      console.log("!!! [DATABASE] Feed Command Activated for 10 seconds !!!");
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

  // Check if feed is active (10 sec window)
  const isCurrentlyFeeding = (now - sensorState.lastFeedTriggerTime) < 10000;

  const responseData = {
    ph: sensorState.ph,
    temperature: sensorState.temperature,
    tds: sensorState.tds,
    turbidity: sensorState.turbidity,
    feed: isCurrentlyFeeding
  };

  if (isCurrentlyFeeding) {
    console.log(">>> [SERVER] Sending Feed Command: TRUE");
  }

  return Response.json(responseData);
}