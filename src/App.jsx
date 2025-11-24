import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Dice5, Check, X, DollarSign, Users, Gamepad2, Ghost, Lock } from 'lucide-react';
import { boardCells } from './datos_Tablero'; 

// --- CONFIGURACIÓN DE JUGADORES ---
// Agregamos 'ring' y 'bgLi' (background light) para estilos visuales claros
const CONFIG_JUGADORES = [
  { color: "bg-blue-500", ring: "ring-blue-500", bgLi: "bg-blue-100", icon: User },
  { color: "bg-red-500", ring: "ring-red-500", bgLi: "bg-red-100", icon: Bot },
  { color: "bg-green-500", ring: "ring-green-500", bgLi: "bg-green-100", icon: Gamepad2 },
  { color: "bg-yellow-500", ring: "ring-yellow-500", bgLi: "bg-yellow-100", icon: Ghost },
];

function App() {
  const [juegoIniciado, setJuegoIniciado] = useState(false);
  const [turno, setTurno] = useState(0); 
  const [dado, setDado] = useState(null);
  const [tirando, setTirando] = useState(false);
  
  const [propietarios, setPropietarios] = useState({});
  const [modalCompra, setModalCompra] = useState(null); 
  const [notificacion, setNotificacion] = useState(null); 
  const [jugadores, setJugadores] = useState([]);

  // --- INICIO ---
  const iniciarPartida = (cantidad) => {
    const nuevosJugadores = Array.from({ length: cantidad }, (_, i) => ({
      id: i + 1,
      nombre: `JUGADOR ${i + 1}`,
      ...CONFIG_JUGADORES[i], 
      pos: 0,
      dinero: 1500
    }));
    setJugadores(nuevosJugadores);
    setJuegoIniciado(true);
    mostrarNotificacion(`¡Partida iniciada!`, "exito");
  };

  // --- 1. DADO ---
  const lanzarDado = () => {
    if (tirando) return;
    setTirando(true);
    setDado(null);

    // 1 segundo girando
    setTimeout(() => {
      const valor = Math.floor(Math.random() * 6) + 1;
      setDado(valor);

      // 0.5 segundos mostrando el número antes de mover
      setTimeout(() => {
        moverFicha(valor);
      }, 500);
      
    }, 1000);
  };

  // --- 2. MOVIMIENTO ---
  const moverFicha = (pasos) => {
    let nuevaPosicionCalculada = 0;

    setJugadores(prevJugadores => {
      return prevJugadores.map((jugador, index) => {
        if (index === turno) {
          const posAnterior = jugador.pos;
          const nuevaPos = (posAnterior + pasos) % 28;
          nuevaPosicionCalculada = nuevaPos;
          
          let dineroActual = jugador.dinero;
          if (nuevaPos < posAnterior) {
            dineroActual += 200;
            mostrarNotificacion("¡Salida! +$200", "exito");
          }
          return { ...jugador, pos: nuevaPos, dinero: dineroActual };
        }
        return jugador;
      });
    });

    // --- EL DELAY SOLICITADO ---
    // La ficha tarda un poco en llegar visualmente (aprox 1s).
    // Queremos que el modal salga ~5s después del click inicial.
    // Click(0s) -> Dado(1.5s) -> Mover(1s) -> Espera(3s) = Total ~5.5s
    setTimeout(() => {
      verificarCasilla(nuevaPosicionCalculada);
    }, 3500); // 3.5 segundos de pausa dramática después de moverse
  };

  // --- 3. VERIFICACIÓN ---
  const verificarCasilla = (pos) => {
    const celda = boardCells.find(c => c.id === pos);
    const jugadorActual = jugadores[turno];

    if (celda.type === 'prop' || celda.type === 'rail') {
      const idPropietario = propietarios[celda.id];

      if (idPropietario) {
        if (idPropietario !== jugadorActual.id) {
          pagarRenta(jugadorActual, celda, idPropietario);
        } else {
          cambiarTurno(); 
        }
      } else {
        setModalCompra(celda);
      }
    } 
    else if (celda.type === 'tax') {
      cobrarImpuesto(jugadorActual, 200);
    }
    else if (celda.type === 'goto') {
       enviarACarcel(jugadorActual);
    }
    else {
      cambiarTurno();
    }
  };

  // --- ACCIONES ---
  const comprarPropiedad = () => {
    const celda = modalCompra;
    const jugador = jugadores[turno];

    if (jugador.dinero >= celda.price) {
      setJugadores(prev => prev.map(p => 
        p.id === jugador.id ? { ...p, dinero: p.dinero - celda.price } : p
      ));
      
      setPropietarios(prev => ({ ...prev, [celda.id]: jugador.id }));
      mostrarNotificacion(`¡Compraste ${celda.name}!`, "exito");
      setModalCompra(null);
      cambiarTurno();
    } else {
      mostrarNotificacion("Saldo insuficiente", "error");
    }
  };

  const cancelarCompra = () => {
    setModalCompra(null);
    cambiarTurno();
  };

  const pagarRenta = (pagador, celda, idDueno) => {
    const renta = Math.floor(celda.price * 0.1); 
    setJugadores(prev => prev.map(p => {
      if (p.id === pagador.id) return { ...p, dinero: p.dinero - renta };
      if (p.id === idDueno) return { ...p, dinero: p.dinero + renta };
      return p;
    }));
    mostrarNotificacion(`Alquiler pagado: -$${renta}`, "info");
    cambiarTurno();
  };

  const cobrarImpuesto = (jugador, monto) => {
    setJugadores(prev => prev.map(p => 
      p.id === jugador.id ? { ...p, dinero: p.dinero - monto } : p
    ));
    mostrarNotificacion(`Impuestos: -$${monto}`, "error");
    cambiarTurno();
  };
  
  const enviarACarcel = (jugador) => {
      setJugadores(prev => prev.map(p => 
        p.id === jugador.id ? { ...p, pos: 7 } : p 
      ));
      mostrarNotificacion("¡A la cárcel!", "error");
      cambiarTurno();
  }

  const cambiarTurno = () => {
    setTimeout(() => {
      setTurno(prev => (prev + 1) % jugadores.length);
      setTirando(false);
    }, 1000);
  };

  const mostrarNotificacion = (texto, tipo) => {
    setNotificacion({ texto, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden relative selection:bg-none">
      
      {/* --- TABLERO --- */}
      <div className="relative w-full max-w-[400px] aspect-square bg-slate-800 rounded-xl shadow-2xl p-2 border-4 border-slate-700">
        <div className="grid grid-cols-8 grid-rows-8 gap-1 w-full h-full">
          
          {boardCells.map((celda) => {
            const idDueno = propietarios[celda.id];
            let clasesExtra = "";
            let IconoDueno = null;
            let colorDueno = "";

            // --- LÓGICA VISUAL DE PROPIEDAD ---
            if (idDueno) {
              const dueno = jugadores.find(j => j.id === idDueno);
              if (dueno) {
                // Ring grueso interior + fondo tintado + icono
                clasesExtra = `ring-4 ring-inset ${dueno.ring} ${dueno.bgLi}`;
                IconoDueno = dueno.icon;
                colorDueno = dueno.color;
              }
            }

            return (
              <div
                key={celda.id}
                className={`relative bg-slate-100 rounded-sm overflow-hidden flex flex-col shadow-sm transition-all duration-500 ${clasesExtra}`}
                style={{ gridColumn: celda.grid[1], gridRow: celda.grid[0] }}
              >
                {/* Tira de color original de la propiedad (si no tiene dueño se ve normal) */}
                {celda.type === 'prop' && !idDueno && (
                  <div className="h-1/4 w-full" style={{ backgroundColor: celda.color }}></div>
                )}
                
                {/* CONTENIDO CELDA */}
                <div className="flex-1 flex flex-col items-center justify-center p-[1px] text-center z-10">
                  <span className={`text-[0.55rem] font-bold leading-tight ${idDueno ? 'text-slate-900' : 'text-slate-800'}`}>
                    {celda.name}
                  </span>
                  {celda.price && !idDueno && (
                    <span className="text-[0.5rem] font-medium text-slate-500">${celda.price}</span>
                  )}
                </div>

                {/* MARCADOR DE DUEÑO (Icono en esquina) */}
                {idDueno && IconoDueno && (
                   <div className={`absolute bottom-0 right-0 p-[2px] rounded-tl-md ${colorDueno} text-white z-0`}>
                      <IconoDueno size={8} />
                   </div>
                )}
              </div>
            );
          })}

          {/* FICHAS */}
          {juegoIniciado && jugadores.map((p, i) => {
            const celda = boardCells.find(c => c.id === p.pos);
            if (!celda) return null;
            // Cálculo para que no se superpongan si están en la misma casilla
            const offsetX = (i % 2 === 0 ? -1 : 1) * 6;
            const offsetY = (i < 2 ? -1 : 1) * 6;

            return (
              <motion.div
                key={p.id}
                layout 
                transition={{ type: "spring", stiffness: 60, damping: 15 }} 
                className={`z-20 w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-bold ${p.color}`}
                style={{
                  gridColumn: celda.grid[1],
                  gridRow: celda.grid[0],
                  alignSelf: 'center',
                  justifySelf: 'center',
                  marginLeft: `${offsetX}px`, 
                  marginTop: `${offsetY}px`
                }}
              >
                {i + 1}
              </motion.div>
            );
          })}

          {/* DADO */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <BotonDado 
                valor={dado} 
                tirando={tirando} 
                onClick={lanzarDado} 
                habilitado={juegoIniciado && !tirando}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- BARRA INFERIOR --- */}
      <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-slate-950 to-transparent flex items-end justify-around pb-6 px-2">
        {juegoIniciado && jugadores.map((p, index) => (
          <TarjetaJugador key={p.id} jugador={p} esTurno={index === turno} />
        ))}
      </div>

      {/* --- MODAL INICIO --- */}
      <AnimatePresence>
        {!juegoIniciado && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <h1 className="text-4xl font-bold text-white tracking-widest text-center">
                MONOPOLY<br/><span className="text-blue-500 text-2xl">ONLINE</span>
              </h1>
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center">
                <p className="text-slate-400 mb-6 font-medium">Jugadores</p>
                <div className="flex gap-4">
                  {[2, 3, 4].map(num => (
                    <button key={num} onClick={() => iniciarPartida(num)} className="w-20 h-20 rounded-xl bg-slate-700 hover:bg-blue-600 border-2 border-slate-600 hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-1 group">
                      <Users size={24} className="text-slate-400 group-hover:text-white" />
                      <span className="text-2xl font-bold text-white">{num}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL COMPRA --- */}
      <AnimatePresence>
        {modalCompra && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 border-2 border-slate-600 p-6 rounded-2xl shadow-2xl w-3/4 max-w-sm text-center"
            >
              <h3 className="text-xl font-bold text-white mb-2">{modalCompra.name}</h3>
              <div className="h-2 w-full mb-4 rounded-full" style={{background: modalCompra.color}}></div>
              <p className="text-slate-300 mb-6">¿Comprar propiedad?</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-3xl font-bold text-green-400">${modalCompra.price}</span>
              </div>
              <div className="flex gap-4">
                <button onClick={cancelarCompra} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-bold border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"><X size={18} /> No</button>
                <button onClick={comprarPropiedad} className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"><Check size={18} /> Sí</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- NOTIFICACIONES --- */}
      <AnimatePresence>
        {notificacion && (
          <motion.div
            initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className={`absolute top-0 px-6 py-3 rounded-full shadow-lg font-bold text-sm z-50 mt-4 ${notificacion.tipo === 'error' ? 'bg-red-500' : notificacion.tipo === 'exito' ? 'bg-green-500' : 'bg-blue-500'}`}
          >
            {notificacion.texto}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function BotonDado({ valor, tirando, onClick, habilitado }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }} onClick={onClick} disabled={!habilitado}
      className={`w-20 h-20 rounded-2xl shadow-xl flex items-center justify-center text-4xl text-white font-bold ${!habilitado ? 'bg-slate-700 opacity-50' : tirando ? 'bg-slate-600' : 'bg-gradient-to-br from-orange-400 to-orange-600'} border-4 border-slate-800 relative z-30`}
    >
      <AnimatePresence mode='wait'>
        {tirando ? <motion.div key="load" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}><Dice5 size={40} /></motion.div> : <motion.div key={valor || "i"} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>{valor || <Dice5 size={40} />}</motion.div>}
      </AnimatePresence>
    </motion.button>
  );
}

function TarjetaJugador({ jugador, esTurno }) {
  const Icono = jugador.icon;
  return (
    <motion.div animate={{ y: esTurno ? -20 : 0, scale: esTurno ? 1.1 : 0.9, opacity: esTurno ? 1 : 0.6 }} className="flex flex-col items-center gap-2">
      <div className={`w-14 h-14 rounded-full bg-slate-100 border-4 flex items-center justify-center text-2xl shadow-lg relative ${esTurno ? 'border-yellow-400' : 'border-slate-600'}`}>
        <Icono className="text-slate-700" size={24} />
      </div>
      <div className="text-center bg-slate-800/80 px-3 py-1 rounded-lg backdrop-blur-sm border border-slate-700 min-w-[80px]">
        <span className="block text-[10px] text-slate-300 font-bold uppercase tracking-wider">{jugador.nombre}</span>
        <div className="flex items-center justify-center gap-1 text-green-400 font-mono font-bold text-xs"><DollarSign size={10} /><span>{jugador.dinero}</span></div>
      </div>
    </motion.div>
  );
}

export default App;