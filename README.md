# Feito em Forma — site pronto para GitHub Pages

Este pacote contém a versão atual do catálogo: 16 produtos, preços, medidas, desconto da bolinha personalizada a partir de 5 unidades e botão de interesse que abre o WhatsApp Business com a mensagem preenchida.

## Publicar pelo navegador, sem instalar programas

1. Extraia este ZIP no computador (no Windows, clique com o botão direito e escolha “Extrair tudo”).
2. Acesse https://github.com e entre na sua conta.
3. Clique em + > New repository. Use o nome feito-em-forma, escolha Public e marque Add a README file para iniciar a branch main. Clique em Create repository.
4. No repositório, clique em Add file > Upload files.
5. Abra a pasta extraída e arraste os ARQUIVOS para a página de upload. O index.html deve ficar diretamente na raiz do repositório, junto de style.css, app.js, logo.jpg e das 16 imagens produto-01.jpeg até produto-16.jpeg. Não envie apenas o ZIP nem coloque uma pasta extra envolvendo os arquivos.
6. Clique em Commit changes para salvar os arquivos na branch main.
7. Abra Settings > Pages.
8. Em Build and deployment > Source, selecione Deploy from a branch.
9. Em Branch, selecione main e /(root). Clique em Save.
10. Aguarde a publicação. A página Settings > Pages mostrará o endereço e o botão Visit site. O endereço terá o formato https://SEU-USUARIO.github.io/feito-em-forma/ (troque SEU-USUARIO pelo seu usuário real).

Se os nomes dos menus estiverem em português, Settings corresponde a Configurações e Pages a Páginas.

## Arquivos

- index.html: página, produtos, textos, preços e medidas.
- style.css: cores, tamanhos e organização visual.
- app.js: quantidades, desconto, ampliação das fotos e mensagem do WhatsApp.
- logo.jpg: símbolo da marca.
- produto-01.jpeg a produto-16.jpeg: imagens na ordem do catálogo.
- .nojekyll: indica publicação estática sem processamento Jekyll.

Não é necessário instalar Node, executar comandos ou compilar o site. Os caminhos das imagens são relativos e funcionam no endereço do repositório.

## WhatsApp

O destino configurado é +55 11 95810-7686, identificado pelo link Business informado. O botão abre a conversa com produto, quantidade, preço e subtotal preenchidos; o cliente confirma o envio. Se trocar de número, atualize a URL wa.me no app.js.

## Atualizações

Para alterar o site, envie os arquivos atualizados no mesmo repositório e confirme em Commit changes. O GitHub Pages republica o conteúdo. As alterações feitas em outra hospedagem não são sincronizadas automaticamente com este repositório.

Preços e medidas ficam nos cartões do index.html. Ao mudar preços, ajuste tanto o atributo data-price quanto o preço e subtotal visíveis. A regra promocional do produto 14 está na função unitPrice do app.js. Medidas não fornecidas estão como “A confirmar”; 8 cm está associado à rena.

## Caso apareça erro 404 ou faltem imagens

Confira se index.html está na raiz, se a configuração é main / (root), se todos os arquivos foram enviados e se os nomes foram preservados. Acompanhe a publicação na aba Actions e atualize a página depois de concluída.

Documentação oficial:
https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Encomendas personalizadas
A seção Da ideia à peça permite descrever uma ideia, informar tamanho e quantidade e abrir o WhatsApp com esses dados preenchidos. Fotos e referências podem ser enviadas pelo cliente na conversa.

## Galeria de encomendas
O submenu Encomendas > Encomendas realizadas abre encomendas.html, com cinco fotos públicas selecionadas do Instagram. Inclua gallery.js e encomenda-01.jpg até encomenda-05.jpg ao atualizar o repositório. As legendas completas exigiram login; as descrições da galeria são visuais, sem informações não confirmadas sobre clientes ou entregas.
