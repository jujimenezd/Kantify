"use client";

import { useEffect, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Download, RefreshCw, BarChart3, MessageSquareQuote, Clock3, Users2, Scale3d, SearchSlash, HeartHandshake, Home as HomeIcon, Lightbulb } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Link from 'next/link';
import type { TopicIconMapping } from '@/lib/types';

const topicIcons: TopicIconMapping = {
  "Temporalidad Moral": Clock3,
  "Alteridad Radical": Users2,
  "Imperativo de Universalización": Scale3d,
  "Ontología de la Ignorancia": SearchSlash,
  "Economía Moral del Deseo": HeartHandshake,
  "Microética Cotidiana": HomeIcon,
};

export default function ProfilePage() {
  const { ethicalProfile, generateProfile, answeredDilemmas, clearSession, sessionUUID, isLoadingAi } = useAppContext();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionUUID && !ethicalProfile && answeredDilemmas.length > 0) {
      generateProfile();
    }
  }, [sessionUUID, ethicalProfile, generateProfile, answeredDilemmas]);

  const handlePrint = useReactToPrint({
    content: () => profileRef.current,
    documentTitle: `Kantify-Perfil-${sessionUUID || 'anonimo'}`,
  });

  if (!sessionUUID) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Sesión no encontrada. Por favor, comienza una nueva reflexión.</p>
        <Link href="/">
          <Button className="mt-4">Ir al Inicio</Button>
        </Link>
      </div>
    );
  }
  
  if (isLoadingAi && !ethicalProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <RefreshCw className="mr-2 h-8 w-8 animate-spin inline-block" />
        <p className="text-lg text-muted-foreground mt-2">Generando tu perfil ético...</p>
      </div>
    )
  }

  if (!ethicalProfile && answeredDilemmas.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Aún no has respondido ningún dilema.</p>
        <Link href="/dilemmas">
          <Button className="mt-4">Comenzar a Reflexionar</Button>
        </Link>
      </div>
    );
  }
  
  if (!ethicalProfile) { // This case implies answeredDilemmas.length > 0 but profile not yet generated.
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Cargando tu perfil ético...</p>
        <Button onClick={generateProfile} className="mt-4" disabled={isLoadingAi}>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generar Perfil
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-xl" ref={profileRef}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Tu Perfil Ético</CardTitle>
              <CardDescription>Un resumen de tus reflexiones y perspectivas.</CardDescription>
            </div>
            <div className="print:hidden">
                <Button onClick={handlePrint} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exportar como PDF
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-accent" />
                Resumen General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{ethicalProfile.summary}</p>
              {Object.keys(ethicalProfile.visual_data).length > 0 && (
                <div className="mt-4 p-4 border rounded-md bg-secondary/10">
                  <h4 className="font-semibold mb-2">Datos Clave (para visualizaciones futuras):</h4>
                  <pre className="text-xs whitespace-pre-wrap bg-muted/50 p-2 rounded">
                    {JSON.stringify(ethicalProfile.visual_data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquareQuote className="text-accent" />
              Reflexiones Detalladas
            </h3>
            {ethicalProfile.answeredDilemmas.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {ethicalProfile.answeredDilemmas.map((item, index) => {
                  const IconComponent = topicIcons[item.dilemma.topico_principal] || Lightbulb; // Fallback to Lightbulb
                  return (
                    <AccordionItem value={`item-${index}`} key={item.dilemma.id_dilema + '-' + index}>
                      <AccordionTrigger className="hover:bg-secondary/20 px-4 rounded-md">
                        <div className="flex items-center gap-3 text-left">
                           <IconComponent className="h-5 w-5 text-primary shrink-0" />
                           <span className="flex-1">{item.dilemma.texto_dilema.substring(0,80)}{item.dilemma.texto_dilema.length > 80 ? '...' : ''}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2 pb-4 space-y-3 bg-background/50 rounded-b-md">
                        <p><strong>Tu Respuesta (escala 0-1):</strong> {item.userResponse.toFixed(2)}</p>
                        <p><strong>Tópico:</strong> {item.dilemma.topico_principal}</p>
                        <p><strong>Intensidad:</strong> {item.dilemma.intensidad}</p>
                        {item.kantianNarrative && (
                          <div className="mt-2 p-3 border rounded-md bg-accent/10">
                            <h5 className="font-semibold flex items-center gap-1.5 text-primary">
                              <Lightbulb size={16}/> Reflexión Kantiana ("Y si todos..."):
                            </h5>
                            <p className="text-sm text-muted-foreground mt-1">{item.kantianNarrative}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Respondido el: {new Date(item.timestamp).toLocaleString('es-ES')}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <p className="text-muted-foreground">Aún no se han respondido dilemas en detalle.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="print:hidden flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
          <Link href="/dilemmas">
            <Button variant="outline">Reflexionar sobre Más Dilemas</Button>
          </Link>
          <Button onClick={clearSession} variant="destructive">
            <RefreshCw className="mr-2 h-4 w-4" /> Iniciar Nueva Sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
