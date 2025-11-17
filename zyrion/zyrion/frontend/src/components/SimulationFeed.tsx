/**
 * Simulation Feed Component
 * Displays mock simulation events for user actions
 */

import { useState, useEffect } from 'react';
import { SimulationEvent } from '../lib/mockMode';

export function SimulationFeed() {
  const [events, setEvents] = useState<SimulationEvent[]>([]);

  useEffect(() => {
    const handleSimulationEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SimulationEvent>;
      const newEvent = customEvent.detail;
      
      setEvents((prev) => {
        const updated = [newEvent, ...prev];
        // Keep only last 5 events
        return updated.slice(0, 5);
      });
      
      // Auto-remove event after 5 seconds
      setTimeout(() => {
        setEvents((prev) => prev.filter((evt) => evt.timestamp !== newEvent.timestamp));
      }, 5000);
    };

    window.addEventListener('simulationEvent', handleSimulationEvent as EventListener);

    return () => {
      window.removeEventListener('simulationEvent', handleSimulationEvent as EventListener);
    };
  }, []);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {events.map((event) => (
        <div
          key={event.timestamp}
          className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg border border-white/20 animate-slide-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
              <p className="text-xs text-white/90">{event.message}</p>
              {event.points && (
                <div className="mt-2 text-xs font-medium">
                  +{event.points} points
                </div>
              )}
            </div>
            <button
              onClick={() => setEvents((prev) => prev.filter((e) => e.timestamp !== event.timestamp))}
              className="ml-2 text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

