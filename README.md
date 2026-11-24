# Atalho IA — site

Site da **Atalho IA**: sistemas, automações, sites e painéis com inteligência artificial, feitos sob medida para a rotina de cada empresa. Atendimento online em todo o Brasil.

**No ar:** https://atalho.ia.br

> O caminho mais curto entre o seu problema e a solução.

## O que tem no site

- **Paleta de comando no topo:** o visitante digita o que toma o tempo dele e a mensagem vai direto para o WhatsApp.
- **Tec, o mascote:** uma tecla com olhos de LED que pisca, acena, segue o cursor e faz um tour de 6 passos na primeira visita. Ao ser clicado, abre um assistente que roda no próprio navegador, sem servidor e sem custo (`tec-cerebro.js`). Ele entende cerca de 45 assuntos, sinônimos e erros de digitação, e manda para o WhatsApp o que não sabe responder.
- **Mapa do atalho:** o visitante lista os passos de uma tarefa, o site desenha o caminho longo e traça o atalho, marcando os passos que a IA pode assumir. Dá para baixar o mapa em PNG ou enviar pelo WhatsApp.
- **Calculadora de tempo gasto:** minutos × pessoas × 22 dias úteis, com o resultado enviado ao WhatsApp.
- **Interações:** atalhos de teclado (`?` mostra a lista), cursor em forma de rede neural, botões com efeito ímã, cartões que inclinam com o mouse, perguntas frequentes animadas e um easter egg escondido.
- **Acessibilidade:** as animações respeitam a preferência "reduzir movimento" e o cursor personalizado só aparece com mouse.

## Tecnologias

HTML, CSS e JavaScript puros, sem framework e sem etapa de build. Fontes Space Grotesk, Inter e JetBrains Mono (Google Fonts). Publicado no Cloudflare Pages, com cabeçalhos de segurança e cache em `_headers`.

Desenvolvido com o [Claude Code](https://claude.com/claude-code).

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página única, com SEO, Open Graph e JSON-LD |
| `styles.css` | Tokens de cor e estilos de cada seção |
| `script.js` | Paleta de comando, demonstrações, calculadora e links do WhatsApp |
| `interacoes.js` | Atalhos de teclado, efeitos de rolagem e easter egg |
| `mascote.js` | O Tec: animações, tour e janela do assistente |
| `tec-cerebro.js` | Assistente do Tec, com respostas fixas e sem IA generativa |
| `mapa.js` | Mapa do atalho |
| `cursor.js` | Cursor neural |
| `_headers` | Cabeçalhos do Cloudflare Pages |
| `assets/` | Símbolo, favicon, avatar e imagem do projeto entregue |

## Rodar no computador

Sirva a pasta em um servidor local. Por exemplo:

```bash
npx serve .
```

Depois abra o endereço que aparecer no terminal.

## Publicar

```bash
npx wrangler pages deploy . --project-name atalho-ia --branch main --commit-dirty=true
```

## Contato

- Site: https://atalho.ia.br
- Instagram: [@atalho._ia](https://www.instagram.com/atalho._ia/)
