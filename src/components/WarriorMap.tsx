import { useEffect, useRef, useState } from 'react';

interface RoutePoint {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  lat: number;
  lng: number;
  isFinal?: boolean;
}

const ROUTE_POINTS: RoutePoint[] = [
  {
    id: 1,
    title: 'г. Якутск (Якутская АССР)',
    subtitle: 'Место призыва и отправки на фронт',
    date: 'Начало пути',
    description: 'Отправка добровольцев и призывников из Якутии по Лене и Транссибирской магистрали на защиту Родины.',
    lat: 62.0355,
    lng: 129.6755,
  },
  {
    id: 2,
    title: 'г. Иркутск — Транссиб',
    subtitle: 'Путь через Сибирь',
    date: 'Эшелон на Запад',
    description: 'Переброска сибирских и якутских пополнений по железной дороге к линии фронта.',
    lat: 52.2869,
    lng: 104.3050,
  },
  {
    id: 3,
    title: 'г. Новосибирск — Урал',
    subtitle: 'Формирование и подготовка',
    date: 'Военная подготовка',
    description: 'Сборные пункты и доукомплектование стрелковых дивизий перед отправкой на передовую.',
    lat: 55.0084,
    lng: 82.9357,
  },
  {
    id: 4,
    title: 'Подступы к Москве / Центральный фронт',
    subtitle: 'Переброска на рубеж обороны',
    date: '1942–1943 гг.',
    description: 'Выдвижение частей на центральное направление советско-германского фронта.',
    lat: 54.1961,
    lng: 37.6182,
  },
  {
    id: 5,
    title: 'Курская дуга (Курская область)',
    subtitle: 'Место последнего боя и гибели героя',
    date: 'Лето 1943 г.',
    description: 'Ожесточённые бои на Курской дуге. Здесь герой пал смертью храбрых, защищая Отечество.',
    lat: 51.7373,
    lng: 36.1873,
    isFinal: true,
  },
];

declare global {
  interface Window {
    L: any;
  }
}

export function WarriorMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint>(ROUTE_POINTS.at(0)!);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapContainerRef.current, {
      center: L.latLng(57.5, 82.0),
      zoom: 3,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}://{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    const latlngs = ROUTE_POINTS.map((p) => L.latLng(p.lat, p.lng));

    L.polyline(latlngs, {
      color: '#b91c1c',
      weight: 3,
      opacity: 0.9,
      dashArray: '8, 8',
    }).addTo(map);

    ROUTE_POINTS.forEach((point) => {
      const iconHtml = point.isFinal
        ? '<div style="width:22px;height:22px;background:#dc2626;border:3px solid #eab308;border-radius:50%;box-shadow:0 0 12px #dc2626;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">★</div>'
        : '<div style="width:14px;height:14px;background:#eab308;border:2px solid #1a2e1a;border-radius:50%;box-shadow:0 0 8px rgba(234,179,8,0.8);"></div>';

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-warrior-marker',
        iconSize: point.isFinal ? L.point(22, 22) : L.point(14, 14),
        iconAnchor: point.isFinal ? L.point(11, 11) : L.point(7, 7),
      });

      const marker = L.marker(L.latLng(point.lat, point.lng), { icon: customIcon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family:sans-serif;color:#111;max-width:220px;">
          <strong style="color:#991b1b;font-size:13px;">${point.title}</strong><br/>
          <span style="font-size:11px;color:#555;">${point.date}</span>
          <p style="margin:6px 0 0;font-size:12px;line-height:1.3;">${point.description}</p>
        </div>`
      );

      marker.on('click', () => {
        setSelectedPoint(point);
      });
    });

    map.fitBounds(L.latLngBounds(latlngs), { padding: L.point(30, 30) });
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const focusPoint = (point: RoutePoint) => {
    setSelectedPoint(point);
    if (mapInstanceRef.current && window.L) {
      mapInstanceRef.current.flyTo(window.L.latLng(point.lat, point.lng), point.isFinal ? 7 : 5, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="mb-14 bg-dark-green/80 border border-gold/30 rounded-lg p-4 md:p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-display text-lg md:text-2xl text-gold font-bold flex items-center gap-2">
            🗺️ Карта боевого пути: Якутск — Курская дуга
          </h3>
          <p className="font-condensed text-paper/60 text-xs uppercase tracking-wider">
            Нажимайте на точки маршрута или кнопки ниже, чтобы приблизить участок пути
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current && window.L) {
              const latlngs = ROUTE_POINTS.map((p) => window.L.latLng(p.lat, p.lng));
              mapInstanceRef.current.fitBounds(window.L.latLngBounds(latlngs), { padding: L.point(30, 30) });
            }
          }}
          className="self-start md:self-auto px-3 py-1.5 bg-khaki border border-gold/40 text-gold text-xs font-condensed font-bold uppercase tracking-wider rounded hover:bg-khaki/80 transition-all"
        >
          Показать весь путь
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-72 md:h-96 rounded-lg border border-gold/20 overflow-hidden z-10 relative"
      />

      <div className="flex flex-wrap gap-2 mt-4">
        {ROUTE_POINTS.map((point) => (
          <button
            key={point.id}
            type="button"
            onClick={() => focusPoint(point)}
            className={`px-3 py-1.5 rounded text-xs font-condensed font-bold uppercase tracking-wider transition-all ${
              selectedPoint.id === point.id
                ? point.isFinal
                  ? 'bg-army-red text-white border border-gold shadow-lg'
                  : 'bg-gold text-dark-green'
                : 'bg-khaki/60 text-paper/80 border border-gold/20 hover:border-gold/50'
            }`}
          >
            {point.isFinal ? '★ ' : `${point.id}. `}
            {point.title.split(' (').at(0)}
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 bg-khaki/40 border border-gold/20 rounded-lg">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-display text-gold font-bold text-base md:text-lg">
            {selectedPoint.title}
          </h4>
          <span className="font-condensed text-xs bg-army-red/20 border border-army-red/40 text-paper px-2 py-0.5 rounded">
            {selectedPoint.date}
          </span>
        </div>
        <p className="font-condensed text-paper/60 text-xs uppercase tracking-wider mb-2">
          {selectedPoint.subtitle}
        </p>
        <p className="font-slab text-paper/90 text-sm leading-relaxed">
          {selectedPoint.description}
        </p>
      </div>
    </div>
  );
}
