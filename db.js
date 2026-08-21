const { Client } = require('pg')
const bcrypt = require('bcrypt');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');
const saltRounds = 10;

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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

const logTransaction = async ({ userId, amount, type, balanceAfter }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    await client.query("INSERT INTO transaction_log (user_id, amount, type, balance_after) VALUES ($1, $2, $3, $4)", [userId, amount, type, balanceAfter]);
  } catch (err) {
    console.log('logTransaction error:', err)
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

const logGame = async ({ userId, amount, type, balanceAfter, pokerLogId }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    await client.query("INSERT INTO game_log (user_id, amount, type, balance_after, poker_log_id) VALUES ($1, $2, $3, $4, $5)", [userId, amount, type, balanceAfter, pokerLogId || null]);
  } catch (err) {
    console.log('logGame error:', err)
    error = err;
  } finally {
    await client.end();
  }
  return { error };
}

const logPoker = async ({ data }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  let insertedId = null;
  try {
    const res = await client.query("INSERT INTO poker_log (data) VALUES ($1) RETURNING id", [JSON.stringify(data)]);
    insertedId = res.rows[0]?.id || null;
  } catch (err) {
    console.log('logPoker error:', err)
    error = err;
  } finally {
    await client.end();
  }
  return { error, data: insertedId };
}
const getSummaryReport = async () => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  let data = [];
  try {
    const query = `
      WITH user_ref AS (
          SELECT user_id, MAX(created_at) as ref_time
          FROM transaction_log
          WHERE balance_after = 0
          GROUP BY user_id
      ),
      trans_agg AS (
          SELECT 
              t.user_id,
              SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as total_deposit,
              SUM(CASE WHEN t.type = 'withdraw' THEN t.amount ELSE 0 END) as total_withdraw
          FROM transaction_log t
          LEFT JOIN user_ref r ON t.user_id = r.user_id
          WHERE t.created_at > COALESCE(r.ref_time, '1970-01-01')
          GROUP BY t.user_id
      ),
      game_agg AS (
          SELECT 
              g.user_id,
              COUNT(*) as total_game
          FROM game_log g
          LEFT JOIN user_ref r ON g.user_id = r.user_id
          WHERE g.created_at > COALESCE(r.ref_time, '1970-01-01')
          GROUP BY g.user_id
      )
      SELECT 
          a.username as "username",
          COALESCE(t.total_deposit, 0) as "totalDeposit",
          COALESCE(t.total_withdraw, 0) as "totalWithdraw",
          COALESCE(a.balance, 0) as "currentBalance",
          COALESCE(g.total_game, 0) as "totalGame"
      FROM accounts a
      LEFT JOIN trans_agg t ON a.username = t.user_id
      INNER JOIN game_agg g ON a.username = g.user_id
      ORDER BY a.username ASC
    `;
    const res = await client.query(query);
    data = res.rows;
  } catch (err) {
    console.log('getSummaryReport error:', err)
    error = err;
  } finally {
    await client.end();
  }
  return { error, data };
}

const getUserGameLogs = async ({ userId, days, limit, offset }) => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  let data = [];
  try {
    let interval = '1 year';
    if (days === 7) interval = '7 days';
    if (days === 30) interval = '30 days';
    
    const query = `
      SELECT id, amount, type, balance_after, poker_log_id, created_at
      FROM game_log
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const res = await client.query(query, [userId, limit, offset]);
    data = res.rows;
  } catch (err) {
    console.log('getUserGameLogs error:', err)
    error = err;
  } finally {
    await client.end();
  }
  return { error, data };
}

const resetBalanceAllPlayers = async () => {
  const client = new Client(dbConfig)
  await client.connect();
  let error = null;
  try {
    const query = `
      WITH updated AS (
        UPDATE accounts
        SET balance = 0
        RETURNING username, balance as old_balance
      )
      INSERT INTO transaction_log (user_id, amount, type, balance_after)
      SELECT username, old_balance, 'withdraw', 0
      FROM updated;
    `;
    await client.query(query);
  } catch (err) {
    console.log('resetBalanceAllPlayers error:', err)
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
  logTransaction,
  logGame,
  logPoker,
  getSummaryReport,
  getUserGameLogs,
  resetBalanceAllPlayers,
}
