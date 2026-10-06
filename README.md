# Money Easy 💸

Jogo **fictício** de ficar rico tocando na tela. Mobile first, com animações em Framer Motion e uma cidade em parallax ao fundo.

> Nenhum dinheiro real é ganho, sacado ou transferido. O "saque" é uma mecânica do jogo, e o app nunca pede chave Pix, CPF ou dados bancários.

## Como se joga

- **Toque na moeda** para ganhar R$ 10 fictícios. Tocar rápido monta **combo** (até x5).
- **Negócios** (brigadeiro, lava-jato, food truck… até empresa de foguetes) rendem sozinhos por segundo, inclusive com o app fechado (metade do ritmo, até 2 horas).
- **Dedo de ouro** aumenta o valor de cada toque.
- **Saque fictício** (mínimo R$ 50, como no protótipo original): o valor sai do saldo e vai pro **Cofre**. O total no Cofre define a **patente** (Estagiário → Bilionário), e cada patente multiplica tudo o que você ganha. Sacar ou reinvestir é a decisão do jogo.
- **Moeda dourada** atravessa a tela de tempos em tempos: pegue para ganhar uma bolsa de ouro ou o **Frenesi x7** por 15 segundos.
- **Conquistas** e **ranking** contra rivais NPC e outros perfis do mesmo aparelho.

## Login (MVP)

O login é **sem autenticação**: qualquer usuário e senha entram. O nome só escolhe qual save carregar; a senha não é enviada nem guardada. Todo o progresso fica no `localStorage` do aparelho, então não há backend.

## Stack

- React 19 + TypeScript + Vite
- Framer Motion: transições de tela e de abas, springs, `layoutId` na navegação, bottom sheet arrastável, confete, números animados, ranking que reordena com animação
- Parallax em camadas (céu, estrelas, lua-moeda, dois skylines e moedas voando) movido por **inclinação do celular**, mouse e scroll, com deriva automática quando nada se mexe
- Sons sintetizados com Web Audio (sem arquivos) e vibração no celular
- Respeita `prefers-reduced-motion`

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173 (com --host, abre no celular pela rede local)
npm run build    # gera dist/
npm run preview  # serve o build
```

O build usa caminhos relativos, então `dist/` funciona em qualquer host estático (GitHub Pages, Vercel, Netlify).

> No iPhone, o parallax por inclinação pede permissão de movimento ao tocar em "Entrar e jogar", e só funciona em HTTPS.

## Estrutura

```
src/
  App.tsx               login ↔ jogo, cenário e provider de parallax
  components/
    World.tsx           cenário em parallax
    Login.tsx           tela de login
    Game.tsx            tela do jogo (abas, sheets, toasts, moeda dourada)
    PlayTab.tsx         moeda, combo e próxima meta
    ShopTab.tsx         negócios e upgrade de toque
    CashTab.tsx         saque fictício, patentes e histórico
    RankTab.tsx         perfil, estatísticas, ranking e conquistas
  game/
    config.ts           todos os números do jogo (custos, rendas, patentes, NPCs)
    state.ts            regras puras e save/load
    reducer.ts          ações do jogo
    useGame.ts          loop de 100 ms e salvamento automático
  fx/
    parallax.tsx        inclinação/mouse/scroll → camadas
    sound.ts            efeitos sonoros
```

Para balancear o jogo, mexa só em `src/game/config.ts`.
