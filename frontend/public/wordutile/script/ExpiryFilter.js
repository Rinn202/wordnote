const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const baseToday = new Date(); baseToday.setHours(0, 0, 0, 0);

let windowOffset = 0;
let selectedDates = new Set();
let holidays = new Set();
let resultData = [];

// ── 날짜 유틸 ────────────────────────────────────────────────
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function dkey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
function fmt(d) { return `${d.getMonth() + 1}/${d.getDate()}(${DAYS[d.getDay()]})`; }
function getWindowStart() { return addDays(baseToday, windowOffset); }

function dayClass(d) {
  if (holidays.has(dkey(d))) return 'sun';
  const dow = d.getDay();
  if (dow === 6) return 'sat';
  if (dow === 0) return 'sun';
  return '';
}

// ── 날짜 버튼 렌더 ───────────────────────────────────────────
function renderDayButtons() {
  const container = document.getElementById('day-buttons');
  container.innerHTML = '';
  const winStart = getWindowStart();

  const todayDiv = document.createElement('div');
  todayDiv.className = 'day-btn today-btn ' + dayClass(winStart);
  todayDiv.innerHTML = `<span style="font-size:10px;">오늘</span><span class="num">${winStart.getDate()}</span><span>${winStart.getMonth() + 1}월</span>`;
  container.appendChild(todayDiv);

  for (let i = 1; i <= 7; i++) {
    const d = addDays(winStart, i);
    const k = dkey(d);
    const sel = selectedDates.has(k);
    const dc = dayClass(d);
    const btn = document.createElement('button');
    btn.className = 'day-btn ' + dc + (sel ? ' selected' : '');
    btn.innerHTML = `<span style="font-size:10px;">${DAYS[d.getDay()]}</span><span class="num">${d.getDate()}</span><span>${d.getMonth() + 1}월</span>`;
    btn.onclick = () => toggleDate(k);
    container.appendChild(btn);
  }
  updateLogicText();
}

function shiftWindow(delta) { windowOffset += delta; renderDayButtons(); }

function toggleDate(k) {
  if (selectedDates.has(k)) selectedDates.delete(k);
  else selectedDates.add(k);
  renderDayButtons();
}

function updateLogicText() {
  const el = document.getElementById('logic-text');
  if (!selectedDates.size) { el.textContent = '날짜를 선택해주세요'; return; }
  const labels = [...selectedDates].sort().map(k => {
    const [y, m, d] = k.split('-').map(Number);
    return fmt(new Date(y, m, d));
  });
  el.textContent = `${labels.join(', ')} 에 처방이 끝나는 약을 필터링합니다`;
}

// ── 파일 처리 ────────────────────────────────────────────────
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-area').style.background = '';
  handleFile(e.dataTransfer.files[0]);
}

function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.style.display = 'block';
  el.style.background =
    type === 'err'  ? 'var(--color-background-danger)' :
    type === 'warn' ? 'var(--color-background-warning)' :
                     'var(--color-background-secondary)';
  el.style.color =
    type === 'err'  ? 'var(--color-text-danger)' :
    type === 'warn' ? 'var(--color-text-warning)' :
                     'var(--color-text-secondary)';
  el.textContent = msg;
}

function handleFile(file) {
  if (!file) return;
  if (!selectedDates.size) { showStatus('먼저 확인할 날짜를 선택해주세요', 'err'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets['sheet1'] || wb.Sheets['Sheet1'] || wb.Sheets[wb.SheetNames[0]];
      if (!ws) { showStatus('sheet1 시트를 찾을 수 없습니다', 'err'); return; }
      processData(XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }));
    } catch (err) { showStatus('파일 오류: ' + err.message, 'err'); }
  };
  reader.readAsArrayBuffer(file);
}

// ── 데이터 처리 ──────────────────────────────────────────────
const C = { ROOM: 0, PATIENT: 1, DR: 2, ORDER: 5, DOSE: 6, TIMES: 7, DAY: 8, METHOD: 12 };

function cleanName(n) { return String(n).split('mg')[0].split('(')[0].split('_')[0].trim(); }

function getSuffix(name, method) {
  if (method === 'MIX') return 'A';
  if (method === 'ZF2' || method === 'ZF3') return '';
  if (name.endsWith('정')) return 'T';
  if (name.endsWith('캡슐')) return 'C';
  if (name.endsWith('시럽') || name.endsWith('액')) return 'P';
  return '';
}

function processData(rows) {
  resultData = [];
  let lastRoom = '', lastPatient = '', lastDr = '';
  const groupMap = {};
  const refDay = getWindowStart();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const room    = String(row[C.ROOM]    || '').trim();
    const patient = String(row[C.PATIENT] || '').trim();
    const dr      = String(row[C.DR]      || '').trim();
    if (room) { lastRoom = room; lastPatient = patient; lastDr = dr; }

    const orderRaw = String(row[C.ORDER] || '').trim();
    if (!orderRaw) continue;
    const dayRaw = row[C.DAY];
    if (!String(dayRaw).trim() || isNaN(Number(dayRaw))) continue;

    const expireDate = addDays(refDay, parseInt(dayRaw));
    const name = cleanName(orderRaw);
    const key  = lastPatient + '||' + name;

    if (!groupMap[key]) {
      groupMap[key] = { room: lastRoom, patient: lastPatient, dr: lastDr, name, method: '', dose: 0, times: 0, lastExpireDate: expireDate };
    }
    if (expireDate > groupMap[key].lastExpireDate) groupMap[key].lastExpireDate = expireDate;
    groupMap[key].dose   = isNaN(+row[C.DOSE])  ? 0 : +row[C.DOSE];
    groupMap[key].times  = isNaN(+row[C.TIMES]) ? 0 : +row[C.TIMES];
    groupMap[key].method = String(row[C.METHOD] || '').trim();
    groupMap[key].room    = lastRoom;
    groupMap[key].patient = lastPatient;
    groupMap[key].dr      = lastDr;
  }

  Object.values(groupMap).forEach(g => {
    if (!selectedDates.has(dkey(g.lastExpireDate))) return;
    const suffix   = getSuffix(g.name, g.method);
    const oneDose  = g.times > 0 ? g.dose / g.times : g.dose;
    const doseStr  = (Number.isInteger(oneDose) ? oneDose : parseFloat(oneDose.toFixed(2))) + suffix;
    resultData.push({
      '병실': g.room, '환자명': g.patient, 'Dr': g.dr,
      '약품명': g.name, '1회투여량': doseStr, '용법': g.method,
      '마지막처방': '~' + g.lastExpireDate.getDate()
    });
  });

  if (!resultData.length) {
    showStatus('선택한 날짜에 처방이 끊기는 약이 없습니다', 'ok');
    document.getElementById('result-section').style.display = 'none';
    return;
  }
  showStatus(`⚠ ${resultData.length}건 — 선택한 날짜에 처방이 끊깁니다`, 'warn');
  renderTable();
}

// ── 테이블 렌더 ──────────────────────────────────────────────
function renderTable() {
  document.getElementById('result-section').style.display = 'block';
  document.getElementById('result-title').textContent = `처방 끊김 (${resultData.length}건)`;
  const headers = ['병실', '환자명', 'Dr', '약품명', '1회투여량', '용법', '마지막처방'];
  const table = document.getElementById('result-table');
  let html = '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
  resultData.forEach(row => {
    html += '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
}

// ── 엑셀 다운로드 ────────────────────────────────────────────
function downloadResult() {
  const wb = XLSX.utils.book_new();
  const headers = ['병실', '환자명', 'Dr', '약품명', '1회투여량', '용법', '마지막처방'];
  const wsData = [headers, ...resultData.map(r => headers.map(k => r[k] || ''))];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [8, 12, 10, 22, 10, 8, 10].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, '처방끊김');
  XLSX.writeFile(wb, `처방끊김_${baseToday.getMonth() + 1}월${baseToday.getDate()}일.xlsx`);
}

// ── 초기화 ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  selectedDates.add(dkey(addDays(baseToday, 1)));
  renderDayButtons();
});