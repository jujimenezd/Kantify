"use client";

import { useEffect, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Download, RefreshCw, BarChart3, MessageSquareQuote, Clock3, Users2, Scale3d, SearchSlash, HeartHandshake, Home as HomeIcon } from 'lucide-react';
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
  const { ethicalProfile, generateProfile, answeredDilemmas, clearSession, sessionUUID } = useAppContext();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ethicalProfile && answeredDilemmas.length > 0) {
      generateProfile();
    }
  }, [ethicalProfile, generateProfile, answeredDilemmas]);

  const handlePrint = useReactToPrint({
    content: () => profileRef.current,
    documentTitle: `Ethical-Compass-Profile-${sessionUUID || 'anonymous'}`,
  });

  if (!sessionUUID) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Session not found. Please start a new reflection.</p>
        <Link href="/">
          <Button className="mt-4">Go to Home</Button>
        </Link>
      </div>
    );
  }
  
  if (!ethicalProfile && answeredDilemmas.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">You haven't answered any dilemmas yet.</p>
        <Link href="/dilemmas">
          <Button className="mt-4">Start Reflecting</Button>
        </Link>
      </div>
    );
  }
  
  if (!ethicalProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Generating your ethical profile...</p>
        <Button onClick={generateProfile} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generate Profile
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
              <CardTitle className="text-3xl font-bold text-primary">Your Ethical Profile</CardTitle>
              <CardDescription>A summary of your reflections and insights.</CardDescription>
            </div>
            {/* Hide button in print view */}
            <div className="print:hidden">
                <Button onClick={handlePrint} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export as PDF
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-accent" />
                Overall Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{ethicalProfile.summary}</p>
              {/* Placeholder for potential visualizations. Could be a simple list for now. */}
              {Object.keys(ethicalProfile.visual_data).length > 0 && (
                <div className="mt-4 p-4 border rounded-md bg-secondary/30">
                  <h4 className="font-semibold mb-2">Visual Data Insights:</h4>
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(ethicalProfile.visual_data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquareQuote className="text-accent" />
              Detailed Reflections
            </h3>
            {ethicalProfile.answeredDilemmas.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {ethicalProfile.answeredDilemmas.map((item, index) => {
                  const IconComponent = topicIcons[item.dilemma.topico_principal] || BarChart3;
                  return (
                    <AccordionItem value={`item-${index}`} key={item.dilemma.id_dilema + index}>
                      <AccordionTrigger className="hover:bg-secondary/50 px-4 rounded-md">
                        <div className="flex items-center gap-3 text-left">
                           <IconComponent className="h-5 w-5 text-primary shrink-0" />
                           <span className="flex-1">{item.dilemma.texto_dilema.substring(0,80)}{item.dilemma.texto_dilema.length > 80 ? '...' : ''}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2 pb-4 space-y-3 bg-background rounded-b-md">
                        <p><strong>Your Response (0-1 scale):</strong> {item.userResponse.toFixed(2)}</p>
                        <p><strong>Topic:</strong> {item.dilemma.topico_principal}</p>
                        <p><strong>Intensity:</strong> {item.dilemma.intensidad}</p>
                        {item.kantianNarrative && (
                          <div>
                            <h5 className="font-semibold mt-2">Kantian Reflection:</h5>
                            <p className="text-sm text-muted-foreground">{item.kantianNarrative}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Responded on: {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <p className="text-muted-foreground">No dilemmas have been answered in detail yet.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="print:hidden flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
          <Link href="/dilemmas">
            <Button variant="outline">Reflect on More Dilemmas</Button>
          </Link>
          <Button onClick={clearSession} variant="destructive">
            <RefreshCw className="mr-2 h-4 w-4" /> Start New Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
