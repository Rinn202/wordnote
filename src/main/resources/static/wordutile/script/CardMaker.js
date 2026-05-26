// ── 필터 코드 정의 ──────────────────────────────────────────
const CODES = [
  { key: 'IV',  label: 'IV',   color: 'iv',  match: m => m === 'IV' },
  { key: 'IVS', label: 'IVS',  color: 'iv',  match: m => m === 'IVS' },
  { key: 'IM',  label: 'IM',   color: 'im',  match: m => m === 'IM' },
  { key: 'SC',  label: 'SC',   color: 'sc',  match: m => m === 'SC' },
  { key: 'MIX', label: 'MIX',  color: 'mix', match: m => m === 'MIX' },
  { key: 'ZF',  label: 'ZF*',  color: 'zf',  match: m => m.startsWith('ZF') },
];

const active = new Set(CODES.map(c => c.key).filter(k => k !== 'SC' && k !== 'IM'));

let rawRows = [];
let filteredData = [];

// ── 토글 ────────────────────────────────────────────────────
function renderToggles() {
  document.getElementById('toggles').innerHTML = CODES.map(c => {
    const on = active.has(c.key);
    return `<button class="toggle-btn ${on ? 'on-' + c.color : ''}"
      onclick="toggleCode('${c.key}')">
      ${on ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      ${c.label}
    </button>`;
  }).join('');
}

function toggleCode(key) {
  active.has(key) ? active.delete(key) : active.add(key);
  renderToggles();
  if (rawRows.length) reFilter();
}

// ── 데이터 처리 ──────────────────────────────────────────────
const OFFSETS = [0, 6, 12];

function isInjection(method) {
  const m = (method || '').toString().trim().toUpperCase();
  return CODES.some(c => active.has(c.key) && c.match(m));
}

function cleanDrugName(name) {
  if (!name) return '';
  let n = name.toString();
  const mgIdx = n.toLowerCase().indexOf('mg');
  if (mgIdx > -1) n = n.substring(0, mgIdx);
  const parenIdx = n.indexOf('(');
  if (parenIdx > -1) n = n.substring(0, parenIdx);
  return n.trim();
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    reFilter();
  };
  reader.readAsArrayBuffer(file);
}

function reFilter() {
  filteredData = [];
  const data = rawRows;
  const lastRow = data.length;

  for (const colOffset of OFFSETS) {
    let currentRow = 0;

    while (currentRow < lastRow) {
      const row = data[currentRow] || [];
      const patientRaw = (row[colOffset] || '').toString().trim();
      if (!patientRaw) { currentRow += 15; continue; }

      let patientInfo = patientRaw;
      let prescriptionDate = '';
      const dateMatch = patientRaw.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}-\d{1,2}|\d{1,2}월\s*\d{1,2}일|\d{2}\/\d{2}\/\d{2,4})\s*$/);
      if (dateMatch) {
        prescriptionDate = dateMatch[1];
        patientInfo = patientRaw.slice(0, dateMatch.index).trim();
      }

      let drugRow = currentRow + 2;
      while (drugRow < lastRow) {
        const drow = data[drugRow] || [];
        const drugRaw = (drow[colOffset] || '').toString().trim();
        if (!drugRaw) break;

        const totalDose  = parseFloat(drow[colOffset + 1]) || 0;
        const totalTimes = parseInt(drow[colOffset + 2]) || 1;
        const method     = (drow[colOffset + 4] || '').toString().trim().toUpperCase();

        if (isInjection(method)) {
          const drugName  = cleanDrugName(drugRaw);
          const singleDose = totalTimes > 0 ? totalDose / totalTimes : totalDose;
          const doseStr   = parseFloat(singleDose.toFixed(3)).toString();
          const drugInfo  = `${drugName} (${doseStr} ${method})`;

          for (let i = 0; i < totalTimes; i++) {
            filteredData.push({ patientInfo, drugInfo, prescriptionDate });
          }
        }
        drugRow++;
      }

      currentRow += 15;
    }
  }

  document.getElementById('statTotal').textContent =
    rawRows.filter(r => (r[0] || '').toString().trim()).length;
  document.getElementById('statFiltered').textContent = filteredData.length;
  document.getElementById('statPatients').textContent =
    new Set(filteredData.map(r => r.patientInfo)).size;

  renderTable();
  document.getElementById('resultSection').style.display = 'block';
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (!filteredData.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">추출된 주사제가 없습니다</td></tr>';
    return;
  }
  tbody.innerHTML = filteredData.map(r => {
    const parts = r.drugInfo.match(/^(.+?) \(([\d.]+) ([A-Z0-9]+)\)$/);
    const drugName = parts ? parts[1] : r.drugInfo;
    const dose     = parts ? parts[2] : '';
    const method   = parts ? parts[3] : '';
    return `<tr>
      <td title="${r.patientInfo}">${r.patientInfo}</td>
      <td>${drugName}</td>
      <td>${dose}</td>
      <td>${method}</td>
      <td>${r.prescriptionDate}</td>
    </tr>`;
  }).join('');
}

// ── 엑셀 다운로드 ────────────────────────────────────────────
function downloadExcel() {
  const wsData = [['환자정보', '약정보', '처방날짜']];
  filteredData.forEach(r => wsData.push([r.patientInfo, r.drugInfo, r.prescriptionDate]));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 30 }, { wch: 35 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, '주사제목록');
  XLSX.writeFile(wb, `주사제_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── DGZ 다운로드 ─────────────────────────────────────────────
function base64ToArrayBuffer(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

const dgzTemplateBuffer = base64ToArrayBuffer("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");

async function downloadDgz() {
  if (!filteredData.length) { alert('추출된 주사제 데이터가 없습니다.'); return; }

  const zip = await JSZip.loadAsync(dgzTemplateBuffer);
  const today = new Date();
  const wsData = [['환자정보', '약정보', '처방날짜']];
  filteredData.forEach(r => wsData.push([r.patientInfo, r.drugInfo, r.prescriptionDate]));

  const newWb = XLSX.utils.book_new();
  const newWs = XLSX.utils.aoa_to_sheet(wsData);
  newWs['!cols'] = [{ wch: 35 }, { wch: 40 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(newWb, newWs, 'transformExcel_FD01');

  const newXlsxBuf = XLSX.write(newWb, { type: 'array', bookType: 'xlsx' });
  const newXlsxName = 'Data/transformExcel_FD01.XLSX';

  Object.keys(zip.files).filter(p => p.startsWith('Data/')).forEach(p => zip.remove(p));
  zip.file(newXlsxName, newXlsxBuf);

  const outBuf = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(outBuf);
  a.download = `약카드_${today.toISOString().slice(0, 10)}.dgz`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── 파일 업로드 ──────────────────────────────────────────────
function checkExt(name, allowed) {
  const ext = name.split('.').pop().toLowerCase();
  return allowed.includes(ext);
}

function showChip(name) {
  const chip = document.getElementById('fileChip');
  document.getElementById('fileName').textContent = name;
  chip.style.display = 'inline-flex';
}

function resetAll() {
  filteredData = [];
  rawRows = [];
  document.getElementById('resultSection').style.display = 'none';
  document.getElementById('fileChip').style.display = 'none';
  document.getElementById('fileInput').value = '';
}

// ── 이벤트 바인딩 ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderToggles();

  const dz = document.getElementById('dropZone');
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
  dz.addEventListener('drop', e => {
    e.preventDefault(); dz.classList.remove('drag');
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (!checkExt(f.name, ['xlsx', 'xlsm'])) { alert('❌ 엑셀 파일만 업로드할 수 있습니다.\n(.xlsx / .xlsm)'); return; }
    showChip(f.name); processFile(f);
  });

  document.getElementById('fileInput').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!checkExt(f.name, ['xlsx', 'xlsm'])) { alert('❌ 엑셀 파일만 업로드할 수 있습니다.\n(.xlsx / .xlsm)'); e.target.value = ''; return; }
    showChip(f.name); processFile(f);
  });

  document.getElementById('dlBtn').addEventListener('click', downloadExcel);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
});