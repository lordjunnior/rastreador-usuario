<div align="center">

<img src="./public/og-cover.svg" width="100%" alt="Rastreador de Usuário — LORD JUNNIOR" />

# RASTREADOR DE USUÁRIO

**Digite um nome de usuário e veja em quais plataformas públicas ele tem perfil ativo, com link direto para cada conta.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=fff)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=fff)](https://vite.dev/)

[Site oficial](https://lordjunnior.com.br/ferramentas/rastreador-usuario) · [Perfil GitHub](https://github.com/lordjunnior)

</div>

---

## Visão geral

Digite um nome de usuário e veja em quais plataformas públicas ele tem perfil ativo, com link direto para cada conta.

Este repositório contém uma versão independente da ferramenta publicada no Arsenal LORD JUNNIOR. A interface e os módulos locais necessários foram extraídos do projeto principal para permitir execução, auditoria e evolução separadas.

## Executar localmente

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

## Arquitetura

- `src/App.tsx`: entrada independente da ferramenta.
- `src/components/tools/screens/`: tela funcional e componentes diretamente necessários.
- `src/components/tools/lib/` e `src/lib/`: motores e cálculos reutilizados pela tela, quando aplicável.
- `src/styles.css`: tokens visuais e estilos compartilhados da família LORD JUNNIOR.

## Privacidade e integrações

A ferramenta preserva o fluxo de processamento implementado na tela de origem. Quando houver chamadas a serviços externos, elas devem ser avaliadas conforme o provedor e a ação executada; ausência de conta própria não significa ausência de tráfego externo. Não inclua chaves privadas, tokens ou credenciais no código do navegador.

## API e execução completa

Este projeto inclui endpoints serverless em `api/` para consultas externas. Para testar a interface, use `npm run dev`. Para testar também os endpoints localmente, instale a Vercel CLI e execute `npm run dev:vercel` (`vercel dev`). Em produção, publique na Vercel para que `/api/*` seja executado no servidor.

Os limites de consulta são aplicados por instância serverless e não substituem um rate limiter distribuído em ambientes de alto tráfego. As consultas usam fontes públicas e não devem ser interpretadas como prova de identidade ou parecer oficial.

## Projeto de origem

- Site: https://lordjunnior.com.br
- Código-fonte principal: https://github.com/lordjunnior/Meu-site-atualizado
- Ferramenta no site: `/ferramentas/rastreador-usuario`

---

**LORD JUNNIOR** — Inteligência, Geopolítica e Liberdade Digital.
