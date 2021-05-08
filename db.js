const { Client } = require('pg')
const encryptor = require('simple-encryptor')('manhhuy-v-poker-keyS');

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
  try {
    const token = encryptor.encrypt(`${userName}|${password}`);
    const res = await client.query(`Insert into accounts (username, password, token) values ('${userName}', '${password}', '${token}') `);

  } catch (err) {
    error = err;
  } finally {
    await client.end();
  }
  return { error };
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
      return { error: 'user không tồn tại', data: null }
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