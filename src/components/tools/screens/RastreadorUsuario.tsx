import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { SuiteHero, Stat, Faq } from './SovereignKit';
import { rastrearUsuario, type ResultadoPlataforma } from '@/lib/investigacao.functions';
import { plataformas, validarUsuario } from '@/components/tools/lib/investigacao';

const rotulo = { existe: 'PERFIL ENCONTRADO', livre: 'NÃO ENCONTRADO', incerto: 'SEM RESPOSTA' } as const;

export default function RastreadorUsuario() {
  const rodar = useServerFn(rastrearUsuario);
  const [u, setU] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState<{ usuario: string; lista: ResultadoPlataforma[]; at: string } | null>(null);

  const buscar = async () => {
    const nome = u.trim().replace(/^@/, '');
    if (!validarUsuario(nome)) { setErr('Use de 2 a 39 caracteres: letras, números, ponto, hífen ou sublinhado.'); return; }
    setBusy(true); setErr(''); setRes(null);
    try {
      const r = await rodar({ data: { usuario: nome } });
      if ('erro' in r) setErr(r.erro);
      else setRes({ usuario: nome, lista: [...r.lista].sort((a, b) => Number(b.estado === 'existe') - Number(a.estado === 'existe')), at: new Date().toLocaleString('pt-BR') });
    } catch { setErr('A varredura não respondeu agora. Tente de novo em instantes.'); }
    setBusy(false);
  };
  const achou = res?.lista.filter(x => x.estado === 'existe') ?? [];

  return <div className="ss-root">
    <SuiteHero kicker="Investigação digital · OSINT" title="Rastreador" accent="de Usuário" repo="https://github.com/sherlock-project/sherlock" repoLabel="PROJETO SHERLOCK" prefix="INSPIRADO NO CÓDIGO ABERTO DE"
      note="VARRE PERFIS PÚBLICOS · NADA É GUARDADO"
      lead="Digite um nome de usuário e veja em quais plataformas públicas ele já tem conta. Serve para auditar a sua própria pegada digital e achar contas esquecidas." />
    <div className="ss-wrap">
      <section className="ss-plate">
        <span className="ss-tag">01 · VARREDURA</span>
        <h2>Qual usuário procurar</h2>
        <label className="ss-label" htmlFor="ru-u">Nome de usuário</label>
        <div className="ss-row" style={{ marginTop: 0 }}>
          <input id="ru-u" className="ss-input" style={{ flex: 1 }} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="exemplo: lordjunnior" value={u} onChange={e => { setU(e.target.value); setRes(null); }} onKeyDown={e => e.key === 'Enter' && buscar()} />
          <button type="button" className="ss-btn" disabled={!u || busy} onClick={buscar}>{busy ? 'Varrendo…' : 'Rastrear'}</button>
        </div>
        <p className="ss-sub" style={{ marginTop: 10 }}>A consulta passa pelo servidor do site, que pergunta a {plataformas.length} plataformas públicas e devolve só o resultado. Nada é guardado.</p>
        {err && <p className="ss-warn" style={{ marginTop: 16 }}>{err}</p>}
        {res && <div style={{ marginTop: 22 }} aria-live="polite">
          <div className="ss-stats">
            <Stat value={String(achou.length)} label="Perfis encontrados" tone={achou.length ? 'hot' : undefined} />
            <Stat value={String(res.lista.filter(x => x.estado === 'livre').length)} label="Sem perfil" />
            <Stat value={String(res.lista.filter(x => x.estado === 'incerto').length)} label="Sem resposta" />
          </div>
          <ul style={{ display: 'grid', gap: 8, marginTop: 16 }}>
            {res.lista.map((x, i) => <li key={x.id} style={{ padding: '10px 12px', borderLeft: `2px solid ${x.estado === 'existe' ? '#e8a33d' : 'rgba(244,235,221,.18)'}`, background: i % 2 ? 'transparent' : 'rgba(232,163,61,.06)', fontSize: 13, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', opacity: x.estado === 'existe' ? 1 : .7 }}>
              <strong>{String(i + 1).padStart(2, '0')} · {x.nome}</strong>
              <span>{x.estado === 'existe' ? <a href={x.perfil} target="_blank" rel="noopener noreferrer" className="ss-ok">{rotulo.existe} · ABRIR</a> : <span className="ss-sub">{rotulo[x.estado]}</span>}</span>
            </li>)}
          </ul>
          <p className="ss-sub" style={{ marginTop: 10 }}>Consultado em {res.at}. Limitação: achar um perfil com o mesmo nome não prova que é a mesma pessoa, e não achar não prova que a conta não existe (perfis privados ou plataformas fora da lista).</p>
        </div>}
      </section>
      <Faq items={[
        { q: 'Por que não varre 400 sites como o Sherlock original?', a: 'Porque aqui só entram plataformas que dão uma resposta pública e confiável. Muitos sites respondem "existe" para qualquer nome e gerariam resultados falsos. Quem quiser a lista completa pode instalar o Sherlock no próprio computador.' },
        { q: 'O que eu faço com o resultado?', a: 'Se for o seu nome, revise cada perfil encontrado, apague o que não usa mais e troque as senhas das contas que ficarem. Se for de outra pessoa, use com responsabilidade e dentro da lei.' },
      ]} />
    </div>
  </div>;
}
