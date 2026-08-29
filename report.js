const db = require('./db')

const getSummaryReport = async (req, res) => {
  const { error, data } = await db.getSummaryReport();
  if (error) {
    return res.status(500).send({ error: 'Internal Server Error' });
  }
  res.send({ data });
}

const getUserGameLogs = async (req, res) => {
  const { userId } = req.params;
  const days = parseInt(req.query.days) || 365;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  if (!userId) {
    return res.status(400).send({ error: 'UserId is required' });
  }

  const { error, data } = await db.getUserGameLogs({ userId, days, limit, offset });
  if (error) {
    return res.status(500).send({ error: 'Internal Server Error' });
  }
  res.send({ data, page, limit });
}

const getPokerLog = async (req, res) => {
  const { pokerLogId } = req.params;

  if (!pokerLogId || Number.isNaN(+pokerLogId)) {
    return res.status(400).send({ error: 'PokerLogId is required' });
  }

  const { error, data } = await db.getPokerLogById({ pokerLogId });
  if (error) {
    return res.status(500).send({ error: 'Internal Server Error' });
  }
  if (!data) {
    return res.status(404).send({ error: 'Poker log not found' });
  }
  if (!data.is_available) {
    return res.status(403).send({
      error: 'Poker log is not available yet',
      code: 'POKER_LOG_NOT_AVAILABLE_YET',
      data: {
        created_at: data.created_at,
        available_at: data.available_at,
      },
    });
  }
  res.send({ data });
}

module.exports = {
  getSummaryReport,
  getUserGameLogs,
  getPokerLog,
}
