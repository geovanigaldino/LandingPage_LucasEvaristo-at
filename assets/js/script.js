const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLKSKGkwDkaHOy8iugSvFLUsPhtKsHQo0EioisY_KBS88Ku065M3wet6mH4gA-g6LsmQYSwwURjS5q/pub?output=tsv';

// Group array of objects by a key
function groupBy(array, key) {
  return array.reduce((acc, obj) => {
    let group = obj[key] ? obj[key].trim() : 'Sem Categoria';
    if (!acc[group]) acc[group] = [];
    acc[group].push(obj);
    return acc;
  }, {});
}

async function fetchMaterials() {
  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) throw new Error('Failed to fetch sheet data');
    const tsv = await response.text();

    const lines = tsv.trim().split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());

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
    console.error(err);
    return [];
  }
}

function renderMaterials(materials) {
  const container = document.getElementById('materiais-container');
  container.innerHTML = '';

  if (!materials.length) {
    container.innerHTML = '<p>Nenhum material disponível no momento.</p>';
    return;
  }

  // Group materials by Category
  const groups = groupBy(materials, 'Category');

  for (const category in groups) {
    const section = document.createElement('section');
    section.classList.add('materiais-content');

    // Category title
    const heading = document.createElement('h4');
    heading.textContent = category;
    section.appendChild(heading);

    // List container
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
      if (item.Link) a.setAttribute('download', '');

      li.appendChild(textDiv);
      li.appendChild(a);

      list.appendChild(li);
    });

    section.appendChild(list);
    container.appendChild(section);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const materials = await fetchMaterials();
  renderMaterials(materials);
});
