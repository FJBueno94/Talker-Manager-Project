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
  const { email, password } = req.body;

  const validateEmail = /\S+@\S+\.\S+/;

  if (!email) return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  if (validateEmail.test(email) === false) {
    return res.status(400).json({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }
  if (!password) return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  if (password.length <= 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
}

const validateToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ message: 'Token não encontrado' });
  if (authorization.length !== 16) return res.status(401).json({ message: 'Token inválido' });
  next();
};

const validateName = (req, res, next) => {
  const { name } = req.body;
  if (!name || name === '') {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
};

const validateAge = (req, res, next) => {
  const { age } = req.body;
  if (!age || age === '') {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  }
  if (age < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }
  next();
};

const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk || talk === '') {
    return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  }
  next();
};

const validateTalkDate = (req, res, next) => {
  const { talk } = req.body;
  const date = /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/;
  if (talk.watchedAt === '' || talk.watchedAt === undefined) {
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  }
  if (date.test(talk.watchedAt) === false) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  next();
};

const validateRate = (req, res, next) => {
  const { talk } = req.body;
  if (talk.rate === '' || talk.rate === undefined) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }
  if (talk.rate < 1 || talk.rate > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

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

app.post(
  '/talker',
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
},
);

app.listen(PORT, () => {
  console.log('Online');
});
