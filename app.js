(function(){
  const KEY = "somandoaqui_txns_v1";

  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => document.querySelectorAll(q);

  const input = $("#valor");
  const btnVenda = $("#btnVenda");
  const btnSaque = $("#btnSaque");
  const btnRetirada = $("#btnRetirada");
  const btnResumo = $("#btnResumo");
  const btnAplicar = $("#btnAplicar");
  const btnHoje = $("#btnHoje");
  const btnMes = $("#btnMes");
  const fromEl = $("#from");
  const toEl = $("#to");
  const tblBody = $("#tbl tbody");

  const out = {
    vendas: $("#vendas"),
    saques: $("#saques"),
    saques30: $("#saques30"),
    saquesResto: $("#saquesResto"),
    retiradas: $("#retiradas"),
    saldo: $("#saldo")
  };

  // Utils
  function parseValor(str){
    if(!str) return 0;
    // Accepts "1.234,56" or "1234.56" etc
    let s = (""+str).replace(/[R$\s]/g, "").replace(/\./g,"").replace(",", ".");
    let v = Number.parseFloat(s);
    if(Number.isNaN(v)) return 0;
    return Math.round(v * 100); // cents
  }
  function focusValor(){
    input.focus();
    input.select();
  }
  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return [];
      const arr = JSON.parse(raw);
      if(!Array.isArray(arr)) return [];
      return arr;
    }catch(e){ return []; }
  }
  function save(arr){
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function addTxn(type, amountCents){
    if(amountCents <= 0) return;
    const now = Date.now();
    const txns = load();
    txns.push({ type, amountCents, ts: now });
    save(txns);
  }
  function startOfDay(ts){
    const d = new Date(ts);
    d.setHours(0,0,0,0);
    return d.getTime();
  }
  function endOfDay(ts){
    const d = new Date(ts);
    d.setHours(23,59,59,999);
    return d.getTime();
  }
  function ymd(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  // Caixa inicial
  const KEY_OPEN = "somandoaqui_open_v1";
  function setCaixaInicial(cents, dateStr){
    const data = loadOpen();
    data[dateStr] = cents;
    localStorage.setItem(KEY_OPEN, JSON.stringify(data));
  }
  function loadOpen(){
    try{
      return JSON.parse(localStorage.getItem(KEY_OPEN) || "{}");
    }catch(e){
      return {};
    }
  }

  const btnAbrirCaixa = document.createElement("button"); btnAbrirCaixa.className = "btn btn-abrir";
  btnAbrirCaixa.textContent = "Abrir Caixa";
  btnAbrirCaixa.addEventListener("click", ()=>{
    const cents = parseValor(input.value);
    if(cents>0 && fromEl.value){
      setCaixaInicial(cents, fromEl.value);
      alert("Caixa aberto com " + fmt.format(cents/100) + " em " + fromEl.value);
      input.value = "";
      focusValor();
      applyRangeFromInputs();
    }else{
      alert("Defina a data de início (De) e insira um valor válido.");
    }
  });
  document.querySelector(".buttons").appendChild(btnAbrirCaixa);

  // Summary
  function summarize(rangeFrom, rangeTo){
    const txns = load().filter(t => t.ts >= rangeFrom && t.ts <= rangeTo);
    let vendas = 0, saques = 0, retiradas = 0;
    for(const t of txns){
      if(t.type === "VENDA") vendas += t.amountCents;
      else if(t.type === "SAQUE") saques += t.amountCents;
      else if(t.type === "RETIRADA") retiradas += t.amountCents;
    }
    const saques30 = Math.floor(saques * 30 / 100);
    const saquesResto = saques - saques30;
    const openData = loadOpen();
    const keyFrom = fromEl.value || '';
    const caixaInicial = openData[keyFrom] || 0;
    const saldo = caixaInicial + vendas - retiradas - saques;

    out.vendas.textContent = fmt.format(vendas/100);
    out.saques.textContent = fmt.format(saques/100);
    out.saques30.textContent = fmt.format(saques30/100);
    out.saquesResto.textContent = fmt.format(saquesResto/100);
    out.retiradas.textContent = fmt.format(retiradas/100);
    out.saldo.textContent = fmt.format(saldo/100);

    // table
    tblBody.innerHTML = "";
    for(const t of txns.sort((a,b)=>a.ts-b.ts)){
      const tr = document.createElement("tr");
      const d = new Date(t.ts);
      const tipo = t.type.charAt(0)+t.type.slice(1).toLowerCase();
      tr.innerHTML = `<td>${d.toLocaleString('pt-BR')}</td><td>${tipo}</td><td>${fmt.format(t.amountCents/100)}</td>`;
      tblBody.appendChild(tr);
    }
  }

  // Period helpers
  function applyToday(){
    const d = new Date();
    fromEl.value = ymd(d);
    toEl.value = ymd(d);
    summarize(startOfDay(d), endOfDay(d));
  }
  function applyMonth(){
    const d = new Date();
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth()+1, 0);
    fromEl.value = ymd(first);
    toEl.value = ymd(last);
    summarize(startOfDay(first), endOfDay(last));
  }
  function applyRangeFromInputs(){
    if(!fromEl.value || !toEl.value) return;
    const from = new Date(fromEl.value+"T00:00:00");
    const to = new Date(toEl.value+"T23:59:59");
    summarize(from.getTime(), to.getTime());
  }

  // Event wiring
  btnVenda.addEventListener("click", ()=>{
    const cents = parseValor(input.value);
    if(cents>0){ addTxn("VENDA", cents); input.value=""; focusValor(); applyRangeFromInputs(); }
  });
  btnSaque.addEventListener("click", ()=>{
    const cents = parseValor(input.value);
    if(cents>0){ addTxn("SAQUE", cents); input.value=""; focusValor(); applyRangeFromInputs(); }
  });
  btnRetirada.addEventListener("click", ()=>{
    const cents = parseValor(input.value);
    if(cents>0){ addTxn("RETIRADA", cents); input.value=""; focusValor(); applyRangeFromInputs(); }
  });
  btnResumo.addEventListener("click", ()=>{
    applyRangeFromInputs();
    focusValor();
  });
  btnAplicar.addEventListener("click", applyRangeFromInputs);
  btnHoje.addEventListener("click", applyToday);
  btnMes.addEventListener("click", applyMonth);

  // Keyboard enter to add venda quickly
  input.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      const cents = parseValor(input.value);
      if(cents>0){ addTxn("VENDA", cents); input.value=""; focusValor(); applyRangeFromInputs(); }
    }
  });

  // Footer tools
  const btnExport = document.getElementById("btnExport");
  const btnImport = document.getElementById("btnImport");
  const fileImport = document.getElementById("fileImport");
  const btnLimpar = document.getElementById("btnLimpar");

  btnExport.addEventListener("click", ()=>{
    const data = load();
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "somandoaqui-dados.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  btnImport.addEventListener("click", ()=> fileImport.click());
  fileImport.addEventListener("change", async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    try{
      const text = await file.text();
      const data = JSON.parse(text);
      if(Array.isArray(data)){
        save(data);
        applyRangeFromInputs();
        alert("Importado com sucesso!");
      }else{
        alert("Arquivo inválido.");
      }
    }catch(err){
      alert("Falha ao importar: "+err.message);
    }finally{
      e.target.value = "";
    }
  });

  btnLimpar.addEventListener("click", ()=>{
    if(!fromEl.value || !toEl.value){ alert("Defina o período (De/Até) para limpar."); return; }
    if(!confirm("Tem certeza que deseja apagar os registros do período selecionado?")) return;
    const from = new Date(fromEl.value+"T00:00:00").getTime();
    const to = new Date(toEl.value+"T23:59:59").getTime();
    const txns = load().filter(t => !(t.ts >= from && t.ts <= to));
    save(txns);
    applyRangeFromInputs();
  });

  // Init
  // default: mês corrente
  applyMonth();
  focusValor();
})();