/**
 * Calcula totales de asistencias de manera optimizada
 * @param {Array} rows - Array de filas de asistencias
 * @returns {Object} Resumen con horas calculadas
 */
export function calcularResumenAsistencias(rows) {
  // Validación de entrada
  if (!Array.isArray(rows)) {
    console.warn('calcularResumenAsistencias: rows no es un array válido');
    return { horas_reales: 0, horas_cumplidas: 0, horas_extras: 0, horas_faltantes: 0 };
  }

  // Filtrar elementos null/undefined antes del procesamiento
  const filasValidas = rows.filter(row => row && typeof row === 'object');
  
  // Inicialización optimizada
  let horas_cumplidas = 0;
  let horas_extras = 0;
  let horas_faltantes = 0;
  
  // Obtener horas objetivo una sola vez
  const horas_reales = filasValidas.length > 0 ? Number(filasValidas[0].horas_objetivo) || 0 : 0;

  // Procesamiento optimizado con for loop (más rápido que forEach)
  for (let i = 0; i < filasValidas.length; i++) {
    const row = filasValidas[i];
    
    // Validación adicional de seguridad
    if (!row || typeof row !== 'object') {
      console.warn('Fila inválida encontrada en calcularResumenAsistencias:', row);
      continue;
    }
    
    const objetivo = horas_reales;
    const entrada = row.hora_entrada;
    const salida = row.hora_salida;

    // Solo calcular si hay entrada y salida válidas
    if (!entrada || !salida || entrada === '00:00:00' || salida === '00:00:00') {
      horas_faltantes += objetivo;
      continue;
    }

    // Cálculo optimizado de horas trabajadas
    const [h1, m1, s1 = 0] = entrada.split(':').map(Number);
    const [h2, m2, s2 = 0] = salida.split(':').map(Number);
    
    const inicioSegundos = h1 * 3600 + m1 * 60 + s1;
    const finSegundos = h2 * 3600 + m2 * 60 + s2;
    
    let cumplidas = (finSegundos - inicioSegundos) / 3600;
    
    // Validación para evitar negativos
    if (cumplidas < 0) {
      horas_faltantes += objetivo;
      continue;
    }

    horas_cumplidas += cumplidas;

    // Cálculo directo de extras o faltantes
    if (cumplidas > objetivo) {
      horas_extras += cumplidas - objetivo;
    } else {
      horas_faltantes += objetivo - cumplidas;
    }
  }

  // Retorno optimizado con redondeo eficiente
  return {
    horas_reales: Math.round(horas_reales * 100) / 100,
    horas_cumplidas: Math.round(horas_cumplidas * 100) / 100,
    horas_extras: Math.round(horas_extras * 100) / 100,
    horas_faltantes: Math.round(horas_faltantes * 100) / 100,
  };
}
