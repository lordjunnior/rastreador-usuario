// Lógica pura das ferramentas de Investigação Digital (sem DOM, testável).

export type Plataforma = { id: string; nome: string; api: string; perfil: string };
// Somente APIs públicas que respondem 404 de verdade quando o usuário não existe.
export const plataformas: Plataforma[] = [
  { id: 'github', nome: 'GitHub', api: 'https://api.github.com/users/{u}', perfil: 'https://github.com/{u}' },
  { id: 'gitlab', nome: 'GitLab', api: 'https://gitlab.com/api/v4/users?username={u}', perfil: 'https://gitlab.com/{u}' },
  { id: 'reddit', nome: 'Reddit', api: 'https://www.reddit.com/user/{u}/about.json', perfil: 'https://www.reddit.com/user/{u}' },
  { id: 'hackernews', nome: 'Hacker News', api: 'https://hacker-news.firebaseio.com/v0/user/{u}.json', perfil: 'https://news.ycombinator.com/user?id={u}' },
  { id: 'devto', nome: 'DEV Community', api: 'https://dev.to/api/users/by_username?url={u}', perfil: 'https://dev.to/{u}' },
  { id: 'keybase', nome: 'Keybase', api: 'https://keybase.io/_/api/1.0/user/lookup.json?usernames={u}', perfil: 'https://keybase.io/{u}' },
  { id: 'codeberg', nome: 'Codeberg', api: 'https://codeberg.org/api/v1/users/{u}', perfil: 'https://codeberg.org/{u}' },
  { id: 'chess', nome: 'Chess.com', api: 'https://api.chess.com/pub/player/{u}', perfil: 'https://www.chess.com/member/{u}' },
  { id: 'lichess', nome: 'Lichess', api: 'https://lichess.org/api/user/{u}', perfil: 'https://lichess.org/@/{u}' },
  { id: 'dockerhub', nome: 'Docker Hub', api: 'https://hub.docker.com/v2/users/{u}/', perfil: 'https://hub.docker.com/u/{u}' },
  { id: 'npm', nome: 'npm', api: 'https://registry.npmjs.org/-/v1/search?text=maintainer:{u}&size=1', perfil: 'https://www.npmjs.com/~{u}' },
  { id: 'mastodon', nome: 'Mastodon (mastodon.social)', api: 'https://mastodon.social/api/v1/accounts/lookup?acct={u}', perfil: 'https://mastodon.social/@{u}' },
  { id: 'bluesky', nome: 'Bluesky', api: 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor={u}.bsky.social', perfil: 'https://bsky.app/profile/{u}.bsky.social' },
  { id: 'gravatar', nome: 'Gravatar', api: 'https://api.gravatar.com/v3/profiles/{u}', perfil: 'https://gravatar.com/{u}' },
  { id: 'wikipedia', nome: 'Wikipédia', api: 'https://pt.wikipedia.org/w/api.php?action=query&list=users&ususers={u}&format=json', perfil: 'https://pt.wikipedia.org/wiki/Usu%C3%A1rio:{u}' },
  { id: 'steam', nome: 'Steam', api: 'https://steamcommunity.com/id/{u}/?xml=1', perfil: 'https://steamcommunity.com/id/{u}' },
  { id: 'telegram', nome: 'Telegram', api: 'https://t.me/{u}', perfil: 'https://t.me/{u}' },
];

export function validarUsuario(u: string) { return /^[A-Za-z0-9._-]{2,39}$/.test(u.trim()); }
export function montarUrl(modelo: string, u: string) { return modelo.replaceAll('{u}', encodeURIComponent(u.trim())); }

/** Decide existência a partir do status e do corpo, pois algumas APIs devolvem 200 com lista vazia. */
export function interpretar(id: string, status: number, corpo: string): 'existe' | 'livre' | 'incerto' {
  if (status === 404 || status === 410) return 'livre';
  if (status === 429 || status >= 500 || status === 403 || status === 0) return 'incerto';
  if (status !== 200) return 'incerto';
  const c = corpo.trim();
  switch (id) {
    case 'gitlab': return c === '[]' ? 'livre' : 'existe';
    case 'hackernews': return c === 'null' ? 'livre' : 'existe';
    case 'keybase': return /"them":\s*\[\s*null/.test(c) || !/"them"/.test(c) ? 'livre' : 'existe';
    case 'npm': return /"total":\s*0\b/.test(c) ? 'livre' : 'existe';
    case 'wikipedia': return /"missing"/.test(c) || /"invalid"/.test(c) ? 'livre' : 'existe';
    case 'steam': return /<steamID64>/.test(c) ? 'existe' : 'livre';
    case 'telegram': return /tgme_page_title/.test(c) ? 'existe' : 'livre';
    default: return 'existe';
  }
}

// ---------- Domínio e IP ----------
export type Alvo = { tipo: 'ipv4' | 'ipv6' | 'dominio'; valor: string } | null;
export function classificarAlvo(entrada: string): Alvo {
  let v = entrada.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').split(/[/?#]/)[0] ?? '';
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) return v.split('.').every(n => Number(n) <= 255) ? { tipo: 'ipv4', valor: v } : null;
  if (/^[0-9a-f:]+$/.test(v) && v.includes(':') && v.split(':').length >= 3) return { tipo: 'ipv6', valor: v };
  v = v.replace(/:\d+$/, '').replace(/^www\./, '');
  if (/^(?=.{3,253}$)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/.test(v) && !v.split('.').some(p => p.startsWith('-') || p.endsWith('-'))) return { tipo: 'dominio', valor: v };
  return null;
}
export function ipPrivado(ip: string) {
  return /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip) || /^(::1|fc|fd|fe80)/i.test(ip);
}

// ---------- E-mail ----------
export const descartaveis = new Set(['mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com', 'mintemail.com', 'emailondeck.com', 'mohmal.com', 'tempail.com', 'burnermail.io', 'moakt.com', 'mailnesia.com']);
export function separarEmail(e: string) {
  const v = e.trim().toLowerCase();
  const m = /^([a-z0-9!#$%&'*+/=?^_`{|}~.-]{1,64})@([a-z0-9.-]+\.[a-z]{2,63})$/.exec(v);
  const local = m?.[1], dominio = m?.[2];
  if (!local || !dominio || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  return { local, dominio };
}
export function lerSpf(txts: string[]) { return txts.find(t => /^v=spf1\b/i.test(t)) ?? null; }
export function lerDmarc(txts: string[]) {
  const r = txts.find(t => /^v=DMARC1\b/i.test(t));
  if (!r) return null;
  const p = /;\s*p=(none|quarantine|reject)/i.exec(r)?.[1]?.toLowerCase() ?? 'none';
  return { registro: r, politica: p as 'none' | 'quarantine' | 'reject' };
}
export function limparTxt(dado: string) { return dado.replace(/^"|"$/g, '').replace(/"\s*"/g, ''); }

// ---------- Telefone ----------
const UF: Record<string, string> = {
  '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP', '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP',
  '21': 'RJ', '22': 'RJ', '24': 'RJ', '27': 'ES', '28': 'ES',
  '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG', '37': 'MG', '38': 'MG',
  '41': 'PR', '42': 'PR', '43': 'PR', '44': 'PR', '45': 'PR', '46': 'PR', '47': 'SC', '48': 'SC', '49': 'SC',
  '51': 'RS', '53': 'RS', '54': 'RS', '55': 'RS', '61': 'DF', '62': 'GO', '64': 'GO', '63': 'TO', '65': 'MT', '66': 'MT', '67': 'MS',
  '68': 'AC', '69': 'RO', '71': 'BA', '73': 'BA', '74': 'BA', '75': 'BA', '77': 'BA', '79': 'SE',
  '81': 'PE', '87': 'PE', '82': 'AL', '83': 'PB', '84': 'RN', '85': 'CE', '88': 'CE', '86': 'PI', '89': 'PI',
  '91': 'PA', '93': 'PA', '94': 'PA', '92': 'AM', '97': 'AM', '95': 'RR', '96': 'AP', '98': 'MA', '99': 'MA',
};
const PAISES: [string, string][] = [['351', 'Portugal'], ['55', 'Brasil'], ['54', 'Argentina'], ['56', 'Chile'], ['57', 'Colômbia'], ['595', 'Paraguai'], ['598', 'Uruguai'], ['52', 'México'], ['34', 'Espanha'], ['44', 'Reino Unido'], ['49', 'Alemanha'], ['33', 'França'], ['39', 'Itália'], ['41', 'Suíça'], ['971', 'Emirados Árabes'], ['1', 'EUA ou Canadá']];

export type Telefone = { e164: string; pais: string; ddi: string; ddd?: string; uf?: string; tipo: 'celular' | 'fixo' | 'desconhecido'; nacional: string };
export function analisarTelefone(entrada: string): Telefone | null {
  const internacional = entrada.trim().startsWith('+') || entrada.trim().startsWith('00');
  let d = entrada.replace(/\D/g, '').replace(/^00/, '');
  if (!internacional) { d = d.replace(/^0(?=\d{10,11}$)/, ''); if (d.length === 10 || d.length === 11) d = '55' + d; }
  if (d.length < 8 || d.length > 15) return null;
  if (d.startsWith('55')) {
    const resto = d.slice(2), ddd = resto.slice(0, 2), num = resto.slice(2);
    if (!UF[ddd] || (num.length !== 8 && num.length !== 9)) return null;
    const tipo = num.length === 9 && num[0] === '9' ? 'celular' : num.length === 8 && /^[2-5]/.test(num) ? 'fixo' : 'desconhecido';
    const nacional = num.length === 9 ? `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}` : `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
    return { e164: `+${d}`, pais: 'Brasil', ddi: '55', ddd, uf: UF[ddd], tipo, nacional };
  }
  const p = PAISES.find(([c]) => d.startsWith(c));
  if (!p) return { e164: `+${d}`, pais: 'Desconhecido', ddi: '', tipo: 'desconhecido', nacional: d };
  return { e164: `+${d}`, pais: p[1], ddi: p[0], tipo: 'desconhecido', nacional: d.slice(p[0].length) };
}
