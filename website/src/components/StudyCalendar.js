import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion } from 'framer-motion';

const StudyCalendar = ({ events, onEventClick, onDateSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-6 rounded-3xl border border-white/10 shadow-2xl"
    >
      <style jsx global>{`
        .fc {
          --fc-border-color: rgba(255, 255, 255, 0.05);
          --fc-daygrid-event-dot-width: 8px;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: transparent;
          --fc-list-event-hover-bg-color: rgba(255, 255, 255, 0.05);
          color: #9ca3af;
          font-family: inherit;
        }
        .fc .fc-col-header-cell-cushion {
          padding: 12px 0;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 800;
          color: #6b7280;
        }
        .fc .fc-daygrid-day-number {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 8px;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .fc-event {
          border: none;
          padding: 2px 4px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .fc-event:hover {
          transform: translateY(-1px);
          filter: brightness(1.2);
        }
        .fc-h-event {
          background-color: #06b6d4;
        }
        .fc-day-today {
          background: rgba(6, 182, 212, 0.03) !important;
        }
        .fc-button-primary {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          text-transform: uppercase;
          font-size: 0.7rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.05em;
        }
        .fc-button-primary:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .fc-button-active {
          background: #06b6d4 !important;
          color: black !important;
          border-color: #06b6d4 !important;
        }
        .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 900 !important;
          color: white;
          text-transform: uppercase;
          font-style: italic;
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={onDateSelect}
        eventClick={onEventClick}
        height="auto"
      />
    </motion.div>
  );
};

export default StudyCalendar;
