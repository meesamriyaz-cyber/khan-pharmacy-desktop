// config/corsOptions.js
const allowedOrigins = [
  // Local dev
  "http://localhost",
  "https://localhost",
  "http://localhost:5173",
  "https://localhost:5173",
  "http://localhost:5174",
  "https://localhost:5174",
  "http://localhost:5175",
  "https://localhost:5175",

  // Android emulator
  "http://10.0.2.2",
  "https://10.0.2.2",
  "http://10.0.2.2:5173",
  "https://10.0.2.2:5173",

  // LAN
  "http://192.168.29.162:5000",
  "https://192.168.29.162:5000",

  // Mobile / Capacitor
  "capacitor://localhost",
  "ionic://localhost",
  "file://",
  "null",

 
];

const corsOptions = {
  origin: (origin, callback) => {
    // log origin for debugging
    console.log("[CORS] origin:", origin);

    // allow null / mobile / Postman
    if (!origin || origin === "null") {
      return callback(null, true);
    }

    // exact-match allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Don't throw — allow but log unexpected origins (helps debugging)
    console.warn(
      "[CORS] Origin not in allowed list, allowing for now:",
      origin
    );
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

export default corsOptions;
