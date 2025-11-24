# PASTA NOVA 100% FUNCIONAL

Visão geral do projeto estático criado para apresentar conteúdo, gráficos (Chart.js) e um formulário do Google embutido na página de comentários.

**Arquivos principais**
- `index.html` — estrutura da página e embed do Google Forms.
- `styles.css` — estilos modernos, responsivos e variantes de glassmorphism.
- `app.js` — JavaScript: navegação por seções, acordeões (subtópicos) e inicialização dos gráficos.
- `data/urban.csv`, `data/agriculture.csv` — dados CSV usados pelos gráficos (carregados via `fetch`).

**Tecnologias utilizadas**
- HTML5 — marcação semântica para seções, artigos e cabeçalhos.
- CSS3 — layout responsivo com Grid e Flexbox, variáveis CSS, transições e efeitos de glassmorphism.
- JavaScript (ES6+) — lógica de navegação, acordeões acessíveis, parsing de CSV e inicialização dos gráficos.
- Chart.js (incluído via CDN) — geração dos gráficos de linha para as projeções.
- Fetch API — carregamento assíncrono dos arquivos CSV em `data/`.
- Google Forms — formulário embutido via iframe na seção de comentários.
- Acessibilidade (ARIA, suporte a teclado) — acordeões e controles interativos preparados para navegação por teclado e leitores de tela.
- Fontes: `Inter` (configurada no CSS quando disponível) — tipografia moderna e legível.
- Git — controle de versão local (push para GitHub opcional).
- Servidor local leve (recomendado para testes) — `python -m http.server` ou `npx http-server` para servir os arquivos e permitir o `fetch` dos CSVs.


**Como rodar localmente (recomendado)**
Os CSVs são buscados via `fetch`, portanto é necessário servir os arquivos por HTTP — abrir diretamente `file://` não funcionará.

No PowerShell (Python 3 instalado):
```powershell
Set-Location 'C:\Users\User\Desktop\PASTA NOVA 100% FUNCIONAL'
python -m http.server 8000
```

Ou, se preferir Node (npx):
```powershell
Set-Location 'C:\Users\User\Desktop\PASTA NOVA 100% FUNCIONAL'
npx http-server . -p 8000
```

Depois, abra `http://localhost:8000` no navegador e navegue até a seção **Projeções** para ver os gráficos.

**Como publicar no GitHub**
1) Crie um repositório vazio no GitHub.
2) No PowerShell, adicione o remoto e envie:
```powershell
Set-Location 'C:\Users\User\Desktop\PASTA NOVA 100% FUNCIONAL'
git remote add origin https://github.com/<seu-usuario>/<seu-repo>.git
git branch -M main
git push -u origin main
```

Alternativa usando `gh` (GitHub CLI) para criar e enviar automaticamente:
```powershell
Set-Location 'C:\Users\User\Desktop\PASTA NOVA 100% FUNCIONAL'
gh repo create <seu-usuario>/<seu-repo> --public --source . --remote origin --push
```

Substitua `<seu-usuario>` e `<seu-repo>` pelos valores reais antes de executar.

**Notas importantes**
- Se os gráficos não aparecerem, verifique o console do navegador para erros de `fetch` (caminho dos CSVs ou servidor HTTP).
- O comportamento dos gráficos foi ajustado para evitar problemas de redimensionamento; caso veja crescimento inesperado, abra a seção novamente após recarregar a página.
- Acessibilidade: acordeões têm suporte a teclado e atributos ARIA.

Se quiser, posso: criar o repositório remoto para você (necessita autenticação `gh` ou token), ou abrir um PR com alterações adicionais.

---
Gerado a pedido — ajuste ou adicione mais detalhes se precisar.
