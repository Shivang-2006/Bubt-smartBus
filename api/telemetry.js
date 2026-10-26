// Vercel Serverless Function: Real-Time Bus Telemetry Relay
// In-memory telemetry cache for active campus shuttle fleet
let telemetryStore = {
    'bus_101': {
        busId: 'bus_101',
        busNumber: 'UP-14-BT-101',
        routeId: 'route_1',
        lat: 28.6788,
        lng: 77.3828,
        speed: 32,
        speedKmh: 32,
        heading: 45,
        isLive: false,
        timestamp: Date.now()
    }
};

module.exports = function handler(req, res) {
    // Enable CORS for cross-origin or local requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            let body = req.body;
            if (typeof body === 'string') {
                body = JSON.parse(body);
            }

            if (body && body.lat != null && body.lng != null) {
                const busId = body.busId || 'bus_101';
                telemetryStore[busId] = {
                    busId: busId,
                    busNumber: body.busNumber || 'UP-14-BT-101',
                    routeId: body.routeId || 'route_1',
                    lat: parseFloat(body.lat),
                    lng: parseFloat(body.lng),
                    speed: body.speed != null ? parseFloat(body.speed) : 0,
                    speedKmh: body.speedKmh != null ? parseFloat(body.speedKmh) : (body.speed ? Math.round(body.speed * 3.6) : 30),
                    heading: body.heading != null ? parseFloat(body.heading) : 0,
                    isLive: body.isLive !== false,
                    timestamp: body.timestamp || Date.now()
                };

                return res.status(200).json({
                    success: true,
                    telemetry: telemetryStore[busId]
                });
            } else {
                return res.status(400).json({ success: false, error: 'Missing coordinates' });
            }
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    // GET: Retrieve latest telemetry for a bus
    const busId = (req.query && req.query.busId) ? req.query.busId : 'bus_101';
    const data = telemetryStore[busId] || telemetryStore['bus_101'];
    return res.status(200).json({
        success: true,
        telemetry: data
    });
};
