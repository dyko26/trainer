// ============================================================================
// RunPulse AI — Control de Running, Fisiología, Escáner de Reloj & Gemini AI
// ============================================================================

const STORAGE_KEY = 'runpulse_ai_state_v1';
const GEMINI_KEY_STORAGE = 'runpulse_gemini_api_key';

// Catálogo científico de tipos de entrenamiento y sus adaptaciones fisiológicas (escala 1-10)
const WORKOUT_TYPES_CATALOG = {
  easy: {
    id: 'easy',
    name: 'Rodaje Suave / Recuperación',
    shortName: 'Rodaje Suave',
    zone: 'Z1 - Z2 (60-75% FC)',
    color: '#10b981',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    primaryBenefit: 'Densidad mitocondrial, capilarización y oxidación de grasas',
    recoveryHours: '12 - 24 h',
    description:
      'El pilar del 80% del volumen semanal. Estimula el crecimiento de mitocondrias y capilares sanguíneos en las fibras lentas (Tipo I) sin generar fatiga del sistema nervioso central.',
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
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
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
    color: '#ef4444',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    primaryBenefit: 'Volumen sistólico cardíaco, potencia aeróbica máxima (VO2max)',
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
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    primaryBenefit: 'Reservas de glucógeno, resistencia a la fatiga y fortaleza tendinosa',
    recoveryHours: '36 - 60 h',
    description:
      'Expande los depósitos de glucógeno muscular y hepático, enseña al cuerpo a usar ácidos grasos cuando baja el glucógeno y fortalece tendones, fascias y mente.',
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
    color: '#a855f7',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
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
    color: '#f97316',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    primaryBenefit: 'Fuerza específica de glúteos/gemelos y economía de zancada con bajo impacto',
    recoveryHours: '36 - 48 h',
    description:
      'Construye potencia en la cadena posterior (glúteos, isquios, sóleos) y mejora la rigidez reactiva del tendón de Aquiles con menor impacto articular que en llano.',
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
    color: '#ec4899',
    badgeClass: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    primaryBenefit: 'Estabilidad pélvica, prevención de lesiones y economía de carrera',
    recoveryHours: '24 - 48 h',
    description:
      'Entrenamiento de fuerza reactiva, unilateral y core. Reduce el gasto energético por zancada hasta un 4-6% y protege rodillas, cadera y tendón rotuliano/aquiles.',
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
    color: '#eab308',
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    primaryBenefit: 'Expresión máxima de rendimiento y calibración de zonas VDOT',
    recoveryHours: '72 - 120 h',
    description:
      'Pone a prueba todos los sistemas fisiológicos y psicológicos simultáneamente. Sirve para actualizar tu VDOT y recalibrar los ritmos de Gemini.',
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
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
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

// Estado global de la aplicación
let appState = null;
let currentWeekOffset = 0;
let selectedPhysiologyType = 'intervals';
let currentModalScreenshots = []; // Arreglo temporal de imágenes en base64 para el modal abierto

// Instancias de gráficas Chart.js
let volumeChartInstance = null;
let paceHrChartInstance = null;
let radarChartInstance = null;
let intensityChartInstance = null;

// ============================================================================
// UTILIDADES DE FECHAS Y TIEMPOS
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
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
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
  if (valid.length > 0) {
    return Math.max(...valid);
  }
  if (profile.vo2max && Number(profile.vo2max) > 25) {
    return Number(profile.vo2max);
  }
  return 45.0;
}

function getPacePerKmForVDOTIntensity(vdot, intensityPct) {
  const targetVo2 = vdot * intensityPct;
  const a = 0.000104;
  const b = 0.182258;
  const c = -(4.6 + targetVo2);
  const velocity = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  const secondsPerKm = (1000 / velocity) * 60;
  return secondsPerKm;
}

function predictRaceTimeSeconds(vdot, distanceMeters) {
  let low = 600;
  let high = 36000;
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const est = calculateVDOTFromRace(distanceMeters, mid);
    if (est && est > vdot) {
      low = mid;
    } else {
      high = mid;
    }
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
      color: 'border-slate-500/40 bg-slate-900/80 text-slate-300',
      dot: 'bg-slate-400',
      desc: 'Calentamiento, enfriamiento y regeneración muscular.'
    },
    {
      zone: 'Z2',
      name: 'Base Aeróbica / Quema Grasa',
      hrRange: `${calcHR(0.65)} - ${calcHR(0.76)} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.72))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.65))} /km`,
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      dot: 'bg-emerald-400',
      desc: 'Rodajes suaves y tiradas largas (Ritmo conversacional).'
    },
    {
      zone: 'Z3',
      name: 'Tempo Aeróbico / Ritmo Maratón',
      hrRange: `${calcHR(0.76)} - ${calcHR(0.84)} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.81))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.76))} /km`,
      color: 'border-sky-500/40 bg-sky-950/20 text-sky-300',
      dot: 'bg-sky-400',
      desc: 'Esfuerzo controlado sostenido, resistencia específica.'
    },
    {
      zone: 'Z4',
      name: 'Umbral Anaeróbico / Lactato',
      hrRange: `${calcHR(0.84)} - ${calcHR(0.91)} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.88))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.84))} /km`,
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      dot: 'bg-amber-400',
      desc: 'Ritmo que puedes sostener ~45-60 min. Mejora reciclaje de lactato.'
    },
    {
      zone: 'Z5',
      name: 'Potencia VO2 Máx / Series',
      hrRange: `${calcHR(0.91)} - ${maxHR} ppm`,
      paceRange: `${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 1.0))} - ${formatSecondsToTime(getPacePerKmForVDOTIntensity(vdot, 0.94))} /km`,
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
      dot: 'bg-rose-500',
      desc: 'Intervalos intensos de 2 a 5 minutos. Eleva techo aeróbico.'
    }
  ];
}

// ============================================================================
// DATOS INICIALES POR DEFECTO
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
      name: 'Corredor RunPulse',
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
        watchAnalysis: 'Zonas FC: 84% en Z2, 16% en Z3. Parciales muy regulares entre 5:08 y 5:14/km.',
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
        watchAnalysis: '5x1000m en: 4:16, 4:15, 4:13, 4:14, 4:11. Training Effect Aeróbico 4.1 / Anaeróbico 3.2.',
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
        watchAnalysis: 'Bloque inicial 13km a 5:12/km (147 ppm) + cierre 3.5km a 4:48/km (164 ppm). Baja deriva cardíaca.',
        notes: 'Últimos 3 km a 4:50 sintiéndome fuerte.',
        screenshots: []
      },
      {
        id: 'w-curr-1',
        date: dayISO(0),
        type: 'rest',
        title: 'Descanso Activo y Movilidad',
        status: 'completed',
        plannedKm: 0,
        plannedMin: 20,
        plannedPace: '--:--',
        plannedZone: 'Recuperación',
        actualKm: 0,
        actualMin: 20,
        actualPace: '--:--',
        actualHR: 0,
        actualRpe: 2,
        watchAnalysis: '',
        notes: 'Rodillo de espuma y estiramientos.',
        screenshots: []
      },
      {
        id: 'w-curr-2',
        date: dayISO(1),
        type: 'easy',
        title: 'Rodaje Base Aeróbica Z2',
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
        watchAnalysis: 'Deriva cardíaca alta a partir del km 4 (subió a 179 ppm a 4:40/km por humedad/calor).',
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
        notes: 'Sentadilla búlgara, elevación de talones excéntrica, planchas.',
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
        'Detecto que en la sesión de Tempo del miércoles recortaste 2 km con un RPE de 8/10 y pulsaciones altas por calor. Puedes subir los pantallazos de tu reloj en cada sesión para que analice tus parciales y zonas de FC antes de reajustar el plan.',
      recommendations: [
        'Mantener el rodaje del sábado estrictamente en Zona 1-2 (<148 ppm).',
        'Sube la captura de tus intervalos o tirada larga desde el botón "Subir Captura Reloj" para extraer automáticamente tus splits.'
      ]
    }
  };
}

// ============================================================================
// PERSISTENCIA Y CARGA DE ESTADO
// ============================================================================

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      appState = JSON.parse(raw);
    } else {
      appState = createDefaultState();
      saveState();
    }
  } catch (e) {
    console.error('Error cargando estado local:', e);
    appState = createDefaultState();
  }

  const savedKey = localStorage.getItem(GEMINI_KEY_STORAGE);
  if (savedKey) {
    const input = document.getElementById('geminiApiKeyInput');
    if (input) input.value = savedKey;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.error('Error guardando estado:', e);
    showToast('Aviso: Almacenamiento local lleno. Exporta un respaldo JSON o elimina capturas antiguas.');
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
// NAVEGACIÓN ENTRE PESTAÑAS
// ============================================================================

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.add('hidden');
  });
  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.classList.remove('active');
  });

  const targetPanel = document.getElementById(`tab-${tabId}`);
  const targetBtn = document.getElementById(`tabBtn-${tabId}`);
  if (targetPanel) targetPanel.classList.remove('hidden');
  if (targetBtn) targetBtn.classList.add('active');

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

function openGeminiModal() {
  switchTab('gemini');
  generateGeminiPrompt('adjust');
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
  showToast(`${files.length} captura(s) cargada(s). Pulsa "Extraer Datos con Gemini IA" para leerlas.`);
}

// Soporte para pegar pantallazos directamente con Ctrl+V cuando el modal está abierto
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
  showToast('Captura pegada desde el portapapeles. Puedes extraer sus datos con Gemini IA.');
});

function renderModalScreenshotsGallery() {
  const gallery = document.getElementById('wmScreenshotsGallery');
  if (!gallery) return;

  if (currentModalScreenshots.length === 0) {
    gallery.innerHTML = `
      <div class="col-span-full py-3 px-4 rounded-xl border border-dashed border-slate-800 text-center text-[11px] text-slate-400">
        No hay capturas adjuntas en esta sesión. Sube imágenes de la pantalla de tu reloj o de la app (Garmin, Strava, Coros, Apple Fitness, Huawei, Polar) o presiona <strong>Ctrl+V</strong>.
      </div>
    `;
    return;
  }

  gallery.innerHTML = currentModalScreenshots
    .map(
      (img, index) => `
      <div class="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-28 flex items-center justify-center">
        <img src="${img.dataUrl}" alt="${img.name}" onclick="openImageLightbox('${img.dataUrl}')" class="w-full h-full object-cover cursor-zoom-in group-hover:opacity-90 transition" />
        <button type="button" onclick="removeModalScreenshot(${index})" class="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-950/85 text-rose-400 hover:bg-rose-500 hover:text-white transition" title="Eliminar captura">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
        <span class="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-300">Captura ${index + 1}</span>
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

// Analizador Multimodal Gemini Vision: lee las capturas del reloj y autocompleta el entrenamiento
async function analyzeWatchScreenshotsWithGemini() {
  const statusEl = document.getElementById('wmVisionStatus');
  const apiKey =
    document.getElementById('geminiApiKeyInput')?.value.trim() ||
    localStorage.getItem(GEMINI_KEY_STORAGE) ||
    '';

  if (currentModalScreenshots.length === 0) {
    statusEl.className = 'text-xs p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 block';
    statusEl.textContent = 'Primero sube o pega (Ctrl+V) al menos una captura de pantalla de tu reloj o aplicación deportiva.';
    return;
  }

  if (!apiKey) {
    statusEl.className = 'text-xs p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 block';
    statusEl.textContent = 'Para leer automáticamente las imágenes necesitas configurar tu Gemini API Key en la pestaña "Centro Gemini AI". (Las imágenes igual se guardarán en tu sesión si pulsas Guardar).';
    return;
  }

  const imageParts = currentModalScreenshots.map((img) => {
    const base64Data = img.dataUrl.split(',')[1];
    return {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    };
  });

  const visionPrompt = `Analiza estas capturas de pantalla de mi reloj deportivo / app de running (Garmin, Coros, Strava, Apple Fitness, Polar, Huawei Health, Samsung, etc.).
Extrae con máxima precisión todos los datos visibles del entrenamiento y devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura:
{
  "titleSuggested": "Nombre descriptivo de la sesión si no tiene uno (ej. Rodaje Aeróbico o Series en Pista)",
  "workoutTypeSuggested": "easy | tempo | intervals | long | fartlek | hills | strength | race",
  "dateSuggested": "YYYY-MM-DD si aparece en la captura o vacío",
  "actualKm": 10.02,
  "actualMin": 51.4,
  "actualPace": "05:08",
  "actualHR": 152,
  "actualMaxHR": 174,
  "actualCadence": 176,
  "actualElevation": 85,
  "actualCalories": 610,
  "estimatedRpe": 6,
  "watchAnalysis": "Resumen claro y estructurado en español de: 1) Parciales/Splits por km o vueltas, 2) Distribución en Zonas de Frecuencia Cardíaca, 3) Training Effect / Carga / Potencia / Cadencia y 4) Qué indica fisiológicamente sobre cómo fue el entrenamiento (ej. si hubo deriva cardíaca, si el ritmo fue constante o progresivo)."
}`;

  const fallbackModels = [
    document.getElementById('geminiModelSelect')?.value || 'gemini-3-flash-preview',
    'gemini-3-flash-preview',
    'gemini-3.1-pro-preview',
    'gemini-2.5-flash'
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastError = null;

  for (const model of fallbackModels) {
    statusEl.className = 'text-xs p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 block';
    statusEl.textContent = `Escaneando ${currentModalScreenshots.length} captura(s) del reloj con ${model}...`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: visionPrompt }, ...imageParts]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${response.status}`;
        lastError = new Error(errMsg);
        if (response.status === 404 || response.status === 400 || response.status === 429 || errMsg.includes('no longer available')) {
          continue;
        }
        throw lastError;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());

      // Autocompletar campos del modal con lo leído de las capturas
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
      if (parsed.watchAnalysis) {
        document.getElementById('wmWatchAnalysis').value = parsed.watchAnalysis;
      }
      if (!document.getElementById('wmTitle').value && parsed.titleSuggested) {
        document.getElementById('wmTitle').value = parsed.titleSuggested;
      }
      if (parsed.workoutTypeSuggested && WORKOUT_TYPES_CATALOG[parsed.workoutTypeSuggested]) {
        document.getElementById('wmType').value = parsed.workoutTypeSuggested;
        updateModalPhysiologyPreview();
      }
      document.getElementById('wmStatus').value = 'completed';

      statusEl.className = 'text-xs p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 block';
      statusEl.textContent = '¡Datos del reloj extraídos con éxito! Revisa los campos autocompletados abajo y pulsa "Guardar Sesión y Capturas".';
      return;
    } catch (err) {
      lastError = err;
    }
  }

  statusEl.className = 'text-xs p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 block';
  statusEl.textContent = `No se pudo leer la imagen con la API: ${lastError ? lastError.message : 'Error desconocido'}`;
}

// ============================================================================
// RENDERIZADO: CABECERA Y DASHBOARD PRINCIPAL
// ============================================================================

function updateHeaderBadges() {
  const vdot = getRunnerVDOT(appState.profile);
  const vdotEl = document.getElementById('headerVdotValue');
  if (vdotEl) vdotEl.textContent = vdot.toFixed(1);

  const monday = getMondayOfWeek(0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monISO = formatDateISO(monday);
  const sunISO = formatDateISO(sunday);

  const weekWorkouts = appState.workouts.filter(
    (w) => w.date >= monISO && w.date <= sunISO
  );
  const plannedKm = weekWorkouts.reduce((acc, w) => acc + (Number(w.plannedKm) || 0), 0);
  const actualKm = weekWorkouts
    .filter((w) => w.status === 'completed' || w.status === 'modified')
    .reduce((acc, w) => acc + (Number(w.actualKm) || 0), 0);

  const pct = plannedKm > 0 ? Math.min(100, Math.round((actualKm / plannedKm) * 100)) : 0;
  const compEl = document.getElementById('headerComplianceValue');
  if (compEl) compEl.textContent = `${pct}%`;
}

function renderDashboard() {
  updateHeaderBadges();

  const monday = getMondayOfWeek(0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monISO = formatDateISO(monday);
  const sunISO = formatDateISO(sunday);

  const weekWorkouts = appState.workouts.filter(
    (w) => w.date >= monISO && w.date <= sunISO
  );
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
    document.getElementById('kpiAvgHrText').innerHTML = `FC Media: <span class="text-slate-200 font-medium">${avgHR} ppm</span> (${completedRuns.length} sesiones)`;

    const avgRpe =
      completedRuns.reduce((s, w) => s + Number(w.actualRpe || 5), 0) / completedRuns.length;
    document.getElementById('kpiAvgRpe').textContent = `(RPE prom: ${avgRpe.toFixed(1)}/10)`;
    const readinessEl = document.getElementById('kpiReadinessState');
    if (avgRpe >= 7.8) {
      readinessEl.textContent = 'Carga Alta / Precaución';
      readinessEl.className = 'text-lg font-display font-bold text-amber-400';
    } else if (avgRpe <= 4.5) {
      readinessEl.textContent = 'Fresco / Alta Energía';
      readinessEl.className = 'text-lg font-display font-bold text-sky-400';
    } else {
      readinessEl.textContent = 'Asimilación Óptima';
      readinessEl.className = 'text-lg font-display font-bold text-emerald-400';
    }
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
    const diffDays = Math.ceil(
      (new Date(nextGoal.date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    document.getElementById('kpiNextGoalCountdown').textContent =
      diffDays >= 0 ? `Faltan ${diffDays} días (${formatShortSpanishDate(nextGoal.date)})` : `Evento completado (${formatShortSpanishDate(nextGoal.date)})`;
  }

  const todayISO = getLocalISODate(0);
  const upcoming = [...appState.workouts]
    .filter((w) => w.date >= todayISO && w.status === 'planned')
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextWorkout =
    upcoming[0] ||
    [...appState.workouts].sort((a, b) => b.date.localeCompare(a.date))[0];

  const nextContainer = document.getElementById('nextWorkoutCardContent');
  if (nextWorkout && nextContainer) {
    const typeInfo = WORKOUT_TYPES_CATALOG[nextWorkout.type] || WORKOUT_TYPES_CATALOG.easy;
    document.getElementById('nextWorkoutDateLabel').textContent = formatShortSpanishDate(nextWorkout.date);
    nextContainer.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeInfo.badgeClass}">${typeInfo.name}</span>
            <span class="text-xs text-slate-400">Zona sugerida: <strong class="text-slate-200">${nextWorkout.plannedZone || typeInfo.zone}</strong></span>
          </div>
          <h4 class="text-xl font-display font-bold text-white">${nextWorkout.title}</h4>
          <p class="text-xs text-slate-300"><strong class="text-emerald-400">¿Qué mejora hoy?:</strong> ${typeInfo.primaryBenefit}</p>
          ${nextWorkout.notes ? `<p class="text-xs text-slate-400 italic">"${nextWorkout.notes}"</p>` : ''}
        </div>
        <div class="flex sm:flex-col items-end justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 min-w-[205px]">
          <div class="text-right">
            <div class="text-2xl font-display font-bold text-white">${nextWorkout.plannedKm || 0} <span class="text-xs font-normal text-slate-400">km</span></div>
            <div class="text-xs text-sky-400">Ritmo obj: ${nextWorkout.plannedPace || '--:--'} /km</div>
          </div>
          <button onclick="openWorkoutModal('${nextWorkout.id}')" class="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 w-full justify-center">
            <i data-lucide="watch" class="w-3.5 h-3.5"></i> Registrar / Subir Reloj
          </button>
        </div>
      </div>
    `;
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
          <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-semibold text-amber-300">Ajuste recomendado detectado:</span>
            En <em>"${latest.title}"</em> (${formatShortSpanishDate(latest.date)}) se registró estado <strong>${latest.status}</strong> (${latest.actualKm || 0}km de ${latest.plannedKm || 0}km, RPE ${latest.actualRpe || '-'}/10). Sincroniza con Gemini para recalibrar las próximas cargas.
          </div>
        </div>
      `;
    } else {
      alertBox.innerHTML = `
        <div class="flex items-center gap-2 text-emerald-300">
          <i data-lucide="check-circle-2" class="w-4 h-4 shrink-0"></i>
          <span>Tus entrenamientos van alineados al plan. Puedes pedirle a Gemini la progresión de la próxima semana.</span>
        </div>
      `;
    }
  }

  renderDashboardCharts();
  if (window.lucide) lucide.createIcons();
}

function renderDashboardCharts() {
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
            label: 'Km Planeados (Gemini)',
            data: plannedData,
            backgroundColor: 'rgba(56, 189, 248, 0.35)',
            borderColor: '#38bdf8',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'Km Completados (Reloj)',
            data: actualData,
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            borderColor: '#10b981',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 11 } } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(51,65,85,0.2)' } },
          y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(51,65,85,0.3)' } }
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
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            yAxisID: 'yPace',
            tension: 0.3,
            fill: true,
            pointRadius: 4
          },
          {
            label: 'FC Media (ppm)',
            data: hrValues,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
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
          legend: { labels: { color: '#cbd5e1', font: { size: 11 } } },
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
          x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(51,65,85,0.2)' } },
          yPace: {
            type: 'linear',
            position: 'left',
            reverse: true,
            ticks: {
              color: '#38bdf8',
              font: { size: 10 },
              callback: (val) => decimalMinutesToPaceString(val)
            },
            grid: { color: 'rgba(51,65,85,0.3)' }
          },
          yHR: {
            type: 'linear',
            position: 'right',
            ticks: { color: '#f43f5e', font: { size: 10 } },
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
  if (delta === 0) {
    currentWeekOffset = 0;
  } else {
    currentWeekOffset += delta;
  }
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
        <div class="rounded-2xl p-3.5 border flex flex-col justify-between min-h-[210px] transition ${
          isToday
            ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
            : 'bg-slate-900/70 border-slate-800/90'
        }">
          <div>
            <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
              <div>
                <div class="text-xs font-bold ${isToday ? 'text-emerald-400' : 'text-slate-200'}">${dayNames[i]}</div>
                <div class="text-[11px] text-slate-400">${d.getDate()}/${d.getMonth() + 1}</div>
              </div>
              <button onclick="openWorkoutModal(null, '${iso}')" class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400" title="Agregar sesión este día">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <div class="space-y-2">
              ${
                dayWorkouts.length === 0
                  ? `<div class="text-[11px] text-slate-500 py-6 text-center italic">Sin sesión asignada</div>`
                  : dayWorkouts
                      .map((w) => {
                        const t = WORKOUT_TYPES_CATALOG[w.type] || WORKOUT_TYPES_CATALOG.easy;
                        const hasShots = Array.isArray(w.screenshots) && w.screenshots.length > 0;
                        const statusColor =
                          w.status === 'completed'
                            ? 'border-l-4 border-l-emerald-400'
                            : w.status === 'modified'
                            ? 'border-l-4 border-l-amber-400'
                            : w.status === 'skipped'
                            ? 'border-l-4 border-l-rose-500 opacity-60'
                            : 'border-l-4 border-l-sky-400';

                        return `
                          <div onclick="openWorkoutModal('${w.id}')" class="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 ${statusColor} cursor-pointer hover:border-slate-700 transition space-y-1">
                            <div class="flex items-center justify-between gap-1">
                              <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded border ${t.badgeClass}">${t.shortName}</span>
                              <span class="text-[10px] text-slate-400 flex items-center gap-1">
                                ${hasShots ? `<span class="text-indigo-400" title="${w.screenshots.length} captura(s)">📷${w.screenshots.length}</span>` : ''}
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
                            <div class="text-xs font-semibold text-white leading-snug line-clamp-2">${w.title}</div>
                            <div class="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                              <span>Plan: <strong class="text-slate-200">${w.plannedKm || 0}k</strong></span>
                              ${
                                w.status === 'completed' || w.status === 'modified'
                                  ? `<span class="text-emerald-400 font-semibold">Real: ${w.actualKm || 0}k (${w.actualPace || '--'})</span>`
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
    tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500">No hay entrenamientos con este filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((w) => {
      const t = WORKOUT_TYPES_CATALOG[w.type] || WORKOUT_TYPES_CATALOG.easy;
      const isDone = w.status === 'completed' || w.status === 'modified';
      const shots = Array.isArray(w.screenshots) ? w.screenshots : [];

      return `
        <tr class="hover:bg-slate-950/60 transition">
          <td class="py-3 px-3 font-medium text-slate-300 whitespace-nowrap">${formatShortSpanishDate(w.date)}</td>
          <td class="py-3 px-3">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${t.badgeClass}">${t.shortName}</span>
              <span class="font-semibold text-white">${w.title}</span>
            </div>
            ${w.watchAnalysis ? `<div class="text-[11px] text-indigo-300 mt-0.5">⌚ ${w.watchAnalysis}</div>` : ''}
            ${w.notes ? `<div class="text-[11px] text-slate-400 mt-0.5">${w.notes}</div>` : ''}
          </td>
          <td class="py-3 px-3 text-slate-300 whitespace-nowrap">
            ${w.plannedKm || 0} km <span class="text-slate-500">|</span> ${w.plannedPace || '--:--'}/km
          </td>
          <td class="py-3 px-3 whitespace-nowrap">
            ${
              isDone
                ? `<span class="text-emerald-400 font-semibold">${w.actualKm || 0} km</span> a <span class="text-white">${w.actualPace || '--:--'}/km</span>`
                : w.status === 'skipped'
                ? `<span class="text-rose-400">Omitido</span>`
                : `<span class="text-slate-500">Pendiente</span>`
            }
          </td>
          <td class="py-3 px-3 whitespace-nowrap">
            ${
              isDone
                ? `<span class="text-slate-200">${w.actualHR ? w.actualHR + ' ppm' : '--'}</span>
                   ${w.actualCadence ? `<span class="text-slate-400 text-[11px]">(${w.actualCadence} spm)</span>` : ''}
                   · <span class="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">RPE ${w.actualRpe || '-'}/10</span>`
                : '--'
            }
          </td>
          <td class="py-3 px-3 whitespace-nowrap">
            ${
              shots.length > 0
                ? `<button onclick="openWorkoutScreenshotGalleryById('${w.id}')" class="px-2 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium hover:bg-indigo-500/25">
                    📷 Ver (${shots.length})
                  </button>`
                : `<span class="text-slate-600 text-[11px]">Sin captura</span>`
            }
          </td>
          <td class="py-3 px-3 text-right whitespace-nowrap">
            <button onclick="openWorkoutModal('${w.id}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-medium transition">
              ${isDone ? 'Editar / Reloj' : 'Registrar / Reloj'}
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

// ============================================================================
// MODAL DE ENTRENAMIENTO (CREAR / EDITAR / SUBIR PANTALLAZOS DEL RELOJ)
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
      <span class="text-slate-300"><strong>Mejora principal:</strong> ${info.primaryBenefit}</span>
    </div>
    <span class="text-[11px] text-slate-400">Recuperación sugerida: ${info.recoveryHours}</span>
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
  if (existingIdx >= 0) {
    appState.workouts[existingIdx] = workoutObj;
  } else {
    appState.workouts.push(workoutObj);
  }

  saveState();
  closeWorkoutModal();
  renderDashboard();
  renderCalendarAndTable();
  showToast('Sesión y capturas del reloj guardadas correctamente');
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
// RENDERIZADO: PESTAÑA 3 — ¿QUÉ MEJORA CADA ENTRENAMIENTO? (FISIOLOGÍA VISUAL)
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
              ? 'bg-slate-800 border-emerald-400 text-white shadow-md'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }">
            <span class="text-xs font-semibold">${t.shortName}</span>
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
        <span class="text-xs text-slate-400">Zona: <strong class="text-white">${info.zone}</strong></span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">${info.description}</p>
      <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
        <div><strong class="text-emerald-400">Adaptación Clave:</strong> <span class="text-slate-200">${info.primaryBenefit}</span></div>
        <div><strong class="text-sky-400">Tiempo de Supercompensación:</strong> <span class="text-slate-200">${info.recoveryHours}</span></div>
      </div>
      <div class="space-y-2 pt-1">
        ${PHYSIOLOGY_DIMENSIONS.map((dim) => {
          const val = info.scores[dim.key];
          return `
            <div>
              <div class="flex justify-between text-[11px] mb-0.5">
                <span class="text-slate-300">${dim.label}</span>
                <span class="font-bold text-white">${val}/10</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300" style="width: ${val * 10}%; background-color: ${info.color}"></div>
              </div>
            </div>
          `;
        }).join('')}
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
            <span class="text-slate-300 font-medium">${dim.label}</span>
            <span class="text-emerald-400 font-bold">${score} / 10</span>
          </div>
          <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div class="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full" style="width: ${score * 10}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  updatePhysiologyRadar();
  renderIntensityPolarizationChart();
  renderPhysiologyMatrixTable();
}

function updatePhysiologyRadar() {
  const ctx = document.getElementById('physiologyRadarChart');
  if (!ctx) return;

  const primaryType = WORKOUT_TYPES_CATALOG[selectedPhysiologyType] || WORKOUT_TYPES_CATALOG.intervals;
  const compareKey = document.getElementById('compareWorkoutTypeSelect')?.value || 'user_accumulated';

  let secondaryLabel = 'Tu Perfil Acumulado (Sesiones Completadas)';
  let secondaryData = [];
  let secondaryColor = '#10b981';

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
          backgroundColor: `${primaryType.color}33`,
          borderColor: primaryType.color,
          pointBackgroundColor: primaryType.color,
          borderWidth: 2.5
        },
        {
          label: secondaryLabel,
          data: secondaryData,
          backgroundColor: 'rgba(16, 185, 129, 0.18)',
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
          grid: { color: 'rgba(148, 163, 184, 0.2)' },
          angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
          pointLabels: { color: '#e2e8f0', font: { size: 11, weight: '600' } }
        }
      },
      plugins: {
        legend: { labels: { color: '#f8fafc', font: { size: 12 } } }
      }
    }
  });
}

function renderIntensityPolarizationChart() {
  const ctx = document.getElementById('intensityDistributionChart');
  if (!ctx) return;

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
  if (badge) {
    badge.textContent = `Relación Actual: ${lowPct}% Suave / ${hardPct}% Intenso`;
  }

  if (intensityChartInstance) intensityChartInstance.destroy();
  intensityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Z1-Z2 Aeróbico Extensivo (Suave/Fondo)', 'Z3-Z4 Umbral / Tempo', 'Z5 VO2max / Series / Cuestas'],
      datasets: [
        {
          label: 'Kilómetros Acumulados + Planeados',
          data: [Number(lowKm.toFixed(1)), Number(modKm.toFixed(1)), Number(highKm.toFixed(1))],
          backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(244, 63, 94, 0.8)'],
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
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51,65,85,0.25)' } },
        y: { ticks: { color: '#e2e8f0', font: { size: 11 } }, grid: { display: false } }
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
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        : val >= 7
        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
        : val >= 5
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        : 'bg-slate-800 text-slate-400 border-slate-700';
    return `<span class="px-2 py-0.5 rounded border font-semibold ${color}">${val}/10</span>`;
  };

  tbody.innerHTML = keys
    .map((k) => {
      const t = WORKOUT_TYPES_CATALOG[k];
      return `
        <tr class="hover:bg-slate-950/60 cursor-pointer" onclick="selectPhysiologyWorkoutType('${k}')">
          <td class="py-3 px-3 font-semibold text-white">
            <span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background-color:${t.color}"></span>
            ${t.name}
          </td>
          <td class="py-3 px-3 text-slate-300">${t.zone}</td>
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
// RENDERIZADO: PESTAÑA 4 — OBJETIVOS Y PREDICCIÓN DE MARCAS (VDOT)
// ============================================================================

function renderGoalsTab() {
  const container = document.getElementById('goalsGridContainer');
  const vdot = getRunnerVDOT(appState.profile);
  document.getElementById('predictorVdotSpan').textContent = vdot.toFixed(1);

  if (container) {
    if (appState.goals.length === 0) {
      container.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">No tienes objetivos registrados. Crea tu primer reto arriba.</div>`;
    } else {
      container.innerHTML = appState.goals
        .map((g) => {
          const targetSec = parseTimeToSeconds(g.targetTime);
          const reqPace =
            targetSec > 0 && g.distanceKm > 0
              ? formatSecondsToTime(targetSec / g.distanceKm)
              : '--:--';
          const reqVdot = calculateVDOTFromRace(g.distanceKm * 1000, targetSec);
          const diffDays = Math.ceil(
            (new Date(g.date) - new Date()) / (1000 * 60 * 60 * 24)
          );
          const vdotGap = reqVdot ? (reqVdot - vdot).toFixed(1) : 0;

          return `
            <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    g.priority === 'A'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }">Prioridad ${g.priority}</span>
                  <span class="text-xs text-slate-400">${
                    diffDays >= 0 ? `En ${diffDays} días` : 'Finalizado'
                  } (${formatShortSpanishDate(g.date)})</span>
                </div>
                <h3 class="font-display font-bold text-lg text-white">${g.name}</h3>
                <p class="text-xs text-slate-400 mt-1">${g.notes || ''}</p>
              </div>

              <div class="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Distancia</div>
                  <div class="text-sm font-bold text-white">${Number(g.distanceKm).toFixed(1)} km</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Tiempo Meta</div>
                  <div class="text-sm font-bold text-emerald-400">${g.targetTime}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase">Ritmo Req.</div>
                  <div class="text-sm font-bold text-sky-400">${reqPace}/km</div>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <span class="text-slate-400">
                  VDOT requerido: <strong class="text-white">${reqVdot ? reqVdot.toFixed(1) : '--'}</strong>
                  ${
                    reqVdot
                      ? vdotGap > 0
                        ? `<span class="text-amber-400">(+${vdotGap} pts por ganar)</span>`
                        : `<span class="text-emerald-400">(¡Dentro de tu capacidad!)</span>`
                      : ''
                  }
                </span>
                <button onclick="deleteGoal('${g.id}')" class="text-rose-400 hover:underline text-xs">Eliminar</button>
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
      { label: '5K Ruta / Pista', meters: 5000, forceHours: false },
      { label: '10K Ruta', meters: 10000, forceHours: false },
      { label: 'Media Maratón (21.1K)', meters: 21097.5, forceHours: true },
      { label: 'Maratón (42.2K)', meters: 42195, forceHours: true }
    ];
    predGrid.innerHTML = standardRaces
      .map((r) => {
        const sec = predictRaceTimeSeconds(vdot, r.meters);
        const pace = formatSecondsToTime(sec / (r.meters / 1000));
        return `
          <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div class="text-xs text-slate-400">${r.label}</div>
            <div class="text-xl font-display font-bold text-white mt-1">${formatSecondsToTime(sec, r.forceHours)}</div>
            <div class="text-xs text-emerald-400 mt-0.5">Ritmo: ${pace} /km</div>
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
  if (val === 'custom') {
    wrapper.classList.remove('hidden');
  } else {
    wrapper.classList.add('hidden');
  }
}

function saveGoalFromModal() {
  const distSel = document.getElementById('gmDistanceSelect').value;
  const distanceKm =
    distSel === 'custom'
      ? Number(document.getElementById('gmCustomDistance').value) || 10
      : Number(distSel);

  const newGoal = {
    id: `goal-${Date.now()}`,
    name: document.getElementById('gmName').value.trim(),
    distanceKm,
    date: document.getElementById('gmDate').value,
    targetTime: document.getElementById('gmTargetTime').value.trim(),
    priority: document.getElementById('gmPriority').value,
    notes: document.getElementById('gmNotes').value.trim()
  };

  appState.goals.push(newGoal);
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
// RENDERIZADO: PESTAÑA 5 — PERFIL FISIOLÓGICO Y ZONAS
// ============================================================================

function renderProfileTab() {
  const p = appState.profile;
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
        <div class="p-3.5 rounded-xl border ${z.color} space-y-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${z.dot}"></span>
              <span class="font-display font-bold text-sm text-white">${z.zone} — ${z.name}</span>
            </div>
            <span class="text-xs font-bold">${z.hrRange}</span>
          </div>
          <div class="flex items-center justify-between text-xs pt-0.5">
            <span class="text-slate-400">${z.desc}</span>
            <span class="font-mono font-semibold text-white">Ritmo: ${z.paceRange}</span>
          </div>
        </div>
      `
      )
      .join('');
  }
}

function saveProfileForm() {
  appState.profile = {
    name: document.getElementById('profName').value.trim(),
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
  updateHeaderBadges();
  showToast('Perfil fisiológico y zonas de entrenamiento actualizados');
}

// ============================================================================
// PESTAÑA 6: CENTRO GEMINI AI (GENERACIÓN DE PROMPT, API DIRECTA E IMPORTACIÓN)
// ============================================================================

function saveGeminiApiKey() {
  const key = document.getElementById('geminiApiKeyInput')?.value.trim() || '';
  localStorage.setItem(GEMINI_KEY_STORAGE, key);
  showToast('API Key guardada localmente en tu navegador');
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
    <p class="text-slate-200 font-medium">${fb.summary || 'Sin análisis aún.'}</p>
    ${
      fb.recommendations && fb.recommendations.length > 0
        ? `<ul class="list-disc pl-4 space-y-1 text-emerald-300 pt-1">
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
  const targetStartISO =
    mode === 'new_week' ? formatDateISO(mondayNext) : getLocalISODate(0);

  const actionInstruction =
    mode === 'new_week'
      ? `Diseña la planificación completa de 7 días para la semana que inicia el ${targetStartISO} (Lunes a Domingo), ajustando las cargas según cómo respondí en mis entrenamientos recientes y los datos de mi reloj.`
      : `Analiza mis sesiones recientes completadas/modificadas vs las planeadas (incluyendo la telemetría extraída de las capturas de mi reloj, RPE, pulsaciones y notas) y REAJUSTA mis entrenamientos pendientes a partir de hoy (${targetStartISO}) para optimizar mis adaptaciones y evitar sobreentrenamiento.`;

  return `Actúa como mi Entrenador Fisiológico de Running de Élite. Aquí está mi estado actual exportado desde mi app RunPulse AI:

=== 1. PERFIL FISIOLÓGICO DEL CORREDOR ===
- Nombre: ${p.name} | Edad: ${p.age} años | Peso: ${p.weight} kg | Estatura: ${p.height} cm
- FC Reposo: ${p.restHR} ppm | FC Máx: ${p.maxHR} ppm | FC Umbral: ${p.lthr} ppm | VDOT Estimado: ${vdot}
- Nivel: ${p.experience} | Días disponibles/semana: ${p.daysAvailable} | Día Tirada Larga: ${p.longRunDay}
- Mejores Marcas: 5K (${p.pr5k || 'N/A'}), 10K (${p.pr10k || 'N/A'}), 21K (${p.pr21k || 'N/A'}), 42K (${p.pr42k || 'N/A'})
- Terreno: ${p.terrain}
- Historial de molestias/lesiones a cuidar: ${p.injuries || 'Ninguna'}

=== 2. ZONAS ACTUALES DE ENTRENAMIENTO ===
${zones.map((z) => `- ${z.zone} (${z.name}): ${z.hrRange} | Ritmo: ${z.paceRange}`).join('\n')}

=== 3. OBJETIVOS DE CARRERA ===
${appState.goals.map((g) => `- [Prioridad ${g.priority}] ${g.name}: ${g.distanceKm} km el ${g.date} -> Tiempo Meta: ${g.targetTime} (${g.notes})`).join('\n')}

=== 4. BITÁCORA RECIENTE Y TELEMETRÍA DEL RELOJ (PLANEADO VS REALIZADO) ===
${recentWorkouts
  .map(
    (w) =>
      `- [${w.date}] (${w.type.toUpperCase()}) "${w.title}" | Estado: ${w.status.toUpperCase()} | Planeado: ${w.plannedKm}km a ${w.plannedPace}/km | Realizado: ${
        w.status === 'completed' || w.status === 'modified'
          ? `${w.actualKm}km en ${w.actualMin}min (${w.actualPace}/km), FC Media: ${w.actualHR}ppm (Máx: ${w.actualMaxHR || '-'}ppm), Cadencia: ${w.actualCadence || '-'}spm, Desnivel: +${w.actualElevation || 0}m, RPE: ${w.actualRpe}/10`
          : 'Pendiente'
      }${w.watchAnalysis ? ` | Telemetría/Splits del Reloj: ${w.watchAnalysis}` : ''} | Notas: ${w.notes || '-'}`
  )
  .join('\n')}

${customNote ? `=== NOTA ESPECIAL DE HOY ===\n"${customNote}"\n` : ''}
=== TAREA SOLICITADA ===
${actionInstruction}

IMPORTANTE: Devuelve tu respuesta incluyendo un bloque JSON válido con exactamente esta estructura para que mi aplicación RunPulse AI actualice mi calendario automáticamente (los valores de "type" deben ser uno de: "easy", "tempo", "intervals", "long", "fartlek", "hills", "strength", "race", "rest"):

\`\`\`json
{
  "coachSummary": "Explicación fisiológica breve de cómo me viste según los datos de mi reloj y por qué hiciste estos ajustes...",
  "recommendations": [
    "Consejo clave 1",
    "Consejo clave 2"
  ],
  "workouts": [
    {
      "date": "${targetStartISO}",
      "type": "easy",
      "title": "Rodaje Aeróbico Z2 Regenerativo",
      "plannedKm": 8.0,
      "plannedMin": 42,
      "plannedPace": "05:15",
      "plannedZone": "Z2 (140-154 ppm)",
      "notes": "Explicación de la sesión y qué mejora fisiológicamente"
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
    showToast('Prompt copiado al portapapeles. Pégalo en Gemini.');
  });
}

// Conexión Directa con Gemini API desde el navegador (con fallback automático de modelos)
async function callGeminiDirectAPI(mode = 'adjust') {
  const apiKey = document.getElementById('geminiApiKeyInput')?.value.trim();
  const preferredModel = document.getElementById('geminiModelSelect')?.value || 'gemini-3-flash-preview';
  const statusEl = document.getElementById('geminiApiStatusMsg');

  if (!apiKey) {
    statusEl.className = 'text-xs p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 block';
    statusEl.textContent = 'Por favor ingresa tu Gemini API Key arriba, o usa la Opción B (Copiar y Pegar Prompt sin API Key).';
    return;
  }

  localStorage.setItem(GEMINI_KEY_STORAGE, apiKey);
  const prompt = buildRunnerContextPrompt(mode);
  generateGeminiPrompt(mode);

  const fallbackChain = [
    preferredModel,
    'gemini-3-flash-preview',
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash'
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastError = null;

  for (const model of fallbackChain) {
    statusEl.className = 'text-xs p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 block';
    statusEl.textContent = `Analizando tu progreso fisiológico y telemetría del reloj con ${model}...`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${response.status}`;
        lastError = new Error(errMsg);
        if (response.status === 404 || response.status === 400 || response.status === 429 || errMsg.includes('no longer available')) {
          continue;
        }
        throw lastError;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) throw new Error('Respuesta vacía de Gemini API.');

      document.getElementById('geminiImportTextarea').value = rawText;
      const count = applyParsedGeminiPlan(rawText);

      const selectEl = document.getElementById('geminiModelSelect');
      if (selectEl && selectEl.value !== model) {
        selectEl.value = model;
      }

      statusEl.className = 'text-xs p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 block';
      statusEl.textContent = `¡Éxito (${model})! Gemini reajustó e importó ${count} entrenamientos a tu calendario.`;
      return;
    } catch (err) {
      lastError = err;
    }
  }

  statusEl.className = 'text-xs p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 block';
  statusEl.textContent = `Error al conectar con Gemini API: ${lastError ? lastError.message : 'Error desconocido'}`;
}

function importFromGeminiText() {
  const raw = document.getElementById('geminiImportTextarea')?.value.trim();
  if (!raw) {
    showToast('Pega primero la respuesta de Gemini en el cuadro de texto.');
    return;
  }
  try {
    const count = applyParsedGeminiPlan(raw);
    showToast(`¡Se aplicaron ${count} entrenamientos de Gemini al calendario!`);
  } catch (err) {
    alert(`No se pudo interpretar el formato: ${err.message}`);
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
    throw new Error(
      'Asegúrate de que la respuesta de Gemini contenga el bloque JSON con la lista "workouts". Usa el botón Copiar Prompt de la izquierda para que Gemini responda con el formato exacto.'
    );
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
// EXPORTAR / IMPORTAR RESPALDO COMPLETO JSON
// ============================================================================

function exportAllData() {
  const dataStr = JSON.stringify(appState, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `runpulse-respaldo-${getLocalISODate(0)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Archivo de respaldo descargado');
}

function importAllData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && imported.profile && Array.isArray(imported.workouts)) {
        appState = imported;
        saveState();
        renderDashboard();
        renderCalendarAndTable();
        renderProfileTab();
        renderGoalsTab();
        showToast('Respaldo restaurado con éxito');
      } else {
        alert('El archivo JSON no tiene la estructura válida de RunPulse.');
      }
    } catch (err) {
      alert('Error al leer el archivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function loadDemoDataConfirm() {
  if (confirm('¿Restaurar los datos de demostración? Esto reemplazará los datos actuales.')) {
    appState = createDefaultState();
    saveState();
    switchTab('dashboard');
    showToast('Datos de ejemplo cargados');
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderDashboard();
  renderProfileTab();
  renderGoalsTab();
  renderCoachFeedbackBox();
  if (window.lucide) lucide.createIcons();
});
