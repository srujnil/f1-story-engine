type CircuitAsset = {
  asset: string;
  countryCode: string;
};

const CIRCUIT_ASSETS: Array<{
  matches: string[];
  asset: string;
}> = [
  { matches: ["albert park"], asset: "albert_park" },
  { matches: ["shanghai"], asset: "shanghai" },
  { matches: ["suzuka"], asset: "suzuka" },
  { matches: ["miami"], asset: "miami" },
  { matches: ["gilles villeneuve", "villeneuve"], asset: "villeneuve" },
  { matches: ["monaco"], asset: "monaco" },
  { matches: ["barcelona", "catalunya"], asset: "catalunya" },
  { matches: ["red bull ring", "spielberg"], asset: "red_bull_ring" },
  { matches: ["silverstone"], asset: "silverstone" },
  { matches: ["spa-francorchamps", "spa francorchamps"], asset: "spa" },
  { matches: ["hungaroring"], asset: "hungaroring" },
  { matches: ["zandvoort"], asset: "zandvoort" },
  { matches: ["monza", "autodromo nazionale monza"], asset: "monza" },
  { matches: ["madring"], asset: "madring" },
  { matches: ["baku"], asset: "baku" },
  { matches: ["sepang"], asset: "sepang" },
  { matches: ["marina bay"], asset: "marina_bay" },
  { matches: ["circuit of the americas", "americas"], asset: "americas" },
  { matches: ["hermanos rodr", "rodriguez"], asset: "rodriguez" },
  { matches: ["jos\u00e9 carlos pace", "jose carlos pace", "interlagos"], asset: "interlagos" },
  { matches: ["las vegas"], asset: "vegas" },
  { matches: ["lusail", "losail"], asset: "losail" },
  { matches: ["yas marina"], asset: "yas_marina" },
  { matches: ["bahrain international"], asset: "bahrain" },
  { matches: ["jeddah"], asset: "jeddah" },
];

const COUNTRY_CODES: Record<string, string> = {
  australia: "AU",
  china: "CN",
  japan: "JP",
  usa: "US",
  "united states": "US",
  canada: "CA",
  monaco: "MC",
  spain: "ES",
  austria: "AT",
  uk: "GB",
  "united kingdom": "GB",
  belgium: "BE",
  hungary: "HU",
  netherlands: "NL",
  italy: "IT",
  azerbaijan: "AZ",
  malaysia: "MY",
  singapore: "SG",
  mexico: "MX",
  brazil: "BR",
  qatar: "QA",
  uae: "AE",
  "united arab emirates": "AE",
  bahrain: "BH",
  "saudi arabia": "SA",
};

export function circuitAssetFor(
  circuitName: string,
  country: string,
): CircuitAsset | null {
  const normalizedCircuit = circuitName.toLowerCase();
  const match = CIRCUIT_ASSETS.find(({ matches }) =>
    matches.some((candidate) => normalizedCircuit.includes(candidate)),
  );
  const countryCode = COUNTRY_CODES[country.toLowerCase()];

  if (!match || !countryCode) return null;

  return { asset: match.asset, countryCode };
}

export function countryFlag(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}
