//this is the code where you left off after Tues lecture

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();


server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body;

  // generate hash from user's password
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n

  // override user.password with hash
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
  
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user) {
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
});
  

// server.post('/api/login', (req, res) => {
//   let { username, password } = req.body;

//   Users.findBy({ username })
//     .first()
//     .then(user => {
//       // check that passwords match
//       if (user && bcrypt.compareSync(password, user.password)) {
//         res
//           .status(200)
//           .json({ message: `Welcome ${user.username}!` });
//       } else {
//         res.status(401).json({ message: 'Invalid Credentials' });
//       }
//     })
//     .catch(error => {
//       res.status(500).json(error);
//     });
// });


function restricted(req, res, next) {
  const { username, password } = req.headers;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json({ message: 'Ran into an unexpected error' });
      });
  } else {
    res.status(400).json({ message: 'No credentials provided' });
  }
}

// axios.get(url, { headers: { username, password } });

// protect this route, only authenticated users should see it
server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/users', restricted, async (req, res) => {
  try {
    const users = await Users.find();

    res.json(users);
  } catch (error) {
    res.send(error);
  }
});

// server.get('/api/logout', (req, res) => {
//   if (req.session) {
//     req.session.destroy(err => {
//       if (err) {
//         res.send(
//           'you can checkout any time you like, but you can never leave....'
//         );
//       } else {
//         res.send('bye, thanks for playing');
//       }
//     });
//   } else {
//     res.end();
//   }
// });

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
