export interface Dilemma {
  id_dilema: string;
  texto_dilema: string;
  topico_principal: string;
  intensidad: "Suave" | "Medio" | "Extremo";
  variable_oculta_primaria: string;
}

export interface GeneratedDilemma {
  id_dilema: string; // e.g., "generated-[timestamp]"
  texto_dilema: string;
  topico_principal: string; // The topic used to generate it
  intensidad: "Suave" | "Medio" | "Extremo"; // The intensity used to generate it
}

export type AnyDilemma = Dilemma | GeneratedDilemma;

export interface AnsweredDilemma {
  dilemma: AnyDilemma;
  userResponse: number; // Typically 0-1
  kantianNarrative: string | null;
  timestamp: Date;
}

export interface EthicalProfile {
  summary: string; // A textual summary
  // For visual_data, consider how you'll structure data for charts if you use them.
  // Example: responses per topic, intensity distribution, etc.
  visual_data: Record<string, any>; 
  answeredDilemmas: AnsweredDilemma[];
}

export type EthicalTopic = 
  | "Temporalidad Moral"
  | "Alteridad Radical"
  | "Imperativo de Universalización"
  | "Ontología de la Ignorancia"
  | "Economía Moral del Deseo"
  | "Microética Cotidiana";

export const ethicalTopics: EthicalTopic[] = [
  "Temporalidad Moral",
  "Alteridad Radical",
  "Imperativo de Universalización",
  "Ontología de la Ignorancia",
  "Economía Moral del Deseo",
  "Microética Cotidiana",
];

export type DilemmaIntensity = "Suave" | "Medio" | "Extremo";
export const dilemmaIntensities: DilemmaIntensity[] = ["Suave", "Medio", "Extremo"];

export interface TopicIconMapping {
  [key: string]: React.ElementType;
}
