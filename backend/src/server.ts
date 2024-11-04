import express from 'express';
import cors from 'cors';
import blogRoutes from './routes/blogRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import connectDB from './config/data';

const app = express();

app.use(express.json());
app.use(cors());
connectDB();
// Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', authRoutes);
app.use('/api', userRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});