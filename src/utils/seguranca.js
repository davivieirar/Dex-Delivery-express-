import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export async function hashSenha(senha) {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

export async function confereSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

export function gerarToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES || '2h';
  return jwt.sign(payload, secret, { expiresIn });
}

export function authMiddleware(tipoEsperado) {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ erro: 'Token ausente' });

      const user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

      if (tipoEsperado && user.tipo !== tipoEsperado) {
        return res.status(403).json({ erro: 'Sem permissão' });
      }

      req.user = user;
      next();
    } catch (e) {
      return res.status(401).json({ erro: 'Token inválido' });
    }
  };
}
