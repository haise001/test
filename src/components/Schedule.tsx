import React, { useState } from 'react';
import { useClan, ClanEvent } from '../context/ClanContext';
import { Calendar as CalendarIcon, Clock, Users, ChevronLeft, ChevronRight, CheckCircle2, Award } from 'lucide-react';

export const Schedule: React.FC = () => {
  const { events, isAdmin, deleteEvent } = useClan();
  
  // States
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [rsvpedEvents, setRsvpedEvents] = useState<string[]>([]);
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calendar states
  const daysInMonth = 31;
  const startDayOffset = 6; // March 1st, 2026 is a Sunday (index 0 is Sun, let's say Monday is 1, Sunday is 0/7)
  // In 2026, March 1st is a Sunday. So if Monday is first day of week, Sunday has offset of 6 days. Correct.

  // Generate days array
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a day has events
  const getEventsForDay = (dayNum: number): ClanEvent[] => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `2026-03-${formattedDay}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleDayClick = (dayNum: number) => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `2026-03-${formattedDay}`;
    
    // Toggle date filter
    if (selectedDate === dateStr) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateStr);
    }
  };

  // RSVP handler
  const handleRsvp = async (eventId: string, eventTitle: string) => {
    setLoadingEventId(eventId);
    // Simulate server request latency
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setRsvpedEvents(prev => [...prev, eventId]);
    setLoadingEventId(null);
    
    // Show Toast
    setToastMessage(`Вы успешно записались на событие: "${eventTitle}"!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered events
  const displayedEvents = selectedDate 
    ? events.filter(e => e.date === selectedDate)
    : events;

  // Event category styles
  const getCategoryStyles = (type: ClanEvent['type']) => {
    switch (type) {
      case 'training':
        return {
          label: 'Тренировка',
          badgeClass: 'bg-purple-primary/10 border-purple-primary/40 text-purple-bright',
          borderClass: 'border-purple-primary/30'
        };
      case 'tournament':
        return {
          label: 'Турнир',
          badgeClass: 'bg-red-500/10 border-red-500/30 text-red-400',
          borderClass: 'border-red-500/30'
        };
      case 'recruiting':
        return {
          label: 'Набор',
          badgeClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          borderClass: 'border-blue-500/30'
        };
      case 'match':
        return {
          label: 'Матч',
          badgeClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
          borderClass: 'border-yellow-500/30'
        };
    }
  };

  return (
    <div className="py-12 bg-coal-dark min-h-screen relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-coal-card border-2 border-purple-primary text-white px-5 py-4 rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center space-x-3 animate-bounce max-w-sm">
          <CheckCircle2 className="w-6 h-6 text-purple-bright flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center md:text-left mb-12 border-b border-zinc-900 pb-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">РАСПИСАНИЕ КЛАНА</h1>
          <p className="text-zinc-400">Тренировки, киберспортивные лиги, шоу-матчи и наборы в академию.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Calendar (5 columns wide on desktop) */}
          <div className="lg:col-span-5 bg-coal-medium border border-zinc-800/80 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white uppercase text-lg tracking-wider gamer-font">
                Март 2026
              </h3>
              <div className="flex space-x-2 text-zinc-500">
                <button className="p-1 hover:text-white transition-colors cursor-not-allowed">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-1 hover:text-white transition-colors cursor-not-allowed">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
              <span>Пн</span>
              <span>Вт</span>
              <span>Ср</span>
              <span>Чт</span>
              <span>Пт</span>
              <span>Сб</span>
              <span>Вс</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty offset days */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}

              {/* Day days */}
              {days.map((dayNum) => {
                const dayEvents = getEventsForDay(dayNum);
                const hasEvents = dayEvents.length > 0;
                
                const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                const dateStr = `2026-03-${formattedDay}`;
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => handleDayClick(dayNum)}
                    className={`aspect-square rounded flex flex-col items-center justify-center relative transition-all duration-200 ${
                      isSelected 
                        ? 'bg-purple-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-purple-bright z-10' 
                        : hasEvents 
                          ? 'bg-purple-primary/10 hover:bg-purple-primary/20 text-purple-bright border border-purple-primary/20' 
                          : 'bg-coal-dark hover:bg-zinc-800/40 text-zinc-400'
                    }`}
                  >
                    <span className="text-sm font-bold font-mono">{dayNum}</span>
                    
                    {/* Event indicators */}
                    {hasEvents && !isSelected && (
                      <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-purple-bright shadow-[0_0_4px_#9d4edd]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-6 pt-6 border-t border-zinc-800/60 flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-primary/10 border border-purple-primary/20" />
                <span>Дни с событиями</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-primary" />
                <span>Выбранный день</span>
              </div>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="text-purple-bright hover:underline font-bold ml-auto"
                >
                  Сбросить фильтр
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Event List (7 columns wide on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white uppercase text-lg tracking-wider gamer-font">
                {selectedDate 
                  ? `События на ${new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}` 
                  : 'Все ближайшие события'}
              </h3>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest bg-coal-medium px-3 py-1.5 rounded border border-zinc-800">
                Всего: {displayedEvents.length}
              </span>
            </div>

            {displayedEvents.length === 0 ? (
              <div className="bg-coal-medium/50 border border-zinc-800/80 rounded-xl p-12 text-center">
                <CalendarIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-zinc-400">Нет запланированных событий</h4>
                <p className="text-zinc-500 text-xs mt-1">
                  {selectedDate 
                    ? 'На этот день нет запланированных тренировок или турниров' 
                    : 'Похоже, в расписании пока пусто. Загляните позже!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedEvents.map((event) => {
                  const cat = getCategoryStyles(event.type);
                  const isRsvped = rsvpedEvents.includes(event.id);
                  const isLoading = loadingEventId === event.id;

                  return (
                    <div 
                      key={event.id}
                      className={`bg-coal-medium border rounded-xl p-5 hover:bg-coal-light transition-all duration-300 relative group flex flex-col md:flex-row md:items-center justify-between gap-6 ${cat.borderClass}`}
                    >
                      {/* Event Details */}
                      <div className="space-y-3 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded border text-[9px] font-black tracking-widest uppercase ${cat.badgeClass}`}>
                            {cat.label}
                          </span>
                          
                          {/* Date and Time pills */}
                          <div className="flex items-center space-x-1 text-xs text-zinc-400 bg-coal-dark/60 px-2 py-0.5 rounded font-mono font-semibold">
                            <CalendarIcon className="w-3 h-3 text-purple-bright" />
                            <span>{new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-xs text-zinc-400 bg-coal-dark/60 px-2 py-0.5 rounded font-mono font-semibold">
                            <Clock className="w-3 h-3 text-purple-bright" />
                            <span>{event.time}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-purple-bright transition-colors">
                          {event.title}
                        </h3>
                        
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                          {event.description}
                        </p>

                        <div className="flex items-center space-x-1.5 text-xs text-zinc-500">
                          <Users className="w-4 h-4 text-zinc-500" />
                          <span>
                            Участники:{' '}
                            <strong className="text-white font-mono font-bold">
                              {event.participants + (isRsvped ? 1 : 0)}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (RSVP / Admin Delete) */}
                      <div className="flex flex-row md:flex-col items-center justify-end gap-3 flex-shrink-0">
                        {isRsvped ? (
                          <div className="flex items-center space-x-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded font-semibold text-xs uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Вы участвуете</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRsvp(event.id, event.title)}
                            disabled={isLoading}
                            className={`w-full md:w-auto px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all duration-300 clip-cyber-sm ${
                              isLoading 
                                ? 'bg-purple-primary/40 text-purple-glow cursor-wait' 
                                : 'bg-purple-primary text-white hover:bg-purple-bright hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                            }`}
                          >
                            {isLoading ? 'Запись...' : 'Участвовать'}
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="text-[10px] font-bold text-red-500/70 hover:text-red-400 uppercase tracking-widest px-2.5 py-1 hover:bg-red-500/5 rounded transition-all"
                          >
                            Удалить
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Training Motto / Tips banner */}
        <div className="mt-16 bg-gradient-to-r from-purple-primary/15 via-coal-medium to-purple-primary/5 rounded-2xl border border-purple-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span>ХОЧЕШЬ ТРЕНИРОВАТЬСЯ С НАМИ?</span>
            </h3>
            <p className="text-zinc-400 text-sm max-w-xl">
              Мы постоянно проводим открытые тренировочные матчи (скримы) в нашем Discord. Присоединяйся к голосовым каналам во время тренировок, чтобы проявить себя и получить фидбек от тренера!
            </p>
          </div>
          <a
            href="https://discord.gg/BuSBWGNf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto text-center px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-xs uppercase tracking-widest border border-zinc-700 hover:border-zinc-500 transition-all"
          >
            ПОДКЛЮЧИТЬСЯ К DISCORD
          </a>
        </div>

      </div>
    </div>
  );
};
