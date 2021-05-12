const { Client } = require('pg')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');

const dbConfig = {
  user: 'xgmxjqvssqyssm',
  host: 'ec2-52-0-114-209.compute-1.amazonaws.com',
  database: 'dfq7upgaj6k5qk',
  password: 'd6871c8cd148e7b8375529a0b26242fcaeb974cfc7393b4faee6d6be65568092',
  port: 5432,
  ssl: { rejectUnauthorized: false }
}

const createUser = async ({ userName, password }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  let token;
  try {
    token = cryptr.encrypt(`${userName}|${password}`);
    const res = await client.query(`Insert into accounts (username, password, token) values ('${userName}', '${password}', '${token}') `);
   
  } catch (err) {
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
    const res = await client.query(`select * from accounts where username = '${userName}' and password = '${password}'`);
    if (res.rows.length) {
      return { error, data: res.rows[0] }
    } else {
      return { error: 'user không tồn tại hoặc password không đúng', data: null }
    }

  } catch (err) {
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

module.exports = {
  createUser,
  getUser,
}