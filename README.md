# Money Easy ⛏️

Simulador **fictício** de servidor de mineração de bitcoin. Mobile first, com Framer Motion e parallax.

> Nenhuma criptomoeda real é minerada e nenhum dinheiro real é ganho, sacado ou transferido. O "saque" é uma mecânica do jogo, e o app nunca pede chave Pix, CPF, carteira cripto ou dados bancários.

## Como se joga

- **Moeda de mineração**: no centro da tela, uma moeda 3D girando gera dinheiro sozinha a cada segundo. A cada meia volta a face troca pela próxima cripto que você liberou (Bitcoin, Litecoin, Dogecoin, Ethereum, Solana, Cardano), ela gira mais rápido conforme o hashrate e a borda muda de material conforme você junta equipamentos (bronze → prata → ouro → platina → diamante). Clicar nela minera na mão (R$ 10 por clique), e clicar rápido monta **combo** até x5.
- **Rigs e GPUs**: oito equipamentos, da GPU de entrada ao data center quântico, que mineram sozinhos, inclusive com o app fechado (metade do ritmo, até 2 horas). O **Overclock manual** aumenta o valor de cada clique.
- **Criptomoedas**: Litecoin, Dogecoin, Ethereum, Solana e Cardano. Cada uma liberada multiplica toda a mineração, e os multiplicadores se acumulam.
- **Saque fictício** (mínimo R$ 50): o valor sai do saldo e vai pro **Cofre**. O total no Cofre define a **patente** (Novato → Lenda do blockchain), e cada patente multiplica toda a mineração.
- **Bloco dourado** atravessa a tela de tempos em tempos: pegue para ganhar um bloco raro ou o **PUMP x7** por 15 segundos.
- **Conquistas** e **ranking** contra rivais NPC e outros perfis do mesmo aparelho.

## Imagem de fundo

O fundo é a foto em `public/bg-mining.jpg`, com parallax. Sem esse arquivo, aparece um degradê neon no lugar.

## Download do app

O botão **Download** do menu baixa o `instal-app.apk` (Android), que fica na raiz do repo. O `npm run dev` e o `npm run preview` servem ele direto de lá em `/instal-app.apk`, sem copiar. O build (`dist/`) não leva o APK: quem coloca ele no site publicado é o workflow do GitHub Pages.

## Publicação (GitHub Pages)

Cada push no `main` roda `.github/workflows/pages.yml`: instala, faz o build, junta o APK e publica o `dist/` em https://gabriel-leao-git.github.io/money-easy/. Em **Settings → Pages**, a fonte precisa ser **GitHub Actions**: no modo "Deploy from a branch" o Pages serve o `index.html` cru do repo, que aponta pro TypeScript em `src/`, e a página fica em branco.

## Login (MVP)

O login é **sem autenticação**: qualquer usuário e senha entram. O nome só escolhe qual save carregar; a senha não é enviada nem guardada. Todo o progresso fica no `localStorage` do aparelho, então não há backend.

## Stack

- React 19 + TypeScript + Vite
- Framer Motion: transições de tela e de abas, springs, `layoutId` na navegação, bottom sheet arrastável, confete, números animados, ranking que reordena com animação
- Moeda 3D em CSS (discos empilhados com `preserve-3d`) girada a cada frame (`useAnimationFrame`), sem biblioteca 3D
- Parallax em camadas (foto, brilhos neon, grade de data center, moedas cripto e partículas) movido por **inclinação do celular**, mouse e scroll
- Ícones de hardware e de cripto desenhados em SVG próprio (não são os logos oficiais)
- Sons sintetizados com Web Audio e vibração no celular
- Botões e menus opacos; respeita `prefers-reduced-motion`

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173 (com --host, abre no celular pela rede local)
npm run build    # gera dist/
npm run preview  # serve o build
```

O build usa caminhos relativos, então `dist/` funciona em qualquer host estático.

> No iPhone, o parallax por inclinação pede permissão de movimento ao tocar em "Entrar e jogar", e só funciona em HTTPS.

## Estrutura

```text
src/
  App.tsx               login ↔ jogo, cenário e provider de parallax
  components/
    World.tsx           cenário em parallax
    MiningCore.tsx      moeda 3D girando (o servidor de mineração)
    art.tsx             ícones de GPU/rig/ASIC e das criptomoedas
    Login.tsx           tela de login
    Game.tsx            tela do jogo (abas, sheets, toasts, bloco dourado)
    PlayTab.tsx         saldo, moeda e próxima meta
    ShopTab.tsx         rigs, GPUs, overclock e criptomoedas
    CashTab.tsx         saque fictício, patentes e histórico
    RankTab.tsx         perfil, estatísticas, ranking e conquistas
  game/
    config.ts           todos os números do jogo (custos, rendas, criptos, patentes, NPCs)
    state.ts            regras puras e save/load
    reducer.ts          ações do jogo
    useGame.ts          loop de 100 ms e salvamento automático
  fx/
    parallax.tsx        inclinação/mouse/scroll → camadas
    sound.ts            efeitos sonoros
```

Para balancear o jogo, mexa só em `src/game/config.ts`.
