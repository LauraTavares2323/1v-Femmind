const pool = require('../../db');

// Obter todos os posts
exports.getAllPosts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at,
          u.id AS user_id, u.username, u.profile_picture_url,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar posts.' });
  }
};

// Criar um novo post
exports.createPost = async (req, res) => {
  const { title, content, image_url } = req.body;
  const userId = req.user.id; // Vem do middleware de autenticação (que vamos criar)

  if (!title || !content || !userId) {
    return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, title, content, image_url) VALUES (?, ?, ?, ?)',
      [userId, title, content, image_url || null]
    );
    res.status(201).json({ message: 'Post criado com sucesso!', postId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar post.' });
  }
};

// Obter um único post por ID
exports.getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT
          p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at,
          u.id AS user_id, u.username, u.profile_picture_url,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar post por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar post.' });
  }
};

exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // ID do usuário autenticado

  try {
    // Verifica se o usuário já curtiu este post
    const [existingLike] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existingLike.length > 0) {
      // Se já curtiu, descurte (remove o like)
      await pool.query('DELETE FROM likes WHERE id = ?', [existingLike[0].id]);
      res.status(200).json({ message: 'Like removido com sucesso.', liked: false });
    } else {
      // Se não curtiu, curte (adiciona o like)
      await pool.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      res.status(201).json({ message: 'Post curtido com sucesso.', liked: true });
    }
  } catch (error) {
    console.error('Erro ao curtir/descurtir post:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao curtir/descurtir post.' });
  }
};

// Função para favoritar/desfavoritar um post
exports.toggleFavorite = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // ID do usuário autenticado

  try {
    // Verifica se o usuário já favoritou este post
    const [existingFavorite] = await pool.query(
      'SELECT id FROM favorites WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existingFavorite.length > 0) {
      // Se já favoritou, desfavorita (remove o favorito)
      await pool.query('DELETE FROM favorites WHERE id = ?', [existingFavorite[0].id]);
      res.status(200).json({ message: 'Favorito removido com sucesso.', favorited: false });
    } else {
      // Se não favoritou, favorita (adiciona o favorito)
      await pool.query('INSERT INTO favorites (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      res.status(201).json({ message: 'Post adicionado aos favoritos.', favorited: true });
    }
  } catch (error) {
    console.error('Erro ao favoritar/desfavoritar post:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao favoritar/desfavoritar post.' });
  }
};

// Função para buscar posts (com ou sem termo de pesquisa)
exports.searchPosts = async (req, res) => {
  const { q } = req.query; // Termo de pesquisa da URL (ex: ?q=termo)
  let query = `
    SELECT
        p.id, p.title, p.content, p.image_url, p.created_at, p.updated_at,
        u.id AS user_id, u.username, u.profile_picture_url,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
  `;
  let params = [];

  if (q) {
    // Adiciona condição de busca pelo título ou conteúdo
    query += ` WHERE p.title LIKE ? OR p.content LIKE ?`;
    params.push(`%${q}%`, `%${q}%`);
  }

  query += ` ORDER BY p.created_at DESC`;

  try {
    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar/pesquisar posts:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar/pesquisar posts.' });
  }
};