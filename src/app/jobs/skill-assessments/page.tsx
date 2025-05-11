
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BarChart3, CheckSquare, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SkillAssessmentsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <Award className="mr-3 h-8 w-8 text-primary" />
            Skill Assessments
          </CardTitle>
          <CardDescription>
            Validate your skills and stand out to recruiters. (This feature is under development)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Available Assessment Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5"/>Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Assessments for programming languages, frameworks, and tools. (Coming Soon)</p>
                  <Button variant="outline" size="sm" className="mt-2" disabled>View Technical Assessments</Button>
                </CardContent>
              </Card>
              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><CheckSquare className="mr-2 h-5 w-5"/>Business Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Test your knowledge in areas like project management and marketing. (Coming Soon)</p>
                   <Button variant="outline" size="sm" className="mt-2" disabled>View Business Assessments</Button>
                </CardContent>
              </Card>
               <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><BarChart3 className="mr-2 h-5 w-5"/>Design Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Showcase your proficiency in design software and principles. (Coming Soon)</p>
                  <Button variant="outline" size="sm" className="mt-2" disabled>View Design Assessments</Button>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">How It Works (Planned)</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Choose an assessment relevant to your skills.</li>
                <li>Complete the timed, multiple-choice or practical test.</li>
                <li>If you pass, you can choose to display a badge on your ProLink profile.</li>
                <li>Showcase your verified skills to potential employers.</li>
            </ol>
          </section>

           <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">This feature is currently under development. Check back soon!</p>
            <Button onClick={() => window.history.back()}>Back to Jobs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
