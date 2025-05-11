
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Palette, Lightbulb, CheckCircle, Brush } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const availableAssessments = [
  { id: "ui_principles", name: "UI Design Principles", status: "Available", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  { id: "ux_research", name: "UX Research Fundamentals", status: "Coming Soon", icon: <Brush className="h-5 w-5 text-yellow-500" /> },
  { id: "photoshop", name: "Adobe Photoshop Proficiency", status: "Coming Soon", icon: <Brush className="h-5 w-5 text-yellow-500" /> },
  { id: "figma_ui", name: "Figma for UI Design", status: "Available", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  { id: "typography", name: "Typography and Layout", status: "Coming Soon", icon: <Brush className="h-5 w-5 text-yellow-500" /> },
];

export default function DesignSkillsAssessmentPage() {
  const { toast } = useToast();

  const handleStartAssessment = (assessmentName: string) => {
    toast({
      title: "Assessment Starting",
      description: `The "${assessmentName}" assessment will begin shortly. (This feature is currently a placeholder).`,
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30 p-6">
          <Button variant="outline" size="sm" className="mb-4 w-fit bg-background hover:bg-accent/10" asChild>
            <Link href="/jobs/skill-assessments">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Skill Assessments
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            <Palette className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Design Skill Assessments</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Showcase your skills in UI/UX design, graphic design, illustration, and various design tools.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our design skill assessments provide a platform for you to demonstrate your creative talents and technical proficiency in the design field. Whether you're a UI/UX expert, a graphic designer, or an illustrator, these tests can help validate your skills and make your profile more attractive to employers seeking design professionals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Available Assessments</h2>
            {availableAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableAssessments.map((assessment) => (
                  <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-x-2 pb-2">
                      <CardTitle className="text-md font-medium">{assessment.name}</CardTitle>
                       {assessment.icon}
                    </CardHeader>
                    <CardContent>
                      <p className={`text-xs ${assessment.status === "Available" ? "text-green-600" : "text-yellow-600"}`}>
                        Status: {assessment.status}
                      </p>
                    </CardContent>
                     <CardFooter>
                       <Button 
                        variant={assessment.status === "Available" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full"
                        onClick={assessment.status === "Available" ? () => handleStartAssessment(assessment.name) : undefined}
                        disabled={assessment.status !== "Available"}
                      >
                        {assessment.status === "Available" ? "Start Assessment" : "Coming Soon"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No design assessments are currently listed. Please check back later.</p>
            )}
          </section>

          <section className="mt-10 border-t pt-6 bg-secondary/50 p-6 rounded-lg">
            <div className="flex items-center justify-center space-x-3 mb-3">
                <Lightbulb className="h-8 w-8 text-yellow-500" />
                <h2 className="text-xl font-semibold text-center">Creative Horizons Expanding!</h2>
            </div>
            <p className="text-center text-muted-foreground">
              We're busy crafting new assessments for a variety of design disciplines, including illustration, motion graphics, and advanced tool proficiency. Check back soon to discover more ways to showcase your design talents!
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
