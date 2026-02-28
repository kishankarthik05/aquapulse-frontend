let latestData = {
  temperature: 0,
  ph: 0,
  ammonia: 0,
  oxygen: 0
};

export async function POST(req) {
  const body = await req.json();
  latestData = body;

  console.log("Stored sensor data:", latestData);

  return Response.json({ status: "stored" });
}

export async function GET() {
  return Response.json(latestData);
}