// ============================================================================
// RunPulse AI — App & Sitio Web Multi-Corredor Local
// Control de Entrenamientos, Recomendaciones Diarias, Recordatorios,
// Datos Curiosos del Running, Escáner de Reloj & Entrenador Gemini AI
// ============================================================================

const LEGACY_STORAGE_KEY = 'runpulse_ai_state_v1';
const MULTI_USER_STORAGE_KEY = 'runpulse_multi_users_v2';
const GEMINI_KEY_STORAGE = 'runpulse_gemini_api_key';
const THEME_STORAGE_KEY = 'runpulse_theme_pref';

// Catálogo científico de tipos de entrenamiento y sus adaptaciones fisiológicas (escala 1-10)
const WORKOUT_TYPES_CATALOG = {
  easy: {
    id: 'easy',
    name: 'Rodaje Suave / Recuperación',
    shortName: 'Rodaje Suave',
    zone: 'Z1 - Z2 (60-75% FC)',
    color: '#059669',
    badgeClass: 'badge-easy',
    primaryBenefit: 'Densidad mitocondrial, capilarización y oxidación de grasas',
    recoveryHours: '12 - 24 h',
    description:
      'El pilar del 80% del volumen semanal. Estimula el crecimiento de mitocondrias y capilares sanguíneos en las fibras lentas (Tipo I) sin generar fatiga nerviosa.',
    scores: {
      aerobicBase: 9,
      lactateThreshold: 3,
      vo2Max: 2,
      runningEconomy: 6,
      muscularStrength: 3,
      glycogenEndurance: 7
    }
  },
  tempo: {
    id: 'tempo',
    name: 'Tempo / Umbral de Lactato',
    shortName: 'Tempo / Umbral',
    zone: 'Z3 - Z4 (82-89% FC)',
    color: '#d97706',
    badgeClass: 'badge-tempo',
    primaryBenefit: 'Aclaramiento de lactato y sostener ritmos altos por más tiempo',
    recoveryHours: '36 - 48 h',
    description:
      'Entrena a tu cuerpo para reciclar el lactato tan rápido como lo produce (MLSS). Fundamental para mejorar tus marcas en 10K, Media Maratón y Maratón.',
    scores: {
      aerobicBase: 6,
      lactateThreshold: 10,
      vo2Max: 6,
      runningEconomy: 8,
      muscularStrength: 6,
      glycogenEndurance: 7
    }
  },
  intervals: {
    id: 'intervals',
    name: 'Series / Intervalos VO2max',
    shortName: 'Series VO2max',
    zone: 'Z5 (92-100% FC)',
    color: '#e11d48',
    badgeClass: 'badge-intervals',
    primaryBenefit: 'Volumen sistólico cardíaco y potencia aeróbica máxima (VO2max)',
    recoveryHours: '48 - 72 h',
    description:
      'Repeticiones de 400m a 1600m a ritmo de 3K-5K. Eleva el techo aeróbico (VO2max), fortalece el músculo cardíaco y recluta fibras rápidas (Tipo IIa).',
    scores: {
      aerobicBase: 4,
      lactateThreshold: 7,
      vo2Max: 10,
      runningEconomy: 9,
      muscularStrength: 8,
      glycogenEndurance: 4
    }
  },
  long: {
    id: 'long',
    name: 'Tirada Larga / Fondo Aeróbico',
    shortName: 'Tirada Larga',
    zone: 'Z2 (68-78% FC)',
    color: '#0284c7',
    badgeClass: 'badge-long',
    primaryBenefit: 'Reservas de glucógeno, resistencia a la fatiga y fortaleza tendinosa',
    recoveryHours: '36 - 60 h',
    description:
      'Expande los depósitos de glucógeno muscular y hepático, enseña al cuerpo a usar ácidos grasos cuando baja el glucógeno y fortalece tendones y mente.',
    scores: {
      aerobicBase: 10,
      lactateThreshold: 4,
      vo2Max: 3,
      runningEconomy: 7,
      muscularStrength: 6,
      glycogenEndurance: 10
    }
  },
  fartlek: {
    id: 'fartlek',
    name: 'Fartlek / Cambios de Ritmo',
    shortName: 'Fartlek',
    zone: 'Z2 a Z4 Variable',
    color: '#9333ea',
    badgeClass: 'badge-fartlek',
    primaryBenefit: 'Transición aeróbica-anaeróbica y flexibilidad metabólica',
    recoveryHours: '24 - 48 h',
    description:
      'Alterna segmentos rápidos y recuperación activa continua. Enseña al organismo a recuperar pulsaciones y limpiar lactato mientras sigues corriendo a buen ritmo.',
    scores: {
      aerobicBase: 7,
      lactateThreshold: 8,
      vo2Max: 7,
      runningEconomy: 8,
      muscularStrength: 6,
      glycogenEndurance: 6
    }
  },
  hills: {
    id: 'hills',
    name: 'Cuestas / Potencia Específica',
    shortName: 'Cuestas',
    zone: 'Z4 - Z5 / Neuromuscular',
    color: '#ea580c',
    badgeClass: 'badge-hills',
    primaryBenefit: 'Fuerza específica de glúteos/gemelos y economía con menor impacto',
    recoveryHours: '36 - 48 h',
    description:
      'Construye potencia en la cadena posterior (glúteos, isquios, sóleos) y mejora la reactividad del tendón de Aquiles con menor impacto articular que en llano.',
    scores: {
      aerobicBase: 4,
      lactateThreshold: 6,
      vo2Max: 8,
      runningEconomy: 9,
      muscularStrength: 10,
      glycogenEndurance: 4
    }
  },
  strength: {
    id: 'strength',
    name: 'Fuerza / Core / Prevención',
    shortName: 'Fuerza & Core',
    zone: 'Neuromuscular',
    color: '#db2777',
    badgeClass: 'badge-strength',
    primaryBenefit: 'Estabilidad pélvica, prevención de lesiones y economía de carrera',
    recoveryHours: '24 - 48 h',
    description:
      'Entrenamiento de fuerza reactiva, unilateral y core. Mejora la economía de carrera hasta un 4-6% y protege rodillas, cadera y tendón de Aquiles.',
    scores: {
      aerobicBase: 1,
      lactateThreshold: 2,
      vo2Max: 2,
      runningEconomy: 9,
      muscularStrength: 10,
      glycogenEndurance: 3
    }
  },
  race: {
    id: 'race',
    name: 'Competición / Test de Campo',
    shortName: 'Carrera / Test',
    zone: 'Z4 - Z5 (Esfuerzo Máx)',
    color: '#ca8a04',
    badgeClass: 'badge-race',
    primaryBenefit: 'Expresión máxima de rendimiento y calibración de zonas VDOT',
    recoveryHours: '72 - 120 h',
    description:
      'Pone a prueba todos los sistemas fisiológicos y psicológicos simultáneamente. Sirve para actualizar tu VDOT y recalibrar los ritmos.',
    scores: {
      aerobicBase: 7,
      lactateThreshold: 9,
      vo2Max: 9,
      runningEconomy: 8,
      muscularStrength: 8,
      glycogenEndurance: 9
    }
  },
  rest: {
    id: 'rest',
    name: 'Descanso / Supercompensación',
    shortName: 'Descanso',
    zone: 'Recuperación',
    color: '#64748b',
    badgeClass: 'badge-rest',
    primaryBenefit: 'Reparación fibrilar, síntesis proteica y equilibrio hormonal',
    recoveryHours: '0 h',
    description:
      'Las adaptaciones ocurren durante el descanso. Permite que el sistema nervioso parasimpático asimile la carga de entrenamiento.',
    scores: {
      aerobicBase: 2,
      lactateThreshold: 1,
      vo2Max: 1,
      runningEconomy: 2,
      muscularStrength: 2,
      glycogenEndurance: 4
    }
  }
};

const PHYSIOLOGY_DIMENSIONS = [
  { key: 'aerobicBase', label: 'Base Aeróbica y Capilares' },
  { key: 'lactateThreshold', label: 'Umbral de Lactato' },
  { key: 'vo2Max', label: 'Potencia VO2 Máx' },
  { key: 'runningEconomy', label: 'Economía de Carrera' },
  { key: 'muscularStrength', label: 'Fuerza Muscular / Tendinosa' },
  { key: 'glycogenEndurance', label: 'Resistencia y Glucógeno' }
];

// ============================================================================
// ENCICLOPEDIA DE DATOS CURIOSOS DEL RUNNING (CIENCIA, CULTURA Y PRÁCTICA)
// ============================================================================

const DEFAULT_RUNNING_FACTS = [
  {
    id: 'fact-1',
    category: 'Fisiología',
    title: 'El lactato no es el culpable del dolor muscular ni un desecho tóxico',
    fact: 'Durante décadas se creyó que el ácido láctico causaba las agujetas y la fatiga. Hoy sabemos que el lactato es un combustible premium: tu corazón y tu cerebro lo oxidan directamente para obtener energía mientras corres.',
    tip: 'Los entrenamientos de Tempo (Z3-Z4) multiplican los transportadores MCT1 que convierten el lactato en energía limpia.'
  },
  {
    id: 'fact-2',
    category: 'Biomecánica',
    title: 'El tendón de Aquiles devuelve hasta el 35% de la energía gratis en cada zancada',
    fact: 'El tendón de Aquiles funciona como un resorte biológico de alta precisión. Al aterrizar almacena energía elástica y al despegar la libera sin gastar oxígeno adicional.',
    tip: 'Subir la cadencia cerca de 172-180 pasos por minuto y hacer saltos suaves o elevaciones de talón mejora ese retorno elástico.'
  },
  {
    id: 'fact-3',
    category: 'Entrenamiento',
    title: '¿Por qué el 80% de los kilómetros de los campeones olímpicos son lentos?',
    fact: 'El fisiólogo Stephen Seiler demostró que los corredores de élite hacen ~80% de sus sesiones en Zona 1-2 (ritmo conversacional). Correr suave estimula mitocondrias y capilares sin estresar el sistema nervioso autónomo.',
    tip: 'Si en tu rodaje suave no puedes hablar en frases completas sin jadear, vas demasiado rápido para estar en Zona 2.'
  },
  {
    id: 'fact-4',
    category: 'Fisiología',
    title: 'Tu volumen de sangre aumenta hasta un 15% tras 3 semanas de running constante',
    fact: 'Una de las primeras adaptaciones al correr es la expansión del plasma sanguíneo. Más volumen de sangre significa que tu corazón bombea más oxígeno en cada latido con menos pulsaciones.',
    tip: 'Hidratarte con agua y una pizca de electrolitos después de rodar acelera esta expansión plasmática.'
  },
  {
    id: 'fact-5',
    category: 'Nutrición',
    title: 'El "Muro" del kilómetro 30 ocurre porque el cuerpo solo guarda ~2000 kcal de glucógeno',
    fact: 'Los músculos y el hígado almacenan cerca de 400-500 gramos de carbohidratos en forma de glucógeno. A ritmo de carrera, esa reserva dura entre 75 y 90 minutos.',
    tip: 'En tiradas largas mayores a 75 minutos, practica ingerir 30 a 60g de carbohidratos por hora antes de sentir hambre.'
  },
  {
    id: 'fact-6',
    category: 'Biomecánica',
    title: 'Alternar entre 2 pares de zapatillas reduce el riesgo de lesión en un 39%',
    fact: 'Un estudio publicado en el Scandinavian Journal of Medicine & Science in Sports demostró que rotar zapatillas con diferente espuma o drop varía milimétricamente las cargas sobre tendones y huesos.',
    tip: 'Si usas más de un par, deja al menos 24-48h entre usos para que la espuma EVA/PEBA recupere su descompresión original.'
  },
  {
    id: 'fact-7',
    category: 'Fisiología',
    title: 'El "Runner’s High" no lo producen las endorfinas, sino los endocannabinoides',
    fact: 'Las endorfinas son moléculas demasiado grandes para cruzar la barrera hematoencefálica. La sensación de paz y euforia tras correr de 35 a 50 minutos proviene de la anandamida, un endocannabinoide natural del cerebro.',
    tip: 'Los rodajes continuos en Zona 2-3 de al menos 40 minutos son los que generan mayor liberación de anandamida.'
  },
  {
    id: 'fact-8',
    category: 'Historia',
    title: 'El récord mundial de maratón equivale a correr 422 series seguidas de 100 metros en 17 segundos',
    fact: 'Correr un maratón en cerca de 2 horas implica sostener un ritmo aproximado de 2:50 min/km (21.1 km/h) durante más de 42 kilómetros sin parar.',
    tip: 'La clave de los maratonistas no es solo el VO2max, sino la economía de carrera: gastar menos oxígeno al mismo ritmo.'
  },
  {
    id: 'fact-9',
    category: 'Entrenamiento',
    title: 'El entrenamiento de fuerza pesada mejora tu economía de carrera hasta un 5%',
    fact: 'A diferencia del mito de que las pesas "vuelven lento al corredor", ejercicios como sentadilla búlgara y peso muerto mejoran la coordinación neuromuscular sin aumentar peso corporal.',
    tip: 'Agenda tus sesiones de fuerza al menos 6 horas después de correr o en días suaves, nunca justo antes de hacer series.'
  },
  {
    id: 'fact-10',
    category: 'Fisiología',
    title: 'El músculo sóleo es el verdadero motor oculto del corredor de fondo',
    fact: 'Estudios de biomecánica revelan que el sóleo (debajo de los gemelos) soporta fuerzas de hasta 6 a 8 veces tu peso corporal durante el trote y está compuesto en un 80% por fibras resistentes a la fatiga.',
    tip: 'Fortalece el sóleo haciendo elevaciones de talón con las rodillas flexionadas (sentado o en pared).'
  },
  {
    id: 'fact-11',
    category: 'Nutrición',
    title: 'El jugo de remolacha (betabel) reduce el costo de oxígeno al correr',
    fact: 'Los nitratos naturales de la remolacha se convierten en óxido nítrico en la sangre, dilatando los vasos sanguíneos y haciendo que las mitocondrias produzcan más energía con menos oxígeno.',
    tip: 'Consumir remolacha o espinaca 2 a 3 horas antes de un test de 5K o 10K puede mejorar tu rendimiento entre 1% y 2%.'
  },
  {
    id: 'fact-12',
    category: 'Entrenamiento',
    title: 'La deriva cardíaca te avisa cuándo te estás deshidratando o quedando sin glucógeno',
    fact: 'Si corres al mismo ritmo constante pero después del minuto 40 tus pulsaciones suben 8-12 ppm (deriva cardíaca), tu corazón está latiendo más rápido porque perdió volumen sanguíneo por sudor.',
    tip: 'Una deriva menor al 5% en tu tirada larga indica que tu base aeróbica en Zona 2 está muy sólida.'
  },
  {
    id: 'fact-13',
    category: 'Biomecánica',
    title: 'Tus pies golpean el suelo unas 800 a 1,000 veces por cada kilómetro corrido',
    fact: 'En una carrera de 10K das cerca de 9,000 pasos. Aterrizar ligeramente más cerca de tu centro de gravedad (debajo de tu cadera y no adelante) frena menos tu impulso.',
    tip: 'En lugar de intentar alargar la zancada hacia adelante, enfócate en empujar el suelo hacia atrás.'
  },
  {
    id: 'fact-14',
    category: 'Fisiología',
    title: 'Correr estimula el nacimiento de nuevas neuronas en el hipocampo',
    fact: 'El ejercicio aeróbico libera una proteína llamada BDNF (Factor Neurotrófico Derivado del Cerebro), que actúa como fertilizante neuronal mejorando la memoria y el aprendizaje.',
    tip: 'Una carrera suave de 30 minutos por la mañana mejora el enfoque cognitivo durante las siguientes 4 a 6 horas.'
  },
  {
    id: 'fact-15',
    category: 'Entrenamiento',
    title: 'No pierdes tu condición aeróbica por descansar de 3 a 5 días',
    fact: 'El VO2max y la capilarización muscular tardan más de 10 a 14 días de inactividad total en empezar a disminuir de forma significativa. En cambio, descansar 3 días ante una molestia evita semanas de lesión.',
    tip: 'Cuando sientas fatiga acumulada o RPE muy alto, cambiar un entreno por descanso produce supercompensación.'
  },
  {
    id: 'fact-16',
    category: 'Historia',
    title: '¿Por qué el maratón mide exactamente 42 kilómetros y 195 metros?',
    fact: 'En los primeros Juegos Olímpicos modernos (1896) medía unos 40 km. Fue en Londres 1908 cuando se alargó a 42.195 km para que la salida fuera frente al Castillo de Windsor y la meta frente al palco real.',
    tip: 'En el predictor VDOT de la pestaña Objetivos puedes ver tu proyección exacta para los 42.195 km.'
  }
];

// Estado global en memoria
let multiStore = null; // Contiene { activeUserId, users: [...] }
let appState = null;   // Referencia directa al state del corredor activo
let currentWeekOffset = 0;
let selectedPhysiologyType = 'intervals';
let currentModalScreenshots = [];
let currentCuriousFactIndex = 0;
let reminderCheckInterval = null;

// Instancias de gráficas Chart.js
let volumeChartInstance = null;
let paceHrChartInstance = null;
let radarChartInstance = null;
let intensityChartInstance = null;
let banisterChartInstance = null;

// ============================================================================
// UTILIDADES DE FECHAS, TIEMPOS Y SONIDO DE RECORDATORIO
// ============================================================================

function getLocalISODate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMondayOfWeek(weekOffset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDateISO(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortSpanishDate(isoStr) {
  if (!isoStr) return '--';
  const [y, m, d] = isoStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const clean = timeStr.trim();
  const parts = clean.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatSecondsToTime(totalSeconds, forceHours = false) {
  if (!totalSeconds || totalSeconds <= 0 || !isFinite(totalSeconds)) return '--:--';
  const sec = Math.round(totalSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0 || forceHours) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function paceStringToDecimalMinutes(paceStr) {
  const secs = parseTimeToSeconds(paceStr);
  return secs > 0 ? secs / 60 : 0;
}

function decimalMinutesToPaceString(decMin) {
  if (!decMin || decMin <= 0 || !isFinite(decMin)) return '--:--';
  return formatSecondsToTime(Math.round(decMin * 60));
}

function scrollToElement(elementId) {
  setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// Sonido suave de campana con Web Audio API para recordatorios
function playReminderChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.14); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch (_) {
    // Ignorar si el navegador bloquea audio sin interacción
  }
}

// ============================================================================
// CÁLCULOS FISIOLÓGICOS (JACK DANIELS VDOT & KARVONEN HR ZONES)
// ============================================================================

function calculateVDOTFromRace(distanceMeters, timeSeconds) {
  if (!distanceMeters || !timeSeconds || timeSeconds <= 0) return null;
  const tMin = timeSeconds / 60;
  const velocity = distanceMeters / tMin;
  const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity;
  const percentMax =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * tMin) +
    0.2989558 * Math.exp(-0.1932605 * tMin);
  const vdot = vo2 / percentMax;
  return vdot > 20 && vdot < 90 ? vdot : null;
}

function getRunnerVDOT(profile) {
  if (!profile) return 45.0;
  const candidates = [];
  const s5k = parseTimeToSeconds(profile.pr5k);
  if (s5k > 0) candidates.push(calculateVDOTFromRace(5000, s5k));
  const s10k = parseTimeToSeconds(profile.pr10k);
  if (s10k > 0) candidates.push(calculateVDOTFromRace(10000, s10k));
  const s21k = parseTimeToSeconds(profile.pr21k);
  if (s21k > 0) candidates.push(calculateVDOTFromRace(21097.5, s21k));
  const s42k = parseTimeToSeconds(profile.pr42k);
  if (s42k > 0) candidates.push(calculateVDOTFromRace(42195, s42k));

  const valid = candidates.filter((v) => v !== null);
  if (valid.length > 0) return Math.max(...valid);
  if (profile.vo2max && Number(profile.vo2max) > 25) return Number(profile.vo2max);
  return 45.0;
}

function getPacePerKmForVDOTIntensity(vdot, intensityPct) {
  const targetVo2 = vdot * intensityPct;
  const a = 0.000104;
  const b = 0.182258;
  const c = -(4.6 + targetVo2);
  const velocity = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  return (1000 / velocity) * 60;
}

function predictRaceTimeSeconds(vdot, distanceMeters) {
  let low = 600;
  let high = 36000;
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const est = calculateVDOTFromRace(distanceMeters, mid);
    if (est && est > vdot) low = mid;
    else high = mid;
  }
  return Math.round((low + high) / 2);
}

function getTrainingZones(profile) {
  const maxHR = Number(profile.maxHR) || (220 - (Number(profile.age) || 30));
  const restHR = Number(profile.restHR) || 55;
  const hrr = Math.max(maxHR - restHR, 80);
  const vdot = getRunnerVDOT(profile);
  const calcHR = (pct) => Math.round(restHR + hrr * pct);

  return [
    {
      zone: 'Z1',
      name: 'Recuperación Activa',
      hrRange: `${calcHR(0.55)} - ${calcHR(0.65)} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.62))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.56))} /km`,
      dot: 'bg-slate-400',
      desc: 'Calentamiento, enfriamiento y regeneración muscular.'
    },
    {
      zone: 'Z2',
      name: 'Base Aeróbica / Conversacional',
      hrRange: `${calcHR(0.65)} - ${calcHR(0.76)} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.72))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.65))} /km`,
      dot: 'bg-emerald-500',
      desc: 'Rodajes suaves y tiradas largas (pilar del 80% semanal).'
    },
    {
      zone: 'Z3',
      name: 'Tempo Aeróbico / Ritmo Maratón',
      hrRange: `${calcHR(0.76)} - ${calcHR(0.84)} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.81))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.76))} /km`,
      dot: 'bg-sky-500',
      desc: 'Esfuerzo controlado sostenido y resistencia específica.'
    },
    {
      zone: 'Z4',
      name: 'Umbral de Lactato',
      hrRange: `${calcHR(0.84)} - ${calcHR(0.91)} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.88))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.84))} /km`,
      dot: 'bg-amber-500',
      desc: 'Ritmo sostenible ~45-60 min. Mejora el reciclaje de lactato.'
    },
    {
      zone: 'Z5',
      name: 'Potencia VO2 Máx / Series',
      hrRange: `${calcHR(0.91)} - ${maxHR} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 1.0))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.94))} /km`,
      dot: 'bg-rose-500',
      desc: 'Intervalos intensos de 2 a 5 minutos. Eleva el techo aeróbico.'
    }
  ];
}

// ============================================================================
// DATOS POR DEFECTO Y PLANTILLAS MULTI-CORREDOR
// ============================================================================

function createDefaultState() {
  const monday = getMondayOfWeek(0);
  const dayISO = (offsetFromMonday) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offsetFromMonday);
    return formatDateISO(d);
  };

  return {
    profile: {
      name: 'Dykembel',
      age: 31,
      weight: 68.5,
      height: 175,
      restHR: 51,
      maxHR: 191,
      lthr: 173,
      vo2max: 50.5,
      cadence: 174,
      experience: 'intermedio',
      daysAvailable: 5,
      longRunDay: 'Domingo',
      pr5k: '21:40',
      pr10k: '45:10',
      pr21k: '01:41:30',
      pr42k: '',
      terrain: 'Asfalto y parque con ligeras ondulaciones',
      shoes: 'Entrenamiento diario + Zapatilla mixta para series',
      injuries: 'Ligera sobrecarga en sóleo si encadeno dos días de series sin rodaje suave intermedio.'
    },
    goals: [
      {
        id: 'goal-1',
        name: 'Media Maratón Sub 1h36m',
        distanceKm: 21.0975,
        date: getLocalISODate(65),
        targetTime: '01:35:59',
        priority: 'A',
        notes: 'Circuito rápido de asfalto, objetivo mantener 4:33 min/km.'
      },
      {
        id: 'goal-2',
        name: '10K Control de Velocidad',
        distanceKm: 10.0,
        date: getLocalISODate(25),
        targetTime: '43:00',
        priority: 'B',
        notes: 'Carrera preparatoria para medir umbral.'
      }
    ],
    reminders: [
      {
        id: 'rem-1',
        title: 'Sesión de Running del Día',
        time: '18:00',
        daysMode: 'training_days',
        enabled: true
      },
      {
        id: 'rem-2',
        title: 'Hidratación pre-entreno y movilidad de tobillos',
        time: '17:15',
        daysMode: 'training_days',
        enabled: true
      }
    ],
    favoriteFacts: ['fact-1', 'fact-3'],
    customFacts: [],
    workouts: [
      {
        id: 'w-prev-1',
        date: dayISO(-6),
        type: 'easy',
        title: 'Rodaje Aeróbico Z2 + 4 Progresivos',
        status: 'completed',
        plannedKm: 8.0,
        plannedMin: 42,
        plannedPace: '05:15',
        plannedZone: 'Z2',
        actualKm: 8.2,
        actualMin: 42.5,
        actualPace: '05:11',
        actualHR: 145,
        actualMaxHR: 162,
        actualCadence: 173,
        actualElevation: 45,
        actualCalories: 510,
        actualRpe: 4,
        watchAnalysis: 'Zonas FC: 84% en Z2, 16% en Z3. Parciales regulares entre 5:08 y 5:14/km.',
        notes: 'Sensaciones muy fluidas, respiración cómoda.',
        screenshots: []
      },
      {
        id: 'w-prev-2',
        date: dayISO(-4),
        type: 'intervals',
        title: 'Series 5x1000m ritmo 5K (rec 90s)',
        status: 'completed',
        plannedKm: 9.5,
        plannedMin: 46,
        plannedPace: '04:20',
        plannedZone: 'Z5',
        actualKm: 9.5,
        actualMin: 45.0,
        actualPace: '04:18',
        actualHR: 179,
        actualMaxHR: 188,
        actualCadence: 182,
        actualElevation: 15,
        actualCalories: 640,
        actualRpe: 8,
        watchAnalysis: '5x1000m en: 4:16, 4:15, 4:13, 4:14, 4:11. Training Effect Aeróbico 4.1.',
        notes: 'Última serie exigente pero manteniendo cadencia alta.',
        screenshots: []
      },
      {
        id: 'w-prev-3',
        date: dayISO(-2),
        type: 'easy',
        title: 'Rodaje Regenerativo Suave',
        status: 'completed',
        plannedKm: 7.0,
        plannedMin: 38,
        plannedPace: '05:25',
        plannedZone: 'Z1-Z2',
        actualKm: 7.0,
        actualMin: 37.8,
        actualPace: '05:24',
        actualHR: 139,
        actualMaxHR: 148,
        actualCadence: 171,
        actualElevation: 30,
        actualCalories: 430,
        actualRpe: 3,
        watchAnalysis: '92% del tiempo en Z1-Z2. Recuperación cardíaca óptima.',
        notes: 'Piernas recuperadas.',
        screenshots: []
      },
      {
        id: 'w-prev-4',
        date: dayISO(-1),
        type: 'long',
        title: 'Tirada Larga Progresiva Z2',
        status: 'completed',
        plannedKm: 16.0,
        plannedMin: 83,
        plannedPace: '05:12',
        plannedZone: 'Z2',
        actualKm: 16.5,
        actualMin: 84.5,
        actualPace: '05:07',
        actualHR: 151,
        actualMaxHR: 168,
        actualCadence: 175,
        actualElevation: 120,
        actualCalories: 1050,
        actualRpe: 6,
        watchAnalysis: 'Bloque inicial 13km a 5:12/km + cierre 3.5km a 4:48/km. Baja deriva cardíaca.',
        notes: 'Últimos 3 km sintiéndome fuerte.',
        screenshots: []
      },
      {
        id: 'w-curr-1',
        date: dayISO(0),
        type: 'easy',
        title: 'Rodaje Base Aeróbica Z2 + Movilidad',
        status: 'planned',
        plannedKm: 8.0,
        plannedMin: 42,
        plannedPace: '05:15',
        plannedZone: 'Z2 (140-154 ppm)',
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualRpe: 4,
        watchAnalysis: '',
        notes: 'Mantener pulsaciones controladas y cadencia ligera.',
        screenshots: []
      },
      {
        id: 'w-curr-2',
        date: dayISO(1),
        type: 'easy',
        title: 'Rodaje Aeróbico Constante',
        status: 'completed',
        plannedKm: 8.5,
        plannedMin: 44,
        plannedPace: '05:12',
        plannedZone: 'Z2 (140-154 ppm)',
        actualKm: 8.5,
        actualMin: 43.5,
        actualPace: '05:07',
        actualHR: 146,
        actualMaxHR: 156,
        actualCadence: 175,
        actualElevation: 52,
        actualCalories: 540,
        actualRpe: 5,
        watchAnalysis: 'Cadencia constante 175 spm, 88% en Zona 2 aeróbica.',
        notes: 'Buen ritmo aeróbico con pulsaciones controladas.',
        screenshots: []
      },
      {
        id: 'w-curr-3',
        date: dayISO(2),
        type: 'tempo',
        title: '2km Z2 + 6km Tempo Umbral + 1.5km Z1',
        status: 'modified',
        plannedKm: 9.5,
        plannedMin: 45,
        plannedPace: '04:32',
        plannedZone: 'Z4 (165-174 ppm)',
        actualKm: 7.5,
        actualMin: 36.5,
        actualPace: '04:42',
        actualHR: 171,
        actualMaxHR: 181,
        actualCadence: 176,
        actualElevation: 65,
        actualCalories: 515,
        actualRpe: 8,
        watchAnalysis: 'Deriva cardíaca alta a partir del km 4 por humedad y calor.',
        notes: 'Recorté 2 km del bloque Tempo porque sentí pesadez muscular y calor.',
        screenshots: []
      },
      {
        id: 'w-curr-4',
        date: dayISO(3),
        type: 'strength',
        title: 'Fuerza Específica Running & Core',
        status: 'planned',
        plannedKm: 0,
        plannedMin: 40,
        plannedPace: '--:--',
        plannedZone: 'Neuromuscular',
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualRpe: 5,
        watchAnalysis: '',
        notes: 'Sentadilla búlgara, elevación de talones para sóleo y planchas.',
        screenshots: []
      },
      {
        id: 'w-curr-5',
        date: dayISO(4),
        type: 'intervals',
        title: '6x800m VO2max en Pista (rec 200m trote)',
        status: 'planned',
        plannedKm: 9.0,
        plannedMin: 44,
        plannedPace: '04:12',
        plannedZone: 'Z5 (176-186 ppm)',
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualRpe: 7,
        watchAnalysis: '',
        notes: 'Mantener regularidad entre la primera y sexta repetición.',
        screenshots: []
      },
      {
        id: 'w-curr-6',
        date: dayISO(5),
        type: 'easy',
        title: 'Rodaje Suave Regenerativo Pre-Fondo',
        status: 'planned',
        plannedKm: 6.5,
        plannedMin: 35,
        plannedPace: '05:22',
        plannedZone: 'Z1-Z2',
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualRpe: 4,
        watchAnalysis: '',
        notes: 'Soltar piernas antes de la tirada larga.',
        screenshots: []
      },
      {
        id: 'w-curr-7',
        date: dayISO(6),
        type: 'long',
        title: 'Tirada Larga 18 km (Últimos 4 km a Ritmo Media Maratón)',
        status: 'planned',
        plannedKm: 18.0,
        plannedMin: 92,
        plannedPace: '05:06',
        plannedZone: 'Z2 -> Z3',
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualRpe: 7,
        watchAnalysis: '',
        notes: 'Probar hidratación y gel en el km 10.',
        screenshots: []
      }
    ],
    coachFeedback: {
      lastUpdated: getLocalISODate(0),
      summary:
        'En tu última sesión de Tempo recortaste 2 km con RPE 8/10 por calor. He ajustado las recomendaciones del día para priorizar hidratación y mantener tu próximo rodaje estrictamente en Zona 2.',
      recommendations: [
        'Mantener el próximo rodaje suave por debajo de 150 ppm.',
        'Realizar ejercicios excéntricos de sóleo en la sesión de fuerza.'
      ]
    }
  };
}

function createSecondDemoRunnerState() {
  const monday = getMondayOfWeek(0);
  const dayISO = (offsetFromMonday) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offsetFromMonday);
    return formatDateISO(d);
  };

  return {
    profile: {
      name: 'Laura (10K & Salud)',
      age: 28,
      weight: 58.0,
      height: 165,
      restHR: 56,
      maxHR: 192,
      lthr: 174,
      vo2max: 44.0,
      cadence: 172,
      experience: 'principiante',
      daysAvailable: 4,
      longRunDay: 'Sábado',
      pr5k: '26:15',
      pr10k: '54:30',
      pr21k: '',
      pr42k: '',
      terrain: 'Parque arbolado y pista',
      shoes: 'Asics Novablast 4',
      injuries: 'Evitar aumentos bruscos de kilometraje semanal (>10% por semana).'
    },
    goals: [
      {
        id: 'goal-laura-1',
        name: '10K Sub 50 Minutos',
        distanceKm: 10.0,
        date: getLocalISODate(45),
        targetTime: '49:59',
        priority: 'A',
        notes: 'Mantener ritmo constante de 5:00 min/km.'
      }
    ],
    reminders: [
      {
        id: 'rem-laura-1',
        title: 'Entrenamiento matutino 10K',
        time: '07:00',
        daysMode: 'training_days',
        enabled: true
      }
    ],
    favoriteFacts: ['fact-2', 'fact-7'],
    customFacts: [],
    workouts: [
      {
        id: 'wl-1',
        date: dayISO(-2),
        type: 'easy',
        title: 'Rodaje Cómodo Conversacional Z2',
        status: 'completed',
        plannedKm: 5.0,
        plannedMin: 30,
        plannedPace: '06:00',
        plannedZone: 'Z2',
        actualKm: 5.2,
        actualMin: 30.5,
        actualPace: '05:52',
        actualHR: 148,
        actualMaxHR: 158,
        actualCadence: 172,
        actualElevation: 25,
        actualCalories: 310,
        actualRpe: 4,
        watchAnalysis: '90% en Zona 2 aeróbica. Sensación muy cómoda.',
        notes: 'Muy motivada y sin molestias.',
        screenshots: []
      },
      {
        id: 'wl-2',
        date: dayISO(0),
        type: 'fartlek',
        title: 'Fartlek 6x (2 min alegre Z3 + 2 min suave Z2)',
        status: 'planned',
        plannedKm: 6.0,
        plannedMin: 35,
        plannedPace: '05:35',
        plannedZone: 'Z2-Z3',
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualRpe: 5,
        watchAnalysis: '',
        notes: 'Disfrutar los cambios de ritmo sin llegar al agotamiento.',
        screenshots: []
      },
      {
        id: 'wl-3',
        date: dayISO(2),
        type: 'easy',
        title: 'Rodaje Suave + Técnica de Carrera',
        status: 'planned',
        plannedKm: 5.0,
        plannedMin: 30,
        plannedPace: '06:00',
        plannedZone: 'Z2',
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualRpe: 4,
        watchAnalysis: '',
        notes: 'Enfocarse en postura alta y cadencia.',
        screenshots: []
      },
      {
        id: 'wl-4',
        date: dayISO(5),
        type: 'long',
        title: 'Fondo Suave de Sábado 9 km',
        status: 'planned',
        plannedKm: 9.0,
        plannedMin: 54,
        plannedPace: '06:00',
        plannedZone: 'Z2',
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualRpe: 5,
        watchAnalysis: '',
        notes: 'Correr en compañía a ritmo conversacional.',
        screenshots: []
      }
    ],
    coachFeedback: {
      lastUpdated: getLocalISODate(0),
      summary: 'Excelente constancia en tus rodajes suaves. Tu eficiencia aeróbica está mejorando semana a semana rumbo a tu meta de 10K.',
      recommendations: [
        'En el Fartlek de hoy concéntrate en soltar los hombros y respirar profundo.',
        'Mantén el fondo del sábado en ritmo conversacional.'
      ]
    }
  };
}

// ============================================================================
// GESTIÓN MULTI-USUARIO LOCAL, PERSISTENCIA Y TEMA VISUAL
// ============================================================================

function ensureUserStateIntegrity(stateObj) {
  if (!stateObj.reminders) {
    stateObj.reminders = [
      {
        id: `rem-${Date.now()}`,
        title: 'Entrenamiento del Día',
        time: '18:00',
        daysMode: 'training_days',
        enabled: true
      }
    ];
  }
  if (!Array.isArray(stateObj.favoriteFacts)) stateObj.favoriteFacts = ['fact-1'];
  if (!Array.isArray(stateObj.customFacts)) stateObj.customFacts = [];
  if (!Array.isArray(stateObj.workouts)) stateObj.workouts = [];
  if (!Array.isArray(stateObj.goals)) stateObj.goals = [];
  return stateObj;
}

function createInitialMultiStore() {
  // Verificar si existen datos previos de la versión v1 para migrarlos sin pérdida
  let firstUserState = createDefaultState();
  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      if (parsedLegacy && parsedLegacy.profile && Array.isArray(parsedLegacy.workouts)) {
        firstUserState = ensureUserStateIntegrity(parsedLegacy);
      }
    }
  } catch (e) {
    console.warn('No se pudo migrar estado previo:', e);
  }

  if (
    !firstUserState.profile.name ||
    firstUserState.profile.name === 'Carlos (Media Maratón)' ||
    firstUserState.profile.name === 'Corredor RunPulse'
  ) {
    firstUserState.profile.name = 'Dykembel';
  }

  return {
    activeUserId: 'user-1',
    users: [
      {
        id: 'user-1',
        color: '#059669',
        createdAt: getLocalISODate(0),
        state: ensureUserStateIntegrity(firstUserState)
      }
    ]
  };
}

function loadState() {
  // Cargar tema visual (Claro por defecto)
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  applyTheme(savedTheme);

  try {
    const raw = localStorage.getItem(MULTI_USER_STORAGE_KEY);
    if (raw) {
      multiStore = JSON.parse(raw);
      if (!multiStore || !Array.isArray(multiStore.users) || multiStore.users.length === 0) {
        multiStore = createInitialMultiStore();
      } else {
        // Eliminar perfil demostrativo de Laura si estaba guardado en caché local
        multiStore.users = multiStore.users.filter(
          (u) => u.id !== 'user-2' && !String(u.state?.profile?.name || '').includes('Laura')
        );
        if (multiStore.users.length === 0) {
          multiStore = createInitialMultiStore();
        }
        // Asegurar que el usuario principal lleve por nombre Dykembel si tenía el nombre por defecto anterior
        const mainUser = multiStore.users[0];
        if (
          mainUser?.state?.profile &&
          (mainUser.state.profile.name === 'Carlos (Media Maratón)' ||
            mainUser.state.profile.name === 'Corredor RunPulse')
        ) {
          mainUser.state.profile.name = 'Dykembel';
        }
      }
    } else {
      multiStore = createInitialMultiStore();
    }
  } catch (e) {
    console.error('Error cargando multi-usuario:', e);
    multiStore = createInitialMultiStore();
  }

  const activeUser = getActiveUserEntry();
  appState = ensureUserStateIntegrity(activeUser.state);
  saveState();

  const savedKey = localStorage.getItem(GEMINI_KEY_STORAGE);
  if (savedKey) {
    const input = document.getElementById('geminiApiKeyInput');
    if (input) input.value = savedKey;
  }

  // Seleccionar dato curioso del día según la fecha actual
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const allFacts = getAllAvailableFacts();
  currentCuriousFactIndex = dayOfYear % allFacts.length;
}

function getActiveUserEntry() {
  let found = multiStore.users.find((u) => u.id === multiStore.activeUserId);
  if (!found) {
    found = multiStore.users[0];
    multiStore.activeUserId = found.id;
  }
  return found;
}

function saveState() {
  try {
    const activeUser = getActiveUserEntry();
    if (activeUser && appState) {
      activeUser.state = appState;
    }
    localStorage.setItem(MULTI_USER_STORAGE_KEY, JSON.stringify(multiStore));
    // Mantener sincronizada también la llave v1 para compatibilidad total
    if (appState) {
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(appState));
    }
  } catch (e) {
    console.error('Error guardando estado:', e);
    showToast('Aviso: Almacenamiento local lleno. Exporta un respaldo JSON.');
  }
}

function applyTheme(theme) {
  const htmlEl = document.documentElement;
  const iconEl = document.getElementById('themeToggleIcon');
  if (theme === 'dark') {
    htmlEl.classList.add('dark');
    if (iconEl) iconEl.setAttribute('data-lucide', 'sun');
  } else {
    htmlEl.classList.remove('dark');
    if (iconEl) iconEl.setAttribute('data-lucide', 'moon');
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  if (window.lucide) lucide.createIcons();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  applyTheme(isDark ? 'light' : 'dark');
  renderDashboardCharts();
  if (!document.getElementById('tab-physiology')?.classList.contains('hidden')) {
    updatePhysiologyRadar();
    renderIntensityPolarizationChart();
  }
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;
  msgEl.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('flex');
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 3400);
}

// ============================================================================
// MODAL Y GESTIÓN DE MÚLTIPLES CORREDORES LOCALES
// ============================================================================

function openUsersModal() {
  renderUsersModalList();
  const modal = document.getElementById('usersModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  if (window.lucide) lucide.createIcons();
}

function closeUsersModal() {
  const modal = document.getElementById('usersModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderUsersModalList() {
  const container = document.getElementById('usersListContainer');
  if (!container) return;

  const usersHtml = multiStore.users
    .map((u) => {
      const isActive = u.id === multiStore.activeUserId;
      const p = u.state.profile || {};
      const vdot = getRunnerVDOT(p).toFixed(1);
      const completedCount = (u.state.workouts || []).filter(
        (w) => w.status === 'completed' || w.status === 'modified'
      ).length;
      const initial = (p.name || 'D').trim().charAt(0).toUpperCase();

      return `
        <div class="p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
          isActive
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/25'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
        }">
          <div class="flex items-center gap-3 min-w-0 cursor-pointer flex-1" onclick="switchActiveRunner('${u.id}')">
            <div class="w-10 h-10 rounded-xl text-white font-display font-bold flex items-center justify-center shrink-0 shadow-sm" style="background-color: ${u.color || '#059669'}">
              ${initial}
            </div>
            <div class="truncate">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-sm text-slate-900 dark:text-white truncate">${p.name || 'Dykembel'}</span>
                ${
                  isActive
                    ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">Activo</span>`
                    : ''
                }
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">
                VDOT ${vdot} · ${completedCount} sesiones · Nivel ${p.experience || 'intermedio'}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            ${
              !isActive
                ? `<button onclick="switchActiveRunner('${u.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition">
                    Elegir
                  </button>`
                : ''
            }
            ${
              multiStore.users.length > 1
                ? `<button onclick="deleteRunnerProfile('${u.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition" title="Eliminar perfil">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>`
                : ''
            }
          </div>
        </div>
      `;
    })
    .join('');

  const addCardHtml = `
    <button
      type="button"
      onclick="document.getElementById('newRunnerName')?.focus()"
      class="p-4 rounded-xl border border-dashed border-emerald-400/80 dark:border-emerald-500/40 bg-emerald-50/20 hover:bg-emerald-50/60 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/30 transition flex items-center gap-3 text-left"
    >
      <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
        +
      </div>
      <div>
        <div class="font-bold text-sm text-emerald-700 dark:text-emerald-300">Agregar o Crear Usuario</div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400">Haz clic para registrar un nuevo corredor</div>
      </div>
    </button>
  `;

  container.innerHTML = usersHtml + addCardHtml;
}

function switchActiveRunner(userId) {
  const target = multiStore.users.find((u) => u.id === userId);
  if (!target) return;
  multiStore.activeUserId = userId;
  appState = ensureUserStateIntegrity(target.state);
  saveState();
  closeUsersModal();
  refreshAllViews();
  showToast(`Perfil activo: ${appState.profile.name}`);
}

function createNewRunnerProfile() {
  const name = document.getElementById('newRunnerName').value.trim();
  if (!name) return;
  const level = document.getElementById('newRunnerLevel').value;
  const color = document.getElementById('newRunnerColor').value || '#059669';
  const age = Number(document.getElementById('newRunnerAge').value) || 30;
  const pr5kRaw = document.getElementById('newRunnerPr5k').value.trim();
  const seedWorkouts = document.getElementById('newRunnerSeedWorkouts').checked;

  const monday = getMondayOfWeek(0);
  const dayISO = (offset) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    return formatDateISO(d);
  };

  const basePace = level === 'principiante' ? '06:10' : level === 'avanzado' ? '04:45' : '05:20';
  const starterWorkouts = seedWorkouts
    ? [
        {
          id: `w-${Date.now()}-1`,
          date: dayISO(0),
          type: 'easy',
          title: 'Rodaje Suave Conversacional Z2',
          status: 'planned',
          plannedKm: level === 'principiante' ? 5.0 : 8.0,
          plannedMin: level === 'principiante' ? 31 : 43,
          plannedPace: basePace,
          plannedZone: 'Z2',
          actualKm: 0,
          actualMin: 0,
          actualPace: '',
          actualHR: 0,
          actualRpe: 4,
          watchAnalysis: '',
          notes: 'Sesión de bienvenida para calibrar pulsaciones.',
          screenshots: []
        },
        {
          id: `w-${Date.now()}-2`,
          date: dayISO(2),
          type: 'fartlek',
          title: 'Fartlek Controlado por Sensaciones',
          status: 'planned',
          plannedKm: level === 'principiante' ? 5.0 : 8.5,
          plannedMin: 35,
          plannedPace: basePace,
          plannedZone: 'Z2-Z3',
          actualKm: 0,
          actualMin: 0,
          actualPace: '',
          actualHR: 0,
          actualRpe: 6,
          watchAnalysis: '',
          notes: 'Alternar 2 min alegres con 2 min suaves.',
          screenshots: []
        },
        {
          id: `w-${Date.now()}-3`,
          date: dayISO(5),
          type: 'long',
          title: 'Tirada Larga de Fin de Semana',
          status: 'planned',
          plannedKm: level === 'principiante' ? 7.0 : 14.0,
          plannedMin: level === 'principiante' ? 45 : 75,
          plannedPace: basePace,
          plannedZone: 'Z2',
          actualKm: 0,
          actualMin: 0,
          actualPace: '',
          actualHR: 0,
          actualRpe: 5,
          watchAnalysis: '',
          notes: 'Mantener ritmo cómodo de principio a fin.',
          screenshots: []
        }
      ]
    : [];

  const newUserId = `user-${Date.now()}`;
  const newUserObj = {
    id: newUserId,
    color,
    createdAt: getLocalISODate(0),
    state: ensureUserStateIntegrity({
      profile: {
        name,
        age,
        weight: 68,
        height: 170,
        restHR: 55,
        maxHR: 220 - age,
        lthr: Math.round((220 - age) * 0.88),
        vo2max: level === 'principiante' ? 41 : level === 'avanzado' ? 54 : 47,
        cadence: 172,
        experience: level,
        daysAvailable: level === 'principiante' ? 3 : 5,
        longRunDay: 'Domingo',
        pr5k: pr5kRaw.includes(':') ? pr5kRaw : '',
        pr10k: '',
        pr21k: '',
        pr42k: '',
        terrain: 'Asfalto y parque',
        shoes: 'Zapatilla de entrenamiento diario',
        injuries: ''
      },
      goals: [
        {
          id: `goal-${Date.now()}`,
          name: level === 'principiante' ? 'Completar 5K / 10K Sintiéndome Fuerte' : 'Mejorar Marca Personal en 10K / 21K',
          distanceKm: 10.0,
          date: getLocalISODate(60),
          targetTime: level === 'principiante' ? '55:00' : '46:00',
          priority: 'A',
          notes: 'Objetivo inicial personalizado.'
        }
      ],
      reminders: [
        {
          id: `rem-${Date.now()}`,
          title: `Entrenamiento de ${name}`,
          time: '18:00',
          daysMode: 'training_days',
          enabled: true
        }
      ],
      favoriteFacts: ['fact-3'],
      customFacts: [],
      workouts: starterWorkouts,
      coachFeedback: {
        lastUpdated: getLocalISODate(0),
        summary: `¡Bienvenido/a ${name}! Tu perfil local está listo. Registra tus sesiones o sube capturas de tu reloj para recibir recomendaciones diarias adaptadas a ti.`,
        recommendations: [
          'Completa tus mejores marcas o pulsaciones en la pestaña "Mi Perfil & Zonas".',
          'Revisa tu Recomendación Diaria antes de salir a correr.'
        ]
      }
    })
  };

  multiStore.users.push(newUserObj);
  multiStore.activeUserId = newUserId;
  appState = newUserObj.state;
  saveState();

  document.getElementById('newRunnerName').value = '';
  document.getElementById('newRunnerPr5k').value = '';
  closeUsersModal();
  refreshAllViews();
  showToast(`¡Perfil de ${name} creado y activado!`);
}

function deleteRunnerProfile(userId) {
  if (multiStore.users.length <= 1) {
    showToast('Debe existir al menos un perfil activo en la aplicación.');
    return;
  }
  const target = multiStore.users.find((u) => u.id === userId);
  if (!target) return;
  if (!confirm(`¿Seguro que deseas eliminar el perfil de "${target.state.profile.name}" y sus entrenamientos?`)) {
    return;
  }
  multiStore.users = multiStore.users.filter((u) => u.id !== userId);
  if (multiStore.activeUserId === userId) {
    multiStore.activeUserId = multiStore.users[0].id;
    appState = ensureUserStateIntegrity(multiStore.users[0].state);
  }
  saveState();
  renderUsersModalList();
  refreshAllViews();
  showToast('Perfil eliminado');
}

function refreshAllViews() {
  renderDashboard();
  renderCalendarAndTable();
  renderProfileTab();
  renderGoalsTab();
  renderCoachFeedbackBox();
  renderFactsLibraryGrid();
}

// ============================================================================
// MOTOR DE RECOMENDACIONES DIARIAS SEGÚN EL PROGRESO REGISTRADO
// ============================================================================

function computeDailyAdaptiveRecommendations() {
  const p = appState.profile || {};
  const todayISO = getLocalISODate(0);
  const vdot = getRunnerVDOT(p);
  const zones = getTrainingZones(p);
  const z2Info = zones[1];

  // Sesiones recientes completadas o modificadas
  const completed = [...appState.workouts]
    .filter((w) => w.status === 'completed' || w.status === 'modified')
    .sort((a, b) => a.date.localeCompare(b.date));

  const recentLast5 = completed.slice(-5);
  const avgRecentRpe =
    recentLast5.length > 0
      ? recentLast5.reduce((s, w) => s + Number(w.actualRpe || 5), 0) / recentLast5.length
      : 5.0;

  const recentModified = recentLast5.filter((w) => w.status === 'modified' || Number(w.actualRpe) >= 8);
  const todayWorkout = appState.workouts.find((w) => w.date === todayISO);

  // Cálculo de polarización 80/20
  let easyKm = 0;
  let hardKm = 0;
  completed.forEach((w) => {
    const k = Number(w.actualKm) || 0;
    if (w.type === 'easy' || w.type === 'long') easyKm += k;
    else hardKm += k;
  });
  const totalKm = easyKm + hardKm || 1;
  const easyPct = Math.round((easyKm / totalKm) * 100);

  // Calcular puntaje de Disposición Diaria (Readiness 0-100%)
  let readinessScore = 88;
  if (avgRecentRpe >= 7.5) readinessScore -= 16;
  else if (avgRecentRpe >= 6.5) readinessScore -= 7;
  else if (avgRecentRpe <= 4.5) readinessScore += 6;
  if (recentModified.length > 0) readinessScore -= 6;
  readinessScore = Math.max(52, Math.min(98, Math.round(readinessScore)));

  // 1. Tarjeta: Plan de Hoy
  let pillar1Title = 'Sesión Sugerida para Hoy';
  let pillar1Text = '';
  let pillar1Badge = 'Día Activo';

  if (todayWorkout) {
    const tCat = WORKOUT_TYPES_CATALOG[todayWorkout.type] || WORKOUT_TYPES_CATALOG.easy;
    pillar1Badge = tCat.shortName;
    if (todayWorkout.status === 'completed' || todayWorkout.status === 'modified') {
      pillar1Title = '¡Entrenamiento de Hoy Completado!';
      pillar1Text = `Ya registraste "${todayWorkout.title}" (${todayWorkout.actualKm || 0} km). Prioriza ahora estirar suave y reponer líquidos.`;
    } else if (todayWorkout.type === 'rest') {
      pillar1Title = 'Hoy Toca Descanso y Supercompensación';
      pillar1Text = `Tienes programado "${todayWorkout.title}". Aprovecha para hacer 10-15 min de movilidad articular o rodillo de espuma.`;
    } else {
      pillar1Title = `Hoy: ${todayWorkout.title}`;
      pillar1Text = `Objetivo: ${todayWorkout.plannedKm || 0} km a ritmo ${todayWorkout.plannedPace || z2Info.paceRange} (${todayWorkout.plannedZone || tCat.zone}). Beneficio: ${tCat.primaryBenefit}.`;
    }
  } else {
    pillar1Badge = 'Sugerencia IA';
    pillar1Title = 'Sin Sesión Fija Hoy · Rodaje o Movilidad';
    pillar1Text = `Si deseas salir hoy, te sugiero 30-40 min de Rodaje Regenerativo en Zona 2 (${z2Info.hrRange}, ritmo ${z2Info.paceRange}) sin acumular fatiga.`;
  }

  // 2. Tarjeta: Ajuste por Carga y Fatiga Reciente
  let pillar2Title = 'Lectura de tu Fatiga y Progreso';
  let pillar2Text = '';
  let pillar2Badge = `RPE medio: ${avgRecentRpe.toFixed(1)}/10`;

  if (recentModified.length > 0) {
    const lastMod = recentModified[recentModified.length - 1];
    pillar2Text = `En "${lastMod.title}" registraste un esfuerzo alto (RPE ${lastMod.actualRpe}/10). Hoy evita picarte con el ritmo los primeros 15 minutos y vigila que tus pulsaciones no suban más de lo previsto.`;
  } else if (easyPct < 70 && completed.length >= 3) {
    pillar2Text = `Actualmente el ${easyPct}% de tus kilómetros son suaves (meta ideal: ~80%). Te recomendamos que tu próximo rodaje sea genuinamente suave en Zona 1-2 para asimilar las series.`;
  } else {
    pillar2Text = `Tu asimilación de carga es excelente (${easyPct}% volumen aeróbico suave y RPE controlado). Estás en condiciones óptimas para sostener los ritmos de tu VDOT (${vdot.toFixed(1)}).`;
  }

  // 3. Tarjeta: Prevención Biomecánica
  let pillar3Title = 'Cuidado Muscular y Biomecánica';
  let pillar3Badge = `Cadencia obj: ${p.cadence || 174} spm`;
  let pillar3Text = p.injuries
    ? `Recordatorio personal: "${p.injuries}". Dedica 4 minutos antes de correr a activar tobillos, glúteo medio y sóleos.`
    : `Mantén una cadencia ágil cercana a ${p.cadence || 174} pasos/min aterrizando debajo de tu centro de gravedad para proteger rodillas y tendón de Aquiles.`;

  // 4. Tarjeta: Hidratación y Recuperación
  const plannedMinutesToday = todayWorkout ? Number(todayWorkout.plannedMin) || 40 : 40;
  let pillar4Title = 'Nutrición e Hidratación de Hoy';
  let pillar4Badge = plannedMinutesToday >= 65 ? 'Sesión Larga' : 'Hidratación Base';
  let pillar4Text =
    plannedMinutesToday >= 65
      ? `Al superar los 60 min hoy, bebe ~400-600 ml de agua con electrolitos por hora y consume 30-45g de carbohidratos desde el minuto 40.`
      : `Bebe 350 ml de agua 45 min antes de entrenar. Al terminar, combina carbohidratos y ~20-25g de proteína en la primera hora para reparar fibras.`;

  return {
    readinessScore,
    cards: [
      {
        icon: 'footprints',
        colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
        badge: pillar1Badge,
        title: pillar1Title,
        text: pillar1Text
      },
      {
        icon: 'activity',
        colorClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
        badge: pillar2Badge,
        title: pillar2Title,
        text: pillar2Text
      },
      {
        icon: 'shield-check',
        colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
        badge: pillar3Badge,
        title: pillar3Title,
        text: pillar3Text
      },
      {
        icon: 'droplets',
        colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
        badge: pillar4Badge,
        title: pillar4Title,
        text: pillar4Text
      }
    ]
  };
}

function renderDailyRecommendations() {
  const grid = document.getElementById('dailyRecommendationGrid');
  const scoreBadge = document.getElementById('dailyReadinessScoreBadge');
  if (!grid) return;

  const data = computeDailyAdaptiveRecommendations();
  if (scoreBadge) {
    scoreBadge.textContent = `Disposición hoy: ${data.readinessScore}%`;
  }

  grid.innerHTML = data.cards
    .map(
      (c) => `
      <div class="rp-subtle-box p-4 flex flex-col justify-between space-y-2.5">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="p-1.5 rounded-lg ${c.colorClass}">
              <i data-lucide="${c.icon}" class="w-4 h-4"></i>
            </span>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              ${c.badge}
            </span>
          </div>
          <h4 class="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
            ${c.title}
          </h4>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            ${c.text}
          </p>
        </div>
      </div>
    `
    )
    .join('');
}

// ============================================================================
// SISTEMA DE RECORDATORIOS DE ENTRENAMIENTO & EXPORTACIÓN .ICS AL CALENDARIO
// ============================================================================

function renderTodayReminderBanner() {
  const banner = document.getElementById('todayReminderBanner');
  const badgeCount = document.getElementById('reminderBadgeCount');
  if (!banner) return;

  const todayISO = getLocalISODate(0);
  const todayWorkout = appState.workouts.find((w) => w.date === todayISO && w.status === 'planned');
  const activeReminders = (appState.reminders || []).filter((r) => r.enabled);
  const mainTime = activeReminders.length > 0 ? activeReminders[0].time : '18:00';

  if (badgeCount) {
    if (todayWorkout || activeReminders.length > 0) {
      badgeCount.textContent = todayWorkout ? '!' : String(activeReminders.length);
      badgeCount.classList.remove('hidden');
      badgeCount.classList.add('flex');
    } else {
      badgeCount.classList.add('hidden');
    }
  }

  if (todayWorkout) {
    banner.innerHTML = `
      <div class="flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <i data-lucide="bell-ring" class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"></i>
        <span>
          <strong>Recordatorio de hoy (${mainTime}):</strong> Tienes programado <em>"${todayWorkout.title}"</em> (${todayWorkout.plannedKm || 0} km).
        </span>
      </div>
      <div class="flex items-center gap-1.5 ml-auto">
        <button onclick="openWorkoutModal('${todayWorkout.id}')" class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition">
          Registrar ahora
        </button>
        <button onclick="openRemindersModal()" class="px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-amber-300/60 dark:border-slate-700">
          Ajustar hora
        </button>
      </div>
    `;
  } else {
    banner.innerHTML = `
      <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <i data-lucide="clock" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"></i>
        <span>
          <strong>Recordatorios activos (${activeReminders.length}):</strong> Próximo aviso programado a las <strong>${mainTime}</strong>.
        </span>
      </div>
      <button onclick="openRemindersModal()" class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition">
        Configurar avisos
      </button>
    `;
  }
}

function openRemindersModal() {
  renderRemindersList();
  updateNotificationPermissionBadge();
  const modal = document.getElementById('remindersModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  if (window.lucide) lucide.createIcons();
}

function closeRemindersModal() {
  const modal = document.getElementById('remindersModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function updateNotificationPermissionBadge() {
  const badge = document.getElementById('notifPermissionStatusBadge');
  if (!badge) return;
  if (!('Notification' in window)) {
    badge.textContent = 'Alertas internas activas';
    return;
  }
  if (Notification.permission === 'granted') {
    badge.textContent = 'Permiso concedido ✓';
    badge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold';
  } else if (Notification.permission === 'denied') {
    badge.textContent = 'Alerta en pantalla + sonido';
  } else {
    badge.textContent = 'Listo para activar';
  }
}

async function requestNotificationPermission() {
  playReminderChime();
  if (!('Notification' in window)) {
    showToast('Avisos sonoros y visuales activados dentro de la aplicación.');
    return;
  }
  try {
    const perm = await Notification.requestPermission();
    updateNotificationPermissionBadge();
    if (perm === 'granted') {
      showToast('¡Notificaciones del sistema activadas correctamente!');
    } else {
      showToast('Usaremos alertas visuales y sonoras dentro de la app.');
    }
  } catch (_) {
    showToast('Avisos internos activados.');
  }
}

function triggerTestReminderNotification() {
  playReminderChime();
  const todayISO = getLocalISODate(0);
  const todayW = appState.workouts.find((w) => w.date === todayISO);
  const bodyMsg = todayW
    ? `Hoy tienes programado: ${todayW.title} (${todayW.plannedKm || 0} km a ${todayW.plannedPace || 'ritmo Z2'}).`
    : `¡Es hora de revisar tu entrenamiento del día en RunPulse, ${appState.profile.name}!`;

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🏃‍♂️ Recordatorio RunPulse Coach', { body: bodyMsg });
  }
  showToast(`🔔 ${bodyMsg}`);
}

function renderRemindersList() {
  const container = document.getElementById('remindersListContainer');
  if (!container) return;

  const daysLabels = {
    training_days: 'Días con entreno planeado',
    everyday: 'Todos los días',
    weekdays: 'Lunes a Viernes',
    weekends: 'Fines de semana'
  };

  if (!appState.reminders || appState.reminders.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">No tienes recordatorios configurados. Agrega uno arriba.</div>`;
    return;
  }

  container.innerHTML = appState.reminders
    .map(
      (r) => `
      <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="toggleReminderEnabled('${r.id}')" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white ${!r.enabled ? 'line-through opacity-50' : ''}">${r.title}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">
              Hora: <strong class="text-emerald-600 dark:text-emerald-400">${r.time}</strong> · ${daysLabels[r.daysMode] || 'Todos los días'}
            </div>
          </div>
        </div>
        <button onclick="deleteReminder('${r.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition" title="Eliminar recordatorio">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `
    )
    .join('');

  if (window.lucide) lucide.createIcons();
}

function addCustomReminder() {
  const title = document.getElementById('newReminderTitle').value.trim();
  const time = document.getElementById('newReminderTime').value || '18:00';
  const daysMode = document.getElementById('newReminderDays').value;
  if (!title) return;

  appState.reminders.push({
    id: `rem-${Date.now()}`,
    title,
    time,
    daysMode,
    enabled: true
  });
  saveState();
  document.getElementById('newReminderTitle').value = '';
  renderRemindersList();
  renderTodayReminderBanner();
  showToast('Recordatorio guardado');
}

function toggleReminderEnabled(remId) {
  const item = appState.reminders.find((r) => r.id === remId);
  if (!item) return;
  item.enabled = !item.enabled;
  saveState();
  renderRemindersList();
  renderTodayReminderBanner();
}

function deleteReminder(remId) {
  appState.reminders = appState.reminders.filter((r) => r.id !== remId);
  saveState();
  renderRemindersList();
  renderTodayReminderBanner();
}

function startBackgroundReminderWatcher() {
  if (reminderCheckInterval) clearInterval(reminderCheckInterval);
  let lastTriggeredMinute = '';

  reminderCheckInterval = setInterval(() => {
    if (!appState || !Array.isArray(appState.reminders)) return;
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (hhmm === lastTriggeredMinute) return;

    const dayOfWeek = now.getDay(); // 0 Dom .. 6 Sáb
    const todayISO = getLocalISODate(0);
    const hasPlannedWorkoutToday = appState.workouts.some(
      (w) => w.date === todayISO && w.status === 'planned' && w.type !== 'rest'
    );

    appState.reminders.forEach((r) => {
      if (!r.enabled || r.time !== hhmm) return;
      let shouldFire = true;
      if (r.daysMode === 'training_days') shouldFire = hasPlannedWorkoutToday;
      else if (r.daysMode === 'weekdays') shouldFire = dayOfWeek >= 1 && dayOfWeek <= 5;
      else if (r.daysMode === 'weekends') shouldFire = dayOfWeek === 0 || dayOfWeek === 6;

      if (shouldFire) {
        lastTriggeredMinute = hhmm;
        playReminderChime();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🔔 Recordatorio RunPulse (${appState.profile.name})`, {
            body: r.title
          });
        }
        showToast(`🔔 Recordatorio (${r.time}): ${r.title}`);
      }
    });
  }, 20000);
}

// Exportador universal de entrenamientos a archivo .ICS (Google Calendar, iOS, Outlook)
function exportCurrentWeekToICS() {
  const monday = getMondayOfWeek(currentWeekOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monISO = formatDateISO(monday);
  const sunISO = formatDateISO(sunday);

  const weekWorkouts = appState.workouts.filter(
    (w) => w.date >= monISO && w.date <= sunISO && w.type !== 'rest'
  );

  if (weekWorkouts.length === 0) {
    showToast('No hay sesiones de entrenamiento en esta semana para exportar.');
    return;
  }

  const prefTime =
    appState.reminders && appState.reminders.length > 0
      ? appState.reminders[0].time.replace(':', '')
      : '1800';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RunPulse AI Coach//ES',
    'CALSCALE:GREGORIAN'
  ];

  weekWorkouts.forEach((w) => {
    const cleanDate = w.date.replace(/-/g, '');
    const startDateTime = `${cleanDate}T${prefTime}00`;
    const durationMin = Number(w.plannedMin) || 45;
    const tCat = WORKOUT_TYPES_CATALOG[w.type] || WORKOUT_TYPES_CATALOG.easy;
    const desc = `Corredor: ${appState.profile.name} | Meta: ${w.plannedKm || 0} km a ${w.plannedPace || '--'}/km (${w.plannedZone || tCat.zone}). Beneficio: ${tCat.primaryBenefit}. ${w.notes || ''}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${w.id}@runpulse.local`,
      `DTSTART:${startDateTime}`,
      `DURATION:PT${durationMin}M`,
      `SUMMARY:🏃 ${w.title} (${w.plannedKm || 0}km)`,
      `DESCRIPTION:${desc.replace(/\n/g, ' ')}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio RunPulse: ${w.title}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `entrenamientos-runpulse-${monISO}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Archivo .ICS descargado. Ábrelo para añadir los recordatorios a tu calendario.');
}

// ============================================================================
// DATOS CURIOSOS DEL RUNNING (WIDGET DIARIO, FAVORITOS Y BIBLIOTECA)
// ============================================================================

function getAllAvailableFacts() {
  const custom = Array.isArray(appState?.customFacts) ? appState.customFacts : [];
  return [...custom, ...DEFAULT_RUNNING_FACTS];
}

function renderDashboardCuriousFact() {
  const allFacts = getAllAvailableFacts();
  if (allFacts.length === 0) return;
  if (currentCuriousFactIndex >= allFacts.length) currentCuriousFactIndex = 0;

  const item = allFacts[currentCuriousFactIndex];
  const catEl = document.getElementById('curiousFactCategoryBadge');
  const titleEl = document.getElementById('curiousFactTitle');
  const bodyEl = document.getElementById('curiousFactBody');
  const tipEl = document.getElementById('curiousFactTip');
  const countEl = document.getElementById('totalFactsCountLabel');
  const favBtn = document.getElementById('btnFavoriteFact');

  if (catEl) catEl.textContent = item.category;
  if (titleEl) titleEl.textContent = item.title;
  if (bodyEl) bodyEl.textContent = item.fact;
  if (tipEl) tipEl.textContent = item.tip;
  if (countEl) countEl.textContent = String(allFacts.length);

  const isFav = (appState.favoriteFacts || []).includes(item.id);
  if (favBtn) {
    favBtn.className = isFav
      ? 'p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-500 transition'
      : 'p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition';
  }
}

function nextCuriousFact() {
  const allFacts = getAllAvailableFacts();
  currentCuriousFactIndex = (currentCuriousFactIndex + 1) % allFacts.length;
  renderDashboardCuriousFact();
}

function toggleFavoriteCurrentFact() {
  const allFacts = getAllAvailableFacts();
  const item = allFacts[currentCuriousFactIndex];
  if (!item) return;
  toggleFavoriteFactById(item.id);
}

function toggleFavoriteFactById(factId) {
  if (!Array.isArray(appState.favoriteFacts)) appState.favoriteFacts = [];
  const idx = appState.favoriteFacts.indexOf(factId);
  if (idx >= 0) {
    appState.favoriteFacts.splice(idx, 1);
    showToast('Dato curioso quitado de favoritos');
  } else {
    appState.favoriteFacts.push(factId);
    showToast('⭐ Dato curioso guardado en tus favoritos');
  }
  saveState();
  renderDashboardCuriousFact();
  renderFactsLibraryGrid();
}

function renderFactsLibraryGrid() {
  const grid = document.getElementById('factsLibraryGrid');
  if (!grid) return;

  const filterVal = document.getElementById('factsCategoryFilter')?.value || 'all';
  const allFacts = getAllAvailableFacts();
  const favs = appState.favoriteFacts || [];

  const filtered = allFacts.filter((f) => {
    if (filterVal === 'all') return true;
    if (filterVal === 'favorites') return favs.includes(f.id);
    return f.category === filterVal;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full p-6 text-center text-xs text-slate-400">No hay datos curiosos en este filtro todavía.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((f) => {
      const isFav = favs.includes(f.id);
      return `
        <div class="rp-subtle-box p-4 flex flex-col justify-between space-y-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">
                ${f.category}
              </span>
              <button onclick="toggleFavoriteFactById('${f.id}')" class="text-xs ${isFav ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-amber-500'}">
                ${isFav ? '★ Favorito' : '☆ Guardar'}
              </button>
            </div>
            <h4 class="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug">
              ${f.title}
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ${f.fact}
            </p>
          </div>
          <div class="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
            <strong class="text-emerald-600 dark:text-emerald-400">Consejo práctico:</strong> ${f.tip}
          </div>
        </div>
      `;
    })
    .join('');
}

async function generateAIFactWithGemini() {
  const apiKey =
    document.getElementById('geminiApiKeyInput')?.value.trim() ||
    localStorage.getItem(GEMINI_KEY_STORAGE) ||
    '';

  if (!apiKey) {
    showToast('Configura tu Gemini API Key en la pestaña "Entrenador Gemini IA" para generar curiosidades nuevas con IA.');
    return;
  }

  const btn = document.getElementById('btnGenerateAiFact');
  if (btn) btn.textContent = 'Generando...';

  try {
    const prompt = `Genera 1 dato curioso fascinante, científico y poco conocido sobre el running (fisiología, biomecánica, nutrición o récords) adaptado a un corredor de nivel ${appState.profile.experience}. Devuelve SOLO un objeto JSON con: {"category": "Fisiología | Biomecánica | Nutrición | Entrenamiento | Historia", "title": "Título llamativo", "fact": "Explicación científica clara en 2 oraciones", "tip": "Consejo práctico de 1 oración"}.`;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
      })
    });
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    if (parsed && parsed.title) {
      const newFact = {
        id: `fact-ai-${Date.now()}`,
        category: parsed.category || 'Fisiología',
        title: parsed.title,
        fact: parsed.fact,
        tip: parsed.tip
      };
      if (!Array.isArray(appState.customFacts)) appState.customFacts = [];
      appState.customFacts.unshift(newFact);
      currentCuriousFactIndex = 0;
      saveState();
      renderDashboardCuriousFact();
      renderFactsLibraryGrid();
      showToast('¡Nuevo dato curioso generado y añadido a tu biblioteca!');
    }
  } catch (err) {
    console.error(err);
    showToast('No se pudo conectar con Gemini API en este momento.');
  } finally {
    if (btn) btn.innerHTML = `<i data-lucide="bot" class="w-3.5 h-3.5"></i> Nuevo dato con IA`;
    if (window.lucide) lucide.createIcons();
  }
}

// ============================================================================
// NAVEGACIÓN ENTRE PESTAÑAS (ESCRITORIO Y BARRA INFERIOR MÓVIL)
// ============================================================================

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.add('hidden');
  });
  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  const targetPanel = document.getElementById(`tab-${tabId}`);
  const targetBtn = document.getElementById(`tabBtn-${tabId}`);
  const mobBtn = document.getElementById(`mobTab-${tabId}`);

  if (targetPanel) targetPanel.classList.remove('hidden');
  if (targetBtn) targetBtn.classList.add('active');
  if (mobBtn) mobBtn.classList.add('active');

  if (tabId === 'dashboard') {
    renderDashboard();
  } else if (tabId === 'calendar') {
    renderCalendarAndTable();
  } else if (tabId === 'physiology') {
    renderPhysiologyTab();
  } else if (tabId === 'goals') {
    renderGoalsTab();
  } else if (tabId === 'profile') {
    renderProfileTab();
  } else if (tabId === 'gemini') {
    renderGeminiTab();
  }
  if (window.lucide) lucide.createIcons();
}

// ============================================================================
// COMPRESIÓN Y GESTIÓN DE PANTALLAZOS DEL RELOJ + GEMINI VISION OCR
// ============================================================================

function compressImageFileToDataURL(file, maxWidth = 1080, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleWatchScreenshotsUpload(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const compressedDataUrl = await compressImageFileToDataURL(file);
      currentModalScreenshots.push({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name || 'Captura Reloj',
        dataUrl: compressedDataUrl
      });
    } catch (err) {
      console.error('Error comprimiendo imagen:', err);
    }
  }

  event.target.value = '';
  renderModalScreenshotsGallery();
  showToast(`${files.length} captura(s) adjuntada(s).`);
}

window.addEventListener('paste', async (event) => {
  const modal = document.getElementById('workoutModal');
  if (!modal || modal.classList.contains('hidden')) return;

  const items = Array.from(event.clipboardData?.items || []);
  const imageItems = items.filter((item) => item.type.startsWith('image/'));
  if (imageItems.length === 0) return;

  for (const item of imageItems) {
    const file = item.getAsFile();
    if (!file) continue;
    const compressedDataUrl = await compressImageFileToDataURL(file);
    currentModalScreenshots.push({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `Pegado-${new Date().toLocaleTimeString()}`,
      dataUrl: compressedDataUrl
    });
  }
  renderModalScreenshotsGallery();
  showToast('Captura pegada desde el portapapeles.');
});

function renderModalScreenshotsGallery() {
  const gallery = document.getElementById('wmScreenshotsGallery');
  if (!gallery) return;

  if (currentModalScreenshots.length === 0) {
    gallery.innerHTML = `
      <div class="col-span-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-[11px] text-slate-400">
        Sin capturas adjuntas. Sube imágenes de tu reloj o presiona <strong>Ctrl+V</strong>.
      </div>
    `;
    return;
  }

  gallery.innerHTML = currentModalScreenshots
    .map(
      (img, index) => `
      <div class="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 h-24 flex items-center justify-center">
        <img src="${img.dataUrl}" alt="${img.name}" onclick="openImageLightbox('${img.dataUrl}')" class="w-full h-full object-cover cursor-zoom-in" />
        <button type="button" onclick="removeModalScreenshot(${index})" class="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/80 text-rose-400 hover:bg-rose-600 hover:text-white transition">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `
    )
    .join('');

  if (window.lucide) lucide.createIcons();
}

function removeModalScreenshot(index) {
  currentModalScreenshots.splice(index, 1);
  renderModalScreenshotsGallery();
}

function openImageLightbox(dataUrl) {
  const modal = document.getElementById('imageLightboxModal');
  const imgEl = document.getElementById('lightboxImageEl');
  if (!modal || !imgEl) return;
  imgEl.src = dataUrl;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeImageLightbox() {
  const modal = document.getElementById('imageLightboxModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openWorkoutScreenshotGalleryById(workoutId) {
  const w = appState.workouts.find((item) => item.id === workoutId);
  if (w && w.screenshots && w.screenshots.length > 0) {
    openImageLightbox(w.screenshots[0].dataUrl);
  }
}

async function analyzeWatchScreenshotsWithGemini() {
  const statusEl = document.getElementById('wmVisionStatus');
  const apiKey =
    document.getElementById('geminiApiKeyInput')?.value.trim() ||
    localStorage.getItem(GEMINI_KEY_STORAGE) ||
    '';

  if (currentModalScreenshots.length === 0) {
    statusEl.className = 'text-xs p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-700 dark:text-amber-300 block';
    statusEl.textContent = 'Primero sube o pega (Ctrl+V) al menos una captura de tu reloj o app.';
    return;
  }

  if (!apiKey) {
    statusEl.className = 'text-xs p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-700 dark:text-rose-300 block';
    statusEl.textContent = 'Configura tu Gemini API Key en la pestaña "Entrenador Gemini IA" para leer imágenes automáticamente.';
    return;
  }

  const imageParts = currentModalScreenshots.map((img) => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img.dataUrl.split(',')[1]
    }
  }));

  const visionPrompt = `Analiza estas capturas de reloj deportivo / app de running. Devuelve EXCLUSIVAMENTE un JSON con:
{
  "titleSuggested": "Nombre descriptivo",
  "workoutTypeSuggested": "easy | tempo | intervals | long | fartlek | hills | strength | race",
  "actualKm": 10.0,
  "actualMin": 51.0,
  "actualPace": "05:06",
  "actualHR": 152,
  "actualMaxHR": 174,
  "actualCadence": 176,
  "actualElevation": 85,
  "actualCalories": 610,
  "estimatedRpe": 6,
  "watchAnalysis": "Resumen claro en español de parciales, zonas de FC y análisis fisiológico."
}`;

  const fallbackModels = ['gemini-2.5-flash', 'gemini-3-flash-preview'];
  let lastError = null;

  for (const model of fallbackModels) {
    statusEl.className = 'text-xs p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 text-indigo-700 dark:text-indigo-300 block';
    statusEl.textContent = `Analizando captura(s) con ${model}...`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: visionPrompt }, ...imageParts] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());

      if (parsed.actualKm) document.getElementById('wmActualKm').value = parsed.actualKm;
      if (parsed.actualMin) document.getElementById('wmActualMin').value = parsed.actualMin;
      if (parsed.actualPace) document.getElementById('wmActualPace').value = parsed.actualPace;
      if (parsed.actualHR) document.getElementById('wmActualHR').value = parsed.actualHR;
      if (parsed.actualMaxHR) document.getElementById('wmActualMaxHR').value = parsed.actualMaxHR;
      if (parsed.actualCadence) document.getElementById('wmActualCadence').value = parsed.actualCadence;
      if (parsed.actualElevation) document.getElementById('wmActualElevation').value = parsed.actualElevation;
      if (parsed.actualCalories) document.getElementById('wmActualCalories').value = parsed.actualCalories;
      if (parsed.estimatedRpe) {
        document.getElementById('wmActualRpe').value = parsed.estimatedRpe;
        document.getElementById('wmRpeValueLabel').textContent = parsed.estimatedRpe;
      }
      if (parsed.watchAnalysis) document.getElementById('wmWatchAnalysis').value = parsed.watchAnalysis;
      if (!document.getElementById('wmTitle').value && parsed.titleSuggested) {
        document.getElementById('wmTitle').value = parsed.titleSuggested;
      }
      if (parsed.workoutTypeSuggested && WORKOUT_TYPES_CATALOG[parsed.workoutTypeSuggested]) {
        document.getElementById('wmType').value = parsed.workoutTypeSuggested;
        updateModalPhysiologyPreview();
      }
      document.getElementById('wmStatus').value = 'completed';

      statusEl.className = 'text-xs p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-700 dark:text-emerald-300 block';
      statusEl.textContent = '¡Datos del reloj extraídos con éxito! Revisa y pulsa Guardar.';
      return;
    } catch (err) {
      lastError = err;
    }
  }

  statusEl.className = 'text-xs p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-700 dark:text-rose-300 block';
  statusEl.textContent = `No se pudo leer la imagen: ${lastError ? lastError.message : 'Error'}`;
}

// ============================================================================
// RENDERIZADO: CABECERA, SALUDO MULTI-USUARIO Y DASHBOARD
// ============================================================================

function updateHeaderAndWelcomeBadges() {
  const activeEntry = getActiveUserEntry();
  const p = appState.profile || {};
  const vdot = getRunnerVDOT(p);
  const initial = (p.name || 'C').trim().charAt(0).toUpperCase();
  const avatarColor = activeEntry.color || '#059669';

  const vdotEl = document.getElementById('headerVdotValue');
  if (vdotEl) vdotEl.textContent = vdot.toFixed(1);

  const nameEl = document.getElementById('headerUserName');
  if (nameEl) nameEl.textContent = p.name || 'Corredor';

  const avatarEl = document.getElementById('headerUserAvatar');
  if (avatarEl) {
    avatarEl.textContent = initial;
    avatarEl.style.backgroundColor = avatarColor;
  }

  const welcomeAvatar = document.getElementById('welcomeAvatarBox');
  if (welcomeAvatar) {
    welcomeAvatar.textContent = initial;
    welcomeAvatar.style.backgroundColor = avatarColor;
  }

  const welcomeTitle = document.getElementById('welcomeUserTitle');
  if (welcomeTitle) {
    welcomeTitle.textContent = `¡Hola, ${p.name || 'Corredor'}!`;
  }

  const monday = getMondayOfWeek(0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monISO = formatDateISO(monday);
  const sunISO = formatDateISO(sunday);

  const weekWorkouts = appState.workouts.filter((w) => w.date >= monISO && w.date <= sunISO);
  const plannedKm = weekWorkouts.reduce((acc, w) => acc + (Number(w.plannedKm) || 0), 0);
  const actualKm = weekWorkouts
    .filter((w) => w.status === 'completed' || w.status === 'modified')
    .reduce((acc, w) => acc + (Number(w.actualKm) || 0), 0);

  const pct = plannedKm > 0 ? Math.min(100, Math.round((actualKm / plannedKm) * 100)) : 0;
  const compEl = document.getElementById('headerComplianceValue');
  if (compEl) compEl.textContent = `${pct}%`;
}

function renderDashboard() {
  updateHeaderAndWelcomeBadges();
  renderTodayReminderBanner();
  renderMotivationalProgressBanners();
  renderDailyRecommendations();
  renderDashboardCuriousFact();

  const monday = getMondayOfWeek(0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monISO = formatDateISO(monday);
  const sunISO = formatDateISO(sunday);

  const weekWorkouts = appState.workouts.filter((w) => w.date >= monISO && w.date <= sunISO);
  const plannedKm = weekWorkouts.reduce((acc, w) => acc + (Number(w.plannedKm) || 0), 0);
  const actualKm = weekWorkouts
    .filter((w) => w.status === 'completed' || w.status === 'modified')
    .reduce((acc, w) => acc + (Number(w.actualKm) || 0), 0);

  document.getElementById('kpiWeeklyKm').textContent = actualKm.toFixed(1);
  document.getElementById('kpiPlannedWeeklyKm').textContent = plannedKm.toFixed(1);
  const pct = plannedKm > 0 ? Math.min(100, Math.round((actualKm / plannedKm) * 100)) : 0;
  document.getElementById('kpiWeeklyProgressBar').style.width = `${pct}%`;

  const completedRuns = appState.workouts.filter(
    (w) => (w.status === 'completed' || w.status === 'modified') && Number(w.actualKm) > 0
  );
  if (completedRuns.length > 0) {
    const totalKm = completedRuns.reduce((s, w) => s + Number(w.actualKm), 0);
    const totalMin = completedRuns.reduce((s, w) => s + Number(w.actualMin || 0), 0);
    const avgPaceDec = totalKm > 0 ? totalMin / totalKm : 0;
    document.getElementById('kpiAvgPace').textContent = decimalMinutesToPaceString(avgPaceDec);

    const runsWithHR = completedRuns.filter((w) => Number(w.actualHR) > 0);
    const avgHR =
      runsWithHR.length > 0
        ? Math.round(runsWithHR.reduce((s, w) => s + Number(w.actualHR), 0) / runsWithHR.length)
        : '--';
    document.getElementById('kpiAvgHrText').innerHTML = `FC Media: <span class="text-slate-900 dark:text-white font-semibold">${avgHR} ppm</span> (${completedRuns.length} sesiones)`;

    const avgRpe =
      completedRuns.reduce((s, w) => s + Number(w.actualRpe || 5), 0) / completedRuns.length;
    document.getElementById('kpiAvgRpe').textContent = `(RPE ${avgRpe.toFixed(1)}/10)`;
    const readinessEl = document.getElementById('kpiReadinessState');
    if (avgRpe >= 7.8) {
      readinessEl.textContent = 'Carga Alta';
      readinessEl.className = 'text-base sm:text-lg font-display font-bold text-amber-600 dark:text-amber-400';
    } else if (avgRpe <= 4.5) {
      readinessEl.textContent = 'Fresco / Energía';
      readinessEl.className = 'text-base sm:text-lg font-display font-bold text-sky-600 dark:text-sky-400';
    } else {
      readinessEl.textContent = 'Asimilación Óptima';
      readinessEl.className = 'text-base sm:text-lg font-display font-bold text-emerald-600 dark:text-emerald-400';
    }
  } else {
    document.getElementById('kpiAvgPace').textContent = '--:--';
    document.getElementById('kpiAvgHrText').textContent = 'Sin sesiones registradas aún';
  }

  const sortedGoals = [...appState.goals].sort((a, b) => a.date.localeCompare(b.date));
  const nextGoal = sortedGoals[0];
  if (nextGoal) {
    document.getElementById('kpiNextGoalTitle').textContent = nextGoal.name;
    const targetSec = parseTimeToSeconds(nextGoal.targetTime);
    const goalPace =
      targetSec > 0 && nextGoal.distanceKm > 0
        ? formatSecondsToTime(targetSec / nextGoal.distanceKm)
        : '--:--';
    document.getElementById('kpiNextGoalMeta').textContent = `Meta: ${nextGoal.targetTime} (${goalPace} /km)`;
    const diffDays = Math.ceil((new Date(nextGoal.date) - new Date()) / (1000 * 60 * 60 * 24));
    document.getElementById('kpiNextGoalCountdown').textContent =
      diffDays >= 0
        ? `Faltan ${diffDays} días (${formatShortSpanishDate(nextGoal.date)})`
        : `Evento finalizado (${formatShortSpanishDate(nextGoal.date)})`;
  } else {
    document.getElementById('kpiNextGoalTitle').textContent = 'Sin objetivo activo';
    document.getElementById('kpiNextGoalMeta').textContent = 'Agrega tu carrera meta';
    document.getElementById('kpiNextGoalCountdown').textContent = '--';
  }

  const todayISO = getLocalISODate(0);
  const upcoming = [...appState.workouts]
    .filter((w) => w.date >= todayISO && w.status === 'planned')
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextWorkout =
    upcoming[0] || [...appState.workouts].sort((a, b) => b.date.localeCompare(a.date))[0];

  const nextContainer = document.getElementById('nextWorkoutCardContent');
  if (nextWorkout && nextContainer) {
    const typeInfo = WORKOUT_TYPES_CATALOG[nextWorkout.type] || WORKOUT_TYPES_CATALOG.easy;
    document.getElementById('nextWorkoutDateLabel').textContent = formatShortSpanishDate(nextWorkout.date);
    nextContainer.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeInfo.badgeClass}">${typeInfo.name}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">Zona: <strong class="text-slate-800 dark:text-slate-200">${nextWorkout.plannedZone || typeInfo.zone}</strong></span>
          </div>
          <h4 class="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white">${nextWorkout.title}</h4>
          <p class="text-xs text-slate-600 dark:text-slate-300"><strong class="text-emerald-600 dark:text-emerald-400">¿Qué mejora?:</strong> ${typeInfo.primaryBenefit}</p>
          ${nextWorkout.notes ? `<p class="text-xs text-slate-500 dark:text-slate-400 italic">"${nextWorkout.notes}"</p>` : ''}
        </div>
        <div class="flex sm:flex-col items-center sm:items-end justify-between gap-3 rp-subtle-box p-4 min-w-[195px]">
          <div class="sm:text-right">
            <div class="text-2xl font-display font-bold text-slate-900 dark:text-white">${nextWorkout.plannedKm || 0} <span class="text-xs font-normal text-slate-500">km</span></div>
            <div class="text-xs font-semibold text-sky-600 dark:text-sky-400">Ritmo: ${nextWorkout.plannedPace || '--:--'} /km</div>
          </div>
          <button onclick="openWorkoutModal('${nextWorkout.id}')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 w-full justify-center shadow-sm transition">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Registrar Sesión
          </button>
        </div>
      </div>
    `;
  } else if (nextContainer) {
    nextContainer.innerHTML = `<div class="p-4 text-xs text-slate-500">No tienes entrenamientos programados. Pulsa "Registrar Entreno" arriba para crear el primero.</div>`;
  }

  const modifiedOrHard = appState.workouts.filter(
    (w) =>
      w.status === 'modified' ||
      w.status === 'skipped' ||
      (w.status === 'completed' && Number(w.actualRpe) >= 8)
  );
  const alertBox = document.getElementById('discrepancyAlertBox');
  if (alertBox) {
    if (modifiedOrHard.length > 0) {
      const latest = modifiedOrHard[modifiedOrHard.length - 1];
      alertBox.innerHTML = `
        <div class="flex items-start gap-2">
          <i data-lucide="alert-circle" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-bold text-amber-700 dark:text-amber-300">Nota del Entrenador:</span>
            En <em>"${latest.title}"</em> (${formatShortSpanishDate(latest.date)}) registraste RPE ${latest.actualRpe || '-'}/10 (${latest.actualKm || 0}km de ${latest.plannedKm || 0}km). Tus recomendaciones diarias ya fueron ajustadas.
          </div>
        </div>
      `;
    } else {
      alertBox.innerHTML = `
        <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
          <i data-lucide="check-circle-2" class="w-4 h-4 shrink-0"></i>
          <span>Tus entrenamientos van al día y sin alertas de fatiga excesiva.</span>
        </div>
      `;
    }
  }

  renderDashboardCharts();
  renderBanisterMonitor();
  renderTrophiesShowcase();
  updateInjuryDashboardBadge();
  updateRaceChecklistBadge();
  if (window.lucide) lucide.createIcons();
}

function getChartThemeColors() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    textColor: isDark ? '#cbd5e1' : '#475569',
    mutedColor: isDark ? '#94a3b8' : '#64748b',
    gridColor: isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(226, 232, 240, 0.8)'
  };
}

function renderDashboardCharts() {
  const colors = getChartThemeColors();
  const sorted = [...appState.workouts]
    .filter((w) => w.type !== 'rest' && (Number(w.plannedKm) > 0 || Number(w.actualKm) > 0))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);

  const labels = sorted.map((w) => formatShortSpanishDate(w.date));
  const plannedData = sorted.map((w) => Number(w.plannedKm) || 0);
  const actualData = sorted.map((w) =>
    w.status === 'completed' || w.status === 'modified' ? Number(w.actualKm) || 0 : 0
  );

  const ctxVol = document.getElementById('volumeComparisonChart');
  if (ctxVol) {
    if (volumeChartInstance) volumeChartInstance.destroy();
    volumeChartInstance = new Chart(ctxVol, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Km Planeados',
            data: plannedData,
            backgroundColor: 'rgba(2, 132, 199, 0.25)',
            borderColor: '#0284c7',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'Km Completados',
            data: actualData,
            backgroundColor: 'rgba(5, 150, 105, 0.8)',
            borderColor: '#059669',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: colors.textColor, font: { size: 11 } } }
        },
        scales: {
          x: { ticks: { color: colors.mutedColor, font: { size: 10 } }, grid: { color: colors.gridColor } },
          y: { ticks: { color: colors.mutedColor, font: { size: 10 } }, grid: { color: colors.gridColor } }
        }
      }
    });
  }

  const completedRuns = [...appState.workouts]
    .filter(
      (w) =>
        (w.status === 'completed' || w.status === 'modified') &&
        Number(w.actualKm) > 0 &&
        w.actualPace
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const paceLabels = completedRuns.map((w) => formatShortSpanishDate(w.date));
  const paceDecimal = completedRuns.map((w) =>
    Number(paceStringToDecimalMinutes(w.actualPace).toFixed(2))
  );
  const hrValues = completedRuns.map((w) => Number(w.actualHR) || null);

  const ctxPace = document.getElementById('paceHrTrendChart');
  if (ctxPace) {
    if (paceHrChartInstance) paceHrChartInstance.destroy();
    paceHrChartInstance = new Chart(ctxPace, {
      type: 'line',
      data: {
        labels: paceLabels,
        datasets: [
          {
            label: 'Ritmo Real (min/km)',
            data: paceDecimal,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            yAxisID: 'yPace',
            tension: 0.3,
            fill: true,
            pointRadius: 4
          },
          {
            label: 'FC Media (ppm)',
            data: hrValues,
            borderColor: '#e11d48',
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            yAxisID: 'yHR',
            tension: 0.3,
            borderDash: [4, 4],
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: colors.textColor, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                if (ctx.datasetIndex === 0) {
                  return `Ritmo: ${decimalMinutesToPaceString(ctx.parsed.y)} min/km`;
                }
                return `FC Media: ${ctx.parsed.y} ppm`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: colors.mutedColor, font: { size: 10 } }, grid: { color: colors.gridColor } },
          yPace: {
            type: 'linear',
            position: 'left',
            reverse: true,
            ticks: {
              color: '#0284c7',
              font: { size: 10 },
              callback: (val) => decimalMinutesToPaceString(val)
            },
            grid: { color: colors.gridColor }
          },
          yHR: {
            type: 'linear',
            position: 'right',
            ticks: { color: '#e11d48', font: { size: 10 } },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }
}

// ============================================================================
// RENDERIZADO: PESTAÑA 2 — CALENDARIO SEMANAL Y TABLA DE ENTRENAMIENTOS
// ============================================================================

function changeWeekOffset(delta) {
  if (delta === 0) currentWeekOffset = 0;
  else currentWeekOffset += delta;
  renderCalendarAndTable();
}

function renderCalendarAndTable() {
  const monday = getMondayOfWeek(currentWeekOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const rangeLabel = document.getElementById('calendarWeekRangeLabel');
  if (rangeLabel) {
    rangeLabel.textContent = `Semana del ${formatShortSpanishDate(formatDateISO(monday))} al ${formatShortSpanishDate(formatDateISO(sunday))}`;
  }

  const grid = document.getElementById('weeklyCalendarGrid');
  const todayISO = getLocalISODate(0);
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  if (grid) {
    let html = '';
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateISO(d);
      const isToday = iso === todayISO;
      const dayWorkouts = appState.workouts.filter((w) => w.date === iso);

      html += `
        <div class="rp-card p-3.5 flex flex-col justify-between min-h-[195px] ${
          isToday ? 'ring-2 ring-emerald-500/70' : ''
        }">
          <div>
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
              <div>
                <div class="text-xs font-bold ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}">${dayNames[i]}</div>
                <div class="text-[11px] text-slate-400">${d.getDate()}/${d.getMonth() + 1}</div>
              </div>
              <button onclick="openWorkoutModal(null, '${iso}')" class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600" title="Agregar sesión este día">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <div class="space-y-2">
              ${
                dayWorkouts.length === 0
                  ? `<div class="text-[11px] text-slate-400 py-6 text-center italic">Día libre</div>`
                  : dayWorkouts
                      .map((w) => {
                        const t = WORKOUT_TYPES_CATALOG[w.type] || WORKOUT_TYPES_CATALOG.easy;
                        const hasShots = Array.isArray(w.screenshots) && w.screenshots.length > 0;
                        const statusBorder =
                          w.status === 'completed'
                            ? 'border-l-4 border-l-emerald-500'
                            : w.status === 'modified'
                            ? 'border-l-4 border-l-amber-500'
                            : w.status === 'skipped'
                            ? 'border-l-4 border-l-rose-500 opacity-60'
                            : 'border-l-4 border-l-sky-500';

                        return `
                          <div onclick="openWorkoutModal('${w.id}')" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 ${statusBorder} cursor-pointer hover:border-emerald-500/50 transition space-y-1">
                            <div class="flex items-center justify-between gap-1">
                              <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded border ${t.badgeClass}">${t.shortName}</span>
                              <span class="text-[10px] text-slate-400 flex items-center gap-1">
                                ${hasShots ? `<span title="Capturas">📷${w.screenshots.length}</span>` : ''}
                                ${
                                  w.status === 'completed'
                                    ? '✅'
                                    : w.status === 'modified'
                                    ? '⚡'
                                    : w.status === 'skipped'
                                    ? '❌'
                                    : '⏳'
                                }
                              </span>
                            </div>
                            <div class="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">${w.title}</div>
                            <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                              <span>Plan: <strong>${w.plannedKm || 0}k</strong></span>
                              ${
                                w.status === 'completed' || w.status === 'modified'
                                  ? `<span class="text-emerald-600 dark:text-emerald-400 font-bold">Real: ${w.actualKm || 0}k</span>`
                                  : `<span>${w.plannedPace || ''}</span>`
                              }
                            </div>
                          </div>
                        `;
                      })
                      .join('')
              }
            </div>
          </div>
        </div>
      `;
    }
    grid.innerHTML = html;
  }

  renderWorkoutsTable();
  if (window.lucide) lucide.createIcons();
}

function renderWorkoutsTable() {
  const typeFilter = document.getElementById('filterWorkoutType')?.value || 'all';
  const statusFilter = document.getElementById('filterWorkoutStatus')?.value || 'all';

  const filtered = [...appState.workouts]
    .filter((w) => (typeFilter === 'all' ? true : w.type === typeFilter))
    .filter((w) => (statusFilter === 'all' ? true : w.status === statusFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const tbody = document.getElementById('workoutsTableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">No hay entrenamientos con este filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((w) => {
      const t = WORKOUT_TYPES_CATALOG[w.type] || WORKOUT_TYPES_CATALOG.easy;
      const isDone = w.status === 'completed' || w.status === 'modified';
      const shots = Array.isArray(w.screenshots) ? w.screenshots : [];

      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
          <td class="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">${formatShortSpanishDate(w.date)}</td>
          <td class="py-3 px-3">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${t.badgeClass}">${t.shortName}</span>
              <span class="font-bold text-slate-900 dark:text-white">${w.title}</span>
            </div>
            ${w.watchAnalysis ? `<div class="text-[11px] text-indigo-600 dark:text-indigo-300 mt-0.5">⌚ ${w.watchAnalysis}</div>` : ''}
            ${w.notes ? `<div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${w.notes}</div>` : ''}
          </td>
          <td class="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
            ${w.plannedKm || 0} km · ${w.plannedPace || '--:--'}/km
          </td>
          <td class="py-3 px-3 whitespace-nowrap">
            ${
              isDone
                ? `<span class="text-emerald-600 dark:text-emerald-400 font-bold">${w.actualKm || 0} km</span> a <span class="font-semibold text-slate-900 dark:text-white">${w.actualPace || '--:--'}/km</span>`
                : w.status === 'skipped'
                ? `<span class="text-rose-500 font-medium">Omitido</span>`
                : `<span class="text-slate-400">Pendiente</span>`
            }
          </td>
          <td class="py-3 px-3 whitespace-nowrap">
            ${
              isDone
                ? `<span class="font-medium text-slate-700 dark:text-slate-200">${w.actualHR ? w.actualHR + ' ppm' : '--'}</span>
                   · <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-semibold">RPE ${w.actualRpe || '-'}/10</span>`
                : '--'
            }
          </td>
          <td class="py-3 px-3 whitespace-nowrap">
            ${
              shots.length > 0
                ? `<button onclick="openWorkoutScreenshotGalleryById('${w.id}')" class="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-[11px] font-semibold">
                    📷 Ver (${shots.length})
                  </button>`
                : `<span class="text-slate-400 text-[11px]">--</span>`
            }
          </td>
          <td class="py-3 px-3 text-right whitespace-nowrap">
            <button onclick="openWorkoutModal('${w.id}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition">
              ${isDone ? 'Editar' : 'Registrar'}
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ============================================================================
// MODAL DE ENTRENAMIENTO
// ============================================================================

function openWorkoutModal(workoutId = null, defaultDate = null) {
  const modal = document.getElementById('workoutModal');
  const deleteBtn = document.getElementById('wmDeleteBtn');
  const visionStatus = document.getElementById('wmVisionStatus');
  if (!modal) return;
  if (visionStatus) visionStatus.className = 'hidden';

  if (workoutId) {
    const w = appState.workouts.find((item) => item.id === workoutId);
    if (!w) return;
    document.getElementById('wmId').value = w.id;
    document.getElementById('wmDate').value = w.date;
    document.getElementById('wmType').value = w.type;
    document.getElementById('wmStatus').value = w.status;
    document.getElementById('wmTitle').value = w.title;
    document.getElementById('wmPlannedKm').value = w.plannedKm || '';
    document.getElementById('wmPlannedMin').value = w.plannedMin || '';
    document.getElementById('wmPlannedPace').value = w.plannedPace || '';
    document.getElementById('wmPlannedZone').value = w.plannedZone || '';
    document.getElementById('wmActualKm').value = w.actualKm || '';
    document.getElementById('wmActualMin').value = w.actualMin || '';
    document.getElementById('wmActualPace').value = w.actualPace || '';
    document.getElementById('wmActualHR').value = w.actualHR || '';
    document.getElementById('wmActualMaxHR').value = w.actualMaxHR || '';
    document.getElementById('wmActualCadence').value = w.actualCadence || '';
    document.getElementById('wmActualElevation').value = w.actualElevation || '';
    document.getElementById('wmActualCalories').value = w.actualCalories || '';
    document.getElementById('wmActualRpe').value = w.actualRpe || 6;
    document.getElementById('wmRpeValueLabel').textContent = w.actualRpe || 6;
    document.getElementById('wmWatchAnalysis').value = w.watchAnalysis || '';
    document.getElementById('wmNotes').value = w.notes || '';
    currentModalScreenshots = Array.isArray(w.screenshots) ? [...w.screenshots] : [];
    deleteBtn.classList.remove('hidden');
    const shareBtn = document.getElementById('wmShareBtn');
    if (shareBtn) {
      if (w.status === 'completed' || w.status === 'modified' || Number(w.actualKm) > 0) {
        shareBtn.classList.remove('hidden');
      } else {
        shareBtn.classList.add('hidden');
      }
    }
  } else {
    document.getElementById('wmId').value = '';
    document.getElementById('wmDate').value = defaultDate || getLocalISODate(0);
    document.getElementById('wmType').value = 'easy';
    document.getElementById('wmStatus').value = 'planned';
    document.getElementById('wmTitle').value = '';
    document.getElementById('wmPlannedKm').value = '';
    document.getElementById('wmPlannedMin').value = '';
    document.getElementById('wmPlannedPace').value = '';
    document.getElementById('wmPlannedZone').value = 'Z2';
    document.getElementById('wmActualKm').value = '';
    document.getElementById('wmActualMin').value = '';
    document.getElementById('wmActualPace').value = '';
    document.getElementById('wmActualHR').value = '';
    document.getElementById('wmActualMaxHR').value = '';
    document.getElementById('wmActualCadence').value = '';
    document.getElementById('wmActualElevation').value = '';
    document.getElementById('wmActualCalories').value = '';
    document.getElementById('wmActualRpe').value = 5;
    document.getElementById('wmRpeValueLabel').textContent = 5;
    document.getElementById('wmWatchAnalysis').value = '';
    document.getElementById('wmNotes').value = '';
    currentModalScreenshots = [];
    deleteBtn.classList.add('hidden');
    const shareBtn = document.getElementById('wmShareBtn');
    if (shareBtn) shareBtn.classList.add('hidden');
  }

  renderModalScreenshotsGallery();
  updateModalPhysiologyPreview();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

function closeWorkoutModal() {
  const modal = document.getElementById('workoutModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function updateModalPhysiologyPreview() {
  const type = document.getElementById('wmType')?.value || 'easy';
  const info = WORKOUT_TYPES_CATALOG[type] || WORKOUT_TYPES_CATALOG.easy;
  const preview = document.getElementById('wmPhysiologyPreview');
  if (!preview) return;
  preview.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-2 py-0.5 rounded text-[11px] font-semibold border ${info.badgeClass}">${info.shortName}</span>
      <span class="text-slate-700 dark:text-slate-300"><strong>Beneficio:</strong> ${info.primaryBenefit}</span>
    </div>
    <span class="text-[11px] text-slate-500">Recuperación: ${info.recoveryHours}</span>
  `;
}

function copyPlannedToActual() {
  document.getElementById('wmActualKm').value = document.getElementById('wmPlannedKm').value;
  document.getElementById('wmActualMin').value = document.getElementById('wmPlannedMin').value;
  document.getElementById('wmActualPace').value = document.getElementById('wmPlannedPace').value;
  document.getElementById('wmStatus').value = 'completed';
}

function autoCalculateActualPace() {
  const km = Number(document.getElementById('wmActualKm').value);
  const min = Number(document.getElementById('wmActualMin').value);
  if (km > 0 && min > 0) {
    const paceDec = min / km;
    document.getElementById('wmActualPace').value = decimalMinutesToPaceString(paceDec);
    if (document.getElementById('wmStatus').value === 'planned') {
      document.getElementById('wmStatus').value = 'completed';
    }
  }
}

function saveWorkoutFromModal() {
  const id = document.getElementById('wmId').value || `w-${Date.now()}`;
  const actualKmVal = Number(document.getElementById('wmActualKm').value) || 0;
  let statusVal = document.getElementById('wmStatus').value;
  if ((actualKmVal > 0 || currentModalScreenshots.length > 0) && statusVal === 'planned') {
    statusVal = 'completed';
  }

  const workoutObj = {
    id,
    date: document.getElementById('wmDate').value,
    type: document.getElementById('wmType').value,
    status: statusVal,
    title: document.getElementById('wmTitle').value.trim(),
    plannedKm: Number(document.getElementById('wmPlannedKm').value) || 0,
    plannedMin: Number(document.getElementById('wmPlannedMin').value) || 0,
    plannedPace: document.getElementById('wmPlannedPace').value.trim(),
    plannedZone: document.getElementById('wmPlannedZone').value.trim(),
    actualKm: actualKmVal,
    actualMin: Number(document.getElementById('wmActualMin').value) || 0,
    actualPace: document.getElementById('wmActualPace').value.trim(),
    actualHR: Number(document.getElementById('wmActualHR').value) || 0,
    actualMaxHR: Number(document.getElementById('wmActualMaxHR').value) || 0,
    actualCadence: Number(document.getElementById('wmActualCadence').value) || 0,
    actualElevation: Number(document.getElementById('wmActualElevation').value) || 0,
    actualCalories: Number(document.getElementById('wmActualCalories').value) || 0,
    actualRpe: Number(document.getElementById('wmActualRpe').value) || 5,
    watchAnalysis: document.getElementById('wmWatchAnalysis').value.trim(),
    notes: document.getElementById('wmNotes').value.trim(),
    screenshots: [...currentModalScreenshots]
  };

  const existingIdx = appState.workouts.findIndex((w) => w.id === id);
  if (existingIdx >= 0) appState.workouts[existingIdx] = workoutObj;
  else appState.workouts.push(workoutObj);

  saveState();
  closeWorkoutModal();
  renderDashboard();
  renderCalendarAndTable();
  showToast('Entrenamiento guardado y recomendaciones diarias actualizadas');
}

function deleteWorkoutFromModal() {
  const id = document.getElementById('wmId').value;
  if (!id) return;
  appState.workouts = appState.workouts.filter((w) => w.id !== id);
  saveState();
  closeWorkoutModal();
  renderDashboard();
  renderCalendarAndTable();
  showToast('Sesión eliminada');
}

// ============================================================================
// PESTAÑA 3: FISIOLOGÍA VISUAL Y DATOS CURIOSOS
// ============================================================================

function calculateUserAccumulatedScores() {
  const totals = {
    aerobicBase: 0,
    lactateThreshold: 0,
    vo2Max: 0,
    runningEconomy: 0,
    muscularStrength: 0,
    glycogenEndurance: 0
  };

  const completed = appState.workouts.filter(
    (w) => w.status === 'completed' || w.status === 'modified'
  );
  if (completed.length === 0) {
    return {
      aerobicBase: 5,
      lactateThreshold: 5,
      vo2Max: 5,
      runningEconomy: 5,
      muscularStrength: 5,
      glycogenEndurance: 5
    };
  }

  completed.forEach((w) => {
    const t = WORKOUT_TYPES_CATALOG[w.type] || WORKOUT_TYPES_CATALOG.easy;
    const weight = Math.max(Number(w.actualKm) || 4, 3) / 8;
    Object.keys(totals).forEach((k) => {
      totals[k] += t.scores[k] * weight;
    });
  });

  const maxVal = Math.max(...Object.values(totals), 1);
  const normalized = {};
  Object.keys(totals).forEach((k) => {
    normalized[k] = Number(((totals[k] / maxVal) * 9.5).toFixed(1));
  });
  return normalized;
}

function selectPhysiologyWorkoutType(typeKey) {
  selectedPhysiologyType = typeKey;
  renderPhysiologyTab();
}

function renderPhysiologyTab() {
  const btnContainer = document.getElementById('workoutTypeSelectorButtons');
  const activeTypes = ['easy', 'tempo', 'intervals', 'long', 'fartlek', 'hills', 'strength', 'race'];

  if (btnContainer) {
    btnContainer.innerHTML = activeTypes
      .map((key) => {
        const t = WORKOUT_TYPES_CATALOG[key];
        const isSel = key === selectedPhysiologyType;
        return `
          <button onclick="selectPhysiologyWorkoutType('${key}')" class="p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
            isSel
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white font-bold shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }">
            <span class="text-xs">${t.shortName}</span>
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${t.color}"></span>
          </button>
        `;
      })
      .join('');
  }

  const info = WORKOUT_TYPES_CATALOG[selectedPhysiologyType] || WORKOUT_TYPES_CATALOG.easy;
  const detailCard = document.getElementById('selectedTypeDetailCard');
  if (detailCard) {
    detailCard.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.badgeClass}">${info.name}</span>
        <span class="text-xs text-slate-500">Zona: <strong class="text-slate-900 dark:text-white">${info.zone}</strong></span>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${info.description}</p>
      <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
        <div><strong class="text-emerald-600 dark:text-emerald-400">Adaptación Clave:</strong> <span>${info.primaryBenefit}</span></div>
        <div><strong class="text-sky-600 dark:text-sky-400">Supercompensación:</strong> <span>${info.recoveryHours}</span></div>
      </div>
    `;
  }

  const userScores = calculateUserAccumulatedScores();
  const accBars = document.getElementById('accumulatedAdaptationBars');
  if (accBars) {
    accBars.innerHTML = PHYSIOLOGY_DIMENSIONS.map((dim) => {
      const score = userScores[dim.key];
      return `
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-700 dark:text-slate-300 font-medium">${dim.label}</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">${score} / 10</span>
          </div>
          <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full" style="width: ${score * 10}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  updatePhysiologyRadar();
  renderIntensityPolarizationChart();
  renderFactsLibraryGrid();
  renderPhysiologyMatrixTable();
}

function updatePhysiologyRadar() {
  const ctx = document.getElementById('physiologyRadarChart');
  if (!ctx) return;
  const colors = getChartThemeColors();

  const primaryType = WORKOUT_TYPES_CATALOG[selectedPhysiologyType] || WORKOUT_TYPES_CATALOG.intervals;
  const compareKey = document.getElementById('compareWorkoutTypeSelect')?.value || 'user_accumulated';

  let secondaryLabel = 'Tu Perfil Acumulado';
  let secondaryData = [];
  let secondaryColor = '#059669';

  if (compareKey === 'user_accumulated') {
    const userScores = calculateUserAccumulatedScores();
    secondaryData = PHYSIOLOGY_DIMENSIONS.map((d) => userScores[d.key]);
  } else {
    const compType = WORKOUT_TYPES_CATALOG[compareKey] || WORKOUT_TYPES_CATALOG.easy;
    secondaryLabel = compType.name;
    secondaryData = PHYSIOLOGY_DIMENSIONS.map((d) => compType.scores[d.key]);
    secondaryColor = compType.color;
  }

  if (radarChartInstance) radarChartInstance.destroy();
  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: PHYSIOLOGY_DIMENSIONS.map((d) => d.label),
      datasets: [
        {
          label: primaryType.name,
          data: PHYSIOLOGY_DIMENSIONS.map((d) => primaryType.scores[d.key]),
          backgroundColor: `${primaryType.color}28`,
          borderColor: primaryType.color,
          pointBackgroundColor: primaryType.color,
          borderWidth: 2.5
        },
        {
          label: secondaryLabel,
          data: secondaryData,
          backgroundColor: 'rgba(5, 150, 105, 0.15)',
          borderColor: secondaryColor,
          pointBackgroundColor: secondaryColor,
          borderWidth: 2,
          borderDash: [4, 4]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: { stepSize: 2, display: false },
          grid: { color: colors.gridColor },
          angleLines: { color: colors.gridColor },
          pointLabels: { color: colors.textColor, font: { size: 11, weight: '600' } }
        }
      },
      plugins: {
        legend: { labels: { color: colors.textColor, font: { size: 12 } } }
      }
    }
  });
}

function renderIntensityPolarizationChart() {
  const ctx = document.getElementById('intensityDistributionChart');
  if (!ctx) return;
  const colors = getChartThemeColors();

  let lowKm = 0;
  let modKm = 0;
  let highKm = 0;

  appState.workouts
    .filter((w) => w.status === 'completed' || w.status === 'modified' || w.status === 'planned')
    .forEach((w) => {
      const km = Number(w.actualKm) || Number(w.plannedKm) || 0;
      if (w.type === 'easy' || w.type === 'long') lowKm += km;
      else if (w.type === 'tempo' || w.type === 'fartlek') modKm += km;
      else if (w.type === 'intervals' || w.type === 'hills' || w.type === 'race') highKm += km;
    });

  const total = lowKm + modKm + highKm || 1;
  const lowPct = Math.round((lowKm / total) * 100);
  const hardPct = 100 - lowPct;

  const badge = document.getElementById('polarizationBadge');
  if (badge) badge.textContent = `${lowPct}% Suave / ${hardPct}% Intenso`;

  if (intensityChartInstance) intensityChartInstance.destroy();
  intensityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Z1-Z2 Suave / Fondo', 'Z3-Z4 Umbral / Tempo', 'Z5 Series / VO2max'],
      datasets: [
        {
          label: 'Kilómetros',
          data: [Number(lowKm.toFixed(1)), Number(modKm.toFixed(1)), Number(highKm.toFixed(1))],
          backgroundColor: ['#059669', '#d97706', '#e11d48'],
          borderRadius: 8
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: colors.mutedColor }, grid: { color: colors.gridColor } },
        y: { ticks: { color: colors.textColor, font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

function renderPhysiologyMatrixTable() {
  const tbody = document.getElementById('physiologyMatrixTableBody');
  if (!tbody) return;
  const keys = ['easy', 'long', 'tempo', 'fartlek', 'intervals', 'hills', 'strength', 'race'];

  const renderScorePill = (val) => {
    const color =
      val >= 9
        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40'
        : val >= 7
        ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/40'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    return `<span class="px-2 py-0.5 rounded border font-semibold ${color}">${val}/10</span>`;
  };

  tbody.innerHTML = keys
    .map((k) => {
      const t = WORKOUT_TYPES_CATALOG[k];
      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onclick="selectPhysiologyWorkoutType('${k}')">
          <td class="py-3 px-3 font-bold text-slate-900 dark:text-white">
            <span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background-color:${t.color}"></span>
            ${t.name}
          </td>
          <td class="py-3 px-3 text-slate-600 dark:text-slate-300">${t.zone}</td>
          <td class="py-3 px-3">${renderScorePill(t.scores.aerobicBase)}</td>
          <td class="py-3 px-3">${renderScorePill(t.scores.lactateThreshold)}</td>
          <td class="py-3 px-3">${renderScorePill(t.scores.vo2Max)}</td>
          <td class="py-3 px-3">${renderScorePill(t.scores.runningEconomy)}</td>
          <td class="py-3 px-3">${renderScorePill(t.scores.muscularStrength)}</td>
          <td class="py-3 px-3">${renderScorePill(t.scores.glycogenEndurance)}</td>
        </tr>
      `;
    })
    .join('');
}

// ============================================================================
// PESTAÑA 4: OBJETIVOS Y PREDICCIÓN DE MARCAS (VDOT)
// ============================================================================

function renderGoalsTab() {
  renderMotivationalProgressBanners();
  renderDistancePlanShowcase();

  const container = document.getElementById('goalsGridContainer');
  const vdot = getRunnerVDOT(appState.profile);
  const predSpan = document.getElementById('predictorVdotSpan');
  if (predSpan) predSpan.textContent = vdot.toFixed(1);

  if (container) {
    if (appState.goals.length === 0) {
      container.innerHTML = `<div class="col-span-full rp-card p-8 text-center text-slate-400 text-xs">No tienes objetivos registrados. Crea tu primer reto arriba.</div>`;
    } else {
      container.innerHTML = appState.goals
        .map((g) => {
          const targetSec = parseTimeToSeconds(g.targetTime);
          const reqPace =
            targetSec > 0 && g.distanceKm > 0
              ? formatSecondsToTime(targetSec / g.distanceKm)
              : '--:--';
          const reqVdot = calculateVDOTFromRace(g.distanceKm * 1000, targetSec);
          const diffDays = Math.ceil((new Date(g.date) - new Date()) / (1000 * 60 * 60 * 24));
          const vdotGap = reqVdot ? (reqVdot - vdot).toFixed(1) : 0;

          return `
            <div class="rp-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    g.priority === 'A'
                      ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                      : 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40'
                  }">Prioridad ${g.priority}</span>
                  <span class="text-xs text-slate-500">${
                    diffDays >= 0 ? `En ${diffDays} días` : 'Finalizado'
                  }</span>
                </div>
                <h3 class="font-display font-bold text-base text-slate-900 dark:text-white">${g.name}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${g.notes || ''}</p>
              </div>

              <div class="grid grid-cols-3 gap-2 rp-subtle-box p-3 text-center">
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Distancia</div>
                  <div class="text-sm font-bold text-slate-900 dark:text-white">${Number(g.distanceKm).toFixed(1)}k</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Meta</div>
                  <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400">${g.targetTime}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Ritmo</div>
                  <div class="text-sm font-bold text-sky-600 dark:text-sky-400">${reqPace}/k</div>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <span class="text-slate-500">
                  VDOT req: <strong class="text-slate-800 dark:text-white">${reqVdot ? reqVdot.toFixed(1) : '--'}</strong>
                  ${
                    reqVdot
                      ? vdotGap > 0
                        ? `<span class="text-amber-600 dark:text-amber-400">(+${vdotGap} pts)</span>`
                        : `<span class="text-emerald-600 dark:text-emerald-400">(¡A tu alcance!)</span>`
                      : ''
                  }
                </span>
                <button onclick="deleteGoal('${g.id}')" class="text-rose-500 hover:underline text-xs font-medium">Eliminar</button>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  const predGrid = document.getElementById('racePredictionsGrid');
  if (predGrid) {
    const standardRaces = [
      { label: '5K Ruta', meters: 5000, forceHours: false },
      { label: '10K Ruta', meters: 10000, forceHours: false },
      { label: 'Media Maratón (21.1K)', meters: 21097.5, forceHours: true },
      { label: 'Maratón (42.2K)', meters: 42195, forceHours: true }
    ];
    predGrid.innerHTML = standardRaces
      .map((r) => {
        const sec = predictRaceTimeSeconds(vdot, r.meters);
        const pace = formatSecondsToTime(sec / (r.meters / 1000));
        return `
          <div class="rp-subtle-box p-4">
            <div class="text-xs text-slate-500 dark:text-slate-400">${r.label}</div>
            <div class="text-xl font-display font-bold text-slate-900 dark:text-white mt-1">${formatSecondsToTime(sec, r.forceHours)}</div>
            <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Ritmo: ${pace} /km</div>
          </div>
        `;
      })
      .join('');
  }
}

function openGoalModal() {
  const modal = document.getElementById('goalModal');
  if (!modal) return;
  document.getElementById('gmId').value = '';
  document.getElementById('gmName').value = '';
  document.getElementById('gmDistanceSelect').value = '21.0975';
  document.getElementById('gmCustomDistWrapper').classList.add('hidden');
  document.getElementById('gmDate').value = getLocalISODate(60);
  document.getElementById('gmTargetTime').value = '01:40:00';
  document.getElementById('gmPriority').value = 'A';
  document.getElementById('gmNotes').value = '';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeGoalModal() {
  const modal = document.getElementById('goalModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleGoalDistanceSelect() {
  const val = document.getElementById('gmDistanceSelect').value;
  const wrapper = document.getElementById('gmCustomDistWrapper');
  if (val === 'custom') wrapper.classList.remove('hidden');
  else wrapper.classList.add('hidden');
}

function saveGoalFromModal() {
  const distSel = document.getElementById('gmDistanceSelect').value;
  const distanceKm =
    distSel === 'custom'
      ? Number(document.getElementById('gmCustomDistance').value) || 10
      : Number(distSel);

  appState.goals.push({
    id: `goal-${Date.now()}`,
    name: document.getElementById('gmName').value.trim(),
    distanceKm,
    date: document.getElementById('gmDate').value,
    targetTime: document.getElementById('gmTargetTime').value.trim(),
    priority: document.getElementById('gmPriority').value,
    notes: document.getElementById('gmNotes').value.trim()
  });

  saveState();
  closeGoalModal();
  renderGoalsTab();
  renderDashboard();
  showToast('Objetivo guardado');
}

function deleteGoal(goalId) {
  appState.goals = appState.goals.filter((g) => g.id !== goalId);
  saveState();
  renderGoalsTab();
  renderDashboard();
  showToast('Objetivo eliminado');
}

// ============================================================================
// PESTAÑA 5: PERFIL FISIOLÓGICO Y ZONAS
// ============================================================================

function renderProfileTab() {
  const p = appState.profile || {};
  document.getElementById('profName').value = p.name || '';
  document.getElementById('profAge').value = p.age || '';
  document.getElementById('profWeight').value = p.weight || '';
  document.getElementById('profHeight').value = p.height || '';
  document.getElementById('profRestHR').value = p.restHR || '';
  document.getElementById('profMaxHR').value = p.maxHR || '';
  document.getElementById('profLTHR').value = p.lthr || '';
  document.getElementById('profVo2max').value = p.vo2max || '';
  document.getElementById('profCadence').value = p.cadence || '';
  document.getElementById('profExperience').value = p.experience || 'intermedio';
  document.getElementById('profDaysAvailable').value = p.daysAvailable || 5;
  document.getElementById('profLongRunDay').value = p.longRunDay || 'Domingo';
  document.getElementById('profPr5k').value = p.pr5k || '';
  document.getElementById('profPr10k').value = p.pr10k || '';
  document.getElementById('profPr21k').value = p.pr21k || '';
  document.getElementById('profPr42k').value = p.pr42k || '';
  document.getElementById('profTerrain').value = p.terrain || '';
  document.getElementById('profShoes').value = p.shoes || '';
  document.getElementById('profInjuries').value = p.injuries || '';

  if (p.weight && p.height) {
    const bmi = (Number(p.weight) / Math.pow(Number(p.height) / 100, 2)).toFixed(1);
    document.getElementById('profileBmiBadge').textContent = `IMC: ${bmi}`;
  }

  const zones = getTrainingZones(p);
  const zContainer = document.getElementById('trainingZonesContainer');
  if (zContainer) {
    zContainer.innerHTML = zones
      .map(
        (z) => `
        <div class="rp-subtle-box p-3.5 space-y-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${z.dot}"></span>
              <span class="font-display font-bold text-sm text-slate-900 dark:text-white">${z.zone} — ${z.name}</span>
            </div>
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">${z.hrRange}</span>
          </div>
          <div class="flex items-center justify-between text-xs pt-0.5">
            <span class="text-slate-500 dark:text-slate-400">${z.desc}</span>
            <span class="font-mono font-bold text-slate-800 dark:text-slate-200">${z.paceRange}</span>
          </div>
        </div>
      `
      )
      .join('');
  }
}

function saveProfileForm() {
  appState.profile = {
    name: document.getElementById('profName').value.trim() || 'Corredor',
    age: Number(document.getElementById('profAge').value) || 30,
    weight: Number(document.getElementById('profWeight').value) || 70,
    height: Number(document.getElementById('profHeight').value) || 175,
    restHR: Number(document.getElementById('profRestHR').value) || 55,
    maxHR: Number(document.getElementById('profMaxHR').value) || 190,
    lthr: Number(document.getElementById('profLTHR').value) || 172,
    vo2max: Number(document.getElementById('profVo2max').value) || 0,
    cadence: Number(document.getElementById('profCadence').value) || 172,
    experience: document.getElementById('profExperience').value,
    daysAvailable: Number(document.getElementById('profDaysAvailable').value) || 5,
    longRunDay: document.getElementById('profLongRunDay').value,
    pr5k: document.getElementById('profPr5k').value.trim(),
    pr10k: document.getElementById('profPr10k').value.trim(),
    pr21k: document.getElementById('profPr21k').value.trim(),
    pr42k: document.getElementById('profPr42k').value.trim(),
    terrain: document.getElementById('profTerrain').value.trim(),
    shoes: document.getElementById('profShoes').value.trim(),
    injuries: document.getElementById('profInjuries').value.trim()
  };

  saveState();
  renderProfileTab();
  renderDashboard();
  showToast('Perfil y zonas actualizados');
}

// ============================================================================
// PESTAÑA 6: CENTRO GEMINI AI
// ============================================================================

function saveGeminiApiKey() {
  const key = document.getElementById('geminiApiKeyInput')?.value.trim() || '';
  localStorage.setItem(GEMINI_KEY_STORAGE, key);
  showToast('API Key guardada localmente');
}

function renderGeminiTab() {
  generateGeminiPrompt('adjust');
  renderCoachFeedbackBox();
}

function renderCoachFeedbackBox() {
  const fb = appState.coachFeedback;
  const box = document.getElementById('coachAnalysisBox');
  const dateEl = document.getElementById('lastCoachAdjustmentDate');
  if (!box || !fb) return;

  if (dateEl) dateEl.textContent = `Actualizado: ${formatShortSpanishDate(fb.lastUpdated)}`;
  box.innerHTML = `
    <p class="font-medium text-slate-800 dark:text-slate-200">${fb.summary || 'Sin análisis aún.'}</p>
    ${
      fb.recommendations && fb.recommendations.length > 0
        ? `<ul class="list-disc pl-4 space-y-1 text-emerald-700 dark:text-emerald-300 pt-1">
            ${fb.recommendations.map((r) => `<li>${r}</li>`).join('')}
          </ul>`
        : ''
    }
  `;
}

function buildRunnerContextPrompt(mode = 'adjust') {
  const p = appState.profile;
  const vdot = getRunnerVDOT(p).toFixed(1);
  const zones = getTrainingZones(p);
  const customNote = document.getElementById('geminiCustomNote')?.value.trim() || '';

  const recentWorkouts = [...appState.workouts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);

  const mondayNext = getMondayOfWeek(mode === 'new_week' ? 1 : 0);
  const targetStartISO = mode === 'new_week' ? formatDateISO(mondayNext) : getLocalISODate(0);

  const actionInstruction =
    mode === 'new_week'
      ? `Diseña la planificación de 7 días para la semana que inicia el ${targetStartISO} (Lunes a Domingo).`
      : `Analiza mis sesiones recientes y REAJUSTA mis entrenamientos pendientes a partir de hoy (${targetStartISO}).`;

  return `Actúa como mi Entrenador Fisiológico de Running. Estado actual de ${p.name} en RunPulse AI:
- Edad: ${p.age} | Peso: ${p.weight}kg | FC Reposo: ${p.restHR} | FC Máx: ${p.maxHR} | VDOT: ${vdot}
- Nivel: ${p.experience} | Días/sem: ${p.daysAvailable} | Tirada Larga: ${p.longRunDay}
- Marcas: 5K (${p.pr5k || 'N/A'}), 10K (${p.pr10k || 'N/A'}), 21K (${p.pr21k || 'N/A'}), 42K (${p.pr42k || 'N/A'})
- Cuidados/Molestias: ${p.injuries || 'Ninguna'}
- Zonas:
${zones.map((z) => `  * ${z.zone}: ${z.hrRange} | ${z.paceRange}`).join('\n')}
- Historial reciente:
${recentWorkouts
  .map(
    (w) =>
      `  * [${w.date}] (${w.type}) "${w.title}" | Estado: ${w.status} | Plan: ${w.plannedKm}km a ${w.plannedPace} | Real: ${
        w.status === 'completed' || w.status === 'modified'
          ? `${w.actualKm}km (${w.actualPace}/km), FC ${w.actualHR}ppm, RPE ${w.actualRpe}/10`
          : 'Pendiente'
      }`
  )
  .join('\n')}
${customNote ? `\nNota de hoy: "${customNote}"\n` : ''}
Tarea: ${actionInstruction}
Devuelve un bloque JSON válido con esta estructura exacta ("type": "easy"|"tempo"|"intervals"|"long"|"fartlek"|"hills"|"strength"|"race"|"rest"):
\`\`\`json
{
  "coachSummary": "Diagnóstico breve...",
  "recommendations": ["Consejo 1", "Consejo 2"],
  "workouts": [
    {
      "date": "${targetStartISO}",
      "type": "easy",
      "title": "Rodaje Aeróbico Z2",
      "plannedKm": 8.0,
      "plannedMin": 42,
      "plannedPace": "05:15",
      "plannedZone": "Z2",
      "notes": "Objetivo fisiológico"
    }
  ]
}
\`\`\``;
}

function generateGeminiPrompt(mode = 'adjust') {
  const prompt = buildRunnerContextPrompt(mode);
  const area = document.getElementById('generatedPromptTextarea');
  if (area) area.value = prompt;
}

function copyPromptToClipboard() {
  const area = document.getElementById('generatedPromptTextarea');
  if (!area) return;
  navigator.clipboard.writeText(area.value).then(() => {
    showToast('Prompt copiado al portapapeles.');
  });
}

async function callGeminiDirectAPI(mode = 'adjust') {
  const apiKey = document.getElementById('geminiApiKeyInput')?.value.trim();
  const preferredModel = document.getElementById('geminiModelSelect')?.value || 'gemini-2.5-flash';
  const statusEl = document.getElementById('geminiApiStatusMsg');

  if (!apiKey) {
    statusEl.className = 'text-xs p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-700 dark:text-rose-300 block';
    statusEl.textContent = 'Ingresa tu Gemini API Key arriba o usa la Opción B (Copiar Prompt).';
    return;
  }

  localStorage.setItem(GEMINI_KEY_STORAGE, apiKey);
  const prompt = buildRunnerContextPrompt(mode);
  generateGeminiPrompt(mode);

  const fallbackChain = [preferredModel, 'gemini-2.5-flash', 'gemini-3-flash-preview'];
  let lastError = null;

  for (const model of fallbackChain) {
    statusEl.className = 'text-xs p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 text-indigo-700 dark:text-indigo-300 block';
    statusEl.textContent = `Analizando tu progreso con ${model}...`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      document.getElementById('geminiImportTextarea').value = rawText;
      const count = applyParsedGeminiPlan(rawText);

      statusEl.className = 'text-xs p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-700 dark:text-emerald-300 block';
      statusEl.textContent = `¡Listo! Se actualizaron ${count} entrenamientos en tu calendario.`;
      return;
    } catch (err) {
      lastError = err;
    }
  }

  statusEl.className = 'text-xs p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-700 dark:text-rose-300 block';
  statusEl.textContent = `Error al conectar con Gemini API: ${lastError ? lastError.message : 'Error'}`;
}

function importFromGeminiText() {
  const raw = document.getElementById('geminiImportTextarea')?.value.trim();
  if (!raw) {
    showToast('Pega primero la respuesta de Gemini.');
    return;
  }
  try {
    const count = applyParsedGeminiPlan(raw);
    showToast(`¡Se aplicaron ${count} entrenamientos al calendario!`);
  } catch (err) {
    alert(`No se pudo leer el formato JSON: ${err.message}`);
  }
}

function applyParsedGeminiPlan(rawText) {
  let parsed = null;
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidateJson = codeBlockMatch ? codeBlockMatch[1].trim() : rawText.trim();

  try {
    parsed = JSON.parse(candidateJson);
  } catch (_) {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
    }
  }

  if (!parsed || !Array.isArray(parsed.workouts)) {
    throw new Error('La respuesta debe incluir la lista "workouts" en JSON.');
  }

  const replacePlanned = document.getElementById('replaceFuturePlannedCheckbox')?.checked ?? true;

  if (parsed.coachSummary) {
    appState.coachFeedback = {
      lastUpdated: getLocalISODate(0),
      summary: parsed.coachSummary,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };
  }

  const validTypes = Object.keys(WORKOUT_TYPES_CATALOG);
  let importedCount = 0;

  parsed.workouts.forEach((w) => {
    if (!w.date || !w.title) return;
    const normalizedType = validTypes.includes(w.type) ? w.type : 'easy';

    if (replacePlanned) {
      appState.workouts = appState.workouts.filter(
        (existing) => !(existing.date === w.date && existing.status === 'planned')
      );
    }

    appState.workouts.push({
      id: `w-gem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: w.date,
      type: normalizedType,
      status: 'planned',
      title: w.title,
      plannedKm: Number(w.plannedKm) || 0,
      plannedMin: Number(w.plannedMin) || 0,
      plannedPace: w.plannedPace || '',
      plannedZone: w.plannedZone || WORKOUT_TYPES_CATALOG[normalizedType].zone,
      actualKm: 0,
      actualMin: 0,
      actualPace: '',
      actualHR: 0,
      actualMaxHR: 0,
      actualCadence: 0,
      actualElevation: 0,
      actualCalories: 0,
      actualRpe: 5,
      watchAnalysis: '',
      notes: w.notes || '',
      screenshots: []
    });
    importedCount++;
  });

  saveState();
  renderCoachFeedbackBox();
  renderDashboard();
  renderCalendarAndTable();
  return importedCount;
}

// ============================================================================
// EXPORTAR / IMPORTAR RESPALDOS (MULTI-CORREDOR O INDIVIDUAL)
// ============================================================================

function exportAllData() {
  saveState();
  const dataStr = JSON.stringify(multiStore, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `runpulse-todos-los-corredores-${getLocalISODate(0)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Respaldo completo de todos los corredores descargado');
}

function exportActiveUserData() {
  saveState();
  const dataStr = JSON.stringify(appState, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (appState.profile.name || 'corredor').toLowerCase().replace(/[^a-z0-9]/g, '-');
  a.download = `runpulse-${safeName}-${getLocalISODate(0)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Respaldo de ${appState.profile.name} descargado`);
}

function importAllData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && Array.isArray(imported.users)) {
        multiStore = imported;
        appState = ensureUserStateIntegrity(getActiveUserEntry().state);
        saveState();
        refreshAllViews();
        showToast('Respaldo multi-corredor restaurado con éxito');
      } else if (imported && imported.profile && Array.isArray(imported.workouts)) {
        // Es un respaldo individual: lo agregamos como nuevo perfil o actualizamos
        const newId = `user-${Date.now()}`;
        multiStore.users.push({
          id: newId,
          color: '#059669',
          createdAt: getLocalISODate(0),
          state: ensureUserStateIntegrity(imported)
        });
        multiStore.activeUserId = newId;
        appState = getActiveUserEntry().state;
        saveState();
        refreshAllViews();
        showToast(`Perfil "${imported.profile.name}" importado y activado`);
      } else {
        alert('El archivo JSON no tiene un formato válido de RunPulse.');
      }
    } catch (err) {
      alert('Error al leer el archivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function loadDemoDataConfirm() {
  if (confirm('¿Restaurar los datos iniciales de Dykembel? Esto restablecerá los datos de ejemplo.')) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    multiStore = createInitialMultiStore();
    appState = getActiveUserEntry().state;
    saveState();
    switchTab('dashboard');
    refreshAllViews();
    showToast('Datos de Dykembel restaurados');
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  loadState();
  refreshAllViews();
  startBackgroundReminderWatcher();
  if (window.lucide) lucide.createIcons();

  // Registro de Service Worker para modo offline y PWA instalable
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeWorkoutModal();
      closeGoalModal();
      closeImageLightbox();
      closeHydrationModal();
      closeTrophiesModal();
      closeRoutineTimerModal();
      closeAudioCoachModal();
      closePaceBandModal();
      closeInjuryTrackerModal();
      closeVamModal();
      closeStoryCardModal();
      closeNutritionMacroModal();
      closeRaceChecklistModal();
    }
  });
});

// ============================================================================
// PLANES ESPECÍFICOS POR DISTANCIA (5K, 10K, 15K, 21K, 42K) & BARRA MOTIVADORA
// ============================================================================

let selectedDistancePlanKey = '21k';

const DISTANCE_TRAINING_PLANS = {
  '5k': {
    id: '5k',
    label: '5K',
    name: 'Plan 5K Velocidad & VO2max',
    distanceKm: 5.0,
    durationWeeks: 4,
    badge: 'Rapidez & Potencia',
    color: '#e11d48',
    summary: 'Diseñado para elevar tu techo aeróbico (VO2max), mejorar la velocidad neuromuscular y sostener ritmos intensos sin caer en fatiga prematura.',
    weeklyKmByLevel: { finisher: 22, improver: 32, competitive: 45 },
    buildMicrocycle: (paces, mult) => [
      { dayOffset: 0, dayName: 'Lunes', type: 'rest', title: 'Descanso Activo y Movilidad de Tobillos', km: 0, min: 20, pace: '--:--', zone: 'Recuperación', notes: 'Estiramientos dinámicos y liberación miofascial.' },
      { dayOffset: 1, dayName: 'Martes', type: 'intervals', title: 'Series 6x400m a Ritmo 3K-5K (rec 90s trote)', km: +(6.5 * mult).toFixed(1), min: Math.round(35 * mult), pace: paces.z5, zone: 'Z5 (VO2max)', notes: 'Calentar 2km suaves + 6x400m rápidas pero controladas + 1.5km enfriamiento.' },
      { dayOffset: 2, dayName: 'Miércoles', type: 'easy', title: 'Rodaje Regenerativo Suave Z1-Z2', km: +(5.0 * mult).toFixed(1), min: Math.round(28 * mult), pace: paces.z1, zone: 'Z1-Z2', notes: 'Trote muy cómodo para limpiar lactato del día anterior.' },
      { dayOffset: 3, dayName: 'Jueves', type: 'tempo', title: '2km Z2 + 3km Tempo Umbral + 1km Z1', km: +(6.0 * mult).toFixed(1), min: Math.round(32 * mult), pace: paces.z4, zone: 'Z4 (Umbral)', notes: 'Sostener ritmo fuerte pero constante en el bloque central.' },
      { dayOffset: 4, dayName: 'Viernes', type: 'strength', title: 'Fuerza Reactiva, Core y Pliometría Suave', km: 0, min: 35, pace: '--:--', zone: 'Neuromuscular', notes: 'Sentadilla unilateral, saltos suaves de cuerda y planchas.' },
      { dayOffset: 5, dayName: 'Sábado', type: 'easy', title: 'Rodaje Aeróbico + 4 Rectas Progresivas de 80m', km: +(5.0 * mult).toFixed(1), min: Math.round(27 * mult), pace: paces.z2, zone: 'Z2', notes: 'Activar piernas y mejorar cadencia.' },
      { dayOffset: 6, dayName: 'Domingo', type: 'long', title: 'Tirada Aeróbica Continua Z2', km: +(9.5 * mult).toFixed(1), min: Math.round(52 * mult), pace: paces.z2, zone: 'Z2', notes: 'Construye la base mitocondrial necesaria para recuperar entre series.' }
    ]
  },
  '10k': {
    id: '10k',
    label: '10K',
    name: 'Plan 10K Umbral & Resistencia',
    distanceKm: 10.0,
    durationWeeks: 6,
    badge: 'Equilibrio Ideal',
    color: '#d97706',
    summary: 'El balance perfecto entre resistencia aeróbica y tolerancia al lactato. Ideal para bajar de 60, 50 o 40 minutos en 10 kilómetros.',
    weeklyKmByLevel: { finisher: 28, improver: 38, competitive: 52 },
    buildMicrocycle: (paces, mult) => [
      { dayOffset: 0, dayName: 'Lunes', type: 'rest', title: 'Descanso y Movilidad de Cadera', km: 0, min: 20, pace: '--:--', zone: 'Recuperación', notes: 'Asimilación del fondo dominical.' },
      { dayOffset: 1, dayName: 'Martes', type: 'easy', title: 'Rodaje Aeróbico Base Z2', km: +(7.0 * mult).toFixed(1), min: Math.round(38 * mult), pace: paces.z2, zone: 'Z2', notes: 'Ritmo conversacional fluido.' },
      { dayOffset: 2, dayName: 'Miércoles', type: 'intervals', title: 'Series 5x1000m a Ritmo 10K (rec 90s)', km: +(8.5 * mult).toFixed(1), min: Math.round(44 * mult), pace: paces.z5, zone: 'Z4-Z5', notes: 'Sesión clave de potencia aeróbica específica para 10K.' },
      { dayOffset: 3, dayName: 'Jueves', type: 'strength', title: 'Fuerza de Tren Inferior y Estabilidad', km: 0, min: 40, pace: '--:--', zone: 'Neuromuscular', notes: 'Foco en glúteos, isquios y sóleos.' },
      { dayOffset: 4, dayName: 'Viernes', type: 'tempo', title: 'Cambios de Ritmo / Tempo 2x15 min Z4', km: +(8.0 * mult).toFixed(1), min: Math.round(41 * mult), pace: paces.z4, zone: 'Z3-Z4', notes: 'Enseña al cuerpo a reciclar lactato a alta velocidad.' },
      { dayOffset: 5, dayName: 'Sábado', type: 'easy', title: 'Rodaje Suave Regenerativo', km: +(5.5 * mult).toFixed(1), min: Math.round(31 * mult), pace: paces.z1, zone: 'Z1-Z2', notes: 'Soltar piernas antes del domingo.' },
      { dayOffset: 6, dayName: 'Domingo', type: 'long', title: 'Tirada Larga Aeróbica Progresiva', km: +(12.5 * mult).toFixed(1), min: Math.round(66 * mult), pace: paces.z2, zone: 'Z2', notes: 'Últimos 2 km ligeramente más alegres en Zona 3.' }
    ]
  },
  '15k': {
    id: '15k',
    label: '15K',
    name: 'Plan 15K Fuerza Aeróbica & Cuestas',
    distanceKm: 15.0,
    durationWeeks: 6,
    badge: 'Puente a Fondo',
    color: '#9333ea',
    summary: 'Desarrolla fuerza específica en pendientes y solidez aeróbica para dominar carreras de 15K o preparar el salto hacia la Media Maratón.',
    weeklyKmByLevel: { finisher: 32, improver: 42, competitive: 56 },
    buildMicrocycle: (paces, mult) => [
      { dayOffset: 0, dayName: 'Lunes', type: 'rest', title: 'Descanso Total o Estiramientos', km: 0, min: 15, pace: '--:--', zone: 'Recuperación', notes: 'Recuperación muscular.' },
      { dayOffset: 1, dayName: 'Martes', type: 'easy', title: 'Rodaje Base Z2 Constante', km: +(8.0 * mult).toFixed(1), min: Math.round(43 * mult), pace: paces.z2, zone: 'Z2', notes: 'Mantener cadencia sobre 172 spm.' },
      { dayOffset: 2, dayName: 'Miércoles', type: 'hills', title: 'Cuestas 8x200m Potencia + 3km Z2', km: +(7.5 * mult).toFixed(1), min: Math.round(42 * mult), pace: paces.z4, zone: 'Z4-Z5', notes: 'Subir con braceo firme y rodilla alta; bajar trotando muy suave.' },
      { dayOffset: 3, dayName: 'Jueves', type: 'easy', title: 'Rodaje Suave de Asimilación', km: +(6.5 * mult).toFixed(1), min: Math.round(36 * mult), pace: paces.z1, zone: 'Z1-Z2', notes: 'Esfuerzo muy bajo (RPE 3-4).' },
      { dayOffset: 4, dayName: 'Viernes', type: 'fartlek', title: 'Fartlek Piramidal (1-2-3-4-3-2-1 min en Z4)', km: +(9.0 * mult).toFixed(1), min: Math.round(46 * mult), pace: paces.z3, zone: 'Z2 a Z4', notes: 'Flexibilidad metabólica y cambios de ritmo.' },
      { dayOffset: 5, dayName: 'Sábado', type: 'strength', title: 'Fuerza Preventiva Core & Sóleos', km: 0, min: 40, pace: '--:--', zone: 'Neuromuscular', notes: 'Protección articular para largas distancias.' },
      { dayOffset: 6, dayName: 'Domingo', type: 'long', title: 'Tirada Larga 15K Controlada Z2', km: +(15.0 * mult).toFixed(1), min: Math.round(80 * mult), pace: paces.z2, zone: 'Z2', notes: 'Practicar hidratación en el minuto 40.' }
    ]
  },
  '21k': {
    id: '21k',
    label: '21K Media Maratón',
    name: 'Plan 21.1K Media Maratón Progresivo',
    distanceKm: 21.0975,
    durationWeeks: 8,
    badge: 'Favorito Corredores',
    color: '#059669',
    summary: 'Combina volumen aeróbico en Zona 2, bloques de Umbral de Lactato (Tempo) y tiradas largas con cierre a ritmo de carrera para correr 21K con fuerza de principio a fin.',
    weeklyKmByLevel: { finisher: 36, improver: 48, competitive: 64 },
    buildMicrocycle: (paces, mult) => [
      { dayOffset: 0, dayName: 'Lunes', type: 'rest', title: 'Descanso Activo y Rodillo de Espuma', km: 0, min: 20, pace: '--:--', zone: 'Recuperación', notes: 'Supercompensación post tirada larga.' },
      { dayOffset: 1, dayName: 'Martes', type: 'easy', title: 'Rodaje Base Aeróbica Z2', km: +(8.5 * mult).toFixed(1), min: Math.round(45 * mult), pace: paces.z2, zone: 'Z2', notes: 'Construcción capilar sin fatiga.' },
      { dayOffset: 2, dayName: 'Miércoles', type: 'tempo', title: '2km Z2 + 6km Tempo Umbral + 1.5km Z1', km: +(9.5 * mult).toFixed(1), min: Math.round(47 * mult), pace: paces.z4, zone: 'Z4 (Umbral)', notes: 'Entrenamiento estrella para sostener tu ritmo de Media Maratón.' },
      { dayOffset: 3, dayName: 'Jueves', type: 'strength', title: 'Fuerza Específica Running & Core', km: 0, min: 40, pace: '--:--', zone: 'Neuromuscular', notes: 'Sentadilla búlgara, elevación de talones excéntrica y planchas.' },
      { dayOffset: 4, dayName: 'Viernes', type: 'intervals', title: 'Series 5x1200m VO2max (rec 2 min)', km: +(9.0 * mult).toFixed(1), min: Math.round(45 * mult), pace: paces.z5, zone: 'Z5', notes: 'Mejora la economía de carrera a ritmos altos.' },
      { dayOffset: 5, dayName: 'Sábado', type: 'easy', title: 'Rodaje Suave Regenerativo Pre-Fondo', km: +(6.5 * mult).toFixed(1), min: Math.round(36 * mult), pace: paces.z1, zone: 'Z1-Z2', notes: 'Mantener pulsaciones muy bajas.' },
      { dayOffset: 6, dayName: 'Domingo', type: 'long', title: 'Tirada Larga 18K (Últimos 4km a Ritmo 21K)', km: +(18.0 * mult).toFixed(1), min: Math.round(94 * mult), pace: paces.z2, zone: 'Z2 -> Z3', notes: 'Probar gel energético o carbohidratos en el km 10.' }
    ]
  },
  '42k': {
    id: '42k',
    label: '42K Maratón',
    name: 'Plan 42.2K Maratón Especificidad & Glucógeno',
    distanceKm: 42.195,
    durationWeeks: 12,
    badge: 'Gran Reto Fondo',
    color: '#0284c7',
    summary: 'Enfocado en expandir las reservas de glucógeno muscular, optimizar la oxidación de grasas en Zona 2-3 y fortalecer tendones para vencer el muro del km 32.',
    weeklyKmByLevel: { finisher: 48, improver: 62, competitive: 80 },
    buildMicrocycle: (paces, mult) => [
      { dayOffset: 0, dayName: 'Lunes', type: 'rest', title: 'Descanso Total y Reposición de Glucógeno', km: 0, min: 20, pace: '--:--', zone: 'Recuperación', notes: 'Priorizar sueño e hidratación.' },
      { dayOffset: 1, dayName: 'Martes', type: 'easy', title: 'Rodaje Aeróbico Z2 Extensivo', km: +(10.0 * mult).toFixed(1), min: Math.round(53 * mult), pace: paces.z2, zone: 'Z2', notes: 'Ritmo muy constante y económico.' },
      { dayOffset: 2, dayName: 'Miércoles', type: 'tempo', title: 'Bloque Específico Ritmo Maratón (3km Z2 + 10km Z3)', km: +(13.0 * mult).toFixed(1), min: Math.round(64 * mult), pace: paces.z3, zone: 'Z3 (Ritmo Maratón)', notes: 'Memorizar biomecánica y consumo energético del ritmo objetivo.' },
      { dayOffset: 3, dayName: 'Jueves', type: 'easy', title: 'Rodaje Regenerativo + Fuerza Core', km: +(8.0 * mult).toFixed(1), min: Math.round(45 * mult), pace: paces.z1, zone: 'Z1-Z2', notes: 'Trote muy suave para favorecer circulación.' },
      { dayOffset: 4, dayName: 'Viernes', type: 'fartlek', title: 'Cambios de Ritmo 6x1km en Umbral Z4', km: +(10.0 * mult).toFixed(1), min: Math.round(50 * mult), pace: paces.z4, zone: 'Z4', notes: 'Mantener chispa aeróbica sin sobrecargar piernas.' },
      { dayOffset: 5, dayName: 'Sábado', type: 'easy', title: 'Activación Suave Pre-Tirada Larga', km: +(7.0 * mult).toFixed(1), min: Math.round(38 * mult), pace: paces.z1, zone: 'Z1-Z2', notes: 'Cena rica en carbohidratos después de esta sesión.' },
      { dayOffset: 6, dayName: 'Domingo', type: 'long', title: 'Tirada Larga Específica Maratón 26K', km: +(26.0 * mult).toFixed(1), min: Math.round(138 * mult), pace: paces.z2, zone: 'Z2 -> Z3', notes: 'Entrenar nutrición: 45-60g de carbohidratos por hora y electrolitos.' }
    ]
  }
};

function getRunnerPacesByVDOT(profile) {
  const vdot = getRunnerVDOT(profile);
  return {
    z1: formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.62)),
    z2: formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.70)),
    z3: formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.79)),
    z4: formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.87)),
    z5: formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.96))
  };
}

// ============================================================================
// CÁLCULO Y RENDERIZADO DE LA BARRA DE PROGRESO MOTIVADORA E HITOS
// ============================================================================

function computeMotivationalProgress() {
  const workouts = (appState.workouts || []).filter((w) => w.type !== 'rest');
  const completedWorkouts = workouts.filter(
    (w) => w.status === 'completed' || w.status === 'modified'
  );

  const totalSessions = Math.max(workouts.length, 1);
  const completedSessions = completedWorkouts.length;

  const totalPlannedKm = workouts.reduce((s, w) => s + (Number(w.plannedKm) || 0), 0);
  const totalActualKm = completedWorkouts.reduce((s, w) => s + (Number(w.actualKm) || 0), 0);

  // Porcentaje combinado motivador (sesiones cumplidas y kilómetros logrados)
  const sessionPct = (completedSessions / totalSessions) * 100;
  const kmPct = totalPlannedKm > 0 ? (totalActualKm / totalPlannedKm) * 100 : sessionPct;
  const progressPct = Math.min(100, Math.max(5, Math.round(sessionPct * 0.5 + kmPct * 0.5)));

  const activePlan = appState.activePlan || {
    key: '21k',
    name: appState.goals?.[0]?.name || 'Plan Media Maratón 21.1K',
    levelLabel: 'Mejorar Marca Personal',
    distanceKm: appState.goals?.[0]?.distanceKm || 21.1
  };

  let motivationalQuote = '';
  let levelTitle = '';
  if (progressPct >= 90) {
    levelTitle = '🏆 Nivel Élite: ¡Listo para Brillar en la Meta!';
    motivationalQuote = 'Has construido el trabajo duro kilómetro a kilómetro. Confía en tu entrenamiento.';
  } else if (progressPct >= 70) {
    levelTitle = '🔥 Pico de Forma: Ritmo Específico Consolidado';
    motivationalQuote = 'Ya superaste las tres cuartas partes del bloque. Tu corazón y tus piernas son mucho más eficientes.';
  } else if (progressPct >= 45) {
    levelTitle = '⚡ Mitad del Camino Superada: Constancia Imparable';
    motivationalQuote = 'Cada sesión sumada multiplica tus mitocondrias y acerca tu tiempo objetivo.';
  } else {
    levelTitle = '🌱 Construyendo tu Base Aeróbica Paso a Paso';
    motivationalQuote = 'El secreto del running no es correr un día al límite, sino encadenar semanas con constancia.';
  }

  const milestones = [
    { pct: 25, icon: '🌱', label: '25% Base Aeróbica', unlocked: progressPct >= 25 },
    { pct: 50, icon: '⚡', label: '50% Ecuador del Plan', unlocked: progressPct >= 50 },
    { pct: 75, icon: '🔥', label: '75% Ritmo Específico', unlocked: progressPct >= 75 },
    { pct: 100, icon: '🏆', label: '100% Listo para Meta', unlocked: progressPct >= 98 }
  ];

  return {
    progressPct,
    completedSessions,
    totalSessions,
    totalActualKm: totalActualKm.toFixed(1),
    totalPlannedKm: totalPlannedKm.toFixed(1),
    activePlan,
    levelTitle,
    motivationalQuote,
    milestones
  };
}

function buildProgressBannerHTML(showChangePlanBtn = true) {
  const prog = computeMotivationalProgress();

  return `
    <div class="space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
              Progreso de tu Plan
            </span>
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              ${prog.activePlan.name}
            </span>
          </div>
          <h3 class="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            ${prog.levelTitle}
          </h3>
          <p class="text-xs text-slate-600 dark:text-slate-300">
            "${prog.motivationalQuote}"
          </p>
        </div>

        <div class="flex items-center gap-3 self-start md:self-auto">
          <div class="text-right">
            <div class="text-2xl sm:text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400">
              ${prog.progressPct}%
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">
              ${prog.completedSessions}/${prog.totalSessions} sesiones · <strong>${prog.totalActualKm} km</strong> logrados
            </div>
          </div>
          ${
            showChangePlanBtn
              ? `<button onclick="switchTab('goals'); scrollToElement('distancePlansSection')" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition">
                  <i data-lucide="route" class="w-4 h-4"></i>
                  <span>Elegir Plan (5K-42K)</span>
                </button>`
              : ''
          }
        </div>
      </div>

      <!-- Barra de Progreso Motivadora Animada -->
      <div class="space-y-2">
        <div class="relative w-full h-4 bg-slate-200/90 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 transition-all duration-700 relative"
            style="width: ${prog.progressPct}%"
          ></div>
        </div>

        <!-- Hitos / Medallas Desbloqueables -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          ${prog.milestones
            .map(
              (m) => `
              <div class="px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition ${
                m.unlocked
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm'
                  : 'bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
              }">
                <span class="text-base">${m.icon}</span>
                <div class="truncate">
                  <div class="truncate">${m.label}</div>
                  <div class="text-[10px] font-normal ${m.unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}">
                    ${m.unlocked ? '✓ Desbloqueado' : 'En camino'}
                  </div>
                </div>
              </div>
            `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function renderMotivationalProgressBanners() {
  const dashBanner = document.getElementById('dashboardProgressBanner');
  if (dashBanner) {
    dashBanner.innerHTML = buildProgressBannerHTML(true);
  }
  const goalsBanner = document.getElementById('goalsTabProgressBanner');
  if (goalsBanner) {
    goalsBanner.innerHTML = buildProgressBannerHTML(false);
  }
  if (window.lucide) lucide.createIcons();
}

// ============================================================================
// SELECTOR Y GENERADOR DE PLANES ESPECÍFICOS POR DISTANCIA (5K A 42K)
// ============================================================================

function selectDistancePlan(planKey) {
  selectedDistancePlanKey = planKey;
  renderDistancePlanShowcase();
}

function renderDistancePlanShowcase() {
  const tabsContainer = document.getElementById('distancePlanTabs');
  const detailContainer = document.getElementById('selectedDistancePlanDetail');
  if (!tabsContainer || !detailContainer) return;

  const level = document.getElementById('planLevelSelector')?.value || 'improver';
  const mult = level === 'finisher' ? 0.8 : level === 'competitive' ? 1.22 : 1.0;
  const paces = getRunnerPacesByVDOT(appState.profile);
  const vdot = getRunnerVDOT(appState.profile).toFixed(1);

  // Renderizar pestañas de distancia (5K, 10K, 15K, 21K, 42K)
  tabsContainer.innerHTML = Object.values(DISTANCE_TRAINING_PLANS)
    .map((plan) => {
      const isSelected = plan.id === selectedDistancePlanKey;
      const isCurrentActive = appState.activePlan?.key === plan.id;
      return `
        <button
          onclick="selectDistancePlan('${plan.id}')"
          class="p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1 ${
            isSelected
              ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }"
        >
          <div class="flex items-center justify-between w-full">
            <span class="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">${plan.label}</span>
            ${
              isCurrentActive
                ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">Activo</span>`
                : `<span class="w-2.5 h-2.5 rounded-full" style="background-color:${plan.color}"></span>`
            }
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">
            ${plan.durationWeeks} semanas · ~${plan.weeklyKmByLevel[level]} km/sem
          </div>
        </button>
      `;
    })
    .join('');

  const plan = DISTANCE_TRAINING_PLANS[selectedDistancePlanKey] || DISTANCE_TRAINING_PLANS['21k'];
  const sessions = plan.buildMicrocycle(paces, mult);
  const totalWeekKm = sessions.reduce((s, item) => s + Number(item.km || 0), 0).toFixed(1);

  detailContainer.innerHTML = `
    <div class="rp-subtle-box p-4 sm:p-5 space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style="background-color:${plan.color}">
              ${plan.badge}
            </span>
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Duración recomendada: <strong>${plan.durationWeeks} semanas</strong> · Volumen sem: <strong>${totalWeekKm} km</strong> · Calibrado a tu VDOT (${vdot})
            </span>
          </div>
          <h3 class="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            ${plan.name}
          </h3>
          <p class="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            ${plan.summary}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onclick="activateDistancePlanForRunner('${plan.id}', 1)"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <i data-lucide="calendar-check" class="w-4 h-4"></i>
            <span>Cargar Semana al Calendario</span>
          </button>
          <button
            onclick="activateDistancePlanForRunner('${plan.id}', 4)"
            class="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            title="Genera 4 semanas progresivas en tu calendario"
          >
            <i data-lucide="layers" class="w-4 h-4 text-sky-400"></i>
            <span>Cargar Bloque de 4 Semanas</span>
          </button>
        </div>
      </div>

      <!-- Estructura Semanal de 7 Días del Plan Seleccionado -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 pt-2">
        ${sessions
          .map((s) => {
            const tCat = WORKOUT_TYPES_CATALOG[s.type] || WORKOUT_TYPES_CATALOG.easy;
            return `
              <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-2">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${s.dayName}</span>
                    <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tCat.badgeClass}">${tCat.shortName}</span>
                  </div>
                  <div class="text-xs font-bold text-slate-900 dark:text-white leading-snug">${s.title}</div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">${s.notes}</p>
                </div>
                <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">${s.km > 0 ? s.km + ' km' : 'Recuperación'}</span>
                  <span class="font-mono text-slate-600 dark:text-slate-300">${s.pace !== '--:--' ? s.pace + '/km' : s.min + ' min'}</span>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function activateDistancePlanForRunner(planKey, weeksCount = 1) {
  const plan = DISTANCE_TRAINING_PLANS[planKey];
  if (!plan) return;

  const level = document.getElementById('planLevelSelector')?.value || 'improver';
  const levelNames = {
    finisher: 'Completar con solidez',
    improver: 'Mejorar Marca Personal',
    competitive: 'Rendimiento Competitivo'
  };
  const baseMult = level === 'finisher' ? 0.8 : level === 'competitive' ? 1.22 : 1.0;
  const paces = getRunnerPacesByVDOT(appState.profile);
  const monday = getMondayOfWeek(0);

  let createdCount = 0;

  for (let w = 0; w < weeksCount; w++) {
    // Progresión gradual (+5% por semana y semana 4 de descarga suave)
    const weekProgression = w === 3 ? 0.88 : 1 + w * 0.05;
    const microcycle = plan.buildMicrocycle(paces, baseMult * weekProgression);

    microcycle.forEach((session) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + w * 7 + session.dayOffset);
      const isoDate = formatDateISO(targetDate);

      // Reemplazar solo entrenamientos planeados pendientes en esa fecha (preservando completados)
      appState.workouts = appState.workouts.filter(
        (existing) => !(existing.date === isoDate && existing.status === 'planned')
      );

      // Si ya hay un entrenamiento completado ese día en la semana 1, no duplicar
      const alreadyCompletedThatDay = appState.workouts.some(
        (existing) =>
          existing.date === isoDate &&
          (existing.status === 'completed' || existing.status === 'modified')
      );
      if (alreadyCompletedThatDay && w === 0) return;

      appState.workouts.push({
        id: `w-plan-${plan.id}-${Date.now()}-${w}-${session.dayOffset}`,
        date: isoDate,
        type: session.type,
        status: 'planned',
        title: weeksCount > 1 ? `[Sem ${w + 1}] ${session.title}` : session.title,
        plannedKm: session.km,
        plannedMin: session.min,
        plannedPace: session.pace,
        plannedZone: session.zone,
        actualKm: 0,
        actualMin: 0,
        actualPace: '',
        actualHR: 0,
        actualMaxHR: 0,
        actualCadence: 0,
        actualElevation: 0,
        actualCalories: 0,
        actualRpe: 5,
        watchAnalysis: '',
        notes: session.notes,
        screenshots: []
      });
      createdCount++;
    });
  }

  // Guardar como Plan Activo del corredor
  appState.activePlan = {
    key: plan.id,
    name: `${plan.name} (${levelNames[level]})`,
    level,
    levelLabel: levelNames[level],
    distanceKm: plan.distanceKm,
    activatedAt: getLocalISODate(0)
  };

  // Si el corredor no tiene un objetivo de esta distancia, crearlo o ponerlo al frente
  const vdot = getRunnerVDOT(appState.profile);
  const predictedSec = predictRaceTimeSeconds(vdot + 1.0, plan.distanceKm * 1000);
  const existingGoal = appState.goals.find(
    (g) => Math.abs(Number(g.distanceKm) - plan.distanceKm) < 0.5
  );
  if (!existingGoal) {
    appState.goals.unshift({
      id: `goal-plan-${Date.now()}`,
      name: `Meta ${plan.label} — ${plan.name}`,
      distanceKm: plan.distanceKm,
      date: getLocalISODate(plan.durationWeeks * 7),
      targetTime: formatSecondsToTime(predictedSec, plan.distanceKm >= 20),
      priority: 'A',
      notes: `Plan activo (${levelNames[level]}) cargado en el calendario.`
    });
  }

  saveState();
  refreshAllViews();
  showToast(`¡${plan.name} activado! Se cargaron ${createdCount} sesiones en tu calendario.`);
}

// ============================================================================
// FEATURE 3: PLANIFICADOR DE HIDRATACIÓN & GELES PARA CARRERAS Y FONDOS
// ============================================================================

function openHydrationModal() {
  const modal = document.getElementById('hydrationModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Pre-cargar valores desde el objetivo activo o perfil si están disponibles
  const sortedGoals = [...appState.goals].sort((a, b) => a.date.localeCompare(b.date));
  const primaryGoal = sortedGoals[0];
  if (primaryGoal) {
    const distSelect = document.getElementById('hydDistance');
    if (distSelect) {
      if (primaryGoal.distanceKm >= 40) distSelect.value = '42.195';
      else if (primaryGoal.distanceKm >= 28) distSelect.value = '30';
      else if (primaryGoal.distanceKm >= 20) distSelect.value = '21.0975';
      else if (primaryGoal.distanceKm >= 14) distSelect.value = '15';
      else if (primaryGoal.distanceKm >= 9) distSelect.value = '10';
    }

    const targetSec = parseTimeToSeconds(primaryGoal.targetTime);
    if (targetSec > 0 && primaryGoal.distanceKm > 0) {
      const paceSec = targetSec / primaryGoal.distanceKm;
      const paceStr = formatSecondsToTime(paceSec);
      const paceInput = document.getElementById('hydPace');
      if (paceInput) paceInput.value = paceStr;
    }
  }

  calculateHydrationPlan();
  if (window.lucide) lucide.createIcons();
}

function closeHydrationModal() {
  const modal = document.getElementById('hydrationModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function calculateHydrationPlan() {
  const distSelect = document.getElementById('hydDistance');
  const paceInput = document.getElementById('hydPace');
  const weatherSelect = document.getElementById('hydWeather');
  const gelSelect = document.getElementById('hydGelType');

  if (!distSelect || !paceInput) return;

  const distanceKm = parseFloat(distSelect.value) || 21.0975;
  const paceParts = paceInput.value.split(':');
  let paceMin = 5.25;
  if (paceParts.length === 2) {
    const m = parseInt(paceParts[0], 10) || 5;
    const s = parseInt(paceParts[1], 10) || 0;
    paceMin = m + s / 60;
  }
  if (paceMin <= 2.5 || paceMin >= 15) paceMin = 5.25;

  const totalMinutes = distanceKm * paceMin;
  const totalHours = totalMinutes / 60;
  const weather = weatherSelect ? weatherSelect.value : 'moderate';
  const carbsPerGel = parseInt(gelSelect ? gelSelect.value : '22', 10) || 22;

  // Peso del corredor desde el perfil
  const runnerWeight = parseFloat(appState.profile.weightKg) || 68;
  const weightFactor = Math.min(1.25, Math.max(0.85, runnerWeight / 70));

  // Tasa de sudoración / reposición estimada (ml/hora)
  let baseMlPerHour = 550;
  let sodiumPerHour = 500; // mg
  if (weather === 'cool') {
    baseMlPerHour = 450;
    sodiumPerHour = 380;
  } else if (weather === 'hot') {
    baseMlPerHour = 750;
    sodiumPerHour = 700;
  }
  const adjustedMlPerHour = Math.round(baseMlPerHour * weightFactor);
  const totalWaterMl = Math.round(adjustedMlPerHour * totalHours);

  // Carbohidratos por hora según duración
  let carbsTargetPerHour = 40;
  if (totalMinutes < 45) {
    carbsTargetPerHour = 0;
  } else if (totalMinutes < 75) {
    carbsTargetPerHour = 25;
  } else if (totalMinutes < 120) {
    carbsTargetPerHour = 45;
  } else {
    carbsTargetPerHour = 60;
  }

  const totalCarbsGrams = Math.round(carbsTargetPerHour * totalHours);
  const totalGels = carbsTargetPerHour > 0 ? Math.max(1, Math.round(totalCarbsGrams / carbsPerGel)) : 0;
  const totalSodiumMg = Math.round(sodiumPerHour * totalHours);

  // Formatear tiempo total HH:MM:SS
  const totalSec = Math.round(totalMinutes * 60);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Actualizar DOM
  const timeEl = document.getElementById('hydTotalTime');
  const waterEl = document.getElementById('hydTotalWater');
  const hourlyWaterEl = document.getElementById('hydHourlyWater');
  const gelsEl = document.getElementById('hydTotalGels');
  const hourlyCarbsEl = document.getElementById('hydHourlyCarbs');
  const sodiumEl = document.getElementById('hydTotalSodium');

  if (timeEl) timeEl.textContent = timeFormatted;
  if (waterEl) waterEl.textContent = `${totalWaterMl} ml`;
  if (hourlyWaterEl) hourlyWaterEl.textContent = `~${adjustedMlPerHour} ml/hora`;
  if (gelsEl) gelsEl.textContent = `${totalGels} ${totalGels === 1 ? 'Gel' : 'Geles'}`;
  if (hourlyCarbsEl) hourlyCarbsEl.textContent = carbsTargetPerHour > 0 ? `~${carbsTargetPerHour} g Carbohidratos/h` : 'No requiere geles';
  if (sodiumEl) sodiumEl.textContent = `${totalSodiumMg} mg`;

  // Renderizar Timeline por Kilómetro
  renderHydrationTimeline(distanceKm, paceMin, totalGels, totalWaterMl, adjustedMlPerHour);
}

function renderHydrationTimeline(distanceKm, paceMin, totalGels, totalWaterMl, mlPerHour) {
  const container = document.getElementById('hydTimelineList');
  if (!container) return;

  const steps = [];

  // Paso Pre-carrera
  steps.push({
    kmText: 'Pre-Carrera (-45 min)',
    badge: 'Hidratación previa',
    color: 'sky',
    icon: 'droplet',
    action: 'Beber 300 - 400 ml de agua o bebida isotónica a pequeños sorbos. Evitar exceso para no correr con pesadez.'
  });

  if (totalGels > 0 && distanceKm >= 15) {
    steps.push({
      kmText: 'Pre-Salida (-15 min)',
      badge: 'Carga inicial',
      color: 'amber',
      icon: 'zap',
      action: 'Tomar 1er Gel con 150 ml de agua para asegurar glucógeno circulante desde el primer kilómetro.'
    });
  }

  // Intervalo de geles en km
  let gelKmInterval = distanceKm / (totalGels + 1);
  if (gelKmInterval < 4) gelKmInterval = 4.5;

  let nextGelKm = gelKmInterval;
  let gelsAssigned = 0;

  // Puestos cada 4 o 5 km
  const waterIntervalKm = distanceKm > 15 ? 5 : (distanceKm > 8 ? 3.5 : 5);
  let currentKm = waterIntervalKm;

  while (currentKm < distanceKm - 1) {
    const isGelStep = (gelsAssigned < totalGels) && (currentKm >= nextGelKm || currentKm + 2 >= distanceKm);
    const estMin = Math.round(currentKm * paceMin);
    const hrs = Math.floor(estMin / 60);
    const ms = estMin % 60;
    const timeStr = `${hrs > 0 ? hrs + 'h ' : ''}${ms}m`;

    if (isGelStep) {
      gelsAssigned++;
      nextGelKm += gelKmInterval;
      steps.push({
        kmText: `Km ${currentKm.toFixed(1)} (~${timeStr})`,
        badge: `Gel #${gelsAssigned}`,
        color: 'amber',
        icon: 'zap',
        action: `Tomar Gel #${gelsAssigned} acompañado de 150-200 ml de agua (evitar tomarlo solo para acelerar absorción gástrica).`
      });
    } else {
      steps.push({
        kmText: `Km ${currentKm.toFixed(1)} (~${timeStr})`,
        badge: 'Puesto de Agua',
        color: 'sky',
        icon: 'droplets',
        action: 'Beber 120-150 ml de agua o electrolitos a pequeños sorbos. Mantener boca húmeda y temperatura controlada.'
      });
    }

    currentKm += waterIntervalKm;
  }

  // Paso Meta / Post-Carrera
  steps.push({
    kmText: 'Meta / Llegada (+20 min)',
    badge: 'Recuperación',
    color: 'emerald',
    icon: 'check-circle-2',
    action: '500 ml de líquido con sales minerales + 25-30g de carbohidratos simples y 15g de proteína para regenerar fibras.'
  });

  container.innerHTML = steps.map((s) => `
    <div class="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 text-xs">
      <div class="p-1.5 rounded-lg bg-${s.color}-50 dark:bg-${s.color}-500/10 text-${s.color}-600 dark:text-${s.color}-400 shrink-0 mt-0.5">
        <i data-lucide="${s.icon}" class="w-4 h-4"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-0.5">
          <strong class="text-slate-900 dark:text-white font-semibold">${s.kmText}</strong>
          <span class="text-[10px] font-bold px-2 py-0.2 rounded-full bg-${s.color}-100 dark:bg-${s.color}-500/20 text-${s.color}-800 dark:text-${s.color}-300">${s.badge}</span>
        </div>
        <p class="text-slate-600 dark:text-slate-300">${s.action}</p>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function copyHydrationPlanToClipboard() {
  const distSelect = document.getElementById('hydDistance');
  const timeEl = document.getElementById('hydTotalTime');
  const waterEl = document.getElementById('hydTotalWater');
  const gelsEl = document.getElementById('hydTotalGels');
  const sodiumEl = document.getElementById('hydTotalSodium');

  const text = `⚡ Plan de Hidratación & Geles — RunPulse AI\n` +
    `• Distancia: ${distSelect ? distSelect.options[distSelect.selectedIndex].text : 'Carrera'}\n` +
    `• Tiempo Estimado: ${timeEl ? timeEl.textContent : ''}\n` +
    `• Agua Total: ${waterEl ? waterEl.textContent : ''}\n` +
    `• Geles Previstos: ${gelsEl ? gelsEl.textContent : ''}\n` +
    `• Sodio Recomendado: ${sodiumEl ? sodiumEl.textContent : ''}\n` +
    `Generado con RunPulse AI para ${appState.profile.name || 'Corredor'}.`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('¡Plan de hidratación copiado al portapapeles!');
  }).catch(() => {
    showToast('Plan listo para visualizar.');
  });
}

// ============================================================================
// FEATURE 4: VITRINA DE TROFEOS, RACHAS Y LOGROS (GAMIFICACIÓN)
// ============================================================================

const TROPHIES_CATALOG = [
  {
    id: 'first_run',
    title: 'Primer Paso Triunfal',
    icon: 'footprints',
    badge: 'Iniciación',
    color: 'emerald',
    description: 'Registra tu primer entrenamiento completado en la bitácora.',
    evaluate: (stats) => ({
      unlocked: stats.completedCount >= 1,
      progress: Math.min(100, (stats.completedCount / 1) * 100),
      current: `${stats.completedCount} / 1 sesión`
    })
  },
  {
    id: 'weekly_streak',
    title: 'Guerrero de la Constancia',
    icon: 'flame',
    badge: 'Constancia',
    color: 'amber',
    description: 'Completa al menos 3 entrenamientos en la semana activa.',
    evaluate: (stats) => ({
      unlocked: stats.currentWeekCompleted >= 3,
      progress: Math.min(100, Math.round((stats.currentWeekCompleted / 3) * 100)),
      current: `${stats.currentWeekCompleted} / 3 sesiones`
    })
  },
  {
    id: 'speed_demon',
    title: 'Rompe-Barreras (Sub 5:00)',
    icon: 'zap',
    badge: 'Velocidad',
    color: 'rose',
    description: 'Registra un rodaje o serie a ritmo promedio menor de 5:00 min/km (mínimo 3 km).',
    evaluate: (stats) => ({
      unlocked: stats.hasFastPaceSub5,
      progress: stats.hasFastPaceSub5 ? 100 : Math.min(95, Math.round((5 / (stats.bestPaceDec || 6)) * 100)),
      current: stats.bestPaceDec ? `${decimalMinutesToPaceString(stats.bestPaceDec)} /km` : 'Sin registro'
    })
  },
  {
    id: 'long_run_hero',
    title: 'Rey de la Tirada Larga',
    icon: 'mountain',
    badge: 'Resistencia',
    color: 'sky',
    description: 'Completa un fondo o tirada larga de 16 km o más en una sesión.',
    evaluate: (stats) => ({
      unlocked: stats.maxDistanceKm >= 16,
      progress: Math.min(100, Math.round((stats.maxDistanceKm / 16) * 100)),
      current: `${stats.maxDistanceKm.toFixed(1)} / 16.0 km`
    })
  },
  {
    id: 'rule_8020',
    title: 'Maestro del 80/20',
    icon: 'scale',
    badge: 'Fisiología',
    color: 'indigo',
    description: 'Mantén al menos 75% de tu volumen en sesiones de baja intensidad (Rodaje/Fondo Z1-Z2).',
    evaluate: (stats) => ({
      unlocked: stats.aerobicPct >= 75 && stats.completedCount >= 4,
      progress: Math.min(100, stats.aerobicPct),
      current: `${stats.aerobicPct}% aeróbico suave (mín. 4 sesiones)`
    })
  },
  {
    id: 'century_club',
    title: 'Club de los 100 Km',
    icon: 'medal',
    badge: 'Volumen',
    color: 'purple',
    description: 'Acumula más de 100 km completados en tu bitácora de entrenamientos.',
    evaluate: (stats) => ({
      unlocked: stats.totalKm >= 100,
      progress: Math.min(100, Math.round((stats.totalKm / 100) * 100)),
      current: `${stats.totalKm.toFixed(1)} / 100 km`
    })
  },
  {
    id: 'cadence_elite',
    title: 'Cadencia Olímpica',
    icon: 'activity',
    badge: 'Técnica',
    color: 'emerald',
    description: 'Registra una cadencia media superior o igual a 175 spm.',
    evaluate: (stats) => ({
      unlocked: stats.maxCadence >= 175,
      progress: Math.min(100, Math.round((stats.maxCadence / 175) * 100)),
      current: `${stats.maxCadence > 0 ? stats.maxCadence : '--'} / 175 spm`
    })
  },
  {
    id: 'hills_master',
    title: 'Conquistador de Cuestas',
    icon: 'trending-up',
    badge: 'Fuerza',
    color: 'orange',
    description: 'Completa al menos 2 sesiones de Cuestas o Fartlek de potencia.',
    evaluate: (stats) => ({
      unlocked: stats.hillsCount >= 2,
      progress: Math.min(100, Math.round((stats.hillsCount / 2) * 100)),
      current: `${stats.hillsCount} / 2 sesiones`
    })
  },
  {
    id: 'goal_finisher',
    title: 'Conquistador de Meta',
    icon: 'trophy',
    badge: 'Competición',
    color: 'amber',
    description: 'Completa un entrenamiento tipo Competición / Test o una carrera objetivo.',
    evaluate: (stats) => ({
      unlocked: stats.raceCount >= 1,
      progress: stats.raceCount >= 1 ? 100 : 0,
      current: `${stats.raceCount} / 1 carrera finalizada`
    })
  }
];

function evaluateRunnerTrophies() {
  const completed = appState.workouts.filter(
    (w) => (w.status === 'completed' || w.status === 'modified') && Number(w.actualKm) > 0
  );

  const totalKm = completed.reduce((acc, w) => acc + (Number(w.actualKm) || 0), 0);
  const maxDistanceKm = completed.reduce((max, w) => Math.max(max, Number(w.actualKm) || 0), 0);

  // Semana activa
  const monday = getMondayOfWeek(0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monISO = formatDateISO(monday);
  const sunISO = formatDateISO(sunday);
  const currentWeekCompleted = completed.filter((w) => w.date >= monISO && w.date <= sunISO).length;

  // Ritmos y cadencias
  let hasFastPaceSub5 = false;
  let bestPaceDec = null;
  let maxCadence = 0;
  let hillsCount = 0;
  let raceCount = 0;
  let easyKm = 0;

  completed.forEach((w) => {
    const km = Number(w.actualKm) || 0;
    const min = Number(w.actualMin) || 0;
    if (km >= 3 && min > 0) {
      const paceDec = min / km;
      if (!bestPaceDec || paceDec < bestPaceDec) bestPaceDec = paceDec;
      if (paceDec < 5.0) hasFastPaceSub5 = true;
    }
    if (Number(w.actualCadence) > maxCadence) {
      maxCadence = Number(w.actualCadence);
    }
    if (w.type === 'hills' || w.type === 'fartlek') {
      hillsCount++;
    }
    if (w.type === 'race') {
      raceCount++;
    }
    if (w.type === 'easy' || w.type === 'long') {
      easyKm += km;
    }
  });

  const aerobicPct = totalKm > 0 ? Math.round((easyKm / totalKm) * 100) : 0;

  const stats = {
    completedCount: completed.length,
    totalKm,
    maxDistanceKm,
    currentWeekCompleted,
    hasFastPaceSub5,
    bestPaceDec,
    maxCadence,
    hillsCount,
    raceCount,
    aerobicPct
  };

  const results = TROPHIES_CATALOG.map((t) => {
    const res = t.evaluate(stats);
    return {
      ...t,
      unlocked: res.unlocked,
      progress: res.progress,
      current: res.current
    };
  });

  const unlockedCount = results.filter((r) => r.unlocked).length;

  let runnerLevel = 'Iniciado';
  if (unlockedCount >= 8) runnerLevel = 'Leyenda del Running';
  else if (unlockedCount >= 6) runnerLevel = 'Titán del Asfalto';
  else if (unlockedCount >= 4) runnerLevel = 'Fondista Avanzado';
  else if (unlockedCount >= 2) runnerLevel = 'Corredor Constante';

  return {
    results,
    unlockedCount,
    totalTrophies: TROPHIES_CATALOG.length,
    stats,
    runnerLevel
  };
}

function renderTrophiesShowcase() {
  const data = evaluateRunnerTrophies();

  // Badges y pills en el dashboard
  const unlockedBadge = document.getElementById('unlockedTrophiesBadge');
  if (unlockedBadge) {
    unlockedBadge.textContent = `${data.unlockedCount} de ${data.totalTrophies} Desbloqueados`;
  }
  const unlockedPill = document.getElementById('unlockedTrophiesPill');
  if (unlockedPill) {
    unlockedPill.textContent = `${data.unlockedCount}/${data.totalTrophies}`;
  }

  // Mini vitrina en el Dashboard (primeros 6)
  const dashboardContainer = document.getElementById('dashboardTrophiesShowcase');
  if (dashboardContainer) {
    dashboardContainer.innerHTML = data.results.slice(0, 6).map((t) => {
      const isUnlocked = t.unlocked;
      return `
        <div class="trophy-card ${isUnlocked ? 'unlocked' : 'locked'} p-3 rounded-xl border flex flex-col items-center text-center justify-between min-h-[110px] transition-all">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center ${
            isUnlocked
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }">
            <i data-lucide="${t.icon}" class="w-4 h-4"></i>
          </div>
          <div class="w-full mt-2">
            <h5 class="text-[11px] font-bold ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'} truncate" title="${t.title}">
              ${t.title}
            </h5>
            <span class="text-[10px] ${isUnlocked ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'} block">
              ${isUnlocked ? '¡Desbloqueado!' : `${t.progress}%`}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Actualizar Modal completo si existe
  const countEl = document.getElementById('trophiesUnlockedCount');
  if (countEl) countEl.textContent = `${data.unlockedCount} de ${data.totalTrophies}`;

  const totalKmEl = document.getElementById('trophiesTotalKm');
  if (totalKmEl) totalKmEl.textContent = `${data.stats.totalKm.toFixed(1)} km`;

  const streakEl = document.getElementById('trophiesStreakWeeks');
  if (streakEl) streakEl.textContent = `${data.stats.currentWeekCompleted} esta semana`;

  const levelEl = document.getElementById('trophiesRunnerLevel');
  if (levelEl) levelEl.textContent = data.runnerLevel;

  const fullGrid = document.getElementById('trophiesFullGrid');
  if (fullGrid) {
    fullGrid.innerHTML = data.results.map((t) => {
      const isUnlocked = t.unlocked;
      return `
        <div class="trophy-card ${isUnlocked ? 'unlocked' : 'locked'} p-3.5 rounded-xl border flex items-start gap-3 transition-all">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isUnlocked
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }">
            <i data-lucide="${t.icon}" class="w-5 h-5"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <h5 class="text-xs font-bold ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'} truncate">
                ${t.title}
              </h5>
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                isUnlocked
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }">${t.badge}</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">${t.description}</p>
            <div class="mt-2">
              <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>${t.current}</span>
                <span class="${isUnlocked ? 'font-bold text-amber-600 dark:text-amber-400' : ''}">${isUnlocked ? 'Completado' : `${t.progress}%`}</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="h-1.5 rounded-full ${isUnlocked ? 'bg-amber-500' : 'bg-slate-400'}" style="width: ${t.progress}%;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (window.lucide) lucide.createIcons();
}

function openTrophiesModal() {
  const modal = document.getElementById('trophiesModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  renderTrophiesShowcase();
}

function closeTrophiesModal() {
  const modal = document.getElementById('trophiesModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// ============================================================================
// FEATURE 5: RUTINAS GUIADAS RÁPIDAS CON TEMPORIZADOR Y BEEPS SONOROS
// ============================================================================

const GUIDED_ROUTINES_CATALOG = {
  warmup: {
    id: 'warmup',
    name: 'Activación Pre-Carrera Dinámica',
    durationMinutes: 5,
    exercises: [
      {
        name: 'Balanceos de Pierna Frontal & Posterior',
        durationSec: 45,
        tip: 'Apóyate en un árbol o pared. Movimiento fluido desde la cadera para despertar psoas e isquiotibiales.'
      },
      {
        name: 'Balanceos Laterales de Cadera',
        durationSec: 45,
        tip: 'Cruza la pierna al frente y ábrela al lateral. Activa los abductores y el glúteo medio para estabilizar la pelvis.'
      },
      {
        name: 'Sentadillas Profundas con Elevación de Talones',
        durationSec: 50,
        tip: 'Baja controlado y al subir elévate sobre las puntas de los pies. Bombea sangre hacia los gemelos y sóleos.'
      },
      {
        name: 'Zancadas Dinámicas Cortas hacia Adelante',
        durationSec: 50,
        tip: 'Paso corto y firme con torso erguido. Activa la extensión de cadera y el cuádriceps de forma dinámica.'
      },
      {
        name: 'Skips Bajos con Tobillo Reactivo (A-Skips)',
        durationSec: 45,
        tip: 'Contacto reactivo y breve con el metatarso. Despierta el reflejo miotático y la rigidez elástica del tendón de Aquiles.'
      },
      {
        name: 'Progresiones de Trote en el Sitio',
        durationSec: 35,
        tip: 'Acelera suavemente los últimos 15 segundos para elevar la frecuencia cardíaca antes de comenzar a correr.'
      }
    ]
  },
  soleus: {
    id: 'soleus',
    name: 'Fuerza Reactiva Sóleos & Tendón de Aquiles',
    durationMinutes: 8,
    exercises: [
      {
        name: 'Elevación de Talón con Rodilla Recta (Pierna Derecha)',
        durationSec: 50,
        tip: 'Sobre un escalón: sube en 1 segundo y baja en 3 segundos. Carga el gastrocnemio.'
      },
      {
        name: 'Elevación de Talón con Rodilla Recta (Pierna Izquierda)',
        durationSec: 50,
        tip: 'Mismo ritmo: control excéntrico estricto para fortalecer las fibras profundas.'
      },
      {
        name: 'Elevación de Talón con Rodilla Flexionada a 30° (Derecha)',
        durationSec: 50,
        tip: 'Al doblar la rodilla aíslas el sóleo, el músculo que soporta hasta 6-8 veces tu peso corporal en cada zancada.'
      },
      {
        name: 'Elevación de Talón con Rodilla Flexionada a 30° (Izquierda)',
        durationSec: 50,
        tip: 'Mantén la flexión de rodilla constante durante toda la elevación.'
      },
      {
        name: 'Puente de Glúteo Unipodal con Isometría',
        durationSec: 50,
        tip: '25 segundos por pierna. Clave para evitar el colapso de cadera y la sobrecarga del tendón rotuliano.'
      },
      {
        name: 'Isometría en Pared sobre Puntas de Pie (Wall Sit)',
        durationSec: 45,
        tip: 'Espalda contra pared a 90°, despega talones 3 cm del suelo y sostén firme. Máxima rigidez tendinosa.'
      }
    ]
  },
  cooldown: {
    id: 'cooldown',
    name: 'Vuelta a la Calma & Movilidad Post-Carrera',
    durationMinutes: 6,
    exercises: [
      {
        name: 'Estiramiento Pasivo Suave de Sóleo contra Pared',
        durationSec: 50,
        tip: 'Rodilla trasera flexionada y talón completamente apoyado en el suelo. Siente la tensión suave sin dolor.'
      },
      {
        name: 'Estiramiento de Gemelo Alto y Fascia Plantar',
        durationSec: 50,
        tip: 'Pierna trasera recta, talón al suelo. Respira hondo y relaja la mandíbula.'
      },
      {
        name: 'Bisagra de Cadera y Descarga de Isquios',
        durationSec: 50,
        tip: 'Rodillas microflexionadas, deja caer el torso suavemente para descomprimir la zona lumbar.'
      },
      {
        name: 'Apertura de Psoas en Zancada Baja (Lunge)',
        durationSec: 60,
        tip: '30s por pierna. Apoya la rodilla en el suelo y empuja suavemente la pelvis hacia adelante.'
      },
      {
        name: 'Torsión Torácica en Suelo con Respiración',
        durationSec: 50,
        tip: 'Abre el pecho y relaja la columna tras el impacto del asfalto.'
      },
      {
        name: 'Respiración Diafragmática 4-7-8 de Calma',
        durationSec: 45,
        tip: 'Inhala en 4s, retén 7s y exhala en 8s. Activa el sistema nervioso parasimpático para acelerar la recuperación.'
      }
    ]
  }
};

let routineTimerState = {
  currentRoutineId: 'warmup',
  exerciseIndex: 0,
  remainingSeconds: 45,
  totalExerciseSeconds: 45,
  isRunning: false,
  intervalId: null,
  soundEnabled: true
};

function playTimerBeep(isFinal = false) {
  if (!routineTimerState.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (isFinal) {
      // Doble tono triunfal al terminar ejercicio
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(660, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);
    } else {
      // Beep corto de aviso (3, 2, 1)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    }
  } catch (e) {
    // Audio context may be restricted before interaction
  }
}

function openRoutineTimerModal(routineKey = 'warmup') {
  const modal = document.getElementById('routineTimerModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  selectGuidedRoutine(routineKey);
}

function closeRoutineTimerModal() {
  pauseRoutineTimer();
  const modal = document.getElementById('routineTimerModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function selectGuidedRoutine(routineKey) {
  if (!GUIDED_ROUTINES_CATALOG[routineKey]) routineKey = 'warmup';
  pauseRoutineTimer();

  routineTimerState.currentRoutineId = routineKey;
  routineTimerState.exerciseIndex = 0;
  const routine = GUIDED_ROUTINES_CATALOG[routineKey];
  const firstEx = routine.exercises[0];
  routineTimerState.remainingSeconds = firstEx.durationSec;
  routineTimerState.totalExerciseSeconds = firstEx.durationSec;

  // Actualizar estilos de los botones selectores
  ['warmup', 'soleus', 'cooldown'].forEach((key) => {
    const btn = document.getElementById(`routineBtn-${key}`);
    if (btn) {
      if (key === routineKey) {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm transition';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition';
      }
    }
  });

  updateRoutineTimerUI();
}

function updateRoutineTimerUI() {
  const routine = GUIDED_ROUTINES_CATALOG[routineTimerState.currentRoutineId];
  if (!routine) return;
  const currentEx = routine.exercises[routineTimerState.exerciseIndex];
  if (!currentEx) return;

  const nextEx = routine.exercises[routineTimerState.exerciseIndex + 1];

  // Textos del ejercicio
  const stepLabel = document.getElementById('routineCurrentStepLabel');
  if (stepLabel) stepLabel.textContent = `Paso ${routineTimerState.exerciseIndex + 1} de ${routine.exercises.length} — ${routine.name}`;

  const exName = document.getElementById('routineExerciseName');
  if (exName) exName.textContent = currentEx.name;

  const exTip = document.getElementById('routineExerciseTip');
  if (exTip) exTip.textContent = currentEx.tip;

  const nextExName = document.getElementById('routineNextExerciseName');
  if (nextExName) nextExName.textContent = nextEx ? nextEx.name : '¡Último ejercicio!';

  // Reloj
  const display = document.getElementById('routineTimerDisplay');
  if (display) {
    const m = Math.floor(routineTimerState.remainingSeconds / 60);
    const s = routineTimerState.remainingSeconds % 60;
    display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Barra de progreso del ejercicio
  const exBar = document.getElementById('routineExerciseProgressBar');
  if (exBar) {
    const pct = routineTimerState.totalExerciseSeconds > 0
      ? (routineTimerState.remainingSeconds / routineTimerState.totalExerciseSeconds) * 100
      : 0;
    exBar.style.width = `${pct}%`;
  }

  // Barra de progreso total de la rutina
  const totalBar = document.getElementById('routineTotalProgressBar');
  const totalPctLabel = document.getElementById('routineTotalProgressPct');
  if (totalBar) {
    const completedPct = Math.round((routineTimerState.exerciseIndex / routine.exercises.length) * 100);
    totalBar.style.width = `${completedPct}%`;
    if (totalPctLabel) totalPctLabel.textContent = `${completedPct}%`;
  }

  // Botón Play/Pause
  const playLabel = document.getElementById('routinePlayPauseLabel');
  const playIcon = document.getElementById('routinePlayPauseIcon');
  if (playLabel) {
    playLabel.textContent = routineTimerState.isRunning ? 'Pausar' : 'Iniciar';
  }
  if (playIcon) {
    playIcon.setAttribute('data-lucide', routineTimerState.isRunning ? 'pause' : 'play');
  }

  if (window.lucide) lucide.createIcons();
}

function toggleRoutinePlayPause() {
  if (routineTimerState.isRunning) {
    pauseRoutineTimer();
  } else {
    startRoutineTimer();
  }
}

function startRoutineTimer() {
  if (routineTimerState.isRunning) return;
  routineTimerState.isRunning = true;
  updateRoutineTimerUI();

  routineTimerState.intervalId = setInterval(() => {
    if (routineTimerState.remainingSeconds > 0) {
      routineTimerState.remainingSeconds--;
      if (routineTimerState.remainingSeconds <= 3 && routineTimerState.remainingSeconds > 0) {
        playTimerBeep(false);
      }
      updateRoutineTimerUI();
    } else {
      // Final del ejercicio
      playTimerBeep(true);
      const routine = GUIDED_ROUTINES_CATALOG[routineTimerState.currentRoutineId];
      if (routineTimerState.exerciseIndex < routine.exercises.length - 1) {
        nextRoutineExercise();
      } else {
        // Rutina completada
        pauseRoutineTimer();
        showToast(`¡Excelente trabajo! Rutina "${routine.name}" finalizada.`);
        const totalBar = document.getElementById('routineTotalProgressBar');
        const totalPctLabel = document.getElementById('routineTotalProgressPct');
        if (totalBar) totalBar.style.width = '100%';
        if (totalPctLabel) totalPctLabel.textContent = '100%';
      }
    }
  }, 1000);
}

function pauseRoutineTimer() {
  routineTimerState.isRunning = false;
  if (routineTimerState.intervalId) {
    clearInterval(routineTimerState.intervalId);
    routineTimerState.intervalId = null;
  }
  updateRoutineTimerUI();
}

function resetRoutineTimer() {
  pauseRoutineTimer();
  const routine = GUIDED_ROUTINES_CATALOG[routineTimerState.currentRoutineId];
  if (!routine) return;
  const currentEx = routine.exercises[routineTimerState.exerciseIndex];
  if (currentEx) {
    routineTimerState.remainingSeconds = currentEx.durationSec;
    routineTimerState.totalExerciseSeconds = currentEx.durationSec;
  }
  updateRoutineTimerUI();
}

function nextRoutineExercise() {
  const routine = GUIDED_ROUTINES_CATALOG[routineTimerState.currentRoutineId];
  if (!routine) return;
  if (routineTimerState.exerciseIndex < routine.exercises.length - 1) {
    routineTimerState.exerciseIndex++;
    const nextEx = routine.exercises[routineTimerState.exerciseIndex];
    routineTimerState.remainingSeconds = nextEx.durationSec;
    routineTimerState.totalExerciseSeconds = nextEx.durationSec;
    updateRoutineTimerUI();
  }
}

function prevRoutineExercise() {
  if (routineTimerState.exerciseIndex > 0) {
    routineTimerState.exerciseIndex--;
    const routine = GUIDED_ROUTINES_CATALOG[routineTimerState.currentRoutineId];
    const prevEx = routine.exercises[routineTimerState.exerciseIndex];
    routineTimerState.remainingSeconds = prevEx.durationSec;
    routineTimerState.totalExerciseSeconds = prevEx.durationSec;
    updateRoutineTimerUI();
  }
}

function toggleRoutineSound() {
  routineTimerState.soundEnabled = !routineTimerState.soundEnabled;
  const statusText = document.getElementById('routineSoundStatusText');
  const icon = document.getElementById('routineSoundIcon');
  if (statusText) {
    statusText.textContent = routineTimerState.soundEnabled ? 'Sonido ON' : 'Sonido OFF';
  }
  if (icon) {
    icon.setAttribute('data-lucide', routineTimerState.soundEnabled ? 'volume-2' : 'volume-x');
    icon.className = `w-3.5 h-3.5 ${routineTimerState.soundEnabled ? 'text-emerald-600' : 'text-slate-400'}`;
  }
  if (window.lucide) lucide.createIcons();
}

// ============================================================================
// FEATURE 1: MONITOR DE FORMA FÍSICA VS FATIGA (MODELO BANISTER: CTL, ATL, TSB)
// ============================================================================

function calculateDailyTrainingStress(workout) {
  if (!workout || workout.type === 'rest' || workout.status === 'skipped') return 0;
  const isDone = workout.status === 'completed' || workout.status === 'modified';
  const km = isDone ? (Number(workout.actualKm) || 0) : (Number(workout.plannedKm) || 0);
  let min = isDone ? (Number(workout.actualMin) || 0) : 0;
  if (min <= 0 && km > 0) min = km * 5.25;
  if (min <= 0) return 0;

  const rpe = isDone ? (Number(workout.actualRpe) || 5) : 5;
  const typeWeights = {
    easy: 0.9,
    tempo: 1.35,
    intervals: 1.6,
    long: 1.25,
    fartlek: 1.3,
    hills: 1.45,
    strength: 0.8,
    race: 1.85,
    rest: 0
  };
  const weight = typeWeights[workout.type] || 1.0;
  const stress = (min * (rpe / 10) * weight * 1.4);
  return Math.round(stress * 10) / 10;
}

function calculateBanisterTimeline(windowDays = 28) {
  const totalDays = 42 + windowDays;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mapear días desde hace totalDays días hasta hoy
  const dayLoads = {};
  for (let i = totalDays; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = formatDateISO(d);
    dayLoads[iso] = 0;
  }

  // Acumular carga de entrenamientos
  appState.workouts.forEach((w) => {
    if (dayLoads[w.date] !== undefined) {
      dayLoads[w.date] += calculateDailyTrainingStress(w);
    }
  });

  const dates = Object.keys(dayLoads).sort();
  let ctl = 32.0; // Baseline inicial para que no empiece en cero irreal
  let atl = 32.0;

  const ctlHistory = [];
  const atlHistory = [];
  const tsbHistory = [];
  const labelHistory = [];

  const kCTL = 1 - Math.exp(-1 / 42); // ~0.02353
  const kATL = 1 - Math.exp(-1 / 7);  // ~0.13312

  dates.forEach((dateISO) => {
    const load = dayLoads[dateISO] || 0;
    ctl = ctl + (load - ctl) * kCTL;
    atl = atl + (load - atl) * kATL;
    const tsb = ctl - atl;

    ctlHistory.push(Math.round(ctl * 10) / 10);
    atlHistory.push(Math.round(atl * 10) / 10);
    tsbHistory.push(Math.round(tsb * 10) / 10);

    const d = new Date(dateISO + 'T00:00:00');
    labelHistory.push(formatShortSpanishDate(dateISO));
  });

  // Tomar los últimos windowDays
  const displayLabels = labelHistory.slice(-windowDays);
  const displayCtl = ctlHistory.slice(-windowDays);
  const displayAtl = atlHistory.slice(-windowDays);
  const displayTsb = tsbHistory.slice(-windowDays);

  const currentCtl = displayCtl[displayCtl.length - 1] || 0;
  const currentAtl = displayAtl[displayAtl.length - 1] || 0;
  const currentTsb = displayTsb[displayTsb.length - 1] || 0;

  return {
    labels: displayLabels,
    ctl: displayCtl,
    atl: displayAtl,
    tsb: displayTsb,
    current: {
      ctl: currentCtl,
      atl: currentAtl,
      tsb: currentTsb
    }
  };
}

function renderBanisterMonitor() {
  const data = calculateBanisterTimeline(28);

  // Elementos DOM de métricas
  const ctlEl = document.getElementById('banisterCtlValue');
  const atlEl = document.getElementById('banisterAtlValue');
  const tsbEl = document.getElementById('banisterTsbValue');
  const badgeEl = document.getElementById('banisterFormBadge');
  const tsbSub = document.getElementById('banisterTsbStateSub');
  const diagTitle = document.getElementById('banisterDiagnosisTitle');
  const diagText = document.getElementById('banisterDiagnosisText');

  if (ctlEl) ctlEl.textContent = data.current.ctl.toFixed(1);
  if (atlEl) atlEl.textContent = data.current.atl.toFixed(1);
  if (tsbEl) {
    const sign = data.current.tsb > 0 ? '+' : '';
    tsbEl.textContent = `${sign}${data.current.tsb.toFixed(1)}`;
  }

  // Interpretación fisiológica de TSB
  const tsb = data.current.tsb;
  let stateTitle = '';
  let stateBadge = '';
  let badgeColor = '';
  let advice = '';

  if (tsb > 15) {
    stateBadge = 'Pérdida de Carga (+15)';
    badgeColor = 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300';
    stateTitle = 'Fresco / Transición de Descanso Prolongado';
    if (tsbSub) tsbSub.textContent = 'Fatiga nula, pero el estímulo aeróbico ha caído.';
    advice = 'Tu cuerpo está 100% recuperado, pero la falta de estímulo en los últimos días puede empezar a reducir adaptaciones enzimáticas y capilares. Si no estás en semana de descanso programada, incorpora un rodaje en Z2 o cambios de ritmo suaves.';
  } else if (tsb >= 5 && tsb <= 15) {
    stateBadge = 'Pico Óptimo (+5 a +15)';
    badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300';
    stateTitle = '¡Punto Óptimo de Rendimiento / Tapering Exitoso!';
    if (tsbSub) tsbSub.textContent = 'Ventana dorada para competir o buscar marca.';
    advice = '¡Sensaciones inmejorables! Tu fatiga aguda se ha disipado mientras que tu base aeróbica (CTL) se mantiene sólida. Estás en la ventana ideal para una carrera oficial o un test de marca personal.';
  } else if (tsb >= -10 && tsb < 5) {
    stateBadge = 'Asimilación Neutra (-10 a +5)';
    badgeColor = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    stateTitle = 'Equilibrio de Carga y Mantenimiento';
    if (tsbSub) tsbSub.textContent = 'Fatiga y forma en balance controlado.';
    advice = 'Tu carga de entrenamiento y tu tasa de recuperación se encuentran equilibradas. Puedes afrontar tanto tiradas largas como sesiones de ritmo umbral sin riesgo de acumulación excesiva.';
  } else if (tsb >= -30 && tsb < -10) {
    stateBadge = 'Sobrecarga Productiva (-10 a -30)';
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300';
    stateTitle = 'Bloque de Construcción y Adaptación Activa';
    if (tsbSub) tsbSub.textContent = 'Creando nuevas adaptaciones fisiológicas.';
    advice = 'Tu fatiga aguda supera a la forma crónica. Es la fase donde se forja el motor aeróbico y el VDOT. Es normal sentir pesadez en piernas; respeta escrupulosamente los rodajes suaves en Z2 y la hidratación.';
  } else {
    stateBadge = 'Fatiga Crítica (< -30)';
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300';
    stateTitle = 'Alerta: Carga Excesiva (Riesgo de Sobreentrenamiento)';
    if (tsbSub) tsbSub.textContent = 'Riesgo elevado de sobrecarga tendinosa.';
    advice = 'El estrés acumulado en los últimos 7 días es muy elevado. El sistema nervioso central y los tendones necesitan un respiro urgente. Convierte la próxima sesión en descanso activo o caminata suave.';
  }

  if (badgeEl) {
    badgeEl.textContent = stateBadge;
    badgeEl.className = `text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`;
  }
  if (diagTitle) diagTitle.textContent = stateTitle;
  if (diagText) diagText.textContent = advice;

  // Gráfica Chart.js
  const canvas = document.getElementById('banisterFitnessFatigueChart');
  if (!canvas) return;

  const colors = getChartThemeColors();
  if (banisterChartInstance) {
    banisterChartInstance.destroy();
  }

  banisterChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Forma Crónica (CTL)',
          data: data.ctl,
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.08)',
          borderWidth: 2.2,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
          fill: true
        },
        {
          label: 'Fatiga Aguda (ATL)',
          data: data.atl,
          borderColor: '#f43f5e',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [4, 3],
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5
        },
        {
          label: 'Frescura (TSB = CTL - ATL)',
          data: data.tsb,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          borderWidth: 1.8,
          tension: 0.25,
          pointRadius: 2,
          pointHoverRadius: 5,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: colors.textColor,
            font: { size: 11, weight: '500' },
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} pts`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: colors.mutedColor, font: { size: 10 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: colors.mutedColor, font: { size: 10 } },
          grid: { color: colors.gridColor }
        }
      }
    }
  });

  if (window.lucide) lucide.createIcons();
}

// ============================================================================
// FEATURE 6: ENTRENADOR POR VOZ PARA SERIES & FARTLEKS (WEB SPEECH API LOCAL)
// ============================================================================

const INTERVAL_COACH_PRESETS = {
  vo2max: {
    id: 'vo2max',
    name: '6x400m VO2max',
    workSec: 90,
    restSec: 60,
    reps: 6,
    workTitle: 'Serie de 400m a Ritmo Z5',
    workTip: 'Ritmo objetivo VO2max (3K-5K). Mantén cadencia alta y braceo relajado.',
    restTitle: 'Recuperación Activa (Trote Z1)',
    restTip: 'Trote suave regenerativo para acelerar aclaramiento de lactato.'
  },
  tempo: {
    id: 'tempo',
    name: '4x1000m Umbral de Lactato',
    workSec: 255, // 4m 15s
    restSec: 90,
    reps: 4,
    workTitle: 'Repetición 1000m Ritmo Umbral',
    workTip: 'Ritmo de 10K / Media Maratón. Respiración controlada 2x2.',
    restTitle: 'Recuperación Activa',
    restTip: 'Camina los primeros 30 segundos y trote muy suave el resto.'
  },
  fartlek: {
    id: 'fartlek',
    name: 'Fartlek Piramidal Continuo',
    isCustomTimeline: true,
    steps: [
      { phase: 'work', durationSec: 60, title: 'Cambio 1 de 5: 1 min Vivo', tip: 'Ritmo alegre 5K, despierta los pies.' },
      { phase: 'rest', durationSec: 60, title: 'Recuperación 1 min', tip: 'Trote suave sin pararte.' },
      { phase: 'work', durationSec: 120, title: 'Cambio 2 de 5: 2 min Sostenidos', tip: 'Ritmo 10K firme con buena postura.' },
      { phase: 'rest', durationSec: 60, title: 'Recuperación 1 min', tip: 'Recupera el aliento y baja hombros.' },
      { phase: 'work', durationSec: 180, title: 'Cambio 3 de 5: 3 min Ritmo Umbral', tip: 'El núcleo de la sesión. Foco en la zancada.' },
      { phase: 'rest', durationSec: 120, title: 'Recuperación 2 min', tip: 'Respira hondo para limpiar lactato.' },
      { phase: 'work', durationSec: 120, title: 'Cambio 4 de 5: 2 min Rápido', tip: 'Aumenta cadencia en el último minuto.' },
      { phase: 'rest', durationSec: 60, title: 'Recuperación 1 min', tip: 'Trote continuo.' },
      { phase: 'work', durationSec: 60, title: 'Cambio 5 de 5: 1 min Sprint Final', tip: '¡Vacía el depósito con zancada limpia!' },
      { phase: 'rest', durationSec: 60, title: 'Vuelta a la calma final', tip: 'Caminata y respiración profunda.' }
    ]
  },
  sprint: {
    id: 'sprint',
    name: '8x200m Reactivo Neuromuscular',
    workSec: 40,
    restSec: 60,
    reps: 8,
    workTitle: 'Repetición 200m Sprint Reactivo',
    workTip: 'Cadencia 185+ spm, tobillo rígido y apoyo de metatarso elástico.',
    restTitle: 'Recuperación Pasiva / Caminata',
    restTip: 'Recupera pulsaciones caminando para tener máxima energía en la siguiente.'
  }
};

let audioCoachState = {
  presetKey: 'vo2max',
  stepIndex: 0,
  flatSteps: [],
  remainingSec: 90,
  totalPhaseSec: 90,
  isRunning: false,
  timerInterval: null,
  voiceEnabled: true,
  selectedVoiceIndex: 0,
  warned10s: false
};

function buildAudioCoachFlatSteps(presetKey) {
  const preset = INTERVAL_COACH_PRESETS[presetKey] || INTERVAL_COACH_PRESETS.vo2max;
  if (preset.isCustomTimeline) {
    return preset.steps;
  }
  const steps = [];
  for (let i = 1; i <= preset.reps; i++) {
    steps.push({
      phase: 'work',
      durationSec: preset.workSec,
      title: `Serie ${i} de ${preset.reps}: Trabajo Fuerte`,
      tip: preset.workTip,
      repNum: i,
      totalReps: preset.reps
    });
    steps.push({
      phase: 'rest',
      durationSec: preset.restSec,
      title: `Descanso ${i} de ${preset.reps}: Recuperación`,
      tip: preset.restTip,
      repNum: i,
      totalReps: preset.reps
    });
  }
  return steps;
}

function speakCue(text) {
  if (!audioCoachState.voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const esVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
    if (esVoices.length > 0) {
      const chosen = esVoices[audioCoachState.selectedVoiceIndex] || esVoices[0];
      utterance.voice = chosen;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Graceful fallback
  }
}

function populateAudioCoachVoices() {
  const select = document.getElementById('acVoiceSelector');
  if (!select || !('speechSynthesis' in window)) return;

  const voices = window.speechSynthesis.getVoices();
  const esVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
  if (esVoices.length === 0) {
    select.innerHTML = '<option value="0">Voz estándar del sistema</option>';
    return;
  }

  select.innerHTML = esVoices.map((v, i) => `
    <option value="${i}">${v.name} (${v.lang})</option>
  `).join('');
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = populateAudioCoachVoices;
}

function changeAudioCoachVoice(index) {
  audioCoachState.selectedVoiceIndex = parseInt(index, 10) || 0;
}

function testAudioCueVoice() {
  const runnerName = appState.profile.name || 'Corredor';
  speakCue(`Entrenador por voz activo. ¡A por todas, ${runnerName}!`);
}

function openAudioCoachModal(presetKey = 'vo2max') {
  const modal = document.getElementById('audioCoachModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  populateAudioCoachVoices();
  selectAudioCoachPreset(presetKey);
}

function closeAudioCoachModal() {
  pauseAudioCoachTimer();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const modal = document.getElementById('audioCoachModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function selectAudioCoachPreset(presetKey) {
  if (!INTERVAL_COACH_PRESETS[presetKey]) presetKey = 'vo2max';
  pauseAudioCoachTimer();

  audioCoachState.presetKey = presetKey;
  audioCoachState.flatSteps = buildAudioCoachFlatSteps(presetKey);
  audioCoachState.stepIndex = 0;
  audioCoachState.remainingSec = audioCoachState.flatSteps[0].durationSec;
  audioCoachState.totalPhaseSec = audioCoachState.flatSteps[0].durationSec;
  audioCoachState.warned10s = false;

  // Actualizar estilos de los botones del selector
  ['vo2max', 'tempo', 'fartlek', 'sprint'].forEach((key) => {
    const btn = document.getElementById(`acPresetBtn-${key}`);
    if (btn) {
      if (key === presetKey) {
        btn.className = 'p-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-sm transition text-left';
      } else {
        btn.className = 'p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-left';
      }
    }
  });

  updateAudioCoachUI();
}

function updateAudioCoachUI() {
  const step = audioCoachState.flatSteps[audioCoachState.stepIndex];
  if (!step) return;

  const nextStep = audioCoachState.flatSteps[audioCoachState.stepIndex + 1];
  const isWork = step.phase === 'work';

  // Badge y contenedor
  const card = document.getElementById('audioCoachCard');
  const badge = document.getElementById('acPhaseBadge');
  const timer = document.getElementById('acTimerDisplay');
  const bar = document.getElementById('acIntervalProgressBar');

  if (badge) {
    badge.textContent = isWork ? 'Fase de Trabajo Fuerte' : 'Fase de Recuperación';
    badge.className = isWork
      ? 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
      : 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
  }

  if (card) {
    card.className = isWork
      ? 'p-5 sm:p-6 rounded-2xl border transition-all text-center space-y-4 coach-phase-work'
      : 'p-5 sm:p-6 rounded-2xl border transition-all text-center space-y-4 coach-phase-rest';
  }

  if (timer) {
    const m = Math.floor(audioCoachState.remainingSec / 60);
    const s = audioCoachState.remainingSec % 60;
    timer.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    timer.className = isWork
      ? 'font-mono font-black text-5xl sm:text-6xl text-rose-600 dark:text-rose-400 tracking-tight'
      : 'font-mono font-black text-5xl sm:text-6xl text-emerald-600 dark:text-emerald-400 tracking-tight';
  }

  if (bar) {
    const pct = audioCoachState.totalPhaseSec > 0
      ? (audioCoachState.remainingSec / audioCoachState.totalPhaseSec) * 100
      : 0;
    bar.style.width = `${pct}%`;
    bar.className = isWork
      ? 'bg-rose-500 h-2 rounded-full transition-all duration-300'
      : 'bg-emerald-500 h-2 rounded-full transition-all duration-300';
  }

  // Título y tip
  const titleEl = document.getElementById('acIntervalTitle');
  const tipEl = document.getElementById('acIntervalTip');
  const nextLabel = document.getElementById('acNextPhaseLabel');

  if (titleEl) titleEl.textContent = step.title;
  if (tipEl) tipEl.textContent = step.tip;
  if (nextLabel) {
    nextLabel.textContent = nextStep ? `${nextStep.title} (${nextStep.durationSec}s)` : '¡Último intervalo de la sesión!';
  }

  // Barra de progreso global
  const totalBar = document.getElementById('acTotalProgressBar');
  const totalPct = document.getElementById('acTotalProgressPct');
  if (totalBar) {
    const pct = Math.round((audioCoachState.stepIndex / audioCoachState.flatSteps.length) * 100);
    totalBar.style.width = `${pct}%`;
    if (totalPct) totalPct.textContent = `${pct}%`;
  }

  // Play/Pause button
  const playLabel = document.getElementById('acPlayPauseLabel');
  const playIcon = document.getElementById('acPlayPauseIcon');
  if (playLabel) {
    playLabel.textContent = audioCoachState.isRunning ? 'Pausar Series' : 'Iniciar Series';
  }
  if (playIcon) {
    playIcon.setAttribute('data-lucide', audioCoachState.isRunning ? 'pause' : 'play');
  }

  if (window.lucide) lucide.createIcons();
}

function toggleAudioCoachPlayPause() {
  if (audioCoachState.isRunning) {
    pauseAudioCoachTimer();
  } else {
    startAudioCoachTimer();
  }
}

function startAudioCoachTimer() {
  if (audioCoachState.isRunning) return;
  audioCoachState.isRunning = true;
  updateAudioCoachUI();

  // Locución inicial si comienza desde cero
  const currentStep = audioCoachState.flatSteps[audioCoachState.stepIndex];
  if (audioCoachState.remainingSec === audioCoachState.totalPhaseSec && currentStep) {
    if (currentStep.phase === 'work') {
      speakCue(`¡Iniciando ${currentStep.title}! Mantén el ritmo objetivo.`);
    } else {
      speakCue(`Tiempo de recuperación activa.`);
    }
  }

  audioCoachState.timerInterval = setInterval(() => {
    if (audioCoachState.remainingSec > 0) {
      audioCoachState.remainingSec--;

      // Aviso 10 segundos antes de terminar
      if (audioCoachState.remainingSec === 10 && !audioCoachState.warned10s) {
        audioCoachState.warned10s = true;
        if (currentStep && currentStep.phase === 'work') {
          speakCue('Últimos 10 segundos, ¡mantén la fuerza!');
        } else {
          speakCue('10 segundos para la siguiente repetición.');
        }
      }

      // Beeps acústicos en los últimos 3 segundos
      if (audioCoachState.remainingSec <= 3 && audioCoachState.remainingSec > 0) {
        playTimerBeep(false);
      }

      updateAudioCoachUI();
    } else {
      // Fin del intervalo actual
      playTimerBeep(true);
      if (audioCoachState.stepIndex < audioCoachState.flatSteps.length - 1) {
        nextAudioCoachInterval(true);
      } else {
        // Sesión finalizada completamente
        pauseAudioCoachTimer();
        const runnerName = appState.profile.name || 'Corredor';
        speakCue(`¡Excelente trabajo, ${runnerName}! Entrenamiento de series completado con éxito. Pasa a la vuelta a la calma.`);
        showToast('¡Entrenamiento de series finalizado! Gran esfuerzo.');
        const totalBar = document.getElementById('acTotalProgressBar');
        const totalPct = document.getElementById('acTotalProgressPct');
        if (totalBar) totalBar.style.width = '100%';
        if (totalPct) totalPct.textContent = '100%';
      }
    }
  }, 1000);
}

function pauseAudioCoachTimer() {
  audioCoachState.isRunning = false;
  if (audioCoachState.timerInterval) {
    clearInterval(audioCoachState.timerInterval);
    audioCoachState.timerInterval = null;
  }
  updateAudioCoachUI();
}

function resetAudioCoach() {
  pauseAudioCoachTimer();
  audioCoachState.stepIndex = 0;
  const first = audioCoachState.flatSteps[0];
  if (first) {
    audioCoachState.remainingSec = first.durationSec;
    audioCoachState.totalPhaseSec = first.durationSec;
  }
  audioCoachState.warned10s = false;
  updateAudioCoachUI();
}

function nextAudioCoachInterval(autoStarted = false) {
  if (audioCoachState.stepIndex < audioCoachState.flatSteps.length - 1) {
    audioCoachState.stepIndex++;
    const step = audioCoachState.flatSteps[audioCoachState.stepIndex];
    audioCoachState.remainingSec = step.durationSec;
    audioCoachState.totalPhaseSec = step.durationSec;
    audioCoachState.warned10s = false;
    updateAudioCoachUI();

    if (autoStarted || audioCoachState.isRunning) {
      if (step.phase === 'work') {
        speakCue(`¡Iniciando ${step.title}! ${step.tip}`);
      } else {
        speakCue(`Tiempo. Recuperación de ${step.durationSec} segundos. Trote suave.`);
      }
    }
  }
}

function prevAudioCoachInterval() {
  if (audioCoachState.stepIndex > 0) {
    audioCoachState.stepIndex--;
    const step = audioCoachState.flatSteps[audioCoachState.stepIndex];
    audioCoachState.remainingSec = step.durationSec;
    audioCoachState.totalPhaseSec = step.durationSec;
    audioCoachState.warned10s = false;
    updateAudioCoachUI();
  }
}

function toggleAudioCoachSound() {
  audioCoachState.voiceEnabled = !audioCoachState.voiceEnabled;
  const label = document.getElementById('acVoiceLabel');
  const icon = document.getElementById('acVoiceIcon');
  if (label) {
    label.textContent = audioCoachState.voiceEnabled ? 'Voz ON' : 'Voz OFF';
  }
  if (icon) {
    icon.setAttribute('data-lucide', audioCoachState.voiceEnabled ? 'volume-2' : 'volume-x');
    icon.className = `w-3.5 h-3.5 ${audioCoachState.voiceEnabled ? 'text-indigo-600' : 'text-slate-400'}`;
  }
  if (window.lucide) lucide.createIcons();
}

// ============================================================================
// FEATURE 2: PULSERA DE RITMO & ESTRATEGIA DE SPLITS PARA CARRERA (PACE BAND)
// ============================================================================

function openPaceBandModal() {
  const modal = document.getElementById('paceBandModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Pre-cargar valores desde el objetivo activo
  const sortedGoals = [...appState.goals].sort((a, b) => a.date.localeCompare(b.date));
  const primaryGoal = sortedGoals[0];
  if (primaryGoal) {
    const distSelect = document.getElementById('pbDistanceSelect');
    if (distSelect) {
      if (primaryGoal.distanceKm >= 40) distSelect.value = '42.195';
      else if (primaryGoal.distanceKm >= 28) distSelect.value = '30';
      else if (primaryGoal.distanceKm >= 20) distSelect.value = '21.0975';
      else if (primaryGoal.distanceKm >= 14) distSelect.value = '15';
      else if (primaryGoal.distanceKm >= 9) distSelect.value = '10';
      else distSelect.value = '5';
    }
    const timeInput = document.getElementById('pbTargetTimeInput');
    if (timeInput && primaryGoal.targetTime) {
      timeInput.value = primaryGoal.targetTime;
    }
  }

  generatePaceBand();
  if (window.lucide) lucide.createIcons();
}

function closePaceBandModal() {
  const modal = document.getElementById('paceBandModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function generatePaceBand() {
  const distSelect = document.getElementById('pbDistanceSelect');
  const timeInput = document.getElementById('pbTargetTimeInput');
  const stratSelect = document.getElementById('pbStrategySelect');
  const intSelect = document.getElementById('pbIntervalSelect');

  if (!distSelect || !timeInput) return;

  const totalKm = parseFloat(distSelect.value) || 21.0975;
  const targetSec = parseTimeToSeconds(timeInput.value) || (totalKm * 315);
  const strategy = stratSelect ? stratSelect.value : 'negative';
  const intervalKm = parseInt(intSelect ? intSelect.value : '1', 10) || 1;

  const avgPaceSec = targetSec / totalKm;

  // Factores según estrategia
  let firstHalfMult = 1.0;
  let secondHalfMult = 1.0;
  if (strategy === 'negative') {
    firstHalfMult = 1.015; // 1.5% más lento en primera mitad
    secondHalfMult = 0.985; // 1.5% más rápido en segunda mitad
  } else if (strategy === 'progressive') {
    firstHalfMult = 1.03;  // 3% más lento al inicio
    secondHalfMult = 0.97;
  }

  const p1Pace = avgPaceSec * firstHalfMult;
  const p2Pace = avgPaceSec * secondHalfMult;

  // Actualizar KPIs de resumen
  const avgPaceEl = document.getElementById('pbAvgPace');
  const p1El = document.getElementById('pbFirstHalfPace');
  const p2El = document.getElementById('pbSecondHalfPace');
  const advEl = document.getElementById('pbStrategyAdvice');

  if (avgPaceEl) avgPaceEl.textContent = `${formatSecondsToTime(avgPaceSec)} min/km`;
  if (p1El) p1El.textContent = `${formatSecondsToTime(p1Pace)} min/km`;
  if (p2El) p2El.textContent = `${formatSecondsToTime(p2Pace)} min/km`;
  if (advEl) {
    advEl.textContent = strategy === 'negative' ? 'Split Negativo (-1.5%)' : (strategy === 'progressive' ? 'Progresivo Fuerte (-3%)' : 'Ritmo Parejo Uniforme');
  }

  // Generar filas de la Pulsera (Pace Band)
  const container = document.getElementById('pbWristbandContainer');
  if (!container) return;

  const milestones = [];
  let cumSec = 0;
  const midPoint = totalKm / 2;

  // Calcular segundo a segundo o km a km
  for (let k = 1; k <= Math.floor(totalKm); k++) {
    const isFirstHalf = k <= midPoint;
    const kmPaceSec = strategy === 'even'
      ? avgPaceSec
      : (isFirstHalf ? p1Pace : p2Pace);
    cumSec += kmPaceSec;

    if (k % intervalKm === 0 || k === Math.floor(totalKm)) {
      milestones.push({
        km: k,
        kmLabel: `Km ${k}`,
        paceThisKm: formatSecondsToTime(kmPaceSec),
        cumTime: formatSecondsToTime(cumSec, totalKm >= 15),
        isMid: Math.abs(k - midPoint) < 1,
        isGel: k === 10 || k === 20 || k === 30,
        isWater: k === 5 || k === 15 || k === 25 || k === 35
      });
    }
  }

  // Si la distancia tiene fracción (ej. 21.0975 o 42.195), agregar el hito de meta final
  const remainder = totalKm - Math.floor(totalKm);
  if (remainder > 0.05) {
    const finalSec = targetSec;
    milestones.push({
      km: totalKm,
      kmLabel: `Meta (${totalKm.toFixed(1)}k)`,
      paceThisKm: formatSecondsToTime(p2Pace),
      cumTime: formatSecondsToTime(finalSec, totalKm >= 15),
      isFinish: true
    });
  }

  container.innerHTML = `
    <div class="grid grid-cols-12 px-3 py-2 bg-slate-100/80 dark:bg-slate-800/80 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 sticky top-0">
      <div class="col-span-3">Hito / Km</div>
      <div class="col-span-3 text-center">Ritmo Tramo</div>
      <div class="col-span-3 text-center">Tiempo Acumulado</div>
      <div class="col-span-3 text-right">Estrategia / Fuel</div>
    </div>
    ${milestones.map((m) => `
      <div class="grid grid-cols-12 px-3 py-2.5 items-center text-xs wristband-row ${m.isFinish ? 'bg-emerald-50/60 dark:bg-emerald-950/20 font-bold' : ''}">
        <div class="col-span-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
          ${m.isFinish ? '<i data-lucide="flag" class="w-3.5 h-3.5 text-emerald-600"></i>' : ''}
          <span>${m.kmLabel}</span>
        </div>
        <div class="col-span-3 text-center font-mono text-slate-600 dark:text-slate-300">
          ${m.paceThisKm} /km
        </div>
        <div class="col-span-3 text-center font-mono font-bold ${m.isFinish ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}">
          ${m.cumTime}
        </div>
        <div class="col-span-3 text-right text-[11px]">
          ${m.isFinish
            ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">¡Llegada!</span>'
            : (m.isGel
                ? '<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"><i data-lucide="zap" class="w-3 h-3"></i> Gel + Agua</span>'
                : (m.isWater
                    ? '<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300"><i data-lucide="droplet" class="w-3 h-3"></i> Agua</span>'
                    : '<span class="text-slate-400">Paso firme</span>'
                  )
              )
          }
        </div>
      </div>
    `).join('')}
  `;

  if (window.lucide) lucide.createIcons();
}

function copyPaceBandToClipboard() {
  const distSelect = document.getElementById('pbDistanceSelect');
  const timeInput = document.getElementById('pbTargetTimeInput');
  const p1El = document.getElementById('pbFirstHalfPace');
  const p2El = document.getElementById('pbSecondHalfPace');

  const text = `🎯 Pulsera de Ritmo (Pace Band) — RunPulse AI\n` +
    `• Distancia: ${distSelect ? distSelect.options[distSelect.selectedIndex].text : 'Carrera'}\n` +
    `• Tiempo Objetivo: ${timeInput ? timeInput.value : ''}\n` +
    `• Paso 1ª Mitad: ${p1El ? p1El.textContent : ''}\n` +
    `• Paso 2ª Mitad: ${p2El ? p2El.textContent : ''}\n` +
    `Estrategia calculada para ${appState.profile.name || 'Corredor'}.`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('¡Tiempos de pulsera copiados al portapapeles!');
  }).catch(() => {
    showToast('Pulsera lista para visualizar.');
  });
}

// ============================================================================
// FEATURE 4: MAPA CORPORAL & PREVENCIÓN DE LESIONES (PREHAB)
// ============================================================================

const INJURY_ANATOMICAL_ZONES = {
  aquiles: {
    id: 'aquiles',
    name: 'Tendón de Aquiles',
    icon: 'activity',
    badge: 'Tendón',
    protocolTitle: 'Protocolo de Descarga Excéntrica de Alfredson',
    protocolText: 'Baja talones de forma excéntrica y controlada sobre un escalón (rodilla recta y rodilla a 30°). 3 series de 15 repeticiones sin rebotar. Evita cuestas pronunciadas y series de velocidad pura hasta que la rigidez matutina desaparezca.'
  },
  soleus: {
    id: 'soleus',
    name: 'Sóleo / Gemelo Profundo',
    icon: 'target',
    badge: 'Músculo',
    protocolTitle: 'Liberación Miofascial & Sóleo Aislado',
    protocolText: 'Automasaje con pelota dura o rodillo en la parte baja del gemelo interno. Realiza elevaciones de talón con flexión de 30° y estiramientos pasivos contra pared manteniendo el talón clavado al suelo.'
  },
  knee: {
    id: 'knee',
    name: 'Rodilla / Tendón Rotuliano',
    icon: 'shield',
    badge: 'Articulación',
    protocolTitle: 'Isometría de Cuádriceps & Cadena Posterior',
    protocolText: 'Sentadillas isométricas en pared (Wall Sit) a 60-90° sosteniendo 45 segundos. Fortalece glúteo medio para evitar el colapso en valgo y reduce el drop excesivo de la zancada aumentando la cadencia a 175+ spm.'
  },
  itband: {
    id: 'itband',
    name: 'Cintilla Iliotibial (Banda)',
    icon: 'zap',
    badge: 'Fascia Lateral',
    protocolTitle: 'Liberación del Tensor de Fascia Lata & Glúteo Medio',
    protocolText: 'No masajees directamente la inserción en la rodilla. Masajea el glúteo y la cadera con foam roller. Realiza almejas (clamshells) con banda elástica y monster walks para estabilizar la pelvis.'
  },
  plantar: {
    id: 'plantar',
    name: 'Fascia Plantar / Talón',
    icon: 'footprints',
    badge: 'Arco Plantar',
    protocolTitle: 'Crioterapia Rodada & Extensión del Hallux',
    protocolText: 'Rueda una botella de agua congelada bajo el arco del pie durante 10 minutos. Estira la fascia traccionando los dedos hacia la tibia. No andes descalzo sobre superficies duras mientras haya inflamación aguda.'
  },
  shin: {
    id: 'shin',
    name: 'Periostio Tibial (Espinilla)',
    icon: 'alert-triangle',
    badge: 'Periostitis',
    protocolTitle: 'Amortiguación & Tibial Anterior',
    protocolText: 'Sustituye inmediatamente el asfalto por césped o pista de tierra. Marcha de talones con puntas levantadas (3x30s). Aplica hielo local 15 min tras entrenar y revisa el kilometraje de tus zapatillas.'
  },
  hamstring: {
    id: 'hamstring',
    name: 'Isquiotibiales / Glúteo',
    icon: 'heart-pulse',
    badge: 'Cadena Posterior',
    protocolTitle: 'Fuerza Excéntrica Unilateral & Bisagra',
    protocolText: 'Peso muerto rumano unilateral controlado (RDL). Evita estiramientos balísticos violentos. Asegura un apoyo de pie debajo de tu centro de gravedad (evita el "overstriding" o talonamiento excesivo).'
  },
  hip: {
    id: 'hip',
    name: 'Cadera / Psoas Ilíaco',
    icon: 'compass',
    badge: 'Flexores',
    protocolTitle: 'Apertura de Cadera & Zancada Baja',
    protocolText: 'Estiramiento del psoas en lunge bajo contrayendo el glúteo para inducir inhibición recíproca. Ejercicios de puente de glúteo y planchas abdominales para corregir la anteversión pélvica excesiva.'
  }
};

let activeSelectedInjuryZone = 'aquiles';

function openInjuryTrackerModal() {
  const modal = document.getElementById('injuryTrackerModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  renderInjuryTracker();
}

function closeInjuryTrackerModal() {
  const modal = document.getElementById('injuryTrackerModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function selectInjuryZone(zoneKey) {
  if (!INJURY_ANATOMICAL_ZONES[zoneKey]) zoneKey = 'aquiles';
  activeSelectedInjuryZone = zoneKey;
  renderInjuryZoneChips();
  renderInjuryProtocolCard();
}

function updateInjuryLevelDisplay(val) {
  const display = document.getElementById('injuryLevelDisplay');
  if (!display) return;
  const num = parseInt(val, 10) || 1;
  let label = 'Leve';
  let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300';
  if (num >= 7) {
    label = 'Dolor Agudo';
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300';
  } else if (num >= 4) {
    label = 'Molestia Moderada';
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300';
  }
  display.textContent = `${num} / 10 (${label})`;
  display.className = `font-bold text-sm font-mono px-2 py-0.5 rounded-lg ${badgeColor}`;
}

function renderInjuryZoneChips() {
  const container = document.getElementById('injuryZoneChipsContainer');
  if (!container) return;

  container.innerHTML = Object.keys(INJURY_ANATOMICAL_ZONES).map((key) => {
    const z = INJURY_ANATOMICAL_ZONES[key];
    const isSelected = key === activeSelectedInjuryZone;
    return `
      <button type="button" onclick="selectInjuryZone('${key}')" class="anatomical-chip p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
        isSelected
          ? 'active shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
      }">
        <span class="text-xs font-bold truncate block">${z.name}</span>
        <span class="text-[10px] opacity-70 mt-1 block">${z.badge}</span>
      </button>
    `;
  }).join('');
}

function renderInjuryProtocolCard() {
  const card = document.getElementById('injuryPrehabProtocolCard');
  if (!card) return;
  const z = INJURY_ANATOMICAL_ZONES[activeSelectedInjuryZone] || INJURY_ANATOMICAL_ZONES.aquiles;
  card.innerHTML = `
    <div class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
      <i data-lucide="shield-check" class="w-4 h-4 text-amber-600 dark:text-amber-400"></i>
      <span>${z.protocolTitle}</span>
    </div>
    <p class="text-slate-600 dark:text-slate-300 leading-relaxed">${z.protocolText}</p>
  `;
  if (window.lucide) lucide.createIcons();
}

function saveInjuryLogEntry() {
  const range = document.getElementById('injuryLevelRange');
  const notesInput = document.getElementById('injuryNotesInput');
  const level = parseInt(range ? range.value : '2', 10) || 2;
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!Array.isArray(appState.injuryLogs)) {
    appState.injuryLogs = [];
  }

  const zone = INJURY_ANATOMICAL_ZONES[activeSelectedInjuryZone] || INJURY_ANATOMICAL_ZONES.aquiles;

  appState.injuryLogs.unshift({
    id: `inj-${Date.now()}`,
    date: getLocalISODate(0),
    zoneKey: activeSelectedInjuryZone,
    zoneName: zone.name,
    level,
    notes: notes || 'Sin notas adicionales'
  });

  if (notesInput) notesInput.value = '';
  saveState();
  renderInjuryTracker();
  updateInjuryDashboardBadge();
  showToast(`Molestia en ${zone.name} registrada`);
}

function deleteInjuryLog(id) {
  if (!Array.isArray(appState.injuryLogs)) return;
  appState.injuryLogs = appState.injuryLogs.filter((item) => item.id !== id);
  saveState();
  renderInjuryTracker();
  updateInjuryDashboardBadge();
  showToast('Registro eliminado');
}

function clearAllInjuryLogs() {
  if (confirm('¿Limpiar todo el historial de molestias musculares?')) {
    appState.injuryLogs = [];
    saveState();
    renderInjuryTracker();
    updateInjuryDashboardBadge();
    showToast('Historial de molestias limpiado');
  }
}

function renderInjuryTracker() {
  renderInjuryZoneChips();
  renderInjuryProtocolCard();

  const list = document.getElementById('injuryLogsList');
  if (!list) return;

  const logs = Array.isArray(appState.injuryLogs) ? appState.injuryLogs : [];
  if (logs.length === 0) {
    list.innerHTML = `<p class="text-xs text-slate-400 italic p-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">No tienes molestias activas registradas. ¡Excelente estado osteomuscular!</p>`;
    return;
  }

  list.innerHTML = logs.map((log) => `
    <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-xs">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <strong class="text-slate-900 dark:text-white">${log.zoneName}</strong>
          <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            log.level >= 7
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
              : (log.level >= 4 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300')
          }">${log.level}/10</span>
          <span class="text-[10px] text-slate-400">${formatShortSpanishDate(log.date)}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 truncate mt-0.5">${log.notes}</p>
      </div>
      <button type="button" onclick="deleteInjuryLog('${log.id}')" title="Marcar como resuelto" class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition">
        <i data-lucide="check" class="w-4 h-4"></i>
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function updateInjuryDashboardBadge() {
  const badge = document.getElementById('injuryTrackerAlertBadge');
  if (!badge) return;
  const logs = Array.isArray(appState.injuryLogs) ? appState.injuryLogs : [];
  const highLogs = logs.filter((l) => l.level >= 4);
  if (highLogs.length > 0) {
    badge.textContent = `${highLogs.length} Alerta${highLogs.length > 1 ? 's' : ''}`;
    badge.className = 'text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300';
  } else if (logs.length > 0) {
    badge.textContent = `${logs.length} Leve`;
    badge.className = 'text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300';
  } else {
    badge.textContent = '0 Alertas';
    badge.className = 'text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300';
  }
}

// ============================================================================
// FEATURE 6: CALCULADORA DE TEST VAM (VELOCIDAD AERÓBICA MÁXIMA)
// ============================================================================

function openVamModal() {
  const modal = document.getElementById('vamModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  calculateVam();
}

function closeVamModal() {
  const modal = document.getElementById('vamModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function calculateVam() {
  const protoSelect = document.getElementById('vamProtocolSelect');
  const distInput = document.getElementById('vamDistanceMeters');

  const meters = parseFloat(distInput ? distInput.value : '1550') || 1550;
  const proto = protoSelect ? protoSelect.value : '6min';

  let vamKmH = 15.5;
  if (proto === '6min') {
    // Test de 6 min (Léger-Boucher): metros / 100 = VAM km/h
    vamKmH = meters / 100;
  } else {
    // Test de Cooper (12 min): VO2max = (meters - 504.9) / 44.73 => VAM = VO2max / 3.5
    const vo2max = Math.max(20, (meters - 504.9) / 44.73);
    vamKmH = vo2max / 3.5;
  }

  vamKmH = Math.min(26, Math.max(8, vamKmH));
  const vamMs = vamKmH / 3.6;
  const vo2maxEst = Math.round(vamKmH * 3.5 * 10) / 10;
  const pace100Sec = 3600 / vamKmH;

  const resKmH = document.getElementById('vamResultKmH');
  const resMs = document.getElementById('vamResultMs');
  const p100 = document.getElementById('vamPace100');
  const vo2El = document.getElementById('vamVo2max');

  if (resKmH) resKmH.textContent = `${vamKmH.toFixed(1)} km/h`;
  if (resMs) resMs.textContent = `${vamMs.toFixed(2)} m/s`;
  if (p100) p100.textContent = formatSecondsToTime(pace100Sec);
  if (vo2El) vo2El.textContent = vo2maxEst.toFixed(1);

  // Tabla de porcentajes y series
  const table = document.getElementById('vamPacesTable');
  if (!table) return;

  const zones = [
    { pct: 110, name: 'Series Cortas (200m)', distTest: 200, tip: 'Potencia anaeróbica láctica y velocidad neuromuscular.' },
    { pct: 105, name: 'Series Medias (400m)', distTest: 400, tip: 'Consumo máximo de oxígeno (techo aeróbico).' },
    { pct: 100, name: 'VAM Pura (800m - 1000m)', distTest: 1000, tip: 'El ritmo exacto de tu velocidad aeróbica máxima.' },
    { pct: 90, name: 'Umbral de Lactato (Tempo)', distTest: 1000, tip: 'Aclaramiento y reciclaje de lactato (ritmo 10K).' },
    { pct: 82, name: 'Ritmo Media Maratón', distTest: 1000, tip: 'Velocidad crucero de fondo sin fatiga prematura.' },
    { pct: 72, name: 'Rodaje Aeróbico Z2', distTest: 1000, tip: 'Base mitocondrial y quema de ácidos grasos (el 80%).' }
  ];

  table.innerHTML = zones.map((z) => {
    const speed = vamKmH * (z.pct / 100);
    const paceSec = 3600 / speed;
    const splitTime = formatSecondsToTime((paceSec / 1000) * z.distTest);
    return `
      <div class="grid grid-cols-12 px-3 py-2.5 items-center">
        <div class="col-span-4">
          <strong class="text-slate-900 dark:text-white">${z.pct}% VAM</strong>
          <span class="block text-[10px] text-slate-500">${z.name}</span>
        </div>
        <div class="col-span-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
          ${formatSecondsToTime(paceSec)} /km
          <span class="block text-[10px] font-normal text-slate-400">Paso ${z.distTest}m: ${splitTime}</span>
        </div>
        <div class="col-span-4 text-right text-[11px] text-slate-500 dark:text-slate-400 truncate">
          ${z.tip}
        </div>
      </div>
    `;
  }).join('');
}

function applyVamPacesToProfile() {
  const distInput = document.getElementById('vamDistanceMeters');
  const protoSelect = document.getElementById('vamProtocolSelect');
  const meters = parseFloat(distInput ? distInput.value : '1550') || 1550;
  const proto = protoSelect ? protoSelect.value : '6min';

  let vamKmH = proto === '6min' ? meters / 100 : (meters - 504.9) / 44.73 / 3.5;
  vamKmH = Math.min(26, Math.max(8, vamKmH));
  const vo2max = Math.round(vamKmH * 3.5 * 10) / 10;

  if (appState.profile) {
    appState.profile.vo2max = vo2max;
    saveState();
    refreshAllViews();
    closeVamModal();
    showToast(`¡Zonas VAM actualizadas! VO2max calibrado en ${vo2max} ml/kg/min.`);
  }
}

// ============================================================================
// FEATURE 5: FICHA DE ENTRENAMIENTO PARA COMPARTIR (STORY CARD)
// ============================================================================

let activeStoryWorkoutId = null;

function openStoryCardModal(workoutId = null) {
  const modal = document.getElementById('storyCardModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Poblar selector de entrenamientos
  const select = document.getElementById('scWorkoutSelector');
  if (select) {
    const workouts = appState.workouts.filter(
      (w) => w.type !== 'rest' && (Number(w.actualKm) > 0 || Number(w.plannedKm) > 0)
    ).slice(-10).reverse();

    if (workouts.length === 0) {
      select.innerHTML = '<option value="">Sin sesiones para compartir</option>';
    } else {
      select.innerHTML = workouts.map((w) => `
        <option value="${w.id}" ${workoutId === w.id ? 'selected' : ''}>
          ${formatShortSpanishDate(w.date)} — ${w.title} (${w.actualKm || w.plannedKm} km)
        </option>
      `).join('');
      activeStoryWorkoutId = workoutId || workouts[0].id;
    }
  }

  renderStoryCardCanvas();
}

function closeStoryCardModal() {
  const modal = document.getElementById('storyCardModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openStoryCardFromActiveWorkout() {
  const wmId = document.getElementById('wmId');
  const workoutId = wmId ? wmId.value : null;
  closeWorkoutModal();
  openStoryCardModal(workoutId);
}

function renderStoryCardCanvas() {
  const canvas = document.getElementById('storyCardCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const select = document.getElementById('scWorkoutSelector');
  const themeSelect = document.getElementById('scThemeSelector');

  const workoutId = select ? select.value : activeStoryWorkoutId;
  const theme = themeSelect ? themeSelect.value : 'obsidian';

  const w = appState.workouts.find((item) => item.id === workoutId) || appState.workouts[0] || {
    title: 'Rodaje Aeróbico de Progresión',
    actualKm: 10.5,
    actualMin: 55,
    actualPace: '05:14',
    actualHR: 148,
    actualRpe: 6,
    date: getLocalISODate(0),
    type: 'easy'
  };

  const width = canvas.width;
  const height = canvas.height;

  // 1. Fondos con Degradados Ricos
  if (theme === 'emerald') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.6, '#022c22');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
  } else if (theme === 'sunset') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#831843');
    grad.addColorStop(0.5, '#4c0519');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
  } else {
    // Obsidian
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.6, '#090d16');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
  }
  ctx.fillRect(0, 0, width, height);

  // Círculo translúcido de luz
  const glowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 20, width * 0.8, height * 0.2, 300);
  glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
  glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(width * 0.8, height * 0.2, 300, 0, Math.PI * 2);
  ctx.fill();

  // 2. Encabezado de la Ficha
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('RUNPULSE AI', 40, 55);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '13px Inter, sans-serif';
  ctx.fillText(formatShortSpanishDate(w.date || getLocalISODate(0)).toUpperCase(), width - 180, 55);

  // Línea divisoria
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 75);
  ctx.lineTo(width - 40, 75);
  ctx.stroke();

  // 3. Título de la Sesión
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Space Grotesk", sans-serif';
  const cleanTitle = (w.title || 'Entrenamiento de Running').slice(0, 32);
  ctx.fillText(cleanTitle, 40, 120);

  // Tipo badge
  const typeCatalog = WORKOUT_TYPES_CATALOG[w.type] || WORKOUT_TYPES_CATALOG.easy;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.roundRect(40, 138, 160, 26, 8);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillText(typeCatalog.name.slice(0, 20), 52, 155);

  // 4. Gran Número de Kilómetros
  const distKm = parseFloat(w.actualKm || w.plannedKm || 0).toFixed(1);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 110px "Space Grotesk", sans-serif';
  ctx.fillText(distKm, 35, 280);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText('KILÓMETROS', 40, 315);

  // 5. Caja de Métricas Principales (Ritmo, Tiempo, FC)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.roundRect(40, 350, width - 80, 160, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.stroke();

  // Columna 1: Ritmo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('RITMO PROMEDIO', 70, 395);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillText(w.actualPace || '--:--', 70, 440);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('min/km', 70, 465);

  // Columna 2: Tiempo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('DURACIÓN', 245, 395);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillText(`${w.actualMin || w.plannedMin || 0}`, 245, 440);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('minutos', 245, 465);

  // Columna 3: Pulsaciones
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('FC MEDIA', 415, 395);
  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillText(w.actualHR > 0 ? `${w.actualHR}` : '--', 415, 440);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText('ppm', 415, 465);

  // 6. Fila de Detalles Secundarios (Cadencia, RPE, Desnivel)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.roundRect(40, 530, width - 80, 70, 16);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '13px Inter, sans-serif';
  ctx.fillText(`⚡ Esfuerzo: RPE ${w.actualRpe || 6}/10`, 65, 572);
  ctx.fillText(`⏱️ Cadencia: ${w.actualCadence > 0 ? w.actualCadence + ' spm' : '172 spm'}`, 245, 572);
  ctx.fillText(`⛰️ +${w.actualElevation || 45} m`, 440, 572);

  // 7. Pie de Tarjeta con Marca del Atleta
  const runnerName = appState.profile.name || 'Dykembel';
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 15px Inter, sans-serif';
  ctx.fillText(`Atleta: ${runnerName}`, 40, 680);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'italic 12px Inter, sans-serif';
  ctx.fillText('"La constancia diaria supera al talento ocasional"', 40, 705);
}

function downloadStoryCardImage() {
  const canvas = document.getElementById('storyCardCanvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `RunPulse_Entreno_${getLocalISODate(0)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('¡Ficha descargada en formato PNG!');
}

function copyStoryCardImage() {
  const canvas = document.getElementById('storyCardCanvas');
  if (!canvas || !navigator.clipboard) return;

  canvas.toBlob((blob) => {
    if (!blob) return;
    try {
      const item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item]).then(() => {
        showToast('¡Imagen copiada al portapapeles!');
      }).catch(() => {
        downloadStoryCardImage();
      });
    } catch (e) {
      downloadStoryCardImage();
    }
  });
}

// ============================================================================
// FEATURE 4: CALCULADORA DE GASTO CALÓRICO & MACRONUTRIENTES DIARIOS
// ============================================================================

function openNutritionMacroModal() {
  const modal = document.getElementById('nutritionMacroModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Pre-cargar valores desde el perfil y el entrenamiento de hoy
  const weightInput = document.getElementById('nmRunnerWeightInput');
  if (weightInput && appState.profile.weight) {
    weightInput.value = appState.profile.weight;
  }

  calculateNutritionMacros();
}

function closeNutritionMacroModal() {
  const modal = document.getElementById('nutritionMacroModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function calculateNutritionMacros() {
  const dayTypeSelect = document.getElementById('nmDayTypeSelect');
  const weightInput = document.getElementById('nmRunnerWeightInput');
  const kmInput = document.getElementById('nmKmInput');

  let weightKg = parseFloat(weightInput ? weightInput.value : '68.5') || 68.5;
  let dayType = dayTypeSelect ? dayTypeSelect.value : 'auto';
  let runningKm = parseFloat(kmInput ? kmInput.value : '10.0') || 0;

  // Si está en 'auto', buscar sesión de hoy en el calendario
  if (dayType === 'auto') {
    const todayISO = getLocalISODate(0);
    const todayWorkout = appState.workouts.find((w) => w.date === todayISO);
    if (todayWorkout) {
      if (todayWorkout.type === 'rest') {
        dayType = 'rest';
        runningKm = 0;
      } else if (todayWorkout.type === 'long') {
        dayType = 'long';
        runningKm = Number(todayWorkout.actualKm || todayWorkout.plannedKm) || 18;
      } else if (todayWorkout.type === 'tempo' || todayWorkout.type === 'intervals' || todayWorkout.type === 'hills') {
        dayType = 'quality';
        runningKm = Number(todayWorkout.actualKm || todayWorkout.plannedKm) || 10;
      } else if (todayWorkout.type === 'race') {
        dayType = 'race';
        runningKm = Number(todayWorkout.actualKm || todayWorkout.plannedKm) || 21.1;
      } else {
        dayType = 'easy';
        runningKm = Number(todayWorkout.actualKm || todayWorkout.plannedKm) || 8;
      }
    } else {
      dayType = 'easy';
      runningKm = 8;
    }
    if (kmInput) kmInput.value = runningKm.toFixed(1);
  }

  // Tasa Metabólica Basal (BMR) + Actividad cotidiana sedentaria/ligera (NEAT ~ x1.2)
  const age = parseFloat(appState.profile.age) || 30;
  const height = parseFloat(appState.profile.height) || 175;
  const bmrBase = (10 * weightKg) + (6.25 * height) - (5 * age) + 5;
  const dailyBaseCal = Math.round(bmrBase * 1.2);

  // Gasto energético por running (~ 1.0 kcal por kg de peso por km)
  let runIntensityFactor = 1.0;
  let targetCarbsPerKg = 5.5; // g/kg
  let targetProteinPerKg = 1.6; // g/kg

  if (dayType === 'rest') {
    runIntensityFactor = 0;
    targetCarbsPerKg = 3.5;
    targetProteinPerKg = 1.4;
  } else if (dayType === 'easy') {
    runIntensityFactor = 0.95;
    targetCarbsPerKg = 5.0;
    targetProteinPerKg = 1.5;
  } else if (dayType === 'quality') {
    runIntensityFactor = 1.1;
    targetCarbsPerKg = 6.5;
    targetProteinPerKg = 1.7;
  } else if (dayType === 'long') {
    runIntensityFactor = 1.02;
    targetCarbsPerKg = 8.0;
    targetProteinPerKg = 1.7;
  } else if (dayType === 'race') {
    runIntensityFactor = 1.15;
    targetCarbsPerKg = 9.0;
    targetProteinPerKg = 1.6;
  }

  const runningCalories = Math.round(runningKm * weightKg * runIntensityFactor);
  const totalCalories = dailyBaseCal + runningCalories;

  // Gramos de macronutrientes
  const carbsGrams = Math.round(weightKg * targetCarbsPerKg);
  const proteinGrams = Math.round(weightKg * targetProteinPerKg);

  // Calorías de Carbohidratos (4 kcal/g) y Proteínas (4 kcal/g)
  const carbsCal = carbsGrams * 4;
  const proteinCal = proteinGrams * 4;

  // Grasas saludables (9 kcal/g) para completar el balance calórico o mínimo 0.9 g/kg
  let fatCal = Math.max(weightKg * 0.85 * 9, totalCalories - (carbsCal + proteinCal));
  const fatGrams = Math.round(fatCal / 9);

  // Porcentajes de distribución
  const sumCal = carbsCal + proteinCal + fatCal;
  const carbsPct = Math.round((carbsCal / sumCal) * 100);
  const proteinPct = Math.round((proteinCal / sumCal) * 100);
  const fatPct = Math.max(0, 100 - (carbsPct + proteinPct));

  // Actualizar DOM
  const totCalEl = document.getElementById('nmTotalCalories');
  const runBurnSub = document.getElementById('nmRunningBurnSub');
  const carbsEl = document.getElementById('nmCarbsGrams');
  const carbsPerKgEl = document.getElementById('nmCarbsPerKg');
  const protEl = document.getElementById('nmProteinGrams');
  const protPerKgEl = document.getElementById('nmProteinPerKg');
  const fatEl = document.getElementById('nmFatGrams');
  const fatPerKgEl = document.getElementById('nmFatPerKg');

  if (totCalEl) totCalEl.textContent = totalCalories.toLocaleString('es-ES');
  if (runBurnSub) {
    runBurnSub.textContent = runningCalories > 0 ? `+${runningCalories} kcal en running (${runningKm} km)` : 'Día sin carrera (solo gasto base)';
  }
  if (carbsEl) carbsEl.textContent = `${carbsGrams} g`;
  if (carbsPerKgEl) carbsPerKgEl.textContent = `${targetCarbsPerKg.toFixed(1)} g/kg (Glucógeno)`;
  if (protEl) protEl.textContent = `${proteinGrams} g`;
  if (protPerKgEl) protPerKgEl.textContent = `${targetProteinPerKg.toFixed(1)} g/kg (Miofibrilar)`;
  if (fatEl) fatEl.textContent = `${fatGrams} g`;
  if (fatPerKgEl) fatPerKgEl.textContent = `${(fatGrams / weightKg).toFixed(2)} g/kg (Hormonal)`;

  // Barras porcentuales
  const barCarbs = document.getElementById('nmBarCarbs');
  const barProt = document.getElementById('nmBarProtein');
  const barFat = document.getElementById('nmBarFat');
  const lCarbs = document.getElementById('nmCarbsPctLabel');
  const lProt = document.getElementById('nmProteinPctLabel');
  const lFat = document.getElementById('nmFatPctLabel');

  if (barCarbs) barCarbs.style.width = `${carbsPct}%`;
  if (barProt) barProt.style.width = `${proteinPct}%`;
  if (barFat) barFat.style.width = `${fatPct}%`;

  if (lCarbs) lCarbs.textContent = `${carbsPct}%`;
  if (lProt) lProt.textContent = `${proteinPct}%`;
  if (lFat) lFat.textContent = `${fatPct}%`;
}

// ============================================================================
// FEATURE 5: MOCHILA & CHECKLIST PARA EL DÍA DE CARRERA
// ============================================================================

const DEFAULT_RACE_CHECKLIST_SECTIONS = [
  {
    id: 'race_essentials',
    title: '🏃 Imprescindibles de Carrera',
    items: [
      { id: 'item_dorsal', text: 'Dorsal oficial (con chip de cronometraje verificado en su reverso)' },
      { id: 'item_pins', text: 'Imperdibles de seguridad (4 o 6) o cinturón porta-dorsal elástico' },
      { id: 'item_shoes', text: 'Zapatillas de carrera comprobadas (con cordones atados en doble nudo)' },
      { id: 'item_socks', text: 'Calcetines técnicos probados en fondos previos (sin costuras molestas)' },
      { id: 'item_watch', text: 'Reloj GPS cargado al 100% (con satélites calibrados y alarma configurada)' }
    ]
  },
  {
    id: 'race_nutrition',
    title: '⚡ Nutrición, Hidratación & Pre-Salida',
    items: [
      { id: 'item_gels', text: 'Geles energéticos calculados (ej. 3-4 geles, con y sin cafeína marcados)' },
      { id: 'item_salts', text: 'Cápsulas de sal o sales masticables para prevenir calambres' },
      { id: 'item_bottle', text: 'Botellín de agua desechable para beber a sorbos en el cajón de salida' },
      { id: 'item_breakfast', text: 'Desayuno pre-carrera probado y digerido con 2.5 a 3 horas de antelación' }
    ]
  },
  {
    id: 'race_care',
    title: '🛡️ Prevención de Rozaduras & Clima',
    items: [
      { id: 'item_vaseline', text: 'Vaselina pura o crema anti-rozaduras (ingles, pezones, axilas y dedos)' },
      { id: 'item_cap', text: 'Gorra técnica / visera y gafas de sol ligeras' },
      { id: 'item_sunscreen', text: 'Protector solar deportivo resistente al sudor (rostro, hombros y cuello)' },
      { id: 'item_warmup_clothes', text: 'Ropa vieja de abrigo para desechar o entregar antes del pistoletazo' }
    ]
  },
  {
    id: 'race_finish',
    title: '🏁 Guardarropa, Meta & Post-Carrera',
    items: [
      { id: 'item_dry_clothes', text: 'Ropa seca completa para cambiarte en meta (camiseta limpia, sudadera, pantalón)' },
      { id: 'item_flipflops', text: 'Chanclas o calzado amplio para liberar los pies tras el esfuerzo' },
      { id: 'item_recovery_shake', text: 'Batido recuperador de proteína + carbohidratos para reponer glucógeno' },
      { id: 'item_id_money', text: 'Documento de identidad oficial, tarjeta médica y efectivo/tarjeta' }
    ]
  }
];

function openRaceChecklistModal() {
  const modal = document.getElementById('raceChecklistModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  renderRaceChecklist();
}

function closeRaceChecklistModal() {
  const modal = document.getElementById('raceChecklistModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderRaceChecklist() {
  const container = document.getElementById('checklistSectionsContainer');
  if (!container) return;

  if (!appState.raceDayChecklist || typeof appState.raceDayChecklist !== 'object') {
    appState.raceDayChecklist = {};
  }

  let totalItems = 0;
  let checkedItems = 0;

  container.innerHTML = DEFAULT_RACE_CHECKLIST_SECTIONS.map((sec) => {
    return `
      <div class="space-y-2 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
          ${sec.title}
        </h4>
        <div class="space-y-2 pt-1">
          ${sec.items.map((item) => {
            totalItems++;
            const isChecked = !!appState.raceDayChecklist[item.id];
            if (isChecked) checkedItems++;
            return `
              <label class="flex items-start gap-2.5 cursor-pointer text-xs group">
                <input type="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''} onchange="toggleChecklistItem('${item.id}', this.checked)" class="mt-0.5 w-4 h-4 rounded text-yellow-600 focus:ring-yellow-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer" />
                <span class="${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'} group-hover:text-slate-900 dark:group-hover:text-white transition">
                  ${item.text}
                </span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Actualizar Barra de Progreso
  const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  const bar = document.getElementById('checklistProgressBar');
  const txt = document.getElementById('checklistProgressText');

  if (bar) bar.style.width = `${pct}%`;
  if (txt) {
    txt.textContent = `${checkedItems} de ${totalItems} elementos listos (${pct}%)`;
    if (pct === 100) {
      txt.innerHTML = `🎉 ¡Mochila 100% lista! Tienes todo para volar en carrera.`;
    }
  }

  updateRaceChecklistBadge();
}

function toggleChecklistItem(itemId, isChecked) {
  if (!appState.raceDayChecklist) appState.raceDayChecklist = {};
  appState.raceDayChecklist[itemId] = isChecked;
  saveState();
  renderRaceChecklist();
}

function checkAllChecklistItems(checkAll = true) {
  if (!appState.raceDayChecklist) appState.raceDayChecklist = {};
  DEFAULT_RACE_CHECKLIST_SECTIONS.forEach((sec) => {
    sec.items.forEach((item) => {
      appState.raceDayChecklist[item.id] = checkAll;
    });
  });
  saveState();
  renderRaceChecklist();
  showToast(checkAll ? '¡Mochila marcada como 100% lista!' : 'Lista de mochila desmarcada');
}

function updateRaceChecklistBadge() {
  const badge = document.getElementById('raceChecklistPillBadge');
  if (!badge) return;

  if (!appState.raceDayChecklist) appState.raceDayChecklist = {};
  let total = 0;
  let done = 0;
  DEFAULT_RACE_CHECKLIST_SECTIONS.forEach((sec) => {
    sec.items.forEach((item) => {
      total++;
      if (appState.raceDayChecklist[item.id]) done++;
    });
  });

  if (done === total && total > 0) {
    badge.textContent = '100% Lista';
    badge.className = 'text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300';
  } else if (done > 0) {
    badge.textContent = `${done}/${total}`;
    badge.className = 'text-[10px] font-bold px-1.5 py-0.2 rounded bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300';
  } else {
    badge.textContent = 'Pendiente';
    badge.className = 'text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  }
}
