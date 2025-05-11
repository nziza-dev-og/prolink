
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BarChart3, CheckSquare, FileText, Lightbulb, ListChecks, ChevronLeft, Terminal, Briefcase, Palette } from "lucide-react"; // Added new icons
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SkillAssessmentsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <Button variant="outline" size="sm" className="mb-4 w-fit" asChild>
            <Link href="/jobs">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
          <CardTitle className="text-3xl flex items-center">
            <Award className="mr-3 h-8 w-8 text-primary" />
            Skill Assessments
          </CardTitle>
          <CardDescription>
            Validate your skills and stand out to recruiters. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Available Assessment Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Terminal className="mr-2 h-5 w-5 text-blue-500"/>Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Assessments for programming languages, frameworks, and tools.</p>
                  <p className="text-xs text-amber-600 mb-3">(Coming Soon)</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/jobs/skill-assessments/technical">View Technical Assessments</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-green-500"/>Business Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Test your knowledge in areas like project management and marketing.</p>
                  <p className="text-xs text-amber-600 mb-3">(Coming Soon)</p>
                   <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/jobs/skill-assessments/business">View Business Assessments</Link>
                   </Button>
                </CardContent>
              </Card>
               <Card className="hover:shadow-md transition-shadow md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Palette className="mr-2 h-5 w-5 text-purple-500"/>Design Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Showcase your proficiency in design software and principles.</p>
                  <p className="text-xs text-amber-600 mb-3">(Coming Soon)</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/jobs/skill-assessments/design">View Design Assessments</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <ListChecks className="mr-2 h-6 w-6 text-primary" />
              How It Works (Planned)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground pl-2">
                <li>Choose an assessment relevant to your skills.</li>
                <li>Complete the timed, multiple-choice or practical test.</li>
                <li>If you pass, you can choose to display a badge on your ProLink profile.</li>
                <li>Showcase your verified skills to potential employers.</li>
            </ol>
          </section>

           <div className="text-center mt-10 border-t pt-6">
            <p className="text-md font-semibold text-muted-foreground mb-2 flex items-center justify-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                Feature Under Development
            </p>
            <p className="text-sm text-muted-foreground mb-4">This skill assessment feature is currently being built. Check back soon for updates!</p>
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

