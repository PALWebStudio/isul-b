/* People and units index — one profile per doctor, one sub-page per clinic unit.
   Built from the migrated isul.eu clinic data (leaders + team lists), units.js and cv.js.
   Shared by the site (window.ISUL_PEOPLE) and the build scripts (Node). */
(function (root) {
  'use strict';
  const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: 'y', ю: 'yu', я: 'ya' };
  const fold = (x) => String(x || '').toLowerCase().replace(/ё/g, 'е').replace(/[„“”"'«»]/g, '');
  const slugify = (x) => fold(x).split('').map((ch) => TR[ch] !== undefined ? TR[ch] : ch).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const TITLE = /^\s*((?:проф(?:есор)?|доц(?:ент)?|гл\.?\s*ас(?:истент)?|ас(?:истент)?)\.?\s*)?(д-р|др\.)?\s*/i;
  const DEGREE = /[,\s]+(д\.?\s?м\.?\s?н\.?|дмн|д\.?\s?м\.?|дм)\s*\.?\s*$/i;
  const RANK = (t) => /проф/i.test(t) ? 0 : /доц/i.test(t) ? 1 : /гл/i.test(t) ? 2 : /ас/i.test(t) ? 3 : 4;
  const niceTitle = (pre, dr) => {
    const p = (pre || '').toLowerCase(), parts = [];
    if (/проф/.test(p)) parts.push('Проф.'); else if (/доц/.test(p)) parts.push('Доц.'); else if (/гл/.test(p)) parts.push('Гл. ас.'); else if (/ас/.test(p)) parts.push('Ас.');
    if (dr) parts.push(parts.length ? 'д-р' : 'Д-р');
    return parts.join(' ');
  };
  const niceDegree = (d) => { const f = fold(d).replace(/[\s.]/g, ''); return f === 'дмн' ? 'дмн' : f === 'дм' ? 'дм' : d; };
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  /** "Проф. д-р Иван Петров, дм – началник на клиниката" → parts, or null if this is not a doctor */
  function parse(raw, roleIn) {
    let s = String(raw || '').replace(/\s*[-–]\s*Биография\s*$/i, '').replace(/\s+/g, ' ').trim();
    let name = s, role = String(roleIn || '').replace(/\s*[-–]\s*Биография\s*$/i, '').trim();
    if (!roleIn) { const m = s.match(/^(.+?)(?:\s+[–—-]\s*|[–—-]\s+)(.+)$/); if (m) { name = m[1]; role = m[2]; } }
    const dm = name.match(DEGREE); let degree = '';
    if (dm) { degree = niceDegree(dm[1]); name = name.slice(0, dm.index); }
    name = name.replace(/[,\s]+$/, '');
    const tm = name.match(TITLE); if (!tm || (!tm[1] && !tm[2])) return null;
    const core = name.slice(tm[0].length).replace(/[,.]+$/, '').trim();
    const words = core.split(' ').filter(Boolean);
    if (words.length < 2 || words.length > 4 || !words.every((w) => /^[А-ЯA-Z][а-яa-zА-Я-]+$/.test(w))) return null;
    const title = niceTitle(tm[1], tm[2]);
    if (!degree) { const rd = role.match(/^(дмн|дм|д\.м\.н?\.?)\b[,\s–-]*/i); if (rd) { degree = niceDegree(rd[1]); role = role.slice(rd[0].length); } }
    role = cap(role.replace(/^[,\s–-]+/, '').replace(/\s+-\s+/g, ' – ').trim());
    const first = words[0], last = words[words.length - 1];
    return { title, core, degree, role, first, last, key: fold(first + ' ' + last), name: (title ? title + ' ' : '') + core + (degree ? ', ' + degree : '') };
  }
  const localPhoto = (u) => { const m = String(u || '').match(/photos\/dr\/(\d+)(?:_m)?\.jpe?g/i); return m ? 'assets/photos/doctors/' + m[1] + '.jpg' : ''; };

  function build(C, UNITS, CV, BIOS) {
    UNITS = UNITS || []; CV = CV || {}; BIOS = BIOS || {};
    const people = [], byKey = {}, bySlug = {}, slugs = new Set();
    const unitsOf = (cid) => UNITS.filter((u) => u.clinic === +cid);
    const add = (p, cid, img, order) => {
      if (!p) return;
      const c = C.clinics[cid];
      let d = byKey[p.key];
      if (d) {
        if (!d.clinics.includes(+cid)) d.clinics.push(+cid);
        if (!d.img && img) d.img = img;
        if (p.title && RANK(p.title) < RANK(d.title)) { d.title = p.title; d.name = p.name; }
        if (!d.role && p.role) d.role = p.role;
        return;
      }
      let slug = slugify(p.first + ' ' + p.last); if (slugs.has(slug)) slug += '-' + cid; slugs.add(slug);
      d = byKey[p.key] = bySlug[slug] = { ...p, slug, clinic: +cid, clinics: [+cid], img: img || '', cv: CV[p.key] || '', units: [], order, head: /началник|ръководител|завеждащ/i.test(p.role) };
      unitsOf(cid).forEach((u) => { if ((u.match && u.match.test(p.role)) || (u.head && u.head.test(p.role))) d.units.push(u.slug); });
      people.push(d);
      void c;
    };
    Object.values(C.clinics).forEach((c) => {
      let n = 0;
      c.leaders.forEach((l) => {
        if (/awesome image/i.test(l.name)) return;
        const p = l.name ? parse(l.name, l.role || ' ') : parse(l.role);
        if (p && l.name && !l.role) p.role = '';
        add(p, c.id, localPhoto(l.img), n++);
      });
      c.members.forEach((m) => { if (/сестр|санитар|лаборант|фелдшер|рехабилитатор|акушер/i.test(m.g)) return; add(parse(m.x), c.id, '', 100 + n++); });
    });
    // doctors who only have a biography page on isul.eu (not in the team lists)
    Object.entries(BIOS).forEach(([k, b]) => {
      if (byKey[k] || !C.clinics[b.clinic] || !b.blocks.some((x) => x.x.length > 40)) return;
      const first = b.blocks[0] && b.blocks[0].x.length < 140 ? b.blocks[0].x : '';
      const p = parse(b.name.replace(/\s+(дмн|дм)\s*$/i, ', $1'), /началник|ръководител|завеждащ|лекар|асистент|специалист/i.test(first) ? first : ' ');
      if (p) add(p, b.clinic, localPhoto(b.img), 50);
    });
    people.forEach((d) => { const b = BIOS[d.key]; if (!b) return; d.biography = b.blocks.filter((x, i) => !(i === 0 && x.x.length < 160 && fold(x.x) === fold(d.role))); d.bioSrc = b.src; if (!d.img && b.img) d.img = localPhoto(b.img); });
    const sortP = (a, b) => (b.head - a.head) || (RANK(a.title) - RANK(b.title)) || (a.order - b.order);
    const inClinic = (cid) => people.filter((d) => d.clinics.includes(+cid)).sort(sortP);
    const units = UNITS.map((u) => {
      const team = people.filter((d) => d.units.includes(u.slug)).sort(sortP);
      const head = u.head ? people.find((d) => d.clinic === u.clinic && u.head.test(d.role)) : null;
      return { ...u, team, headP: head || null };
    });
    const unitBySlug = {}; units.forEach((u) => { unitBySlug[u.clinic + '/' + u.slug] = u; });
    return { list: people.sort((a, b) => fold(a.core).localeCompare(fold(b.core), 'bg')), bySlug, inClinic, units, unitsOf: (cid) => units.filter((u) => u.clinic === +cid), unit: (cid, slug) => unitBySlug[cid + '/' + slug] || null, fold, slugify, parse };
  }
  /** link doctors to Press centre articles; pull short bio paragraphs out of interviews */
  const BIO = /завърш(в|ил)а\s|дипломира|придоби(в)?а\s(специалност|магистърска)|специалност (по|„)|главен асистент|докторант|научните (и практическите )?(му|ѝ|й)? ?интереси|започва работа|е специалист по|е лекар-специализант/i;
  function attachPress(P, news) {
    P.list.forEach((d) => {
      const nm = new RegExp(fold(d.first) + '(\\s+[а-я-]+)?\\s+' + fold(d.last));
      const arts = [], bio = [];
      news.forEach((n) => {
        const ft = fold(n.title), inTitle = nm.test(ft) || ft.includes(fold(d.first[0]) + '. ' + fold(d.last)) || new RegExp(fold(d.first).slice(0, 3) + '[а-я]*\\s+' + fold(d.last)).test(ft);
        const txt = fold(n.title + ' ' + n.blocks.map((b) => b.x || '').join(' '));
        if (!inTitle && !nm.test(txt)) return;
        arts.push(n);
        let run = false;
        n.blocks.forEach((b) => {
          const f = fold(b.x || ''), named = nm.test(f) || (inTitle && f.includes(fold(d.last)));
          const ok = b.t === 'p' && b.x && b.x.length >= 50 && b.x.length <= 900 && !/\?\s*$/.test(b.x) && (BIO.test(b.x) || (named && /е роден|е специалист|е лекар/i.test(b.x)));
          if (ok && (named || run)) { run = true; if (bio.length < 4 && !bio.some((x) => x.x === b.x)) bio.push({ x: b.x, news: n.id, date: n.date }); } else run = false;
        });
      });
      d.press = arts.slice(0, 6); d.bio = bio;
    });
  }
  const api = { build, parse, slugify, fold, localPhoto, attachPress };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ISUL_PEOPLE_API = api;
})(typeof window !== 'undefined' ? window : globalThis);
