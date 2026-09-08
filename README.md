# Ouroville Motors Showroom

Crie um novo projeto com Supabase ativado. Não use o lovable cloud. Não exceda 9 créditos no projeto ao todo.

Aja como um desenvolvedor full-stack sênior especializado em sites institucionais e e-commerce automotivo. Quero que você construa o site completo de uma concessionária de veículos, seguindo exatamente as instruções abaixo. Estou anexando duas imagens de referência visual para o home, e uma imagem para a página de estoque — use-as como inspiração para o layout, espaçamento e estilo geral do site, adaptando o conteúdo especificamente para uma concessionária de carros.

Também estou anexando a logo da concessionária.

IMPORTANTE — Backend (leia antes de tudo)

Não use o Lovable Cloud. Já criei minha própria conta e projeto no Supabase (supabase.com), e vou fornecer abaixo a URL do projeto e a chave anônima (anon key). Conecte este projeto Lovable diretamente ao meu Supabase próprio (Settings → Connectors → Supabase), e não ao backend gerenciado automaticamente pelo Lovable. Isso é importante porque quero ter acesso direto ao dashboard, às chaves e aos dados do meu banco, sem depender dos créditos do Lovable para rodar o backend.

URL do projeto Supabase: https://xjokgcsozlqiqjfnzxle.supabase.co

Chave anônima (anon key) do Supabase: sb_publishable_c50RR1HGqK3NSgAC_x85bA_AWtnc9Lc

Se por algum motivo o projeto já tiver sido iniciado com o Lovable Cloud ativado, me avise antes de prosseguir para que eu possa desativá-lo (Cloud → Overview → Advanced settings → Remove Lovable Cloud) antes de conectarmos o Supabase próprio.

Informações da concessionária

Nome da concessionária: Ouroville Motors

WhatsApp (com DDD): (34) 9 9829-0394

E-mail de contato: não informado

Endereço/localização completa: Avenida João Pinheiro, 3488 - Uberlândia - MG

Paleta de cores principal do site: fundo dark, com detalhes em ouro e branco

Horário de funcionamento: Segunda à sábado das 08:00 às 18:00

Use essas informações de forma consistente em todo o site (header, footer, página "Sobre", botões de contato).

Header (menu superior, fixo no topo)

Estrutura, da esquerda para a direita:

Logo/nome da concessionária.

Botão de navegação "Estoque" → leva para a página principal com a listagem de carros.

Botão de navegação "Sobre" → leva para uma página com contato, localização (com mapa incorporado) e história/valores da concessionária.

Botão de navegação "Financie" → leva para uma página simples explicando como funciona o financiamento, com uma chamada para o cliente ligar ou mandar mensagem para tirar dúvidas.

No canto direito: exiba o número de telefone da concessionária ao lado de um ícone/botão do WhatsApp, sendo os dois elementos um único botão clicável (ao clicar, abre uma conversa no WhatsApp já com o número correto).

O header deve ser responsivo, virando um menu hambúrguer em telas de celular, mas mantendo o botão de WhatsApp sempre visível mesmo no mobile.

Hero (seção principal da home)

Crie um hero de destaque com uma frase de impacto sobre a concessionária e, dentro dele, um campo de busca inteligente onde o cliente digita livremente marca, modelo e/ou ano do carro que procura (ex: "corolla 2022", "civic branco", ou até com erro de digitação como "crorola").

Implemente essa busca como uma busca tolerante a erros de digitação (fuzzy search), comparando o texto digitado com os campos de marca e modelo da tabela de carros no banco (por exemplo, usando similaridade de texto/trigram no Postgres do Supabase), de forma que mesmo com erro de grafia o sistema retorne os carros mais prováveis. Ao buscar, mostre os resultados correspondentes diretamente abaixo do campo ou redirecione o cliente para a página de Estoque já filtrada pelo termo buscado.

Página de Estoque

Grid de cards de carros com foto principal, marca/modelo, ano, quilometragem e preço.

Filtros laterais ou superiores por marca, faixa de preço, ano, câmbio (manual/automático) e combustível.

Ao clicar em um carro, abrir uma página própria (não um modal) com URL amigável e única para cada carro, seguindo o padrão: /carros/marca/modelo/ano/id (ex: /carros/byd/dolphin-mini/2027/1075). Essa página deve ser gerada dinamicamente a partir dos dados do carro no banco (rota dinâmica), permitindo que:

A página seja indexada pelo Google (cada carro vira um resultado de busca separado).

Seja possível compartilhar o link daquele carro específico diretamente por WhatsApp ou redes sociais.

A página tenha meta título e meta descrição próprios, com marca/modelo/ano do carro.

Nessa página, exiba: galeria de fotos, ficha técnica completa, descrição, preço e um botão "Tenho interesse" que abre o WhatsApp com uma mensagem pré-preenchida mencionando o carro específico (marca, modelo e ano).

Carros marcados como "vendido" não devem aparecer para os visitantes, apenas no painel administrativo.

Página "Sobre"

Bloco com a história e valores da concessionária.

Endereço com mapa incorporado (Google Maps embed).

Horário de funcionamento.

Formulário de contato simples (nome, telefone, mensagem) com uma caixa de consentimento de uso dos dados (LGPD), que salva os envios em uma tabela de leads no banco.

Página "Financie"

Explicação simples e direta de como funciona o processo de financiamento.

Chamada clara para o cliente ligar ou mandar mensagem no WhatsApp para simular ou tirar dúvidas (reaproveitar o botão de WhatsApp do header).

Rodapé

Nome, endereço, telefone, e-mail e horário de funcionamento.

Links para redes sociais (deixe campos genéricos, vou preencher depois).

Link rápido de volta para as páginas do menu.

Aviso de direitos autorais com o ano atual.

Outros itens de um site profissional de concessionária

Inclua também, por boa prática:

Design totalmente responsivo (grande parte do tráfego virá do link do WhatsApp no celular).

Carregamento otimizado das imagens dos carros (lazy loading).

SEO básico: título, meta descrição e texto alternativo (alt text) nas imagens.

Seção de prova social: depoimentos de clientes e/ou selos de confiança (anos de mercado, quantidade de carros vendidos, parceiros de financiamento).

Estados de carregamento (skeleton/spinner) enquanto os carros são buscados no banco.

Bom contraste de cores e acessibilidade básica.

Backend, banco de dados e painel administrativo

Use o Supabase que já conectamos na seção 0 (meu projeto próprio, não o Lovable Cloud) para banco de dados, autenticação e armazenamento de imagens.

Crie uma tabela carros com: marca, modelo, ano, preço, quilometragem, combustível, câmbio, cor, fotos (múltiplas imagens), descrição, status (disponível/vendido) e data de cadastro.

Crie uma tabela leads para os contatos recebidos pelo formulário do site: nome, telefone, e-mail, carro de interesse, mensagem e data.

Crie um painel administrativo protegido por login (rota tipo /admin), acessível só para mim como administrador, onde eu possa:

Adicionar novos carros (com upload de fotos).

Editar informações e preços de carros existentes.

Marcar carros como vendidos ou removê-los do estoque.

Visualizar os leads recebidos pelo formulário de contato.

Configure Row Level Security (RLS) de forma que:

Qualquer visitante do site só possa ler os carros com status "disponível" (sem permissão de inserir, editar ou apagar nada).

Somente o usuário administrador autenticado possa inserir, editar ou remover carros, e visualizar a tabela de leads.

Garanta que nenhuma chave secreta (service role key) fique exposta no código do frontend — qualquer operação sensível deve passar por funções protegidas no backend (Edge Functions), nunca diretamente pelo navegador do cliente.

Ao finalizar

Me dê um resumo do que foi criado, quais tabelas e políticas de segurança foram configuradas, e liste claramente quaisquer passos manuais que eu ainda precise fazer (ex: conectar o Supabase, criar meu usuário administrador, configurar alguma variável de ambiente).

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
