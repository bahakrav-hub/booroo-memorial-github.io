import { useState } from 'react';

interface RoutePoint {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  x: number;
  y: number;
  isFinal?: boolean;
}

const ROUTE_POINTS: RoutePoint[] = [
  {
    id: 1,
    title: 'г. Якутск (Якутская АССР)',
    subtitle: 'Место призыва и отправки на фронт',
    date: 'Начало пути',
    description: 'Отправка добровольцев и призывников из Якутии по Лене и Транссибирской магистрали на защиту Родины.',
    x: 785,
    y: 135,
  },
  {
    id: 2,
    title: 'г. Иркутск — Транссиб',
    subtitle: 'Путь через Сибирь',
    date: 'Эшелон на Запад',
    description: 'Переброска сибирских и якутских пополнений по железной дороге к линии фронта.',
    x: 615,
    y: 265,
  },
  {
    id: 3,
    title: 'г. Новосибирск — Урал',
    subtitle: 'Формирование и подготовка',
    date: 'Военная подготовка',
    description: 'Сборные пункты и доукомплектование стрелковых дивизий перед отправкой на передовую.',
    x: 455,
    y: 250,
  },
  {
    id: 4,
    title: 'Подступы к Москве / Центральный фронт',
    subtitle: 'Переброска на рубеж обороны',
    date: '1942–1943 гг.',
    description: 'Выдвижение частей на центральное направление советско-германского фронта.',
    x: 215,
    y: 235,
  },
  {
    id: 5,
    title: 'Курская дуга (Курская область)',
    subtitle: 'Место последнего боя и гибели героя',
    date: 'Лето 1943 г.',
    description: 'Ожесточённые бои на Курской дуге. Здесь герой пал смертью храбрых, защищая Отечество.',
    x: 165,
    y: 285,
    isFinal: true,
  },
];

export function WarriorMap() {
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint>(ROUTE_POINTS.at(0)!);
  const [zoomed, setZoomed] = useState(false);

  const viewBox = zoomed
    ? `${Math.max(0, selectedPoint.x - 180)} ${Math.max(0, selectedPoint.y - 90)} 360 180`
    : '0 0 1000 420';

  const polylinePoints = ROUTE_POINTS.map((p) => `${p.x},${p.y}`).join(' ');

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
          onClick={() => setZoomed(!zoomed)}
          className="self-start md:self-auto px-3 py-1.5 bg-khaki border border-gold/40 text-gold text-xs font-condensed font-bold uppercase tracking-wider rounded hover:bg-khaki/80 transition-all"
        >
          {zoomed ? '🔍 Показать весь путь' : '🔎 Приблизить точку'}
        </button>
      </div>

      {/* Интерактивная штабная SVG-карта */}
      <div className="w-full rounded-lg border border-gold/25 overflow-hidden bg-[#121f15] relative">
        <svg
          viewBox={viewBox}
          className="w-full h-64 md:h-96 transition-all duration-700 ease-in-out select-none"
        >
          <defs>
            <pattern id="staffGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(212, 175, 55, 0.08)"
                strokeWidth="1"
              />
            </pattern>
            <radialGradient id="battleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(220, 38, 38, 0.45)" />
              <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
            </radialGradient>
          </defs>

          {/* Координатная штабная сетка */}
          <rect width="1000" height="420" fill="url(#staffGrid)" />

          {/* Стилизованный контур территории СССР / России */}
          <path
            d="M 110,185 L 145,130 L 210,105 L 285,115 L 350,90 L 440,75 L 535,60 L 645,55 L 760,65 L 885,80 L 945,115 L 910,175 L 850,210 L 820,275 L 745,295 L 660,315 L 560,310 L 465,305 L 370,320 L 285,335 L 210,330 L 145,315 L 115,265 Z"
            fill="rgba(45, 68, 48, 0.45)"
            stroke="rgba(212, 175, 55, 0.25)"
            strokeWidth="1.5"
          />

          {/* Реки (Лена, Енисей, Обь, Волга) для географического ориентира */}
          <path
            d="M 785,68 Q 795,120 770,175 T 735,245"
            fill="none"
            stroke="rgba(96, 165, 250, 0.2)"
            strokeWidth="1.5"
          />
          <path
            d="M 560,65 Q 565,150 580,255"
            fill="none"
            stroke="rgba(96, 165, 250, 0.18)"
            strokeWidth="1.5"
          />
          <path
            d="M 450,78 Q 445,165 460,260"
            fill="none"
            stroke="rgba(96, 165, 250, 0.18)"
            strokeWidth="1.5"
          />
          <path
            d="M 235,175 Q 255,235 245,315"
            fill="none"
            stroke="rgba(96, 165, 250, 0.2)"
            strokeWidth="1.5"
          />

          {/* Подсветка района Курской дуги */}
          <circle cx="165" cy="285" r="42" fill="url(#battleGlow)" />

          {/* Подложка линии маршрута */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="rgba(0, 0, 0, 0.5)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Красная пунктирная линия боевого пути */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#dc2626"
            strokeWidth="3"
            strokeDasharray="10 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Точки маршрута */}
          {ROUTE_POINTS.map((point) => {
            const isSelected = selectedPoint.id === point.id;
            return (
              <g
                key={point.id}
                onClick={() => {
                  setSelectedPoint(point);
                  setZoomed(true);
                }}
                className="cursor-pointer"
              >
                {isSelected && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={point.isFinal ? 20 : 16}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.isFinal ? 11 : 8}
                  fill={point.isFinal ? '#dc2626' : isSelected ? '#eab308' : '#1f3322'}
                  stroke={point.isFinal ? '#eab308' : '#eab308'}
                  strokeWidth="2.5"
                />

                <text
                  x={point.x}
                  y={point.y + (point.isFinal ? 4 : 3)}
                  textAnchor="middle"
                  fill={point.isFinal ? '#ffffff' : isSelected ? '#121f15' : '#eab308'}
                  fontSize={point.isFinal ? '11' : '9'}
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {point.isFinal ? '★' : point.id}
                </text>

                {/* Подпись города на карте */}
                <text
                  x={point.x}
                  y={point.y - (point.isFinal ? 16 : 13)}
                  textAnchor="middle"
                  fill={point.isFinal ? '#fca5a5' : isSelected ? '#fde047' : '#e5e7eb'}
                  fontSize={point.isFinal ? '12' : '11'}
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {point.title.split(' (').at(0)}
                </text>
              </g>
            );
          })}

          {/* Легенда в углу штабной карты */}
          <g transform="translate(20, 20)">
            <rect
              width="210"
              height="54"
              rx="6"
              fill="rgba(18, 31, 21, 0.85)"
              stroke="rgba(212, 175, 55, 0.3)"
            />
            <line
              x1="14"
              y1="20"
              x2="44"
              y2="20"
              stroke="#dc2626"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            <text x="52" y="24" fill="#e5e7eb" fontSize="11" fontFamily="sans-serif">
              Маршрут переброски (~6 500 км)
            </text>
            <circle cx="29" cy="39" r="5" fill="#dc2626" stroke="#eab308" strokeWidth="1.5" />
            <text x="52" y="43" fill="#fca5a5" fontSize="11" fontFamily="sans-serif">
              Место гибели: Курская дуга
            </text>
          </g>
        </svg>
      </div>

      {/* Кнопки быстрого перехода по этапам */}
      <div className="flex flex-wrap gap-2 mt-4">
        {ROUTE_POINTS.map((point) => (
          <button
            key={point.id}
            type="button"
            onClick={() => {
              setSelectedPoint(point);
              setZoomed(true);
            }}
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

      {/* Карточка выбранного этапа */}
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

