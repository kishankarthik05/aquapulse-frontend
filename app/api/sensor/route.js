let feedCommand = false;

let latestData = {
  temperature: 0,
  ph: 0,
  ammonia: 0,
  oxygen: 0
};

// ESP32 sends sensor values here
export async function POST(req) {
  const body = await req.json();

  // If request comes from ESP32 → store sensor values
  if (body.ph !== undefined) {
    latestData = body;
    console.log("Stored sensor data:", latestData);
  }

  // If request comes from website button → trigger feed
  if (body.feed === true) {
    console.log("Feed command received from website");
    feedCommand = true;
  }

  return Response.json({ status: "ok" });
}

// Website & ESP32 read data here
export async function GET() {
  const response = {
    ...latestData,
    feed: feedCommand
  };

  // Reset command after ESP32 reads it once
  feedCommand = false;

  return Response.json(response);
}