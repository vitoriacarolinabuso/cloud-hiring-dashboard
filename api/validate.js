module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};

  if (password && password === process.env.DASHBOARD_PASSWORD) {
    return res.status(200).json({ valid: true });
  }

  return res.status(401).json({ valid: false });
};
