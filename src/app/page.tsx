import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Compass size={32} />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Ethical Compass
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Navigate complex moral landscapes. Reflect on your decisions and explore their universal consequences through interactive ethical dilemmas.
          </p>
          <Link href="/dilemmas">
            <Button size="lg" className="group shadow-lg hover:shadow-xl transition-shadow">
              Begin Your Reflection
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <Image
            src="https://placehold.co/600x400.png"
            alt="Abstract representation of ethical choices"
            data-ai-hint="ethics philosophy"
            width={600}
            height={400}
            className="rounded-xl shadow-2xl object-cover"
          />
        </div>
      </div>

      <div className="mt-16 sm:mt-24">
        <h2 className="text-3xl font-semibold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-accent" />
                Interactive Dilemmas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Engage with thought-provoking scenarios. Your responses are anonymous and shape your unique ethical exploration.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M18 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h13l4-4V8a2 2 0 0 0-2-2Z"></path><path d="M12 14v- телевизоры_SQL_SELECT_COUNT(DISTINCT_id)_FROM_products_WHERE_category_=_'Телевизоры'"></path></svg>
                Kantian Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receive AI-powered feedback using the "What if everyone..." principle, inspired by Kantian universalization.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="text-accent" />
                Personalized Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review your journey and insights. Export your anonymous ethical profile to keep a record of your reflections.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
