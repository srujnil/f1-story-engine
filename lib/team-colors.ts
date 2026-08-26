const TEAM_COLORS: Record<string, string> = {
  Mercedes: "#27e0c1",
  Ferrari: "#ff4057",
  McLaren: "#ff8700",
  "Red Bull": "#5d7cff",
  "RB F1 Team": "#6fa8ff",
  Williams: "#46a7ff",
  Audi: "#c8ff3d",
  Alpine: "#ff73c8",
  "Alpine F1 Team": "#ff73c8",
  Haas: "#e4e7ec",
  "Haas F1 Team": "#e4e7ec",
  Cadillac: "#d7b56d",
  "Aston Martin": "#2bd4a7",
};

export function teamColor(team: string): string {
  return TEAM_COLORS[team] ?? "#a78bfa";
}
