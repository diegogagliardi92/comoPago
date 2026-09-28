// Almacenamiento local con la misma API mínima que usa la app (collection/doc, add/set/delete, onSnapshot).
// "promos" = promos.json del repo + tus cambios locales encima. El resto vive solo en este navegador.
(function(){
  const K = "cqp:";
  const read = (k,d) => { try{ const v = localStorage.getItem(K+k); return v==null?d:JSON.parse(v); }catch(_){ return d; } };
  const write = (k,v) => { try{ localStorage.setItem(K+k, JSON.stringify(v)); }catch(_){} };
  const listeners = {};
  const emit = key => (listeners[key]||[]).forEach(fn=>fn());
  const snap = (id, data) => ({id, exists: data!==undefined, data: () => data, metadata:{fromCache:false,hasPendingWrites:false}});
  const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,8);

  async function create(){
    let base = [];
    try{ const r = await fetch("promos.json", {cache:"no-cache"}); if(r.ok) base = await r.json(); }catch(_){}
    const coll = name => {
      if(name==="promos"){
        const ov = read("promos-ov", {up:{}, del:[]});
        const m = new Map();
        base.forEach(p=>{ if(!ov.del.includes(p.id)) m.set(p.id, p); });
        Object.entries(ov.up).forEach(([id,p])=>{ if(!ov.del.includes(id)) m.set(id,p); });
        return m;
      }
      return new Map(Object.entries(read("c:"+name, {})));
    };
    const save = (name, id, data) => {
      if(name==="promos"){
        const ov = read("promos-ov", {up:{}, del:[]});
        if(data===undefined){ delete ov.up[id]; if(!ov.del.includes(id)) ov.del.push(id); }
        else { ov.up[id] = data; ov.del = ov.del.filter(x=>x!==id); }
        write("promos-ov", ov);
      } else {
        const c = read("c:"+name, {}); if(data===undefined) delete c[id]; else c[id] = data; write("c:"+name, c);
      }
      emit("c:"+name);
    };
    const docRef = (name, id) => ({
      id,
      async get(){ return snap(id, coll(name).get(id)); },
      async set(d){ save(name, id, JSON.parse(JSON.stringify(d))); },
      async update(d){ save(name, id, {...(coll(name).get(id)||{}), ...d}); },
      async delete(){ save(name, id, undefined); },
      onSnapshot(next){ const f=()=>next(snap(id, coll(name).get(id))); (listeners["c:"+name] ||= []).push(f); setTimeout(f,0); return ()=>{}; }
    });
    const collRef = name => ({
      doc: id => docRef(name, id || uid()),
      async add(d){ const r = docRef(name, uid()); await r.set(d); return r; },
      onSnapshot(next){ const f=()=>{ const docs=[...coll(name)].map(([id,d])=>snap(id,d)); next({docs, size:docs.length, empty:!docs.length, docChanges:()=>[], metadata:{fromCache:false,hasPendingWrites:false}}); }; (listeners["c:"+name] ||= []).push(f); setTimeout(f,0); return ()=>{}; }
    });
    return {
      local: true,
      collection: collRef,
      doc(path){ const [c,id] = path.split("/"); return docRef(c, id); },
      resetPromos(){ write("promos-ov", {up:{}, del:[]}); emit("c:promos"); }
    };
  }
  window.LocalDB = { create };
})();
