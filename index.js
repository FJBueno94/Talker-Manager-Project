const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');
const {
  validateLogin,
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateTalkDate,
  validateRate,
} = require('./middlewares/validation');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const data = './talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker/search', validateToken, async (req, res) => {
  const { q } = req.query;
  const talkers = await fs.readFile(data, 'utf8');
  const talkersArray = JSON.parse(talkers);
  const talkerSearch = talkersArray.filter((t) => t.name.includes(q));
  if (!q) return res.status(200).json(talkers);
  return res.status(200).json(talkerSearch);
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

app.post('/talker',
  validateToken,
   validateName,
   validateAge,
   validateTalk,
   validateTalkDate,
   validateRate,
   async (req, res) => {
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  const talkers = await fs.readFile(data, 'utf8');
  const talkersArray = JSON.parse(talkers);
  const newTalker = {
    id: talkersArray.length + 1,
    name,
    age,
    talk: {
      watchedAt,
      rate,
    },
  };
  talkersArray.push(newTalker);
  await fs.writeFile(data, JSON.stringify(talkersArray));
  return res.status(201).json(newTalker);
});

app.put('/talker/:id',
  validateToken,
  validateName,
  validateAge,
  validateTalk,
  validateTalkDate,
  validateRate,
  async (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  const talkers = await fs.readFile(data, 'utf8');
  const talkersArray = JSON.parse(talkers);
  const talker = talkersArray.findIndex((t) => t.id === Number(id));
  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  talkersArray[talker] = { ...talkersArray[talker], name, age, talk: { watchedAt, rate } };
  await fs.writeFile(data, JSON.stringify(talkersArray));
  return res.status(200).json(talkersArray[talker]);
});

app.delete('/talker/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const talkers = await fs.readFile(data, 'utf8');
  const talkersArray = JSON.parse(talkers);
  const talker = talkersArray.findIndex((t) => t.id === Number(id));
  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  talkersArray.splice(talker, 1);
  await fs.writeFile(data, JSON.stringify(talkersArray));
  return res.status(204).json({ message: 'Pessoa palestrante removida' });
});

app.listen(PORT, () => {
  console.log('Online');
});
