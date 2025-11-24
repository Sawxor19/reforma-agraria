// app.js — navigation toggles and chart initialization
(function(){
  'use strict';

  // data arrays will be populated from CSVs (in millions of hectares)
  let years = [];
  let urbanData = [];
  let soyData = [];
  let riceData = [];
  let caneData = [];
  let dataLoaded = false;

  let chartsInited = false;
  let urbanChart = null;
  let agricultureChart = null;

  function qs(sel, ctx=document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx=document) { return Array.from(ctx.querySelectorAll(sel)); }

  function initCharts(){
    if (chartsInited) return;
    chartsInited = true;

    // urbanGrowthChart
    const ctxUrban = qs('#urbanGrowthChart');
    if (ctxUrban) {
      urbanChart = new Chart(ctxUrban.getContext('2d'), {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: 'Área Urbanizada (milhões ha)',
            data: urbanData,
            borderColor: '#0b7285',
            backgroundColor: 'rgba(11,114,133,0.08)',
            tension: 0.25,
            pointRadius:4,
            pointBackgroundColor:'#0b7285'
          }]
        },
        options: {
          responsive:true,
          maintainAspectRatio:false,
          animation:{duration:400},
          plugins:{legend:{display:true}},
          scales:{
            x:{title:{display:true,text:'Ano'}},
            y:{title:{display:true,text:'Milhões de hectares'}}
          }
        }
      });
    }

    // agricultureChart
    const ctxAg = qs('#agricultureChart');
    if (ctxAg) {
      agricultureChart = new Chart(ctxAg.getContext('2d'), {
        type: 'line',
        data: {
          labels: years,
          datasets: [
            {label:'Soja (milhões ha)', data: soyData, borderColor:'#105b52', backgroundColor:'rgba(16,91,82,0.06)', tension:0.25, pointRadius:3},
            {label:'Arroz (milhões ha)', data: riceData, borderColor:'#d97706', backgroundColor:'rgba(217,119,6,0.06)', tension:0.25, pointRadius:3},
            {label:'Cana (milhões ha)', data: caneData, borderColor:'#0b7285', backgroundColor:'rgba(11,114,133,0.06)', tension:0.25, pointRadius:3}
          ]
        },
        options: {
          responsive:true,
          maintainAspectRatio:false,
          animation:{duration:400},
          plugins:{legend:{position:'bottom'}},
          scales:{x:{title:{display:true,text:'Ano'}},y:{title:{display:true,text:'Milhões de hectares'}}}
        }
      });
    }

    // after creating charts, schedule a resize/update to stabilize sizes (avoids growth loops)
    setTimeout(()=>{
      try{
        if (urbanChart && typeof urbanChart.resize === 'function') urbanChart.resize();
        if (agricultureChart && typeof agricultureChart.resize === 'function') agricultureChart.resize();
        if (urbanChart && typeof urbanChart.update === 'function') urbanChart.update();
        if (agricultureChart && typeof agricultureChart.update === 'function') agricultureChart.update();
      }catch(e){ console.warn('Chart resize/update error', e); }
    }, 120);
  }

  // CSV parsing helpers
  function parseQuotedCSV(text){
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    const rows = lines.map(line => {
      const matches = line.match(/"([^"]*)"/g);
      if (!matches) return null;
      return matches.map(s => s.replace(/"/g, ''));
    }).filter(Boolean);
    return rows;
  }

  function numFromBrazilianFormat(s){
    if (!s) return 0;
    const cleaned = s.trim();
    if (cleaned === '-' || cleaned === '') return 0;
    // remove dots used as thousand separators and possible spaces
    const digits = cleaned.replace(/\./g,'').replace(/\s/g,'');
    const n = Number(digits);
    if (isNaN(n)) return 0;
    // convert hectares to millions of hectares
    return n / 1000000;
  }

  async function loadData(){
    if (dataLoaded) return;
    try{
      // urban
      const uResp = await fetch('data/urban.csv');
      const uText = await uResp.text();
      const uRows = parseQuotedCSV(uText);
      years = [];
      urbanData = [];
      uRows.slice(1).forEach(r => {
        const y = Number(r[0]);
        years.push(y);
        urbanData.push(numFromBrazilianFormat(r[1]));
      });

      // agriculture
      const aResp = await fetch('data/agriculture.csv');
      const aText = await aResp.text();
      const aRows = parseQuotedCSV(aText);
      // map columns by header (safety)
      const header = aRows[0];
      const colIndex = (name) => header.indexOf(name);
      const idxSoja = colIndex('Soja');
      const idxCana = colIndex('Cana');
      const idxArroz = colIndex('Arroz');
      soyData = [];
      caneData = [];
      riceData = [];
      // ensure years from agriculture align; if agriculture has more rows, prefer that years array
      const startRows = aRows.slice(1);
      if (startRows.length > 0){
        years = startRows.map(r => Number(r[0]));
      }
      startRows.forEach(r => {
        soyData.push(numFromBrazilianFormat(r[idxSoja]));
        caneData.push(numFromBrazilianFormat(r[idxCana]));
        riceData.push(numFromBrazilianFormat(r[idxArroz]));
      });

      dataLoaded = true;
    }catch(err){
      console.error('Erro ao carregar CSVs:', err);
      // fallback to small sample if fetch fails
      years = [1985,1995,2005,2015,2024];
      urbanData = [1.8,2.2,3.0,4.0,4.69];
      soyData = [4.488,9.0,18.0,32.0,40.727];
      riceData = [0.385,0.45,0.65,0.95,1.12617];
      caneData = [5.0,6.0,7.5,8.2,9.0];
      dataLoaded = true;
    }
  }

  async function loadAndInitCharts(){
    if (chartsInited) return;
    // ensure Chart.js is loaded
    if (typeof Chart === 'undefined'){
      await new Promise((resolve) => {
        const check = setInterval(()=>{ if (typeof Chart !== 'undefined'){ clearInterval(check); resolve(); } }, 60);
        setTimeout(()=>resolve(), 3000);
      });
    }
    await loadData();
    initCharts();
  }

  // Section activation logic
  function activateSection(id, push=true){
    const all = qsa('.content-stack main > section');
    all.forEach(s => s.classList.remove('active'));
    const target = qs(id);
    if (target){
      target.classList.add('active');
      // smooth scroll into view of the section top within container
      target.scrollIntoView({behavior:'smooth', block:'start'});
      if (push) history.replaceState(null,'',id);
      // initialize charts if section contains them
      if (id === '#projecoes' || id === '#paradoxo'){
        // small timeout to allow layout to settle; then load CSVs and init charts
        setTimeout(()=>{ loadAndInitCharts(); }, 120);
      }
    }
  }

  function setupNav(){
    const links = qsa('.section-nav a');
    links.forEach(a => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const href = a.getAttribute('href');
        activateSection(href, true);
      });
    });

    // Activate from hash or default to first section
    const fromHash = location.hash || '#introducao';
    activateSection(fromHash, false);
  }

  // Accordions for subsections: transform each h3 inside an article into a toggle
  function setupAccordions(){
    const articles = qsa('section article');
    articles.forEach(article => {
      const h3 = article.querySelector('h3');
      if (!h3) return;

      // Gather siblings after h3 within the article
      const panel = document.createElement('div');
      panel.className = 'accordion-panel';

      let sibling = h3.nextElementSibling;
      while(sibling){
        const next = sibling.nextElementSibling;
        panel.appendChild(sibling);
        sibling = next;
      }

      // Append panel to article
      article.appendChild(panel);

      // Make h3 interactive
      h3.classList.add('accordion-toggle');
      h3.setAttribute('role','button');
      h3.setAttribute('tabindex','0');
      h3.setAttribute('aria-expanded','false');
      panel.setAttribute('aria-hidden','true');

      function toggleAccordion(open){
        const isOpen = h3.getAttribute('aria-expanded') === 'true';
        const shouldOpen = typeof open === 'boolean' ? open : !isOpen;
        h3.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        panel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
        if (shouldOpen){
          panel.style.maxHeight = panel.scrollHeight + 'px';
        } else {
          panel.style.maxHeight = '0px';
        }
      }

      h3.addEventListener('click', ()=> toggleAccordion());
      h3.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleAccordion(); }
      });

      // start collapsed
      panel.style.overflow = 'hidden';
      panel.style.maxHeight = '0px';
      panel.style.transition = 'max-height 260ms ease';
    });

    // Also handle h3 elements that are direct children of a section (not wrapped in article)
    const sections = qsa('.content-stack main > section');
    sections.forEach(section => {
      let el = section.firstElementChild;
      while(el){
        if (el.tagName === 'H3' && !el.classList.contains('accordion-toggle')){
          const header = el;
          const panel = document.createElement('div');
          panel.className = 'accordion-panel';

          // move following siblings into panel until next H3 or end of section
          let nxt = header.nextElementSibling;
          while(nxt && nxt.tagName !== 'H3'){
            const toMove = nxt;
            nxt = toMove.nextElementSibling;
            panel.appendChild(toMove);
          }

          header.insertAdjacentElement('afterend', panel);

          // initialize the header as accordion
          header.classList.add('accordion-toggle');
          header.setAttribute('role','button');
          header.setAttribute('tabindex','0');
          header.setAttribute('aria-expanded','false');
          panel.setAttribute('aria-hidden','true');

          function toggleAccordion(open){
            const isOpen = header.getAttribute('aria-expanded') === 'true';
            const shouldOpen = typeof open === 'boolean' ? open : !isOpen;
            header.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
            panel.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
            if (shouldOpen){
              panel.style.maxHeight = panel.scrollHeight + 'px';
            } else {
              panel.style.maxHeight = '0px';
            }
          }

          header.addEventListener('click', ()=> toggleAccordion());
          header.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleAccordion(); } });

          panel.style.overflow = 'hidden';
          panel.style.maxHeight = '0px';
          panel.style.transition = 'max-height 260ms ease';

          // continue iteration after the newly inserted panel
          el = panel.nextElementSibling;
          continue;
        }
        el = el.nextElementSibling;
      }
    });
  }

  // Highlight behavior for mouse and keyboard interactions
  function setupHighlighting(){
    const navLinks = qsa('.section-nav a');
    const toggles = qsa('.accordion-toggle');

    function addHoverHandlers(el){
      el.addEventListener('mouseenter', ()=> el.classList.add('highlight'));
      el.addEventListener('mouseleave', ()=> el.classList.remove('highlight'));
      el.addEventListener('focus', ()=> el.classList.add('highlight'));
      el.addEventListener('blur', ()=> el.classList.remove('highlight'));
    }

    navLinks.forEach(addHoverHandlers);
    toggles.forEach(addHoverHandlers);
  }

  // On DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // if Chart is not loaded yet, delay init until script loaded
    if (typeof Chart === 'undefined'){
      // wait until Chart.js loads (it should be loaded via CDN before this file)
      const check = setInterval(()=>{
        if (typeof Chart !== 'undefined'){
          clearInterval(check);
          setupAccordions();
          setupHighlighting();
          setupNav();
        }
      }, 80);
      // fallback timeout
      setTimeout(()=>{ if (!chartsInited){ setupAccordions(); setupHighlighting(); setupNav(); } }, 2000);
    } else {
      setupAccordions();
      setupHighlighting();
      setupNav();
    }
  });

})();
