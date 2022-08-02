const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const data = './talker.json';

function validateLogin(req, res, next) {
  const { password, email } = req.body;

  const validateEmail = /\S+@\S+\.\S+/;

  if (password.length < 4 || password.length > 8) {
    return res.status(400).json({ message: 'Invalid password!' });
  } 
  if (validateEmail.test(email) === false) {
    return res.status(400).json({ message: 'Invalid email!' });
  } 
  next();
}

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
  const talkers = await fs.readFile(data, 'utf8');
  if (talkers === '') return res.status(200).json([]);
  return res.status(200).json(JSON.parse(talkers));
});

app.get('/talker/:id', async (req, res) => {
  const talkers = await fs.readFile(data, 'utf8');
  const { id } = req.params;
  const talker = JSON.parse(talkers).find((t) => t.id === Number(id));
  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  return res.status(200).json(talker);
});

app.post('/login', validateLogin, (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  res.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log('Online');
});
