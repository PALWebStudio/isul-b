/* Как да стигнете до ИСУЛ
   Geocoding: OpenStreetMap Nominatim (bounded to Sofia). Routing: routing.openstreetmap.de (OSRM, car / foot).
   Public transport: lines from the official isul.eu access map + the nearest stop, and a Google Maps transit link
   (there is no free public-transit routing API for Sofia). */
(function () {
  'use strict';
  const TEMPLATE = (H) => `
  <aside class="rt-panel" aria-labelledby="rt-h">
    <p class="rt-kick">ул. „Бяло море“ № 8, София 1527</p>
    <${H} id="rt-h">Как да стигнете до ИСУЛ</${H}>

    <form class="rt-form" id="form" role="search" aria-label="Откъде тръгвате">
      <label for="from">Откъде тръгвате?</label>
      <div class="rt-field">
        <input id="from" autocomplete="off" placeholder="Адрес, квартал или място в София…" aria-describedby="rt-hint" aria-controls="sugg">
        <button type="submit">Покажи</button>
      </div>
      <ul class="rt-sugg" id="sugg" hidden></ul>
      <p class="rt-hint" id="rt-hint">Напр. „НДК“, „Люлин 5“, „Летище София“, „бул. България 1“</p>
      <button type="button" class="rt-geo" id="geo"><span aria-hidden="true">◎</span> Използвай моето местоположение</button>
    </form>

    <div class="rt-modes" role="radiogroup" aria-label="Начин на придвижване">
      <button type="button" role="radio" aria-checked="true" data-mode="car">🚗<span>С кола</span></button>
      <button type="button" role="radio" aria-checked="false" data-mode="foot">🚶<span>Пеша</span></button>
      <button type="button" role="radio" aria-checked="false" data-mode="transit">🚌<span>Градски транспорт</span></button>
    </div>

    <div class="rt-result" id="result" aria-live="polite"></div>

    <section class="rt-transit" aria-labelledby="tr-h">
      <h2 id="tr-h">Градски транспорт до ИСУЛ</h2>
      <ul>
        <li class="t-bus"><b>Автобуси</b><span>11, 78, 79, 213, 305, 404, 413</span><small>спирка на бул. „Ген. Данаил Николаев“</small></li>
        <li class="t-tram"><b>Трамваи</b><span>20, 22</span><small>спирка при бул. „Васил Левски“ и бул. „Кн. Ал. Дондуков“</small></li>
        <li class="t-trol"><b>Тролейбуси</b><span>1, 2, 4</span><small>спирка на бул. „Княз Александър Дондуков“</small></li>
      </ul>
      <p class="rt-src">Линиите са по схемата за достъп от isul.eu. Местата на спирките на картата са приблизителни.</p>
    </section>
  </aside>

  <div class="rt-map-wrap">
    <div id="map" class="rt-map" role="application" aria-label="Карта с маршрут до ИСУЛ"></div>
    <div class="rt-legend" aria-hidden="true"><span class="l-bus">Автобус</span><span class="l-tram">Трамвай</span><span class="l-trol">Тролейбус</span><span class="l-metro">Метро (цвят на линията)</span><span class="l-walk">Пеша</span></div>
  </div>
`;

  function mount(root, opts = {}) {
  root.classList.add('rt');
  root.innerHTML = TEMPLATE(opts.heading || 'h1');
  const $ = (s) => root.querySelector(s);
  const ISUL = [42.70095, 23.33944];
  const ADDR = 'УМБАЛ „Царица Йоанна – ИСУЛ“, ул. „Бяло море“ 8, София';
  // approximate stop positions read from the official access map (isul.eu/images/map_01.jpg)
  const STOPS = [
    { type: 'bus', name: 'Автобуси 11, 78, 79, 213, 305, 404, 413', street: 'бул. „Ген. Данаил Николаев“', p: [42.70245, 23.33935] },
    { type: 'tram', name: 'Трамваи 20, 22', street: 'бул. „Кн. Ал. Дондуков“ / бул. „Васил Левски“', p: [42.69885, 23.33395] },
    { type: 'trol', name: 'Тролейбуси 1, 2, 4', street: 'бул. „Княз Александър Дондуков“', p: [42.69935, 23.33925] }
  ];
  const COLORS = { bus: '#0E6FD8', tram: '#0FA39A', trol: '#E5484D' };
  const VIEWBOX = '23.18,42.78,23.48,42.60';   // Sofia

  /* ---------- Map ---------- */
  const map = L.map($('#map'), { zoomControl: true, scrollWheelZoom: true }).setView(ISUL, 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const isulIcon = L.divIcon({ className: '', html: '<div class="pin-isul"><img src="assets/brand/isul-crest-white.svg" alt=""></div>', iconSize: [46, 46], iconAnchor: [23, 46] });
  L.marker(ISUL, { icon: isulIcon, title: ADDR }).addTo(map).bindTooltip('УМБАЛ „Царица Йоанна – ИСУЛ“', { permanent: true, direction: 'top', offset: [0, -46], className: 'isul-tip' });
  STOPS.forEach((s) => {
    L.marker(s.p, { icon: L.divIcon({ className: '', html: `<div class="pin-stop" style="background:${COLORS[s.type]}"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] }) })
      .addTo(map).bindTooltip(`${s.name}<br><small>${s.street}</small>`, { direction: 'top', offset: [0, -8] });
  });

  /* ---------- State ---------- */
  let mode = 'car', from = null, fromLabel = '', routeLayer = null, meMarker = null;
  const result = $('#result');
  const fmtKm = (m) => (m < 1000 ? Math.round(m / 10) * 10 + ' м' : (m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',') + ' км');
  const fmtMin = (s) => { const m = Math.max(1, Math.round(s / 60)); return m < 60 ? m + ' мин' : Math.floor(m / 60) + ' ч ' + (m % 60) + ' мин'; };
  const dist = (a, b) => { const R = 6371e3, r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  const gmaps = (travel) => `https://www.google.com/maps/dir/?api=1&origin=${from ? from.join(',') : ''}&destination=${encodeURIComponent(ADDR)}&travelmode=${travel}`;

  /* ---------- Geocoding ---------- */
  async function geocode(q) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=bg&countrycodes=bg&viewbox=${VIEWBOX}&bounded=1&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('geocode');
    return (await r.json()).map((x) => ({ p: [+x.lat, +x.lon], name: x.display_name.split(',').slice(0, 2).join(','), full: x.display_name.split(',').slice(2, 4).join(',') }));
  }
  const sugg = $('#sugg'), input = $('#from');
  let tmr = 0;
  input.addEventListener('input', () => {
    clearTimeout(tmr); const q = input.value.trim();
    if (q.length < 3) { sugg.hidden = true; return; }
    tmr = setTimeout(async () => {
      try {
        const list = await geocode(q);
        sugg.innerHTML = list.map((x, i) => `<li><button type="button" data-i="${i}">${x.name}<small>${x.full}</small></button></li>`).join('');
        sugg.hidden = !list.length; sugg._list = list;
      } catch (e) { sugg.hidden = true; }
    }, 450);   // Nominatim usage policy: no more than one request per second
  });
  sugg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const x = sugg._list[+b.dataset.i]; input.value = x.name; sugg.hidden = true; setFrom(x.p, x.name); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.rt-form')) sugg.hidden = true; });
  setTimeout(() => map.invalidateSize(), 50);
  $('#form').addEventListener('submit', async (e) => {
    e.preventDefault(); sugg.hidden = true;
    const q = input.value.trim(); if (!q) { input.focus(); return; }
    result.innerHTML = '<p class="rt-load">Търсене на адреса…</p>';
    try {
      const [x] = await geocode(q);
      if (!x) { result.innerHTML = `<div class="rt-err">Не открихме „${q.replace(/</g, '&lt;')}“ в София. Опитайте с улица и номер или с име на квартал.</div>`; return; }
      setFrom(x.p, x.name);
    } catch (err) { result.innerHTML = '<div class="rt-err">Търсенето на адреси не е достъпно в момента. Опитайте отново след малко.</div>'; }
  });
  $('#geo').addEventListener('click', () => {
    if (!navigator.geolocation) { result.innerHTML = '<div class="rt-err">Браузърът не поддържа определяне на местоположение.</div>'; return; }
    result.innerHTML = '<p class="rt-load">Определяне на местоположението…</p>';
    navigator.geolocation.getCurrentPosition(
      (pos) => { input.value = 'Моето местоположение'; setFrom([pos.coords.latitude, pos.coords.longitude], 'Моето местоположение'); },
      () => { result.innerHTML = '<div class="rt-err">Нямаме достъп до местоположението. Разрешете го в браузъра или въведете адрес.</div>'; },
      { enableHighAccuracy: true, timeout: 10000 });
  });

  /* ---------- Modes ---------- */
  root.querySelectorAll('.rt-modes button').forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    root.querySelectorAll('.rt-modes button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    if (from) route(); else if (mode === 'transit') transitInfo();
  }));

  function setFrom(p, label) {
    from = p; fromLabel = label;
    if (meMarker) meMarker.remove();
    meMarker = L.marker(p, { icon: L.divIcon({ className: '', html: '<div class="pin-me"></div>', iconSize: [20, 20], iconAnchor: [10, 10] }), title: label }).addTo(map);
    route();
  }

  /* ---------- Routing ---------- */
  const ICON = (m) => ({ turn: '↪', 'new name': '↑', depart: '●', arrive: '⚑', merge: '↗', 'on ramp': '↗', 'off ramp': '↘', fork: '⑂', 'end of road': '↱', roundabout: '⟳', rotary: '⟳', continue: '↑' }[m] || '↑');
  const DIR = { left: 'наляво', right: 'надясно', 'slight left': 'леко наляво', 'slight right': 'леко надясно', 'sharp left': 'рязко наляво', 'sharp right': 'рязко надясно', straight: 'направо', uturn: 'обратен завой' };
  function stepText(s) {
    const t = s.maneuver.type, m = s.maneuver.modifier, road = s.name ? ` по ${s.name}` : '';
    if (t === 'depart') return `Тръгнете${road}`;
    if (t === 'arrive') return 'Пристигнахте при ИСУЛ';
    if (t === 'roundabout' || t === 'rotary') return `На кръговото движение излезте на ${s.maneuver.exit || ''}-ия изход${road}`;
    if (t === 'turn' || t === 'end of road' || t === 'fork') return `Завийте ${DIR[m] || ''}${road}`;
    if (m === 'uturn') return `Направете обратен завой${road}`;
    return `Продължете ${DIR[m] && m !== 'straight' ? DIR[m] : 'направо'}${road}`;
  }
  async function route() {
    if (mode === 'transit') return transitInfo();
    result.innerHTML = '<p class="rt-load">Изчисляване на маршрута…</p>';
    const prof = mode === 'foot' ? 'routed-foot' : 'routed-car';
    const url = `https://routing.openstreetmap.de/${prof}/route/v1/driving/${from[1]},${from[0]};${ISUL[1]},${ISUL[0]}?overview=full&geometries=geojson&steps=true`;
    try {
      const r = await fetch(url); const j = await r.json();
      if (j.code !== 'Ok' || !j.routes.length) throw new Error('route');
      const rt = j.routes[0];
      draw(rt.geometry.coordinates.map(([x, y]) => [y, x]), mode === 'foot' ? '#0FA39A' : '#9D305C', mode === 'foot');
      const steps = rt.legs[0].steps.filter((s) => s.distance > 0 || s.maneuver.type === 'arrive');
      result.innerHTML = `<div class="rt-sum"><b>${fmtMin(rt.duration)}</b><span>${fmtKm(rt.distance)} · ${mode === 'foot' ? 'пеша' : 'с кола, без трафик'}</span></div>
        <ol class="rt-steps">${steps.map((s) => `<li><i>${ICON(s.maneuver.type)}</i><span>${stepText(s)}</span><small>${s.distance ? fmtKm(s.distance) : ''}</small></li>`).join('')}</ol>
        <div class="rt-links"><a class="is-main" href="${gmaps(mode === 'foot' ? 'walking' : 'driving')}" target="_blank" rel="noopener">Навигация в Google Maps ↗</a>${mode === 'car' ? `<a href="https://waze.com/ul?ll=${ISUL.join(',')}&navigate=yes" target="_blank" rel="noopener">Waze ↗</a>` : ''}</div>`;
    } catch (e) {
      result.innerHTML = `<div class="rt-err">Маршрутът не може да бъде изчислен в момента.</div><div class="rt-links"><a class="is-main" href="${gmaps(mode === 'foot' ? 'walking' : 'driving')}" target="_blank" rel="noopener">Отвори в Google Maps ↗</a></div>`;
    }
  }
  function draw(latlngs, color, dashed) {
    if (routeLayer) routeLayer.remove();
    routeLayer = L.layerGroup([
      L.polyline(latlngs, { color: '#fff', weight: 9, opacity: .9 }),
      L.polyline(latlngs, { color, weight: 5, opacity: .95, dashArray: dashed ? '2 10' : null, lineCap: 'round' })
    ]).addTo(map);
    map.fitBounds(L.latLngBounds(latlngs).pad(.15), { animate: true });
  }
  /* ---------- Public transport: real itineraries (Transitous / MOTIS, Sofia GTFS of ЦГМ) ---------- */
  const TYPE = (leg) => {
    if (leg.mode === 'WALK') return { k: 'walk', n: 'Пеша', c: '#5B6577', i: '🚶' };
    const t = leg.routeType;
    if (t === 1 || leg.mode === 'SUBWAY' || leg.mode === 'METRO') return { k: 'metro', n: 'Метро', c: '#' + (leg.routeColor || '7A3FB8'), i: 'Ⓜ' };
    if (t === 0 || leg.mode === 'TRAM') return { k: 'tram', n: 'Трамвай', c: COLORS.tram, i: '🚋' };
    if (t === 11 || leg.mode === 'TROLLEYBUS') return { k: 'trol', n: 'Тролейбус', c: COLORS.trol, i: '🚎' };
    if (t === 2 || leg.mode === 'RAIL' || leg.mode === 'REGIONAL_RAIL') return { k: 'rail', n: 'Влак', c: '#8A5A00', i: '🚆' };
    return { k: 'bus', n: 'Автобус', c: COLORS.bus, i: '🚌' };
  };
  function decode(str, precision = 7) {           // Google encoded polyline
    const f = Math.pow(10, precision); let i = 0, lat = 0, lng = 0; const out = [];
    while (i < str.length) {
      for (const k of [0, 1]) {
        let b, shift = 0, res = 0;
        do { b = str.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        const d = res & 1 ? ~(res >> 1) : res >> 1; if (k === 0) lat += d; else lng += d;
      }
      out.push([lat / f, lng / f]);
    }
    return out;
  }
  const hhmm = (iso) => new Date(iso).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Sofia' });
  const nice = (s) => (s || '').toLowerCase().replace(/(^|[\s.„"(-])([а-яa-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/^Start$/, fromLabel || 'Начало').replace(/^End$/, 'ИСУЛ');
  let itins = [];
  async function transitInfo() {
    if (!from) {
      if (routeLayer) routeLayer.remove(); map.setView(ISUL, 16);
      result.innerHTML = '<div class="rt-tip">Въведете откъде тръгвате и ще Ви покажем маршрут с градски транспорт: кои линии да вземете, къде да се прекачите и колко да вървите пеша.</div>';
      return;
    }
    result.innerHTML = '<p class="rt-load">Търсене на маршрут с градски транспорт…</p>';
    const url = `https://api.transitous.org/api/v1/plan?fromPlace=${from[0]},${from[1]}&toPlace=${ISUL[0]},${ISUL[1]}&time=${new Date().toISOString()}&numItineraries=4`;
    try {
      const r = await fetch(url); if (!r.ok) throw new Error('plan');
      const j = await r.json();
      itins = (j.itineraries || []).filter((it) => it.legs.some((l) => l.mode !== 'WALK')).slice(0, 3);
      if (!itins.length) {
        if (j.direct && j.direct.length) { result.innerHTML = '<div class="rt-tip">Разстоянието е малко: най-бързо е пеша. Изберете „Пеша“.</div>'; return; }
        throw new Error('none');
      }
      renderItins(0);
    } catch (e) {
      result.innerHTML = `<div class="rt-err">Маршрутът с градски транспорт не може да бъде изчислен в момента.</div><div class="rt-links"><a class="is-main" href="${gmaps('transit')}" target="_blank" rel="noopener">Отвори в Google Maps ↗</a></div>`;
    }
  }
  function renderItins(sel) {
    const it = itins[sel];
    // options
    const opts = itins.map((x, i) => `<button type="button" class="rt-opt" data-i="${i}" aria-pressed="${i === sel}">
        <span class="rt-opt__t"><b>${Math.round(x.duration / 60)} мин</b><small>${hhmm(x.startTime)} – ${hhmm(x.endTime)}${x.transfers ? ' · ' + x.transfers + (x.transfers === 1 ? ' прекачване' : ' прекачвания') : ' · без прекачване'}</small></span>
        <span class="rt-opt__legs">${x.legs.map((l) => { const t = TYPE(l); return l.mode === 'WALK' ? `<i class="lg lg--walk" title="Пеша ${Math.round(l.duration / 60)} мин">🚶<small>${Math.round(l.duration / 60)}</small></i>` : `<i class="lg" style="background:${t.c}" title="${t.n} ${l.routeShortName}">${t.i} ${l.routeShortName || ''}</i>`; }).join('<span class="lg-sep">›</span>')}</span>
      </button>`).join('');
    // steps of the selected itinerary
    const steps = it.legs.map((l) => {
      const t = TYPE(l), min = Math.round(l.duration / 60);
      if (l.mode === 'WALK') return `<li class="st st--walk"><span class="st__dot" style="--c:${t.c}"></span><div><b>Пеша ${min} мин</b> <small>(${fmtKm(l.distance || 0)})</small><br><small>до ${nice(l.to.name)}</small></div></li>`;
      const n = (l.intermediateStops || []).length + 1;
      return `<li class="st"><span class="st__dot" style="--c:${t.c}"></span><div><span class="lg" style="background:${t.c}">${t.i} ${t.n} ${l.routeShortName || ''}</span> <small>посока ${nice(l.headsign)}</small><br>
        Качете се на <b>${nice(l.from.name)}</b> в ${hhmm(l.startTime)}<br>Слезте на <b>${nice(l.to.name)}</b> в ${hhmm(l.endTime)} <small>· ${n} ${n === 1 ? 'спирка' : 'спирки'}, ${min} мин</small></div></li>`;
    }).join('');
    result.innerHTML = `<div class="rt-opts" role="group" aria-label="Варианти на маршрута">${opts}</div><ol class="rt-st">${steps}<li class="st st--end"><span class="st__dot" style="--c:#9D305C"></span><div><b>УМБАЛ „Царица Йоанна – ИСУЛ“</b><br><small>пристигане ${hhmm(it.endTime)}</small></div></li></ol>
      <p class="rt-src">Разписание по данни на ЦГМ (GTFS), маршрутизация <a href="https://transitous.org" target="_blank" rel="noopener">Transitous</a>. Без данни за закъснения в реално време.</p>
      <div class="rt-links"><a href="${gmaps('transit')}" target="_blank" rel="noopener">Google Maps ↗</a><a href="https://www.sofiatraffic.bg/" target="_blank" rel="noopener">Градски транспорт София ↗</a></div>`;
    result.querySelectorAll('.rt-opt').forEach((b) => b.addEventListener('click', () => renderItins(+b.dataset.i)));
    drawItin(it);
  }
  function drawItin(it) {
    if (routeLayer) routeLayer.remove();
    const layers = [], all = [];
    it.legs.forEach((l) => {
      const t = TYPE(l), pts = l.legGeometry ? decode(l.legGeometry.points, l.legGeometry.precision || 7) : [[l.from.lat, l.from.lon], [l.to.lat, l.to.lon]];
      all.push(...pts);
      if (l.mode === 'WALK') layers.push(L.polyline(pts, { color: t.c, weight: 4, dashArray: '1 9', lineCap: 'round', opacity: .95 }));
      else {
        layers.push(L.polyline(pts, { color: '#fff', weight: 10, opacity: .95 }));
        layers.push(L.polyline(pts, { color: t.c, weight: t.k === 'metro' ? 8 : 6, opacity: 1, lineCap: 'round' }).bindTooltip(`${t.n} ${l.routeShortName || ''}`, { sticky: true }));
        if (t.k === 'metro') layers.push(L.polyline(pts, { color: '#fff', weight: 2, dashArray: '6 6', opacity: .95 }));   // rail look: metro keeps its official line colour
        // boarding / alighting stops with line badge
        layers.push(L.marker([l.from.lat, l.from.lon], { icon: L.divIcon({ className: '', html: `<span class="map-badge" style="background:${t.c}">${t.i} ${l.routeShortName || ''}</span>`, iconSize: null, iconAnchor: [0, 34] }) }).bindTooltip(`Качване: ${nice(l.from.name)} · ${hhmm(l.startTime)}`));
        layers.push(L.circleMarker([l.from.lat, l.from.lon], { radius: 6, color: '#fff', weight: 3, fillColor: t.c, fillOpacity: 1 }));
        layers.push(L.circleMarker([l.to.lat, l.to.lon], { radius: 6, color: '#fff', weight: 3, fillColor: t.c, fillOpacity: 1 }).bindTooltip(`Слизане: ${nice(l.to.name)} · ${hhmm(l.endTime)}`));
      }
    });
    routeLayer = L.layerGroup(layers).addTo(map);
    map.fitBounds(L.latLngBounds(all).pad(.15), { animate: true });
  }
  }

  window.ISUL_ROUTE = { mount };
  const solo = document.getElementById('rt-root');
  if (solo) {
    mount(solo);
    const q = new URLSearchParams(location.search).get('from');
    if (q) { const i = solo.querySelector('#from'); i.value = q; solo.querySelector('#form').requestSubmit(); }
  }
})();
