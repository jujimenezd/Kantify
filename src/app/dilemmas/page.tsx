"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Loader2, RotateCcw, Wand2, Lightbulb, ChevronsRight, SkipForward } from 'lucide-react';
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
  
  const [sliderValue, setSliderValue] = useState<number>(0.5); // Default to middle of 0-1 scale
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<EthicalTopic>(ethicalTopics[0]);
  const [selectedIntensity, setSelectedIntensity] = useState<DilemmaIntensity>(dilemmaIntensities[0]);

  const currentDilemmaExtended = currentDilemma as (typeof currentDilemma & { kantianNarrative?: string });


  useEffect(() => {
    if (!sessionUUID) {
      // router.push('/'); // Redirect if no session, or handle in AppContext
    }
    // Reset slider and reflection visibility when dilemma changes
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
        <p className="mt-4 text-lg text-muted-foreground">Initializing your anonymous session...</p>
        <p className="mt-2 text-sm">If this takes too long, please refresh the page.</p>
      </div>
    );
  }

  if (!currentDilemma) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">No dilemmas available at the moment.</p>
        <Button onClick={handleNextCorpusDilemma} className="mt-4">Try loading a dilemma</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[calc(100vh-4rem)] justify-center">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Ethical Dilemma
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Topic: {currentDilemma.topico_principal} | Intensity: {currentDilemma.intensidad}
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
                  aria-label="Dilemma response slider"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground px-1">
                <span>Lean Left (e.g. Disagree / No)</span>
                <span>Lean Right (e.g. Agree / Yes)</span>
              </div>
            </>
          )}

          {showReflection && currentDilemmaExtended?.kantianNarrative && (
            <Card className="bg-accent/20 border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Lightbulb size={20} />
                  Kantian Reflection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-normal">{currentDilemmaExtended.kantianNarrative}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
          {!showReflection ? (
            <Button onClick={handleAnswer} disabled={isLoadingAi} className="w-full sm:w-auto shadow-md">
              {isLoadingAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit & Reflect
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button onClick={handleNextCorpusDilemma} variant="outline" className="flex-1 shadow-sm">
                <SkipForward className="mr-2 h-4 w-4" /> Next Corpus Dilemma
              </Button>
              <Button onClick={handleGenerateNewDilemma} variant="outline" className="flex-1 shadow-sm">
                 <Wand2 className="mr-2 h-4 w-4" /> Custom Dilemma
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {showReflection && (
        <div className="w-full max-w-2xl mt-4 p-4 bg-card border rounded-lg shadow">
          <p className="text-sm text-muted-foreground mb-2">Generate a new dilemma based on:</p>
          <div className="flex gap-2 mb-2">
            <Select value={selectedTopic} onValueChange={(value) => setSelectedTopic(value as EthicalTopic)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {ethicalTopics.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedIntensity} onValueChange={(value) => setSelectedIntensity(value as DilemmaIntensity)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Intensity" />
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
          {answeredDilemmas.length} dilemma(s) reflected upon.
        </p>
      </div>

      {answeredDilemmas.length > 0 && (
         <Link href="/profile" className="mt-8">
            <Button variant="default" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              View My Ethical Profile <ChevronsRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
      )}
    </div>
  );
}
