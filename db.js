const { Client } = require('pg')
const encryptor = require('simple-encryptor')('manhhuy-v-poker-keyS');

const dbConfig = {
  user: 'kbwmtdtmwnkiir',
  host: 'ec2-52-44-31-100.compute-1.amazonaws.com',
  database: 'd9it6fpimg5jsn',
  password: '5d4ed41fd046618025585009e903c38461e336c2412ccde5bc2f25cff9b4c2bd',
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