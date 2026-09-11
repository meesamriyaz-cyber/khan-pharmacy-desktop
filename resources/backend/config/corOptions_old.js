const allowedOrigins = [
  // Localhost (frontend dev)
  'https://localhost:5173',
  'http://localhost:5173',
  'http://10.0.2.2:5173',
  'https://10.0.2.2:5173',
  'http://localhost:5174',
  'https://localhost:5174',
  'http://localhost:5175',
  'https://localhost:5175',

  // Laptop IP (HTTP + HTTPS)
  'http://192.168.29.162:5000',
  'https://192.168.29.162:5000',
  'http://192.168.29.162:5173',
  'https://192.168.29.162:5173',

  // Mobile / Webview / Capacitor
  'capacitor://localhost',
  'ionic://localhost',
  'https://localhost',
  'http://localhost',
  'file://',
  'null'
];

const shouldTraceCors = () => process.env.LOG_MOBILE_TRAFFIC === 'true';

const corsOptions = {
  origin: function (origin, callback) {
    // Android apps often come with ORIGIN = null
    if (!origin) {
      if (shouldTraceCors()) {
        console.info('[mobile-debug][cors] Allowing null origin (native webview / Postman).');
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      if (shouldTraceCors()) {
        console.info(`[mobile-debug][cors] Allow ${origin}`);
      }
      return callback(null, true);
    }

    if (shouldTraceCors()) {
      console.warn(`[mobile-debug][cors] Blocking origin ${origin}`);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};

export default corsOptions;
