"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Loader2, Wand2, Lightbulb, ChevronsRight, SkipForward } from 'lucide-react';
import Link from 'next/link';
import { ethicalTopics, dilemmaIntensities, DilemmaIntensity, EthicalTopic } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';


export default function DilemmasPage() {
  const { 
    sessionUUID, 
    currentDilemma, 
    isLoadingAi, 
    answerAndReflect, 
    getNextDilemmaFromCorpus, 
    generateAndSetNewDilemma,
    corpusDilemmas,
    answeredDilemmas
  } = useAppContext();
  
  const [sliderValue, setSliderValue] = useState<number>(0.5); 
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<EthicalTopic>(ethicalTopics[0]);
  const [selectedIntensity, setSelectedIntensity] = useState<DilemmaIntensity>(dilemmaIntensities[0]);

  useEffect(() => {
    if (!sessionUUID) {
      // Consider redirecting or handling in AppContext if session is crucial before this page
    }
    setSliderValue(0.5);
    setShowReflection(false);
  }, [currentDilemma, sessionUUID]);

  const handleAnswer = async () => {
    if (currentDilemma) {
      await answerAndReflect(sliderValue);
      setShowReflection(true);
    }
  };

  const handleNextCorpusDilemma = () => {
    getNextDilemmaFromCorpus();
  };
  
  const handleGenerateNewDilemma = async () => {
    await generateAndSetNewDilemma(selectedTopic, selectedIntensity);
  };

  const progressPercentage = corpusDilemmas.length > 0 ? (answeredDilemmas.length / (corpusDilemmas.length + answeredDilemmas.filter(ad => ad.dilemma.id_dilema.startsWith("generated-")).length)) * 100 : 0;


  if (!sessionUUID) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Inicializando tu sesión anónima...</p>
        <p className="mt-2 text-sm">Si esto toma demasiado tiempo, por favor refresca la página.</p>
      </div>
    );
  }

  if (!currentDilemma) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {isLoadingAi ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Cargando dilema...</p>
          </>
        ) : (
          <>
            <p className="text-lg text-muted-foreground">No hay dilemas disponibles en este momento.</p>
            <Button onClick={handleNextCorpusDilemma} className="mt-4">Intentar cargar un dilema</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[calc(100vh-4rem)] justify-center">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Dilema Ético
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Tópico: {currentDilemma.topico_principal} | Intensidad: {currentDilemma.intensidad}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed text-center min-h-[6rem]">
            {currentDilemma.texto_dilema}
          </p>
          
          {!showReflection && (
            <>
              <div className="px-4">
                <Slider
                  value={[sliderValue]}
                  onValueChange={(value) => setSliderValue(value[0])}
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={isLoadingAi}
                  aria-label="Control deslizante de respuesta al dilema"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground px-1">
                <span>Inclínate a la Izquierda (ej. No)</span>
                <span>Inclínate a la Derecha (ej. Sí)</span>
              </div>
            </>
          )}

          {showReflection && currentDilemma?.kantianNarrative && (
            <Card className="bg-accent/20 border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Lightbulb size={20} />
                  Reflexión Kantiana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-normal">{currentDilemma.kantianNarrative}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
          {!showReflection ? (
            <Button onClick={handleAnswer} disabled={isLoadingAi} className="w-full sm:w-auto shadow-md">
              {isLoadingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar y Reflexionar
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button onClick={handleNextCorpusDilemma} variant="outline" className="flex-1 shadow-sm">
                <SkipForward className="mr-2 h-4 w-4" /> Siguiente Dilema (Corpus)
              </Button>
              <Button onClick={handleGenerateNewDilemma} variant="outline" className="flex-1 shadow-sm" disabled={isLoadingAi}>
                 {isLoadingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 <Wand2 className="mr-2 h-4 w-4" /> Generar Dilema
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {showReflection && (
        <div className="w-full max-w-2xl mt-4 p-4 bg-card border rounded-lg shadow">
          <p className="text-sm text-muted-foreground mb-2">Generar un nuevo dilema basado en:</p>
          <div className="flex gap-2 mb-2">
            <Select value={selectedTopic} onValueChange={(value) => setSelectedTopic(value as EthicalTopic)} disabled={isLoadingAi}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleccionar Tópico" />
              </SelectTrigger>
              <SelectContent>
                {ethicalTopics.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedIntensity} onValueChange={(value) => setSelectedIntensity(value as DilemmaIntensity)} disabled={isLoadingAi}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleccionar Intensidad" />
              </SelectTrigger>
              <SelectContent>
                {dilemmaIntensities.map(intensity => <SelectItem key={intensity} value={intensity}>{intensity}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-2xl mt-8">
        <Progress value={progressPercentage} className="w-full h-2" />
        <p className="text-sm text-muted-foreground text-center mt-2">
          {answeredDilemmas.length} dilema(s) reflexionados.
        </p>
      </div>

      {answeredDilemmas.length > 0 && (
         <Link href="/profile" className="mt-8">
            <Button variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              Ver Mi Perfil Ético <ChevronsRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
      )}
    </div>
  );
}
