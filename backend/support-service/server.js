const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.status(200).send('ok'));

app.post('/assign', (req, res) => {
  console.log('Ticket assigned:', req.body);
  res.json({ message: 'Assigned' });
});

app.post('/respond', (req, res) => {
  console.log('Response added:', req.body);
  res.json({ message: 'Response saved' });
});

const PORT = Number(process.env.PORT) || 5002;
app.listen(PORT, () => console.log(`Support Service running on ${PORT}`));