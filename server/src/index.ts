import express from "express";
import cors from "cors";
import articleRoutes from "./routes/articles.js";
import noteRoutes from "./routes/notes.js";
import tagRoutes from "./routes/tags.js";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/tags', tagRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
