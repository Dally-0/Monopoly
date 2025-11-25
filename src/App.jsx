import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Gamepad2, Ghost, Dice5, Home, MapPin, Zap, Train } from 'lucide-react';

// --- CONFIGURACIÓN COMPACTA ---
const COORDENADAS = [ // Grid 8x8 perimetral
  [8,8],[8,7],[8,6],[8,5],[8,4],[8,3],[8,2],[8,1],[7,1],[6,1],[5,1],[4,1],[3,1],[2,1],
  [1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8]
];

// Tipos: i=inicio, p=propiedad, c=cofre/suerte, t=impuesto, r=tren, s=servicio, j=cárcel, k=parking, g=ir_cárcel
const TABLERO = [
  { n: "SALIDA", t: "i", c: "bg-slate-200" },
  { n: "Av. Barrientos", t: "p", $: 60, c: "bg-red-700" },
  { n: "Arca Comunal", t: "c", c: "bg-slate-200" },
  { n: "La Cancha", t: "p", $: 60, c: "bg-red-600" },
  { n: "Peaje", t: "t", c: "bg-slate-300" },
  { n: "Est. Tren", t: "r", $: 200, c: "bg-slate-800" },
  { n: "Av. 6 Agosto", t: "p", $: 100, c: "bg-red-500" },
  { n: "San Sebastián", t: "j", c: "bg-orange-400" },
  { n: "Av. B. Galindo", t: "p", $: 100, c: "bg-fuchsia-500" },
  { n: "Coña Coña", t: "p", $: 120, c: "bg-fuchsia-600" },
  { n: "ELFEC", t: "s", $: 150, c: "bg-yellow-400" },
  { n: "Colcapirhua", t: "p", $: 140, c: "bg-purple-600" },
  { n: "Quillacollo", t: "p", $: 140, c: "bg-purple-700" },
  { n: "Terminal Bus", t: "r", $: 200, c: "bg-slate-800" },
  { n: "Alasitas", t: "k", c: "bg-red-300" },
  { n: "Av. Libertador", t: "p", $: 220, c: "bg-sky-400" },
  { n: "Urkupiña", t: "c", c: "bg-slate-200" },
  { n: "Av. América", t: "p", $: 220, c: "bg-sky-500" },
  { n: "Portales", t: "p", $: 240, c: "bg-blue-500" },
  { n: "Teleférico", t: "r", $: 200, c: "bg-slate-800" },
  { n: "Cala Cala", t: "p", $: 260, c: "bg-blue-600" },
  { n: "Policía", t: "g", c: "bg-slate-800" },
  { n: "Jardín Botánico", t: "p", $: 260, c: "bg-green-400" },
  { n: "SEMAPA", t: "s", $: 150, c: "bg-blue-400" },
  { n: "La Recoleta", t: "p", $: 280, c: "bg-green-500" },
  { n: "Aranjuez", t: "p", $: 300, c: "bg-green-600" },
  { n: "Aeropuerto", t: "r", $: 200, c: "bg-slate-800" },
  { n: "El Bosque", t: "p", $: 320, c: "bg-green-700" },
];

const CONFIG_JUGS = [
  { i: User, c: "bg-blue-600" }, { i: Bot, c: "bg-red-600" },
  { i: Gamepad2, c: "bg-green-600" }, { i: Ghost, c: "bg-orange-500" }
];

const esperar = (ms) => new Promise(r => setTimeout(r, ms));

export default function App() {
  const [juego, setJuego] = useState({ activo: false, jugs: [], turno: 0 });
  const [dado, setDado] = useState({ valor: null, girando: false });
  const [ui, setUi] = useState({ aviso: null, modal: null, moviendo: false });
  const [bienes, setBienes] = useState({ duenos: {}, niveles: {} });

  const notificar = (txt, tipo = 'info') => {
    setUi(p => ({ ...p, aviso: { txt, tipo } }));
    setTimeout(() => setUi(p => ({ ...p, aviso: null })), 3000);
  };

  const iniciar = (n) => {
    setJuego({
      activo: true, turno: 0,
      jugs: Array.from({ length: n }, (_, k) => ({ id: k, nom: `J${k+1}`, $ : 1500, pos: 0, ...CONFIG_JUGS[k] }))
    });
    setBienes({ duenos: {}, niveles: {} });
    notificar("¡Bienvenidos a Cochabamba!", "success");
  };

  const lanzar = async () => {
    if (dado.girando || ui.moviendo) return;
    setUi(p => ({ ...p, aviso: null }));
    setDado({ valor: null, girando: true });
    
    await esperar(800);
    const val = Math.floor(Math.random() * 6) + 1;
    setDado({ valor: val, girando: false });
    
    setUi(p => ({ ...p, moviendo: true }));
    await esperar(800);
    mover(val);
  };

  const mover = async (pasos) => {
    let jug = juego.jugs[juego.turno];
    let pActual = jug.pos;

    for (let i = 0; i < pasos; i++) {
      await esperar(300);
      pActual = (pActual + 1) % 28;
      if (pActual === 0) {
        jug.$ += 200;
        notificar("Vuelta completa: +200 Bs.");
      }
      actJugador(jug.id, { pos: pActual, $: jug.$ });
    }
    setUi(p => ({ ...p, moviendo: false }));
    evaluar(pActual, jug);
  };

  const actJugador = (id, datos) => setJuego(p => ({ ...p, jugs: p.jugs.map(j => j.id === id ? { ...j, ...datos } : j) }));

  const evaluar = (pos, j) => {
    const casilla = TABLERO[pos];
    const dueno = bienes.duenos[pos];

    if (['p', 'r', 's'].includes(casilla.t)) {
      if (dueno !== undefined && dueno !== j.id) pagar(j, casilla, pos, dueno);
      else if (dueno === undefined) { setUi(p => ({ ...p, modal: { ...casilla, id: pos } })); return; }
    } else if (casilla.t === 't') {
      actJugador(j.id, { $: j.$ - 200 });
      notificar("Impuestos: -200 Bs.", "error");
    } else if (casilla.t === 'g') {
      notificar("¡A la cárcel!", "error");
      setTimeout(() => { actJugador(j.id, { pos: 7 }); sigTurno(); }, 1000);
      return;
    }
    sigTurno();
  };

  const comprar = () => {
    const c = ui.modal, j = juego.jugs[juego.turno];
    if (j.$ >= c.$) {
      actJugador(j.id, { $: j.$ - c.$ });
      setBienes(p => ({ duenos: { ...p.duenos, [c.id]: j.id }, niveles: { ...p.niveles, [c.id]: 1 } }));
      notificar(`Compraste ${c.n}`, "success");
      setUi(p => ({ ...p, modal: null }));
      sigTurno();
    } else notificar("Sin fondos", "error");
  };

  const pagar = (pagador, c, pos, idDueno) => {
    const nvl = bienes.niveles[pos] || 1;
    const monto = Math.floor(c.$ * 0.1) * Math.pow(2, nvl - 1);
    actJugador(pagador.id, { $: pagador.$ - monto });
    actJugador(idDueno, { $: juego.jugs[idDueno].$ + monto });
    setBienes(p => ({ ...p, niveles: { ...p.niveles, [pos]: nvl + 1 } }));
    notificar(`Alquiler: -${monto} Bs.`, "info");
    sigTurno();
  };

  const sigTurno = () => !ui.modal && setTimeout(() => setJuego(p => ({ ...p, turno: (p.turno + 1) % p.jugs.length })), 1000);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-sky-100 font-sans text-slate-800 overflow-hidden select-none">
      <div className="relative w-full max-w-[420px] aspect-square bg-white rounded-xl shadow-2xl border-4 border-sky-600 p-1">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full gap-[2px] bg-sky-50">
          {TABLERO.map((c, i) => <Casilla key={i} datos={c} i={i} dueno={bienes.duenos[i]} nvl={bienes.niveles[i]} jugs={juego.jugs} />)}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button onClick={lanzar} disabled={!juego.activo || dado.girando || ui.moviendo} className={`pointer-events-auto w-24 h-24 rounded-2xl flex items-center justify-center bg-white shadow-xl border-4 border-sky-100 transition-transform active:scale-95 ${(!juego.activo || dado.girando) ? 'opacity-80' : 'hover:scale-105'}`}>
              <AnimatePresence mode="wait">{dado.girando ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5 }}><Dice5 size={48} className="text-sky-500"/></motion.div> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl font-bold text-sky-600">{dado.valor || "Tirar"}</motion.div>}</AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4 w-full px-4 overflow-x-auto justify-center">
        {juego.activo && juego.jugs.map((j, k) => (
          <div key={k} className={`flex flex-col items-center p-2 rounded-lg min-w-[80px] transition-all border-2 ${k === juego.turno ? 'bg-white border-yellow-400 scale-110 shadow-lg' : 'bg-white/50 border-transparent scale-90'}`}>
            <div className={`w-10 h-10 rounded-full ${j.c} text-white flex items-center justify-center mb-1`}><j.i size={20}/></div>
            <span className="text-xs font-bold">{j.nom}</span>
            <span className="text-xs text-green-600 font-mono">{j.$} Bs</span>
          </div>
        ))}
      </div>

      {!juego.activo && <div className="absolute inset-0 bg-sky-900/80 backdrop-blur-sm flex items-center justify-center z-50"><div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm"><h1 className="text-3xl font-bold text-sky-600 mb-2">MONOPOLIO</h1><h2 className="text-xl text-slate-500 mb-6">COCHABAMBA</h2><div className="flex justify-center gap-3">{[2,3,4].map(n => <button key={n} onClick={() => iniciar(n)} className="w-16 h-16 rounded-xl bg-slate-100 hover:bg-sky-100 font-bold text-xl border-2 border-slate-200 transition-colors">{n}</button>)}</div></div></div>}

      <AnimatePresence>
        {ui.modal && <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-72 text-center border-4 border-white">
              <h3 className="font-bold text-lg">{ui.modal.n}</h3><div className={`h-2 w-full ${ui.modal.c} rounded-full my-3`}></div><div className="text-4xl font-bold text-green-600 mb-6">{ui.modal.$} Bs</div>
              <div className="flex gap-2"><button onClick={() => setUi(p => ({...p, modal: null}))} className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg font-bold">No</button><button onClick={comprar} className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold">Comprar</button></div>
            </div>
        </motion.div>}
        {ui.aviso && <motion.div initial={{y:-50}} animate={{y:20}} exit={{y:-50}} className={`absolute top-0 px-6 py-2 rounded-full text-white font-bold shadow-lg z-50 ${ui.aviso.tipo === 'error' ? 'bg-red-500' : 'bg-sky-500'}`}>{ui.aviso.txt}</motion.div>}
      </AnimatePresence>
    </div>
  );
}

const Casilla = ({ datos, i, dueno, nvl, jugs }) => {
  const [f, c] = COORDENADAS[i], props = jugs.find(j => j.id === dueno);
  const renta = dueno !== undefined ? (Math.floor(datos.$ * 0.1) * Math.pow(2, nvl - 1)) : null;
  
  return (
    <div className={`relative rounded-[2px] overflow-hidden flex flex-col border border-slate-200 bg-white transition-colors ${props ? props.c + '/10' : ''}`} style={{ gridRow: f, gridColumn: c }}>
      {['p','r','s'].includes(datos.t) && !props && <div className={`h-[25%] w-full ${datos.c}`}></div>}
      {props && <div className={`absolute top-0 left-0 w-full h-[3px] ${props.c}`}></div>}
      <div className="flex-1 flex flex-col items-center justify-center p-[1px] text-center leading-none z-10">
        <span className="text-[9px] font-bold text-slate-700 truncate w-full px-[1px]">{datos.n}</span>
        {datos.$ && <span className={`text-[8px] font-mono mt-[1px] ${props ? 'font-bold text-slate-900' : 'text-slate-400'}`}>{props ? renta : datos.$}</span>}
        {datos.t === 'i' && <MapPin size={12} className="text-green-500"/>}{datos.t === 'j' && <Home size={12} className="text-orange-500"/>}
        {datos.t === 'r' && !props && <Train size={10} className="text-slate-400"/>}{datos.t === 's' && <Zap size={10} className="text-yellow-500"/>}
      </div>
      {nvl > 1 && <div className="absolute bottom-[1px] right-[1px] text-[7px] bg-slate-800 text-white px-1 rounded-sm">x{Math.pow(2, nvl-1)}</div>}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{jugs.filter(j => j.pos === i).map((j, k) => <motion.div layoutId={`pl-${j.id}`} key={j.id} className={`w-4 h-4 rounded-full border border-white shadow-sm ${j.c} -ml-${k*2} z-20 flex items-center justify-center text-[6px] text-white`}>{j.nom.charAt(1)}</motion.div>)}</div>
    </div>
  );
};