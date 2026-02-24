import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ Success: true, Message: "API is running", Object: null, Errors: null });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});