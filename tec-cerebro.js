/* ==========================================================
   Tec · cérebro do assistente
   Uma IA simples que roda no navegador, sem servidor:
   - entende a pergunta por palavras-chave com radicais, sinônimos
     e tolerância a erros de digitação (distância de edição);
   - pesa as palavras raras mais do que as comuns (IDF);
   - responde a duas perguntas de uma vez quando a frase mistura temas;
   - lembra o último assunto ("e para clínica?", "sim", "explica melhor");
   - faz contas com números da frase ("2 horas por dia, 3 pessoas").
   As respostas são fixas e honestas: o que não sabe, manda para o WhatsApp.
   ========================================================== */
(function (raiz) {
  const DIAS_UTEIS = 22;

  /* ---------- Base de conhecimento ----------
     termos: palavras e expressões que indicam o assunto
     resposta: o que o Tec diz
     detalhe: resposta para "explica melhor" (opcional)
     acoes: botões { tipo: whats | tour | secao, rotulo, alvo, mensagem }
     sugestoes: perguntas sugeridas depois da resposta */
  const BASE = [
    {
      id: "saudacao", conversa: true,
      termos: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "e ai", "eai", "opa", "salve", "hello", "hey", "tudo bem", "tudo bom"],
      resposta: "Oi! Aqui é o Tec, assistente da Atalho IA. Pergunte sobre serviços, preço, prazo, o seu setor, ou conte uma tarefa que toma o seu tempo.",
      sugestoes: ["O que vocês fazem?", "Quanto custa?", "Fazer um tour pelo site"],
    },
    {
      id: "quem_tec", conversa: true,
      termos: ["quem e voce", "quem e vc", "voce e robo", "e um robo", "e uma ia", "voce e humano", "e humano", "tec", "mascote", "seu nome", "como voce se chama", "assistente"],
      resposta: "O Tec é o assistente do site: uma tecla de atalho com olhos de LED. As respostas aqui são automáticas, montadas com o que a Atalho IA faz. Para falar com uma pessoa da equipe, é só ir para o WhatsApp.",
      acoes: [{ tipo: "whats", rotulo: "Falar com a equipe" }],
      sugestoes: ["O que vocês fazem?", "Como funciona?"],
    },
    {
      id: "nome", conversa: true,
      termos: ["por que atalho", "porque atalho", "nome atalho", "significa atalho", "significado do nome", "por que esse nome"],
      resposta: "O nome vem dos atalhos de teclado: um comando curto que faz em um segundo o que levaria vários passos. É o que fazemos com IA nas tarefas da sua empresa.",
      sugestoes: ["O que vocês fazem?", "Atalhos do teclado do site"],
    },
    {
      id: "servicos",
      termos: ["o que voces fazem", "o que fazem", "o que faz", "servicos", "servico", "oferecem", "trabalham com", "solucoes", "solucao", "atalho ia faz", "o que e a atalho", "empresa faz", "ajudar minha empresa", "como podem ajudar"],
      resposta: "Criamos quatro tipos de solução, sempre sob medida: sistemas (cadastros e controles), automações com IA (atendimento, documentos, lembretes), sites e landing pages, e painéis de dados.",
      detalhe: "Na prática, começamos entendendo a sua rotina e escolhemos o que traz mais resultado primeiro. Pode ser uma automação pequena, como responder às dúvidas comuns no WhatsApp, ou um sistema completo para a operação.",
      sugestoes: ["Exemplos de automação", "Fazem sites?", "Quanto custa?"],
    },
    {
      id: "automacao",
      termos: ["automacao", "automatizar", "automatico", "automatica", "robo", "bot", "fluxo", "repetitivo", "repetitiva", "tarefa repetitiva", "economizar tempo", "ganhar tempo", "exemplos de automacao", "ia faz"],
      resposta: "Automação é colocar a IA para fazer o trabalho repetitivo: responder clientes, ler e resumir documentos, montar relatórios e mandar lembretes. Você continua no controle e decide o que passa pela sua equipe.",
      sugestoes: ["Atendimento no WhatsApp", "Resumo de documentos", "Calculadora de tempo"],
    },
    {
      id: "whatsapp_bot",
      termos: ["chatbot", "atendimento", "atender clientes", "responder clientes", "responder mensagens", "mensagens", "whatsapp business", "atendimento no whatsapp", "atendimento automatico", "responder whatsapp", "sac", "duvidas dos clientes"],
      resposta: "Configuramos um assistente com as informações da sua empresa (preços, horários, serviços). Ele responde às dúvidas comuns e passa para a sua equipe o que precisa de atenção, como um orçamento ou uma reclamação.",
      detalhe: "Ele pode atender no WhatsApp e no site. As regras ficam com você: o que ele responde sozinho, quando chama uma pessoa e qual tom usar.",
      sugestoes: ["Integra com o que já uso?", "Quanto custa?", "E os dados dos clientes?"],
    },
    {
      id: "documentos",
      termos: ["contrato", "contratos", "documento", "documentos", "pdf", "edital", "editais", "laudo", "laudos", "ler documentos", "resumir", "resumo", "resumo de documentos", "processo judicial", "clausula", "papelada", "arquivos"],
      resposta: "A IA lê documentos longos e entrega um resumo com prazos, valores e pontos de atenção em linguagem simples. Também dá para organizar automaticamente os arquivos que chegam dos clientes, por tipo e data.",
      sugestoes: ["E os dados?", "Setor jurídico", "Quanto tempo leva?"],
    },
    {
      id: "paineis",
      termos: ["planilha", "planilhas", "excel", "relatorio", "relatorios", "power bi", "powerbi", "dashboard", "painel", "paineis", "indicadores", "kpi", "grafico", "graficos", "dados da empresa", "fechamento do mes", "bi"],
      resposta: "Os dados que você já tem (planilhas, sistemas) viram painéis claros e relatórios que se atualizam sozinhos, no Power BI ou na web.",
      sugestoes: ["Integra com o que já uso?", "Quanto custa?", "Calculadora de tempo"],
    },
    {
      id: "sistemas",
      termos: ["sistema", "sistemas", "software", "cadastro", "cadastros", "controle", "estoque", "patrimonio", "aplicativo", "app", "crm", "erp", "programa", "ordem de servico", "gestao"],
      resposta: "Criamos sistemas sob medida para o jeito que a sua empresa trabalha: cadastros, controles (estoque, patrimônio, prazos) e fluxos internos. Eles funcionam no navegador, no computador e no celular.",
      sugestoes: ["Quanto tempo leva?", "Quanto custa?", "E depois da entrega?"],
    },
    {
      id: "sites",
      termos: ["site", "sites", "landing page", "pagina", "site institucional", "site profissional", "criar site", "fazem site", "website", "seo"],
      resposta: "Fazemos sites e landing pages rápidos, bonitos no celular e pensados para gerar contatos. Um projeto recente foi o site de um escritório de advocacia.",
      acoes: [{ tipo: "secao", rotulo: "Ver o projeto", alvo: "#projeto" }],
      sugestoes: ["Quanto custa?", "Quanto tempo leva?"],
    },
    {
      id: "agenda",
      termos: ["agenda", "agendamento", "agendar", "lembrete", "lembretes", "marcar horario", "consulta", "consultas", "faltas", "confirmar consulta", "confirmacao", "reserva", "reservas"],
      resposta: "Organizamos o agendamento e enviamos lembretes automáticos ao cliente na véspera. Isso reduz esquecimentos e faltas, e a equipe para de ligar um por um.",
      sugestoes: ["Setor saúde", "Atendimento no WhatsApp", "Quanto custa?"],
    },
    {
      id: "textos",
      termos: ["texto", "textos", "post", "posts", "legenda", "legendas", "descricao de produto", "descricoes", "email", "e-mail", "conteudo", "redacao", "escrever"],
      resposta: "A IA escreve rascunhos no tom da sua marca: descrições de produtos, e-mails e legendas. Alguém da sua equipe revisa antes de publicar.",
      sugestoes: ["Setor marketing", "Quanto custa?"],
    },
    {
      id: "preco",
      termos: ["preco", "precos", "custa", "custo", "valor", "valores", "quanto", "quanto custa", "orcamento", "caro", "barato", "investimento", "cobram", "tabela de precos"],
      resposta: "Depende do tamanho do problema. Depois de uma conversa rápida, você recebe uma proposta com valor e prazo, antes de qualquer compromisso.",
      detalhe: "Não trabalhamos com pacote fechado porque cada solução é sob medida. Uma automação simples custa bem menos que um sistema completo, e projetos grandes podem ser divididos em etapas.",
      acoes: [{ tipo: "whats", rotulo: "Pedir uma proposta", mensagem: "Olá! Vim pelo site da Atalho IA e quero receber uma proposta." }],
      sugestoes: ["Tem mensalidade?", "Formas de pagamento", "Quanto tempo leva?"],
    },
    {
      id: "mensalidade",
      termos: ["mensalidade", "mensal", "assinatura", "custo mensal", "todo mes", "taxa mensal", "recorrente"],
      resposta: "Depende da solução. Algumas têm só o custo do projeto. Outras têm custos mensais das ferramentas usadas, como servidor ou o próprio WhatsApp. Tudo isso aparece na proposta, antes de fechar.",
      sugestoes: ["Quanto custa?", "E depois da entrega?"],
    },
    {
      id: "pagamento",
      termos: ["pagamento", "pagar", "parcelar", "parcelado", "parcela", "pix", "cartao", "boleto", "nota fiscal", "entrada", "forma de pagamento", "formas de pagamento"],
      resposta: "As condições de pagamento são combinadas na proposta. Fale com a equipe no WhatsApp para ver o que funciona melhor para você.",
      acoes: [{ tipo: "whats", rotulo: "Perguntar no WhatsApp", mensagem: "Olá! Vim pelo site da Atalho IA e quero saber das formas de pagamento." }],
      sugestoes: ["Quanto custa?", "Como funciona?"],
    },
    {
      id: "prazo",
      termos: ["prazo", "prazos", "quanto tempo", "demora", "demorar", "quando fica pronto", "rapido", "tempo de entrega", "dias", "semanas", "leva quanto"],
      resposta: "O prazo é combinado na proposta. Projetos maiores são divididos em etapas, para você já usar as partes prontas.",
      sugestoes: ["Como funciona?", "Quanto custa?"],
    },
    {
      id: "processo",
      termos: ["como funciona", "etapas", "processo", "passo a passo", "como comeca", "como comecar", "primeiro passo", "como contratar", "contratar"],
      resposta: "São quatro passos: 1) uma conversa sobre o que toma o seu tempo; 2) a proposta, com prazo e valor; 3) a construção, com você testando e pedindo ajustes; 4) a entrega, com treinamento e acompanhamento.",
      acoes: [{ tipo: "secao", rotulo: "Ver os 4 passos", alvo: "#como" }],
      sugestoes: ["Quanto custa?", "Quanto tempo leva?", "Falar no WhatsApp"],
    },
    {
      id: "leigo",
      termos: ["entender de tecnologia", "nao entendo", "leigo", "dificil", "complicado", "programar", "saber programar", "sou ruim com tecnologia", "facil de usar", "minha equipe consegue usar"],
      resposta: "Não precisa entender de tecnologia. Você explica o problema do seu jeito e nós cuidamos da parte técnica. No fim, ensinamos a sua equipe a usar.",
      sugestoes: ["Como funciona?", "E depois da entrega?"],
    },
    {
      id: "dados",
      termos: ["dados", "lgpd", "seguranca", "seguro", "privacidade", "sigilo", "confidencial", "vazar", "protecao de dados", "dados dos clientes"],
      resposta: "Os dados são usados só no seu projeto, com acesso restrito e respeitando a LGPD. Na proposta, explicamos quais ferramentas acessam os dados. Sempre que possível, a solução fica em contas da própria empresa.",
      sugestoes: ["Quais IAs vocês usam?", "Como funciona?"],
    },
    {
      id: "onde",
      termos: ["onde", "onde ficam", "cidade", "endereco", "atendem em", "atende em", "voces atendem", "atendem fora", "atendem no", "atendem na", "brasil", "presencial", "pessoalmente", "online", "remoto", "distancia", "outra cidade", "meu estado", "estado"],
      resposta: "O atendimento é online, por videochamada e WhatsApp, para qualquer cidade do Brasil.",
      sugestoes: ["Como funciona?", "Falar no WhatsApp"],
    },
    {
      id: "horario",
      termos: ["horario de atendimento", "que horas", "horario", "funcionam", "abre", "fecha", "fim de semana", "sabado", "domingo"],
      resposta: "O contato é pelo WhatsApp. Mande a sua mensagem quando quiser, e a equipe responde assim que possível.",
      acoes: [{ tipo: "whats", rotulo: "Abrir o WhatsApp" }],
    },
    {
      id: "suporte",
      termos: ["depois da entrega", "suporte", "manutencao", "ajuste", "ajustes", "treinamento", "treinar", "ensinar", "acompanhamento", "atualizacao", "se der problema", "quebrar"],
      resposta: "Depois da entrega, ensinamos a usar e acompanhamos por um período combinado na proposta, fazendo os ajustes necessários. Manutenção e melhorias contínuas podem ser combinadas à parte.",
      sugestoes: ["Tem mensalidade?", "Garantia"],
    },
    {
      id: "integracao",
      termos: ["integra", "integracao", "integrar", "conectar", "conecta", "sistema que ja uso", "o que ja uso", "api", "google planilhas", "google sheets", "gmail", "google agenda", "ferramentas", "meu sistema", "ja tenho um sistema"],
      resposta: "Na maioria dos casos, sim. Conectamos com WhatsApp, Google Planilhas, Excel, Gmail, Google Agenda, Power BI e outros sistemas que permitam integração. Na conversa inicial, verificamos o que a sua ferramenta permite.",
      sugestoes: ["Quanto custa?", "Como funciona?"],
    },
    {
      id: "modelos_ia",
      termos: ["chatgpt", "gpt", "openai", "claude", "gemini", "copilot", "qual ia", "quais ias", "que ia", "modelo de ia", "inteligencia artificial", "llm", "usam ia"],
      resposta: "Usamos modelos de IA de mercado, escolhidos para cada caso, e conectamos às ferramentas que a sua empresa já usa. O que importa é o resultado no dia a dia, não a ferramenta.",
      sugestoes: ["E os dados?", "O que vocês fazem?"],
    },
    {
      id: "empregos",
      termos: ["substituir", "substitui", "demitir", "demissao", "funcionarios", "funcionario", "emprego", "empregos", "tirar o trabalho", "perder o emprego", "equipe vai perder"],
      resposta: "A ideia não é substituir pessoas. É tirar o trabalho repetitivo das mãos da equipe, para ela ter tempo para o que exige atenção humana: atender bem, decidir e vender.",
      sugestoes: ["Exemplos de automação", "Calculadora de tempo"],
    },
    {
      id: "garantia",
      termos: ["garantia", "funciona mesmo", "da certo", "risco", "testar antes", "teste gratis", "gratis", "gratuito", "nao gostar", "e se nao funcionar"],
      resposta: "Você testa e pede ajustes durante a construção, antes de a solução entrar em uso. Projetos maiores são entregues em etapas, para validar cada parte. A conversa inicial e a proposta não têm compromisso.",
      sugestoes: ["Como funciona?", "Quanto custa?"],
    },
    {
      id: "tamanho",
      termos: ["pequena empresa", "pequeno negocio", "mei", "autonomo", "sozinho", "so eu", "micro empresa", "microempresa", "empresa grande", "grande empresa", "porte"],
      resposta: "Atendemos de profissionais autônomos a empresas maiores. A solução é do tamanho do problema, então também cabe em negócios pequenos.",
      sugestoes: ["Quanto custa?", "Exemplos de automação"],
    },
    {
      id: "portfolio",
      termos: ["portfolio", "exemplo", "exemplos", "cases", "case", "clientes", "ja fizeram", "projetos", "projeto entregue", "trabalhos"],
      resposta: "Um projeto entregue recente é o site de um escritório de advocacia. As demonstrações do site também mostram o tipo de solução que construímos.",
      acoes: [{ tipo: "secao", rotulo: "Ver o projeto", alvo: "#projeto" }, { tipo: "secao", rotulo: "Ver demonstrações", alvo: "#demos" }],
    },
    {
      id: "contato",
      termos: ["whatsapp", "zap", "wpp", "contato", "falar com alguem", "falar com uma pessoa", "conversar", "telefone", "ligar", "humano", "atendente", "falar no whatsapp", "falar com a equipe"],
      resposta: "Claro! O botão abaixo abre o WhatsApp da Atalho IA.",
      acoes: [{ tipo: "whats", rotulo: "Abrir o WhatsApp" }],
    },
    {
      id: "instagram",
      termos: ["instagram", "insta", "redes sociais", "rede social", "seguir"],
      resposta: "No Instagram, a Atalho IA está como @atalho._ia, com dicas de atalhos com IA para empresas.",
    },
    {
      id: "calculadora",
      termos: ["calculadora", "calcular", "quantas horas", "economia", "economizar", "quanto tempo perco", "calculadora de tempo"],
      resposta: "A calculadora mostra quantas horas por mês uma tarefa repetitiva custa para a sua equipe. Também dá para me contar aqui, por exemplo: \"2 horas por dia, 3 pessoas\".",
      acoes: [{ tipo: "secao", rotulo: "Ir para a calculadora", alvo: "#calculadora" }],
    },
    {
      id: "mapa",
      termos: ["mapa", "mapa do atalho", "como funciona o mapa", "o mapa", "desenhar", "fluxo da tarefa", "passo a passo da minha tarefa", "processo da minha empresa", "mapear", "meu processo", "baixar imagem"],
      resposta: "No mapa do atalho, você lista os passos de uma tarefa da sua empresa. O site desenha o caminho longo e mostra quais passos a IA pode assumir. Dá para baixar a imagem ou mandar o mapa no WhatsApp.",
      acoes: [{ tipo: "secao", rotulo: "Abrir o mapa", alvo: "#mapa" }],
      sugestoes: ["Calculadora de tempo", "Como funciona?"],
    },
    {
      id: "tour", conversa: true,
      termos: ["tour", "mostrar o site", "navegar", "guia", "me mostra", "apresentar o site", "fazer um tour", "conhecer o site"],
      resposta: "Que tal um tour rápido pelo site? Leva 30 segundos.",
      acoes: [{ tipo: "tour", rotulo: "Começar o tour" }],
    },
    {
      id: "atalhos_teclado", conversa: true,
      termos: ["atalhos do teclado", "teclado", "teclas", "atalho de teclado", "atalhos do site"],
      resposta: "O site tem atalhos de teclado: aperte ? para ver a lista. As teclas de 1 a 6 levam às seções e G começa o tour.",
    },
    {
      id: "agradecimento", conversa: true,
      termos: ["obrigado", "obrigada", "valeu", "vlw", "show", "legal", "otimo", "perfeito", "massa", "top", "gostei"],
      resposta: "Por nada! Se surgir outra dúvida, é só chamar.",
      sugestoes: ["Falar no WhatsApp", "Fazer um tour pelo site"],
    },
    {
      id: "despedida", conversa: true,
      termos: ["tchau", "ate mais", "ate logo", "falou", "flw", "adeus"],
      resposta: "Até mais! Quando quiser pegar um atalho, a gente está por aqui.",
    },
    /* setores */
    { id: "setor_juridico", setor: true, termos: ["juridico", "advogado", "advogados", "advocacia", "escritorio de advocacia", "oab", "processos", "setor juridico"], resposta: "No jurídico: triagem de documentos, primeiro atendimento e painel de prazos. Também já entregamos um site para um escritório de advocacia.", acoes: [{ tipo: "secao", rotulo: "Ver o projeto", alvo: "#projeto" }] },
    { id: "setor_contabil", setor: true, termos: ["contabilidade", "contador", "contadores", "contabil", "escritorio contabil", "fiscal", "imposto"], resposta: "Na contabilidade: documentos dos clientes organizados automaticamente e relatórios que se montam sozinhos." },
    { id: "setor_agro", setor: true, termos: ["agro", "agronegocio", "fazenda", "fazendas", "usina", "usinas", "safra", "trator", "maquinas", "colheita", "rural", "cana", "gado"], resposta: "No agro e em usinas: controle de máquinas e manutenção, relatórios de safra e resumo de laudos e normas." },
    { id: "setor_comercio", setor: true, termos: ["loja", "lojas", "comercio", "varejo", "vendas", "catalogo", "produtos", "mercado", "ecommerce", "revenda"], resposta: "No comércio: atendimento no WhatsApp, descrições do catálogo e relatórios de vendas." },
    { id: "setor_saude", setor: true, termos: ["saude", "clinica", "clinicas", "consultorio", "medico", "medica", "dentista", "odontologia", "fisioterapia", "psicologo", "pacientes", "setor saude", "estetica"], resposta: "Na saúde: confirmação de consultas, lembretes automáticos e menos faltas. O primeiro atendimento também pode ser automatizado." },
    { id: "setor_educacao", setor: true, termos: ["escola", "escolas", "educacao", "aluno", "alunos", "curso", "cursos", "professor", "faculdade", "pais de alunos"], resposta: "Na educação: comunicação com alunos e famílias e materiais organizados." },
    { id: "setor_marketing", setor: true, termos: ["marketing", "agencia", "anuncio", "anuncios", "campanha", "setor marketing", "trafego"], resposta: "No marketing: textos no tom da marca e relatórios de resultado prontos para o cliente." },
    { id: "setor_servicos", setor: true, termos: ["prestador de servico", "prestadores", "salao", "barbearia", "oficina", "academia", "pet shop", "manutencao residencial", "orcamentos"], resposta: "Para prestadores de serviço: agendamento, lembrete na véspera e orçamentos mais rápidos." },
  ];

  /* ---------- Processamento de texto ---------- */
  const PARADAS = new Set("a o as os de da do das dos e em no na nos nas um uma uns umas para pra pro por com que se eu vc vcs voce voces me mim meu minha meus minhas ser sou somos tem ter tenho temos isso esse essa isto ao aos la aqui ai entao ja mais muito tambem ou mas sim nao the gostaria queria quero preciso precisamos saber pode podem posso consegue conseguem tipo assim ta to estou esta sobre algo alguma algum fazer serve qual quais nosso nossa dele dela ele ela".split(" "));
  // palavras que ficam mesmo sendo comuns, porque mudam o sentido
  const MANTER = new Set(["quanto", "quem", "onde", "como", "nao"]);

  const normalizar = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9%\s]/g, " ").replace(/\s+/g, " ").trim();

  function radical(p) {
    if (p.length > 4 && p.endsWith("s")) p = p.slice(0, -1);
    if (p.length > 6 && /(mente|cao|coes|ando|endo|indo|ado|ido)$/.test(p)) p = p.replace(/(mente|cao|coes|ando|endo|indo|ado|ido)$/, "");
    return p.length > 6 ? p.slice(0, 6) : p;
  }
  function palavras(texto, manterParadas) {
    return normalizar(texto).split(" ").filter((p) => p && (manterParadas || !PARADAS.has(p) || MANTER.has(p)));
  }
  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        // letras trocadas de lugar ("clinca" → "clinica") contam como um erro só
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[a.length][b.length];
  }

  // vocabulário de cada assunto (radicais) e expressões inteiras
  BASE.forEach((it) => {
    it._radicais = new Set();
    it._inteiras = new Map(); // palavra inteira → radical (para erros de digitação)
    it._frases = [];
    it.termos.forEach((t) => {
      const n = normalizar(t);
      if (n.includes(" ")) it._frases.push(n);
      // o vocabulário ignora palavras comuns; as expressões inteiras contam à parte
      palavras(t).forEach((p) => { it._radicais.add(radical(p)); it._inteiras.set(p, radical(p)); });
    });
  });
  // IDF: radical presente em poucos assuntos vale mais
  const df = new Map();
  BASE.forEach((it) => it._radicais.forEach((r) => df.set(r, (df.get(r) || 0) + 1)));
  const idf = (r) => Math.log(1 + BASE.length / (df.get(r) || BASE.length));

  function semelhanca(q, r) {
    if (q === r) return 1;
    if (q.length >= 4 && r.length >= 4 && (q.startsWith(r) || r.startsWith(q))) return 0.85;
    return 0;
  }

  function pontuar(texto) {
    const norm = " " + normalizar(texto) + " ";
    const ditas = [...new Set(palavras(texto))];
    return BASE.map((it) => {
      let p = 0;
      ditas.forEach((w) => {
        const q = radical(w);
        let melhor = 0, rMelhor = null;
        it._radicais.forEach((r) => {
          const s = semelhanca(q, r);
          if (s > melhor) { melhor = s; rMelhor = r; }
        });
        // erro de digitação: compara a palavra inteira e vale menos que um acerto
        if (!melhor && w.length >= 4) {
          it._inteiras.forEach((r, inteira) => {
            if (!melhor && inteira.length >= 4 && distancia(w, inteira) <= 1) { melhor = 0.5; rMelhor = r; }
          });
        }
        if (melhor) p += melhor * idf(rMelhor);
      });
      it._frases.forEach((f) => { if (norm.includes(" " + f + " ")) p += 1.6 + f.split(" ").length * 0.3; });
      // quando a pessoa cita o próprio setor, ele é o assunto principal
      if (it.setor) p *= 1.35;
      return { it, p };
    }).sort((a, b) => b.p - a.p);
  }

  /* ---------- Contas com números da frase ---------- */
  function lerNumero(s) { return parseFloat(String(s).replace(",", ".")); }
  function extrairTempo(texto) {
    const t = normalizar(texto).replace(/(\d)\s*h\b/g, "$1 horas").replace(/meia hora/g, "30 min");
    let minutos = 0;
    const h = t.match(/(\d+(?:[.,]\d+)?)\s*(hora|horas|hr|hrs)\b/);
    const m = t.match(/(\d+(?:[.,]\d+)?)\s*(min|mins|minuto|minutos)\b/);
    if (h) minutos += lerNumero(h[1]) * 60;
    if (m) minutos += lerNumero(m[1]);
    if (!minutos) return null;
    let periodo = "dia";
    if (/por semana|na semana|semanal|semanais/.test(t)) periodo = "semana";
    else if (/por mes|no mes|mensal|mensais/.test(t)) periodo = "mes";
    const pes = t.match(/(\d+)\s*(pessoa|pessoas|funcionario|funcionarios|colaborador|colaboradores|atendente|atendentes|gente|pessoal)/);
    const pessoas = pes ? Math.max(1, parseInt(pes[1], 10)) : 1;
    let porMes = minutos;
    if (periodo === "dia") porMes = minutos * DIAS_UTEIS;
    else if (periodo === "semana") porMes = minutos * (DIAS_UTEIS / 5);
    const horas = (porMes * pessoas) / 60;
    return { minutos, periodo, pessoas, horas };
  }
  const fmt = (n, c = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c });

  /* ---------- Contexto da conversa ---------- */
  const ctx = { ultimo: null, ultimasAcoes: null };
  const SIM = /^(sim|s|quero|pode|pode ser|bora|claro|ok|okay|beleza|blz|vamos|manda|isso|com certeza|uhum|aham)$/;
  const NAO = /^(nao|n|agora nao|depois|nao obrigado|nao obrigada|deixa)$/;
  const MAIS = /(explica melhor|como assim|mais detalhes|detalha|entendi nao|nao entendi|explique|fala mais|me explica)/;

  function montar(it) {
    return {
      id: it.id,
      texto: it.resposta,
      acoes: it.acoes || [],
      sugestoes: it.sugestoes || [],
    };
  }

  function responder(texto) {
    const n = normalizar(texto);
    if (!n) return { texto: "Pode escrever a sua pergunta. Por exemplo: \"quanto custa?\" ou \"tenho uma clínica\".", acoes: [], sugestoes: ["O que vocês fazem?", "Quanto custa?"] };

    // respostas curtas que dependem do que foi dito antes
    if (SIM.test(n) && ctx.ultimasAcoes && ctx.ultimasAcoes.length) {
      const a = ctx.ultimasAcoes[0];
      ctx.ultimasAcoes = null;
      return { texto: "Combinado!", acoes: [], sugestoes: [], executar: a };
    }
    if (NAO.test(n)) { ctx.ultimasAcoes = null; return { texto: "Tudo bem! Mais alguma dúvida?", acoes: [], sugestoes: ["O que vocês fazem?", "Falar no WhatsApp"] }; }
    if (MAIS.test(n) && ctx.ultimo) {
      const it = BASE.find((x) => x.id === ctx.ultimo);
      if (it) return { texto: it.detalhe || it.resposta + " Se quiser, a equipe explica com exemplos do seu caso no WhatsApp.", acoes: it.detalhe ? it.acoes || [] : [{ tipo: "whats", rotulo: "Conversar no WhatsApp" }], sugestoes: it.sugestoes || [] };
    }

    // contas: "gasto 2 horas por dia respondendo clientes, somos 3"
    const tempo = extrairTempo(texto);
    if (tempo && tempo.horas >= 1) {
      const dias = tempo.horas / 8;
      const desc = tempo.pessoas > 1 ? " (" + tempo.pessoas + " pessoas)" : "";
      const r = {
        texto: "Fazendo a conta: isso dá cerca de " + fmt(tempo.horas) + " horas por mês" + desc + ", ou " + fmt(dias, dias < 10 ? 1 : 0) + " dias inteiros de trabalho, todo mês, nessa tarefa. É exatamente o tipo de caminho longo que dá para encurtar.",
        acoes: [
          { tipo: "whats", rotulo: "Encurtar esse caminho", mensagem: "Olá! Vim pelo site da Atalho IA. Hoje gastamos cerca de " + fmt(tempo.horas) + " horas por mês em uma tarefa repetitiva: \"" + texto.trim() + "\". Quero ver como encurtar." },
          { tipo: "secao", rotulo: "Abrir a calculadora", alvo: "#calculadora" },
        ],
        sugestoes: ["Quanto custa?", "Como funciona?"],
      };
      ctx.ultimo = "calculadora";
      ctx.ultimasAcoes = r.acoes;
      return r;
    }

    const ranking = pontuar(texto);
    const [primeiro, segundo] = ranking;
    const LIMIAR = 0.9;

    // "e para escola?" — curto e começando com "e", herda o assunto
    if (primeiro.p < LIMIAR) {
      const vizinhos = ranking.filter((x) => x.p > 0.35).slice(0, 2).map((x) => x.it);
      ctx.ultimasAcoes = [{ tipo: "whats", rotulo: "Perguntar no WhatsApp", mensagem: "Olá! Vim pelo site da Atalho IA e tenho uma pergunta: " + texto.trim() }];
      return {
        texto: "Essa é melhor responder numa conversa com a nossa equipe. Quer enviar a sua pergunta pelo WhatsApp?" + (vizinhos.length ? " Ou talvez ajude ver:" : ""),
        acoes: ctx.ultimasAcoes,
        sugestoes: vizinhos.length ? vizinhos.map((v) => v.termos.find((t) => t.length > 3) || v.termos[0]).map((t) => t.charAt(0).toUpperCase() + t.slice(1)) : ["O que vocês fazem?", "Quanto custa?"],
        naoEntendeu: true,
      };
    }

    let r = montar(primeiro.it);
    // duas perguntas na mesma frase ("quanto custa e quanto tempo leva?")
    const segundoForte = segundo && segundo.p >= 2.5 && segundo.p >= primeiro.p * 0.45;
    if (segundo && (segundoForte || (segundo.p >= LIMIAR && segundo.p >= primeiro.p * 0.7)) && !primeiro.it.conversa && !segundo.it.conversa && segundo.it.id !== primeiro.it.id) {
      const b = montar(segundo.it);
      r = {
        id: r.id,
        texto: r.texto + "\n\n" + b.texto,
        acoes: [...r.acoes, ...b.acoes].filter((a, i, arr) => arr.findIndex((x) => x.rotulo === a.rotulo) === i).slice(0, 2),
        sugestoes: [...new Set([...r.sugestoes, ...b.sugestoes])].slice(0, 3),
      };
    }
    // setor + pedido: completa com um convite
    if (primeiro.it.setor && !r.acoes.length) {
      r.acoes = [{ tipo: "whats", rotulo: "Conversar sobre o meu setor", mensagem: "Olá! Vim pelo site da Atalho IA e quero conversar sobre soluções para o meu negócio: " + texto.trim() }];
      r.sugestoes = ["Quanto custa?", "Como funciona?"];
    }
    // não sugere de novo o que acabou de ser respondido
    const respondidos = new Set([primeiro.it.id, segundo && segundo.it.id]);
    r.sugestoes = (r.sugestoes || []).filter((s) => !respondidos.has(pontuar(s)[0].it.id));
    ctx.ultimo = r.id;
    ctx.ultimasAcoes = r.acoes.length ? r.acoes : null;
    return r;
  }

  raiz.TecCerebro = { responder, _pontuar: pontuar, _extrairTempo: extrairTempo, _base: BASE };
})(typeof window !== "undefined" ? window : globalThis);
