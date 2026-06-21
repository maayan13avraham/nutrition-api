const { SupportMessage } = require('../../models');

async function getChatHistory(req, res) {
  const targetId = parseInt(req.params.userId, 10);
  const { userId, userRole } = req.user;

  if (userId !== targetId && userRole === 'user')
    return res.status(403).json({ success: false, data: null,
      error: { code: 'FORBIDDEN', message: 'Access denied' } });

  try {
    const rows = await SupportMessage.findAll({
      where: { userId: targetId },
      order: [['createdAt', 'ASC']],
    });
    return res.status(200).json({
      success: true,
      data: rows.map((r) => r.get({ plain: true })),
      error: null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, data: null,
      error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
}

module.exports = { getChatHistory };
