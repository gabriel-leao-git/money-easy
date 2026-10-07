# Money Easy ⛏️

Simulador **fictício** de servidor de mineração de bitcoin. Mobile first, com Framer Motion e parallax.

> Nenhuma criptomoeda real é minerada e nenhum dinheiro real é ganho, sacado ou transferido. O "saque" é uma mecânica do jogo, e o app nunca pede chave Pix, CPF, carteira cripto ou dados bancários.

## Como se joga

- **Núcleo do servidor**: no centro da tela, um sólido geométrico girando em 3D gera dinheiro sozinho a cada segundo. Ele gira mais rápido conforme o hashrate e muda de forma conforme você junta equipamentos (tetraedro → cubo → octaedro → dodecaedro → icosaedro). Clicar nele minera na mão (R$ 10 por clique), e clicar rápido monta **combo** até x5.
- **Rigs e GPUs**: oito equipamentos, da GPU de entrada ao data center quântico, que mineram sozinhos, inclusive com o app fechado (metade do ritmo, até 2 horas). O **Overclock manual** aumenta o valor de cada clique.
- **Criptomoedas**: Litecoin, Dogecoin, Ethereum, Solana e Cardano. Cada uma liberada multiplica toda a mineração, e os multiplicadores se acumulam.
- **Saque fictício** (mínimo R$ 50): o valor sai do saldo e vai pro **Cofre**. O total no Cofre define a **patente** (Novato → Lenda do blockchain), e cada patente multiplica toda a mineração.
- **Bloco dourado** atravessa a tela de tempos em tempos: pegue para ganhar um bloco raro ou o **PUMP x7** por 15 segundos.
- **Conquistas** e **ranking** contra rivais NPC e outros perfis do mesmo aparelho.

## Imagem de fundo

O fundo é a foto em `public/bg-mining.jpg`, com parallax. Sem esse arquivo, aparece um degradê neon no lugar.

## Download do app

O botão **Download** do menu baixa o `instal-app.apk` (Android). O arquivo fica na raiz do repo, fora do git, e o `npm run dev` e o `npm run preview` servem ele direto de lá em `/instal-app.apk`, sem copiar. Num host estático só com o `dist/`, o APK não vai junto e o botão dá 404.

## Login (MVP)

O login é **sem autenticação**: qualquer usuário e senha entram. O nome só escolhe qual save carregar; a senha não é enviada nem guardada. Todo o progresso fica no `localStorage` do aparelho, então não há backend.

## Stack

- React 19 + TypeScript + Vite
- Framer Motion: transições de tela e de abas, springs, `layoutId` na navegação, bottom sheet arrastável, confete, números animados, ranking que reordena com animação
- Núcleo 3D em SVG projetado a cada frame (`useAnimationFrame`), sem biblioteca 3D
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
    MiningCore.tsx      núcleo geométrico 3D (o servidor de mineração)
    art.tsx             ícones de GPU/rig/ASIC e das criptomoedas
    Login.tsx           tela de login
    Game.tsx            tela do jogo (abas, sheets, toasts, bloco dourado)
    PlayTab.tsx         saldo, núcleo e próxima meta
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
