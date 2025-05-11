
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChevronLeft, Terminal, Lightbulb, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const availableAssessments = [
  { id: "python", name: "Python Programming Fundamentals", status: "Available", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  { id: "react", name: "React Core Concepts", status: "Available", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  { id: "sql", name: "SQL and Database Management", status: "Available", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  { id: "aws", name: "AWS Cloud Practitioner Essentials", status: "Coming Soon", icon: <Zap className="h-5 w-5 text-yellow-500" /> },
  { id: "cybersecurity", name: "Cybersecurity Basics", status: "Coming Soon", icon: <Zap className="h-5 w-5 text-yellow-500" /> },
];

export default function TechnicalSkillsAssessmentPage() {
  const { toast } = useToast();

  const handleStartAssessment = (assessmentName: string) => {
    toast({
      title: "Assessment Starting",
      description: `The "${assessmentName}" assessment will begin shortly. (This feature is currently a placeholder).`,
    });
    // In a real scenario, you would navigate to the assessment page or open a modal.
    // e.g., router.push(`/jobs/skill-assessments/technical/${assessment.id}/start`);
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
            <Terminal className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Technical Skill Assessments</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Validate your expertise in programming languages, frameworks, cloud technologies, and other technical domains.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our technical skill assessments are designed to help you showcase your proficiency in various technologies. Passing these assessments can help you stand out to potential employers and demonstrate your capabilities in specific technical areas. Each assessment typically involves a mix of multiple-choice questions and practical coding challenges where applicable.
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
              <p className="text-muted-foreground">No technical assessments are currently listed. Please check back later.</p>
            )}
          </section>

          <section className="mt-10 border-t pt-6 bg-secondary/50 p-6 rounded-lg">
            <div className="flex items-center justify-center space-x-3 mb-3">
                <Lightbulb className="h-8 w-8 text-yellow-500" />
                <h2 className="text-xl font-semibold text-center">More Assessments Under Development!</h2>
            </div>
            <p className="text-center text-muted-foreground">
              We are continuously working on adding new technical assessments to cover a wider range of skills and technologies. 
              Stay tuned for updates on assessments for areas like advanced JavaScript frameworks, specific cloud certifications, and more specialized technical domains.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
