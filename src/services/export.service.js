import pool from '../config/db.js';
import ExcelJS from 'exceljs';

// Servicio para exportar asistencias de un trabajador
export const exportarAsistenciasPorTrabajador = async (id, fecha_inicio, fecha_fin) => {
  if (!id || !fecha_inicio || !fecha_fin) {
    return { error: 'Debe proporcionar el ID del trabajador, la fecha de inicio y la fecha de fin.', code: 400 };
  }

  const [rows] = await pool.query(`
    SELECT 
      t.dni,
      t.nombre AS trabajador,
      sa.nombre AS subalmacen,
      al.nombre AS almacen,
      pf.fecha,
      h.horas_objetivo,
      a.hora_entrada AS hora_real_entrada,
      a.hora_salida AS hora_real_salida,
      a.justificacion,
      TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida) AS minutos_trabajados
    FROM asistencias a
    JOIN trabajadores t ON a.trabajador_id = t.id
    JOIN subalmacenes sa ON a.subalmacen_id = sa.id
    JOIN almacenes al ON sa.almacen_id = al.id
    JOIN programacion_fechas pf ON a.programacion_fecha_id = pf.id
    JOIN horarios h ON h.trabajador_id = t.id AND h.fecha_de_ingreso = pf.fecha
    WHERE t.id = ? AND pf.fecha BETWEEN ? AND ?
    ORDER BY pf.fecha ASC
  `, [id, fecha_inicio, fecha_fin]);

  if (rows.length === 0) {
    return { error: 'No se encontraron asistencias para el trabajador en el rango de fechas indicado.', code: 404 };
  }

  // Procesar los datos y crear el archivo Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Resumen Asistencias');

  // Estilo base
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '002060' }
  };
  const borderStyle = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // Calcular totales
  let total_objetivo = 0;
  let total_cumplidas = 0;
  let total_extras = 0;
  let total_faltantes = 0;

  const processedRows = rows.map(row => {
    const horas_objetivo = Number(row.horas_objetivo);
    const horas_cumplidas = row.minutos_trabajados / 60;
    const horas_extras = Math.max(0, horas_cumplidas - horas_objetivo);
    const horas_faltantes = Math.max(0, horas_objetivo - horas_cumplidas);

    total_objetivo += horas_objetivo;
    total_cumplidas += horas_cumplidas;
    total_extras += horas_extras;
    total_faltantes += horas_faltantes;

    return {
      ...row,
      horas_cumplidas: horas_cumplidas.toFixed(2),
      horas_extras: horas_extras.toFixed(2),
      horas_faltantes: horas_faltantes.toFixed(2)
    };
  });

  // Encabezado resumen
  const resumenHeader = ['Horas Reales', 'Horas Cumplidas', 'Horas Extras', 'Horas Faltantes'];
  const resumenValues = [
    total_objetivo.toFixed(2),
    total_cumplidas.toFixed(2),
    total_extras.toFixed(2),
    total_faltantes.toFixed(2)
  ];

  worksheet.getRow(1).values = resumenHeader;
  worksheet.getRow(2).values = resumenValues;

  [1, 2].forEach(rowNum => {
    worksheet.getRow(rowNum).eachCell(cell => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = borderStyle;
      if (rowNum === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
        cell.font = { bold: true };
      }
    });
  });

  // Encabezado de la tabla
  const startRow = 5;
  const headers = [
    'Fecha', 'DNI', 'Nombre', 'Subalmacén', 'Almacén',
    'Hora Entrada', 'Hora Salida', 'Justificación'
  ];
  worksheet.getRow(startRow).values = headers;
  worksheet.getRow(startRow).eachCell(cell => {
    cell.fill = headerFill;
    cell.font = { color: { argb: 'FFFFFF' }, bold: true };
    cell.alignment = { horizontal: 'center' };
    cell.border = borderStyle;
  });

  // Establecer anchos de columnas
  const columnWidths = [18, 20, 35, 20, 20, 18, 18, 25]; // Aumenté la tercera columna (Nombre) de 30 a 35
  columnWidths.forEach((width, i) => {
    worksheet.getColumn(i + 1).width = width;
  });

  // Filas de datos
  processedRows.forEach((row, index) => {
    const fila = startRow + 1 + index;
    const data = [
      row.fecha,
      row.dni,
      row.trabajador,
      row.subalmacen,
      row.almacen,
      row.hora_real_entrada,
      row.hora_real_salida,
      row.justificacion
    ];

    worksheet.getRow(fila).values = data;
    worksheet.getRow(fila).eachCell(cell => {
      cell.alignment = { horizontal: 'center' };
      cell.border = borderStyle;
    });
  });

  // Devuelve el buffer listo para enviar al controller
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

// Servicio para exportar fechas seleccionadas
export const exportarFechasSeleccionadas = async (fechasIds, subalmacenId) => {
  if (!fechasIds || fechasIds.length === 0) {
    return { error: 'No se proporcionaron fechas para exportar.', code: 400 };
  }

  try {
    // Obtener información del subalmacén y almacén con las nuevas columnas
    let infoSubalmacen = null;
    if (subalmacenId && subalmacenId !== 'undefined') {
      const [subalmacenRows] = await pool.query(`
        SELECT sa.nombre AS subalmacen, al.nombre AS almacen, sa.refrigerio, sa.jornada
        FROM subalmacenes sa
        LEFT JOIN almacenes al ON sa.almacen_id = al.id
        WHERE sa.id = ?
      `, [subalmacenId]);
      
      if (subalmacenRows.length > 0) {
        infoSubalmacen = subalmacenRows[0];
      }
    }

    // Obtener las fechas y sus asistencias
    const placeholders = fechasIds.map(() => '?').join(',');
    let query = `
      SELECT 
        pf.id as idfecha,
        pf.fecha,
        t.nombre AS trabajador_nombre,
        t.dni AS trabajador_dni,
        a.hora_entrada,
        a.hora_salida,
        a.justificacion,
        sa.nombre AS subalmacen,
        al.nombre AS almacen
      FROM programacion_fechas pf
      LEFT JOIN asistencias a ON a.programacion_fecha_id = pf.id
      LEFT JOIN trabajadores t ON a.trabajador_id = t.id
      LEFT JOIN subalmacenes sa ON pf.subalmacen_id = sa.id
      LEFT JOIN almacenes al ON sa.almacen_id = al.id
      WHERE pf.id IN (${placeholders})
    `;

    const queryParams = [...fechasIds];

    if (subalmacenId && subalmacenId !== 'undefined') {
      query += ' AND pf.subalmacen_id = ?';
      queryParams.push(subalmacenId);
    }

    query += ' ORDER BY pf.fecha ASC, t.nombre ASC';

    const [rows] = await pool.query(query, queryParams);

    // Crear el archivo Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencias por Fechas');

    // Estilos
    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E79' }
    };

    const borderStyle = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Configurar ancho de columnas para incluir las nuevas columnas
    worksheet.columns = [
      { width: 15 }, // A - FECHA
      { width: 35 }, // B - NOMBRE (aumentado de 25 a 35)
      { width: 12, style: { numFmt: '@' } }, // C - DNI (formato texto)
      { width: 18 }, // D - HORA DE ENTRADA
      { width: 18 }, // E - HORA DE SALIDA
      { width: 15 }, // F - REFRIGERIO
      { width: 15 }, // G - JORNADA
      { width: 18 }, // H - HORAS TRABAJADAS
      { width: 15 }, // I - HORAS EXTRA
      { width: 15 }, // J - ASISTIÓ
      { width: 25 }  // K - JUSTIFICACIÓN
    ];

    // Fila 1: ALAMACEN:
    worksheet.getCell('A1').value = 'ALAMACEN:';
    worksheet.getCell('A1').font = { bold: true, size: 12 };
    worksheet.getCell('B1').value = infoSubalmacen?.almacen || 'No especificado';
    worksheet.getCell('B1').font = { size: 12 };

    // Fila 2: SUBALMACEN:
    worksheet.getCell('A2').value = 'SUBALMACEN:';
    worksheet.getCell('A2').font = { bold: true, size: 12 };
    worksheet.getCell('B2').value = infoSubalmacen?.subalmacen || 'No especificado';
    worksheet.getCell('B2').font = { size: 12 };

    // Fila 3: REFRIGERIO:
    worksheet.getCell('A3').value = 'REFRIGERIO:';
    worksheet.getCell('A3').font = { bold: true, size: 12 };
    worksheet.getCell('B3').value = infoSubalmacen?.refrigerio || 'No especificado';
    worksheet.getCell('B3').font = { size: 12 };

    // Fila 4: JORNADA:
    worksheet.getCell('A4').value = 'JORNADA:';
    worksheet.getCell('A4').font = { bold: true, size: 12 };
    worksheet.getCell('B4').value = infoSubalmacen?.jornada || 'No especificado';
    worksheet.getCell('B4').font = { size: 12 };

    // Fila 5: Vacía para separación
    worksheet.getRow(5).height = 5;

    // Fila 6: Encabezados de la tabla
    const headers = ['FECHA', 'NOMBRE', 'DNI', 'HORA DE ENTRADA', 'HORA DE SALIDA', 'REFRIGERIO', 'JORNADA', 'HORAS TRABAJADAS', 'HORAS EXTRA', 'ASISTIÓ', 'JUSTIFICACIÓN'];
    
    worksheet.getRow(6).values = headers;
    worksheet.getRow(6).eachCell(cell => {
      cell.fill = headerFill;
      cell.font = { color: { argb: 'FFFFFF' }, bold: true, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = borderStyle;
    });

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
      if (!fecha) return '';
      try {
        return new Date(fecha).toLocaleDateString('es-ES');
      } catch (error) {
        return fecha;
      }
    };

    // Función para formatear hora
    const formatearHora = (hora) => {
      if (!hora) return '';
      if (typeof hora === 'string' && hora.includes(':')) {
        return hora;
      }
      try {
        return new Date(hora).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } catch (error) {
        return hora;
      }
    };

    // Función para convertir tiempo HH:MM:SS a minutos
    const tiempoAMinutos = (tiempo) => {
      if (!tiempo) return 0;
      const partes = tiempo.split(':');
      return parseInt(partes[0]) * 60 + parseInt(partes[1]) + (partes[2] ? parseInt(partes[2]) / 60 : 0);
    };

    // Función para convertir minutos a formato HH:MM:SS
    const minutosATiempo = (minutos) => {
      if (minutos < 0) {
        const horasAbs = Math.floor(Math.abs(minutos) / 60);
        const minsAbs = Math.abs(minutos) % 60;
        return `-${horasAbs.toString().padStart(2, '0')}:${minsAbs.toString().padStart(2, '0')}:00`;
      }
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    };

    // Función para calcular horas trabajadas
    const calcularHorasTrabajadas = (horaEntrada, horaSalida, refrigerio) => {
      if (!horaEntrada || !horaSalida) return 0;
      
      try {
        // Convertir horas a minutos
        const entrada = tiempoAMinutos(horaEntrada);
        const salida = tiempoAMinutos(horaSalida);
        const minutosRefrigerio = refrigerio ? tiempoAMinutos(refrigerio) : 0;
        
        // Calcular minutos trabajados (sin refrigerio)
        let minutosTrabajados = salida - entrada - minutosRefrigerio;
        
        // Retornar el valor sin modificar (puede ser negativo)
        return minutosTrabajados;
      } catch (error) {
        return 0;
      }
    };

    // Función para calcular horas extra o horas que debe
    const calcularHorasExtra = (minutosTrabajados, jornada) => {
      if (!jornada) return 0;
      const minutosJornada = tiempoAMinutos(jornada);
      // Si trabajó más de la jornada, son horas extra (positivo)
      // Si trabajó menos de la jornada, son horas que debe (negativo)
      return minutosTrabajados - minutosJornada;
    };

    // Función para determinar asistencia basada en horas registradas
    const determinarAsistencia = (horaEntrada, horaSalida, minutosTrabajados) => {
      // Si no tiene hora de entrada o salida, no asistió
      if (!horaEntrada || !horaSalida) return 'F';
      
      // Si trabajó al menos algo (incluso si debe horas), asistió
      if (minutosTrabajados > 0) return 'A';
      
      // Si no trabajó ninguna hora (0 o negativo), no asistió
      return 'F';
    };

    // Agregar datos de asistencias
    let filaActual = 7;
    
    if (rows.length === 0) {
      // Si no hay asistencias, mostrar solo las fechas
      const fechasUnicas = fechasIds;
      for (const fechaId of fechasUnicas) {
        const [fechaInfo] = await pool.query('SELECT fecha FROM programacion_fechas WHERE id = ?', [fechaId]);
        if (fechaInfo.length > 0) {
          const data = [
            formatearFecha(fechaInfo[0].fecha),
            'Sin asistencias registradas',
            '', // DNI vacío para fechas sin asistencias
            '',
            '',
            infoSubalmacen?.refrigerio || '',
            infoSubalmacen?.jornada || '',
            '',
            '',
            'F',
            'No hay registros'
          ];

          worksheet.getRow(filaActual).values = data;
          worksheet.getRow(filaActual).eachCell((cell, colNumber) => {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = borderStyle;
            
            // Formato especial para columna DNI
            if (colNumber === 3) { // Columna C - DNI
              cell.numFmt = '@'; // Formato texto
            }
            
            if (filaActual % 2 === 0) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F8F9FA' }
              };
            }
          });
          filaActual++;
        }
      }
    } else {
      // Agregar asistencias existentes
      rows.forEach((row, index) => {
        // Calcular horas trabajadas y extra
        const minutosTrabajados = calcularHorasTrabajadas(row.hora_entrada, row.hora_salida, infoSubalmacen?.refrigerio);
        const minutosExtra = calcularHorasExtra(minutosTrabajados, infoSubalmacen?.jornada);
        const asistencia = determinarAsistencia(row.hora_entrada, row.hora_salida, minutosTrabajados);

        const data = [
          formatearFecha(row.fecha),
          row.trabajador_nombre || 'Sin asignar',
          `'${row.trabajador_dni || ''}`, // Agregar comilla simple para forzar formato texto
          formatearHora(row.hora_entrada),
          formatearHora(row.hora_salida),
          infoSubalmacen?.refrigerio || '',
          infoSubalmacen?.jornada || '',
          minutosATiempo(minutosTrabajados),
          minutosATiempo(minutosExtra),
          asistencia,
          row.justificacion || ''
        ];

        worksheet.getRow(filaActual).values = data;
        worksheet.getRow(filaActual).eachCell((cell, colNumber) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = borderStyle;
          
          // Formato especial para columna DNI
          if (colNumber === 3) { // Columna C - DNI
            cell.numFmt = '@'; // Formato texto
          }
          
          // Color especial para horas trabajadas negativas o cero
          if (colNumber === 8 && minutosTrabajados <= 0) { // Columna H - Horas Trabajadas
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE6E6' } // Rojo claro para horas trabajadas negativas o cero
            };
            cell.font = { color: { argb: 'CC0000' } }; // Texto rojo
          }
          // Color especial para horas que debe (horas extra negativas)
          else if (colNumber === 9 && minutosExtra < 0) { // Columna I - Horas Extra (debe horas)
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE6E6' } // Rojo claro para horas que debe
            };
            cell.font = { color: { argb: 'CC0000' } }; // Texto rojo
          }
          // Color verde para horas extra positivas
          else if (colNumber === 9 && minutosExtra > 0) { // Columna I - Horas Extra positivas
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'E6F7E6' } // Verde claro para horas extra
            };
            cell.font = { color: { argb: '006600' } }; // Texto verde
          }
          // Color para asistencia falsa
          else if (colNumber === 10 && asistencia === 'F') { // Columna J - Asistió
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE6E6' } // Rojo claro
            };
            cell.font = { color: { argb: 'CC0000' } }; // Texto rojo
          }
          // Alternar colores de fila
          else if (index % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F8F9FA' }
            };
          }
        });
        filaActual++;
      });
    }

    // Agregar información de resumen al final
    filaActual += 2;
    worksheet.getCell(`A${filaActual}`).value = 'Total de registros:';
    worksheet.getCell(`A${filaActual}`).font = { bold: true };
    worksheet.getCell(`B${filaActual}`).value = rows.length;
    worksheet.getCell(`B${filaActual}`).font = { bold: true };

    worksheet.getCell(`A${filaActual + 1}`).value = 'Fecha de exportación:';
    worksheet.getCell(`A${filaActual + 1}`).font = { bold: true };
    worksheet.getCell(`B${filaActual + 1}`).value = new Date().toLocaleDateString('es-ES');

    // Devolver el buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;

  } catch (error) {
    console.error('Error en exportarFechasSeleccionadas:', error);
    return { error: 'Error interno al generar el Excel de fechas.', code: 500 };
  }
};
