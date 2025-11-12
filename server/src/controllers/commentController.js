const pool = require('../../db');

// Obter comentários de um post específico
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT
          c.id, c.content, c.created_at,
          u.id AS user_id, u.username, u.profile_picture_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar comentários.' });
  }
};

// Criar um novo comentário em um post
exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id; // ID do usuário autenticado

  if (!content) {
    return res.status(400).json({ message: 'O conteúdo do comentário não pode ser vazio.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );
    res.status(201).json({ message: 'Comentário adicionado com sucesso!', commentId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar comentário.' });
  }
};