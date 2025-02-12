import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'react-toastify';
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import TextareaInput from "@/Components/TextareaInput";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import HourSelectInput from "@/Components/HourSelectInput";

export default function ReservaModal({
    reserva,
    onClose,
    users,
    espacios,
    escritorios
}) {
    const { data, setData, patch, processing, errors } = useForm({
        user_id: reserva.user_id,
        espacio_id: reserva.espacio_id,
        escritorio_id: reserva.escritorio_id,
        fecha_inicio: reserva.fecha_inicio.split("T")[0],
        fecha_fin: reserva.fecha_fin.split("T")[0],
        hora_inicio: reserva.hora_inicio || '',
        hora_fin: reserva.hora_fin || '',
        tipo_reserva: reserva.tipo_reserva,
        motivo: reserva.motivo || '',
        estado: reserva.estado || 'pendiente',
    });

    const [showEscritorio, setShowEscritorio] = useState(false);
    const [escritoriosLibres, setEscritoriosLibres] = useState([]);
    const [showHoras, setShowHoras] = useState(reserva.tipo_reserva === 'hora' || reserva.tipo_reserva === 'medio_dia');
    const [fechaFinCalculada, setFechaFinCalculada] = useState('');
    const [horariosDisponibles] = useState([
        { inicio: '08:00', fin: '14:00', label: 'Mañana (08:00 - 14:00)' },
        { inicio: '14:00', fin: '20:00', label: 'Tarde (14:00 - 20:00)' }
    ]);

    useEffect(() => {
        const selectedEspacio = espacios.find(espacio => espacio.id === Number(data.espacio_id));
        if (selectedEspacio && selectedEspacio.tipo === 'coworking') {
            setShowEscritorio(true);
            const libres = escritorios.filter(escritorio => 
                escritorio.espacio_id === Number(data.espacio_id) && escritorio.disponible
            );
            setEscritoriosLibres(libres);
        } else {
            setShowEscritorio(false);
            setData('escritorio_id', null);
        }
    }, [data.espacio_id, escritorios, espacios]);

    useEffect(() => {
        setShowHoras(data.tipo_reserva === 'hora' || data.tipo_reserva === 'medio_dia');

        if (data.fecha_inicio) {
            let fechaFin = '';
            const fecha = new Date(data.fecha_inicio);

            switch (data.tipo_reserva) {
                case 'dia_completo':
                    fechaFin = fecha.toISOString().split('T')[0];
                    break;
                case 'semana':
                    fecha.setDate(fecha.getDate() + 6);
                    fechaFin = fecha.toISOString().split('T')[0];
                    break;
                case 'mes':
                    fecha.setMonth(fecha.getMonth() + 1);
                    fecha.setDate(fecha.getDate() - 1);
                    fechaFin = fecha.toISOString().split('T')[0];
                    break;
                default:
                    fechaFin = fecha.toISOString().split('T')[0];
            }
            
            setData('fecha_fin', fechaFin);
            setFechaFinCalculada(fechaFin);
        }
    }, [data.tipo_reserva, data.fecha_inicio]);

    useEffect(() => {
        if (data.tipo_reserva === 'medio_dia' && data.hora_inicio) {
            const horario = horariosDisponibles.find(h => h.inicio === data.hora_inicio);
            if (horario) {
                setData('hora_fin', horario.fin);
            }
        }
    }, [data.hora_inicio, data.tipo_reserva]);

    






    const submit = (e) => {
        e.preventDefault();
    
        // Determinar si solo cambió el estado/motivo
        const isStatusUpdate = 
            data.user_id === reserva.user_id &&
            data.espacio_id === reserva.espacio_id &&
            data.escritorio_id === reserva.escritorio_id &&
            data.fecha_inicio === reserva.fecha_inicio.split("T")[0] &&
            data.tipo_reserva === reserva.tipo_reserva;
    
        // Preparar datos según el tipo de actualización
        const updateData = new FormData();
        updateData.append('_method', 'PATCH');
    
        if (isStatusUpdate) {
            updateData.append('is_status_update', 'true');
            updateData.append('estado', data.estado);
            updateData.append('motivo', data.motivo || '');
        } else {
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    updateData.append(key, data[key]);
                }
            });
        }
    
        axios.post(route('superadmin.reservas.update', reserva.id), updateData)
            .then(response => {
                toast.success(response.data.message, {
                    position: "top-right",
                    autoClose: 3000
                });
                onClose();
                window.location.reload();
            })
            .catch(error => {
                const mensaje = error.response?.data?.errors?.general 
                    || Object.values(error.response?.data?.errors || {})[0]
                    || 'Error al actualizar la reserva';
                
                toast.error(mensaje, {
                    position: "top-right",
                    autoClose: 5000
                });
            });
    };








    return (
        <Modal show={true} onClose={onClose} maxWidth="2xl">
            <form onSubmit={submit} className="p-6 max-h-[90vh] overflow-y-auto">
                <div>
                    <InputLabel htmlFor="user_name" value="Reserva Perteneciente a el/la Usuario" className='text-center'/>
                    <div className="p-3 text-4xl text-center">
                        <span className="text-blue-600">
                            {users.find(user => user.id === Number(data.user_id))?.name || 'Usuario no encontrado'}
                        </span>
                    </div>
                    <input type="hidden" name="user_id" value={data.user_id} />
                </div>

                <div className="mt-6">
                    <InputLabel htmlFor="espacio_id" value="Espacio" />
                    <SelectInput
                        id="espacio_id"
                        value={data.espacio_id}
                        onChange={e => setData('espacio_id', e.target.value)}
                        className="mt-1 block w-full"
                    >
                        {espacios.map(espacio => (
                            <option key={espacio.id} value={espacio.id}>
                                {espacio.nombre}
                            </option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.espacio_id} className="mt-2" />
                </div>

                {showEscritorio && (
                    <div className="mt-6">
                        <InputLabel htmlFor="escritorio_id" value="Escritorio" />
                        <SelectInput
                            id="escritorio_id"
                            value={data.escritorio_id}
                            onChange={e => setData('escritorio_id', e.target.value)}
                            className="mt-1 block w-full"
                        >
                            <option value="">Seleccione un escritorio</option>
                            {escritoriosLibres.map(escritorio => (
                                <option key={escritorio.id} value={escritorio.id}>
                                    {escritorio.nombre}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.escritorio_id} className="mt-2" />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <InputLabel htmlFor="tipo_reserva" value="Tipo de Reserva" />
                        <SelectInput
                            id="tipo_reserva"
                            value={data.tipo_reserva}
                            onChange={e => setData('tipo_reserva', e.target.value)}
                            className="mt-1 block w-full"
                        >
                            <option value="hora">Por Hora</option>
                            <option value="medio_dia">Medio Día</option>
                            <option value="dia_completo">Día Completo</option>
                            <option value="semana">Semana</option>
                            <option value="mes">Mes</option>
                        </SelectInput>
                        <InputError message={errors.tipo_reserva} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="estado" value="Estado de la Reserva" />
                        <SelectInput
                            id="estado"
                            value={data.estado}
                            onChange={e => setData('estado', e.target.value)}
                            className="mt-1 block w-full"
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                        </SelectInput>
                        <InputError message={errors.estado} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6">
                    <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" />
                    <TextInput
                        id="fecha_inicio"
                        type="date"
                        value={data.fecha_inicio}
                        onChange={e => setData('fecha_inicio', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.fecha_inicio} className="mt-2" />
                    {fechaFinCalculada && (
                        <p className="mt-2 text-sm text-gray-600">
                            Fecha de finalización: {fechaFinCalculada}
                        </p>
                    )}
                </div>

                {showHoras && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <InputLabel htmlFor="hora_inicio" value="Horario" />
                            {data.tipo_reserva === 'medio_dia' ? (
                                <>
                                    <SelectInput
                                        id="hora_inicio"
                                        value={data.hora_inicio}
                                        onChange={e => setData('hora_inicio', e.target.value)}
                                        className="mt-1 block w-full"
                                    >
                                        <option value="">Seleccione un horario</option>
                                        {horariosDisponibles.map((horario, index) => (
                                            <option key={index} value={horario.inicio}>
                                                {horario.label}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    {data.hora_inicio && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Horario seleccionado: {data.hora_inicio} - {data.hora_fin}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <HourSelectInput
                                    id="hora_inicio"
                                    value={data.hora_inicio}
                                    onChange={e => setData('hora_inicio', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            )}
                            <InputError message={errors.hora_inicio} className="mt-2" />
                        </div>

                        {data.tipo_reserva === 'hora' && (
                            <div>
                                <InputLabel htmlFor="hora_fin" value="Hora de Fin" />
                                <HourSelectInput
                                    id="hora_fin"
                                    value={data.hora_fin}
                                    onChange={e => setData('hora_fin', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.hora_fin} className="mt-2" />
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6">
                    <InputLabel htmlFor="motivo" value="Motivo (Opcional)" />
                    <TextareaInput
                        id="motivo"
                        value={data.motivo}
                        onChange={e => setData('motivo', e.target.value)}
                        className="mt-1 block w-full"
                        rows="3"
                    />
                    <InputError message={errors.motivo} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <SecondaryButton onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        Guardar Cambios
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}