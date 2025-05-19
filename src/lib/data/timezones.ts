// src/lib/data/timezones.ts

export interface TimeZoneOption {
  value: string;
  label: string;
}

export const timeZoneOptions: TimeZoneOption[] = [
  // North America
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Phoenix', label: 'Phoenix (MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Anchorage', label: 'Anchorage (AKST/AKDT)' },
  { value: 'America/Honolulu', label: 'Honolulu (HST)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
  { value: 'America/Edmonton', label: 'Edmonton (MST/MDT)' },
  { value: 'America/Winnipeg', label: 'Winnipeg (CST/CDT)' },
  { value: 'America/Halifax', label: 'Halifax (AST/ADT)' },
  { value: 'America/St_Johns', label: 'St. John\'s (NST/NDT)' },
  { value: 'America/Regina', label: 'Regina (CST)' },
  { value: 'America/Nassau', label: 'Nassau (EST/EDT)' },
  { value: 'America/Jamaica', label: 'Kingston (EST)' },
  { value: 'America/Santo_Domingo', label: 'Santo Domingo (AST)' },
  { value: 'America/Havana', label: 'Havana (CST/CDT)' },
  { value: 'America/Costa_Rica', label: 'San Jose (CST)' },
  { value: 'America/Panama', label: 'Panama City (EST)' },
  { value: 'America/Guatemala', label: 'Guatemala City (CST)' },
  { value: 'America/Tegucigalpa', label: 'Tegucigalpa (CST)' },
  { value: 'America/El_Salvador', label: 'San Salvador (CST)' },
  { value: 'America/Managua', label: 'Managua (CST)' },
  { value: 'America/Belize', label: 'Belize City (CST)' },
  { value: 'America/Puerto_Rico', label: 'San Juan (AST)' },

  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
  { value: 'America/Caracas', label: 'Caracas (VET)' },
  { value: 'America/Santiago', label: 'Santiago (CLT/CLST)' },
  { value: 'America/Montevideo', label: 'Montevideo (UYT/UYST)' },
  { value: 'America/Asuncion', label: 'Asunción (PYT/PYST)' },
  { value: 'America/La_Paz', label: 'La Paz (BOT)' },
  { value: 'America/Guyana', label: 'Georgetown (GYT)' },
  { value: 'America/Cayenne', label: 'Cayenne (GFT)' },
  { value: 'America/Paramaribo', label: 'Paramaribo (SRT)' },
  { value: 'America/Guayaquil', label: 'Guayaquil (ECT)' },

  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)' },
  { value: 'Europe/Kyiv', label: 'Kyiv (EET/EEST)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (WET/WEST)' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
  { value: 'Europe/Brussels', label: 'Brussels (CET/CEST)' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (CET/CEST)' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET/EEST)' },
  { value: 'Europe/Oslo', label: 'Oslo (CET/CEST)' },
  { value: 'Europe/Prague', label: 'Prague (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
  { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)' },
  { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)' },
  { value: 'Europe/Bucharest', label: 'Bucharest (EET/EEST)' },
  { value: 'Europe/Budapest', label: 'Budapest (CET/CEST)' },
  { value: 'Europe/Minsk', label: 'Minsk (MSK)' },
  { value: 'Europe/Sofia', label: 'Sofia (EET/EEST)' },
  { value: 'Europe/Belgrade', label: 'Belgrade (CET/CEST)' },
  { value: 'Europe/Bratislava', label: 'Bratislava (CET/CEST)' },
  { value: 'Europe/Ljubljana', label: 'Ljubljana (CET/CEST)' },
  { value: 'Europe/Riga', label: 'Riga (EET/EEST)' },
  { value: 'Europe/Tallinn', label: 'Tallinn (EET/EEST)' },
  { value: 'Europe/Vilnius', label: 'Vilnius (EET/EEST)' },
  { value: 'Europe/Tirane', label: 'Tirane (CET/CEST)' },
  { value: 'Europe/Chisinau', label: 'Chisinau (EET/EEST)' },
  { value: 'Europe/Kaliningrad', label: 'Kaliningrad (EET)' },
  { value: 'Europe/Volgograd', label: 'Volgograd (MSK)' }, // MSK, was UTC+3 then UTC+4, check current status
  { value: 'Europe/Samara', label: 'Samara (SAMT)' },
  { value: 'Europe/Saratov', label: 'Saratov (MSK+1)'}, // MSK+1 = UTC+4

  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Casablanca', label: 'Casablanca (WEST/WET)' }, // Check current state, often GMT+1
  { value: 'Africa/Algiers', label: 'Algiers (CET)' },
  { value: 'Africa/Accra', label: 'Accra (GMT)' },
  { value: 'Africa/Dakar', label: 'Dakar (GMT)' },
  { value: 'Africa/Tunis', label: 'Tunis (CET)' },
  { value: 'Africa/Khartoum', label: 'Khartoum (CAT)' },
  { value: 'Africa/Tripoli', label: 'Tripoli (EET)' },
  { value: 'Africa/Windhoek', label: 'Windhoek (CAT/WAT)' }, // Namibia has complex DST
  { value: 'Africa/Maputo', label: 'Maputo (CAT)' },
  { value: 'Africa/Harare', label: 'Harare (CAT)' },
  { value: 'Africa/Lusaka', label: 'Lusaka (CAT)' },
  { value: 'Africa/Abidjan', label: 'Abidjan (GMT)' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa (EAT)' },
  { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam (EAT)' },
  { value: 'Africa/Mogadishu', label: 'Mogadishu (EAT)' },

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (IST/IDT)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)' },
  { value: 'Asia/Tehran', label: 'Tehran (IRST/IRDT)' },
  { value: 'Asia/Baghdad', label: 'Baghdad (AST)' },
  { value: 'Asia/Baku', label: 'Baku (AZT)' },
  { value: 'Asia/Beirut', label: 'Beirut (EET/EEST)' },
  { value: 'Asia/Damascus', label: 'Damascus (EET/EEST)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (ICT)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)' },
  { value: 'Asia/Manila', label: 'Manila (PHT)' },
  { value: 'Asia/Taipei', label: 'Taipei (CST)' },
  { value: 'Asia/Yangon', label: 'Yangon (MMT)' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu (NPT)' },
  { value: 'Asia/Kabul', label: 'Kabul (AFT)' },
  { value: 'Asia/Tashkent', label: 'Tashkent (UZT)' },
  { value: 'Asia/Yerevan', label: 'Yerevan (AMT)' },
  { value: 'Asia/Tbilisi', label: 'Tbilisi (GET)' },
  { value: 'Asia/Almaty', label: 'Almaty (ALMT)' },
  { value: 'Asia/Bishkek', label: 'Bishkek (KGT)' },
  { value: 'Asia/Dushanbe', label: 'Dushanbe (TJT)' },
  { value: 'Asia/Ashgabat', label: 'Ashgabat (TMT)' },
  { value: 'Asia/Pyongyang', label: 'Pyongyang (KST)' },
  { value: 'Asia/Ulaanbaatar', label: 'Ulaanbaatar (ULAT/ULAST)' },
  { value: 'Asia/Phnom_Penh', label: 'Phnom Penh (ICT)' },
  { value: 'Asia/Vientiane', label: 'Vientiane (ICT)' },
  { value: 'Asia/Colombo', label: 'Colombo (SLST)' },
  { value: 'Asia/Muscat', label: 'Muscat (GST)' },
  { value: 'Asia/Qatar', label: 'Qatar (AST)' },
  { value: 'Asia/Bahrain', label: 'Bahrain (AST)' },
  { value: 'Asia/Kuwait', label: 'Kuwait City (AST)' },
  { value: 'Asia/Amman', label: 'Amman (EET/EEST)' },
  { value: 'Asia/Yakutsk', label: 'Yakutsk (YAKT/YAKST)' },
  { value: 'Asia/Vladivostok', label: 'Vladivostok (VLAT/VLAST)' },
  { value: 'Asia/Magadan', label: 'Magadan (MAGT/MAGST)' },
  { value: 'Asia/Kamchatka', label: 'Petropavlovsk-Kamchatsky (PETT/PETST)' },
  { value: 'Asia/Yekaterinburg', label: 'Yekaterinburg (YEKT/YEKST)' },
  { value: 'Asia/Novosibirsk', label: 'Novosibirsk (NOVT/NOVST)' },
  { value: 'Asia/Krasnoyarsk', label: 'Krasnoyarsk (KRAT/KRAST)' },
  { value: 'Asia/Irkutsk', label: 'Irkutsk (IRKT/IRKST)' },


  // Australia & Oceania
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)' },
  { value: 'Australia/Darwin', label: 'Darwin (ACST)' },
  { value: 'Australia/Hobart', label: 'Hobart (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)' },
  { value: 'Pacific/Guam', label: 'Guam (ChST)' },
  { value: 'Pacific/Port_Moresby', label: 'Port Moresby (PGT)' },
  { value: 'Pacific/Tahiti', label: 'Tahiti (TAHT)' },
  { value: 'Pacific/Apia', label: 'Apia (WST/WSDT)' }, // Samoa
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)' }, // Repeated for clarity, same as America/Honolulu
  { value: 'Pacific/Noumea', label: 'Nouméa (NCT)' }, // New Caledonia
  { value: 'Pacific/Tongatapu', label: 'Nuku\'alofa (TOT)' }, // Tonga
  { value: 'Pacific/Kiritimati', label: 'Kiritimati (LINT)' }, // Line Islands, Kiribati (UTC+14)

  // Atlantic
  { value: 'Atlantic/Azores', label: 'Azores (AZOT/AZOST)' },
  { value: 'Atlantic/Cape_Verde', label: 'Cape Verde (CVT)' },
  { value: 'Atlantic/Canary', label: 'Canary Islands (WET/WEST)' },
  { value: 'Atlantic/Reykjavik', label: 'Reykjavik (GMT)' }, // Iceland
  { value: 'Atlantic/South_Georgia', label: 'South Georgia (GST)' },
  { value: 'Atlantic/Stanley', label: 'Stanley (FKT/FKST)' }, // Falkland Islands

  // Indian Ocean
  { value: 'Indian/Maldives', label: 'Maldives (MVT)' },
  { value: 'Indian/Mauritius', label: 'Mauritius (MUT)' },
  { value: 'Indian/Reunion', label: 'Réunion (RET)' },
  { value: 'Indian/Christmas', label: 'Christmas Island (CXT)' },
  { value: 'Indian/Cocos', label: 'Cocos Islands (CCT)' },
  { value: 'Indian/Kerguelen', label: 'Kerguelen (TFT)' }, // French Southern Territories
  { value: 'Indian/Mahe', label: 'Mahe (SCT)' }, // Seychelles

  // Etc
  { value: 'Etc/UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Etc/GMT', label: 'GMT (Greenwich Mean Time)' },
  { value: 'Etc/GMT+1', label: 'GMT+1' },
  { value: 'Etc/GMT+2', label: 'GMT+2' },
  { value: 'Etc/GMT+3', label: 'GMT+3' },
  { value: 'Etc/GMT+4', label: 'GMT+4' },
  { value: 'Etc/GMT+5', label: 'GMT+5' },
  { value: 'Etc/GMT+6', label: 'GMT+6' },
  { value: 'Etc/GMT+7', label: 'GMT+7' },
  { value: 'Etc/GMT+8', label: 'GMT+8' },
  { value: 'Etc/GMT+9', label: 'GMT+9' },
  { value: 'Etc/GMT+10', label: 'GMT+10' },
  { value: 'Etc/GMT+11', label: 'GMT+11' },
  { value: 'Etc/GMT+12', label: 'GMT+12' },
  { value: 'Etc/GMT-1', label: 'GMT-1' },
  { value: 'Etc/GMT-2', label: 'GMT-2' },
  { value: 'Etc/GMT-3', label: 'GMT-3' },
  { value: 'Etc/GMT-4', label: 'GMT-4' },
  { value: 'Etc/GMT-5', label: 'GMT-5' },
  { value: 'Etc/GMT-6', label: 'GMT-6' },
  { value: 'Etc/GMT-7', label: 'GMT-7' },
  { value: 'Etc/GMT-8', label: 'GMT-8' },
  { value: 'Etc/GMT-9', label: 'GMT-9' },
  { value: 'Etc/GMT-10', label: 'GMT-10' },
  { value: 'Etc/GMT-11', label: 'GMT-11' },
  { value: 'Etc/GMT-12', label: 'GMT-12' },
  { value: 'Etc/GMT-13', label: 'GMT-13' },
  { value: 'Etc/GMT-14', label: 'GMT-14' },
];

// A smaller list of cities commonly used for sunrise/sunset lookups
// This can be expanded or replaced with a geocoding solution later.
export interface CityLocation {
  name: string;
  lat: number;
  lon: number;
  timeZone: string; // IANA timezone name
}

export const majorCitiesForSunriseSunset: CityLocation[] = [
  { name: "New York", lat: 40.7128, lon: -74.0060, timeZone: "America/New_York" },
  { name: "London", lat: 51.5074, lon: -0.1278, timeZone: "Europe/London" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, timeZone: "Europe/Paris" },
  { name: "Berlin", lat: 52.5200, lon: 13.4050, timeZone: "Europe/Berlin" },
  { name: "Tokyo", lat: 35.6895, lon: 139.6917, timeZone: "Asia/Tokyo" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, timeZone: "Australia/Sydney" },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437, timeZone: "America/Los_Angeles" },
  { name: "Chicago", lat: 41.8781, lon: -87.6298, timeZone: "America/Chicago" },
  { name: "Moscow", lat: 55.7558, lon: 37.6173, timeZone: "Europe/Moscow" },
  { name: "Beijing", lat: 39.9042, lon: 116.4074, timeZone: "Asia/Shanghai" }, // Uses Shanghai timezone
  { name: "Shanghai", lat: 31.2304, lon: 100.4737, timeZone: "Asia/Shanghai" },
  { name: "Dubai", lat: 25.276987, lon: 55.296249, timeZone: "Asia/Dubai" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, timeZone: "Asia/Singapore" },
  { name: "Rome", lat: 41.9028, lon: 12.4964, timeZone: "Europe/Rome" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, timeZone: "Africa/Cairo" },
  { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, timeZone: "America/Sao_Paulo" },
  { name: "Mexico City", lat: 19.4326, lon: -99.1332, timeZone: "America/Mexico_City" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, timeZone: "Asia/Kolkata" }, // Uses Kolkata timezone
  { name: "Delhi", lat: 28.7041, lon: 77.1025, timeZone: "Asia/Kolkata" }, // Uses Kolkata timezone
  { name: "Lagos", lat: 6.5244, lon: 3.3792, timeZone: "Africa/Lagos" },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816, timeZone: "America/Buenos_Aires" },
  { name: "Toronto", lat: 43.6532, lon: -79.3832, timeZone: "America/Toronto" },
  { name: "Vancouver", lat: 49.2827, lon: -123.1207, timeZone: "America/Vancouver" },
  { name: "Johannesburg", lat: -26.2041, lon: 28.0473, timeZone: "Africa/Johannesburg" },
  { name: "Auckland", lat: -36.8485, lon: 174.7633, timeZone: "Pacific/Auckland" },
];
