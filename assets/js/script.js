// script.js — Carrega e renderiza materiais a partir de uma planilha pública do Google Sheets.
// Estrutura do arquivo:
// - `sheetUrl`: URL pública da planilha (exportada como TSV)
// - `groupBy()`: agrupa um array de objetos por uma chave (ex.: Category)
// - `fetchMaterials()`: busca o TSV, converte em array de objetos
// - `renderMaterials()`: cria elementos DOM para mostrar os materiais
// - Inicialização no `DOMContentLoaded` que dispara o carregamento
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLKSKGkwDkaHOy8iugSvFLUsPhtKsHQo0EioisY_KBS88Ku065M3wet6mH4gA-g6LsmQYSwwURjS5q/pub?output=tsv';

// Group array of objects by a key
// Agrupa um array de objetos por uma chave específica.
// Ex.: groupBy(materials, 'Category') → { 'Vídeo': [...], 'Texto': [...] }
function groupBy(array, key) {
  return array.reduce((acc, obj) => {
    // Usa 'Sem Categoria' quando a chave estiver vazia
    let group = obj[key] ? obj[key].trim() : 'Sem Categoria';
    if (!acc[group]) acc[group] = [];
    acc[group].push(obj);
    return acc;
  }, {});
}

// Busca os dados da planilha (TSV) e converte para um array de objetos.
// Assumimos que a primeira linha contém os cabeçalhos separados por tab (`\t`).
async function fetchMaterials() {
  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) throw new Error('Failed to fetch sheet data');
    const tsv = await response.text();

    // Divide em linhas e extrai cabeçalhos
    const lines = tsv.trim().split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());

    // Converte cada linha em um objeto mapeando colunas para cabeçalhos
    const data = lines.slice(1).map(line => {
      const cols = line.split('\t');
      let obj = {};
      headers.forEach((header, idx) => {
        obj[header] = cols[idx] ? cols[idx].trim() : '';
      });
      return obj;
    });

    return data;
  } catch (err) {
    // Em caso de erro, loga e retorna lista vazia para não travar a UI
    console.error(err);
    return [];
  }
}

// Recebe um array de materiais e monta o HTML para exibição.
// Os materiais são agrupados por `Category` antes de renderizar.
function renderMaterials(materials) {
  const container = document.getElementById('materiais-container');
  container.innerHTML = '';

  if (!materials.length) {
    container.innerHTML = '<p>Nenhum material disponível no momento.</p>';
    return;
  }

  // Agrupa por Category (campo da planilha)
  const groups = groupBy(materials, 'Category');

  for (const category in groups) {
    const section = document.createElement('section');
    section.classList.add('materiais-content');

    // Título da categoria
    const heading = document.createElement('h4');
    heading.textContent = category;
    section.appendChild(heading);

    // Lista de materiais daquela categoria
    const list = document.createElement('ul');
    list.classList.add('material-list');

    groups[category].forEach(item => {
      const li = document.createElement('li');
      li.classList.add('material-item');

      const textDiv = document.createElement('div');

      const title = document.createElement('div');
      title.classList.add('material-title');
      title.textContent = item.Title || '(Sem título)';

      const desc = document.createElement('div');
      desc.classList.add('material-desc');
      desc.textContent = item.Description || '';

      textDiv.appendChild(title);
      textDiv.appendChild(desc);

      const a = document.createElement('a');
      a.classList.add('download-btn');
      a.href = item.Link || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', `Baixar ${item.Title || 'material'}`);
      a.textContent = 'Baixar';
      // Se houver link, sugere download (navegador pode ignorar dependendo do host)
      if (item.Link) a.setAttribute('download', '');

      li.appendChild(textDiv);
      li.appendChild(a);

      list.appendChild(li);
    });

    section.appendChild(list);
    container.appendChild(section);
  }
}

// Inicialização: ao carregar o DOM, busca os materiais e renderiza
window.addEventListener('DOMContentLoaded', async () => {
  const materials = await fetchMaterials();
  renderMaterials(materials);
});
