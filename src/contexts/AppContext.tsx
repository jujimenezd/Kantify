"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Dilemma, AnsweredDilemma, EthicalProfile, AnyDilemma, GeneratedDilemma } from '@/lib/types';
import AllDilemmasSeed from '@/data/corpus_dilemas.json'; 
import { generatePersonalizedDilemma } from '@/ai/flows/generate-dilemma';
import { generateKantianNarrative } from '@/ai/flows/kantian-reflection-narrative';

interface AppState {
  sessionUUID: string | null;
  corpusDilemmas: Dilemma[];
  answeredDilemmas: AnsweredDilemma[];
  currentDilemma: (AnyDilemma & { kantianNarrative?: string | null }) | null;
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
  const [currentDilemma, setCurrentDilemma] = useState<(AnyDilemma & { kantianNarrative?: string | null }) | null>(null);
  const [currentCorpusIndex, setCurrentCorpusIndex] = useState<number>(0);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [ethicalProfile, setEthicalProfile] = useState<EthicalProfile | null>(null);


  const initializeSession = useCallback(() => {
    let storedUUID = localStorage.getItem('kantifySessionUUID'); // Updated key
    if (!storedUUID) {
      storedUUID = crypto.randomUUID();
      localStorage.setItem('kantifySessionUUID', storedUUID); // Updated key
    }
    setSessionUUID(storedUUID);
    
    const storedAnswers = localStorage.getItem(`kantifyAnswers-${storedUUID}`); // Updated key
    if (storedAnswers) {
        const parsedAnswers = JSON.parse(storedAnswers) as AnsweredDilemma[];
        parsedAnswers.forEach(ans => ans.timestamp = new Date(ans.timestamp));
        setAnsweredDilemmas(parsedAnswers);
    } else {
        setAnsweredDilemmas([]);
    }
    
    setEthicalProfile(null);
    setCurrentCorpusIndex(0);

    if (corpusDilemmas.length > 0) {
      const firstDilemma = corpusDilemmas[0];
      const alreadyAnswered = answeredDilemmas.find(ad => ad.dilemma.id_dilema === firstDilemma.id_dilema);
      if (alreadyAnswered) {
         setCurrentDilemma({ ...firstDilemma, kantianNarrative: alreadyAnswered.kantianNarrative || null });
      } else {
         setCurrentDilemma({ ...firstDilemma, kantianNarrative: null });
      }
    } else {
        setCurrentDilemma(null);
    }
  }, [corpusDilemmas]); // Removed answeredDilemmas from deps to avoid potential loops on init

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);
  
  useEffect(() => {
    if (sessionUUID && answeredDilemmas.length > 0) {
      localStorage.setItem(`kantifyAnswers-${sessionUUID}`, JSON.stringify(answeredDilemmas)); // Updated key
    } else if (sessionUUID && answeredDilemmas.length === 0) {
        localStorage.removeItem(`kantifyAnswers-${sessionUUID}`); // Updated key
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
      
      // Use the currentDilemma without its old narrative for the AnsweredDilemma record
      const { kantianNarrative, ...originalDilemmaForRecord } = currentDilemma;

      const newAnsweredDilemma: AnsweredDilemma = {
        dilemma: originalDilemmaForRecord as AnyDilemma, // Ensure it's the base dilemma type
        userResponse: responseValue,
        kantianNarrative: narrativeResult.narrative,
        timestamp: new Date(),
      };
      setAnsweredDilemmas(prev => [...prev, newAnsweredDilemma]);
      setCurrentDilemma(prev => prev ? {...prev, kantianNarrative: narrativeResult.narrative } : null);
    } catch (error) {
      console.error("Error generando la narrativa Kantiana:", error);
      const { kantianNarrative, ...originalDilemmaForRecord } = currentDilemma;
      const newAnsweredDilemma: AnsweredDilemma = {
        dilemma: originalDilemmaForRecord as AnyDilemma,
        userResponse: responseValue,
        kantianNarrative: "Error al generar la reflexión. Por favor, inténtalo más tarde.",
        timestamp: new Date(),
      };
      setAnsweredDilemmas(prev => [...prev, newAnsweredDilemma]);
      setCurrentDilemma(prev => prev ? {...prev, kantianNarrative: "Error al generar la reflexión."} : null);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getNextDilemmaFromCorpus = () => {
    setIsLoadingAi(true); // Show loading while switching
    const nextIndex = (currentCorpusIndex + 1) % corpusDilemmas.length;
    setCurrentCorpusIndex(nextIndex);
    const nextDilemma = corpusDilemmas[nextIndex];
    const alreadyAnswered = answeredDilemmas.find(ad => ad.dilemma.id_dilema === nextDilemma.id_dilema);
     if (alreadyAnswered) {
         setCurrentDilemma({ ...nextDilemma, kantianNarrative: alreadyAnswered.kantianNarrative || null });
      } else {
         setCurrentDilemma({ ...nextDilemma, kantianNarrative: null });
      }
    setIsLoadingAi(false);
  };

  const generateAndSetNewDilemma = async (topic: string, intensity: "Suave" | "Medio" | "Extremo") => {
    setIsLoadingAi(true);
    try {
      let seedExamples = corpusDilemmas
        .filter(d => d.topico_principal === topic && d.intensidad === intensity)
        .slice(0, 3); 

      if (seedExamples.length === 0) {
        // Fallback if no specific seeds found, pick any 3 from the same topic if possible, or just any 3.
        seedExamples = corpusDilemmas.filter(d => d.topico_principal === topic).slice(0,3);
        if (seedExamples.length === 0) {
            seedExamples = corpusDilemmas.slice(0,3);
        }
      }
      
      const userContext = answeredDilemmas.length > 0 
        ? `El usuario ha respondido a ${answeredDilemmas.length} dilemas. La última respuesta sobre el tópico '${answeredDilemmas[answeredDilemmas.length-1].dilemma.topico_principal}' fue ${answeredDilemmas[answeredDilemmas.length-1].userResponse}.`
        : "Este es el primer dilema generado para el usuario.";

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
      setCurrentDilemma({...newGeneratedDilemma, kantianNarrative: null});
    } catch (error) {
      console.error("Error generando dilema personalizado:", error);
      setCurrentDilemma(prev => prev ? {...prev, kantianNarrative: "Error al generar nuevo dilema."} : 
        (corpusDilemmas.length > 0 ? {...corpusDilemmas[0], kantianNarrative: "Error al generar nuevo dilema."} : null)
      );
      // Fallback to a corpus dilemma might be better here if generation fails often
      // getNextDilemmaFromCorpus(); 
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  const generateProfile = () => {
    setIsLoadingAi(true);
    if (answeredDilemmas.length === 0) {
      setEthicalProfile({
        summary: "Aún no has respondido a ningún dilema. Explora algunos dilemas para generar tu perfil ético.",
        visual_data: {},
        answeredDilemmas: []
      });
       setIsLoadingAi(false);
      return;
    }

    const topicsCovered = new Set(answeredDilemmas.map(ad => ad.dilemma.topico_principal));
    const summary = `Has reflexionado sobre ${answeredDilemmas.length} dilema(s) cubriendo ${topicsCovered.size} tópico(s) ético(s) único(s).`;
    
    // Simple aggregation for visual_data example
    const responsesPerTopic: Record<string, number[]> = {};
    answeredDilemmas.forEach(ad => {
      if (!responsesPerTopic[ad.dilemma.topico_principal]) {
        responsesPerTopic[ad.dilemma.topico_principal] = [];
      }
      responsesPerTopic[ad.dilemma.topico_principal].push(ad.userResponse);
    });
    
    const averageResponsePerTopic: Record<string, number> = {};
    for (const topic in responsesPerTopic) {
      const responses = responsesPerTopic[topic];
      averageResponsePerTopic[topic] = responses.reduce((a, b) => a + b, 0) / responses.length;
    }

    setEthicalProfile({
      summary,
      visual_data: { 
        totalAnswered: answeredDilemmas.length,
        topicsList: Array.from(topicsCovered),
        averageResponsePerTopic,
       },
      answeredDilemmas: [...answeredDilemmas].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()) // Show newest first
    });
    setIsLoadingAi(false);
  };

  const clearSession = () => {
    if (sessionUUID) {
        localStorage.removeItem(`kantifyAnswers-${sessionUUID}`); // Updated key
        localStorage.removeItem('kantifySessionUUID'); // Updated key
    }
    setSessionUUID(null);
    setAnsweredDilemmas([]);
    setCurrentDilemma(null);
    setEthicalProfile(null);
    setCurrentCorpusIndex(0);
    initializeSession(); // Re-initialize to get a new UUID
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
    throw new Error('useAppContext debe ser utilizado dentro de un AppProvider');
  }
  return context;
};
