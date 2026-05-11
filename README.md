# BetMind KTO 🏆

Bot de apostas com odds reais da KTO + análise por IA + Kelly Criterion.

---

## 🚀 Como colocar no ar (Vercel) — 15 minutos

### Passo 1 — Criar conta no GitHub
1. Acesse **github.com** e clique em "Sign up"
2. Crie sua conta gratuita

### Passo 2 — Criar repositório e subir os arquivos
1. No GitHub, clique em **"New repository"**
2. Nome: `betmind-kto`
3. Clique em **"Create repository"**
4. Clique em **"uploading an existing file"**
5. Faça upload de todos os arquivos desta pasta mantendo a estrutura:
   ```
   betmind/
   ├── package.json
   ├── public/
   │   ├── index.html
   │   └── manifest.json
   └── src/
       ├── index.js
       └── App.js
   ```
6. Clique em **"Commit changes"**

### Passo 3 — Deploy no Vercel
1. Acesse **vercel.com** e clique em "Sign up with GitHub"
2. Clique em **"Add New Project"**
3. Selecione o repositório `betmind-kto`
4. Clique em **"Deploy"**
5. Aguarde ~2 minutos
6. Pronto! Você recebe um link tipo `betmind-kto.vercel.app`

---

## 🔑 Configurando as APIs no app

Após abrir o link, vá na aba **⚙️ Config** e cole:

1. **Anthropic API Key** → console.anthropic.com
   - Crie conta → API Keys → Create Key

2. **The Odds API Key** → the-odds-api.com
   - Crie conta gratuita → copie sua key

As chaves ficam salvas no seu navegador (localStorage). Nunca saem do seu dispositivo.

---

## 📱 Instalar como app no celular

**iPhone:** Abra no Safari → botão compartilhar → "Adicionar à Tela Inicial"

**Android:** Abra no Chrome → menu (⋮) → "Adicionar à tela inicial"

---

## ✨ Funcionalidades

- 📊 **Dashboard** — banca, lucro, ROI, win rate, meta diária com Kelly sugerido
- 🏆 **KTO** — odds reais via The Odds API + IA analisa os melhores picks
- 🤖 **Chat IA** — assistente especializado em apostas na KTO
- 💰 **Banca** — registra apostas com Kelly automático
- 🧮 **Calculadora** — Kelly Criterion (½ e ¼) + Surebet
- ⚙️ **Config** — configure suas API keys com segurança
