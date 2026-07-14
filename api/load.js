module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const response = await fetch(
      'https://api.github.com/repos/vitoriacarolinabuso/cloud-hiring-dashboard/contents/data.json',
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: 'Erro ao buscar dados do GitHub' });
    }

    const fileData = await response.json();
    const content = Buffer.from(fileData.content.replace(/\n/g, ''), 'base64').toString('utf-8');
    const data = JSON.parse(content);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Load error:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar dados' });
  }
};
