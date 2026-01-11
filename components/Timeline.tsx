
import React, { useState } from 'react';
import { TimelineEvent } from '../types';

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = sortedEvents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800">Historial de Actividad</h3>
      
      {events.length === 0 ? (
        <p className="text-slate-400 text-sm italic py-4">No hay actividad registrada.</p>
      ) : (
        <>
          <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {paginatedEvents.map((event) => (
              <div key={event.id} className="relative">
                <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center text-[10px] shadow-sm ${
                  event.type === 'LOAN_CREATED' ? 'bg-blue-500' : 
                  event.type === 'PAYMENT_RECEIVED' ? 'bg-emerald-500' : 
                  event.type === 'LATE_WARNING' ? 'bg-red-500' : 'bg-slate-500'
                } text-white`}>
                  {event.type === 'LOAN_CREATED' ? '📄' : 
                   event.type === 'PAYMENT_RECEIVED' ? '💸' : 
                   event.type === 'LATE_WARNING' ? '⚠️' : '👤'}
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-slate-800 text-[13px]">{event.description}</p>
                    <span className="text-[9px] text-slate-400 font-semibold">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  {event.amount && (
                    <p className="text-xs font-semibold text-blue-600 mt-1">${event.amount.toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`text-[11px] font-bold ${currentPage === 1 ? 'text-slate-300' : 'text-blue-600 hover:underline'}`}
              >
                Anterior
              </button>
              <span className="text-[10px] text-slate-500 font-medium">Página {currentPage} de {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`text-[11px] font-bold ${currentPage === totalPages ? 'text-slate-300' : 'text-blue-600 hover:underline'}`}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Timeline;
