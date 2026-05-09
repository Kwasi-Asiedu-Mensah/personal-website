"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow,
  Droplets, Search, Sun, Wind, X,
} from "lucide-react";
import { WeatherSceneEffects } from "./weather/WeatherSceneEffects";
import {
  buildOpenMeteoForecastUrl,
  getWeatherDescription,
  getWeatherIconName,
  getWeatherScene,
  type WeatherScene,
} from "@/lib/weather";
import { useSessionState } from "@/lib/sidebar-persistence";

/* ======================== Types ======================== */

interface CityConfig {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface HourForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationChance: number;
}

interface DailyForecast {
  date: string;
  high: number;
  low: number;
  weatherCode: number;
  precipitationChance: number;
}

interface CityWeather {
  unit: "celsius"; // discriminator — entries without this are stale Fahrenheit data
  cityId: string;
  cityName: string;
  currentTime: string;
  currentTemp: number;
  weatherCode: number;
  high: number;
  low: number;
  feelsLike: number;
  humidity: number;
  windKmh: number;
  timezone: string;
  hourly: HourForecast[];
  daily: DailyForecast[];
  updatedAt: string;
}

interface OpenMeteoResponse {
  timezone?: string;
  current: {
    time?: string;
    temperature_2m: number;
    weather_code: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
}

/* ======================== Constants ======================== */

const DEFAULT_CITIES: CityConfig[] = [
  { id: "accra", name: "Accra", latitude: 5.56, longitude: -0.20 },
  { id: "london", name: "London", latitude: 51.51, longitude: -0.13 },
  { id: "los-angeles", name: "Los Angeles", latitude: 34.05, longitude: -118.24 },
  { id: "san-francisco", name: "San Francisco", latitude: 37.78, longitude: -122.42 },
  { id: "paris", name: "Paris", latitude: 48.86, longitude: 2.35 },
];

const OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FETCH_MAX_RETRIES = 2;
const FETCH_BASE_RETRY_MS = 450;
const FETCH_MAX_RETRY_MS = 5000;
const FETCH_BATCH_SIZE = 3;

/* ======================== Utilities ======================== */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getRetryDelayMs(attempt: number): number {
  return Math.min(FETCH_BASE_RETRY_MS * 2 ** attempt + Math.floor(Math.random() * 180), FETCH_MAX_RETRY_MS);
}

function toCityId(name: string, lat: number, lng: number): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return `${slug}-${Math.round(lat * 100)}-${Math.round(lng * 100)}`;
}

function getCityCoordKey(city: Pick<CityConfig, "latitude" | "longitude">): string {
  return `${city.latitude.toFixed(2)}:${city.longitude.toFixed(2)}`;
}

function parseDateOnly(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatHourLabel(iso: string): string {
  const rawHour = Number(iso.split("T")[1]?.slice(0, 2));
  if (!Number.isFinite(rawHour)) return "--";
  if (rawHour === 0) return "12AM";
  if (rawHour === 12) return "12PM";
  return rawHour > 12 ? `${rawHour - 12}PM` : `${rawHour}AM`;
}

function formatWeekday(dateString: string, index: number): string {
  if (index === 0) return "Today";
  return parseDateOnly(dateString).toLocaleDateString("en-US", { weekday: "short" });
}

async function fetchCityWeather(city: CityConfig): Promise<CityWeather> {
  const url = buildOpenMeteoForecastUrl({
    latitude: city.latitude,
    longitude: city.longitude,
    currentFields: ["temperature_2m", "weather_code", "apparent_temperature", "relative_humidity_2m", "wind_speed_10m"],
    dailyFields: ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max"],
    hourlyFields: ["temperature_2m", "weather_code", "precipitation_probability"],
    forecastDays: 10,
    temperatureUnit: "celsius",
    windSpeedUnit: "kmh",
  });

  let res: Response | null = null;
  for (let attempt = 0; attempt <= FETCH_MAX_RETRIES; attempt++) {
    try {
      res = await fetch(url);
    } catch {
      if (attempt >= FETCH_MAX_RETRIES) throw new Error(`Network error for ${city.name}`);
      await sleep(getRetryDelayMs(attempt));
      continue;
    }
    if (res.ok) break;
    if (attempt < FETCH_MAX_RETRIES && (res.status === 429 || res.status >= 500)) {
      await sleep(getRetryDelayMs(attempt));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${city.name}`);
  }
  if (!res?.ok) throw new Error(`Unavailable: ${city.name}`);

  const data = (await res.json()) as OpenMeteoResponse;
  const now = Date.now();
  const firstUpcomingIdx = data.hourly.time.findIndex((t) => new Date(t).getTime() >= now);
  const startIdx = firstUpcomingIdx === -1 ? 0 : firstUpcomingIdx;

  const hourly = data.hourly.time.slice(startIdx, startIdx + 10).map((time, i) => ({
    time,
    temperature: data.hourly.temperature_2m[startIdx + i] ?? 0,
    weatherCode: data.hourly.weather_code[startIdx + i] ?? 0,
    precipitationChance: data.hourly.precipitation_probability[startIdx + i] ?? 0,
  }));

  const daily = data.daily.time.slice(0, 10).map((date, i) => ({
    date,
    high: data.daily.temperature_2m_max[i] ?? 0,
    low: data.daily.temperature_2m_min[i] ?? 0,
    weatherCode: data.daily.weather_code[i] ?? 0,
    precipitationChance: data.daily.precipitation_probability_max[i] ?? 0,
  }));

  return {
    unit: "celsius" as const,
    cityId: city.id,
    cityName: city.name,
    currentTime: data.current.time ?? data.hourly.time[startIdx] ?? "",
    currentTemp: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    high: daily[0]?.high ?? data.current.temperature_2m,
    low: daily[0]?.low ?? data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windKmh: data.current.wind_speed_10m,
    timezone: data.timezone ?? "UTC",
    hourly,
    daily,
    updatedAt: new Date().toISOString(),
  };
}

async function geocodeCities(query: string): Promise<CityConfig[]> {
  const params = new URLSearchParams({ name: query, count: "8", language: "en", format: "json" });
  const res = await fetch(`${OPEN_METEO_GEOCODING_URL}?${params.toString()}`);
  if (!res.ok) return [];
  const data = (await res.json()) as OpenMeteoGeocodingResponse;
  const seen = new Set<string>();
  const results: CityConfig[] = [];
  for (const r of data.results ?? []) {
    const parts = [r.name, r.admin1, r.country].filter(Boolean);
    const unique: string[] = [];
    for (const p of parts) { if (p && !unique.includes(p)) unique.push(p); }
    const name = unique.join(", ");
    const key = getCityCoordKey({ latitude: r.latitude, longitude: r.longitude });
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ id: toCityId(name, r.latitude, r.longitude), name, latitude: r.latitude, longitude: r.longitude });
  }
  return results;
}

/* ======================== City Time Hook ======================== */

function useCityTime(timezone: string | undefined): string {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () => {
      if (!timezone) return "";
      try {
        return new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
      } catch {
        return "";
      }
    };

    setTime(fmt());
    const t = setInterval(() => setTime(fmt()), 30_000);
    return () => clearInterval(t);
  }, [timezone]);

  return time;
}

/* ======================== Weather Icon ======================== */

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  switch (getWeatherIconName(code)) {
    case "sun": return <Sun className={className} />;
    case "cloud": return <Cloud className={className} />;
    case "fog": return <CloudFog className={className} />;
    case "drizzle": return <CloudDrizzle className={className} />;
    case "rain": return <CloudRain className={className} />;
    case "snow": return <CloudSnow className={className} />;
    case "thunder": return <CloudLightning className={className} />;
    default: return <Cloud className={className} />;
  }
}

/* ======================== Sidebar City Item ======================== */

function SidebarCityItem({
  city,
  weather,
  isSelected,
  onClick,
}: {
  city: CityConfig;
  weather: CityWeather | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  const scene = useMemo(() => {
    if (!weather) return null;
    return getWeatherScene(weather.currentTime, weather.weatherCode);
  }, [weather]);
  const localTime = useCityTime(weather?.timezone);

  return (
    <button
      onClick={onClick}
      className="w-full relative overflow-hidden rounded-xl mb-2 text-left transition-opacity"
      style={{ height: "80px", opacity: isSelected ? 1 : 0.82 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{ background: scene?.background ?? "linear-gradient(180deg, #2e5786 0%, #537cad 100%)" }}
      />
      {/* Overlay effects */}
      {scene && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <WeatherSceneEffects scene={scene} surface="preview" />
        </div>
      )}
      {/* Selected ring */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-white/40" />
      )}
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between h-full px-3">
        <div>
          <div className="text-white text-[13px] font-semibold leading-tight truncate max-w-[100px]">
            {city.name.split(",")[0]}
          </div>
          {weather && (
            <>
              <div className="text-white/70 text-[11px] mt-0.5">
                {getWeatherDescription(weather.weatherCode)}
              </div>
              {localTime && (
                <div className="text-white/50 text-[10px] mt-0.5 tabular-nums">{localTime}</div>
              )}
            </>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {weather && (
            <>
              <span className="text-white text-[22px] font-thin leading-none">
                {Math.round(weather.currentTemp)}°
              </span>
              <WeatherIcon code={weather.weatherCode} className="w-4 h-4 text-white/70" />
            </>
          )}
          {!weather && (
            <div className="w-5 h-5 rounded-full border border-white/30 border-t-white/80 animate-spin" />
          )}
        </div>
      </div>
    </button>
  );
}

/* ======================== Main Component ======================== */

export default function Weather() {
  const [selectedCityId, setSelectedCityId] = useSessionState<string>("weather", "selectedCityId", "accra");
  const [customCities, setCustomCities] = useSessionState<CityConfig[]>("weather", "customCities", []);
  const [weatherCache, setWeatherCache] = useSessionState<Record<string, CityWeather>>("weather", "cache-v2", {});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CityConfig[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);

  const allCities = useMemo(() => {
    const seen = new Set<string>();
    const result: CityConfig[] = [];
    for (const c of [...DEFAULT_CITIES, ...customCities]) {
      if (!seen.has(c.id)) { seen.add(c.id); result.push(c); }
    }
    return result;
  }, [customCities]);

  // Fetch weather for all cities on mount and when city list changes
  useEffect(() => {
    const stale = allCities.filter((c) => {
      const cached = weatherCache[c.id];
      if (!cached || cached.unit !== "celsius") return true; // missing or old Fahrenheit data
      const age = Date.now() - new Date(cached.updatedAt).getTime();
      return age > 15 * 60 * 1000; // 15 min TTL
    });

    if (stale.length === 0) return;

    let cancelled = false;

    async function fetchBatched() {
      for (let i = 0; i < stale.length; i += FETCH_BATCH_SIZE) {
        if (cancelled) break;
        const batch = stale.slice(i, i + FETCH_BATCH_SIZE);
        await Promise.all(
          batch.map(async (city) => {
            try {
              const data = await fetchCityWeather(city);
              if (!cancelled) {
                setWeatherCache((prev) => ({ ...prev, [city.id]: data }));
              }
            } catch {
              // silently ignore — stale data stays
            }
          })
        );
      }
    }

    fetchBatched();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCities.map((c) => c.id).join(",")]);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      const results = await geocodeCities(searchQuery.trim());
      setSearchResults(results);
      setSearchLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const addCity = useCallback((city: CityConfig) => {
    const alreadyDefault = DEFAULT_CITIES.some((d) => getCityCoordKey(d) === getCityCoordKey(city));
    if (!alreadyDefault) {
      setCustomCities((prev) => {
        const exists = prev.some((c) => getCityCoordKey(c) === getCityCoordKey(city));
        return exists ? prev : [...prev, city];
      });
    }
    setSelectedCityId(city.id);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  }, [setCustomCities, setSelectedCityId]);

  const removeCustomCity = useCallback((cityId: string) => {
    setCustomCities((prev) => prev.filter((c) => c.id !== cityId));
    if (selectedCityId === cityId) setSelectedCityId("accra");
  }, [selectedCityId, setCustomCities, setSelectedCityId]);

  const selectedCity = allCities.find((c) => c.id === selectedCityId) ?? allCities[0];
  const selectedWeather = selectedCity ? weatherCache[selectedCity.id] ?? null : null;
  const scene: WeatherScene | null = selectedWeather
    ? getWeatherScene(selectedWeather.currentTime, selectedWeather.weatherCode)
    : null;

  const defaultScene = getWeatherScene(new Date().toISOString(), 0);
  const heroTime = useCityTime(selectedWeather?.timezone);

  return (
    <div className="flex h-full overflow-hidden rounded-b-lg text-white select-none">
      {/* Sidebar */}
      <div
        className="flex flex-col w-[200px] shrink-0 overflow-hidden"
        style={{ background: scene?.sidebarShellBackground ?? defaultScene.sidebarShellBackground }}
      >
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2 scrollbar-thin">
          {allCities.map((city) => (
            <SidebarCityItem
              key={city.id}
              city={city}
              weather={weatherCache[city.id] ?? null}
              isSelected={city.id === (selectedCity?.id ?? "")}
              onClick={() => setSelectedCityId(city.id)}
            />
          ))}
        </div>

        {/* Add city */}
        <div className="px-3 pb-3 border-t border-white/10 pt-2">
          {!showSearch ? (
            <button
              onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50); }}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-white/60 bg-white/[0.08] hover:bg-white/[0.14] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Add city…
            </button>
          ) : (
            <div
              ref={searchContainerRef}
              className="relative"
              onFocus={() => {
                setDropdownRect(searchContainerRef.current?.getBoundingClientRect() ?? null);
              }}
            >
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white/[0.12] ring-1 ring-white/20">
                <Search className="w-3.5 h-3.5 text-white/50 shrink-0" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDropdownRect(searchContainerRef.current?.getBoundingClientRect() ?? null);
                  }}
                  placeholder="Search city…"
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-white/40 outline-none min-w-0"
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}>
                  <X className="w-3.5 h-3.5 text-white/50 hover:text-white/80 transition-colors" />
                </button>
              </div>
              {searchQuery.trim() && dropdownRect && typeof document !== "undefined" &&
                createPortal(
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      position: "fixed",
                      bottom: window.innerHeight - dropdownRect.top + 4,
                      left: dropdownRect.left,
                      width: dropdownRect.width,
                      zIndex: 9999,
                      background: "rgba(20,30,55,0.97)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {searchLoading && (
                      <div className="px-3 py-2 text-[12px] text-white/40">Searching…</div>
                    )}
                    {!searchLoading && searchResults.length === 0 && (
                      <div className="px-3 py-2 text-[12px] text-white/40">No cities found.</div>
                    )}
                    {searchResults.map((r) => (
                      <button
                        key={r.id}
                        onMouseDown={(e) => { e.preventDefault(); addCity(r); }}
                        className="w-full text-left px-3 py-2 text-[12px] text-white/80 hover:bg-white/10 transition-colors truncate"
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>,
                  document.body
                )
              }
            </div>
          )}
          {/* Remove custom city hint */}
          {selectedCity && customCities.some((c) => c.id === selectedCity.id) && (
            <button
              onClick={() => removeCustomCity(selectedCity.id)}
              className="w-full mt-1.5 text-[11px] text-white/35 hover:text-white/60 transition-colors text-center"
            >
              Remove {selectedCity.name.split(",")[0]}
            </button>
          )}
        </div>
      </div>

      {/* Main panel */}
      <div
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{ background: scene?.background ?? defaultScene.background }}
      >
        {/* Animated scene effects */}
        <div className="absolute inset-0 overflow-hidden">
          <WeatherSceneEffects scene={scene ?? defaultScene} surface="main" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full overflow-y-auto">
          {/* Hero */}
          <div className="px-8 pt-8 pb-6">
            {selectedWeather ? (
              <>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-[13px] text-white/60 font-medium">{selectedCity?.name}</span>
                  {heroTime && (
                    <span className="text-[13px] text-white/45 tabular-nums">{heroTime}</span>
                  )}
                </div>
                <div className="text-[80px] font-extralight leading-none text-white mb-1">
                  {Math.round(selectedWeather.currentTemp)}°
                </div>
                <div className="text-[18px] text-white/80 font-light mb-3">
                  {getWeatherDescription(selectedWeather.weatherCode)}
                </div>
                <div className="flex items-center gap-4 text-[13px] text-white/60">
                  <span>H:{Math.round(selectedWeather.high)}°</span>
                  <span>L:{Math.round(selectedWeather.low)}°</span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />{selectedWeather.humidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />{Math.round(selectedWeather.windKmh ?? 0)} km/h
                  </span>
                  <span>Feels {Math.round(selectedWeather.feelsLike)}°</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
                <span className="text-white/50 text-[14px]">Loading weather…</span>
              </div>
            )}
          </div>

          {selectedWeather && (
            <>
              {/* Hourly strip */}
              <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(8px)" }}>
                <div className="px-4 py-3">
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wide mb-3">
                    Hourly Forecast
                  </div>
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {selectedWeather.hourly.map((hour, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 min-w-[52px] px-1">
                        <span className="text-[11px] text-white/60">
                          {i === 0 ? "Now" : formatHourLabel(hour.time)}
                        </span>
                        <WeatherIcon code={hour.weatherCode} className="w-4 h-4 text-white/80" />
                        {hour.precipitationChance > 0 && (
                          <span className="text-[10px] text-blue-300/80">{hour.precipitationChance}%</span>
                        )}
                        {hour.precipitationChance === 0 && <span className="text-[10px] text-transparent">0%</span>}
                        <span className="text-[13px] text-white font-medium">{Math.round(hour.temperature)}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 10-day forecast */}
              <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(8px)" }}>
                <div className="px-4 py-3">
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wide mb-3">
                    10-Day Forecast
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {selectedWeather.daily.map((day, i) => {
                      const allHighs = selectedWeather.daily.map((d) => d.high);
                      const allLows = selectedWeather.daily.map((d) => d.low);
                      const rangeMin = Math.min(...allLows);
                      const rangeMax = Math.max(...allHighs);
                      const totalRange = rangeMax - rangeMin || 1;
                      const barLeft = (day.low - rangeMin) / totalRange;
                      const barWidth = (day.high - day.low) / totalRange;
                      return (
                        <div key={i} className="flex items-center gap-3 py-1.5">
                          <span className="text-[13px] text-white/80 w-12 shrink-0">
                            {formatWeekday(day.date, i)}
                          </span>
                          <WeatherIcon code={day.weatherCode} className="w-4 h-4 text-white/70 shrink-0" />
                          {day.precipitationChance > 0 && (
                            <span className="text-[11px] text-blue-300/80 w-8 shrink-0 text-right">
                              {day.precipitationChance}%
                            </span>
                          )}
                          {day.precipitationChance === 0 && <span className="w-8 shrink-0" />}
                          <span className="text-[13px] text-white/50 w-8 text-right shrink-0">
                            {Math.round(day.low)}°
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 relative mx-1">
                            <div
                              className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-300"
                              style={{ left: `${barLeft * 100}%`, width: `${Math.max(barWidth * 100, 4)}%` }}
                            />
                          </div>
                          <span className="text-[13px] text-white w-8 shrink-0">
                            {Math.round(day.high)}°
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
