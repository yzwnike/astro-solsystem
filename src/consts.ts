// Base del CDN (Bunny.net) para las imágenes de la landing de aire acondicionado.
// La carpeta tiene espacios, por eso van codificados como %20.
// Uso: `${CDN_IMAGES}/aire1.webp`
export const CDN_IMAGES =
  "https://lanzadera-digital.b-cdn.net/solsystems.es/Landing%20aires%20acondicionados";

// Configuración por ciudad: cada landing (Madrid / Barcelona) muestra SOLO su
// propia información (teléfono, sede) para máxima relevancia y Quality Score.
export interface CityInfo {
  slug: string;
  name: string;
  phone: string;        // formato tel: +34...
  phoneDisplay: string; // "656 701 824"
  whatsapp: string;     // dígitos para wa.me
  sedeShort: string;    // "Alcorcón (Madrid)"
  sedeAddress: string;  // dirección completa
  street: string;       // para schema streetAddress
  locality: string;     // para schema addressLocality
  region: string;       // para schema addressRegion
  postalCode: string;
  url: string;          // URL canónica de la landing
}

export const CITY_MADRID: CityInfo = {
  slug: "madrid",
  name: "Madrid",
  phone: "+34656701824",
  phoneDisplay: "656 701 824",
  whatsapp: "34656701824",
  sedeShort: "Alcorcón (Madrid)",
  sedeAddress: "Calle Físicas 40, 28923 Alcorcón, Madrid",
  street: "Calle Físicas 40",
  locality: "Alcorcón",
  region: "Madrid",
  postalCode: "28923",
  url: "https://solsystems.es/instalacion-aire-acondicionado-madrid/",
};

export const CITY_BARCELONA: CityInfo = {
  slug: "barcelona",
  name: "Barcelona",
  phone: "+34695047081",
  phoneDisplay: "695 047 081",
  whatsapp: "34695047081",
  sedeShort: "Montgat (Barcelona)",
  sedeAddress: "Passeig de les Vilares 14 B, 08390 Montgat, Barcelona",
  street: "Passeig de les Vilares 14 B",
  locality: "Montgat",
  region: "Barcelona",
  postalCode: "08390",
  url: "https://solsystems.es/instalacion-aire-acondicionado-barcelona/",
};

// Landing general (sin ciudad): no puede atarse a una sede, así que muestra las
// dos y deja que el usuario elija con quién contacta.
export const CITIES: CityInfo[] = [CITY_MADRID, CITY_BARCELONA];

export const AIRE_GENERAL_URL =
  "https://solsystems.es/instalacion-aire-acondicionado/";
