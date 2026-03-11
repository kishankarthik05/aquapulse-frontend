// This acts as our temporary database in memory
let sensorState = {
  ph: 0,
  temperature: 0,
  ammonia: 0,
  oxygen: 0,
  lastFeedTriggerTime: 0 // Using timestamp for the 10-second window
};

// 1. RECEIVE DATA (From ESP32 or Website Button)
export async function POST(req) {
  try {
    const body = await req.json();

    // CASE A: Update sensor values from ESP32
    // The ESP32 now sends both "ph" and "temperature"
    if (body.ph !== undefined || body.temperature !== undefined) {
      if (body.ph !== undefined) sensorState.ph = body.ph;
      if (body.temperature !== undefined) sensorState.temperature = body.temperature;
      
      // Keep support for other metrics if you add them later
      if (body.ammonia !== undefined) sensorState.ammonia = body.ammonia;
      if (body.oxygen !== undefined) sensorState.oxygen = body.oxygen;
      
      console.log(`[ESP32 UPDATE] pH: ${sensorState.ph} | Temp: ${sensorState.temperature}°C`);
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
  
  // Logic: Is the current time within 10 seconds of the last button press?
  // This gives the ESP32 a wide window to catch the 'true' signal
  const isCurrentlyFeeding = (now - sensorState.lastFeedTriggerTime) < 10000;

  const responseData = {
    ph: sensorState.ph,
    temperature: sensorState.temperature,
    ammonia: sensorState.ammonia,
    oxygen: sensorState.oxygen,
    feed: isCurrentlyFeeding
  };

  // Log only when feeding is active to keep the console clean
  if (isCurrentlyFeeding) {
    console.log(">>> [SERVER] Sending Feed Command: TRUE");
  }

  return Response.json(responseData);
}