"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Dilemma, AnsweredDilemma, EthicalProfile, AnyDilemma, GeneratedDilemma } from '@/lib/types';
import AllDilemmasSeed from '@/data/corpus_dilemas.json'; // Seed dilemmas
import { generatePersonalizedDilemma } from '@/ai/flows/generate-dilemma';
import { generateKantianNarrative } from '@/ai/flows/kantian-reflection-narrative';

interface AppState {
  sessionUUID: string | null;
  corpusDilemmas: Dilemma[];
  answeredDilemmas: AnsweredDilemma[];
  currentDilemma: AnyDilemma | null;
  isLoadingAi: boolean;
  ethicalProfile: EthicalProfile | null;
}

interface AppContextType extends AppState {
  initializeSession: () => void;
  answerAndReflect: (responseValue: number) => Promise<void>;
  getNextDilemmaFromCorpus: () => void;
  generateAndSetNewDilemma: (topic: string, intensity: "Suave" | "Medio" | "Extremo") => Promise<void>;
  generateProfile: () => void;
  clearSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialCorpusDilemmas: Dilemma[] = AllDilemmasSeed as Dilemma[];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionUUID, setSessionUUID] = useState<string | null>(null);
  const [corpusDilemmas] = useState<Dilemma[]>(initialCorpusDilemmas);
  const [answeredDilemmas, setAnsweredDilemmas] = useState<AnsweredDilemma[]>([]);
  const [currentDilemma, setCurrentDilemma] = useState<AnyDilemma | null>(null);
  const [currentCorpusIndex, setCurrentCorpusIndex] = useState<number>(0);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [ethicalProfile, setEthicalProfile] = useState<EthicalProfile | null>(null);


  const initializeSession = useCallback(() => {
    let storedUUID = localStorage.getItem('ethicalCompassSessionUUID');
    if (!storedUUID) {
      storedUUID = crypto.randomUUID();
      localStorage.setItem('ethicalCompassSessionUUID', storedUUID);
    }
    setSessionUUID(storedUUID);
    // Load answered dilemmas from local storage if they exist for this session
    const storedAnswers = localStorage.getItem(`ethicalCompassAnswers-${storedUUID}`);
    if (storedAnswers) {
        const parsedAnswers = JSON.parse(storedAnswers) as AnsweredDilemma[];
        // Dates are stored as strings, convert them back
        parsedAnswers.forEach(ans => ans.timestamp = new Date(ans.timestamp));
        setAnsweredDilemmas(parsedAnswers);
    } else {
        setAnsweredDilemmas([]);
    }
    setEthicalProfile(null);
    setCurrentCorpusIndex(0);
    if (corpusDilemmas.length > 0) {
      setCurrentDilemma(corpusDilemmas[0]);
    }
  }, [corpusDilemmas]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);
  
  // Save answers to local storage whenever they change
  useEffect(() => {
    if (sessionUUID && answeredDilemmas.length > 0) {
      localStorage.setItem(`ethicalCompassAnswers-${sessionUUID}`, JSON.stringify(answeredDilemmas));
    } else if (sessionUUID && answeredDilemmas.length === 0) {
        localStorage.removeItem(`ethicalCompassAnswers-${sessionUUID}`);
    }
  }, [sessionUUID, answeredDilemmas]);


  const answerAndReflect = async (responseValue: number) => {
    if (!currentDilemma) return;
    setIsLoadingAi(true);
    try {
      const narrativeResult = await generateKantianNarrative({
        dilemmaText: currentDilemma.texto_dilema,
        userResponse: responseValue,
        topic: currentDilemma.topico_principal,
      });
      
      const newAnsweredDilemma: AnsweredDilemma = {
        dilemma: currentDilemma,
        userResponse: responseValue,
        kantianNarrative: narrativeResult.narrative,
        timestamp: new Date(),
      };
      setAnsweredDilemmas(prev => [...prev, newAnsweredDilemma]);
      setCurrentDilemma(prev => prev ? {...prev, kantianNarrative: narrativeResult.narrative } as AnyDilemma & { kantianNarrative?: string} : null); // Update current dilemma to show narrative
    } catch (error) {
      console.error("Error generating Kantian narrative:", error);
      // Store answer even if narrative fails
      const newAnsweredDilemma: AnsweredDilemma = {
        dilemma: currentDilemma,
        userResponse: responseValue,
        kantianNarrative: "Error generating reflection. Please try again later.",
        timestamp: new Date(),
      };
      setAnsweredDilemmas(prev => [...prev, newAnsweredDilemma]);
      setCurrentDilemma(prev => prev ? {...prev, kantianNarrative: "Error generating reflection."} as AnyDilemma & { kantianNarrative?: string } : null);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getNextDilemmaFromCorpus = () => {
    const nextIndex = (currentCorpusIndex + 1) % corpusDilemmas.length;
    setCurrentCorpusIndex(nextIndex);
    setCurrentDilemma(corpusDilemmas[nextIndex]);
  };

  const generateAndSetNewDilemma = async (topic: string, intensity: "Suave" | "Medio" | "Extremo") => {
    setIsLoadingAi(true);
    try {
      const seedExamples = corpusDilemmas
        .filter(d => d.topico_principal === topic && d.intensidad === intensity)
        .slice(0, 3); // Take up to 3 seed examples

      if (seedExamples.length === 0) {
        // Fallback if no specific seeds found, pick any 3
        seedExamples.push(...corpusDilemmas.slice(0,3));
      }
      
      // For userContext, we could summarize previous answers if needed.
      // For now, passing a generic or empty context.
      const userContext = answeredDilemmas.length > 0 
        ? `User has answered ${answeredDilemmas.length} dilemmas. Last answer on topic '${answeredDilemmas[answeredDilemmas.length-1].dilemma.topico_principal}' was ${answeredDilemmas[answeredDilemmas.length-1].userResponse}.`
        : "This is the user's first generated dilemma.";

      const result = await generatePersonalizedDilemma({
        topic,
        intensity,
        seedExamples,
        userContext,
      });
      
      const newGeneratedDilemma: GeneratedDilemma = {
        id_dilema: `generated-${Date.now()}`,
        texto_dilema: result.dilemmaText,
        topico_principal: topic,
        intensidad: intensity,
      };
      setCurrentDilemma(newGeneratedDilemma);
    } catch (error) {
      console.error("Error generating personalized dilemma:", error);
      // Fallback to a corpus dilemma or show error
      getNextDilemmaFromCorpus(); 
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  const generateProfile = () => {
    if (answeredDilemmas.length === 0) {
      setEthicalProfile({
        summary: "No dilemmas answered yet. Explore some dilemmas to generate your ethical profile.",
        visual_data: {},
        answeredDilemmas: []
      });
      return;
    }

    // Example summary - can be more sophisticated
    const topicsCovered = new Set(answeredDilemmas.map(ad => ad.dilemma.topico_principal));
    const summary = `You have reflected on ${answeredDilemmas.length} dilemma(s) covering ${topicsCovered.size} unique ethical topic(s).`;
    
    // visual_data could be responses per topic, average response, etc.
    // For simplicity, just pass all answered dilemmas for now.
    setEthicalProfile({
      summary,
      visual_data: { /* Can be expanded */ },
      answeredDilemmas: [...answeredDilemmas] 
    });
  };

  const clearSession = () => {
    if (sessionUUID) {
        localStorage.removeItem(`ethicalCompassAnswers-${sessionUUID}`);
        localStorage.removeItem('ethicalCompassSessionUUID');
    }
    setSessionUUID(null);
    setAnsweredDilemmas([]);
    setCurrentDilemma(null);
    setEthicalProfile(null);
    setCurrentCorpusIndex(0);
    // Re-initialize to get a new UUID or pick up an existing one if tab is not closed
    initializeSession();
  };


  return (
    <AppContext.Provider value={{ 
      sessionUUID, 
      corpusDilemmas,
      answeredDilemmas, 
      currentDilemma,
      isLoadingAi,
      ethicalProfile,
      initializeSession, 
      answerAndReflect,
      getNextDilemmaFromCorpus,
      generateAndSetNewDilemma,
      generateProfile,
      clearSession
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
