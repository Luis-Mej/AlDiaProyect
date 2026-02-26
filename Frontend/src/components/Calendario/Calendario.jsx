import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { recordatorioService } from '../../services';
import { handleApiError } from '../../utils/helpers';
import RecordatorioModal from './RecordatorioModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendario.css';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const Calendario = () => {
  const navigate = useNavigate();
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecordatorio, setSelectedRecordatorio] = useState(null);

  // Cargar recordatorios al montar componente
  useEffect(() => {
    cargarRecordatorios();
  }, []);

  const cargarRecordatorios = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await recordatorioService.obtenerTodos();
      const eventos = response.data.data.map((rec) => ({
        id: rec._id,
        title: `${rec.servicio.toUpperCase()} - ${rec.cuenta}`,
        start: new Date(rec.fechaRecordatorio),
        end: new Date(rec.fechaPago),
        resource: rec,
        tipo: 'recordatorio',
      }));
      setRecordatorios(eventos);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Error cargando recordatorios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedRecordatorio(event.resource);
    setShowModal(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedRecordatorio({
      fechaPago: slotInfo.start,
      fechaRecordatorio: slotInfo.start,
      servicio: '',
      cuenta: '',
      descripcion: '',
      monto: null,
      notas: '',
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRecordatorio(null);
  };

  const handleModalSave = async () => {
    await cargarRecordatorios();
    handleModalClose();
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6';
    
    if (event.resource?.estado === 'completado') {
      backgroundColor = '#10b981';
    } else if (event.resource?.estado === 'vencido') {
      backgroundColor = '#ef4444';
    } else if (event.resource?.servicio === 'cnel') {
      backgroundColor = '#f59e0b';
    } else if (event.resource?.servicio === 'interagua') {
      backgroundColor = '#06b6d4';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  // Toolbar personalizado para controlar la navegación y vistas
  const CustomToolbar = (toolbar) => {
    const goToBack = () => navigate('/dashboard');

    const goToToday = () => toolbar.onNavigate('TODAY');
    const goToPrev = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const setView = (view) => toolbar.onView(view);

    return (
      <div className="rbc-toolbar custom-toolbar">
          <div className="rbc-toolbar-left">
          <button className="rbc-btn btn-volver" onClick={goToBack} aria-label="Ir al inicio" data-tooltip="Ir al inicio">
            <FiArrowLeft size={16} aria-hidden color="currentColor" />
            <span>Inicio</span>
          </button>
          <button className="rbc-btn" onClick={goToToday}>{toolbar.localizer.messages.today || 'Hoy'}</button>
          <button className="rbc-btn" onClick={goToPrev}>{toolbar.localizer.messages.previous || 'Anterior'}</button>
          <button className="rbc-btn" onClick={goToNext}>{toolbar.localizer.messages.next || 'Siguiente'}</button>
        </div>

        <div className="rbc-toolbar-center">
          <span className="rbc-toolbar-label">{toolbar.label}</span>
        </div>

        <div className="rbc-toolbar-right">
          <button className={`rbc-btn ${toolbar.view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>{toolbar.localizer.messages.month || 'Mes'}</button>
          <button className={`rbc-btn ${toolbar.view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>{toolbar.localizer.messages.week || 'Semana'}</button>
          <button className={`rbc-btn ${toolbar.view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>{toolbar.localizer.messages.day || 'Día'}</button>
          <button className={`rbc-btn ${toolbar.view === 'agenda' ? 'active' : ''}`} onClick={() => setView('agenda')}>{toolbar.localizer.messages.agenda || 'Agenda'}</button>
        </div>
      </div>
    );
  };

  return (
    <div className="calendario-container">
      <div className="calendario-header">
        <h1>📅 Calendario de Recordatorios</h1>
        <button
          className="btn-nuevo-recordatorio"
          onClick={() => {
            setSelectedRecordatorio(null);
            setShowModal(true);
          }}
        >
          + Nuevo Recordatorio
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando recordatorios...</div>
      ) : (
        <div className="calendario-wrapper">
          <Calendar
            localizer={localizer}
            events={recordatorios}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            eventPropGetter={eventStyleGetter}
            messages={{
              today: 'Hoy',
              previous: 'Anterior',
              next: 'Siguiente',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'No hay recordatorios en este rango',
              showMore: (count) => `+ ${count} más`,
            }}
            views={[ 'month', 'week', 'day', 'agenda' ]}
            components={{ toolbar: CustomToolbar }}
          />
        </div>
      )}

      <RecordatorioModal
        isOpen={showModal}
        recordatorio={selectedRecordatorio}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      {/* Leyenda */}
      <div className="calendario-leyenda">
        <div className="leyenda-item">
          <span className="leyenda-color cnel"></span>
          <p>CNEL</p>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color interagua"></span>
          <p>Interagua</p>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color completado"></span>
          <p>Completado</p>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color vencido"></span>
          <p>Vencido</p>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
