/**
 * Obtiene el color de fondo según el estado de disponibilidad
 * @param {string} status - Estado de disponibilidad ('free', 'partial', 'occupied', 'unknown')
 * @returns {string} Clase CSS para el color de fondo
 */
export const getStatusColor = (status) => {
    switch (status) {
        case 'free':
            return 'bg-green-500';
        case 'partial':
            return 'bg-yellow-500';
        case 'occupied':
            return 'bg-red-500';
        default:
            return 'bg-gray-300';
    }
};

/**
 * Obtiene el texto descriptivo según el estado y porcentaje de ocupación
 * @param {string} status - Estado de disponibilidad
 * @param {number} percentage - Porcentaje de ocupación
 * @returns {string} Texto descriptivo
 */
export const getStatusText = (status, percentage, reservas) => {
    if (status === 'partial') {
        const reservasActivas = reservas.filter(r => 
            r.estado === 'confirmada' || r.estado === 'pendiente'
        ).length;
        return `${Math.round(percentage)}% ocupado (${reservasActivas} reservas)`;
    }
    
    return {
        'free': 'Disponible',
        'occupied': 'Completamente ocupado',
        'unavailable': 'No disponible temporalmente'
    }[status] || 'Estado desconocido';
};

/**
 * Lista de días de la semana en español
 * @type {Array<string>}
 */
export const WEEKDAYS = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
];

/**
 * Constantes para modos de vista
 * @type {Object}
 */
export const VIEW_MODES = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month'
};

/**
 * Formatea una fecha en formato legible en español
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDateToSpanish = (date) => {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
};