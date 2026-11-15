import { createHash } from 'node:crypto';
import { interpretar, montarUrl, plataformas, validarUsuario } from '../src/components/tools/lib/investigacao';
const windows = new Map<string, number[]>();
function limited(ip: string) {
  const key = createHash('sha256').update(`ru:${ip}`).digest('hex').slice(0, 16);
  const now = Date.now(); const recent = (windows.get(key) || []).filter(t => now - t < 60_000);
  if (windows.size > 5000) windows.clear();
  if (recent.length >= 6) { windows.set(key, recent); return true; }
  recent.push(now); windows.set(key, recent); return false;
}
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const usuario = String(req.body?.usuario || '').trim();
  if (!validarUsuario(usuario)) return res.status(400).json({ erro: 'Usuário inválido.' });
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'anon').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ erro: 'Limite de 6 varreduras por minuto atingido. Aguarde um instante.' });
  const lista = await Promise.all(plataformas.map(async (p) => {
    const perfil = montarUrl(p.perfil, usuario);
    try {
      const r = await fetch(montarUrl(p.api, usuario), { headers: { accept: 'application/json, text/html;q=0.8', 'user-agent': 'RastreadorLJ/1.0 (+https://www.lordjunnior.com.br/ferramentas)' }, redirect: 'manual', signal: AbortSignal.timeout(7000) });
      const status = r.status >= 300 && r.status < 400 ? 404 : r.status;
      const corpo = status === 200 ? (await r.text()).slice(0, 20000) : '';
      return { id: p.id, nome: p.nome, perfil, estado: interpretar(p.id, status, corpo) };
    } catch { return { id: p.id, nome: p.nome, perfil, estado: 'incerto' as const }; }
  }));
  return res.status(200).json({ lista });
}
