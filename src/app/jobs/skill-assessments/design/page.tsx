
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Palette, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function DesignSkillsAssessmentPage() {
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
            <Palette className="mr-3 h-7 w-7 text-primary" />
            Design Skill Assessments
          </CardTitle>
          <CardDescription>
            Showcase your skills in UI/UX design, graphic design, illustration, and various design tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold">Available Design Assessments</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              This section will list available design skill assessments. Examples might include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-5">
              <li>UI Design Principles</li>
              <li>UX Research Fundamentals</li>
              <li>Adobe Photoshop Proficiency</li>
              <li>Figma for UI Design</li>
              <li>Typography and Layout</li>
              <li>Illustration Basics</li>
            </ul>
          </section>

          <div className="text-center mt-10 border-t pt-6">
            <p className="text-md font-semibold text-muted-foreground mb-2 flex items-center justify-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                Feature Under Development
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Specific design skill assessments are currently being created. We appreciate your patience!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
