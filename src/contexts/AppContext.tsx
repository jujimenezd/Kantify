"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  Dilemma,
  AnsweredDilemma,
  EthicalProfile,
  AnyDilemma,
  RAGDilemma,
} from "@/lib/types";
import AllDilemmasSeed from "@/data/corpus_dilemas.json";
import { ragApiClient, type RAGDilemmaRequest } from "@/lib/api-client";
import { generateKantianNarrative } from "@/ai/flows/kantian-reflection-narrative";
import { useToast } from "@/hooks/use-toast";

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
  generateAndSetNewDilemma: (
    topic: string,
    intensity: "Suave" | "Medio" | "Extremo"
  ) => Promise<void>;
  generateProfile: () => void;
  clearSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialCorpusDilemmas: Dilemma[] = AllDilemmasSeed as Dilemma[];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionUUID, setSessionUUID] = useState<string | null>(null);
  const [corpusDilemmas] = useState<Dilemma[]>(initialCorpusDilemmas);
  const [answeredDilemmas, setAnsweredDilemmas] = useState<AnsweredDilemma[]>(
    []
  );
  const [currentDilemma, setCurrentDilemma] = useState<
    (AnyDilemma & { kantianNarrative?: string | null }) | null
  >(null);
  const [currentCorpusIndex, setCurrentCorpusIndex] = useState<number>(0);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [ethicalProfile, setEthicalProfile] = useState<EthicalProfile | null>(
    null
  );
  const { toast } = useToast();

  const tryGenerateInitialRAGDilemma = useCallback(async () => {
    try {
      // Intentar generar un dilema RAG inicial sin mostrar loading
      const ragRequest: RAGDilemmaRequest = {
        topic: "Temporalidad Moral", // Tema por defecto
        intensity: "Suave",
        user_context: "Este es el primer dilema para el usuario.",
      };

      const result = await ragApiClient.generateDilemma(ragRequest);

      const initialRAGDilemma: RAGDilemma = {
        id_dilema: `rag-initial-${Date.now()}`,
        texto_dilema: result.dilemma_text,
        topico_principal: result.topic,
        intensidad: result.intensity as "Suave" | "Medio" | "Extremo",
        philosophical_foundation: result.philosophical_foundation,
        source: "rag",
      };

      // Solo reemplazar si el usuario no ha interactuado aún
      setCurrentDilemma((prev) => {
        if (prev && prev.id_dilema === "TM_S_01") {
          // Solo reemplazar el dilema inicial del corpus
          return { ...initialRAGDilemma, kantianNarrative: null };
        }
        return prev;
      });
    } catch (error) {
      // Fallar silenciosamente, mantener el dilema del corpus
      console.log(
        "No se pudo generar dilema RAG inicial, manteniendo dilema del corpus"
      );
    }
  }, []);

  const initializeSession = useCallback(() => {
    let storedUUID = localStorage.getItem("kantifySessionUUID");
    if (!storedUUID) {
      storedUUID = crypto.randomUUID();
      localStorage.setItem("kantifySessionUUID", storedUUID);
    }
    setSessionUUID(storedUUID);

    const storedAnswers = localStorage.getItem(`kantifyAnswers-${storedUUID}`);
    if (storedAnswers) {
      const parsedAnswers = JSON.parse(storedAnswers) as AnsweredDilemma[];
      parsedAnswers.forEach((ans) => (ans.timestamp = new Date(ans.timestamp)));
      setAnsweredDilemmas(parsedAnswers);
    } else {
      setAnsweredDilemmas([]);
    }

    setEthicalProfile(null);
    setCurrentCorpusIndex(0);

    if (corpusDilemmas.length > 0) {
      const firstDilemma = corpusDilemmas[0];
      // Chequear si este dilema ya fue respondido para mostrar su narrativa si existe
      const alreadyAnswered = answeredDilemmas.find(
        (ad) => ad.dilemma.id_dilema === firstDilemma.id_dilema
      );
      if (alreadyAnswered) {
        setCurrentDilemma({
          ...firstDilemma,
          kantianNarrative: alreadyAnswered.kantianNarrative || null,
        });
      } else {
        setCurrentDilemma({ ...firstDilemma, kantianNarrative: null });
        // Intentar generar un dilema RAG inicial en paralelo
        tryGenerateInitialRAGDilemma();
      }
    } else {
      setCurrentDilemma(null);
      toast({
        title: "Sin dilemas",
        description: "No se pudo cargar el corpus inicial de dilemas.",
        variant: "destructive",
      });
    }
  }, [corpusDilemmas, toast, tryGenerateInitialRAGDilemma]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (sessionUUID && answeredDilemmas.length > 0) {
      localStorage.setItem(
        `kantifyAnswers-${sessionUUID}`,
        JSON.stringify(answeredDilemmas)
      );
    } else if (sessionUUID && answeredDilemmas.length === 0) {
      localStorage.removeItem(`kantifyAnswers-${sessionUUID}`);
    }
  }, [sessionUUID, answeredDilemmas]);

  const answerAndReflect = async (responseValue: number) => {
    if (!currentDilemma) return;
    setIsLoadingAi(true);

    try {
      // Paso 1: Generar la reflexión kantiana
      const narrativeResult = await generateKantianNarrative({
        dilemmaText: currentDilemma.texto_dilema,
        userResponse: responseValue,
        topic: currentDilemma.topico_principal,
      });

      const { kantianNarrative, ...originalDilemmaForRecord } = currentDilemma;

      const newAnsweredDilemma: AnsweredDilemma = {
        dilemma: originalDilemmaForRecord as AnyDilemma,
        userResponse: responseValue,
        kantianNarrative: narrativeResult.narrative,
        timestamp: new Date(),
      };

      setAnsweredDilemmas((prev) => [...prev, newAnsweredDilemma]);
      setCurrentDilemma((prev) =>
        prev ? { ...prev, kantianNarrative: narrativeResult.narrative } : null
      );

      // Paso 2: Generar automáticamente un nuevo dilema con RAG
      try {
        const userContext = `El usuario ha respondido a ${
          answeredDilemmas.length + 1
        } dilemas. La última respuesta sobre el tópico '${
          currentDilemma.topico_principal
        }' fue ${responseValue}.`;

        // Usar el mismo tópico del dilema actual o uno aleatorio
        const availableTopics = [
          "Temporalidad Moral",
          "Alteridad Radical",
          "Imperativo de Universalización",
          "Ontología de la Ignorancia",
          "Economía Moral del Deseo",
          "Microética Cotidiana",
        ];
        const randomTopic =
          availableTopics[Math.floor(Math.random() * availableTopics.length)];
        const randomIntensity = ["Suave", "Medio", "Extremo"][
          Math.floor(Math.random() * 3)
        ] as "Suave" | "Medio" | "Extremo";

        const ragRequest: RAGDilemmaRequest = {
          topic: randomTopic,
          intensity: randomIntensity,
          user_context: userContext,
        };

        const result = await ragApiClient.generateDilemma(ragRequest);

        const newRAGDilemma: RAGDilemma = {
          id_dilema: `rag-auto-${Date.now()}`,
          texto_dilema: result.dilemma_text,
          topico_principal: result.topic,
          intensidad: result.intensity as "Suave" | "Medio" | "Extremo",
          philosophical_foundation: result.philosophical_foundation,
          source: "rag",
        };

        // Esperar un momento para que el usuario vea la reflexión, luego cambiar el dilema
        setTimeout(() => {
          setCurrentDilemma({ ...newRAGDilemma, kantianNarrative: null });
          setIsLoadingAi(false);
          toast({
            title: "Nuevo dilema generado",
            description: `Dilema sobre "${result.topic}" listo para responder.`,
            variant: "default",
          });
        }, 2000);
      } catch (ragError: any) {
        console.error("Error generando dilema RAG:", ragError);
        // Fallback: siguiente dilema del corpus después de un momento
        setTimeout(() => {
          getNextDilemmaFromCorpus();
          setIsLoadingAi(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error generando la narrativa Kantiana:", error);
      toast({
        title: "Error de IA",
        description: `No se pudo generar la reflexión kantiana: ${
          error.message || "Error desconocido"
        }`,
        variant: "destructive",
      });
      const { kantianNarrative, ...originalDilemmaForRecord } = currentDilemma;
      const newAnsweredDilemma: AnsweredDilemma = {
        dilemma: originalDilemmaForRecord as AnyDilemma,
        userResponse: responseValue,
        kantianNarrative:
          "Error al generar la reflexión. Por favor, inténtalo más tarde o revisa la consola para más detalles.",
        timestamp: new Date(),
      };
      setAnsweredDilemmas((prev) => [...prev, newAnsweredDilemma]);
      setCurrentDilemma((prev) =>
        prev
          ? { ...prev, kantianNarrative: "Error al generar la reflexión." }
          : null
      );
      setIsLoadingAi(false);
    }
  };

  const getNextDilemmaFromCorpus = () => {
    if (corpusDilemmas.length === 0) {
      toast({
        title: "Sin dilemas",
        description: "No hay más dilemas en el corpus.",
        variant: "default",
      });
      return;
    }
    setIsLoadingAi(true);
    const nextIndex = (currentCorpusIndex + 1) % corpusDilemmas.length;
    setCurrentCorpusIndex(nextIndex);
    const nextDilemma = corpusDilemmas[nextIndex];
    const alreadyAnswered = answeredDilemmas.find(
      (ad) => ad.dilemma.id_dilema === nextDilemma.id_dilema
    );
    if (alreadyAnswered) {
      setCurrentDilemma({
        ...nextDilemma,
        kantianNarrative: alreadyAnswered.kantianNarrative || null,
      });
    } else {
      setCurrentDilemma({ ...nextDilemma, kantianNarrative: null });
    }
    setIsLoadingAi(false);
  };

  const generateAndSetNewDilemma = async (
    topic: string,
    intensity: "Suave" | "Medio" | "Extremo"
  ) => {
    setIsLoadingAi(true);

    try {
      const userContext =
        answeredDilemmas.length > 0
          ? `El usuario ha respondido a ${
              answeredDilemmas.length
            } dilemas. La última respuesta sobre el tópico '${
              answeredDilemmas[answeredDilemmas.length - 1].dilemma
                .topico_principal
            }' fue ${
              answeredDilemmas[answeredDilemmas.length - 1].userResponse
            }.`
          : "Este es el primer dilema generado para el usuario.";

      const ragRequest: RAGDilemmaRequest = {
        topic,
        intensity,
        user_context: userContext,
      };

      const result = await ragApiClient.generateDilemma(ragRequest);

      const newRAGDilemma: RAGDilemma = {
        id_dilema: `rag-${Date.now()}`,
        texto_dilema: result.dilemma_text,
        topico_principal: result.topic,
        intensidad: result.intensity as "Suave" | "Medio" | "Extremo",
        philosophical_foundation: result.philosophical_foundation,
        source: "rag",
      };
      setCurrentDilemma({ ...newRAGDilemma, kantianNarrative: null });

      toast({
        title: "Dilema generado",
        description:
          "Nuevo dilema basado en fundamentos filosóficos generado exitosamente.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error generando dilema con RAG:", error);
      toast({
        title: "Error de RAG",
        description: `No se pudo generar un nuevo dilema: ${
          error.message || "Error desconocido"
        }. Se mostrará uno del corpus.`,
        variant: "destructive",
      });
      // Fallback a un dilema del corpus si la generación RAG falla
      getNextDilemmaFromCorpus();
    } finally {
      setIsLoadingAi(false);
    }
  };

  const generateProfile = useCallback(() => {
    setIsLoadingAi(true);
    if (answeredDilemmas.length === 0) {
      setEthicalProfile({
        summary:
          "Aún no has respondido a ningún dilema. Explora algunos dilemas para generar tu perfil ético.",
        visual_data: {},
        answeredDilemmas: [],
      });
      setIsLoadingAi(false);
      return;
    }

    const topicsCovered = new Set(
      answeredDilemmas.map((ad) => ad.dilemma.topico_principal)
    );
    const summary = `Has reflexionado sobre ${answeredDilemmas.length} dilema(s) cubriendo ${topicsCovered.size} tópico(s) ético(s) único(s).`;

    const responsesPerTopic: Record<string, number[]> = {};
    answeredDilemmas.forEach((ad) => {
      if (!responsesPerTopic[ad.dilemma.topico_principal]) {
        responsesPerTopic[ad.dilemma.topico_principal] = [];
      }
      responsesPerTopic[ad.dilemma.topico_principal].push(ad.userResponse);
    });

    const averageResponsePerTopic: Record<string, number> = {};
    for (const topic in responsesPerTopic) {
      const responses = responsesPerTopic[topic];
      averageResponsePerTopic[topic] =
        responses.reduce((a, b) => a + b, 0) / responses.length;
    }

    setEthicalProfile({
      summary,
      visual_data: {
        totalAnswered: answeredDilemmas.length,
        topicsList: Array.from(topicsCovered),
        averageResponsePerTopic,
      },
      answeredDilemmas: [...answeredDilemmas].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      ),
    });
    setIsLoadingAi(false);
  }, [answeredDilemmas]); // Solo depende de answeredDilemmas

  const clearSession = () => {
    if (sessionUUID) {
      localStorage.removeItem(`kantifyAnswers-${sessionUUID}`);
      localStorage.removeItem("kantifySessionUUID");
    }
    setSessionUUID(null);
    setAnsweredDilemmas([]);
    setCurrentDilemma(null);
    setEthicalProfile(null);
    setCurrentCorpusIndex(0);
    // No llames a initializeSession() aquí directamente para evitar bucles,
    // el useEffect [initializeSession] se encargará si es necesario un nuevo UUID.
    // Forzamos una recarga para asegurar un estado limpio si es necesario.
    // window.location.reload(); // O una forma más suave de re-inicializar el estado
    // Mejor, simplemente permitir que el useEffect de initializeSession haga su trabajo
    // al detectar que sessionUUID es null.
    // Para forzar la creación de un nuevo UUID, primero establecemos sessionUUID a null
    // y luego llamamos a initializeSession en el siguiente ciclo de renderizado.
    // Esto es manejado por el useEffect que depende de initializeSession.
    // Si queremos un nuevo UUID *inmediatamente*:
    const newUUID = crypto.randomUUID();
    localStorage.setItem("kantifySessionUUID", newUUID);
    setSessionUUID(newUUID);
    // Y luego dejar que initializeSession se ejecute con este nuevo UUID.
    // El initializeSession ya se llama en un useEffect, asi que esto deberia ser suficiente.
    // O simplemente llamar initializeSession después de limpiar.
    initializeSession();
  };

  return (
    <AppContext.Provider
      value={{
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
        clearSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error(
      "useAppContext debe ser utilizado dentro de un AppProvider"
    );
  }
  return context;
};
