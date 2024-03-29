const { Client } = require('pg')
const bcrypt = require('bcrypt');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');
const saltRounds = 10;

const dbConfig = {
  user: 'tgnaicjf',
  host: 'rain.db.elephantsql.com',
  database: 'tgnaicjf',
  password: 'CSYAGLbG4J1n4omGRJg9-dVmTGFHaR0m',
  port: 5432,
  ssl: { rejectUnauthorized: false }
}

const createUser = async ({ userName, password }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  let token;
  try {
    token = cryptr.encrypt(userName);
    let hashPw = bcrypt.hashSync(password, saltRounds);
    const res = await client.query("Insert into accounts (username, password, token) values ($1, $2, $3)", [userName, hashPw, token]);
  } catch (err) {
    console.log(err)
    error = err;
  } finally {
    await client.end();
  }
  return { error, token };
}

const getUser = async ({ userName, password }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    const res = await client.query("select * from accounts where username = $1", [userName]);
    if (res.rows.length) {
      if (bcrypt.compareSync(password, res.rows[0].password)) {
        return {
          error,
          data: {
            userName: res.rows[0].username,
            token: res.rows[0].token
          }
        }
      } else {
        return { error: 'Password sai rồi' }
      }

    } else {
      return { error: 'user không tồn tại', data: null }
    }

  } catch (err) {
    console.log(err)
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

const getInfoAccount = async ({ userName }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    const res = await client.query("select * from accounts where username = $1", [userName]);
    if (res.rows.length) {
        return {
          error,
          data: {
            userName: res.rows[0].username,
            balance: +res.rows[0].balance || 0,
          }
        }
    } else {
      return { error: 'user không tồn tại', data: null }
    }

  } catch (err) {
    console.log(err)
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

const updateBalance = async ({userName, balance}) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    const res = await client.query("update accounts set balance = $1 where username = $2", [balance, userName]);
  } catch (err) {
    console.log(err)
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

module.exports = {
  createUser,
  getUser,
  getInfoAccount,
  updateBalance,
}