
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Terminal, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function TechnicalSkillsAssessmentPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <Button variant="outline" size="sm" className="mb-4 w-fit" asChild>
            <Link href="/jobs/skill-assessments">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Skill Assessments
            </Link>
          </Button>
          <CardTitle className="text-2xl flex items-center">
            <Terminal className="mr-3 h-7 w-7 text-primary" />
            Technical Skill Assessments
          </CardTitle>
          <CardDescription>
            Validate your expertise in programming languages, frameworks, cloud technologies, and other technical domains.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold">Available Technical Assessments</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              This section will list available technical skill assessments. Examples might include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-5">
              <li>Python Programming</li>
              <li>React Development</li>
              <li>Java Fundamentals</li>
              <li>SQL and Database Management</li>
              <li>AWS Cloud Practitioner</li>
              <li>Cybersecurity Basics</li>
            </ul>
          </section>

          <div className="text-center mt-10 border-t pt-6">
            <p className="text-md font-semibold text-muted-foreground mb-2 flex items-center justify-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                Feature Under Development
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Specific technical assessments are currently being developed. Check back soon for a list of available tests!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
