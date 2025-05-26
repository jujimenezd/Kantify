
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Lightbulb, UserCircle } from "lucide-react"; 
import Image from "next/image";
import Link from "next/link";
import KantifyLogo from "@/components/KantifyLogo"; 

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2">
          <div className="flex items-center gap-2 text-primary mb-4">
            <KantifyLogo className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Kantify
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Navega por paisajes morales complejos. Reflexiona sobre tus decisiones y explora sus consecuencias universales a través de dilemas éticos interactivos.
          </p>
          <Link href="/dilemmas">
            <Button size="lg" className="group shadow-lg hover:shadow-xl transition-shadow">
              Comienza tu Reflexión
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <Image
            src="/gemini.jpg" // Cambiado para apuntar a gemini.jpg en la carpeta public
            alt="Representación abstracta de elecciones éticas y huellas digitales de identidad"
            width={500} 
            height={500} 
            className="rounded-xl shadow-2xl object-cover"
            priority 
          />
        </div>
      </div>

      <div className="mt-16 sm:mt-24">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Cómo Funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-accent" />
                Dilemas Interactivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Participa en escenarios que invitan a la reflexión. Tus respuestas son anónimas y dan forma a tu exploración ética única.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-accent" />
                Reflexión Kantiana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Recibe retroalimentación impulsada por IA usando el principio "¿Qué pasaría si todos...?", inspirado en la universalización kantiana.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="text-accent" /> 
                Perfil Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Revisa tu recorrido y perspectivas. Exporta tu perfil ético anónimo para mantener un registro de tus reflexiones.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
