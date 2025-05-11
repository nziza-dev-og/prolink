
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Lightbulb, MessageCircleQuestion, Presentation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InterviewPrepPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <ClipboardList className="mr-3 h-8 w-8 text-primary" />
            Interview Preparation Center
          </CardTitle>
          <CardDescription>
            Equip yourself with the tools and knowledge to ace your next interview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Key Preparation Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-yellow-500"/>Common Interview Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Practice common behavioral and technical questions. (Content coming soon)</p>
                  <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href="#">Explore Questions</Link></Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Presentation className="mr-2 h-5 w-5 text-blue-500"/>Mock Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Simulate interview scenarios to build confidence. (Feature planned)</p>
                   <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href="#">Schedule Mock Interview</Link></Button>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><MessageCircleQuestion className="mr-2 h-5 w-5 text-green-500"/>Company Research Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Learn how to effectively research companies you're interviewing with. (Guide upcoming)</p>
                  <Button variant="link" className="p-0 h-auto mt-2" asChild><Link href="#">Learn More</Link></Button>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Additional Resources</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>How to answer "Tell me about yourself?" (Article coming soon)</li>
                <li>STAR method for behavioral questions (Explanation coming soon)</li>
                <li>Questions to ask the interviewer (List coming soon)</li>
            </ul>
          </section>

          <div className="text-center mt-8">
            <Button onClick={() => window.history.back()}>Back to Jobs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
