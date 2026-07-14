module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password, data } = req.body || {};

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  if (!data || !data.vagas) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    const REPO = 'vitoriacarolinabuso/cloud-hiring-dashboard';
    const FILE = 'data.json';
    const GITHUB_PAT = process.env.GITHUB_PAT;

    // Buscar SHA atual
    const shaResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    let sha = null;
    if (shaResponse.ok) {
      const shaData = await shaResponse.json();
      sha = shaData.sha;
    }

    // Atualizar lastUpdated
    const updatedData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };

    const content = Buffer.from(JSON.stringify(updatedData, null, 2)).toString('base64');

    const updateBody = {
      message: `Dashboard update — ${new Date().toLocaleDateString('pt-BR')} via TA team`,
      content
    };
    if (sha) updateBody.sha = sha;

    const updateResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateBody)
      }
    );

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      console.error('GitHub error:', err);
      return res.status(500).json({ error: 'Erro ao salvar no GitHub: ' + (err.message || '') });
    }

    return res.status(200).json({
      success: true,
      lastUpdated: updatedData.lastUpdated
    });

  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar' });
  }
};
