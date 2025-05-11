
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, MessageSquarePlus } from "lucide-react";
import Link from "next/link";

export default function QuestionsToAskPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <Button variant="outline" size="sm" className="mb-4" asChild>
            <Link href="/jobs/interview-prep">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Interview Prep
            </Link>
          </Button>
          <CardTitle className="text-2xl flex items-center">
            <MessageSquarePlus className="mr-3 h-7 w-7 text-primary" />
            Questions to Ask the Interviewer
          </CardTitle>
          <CardDescription>
            Asking thoughtful questions demonstrates your engagement and helps you assess if the role and company are a good fit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm max-w-none">
          <p>
            At the end of most interviews, you'll be given the opportunity to ask questions. This is not just a formality; it's a valuable chance to show your interest, clarify any doubts, and gain deeper insights into the role, team, and company culture. Always prepare a few questions in advance.
          </p>

          <section>
            <h3 className="text-xl font-semibold">Why Asking Questions is Important</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Shows Genuine Interest:</strong> Thoughtful questions indicate you've done your research and are serious about the opportunity.</li>
              <li><strong>Helps You Evaluate Fit:</strong> The interviewer's answers can help you decide if the company and role are right for you.</li>
              <li><strong>Clarifies Expectations:</strong> You can get a better understanding of the day-to-day responsibilities and success metrics.</li>
              <li><strong>Demonstrates Initiative:</strong> It shows you're proactive and engaged in the conversation.</li>
              <li><strong>Leaves a Positive Lasting Impression:</strong> It ends the interview on a proactive and inquisitive note.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold">Categories of Questions to Consider</h3>

            <h4 className="font-semibold mt-2">About the Role:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>"Can you describe a typical day or week in this role?"</li>
              <li>"What are the key performance indicators (KPIs) for this position?"</li>
              <li>"What are the biggest challenges someone in this role might face?"</li>
              <li>"What does success look like in the first 30, 60, or 90 days?"</li>
              <li>"Are there opportunities for professional development or further training in this role?"</li>
              <li>"How does this role contribute to the overall goals of the department/company?"</li>
            </ul>

            <h4 className="font-semibold mt-2">About the Team and Company Culture:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>"Can you tell me about the team I'd be working with?"</li>
              <li>"How would you describe the company culture?"</li>
              <li>"What is the team's biggest strength and its biggest challenge right now?"</li>
              <li>"How does the company support collaboration and teamwork?"</li>
              <li>"What's your favorite part about working here?" (Ask the interviewer directly)</li>
              <li>"What are the company's plans for growth and development in the next few years?"</li>
            </ul>

            <h4 className="font-semibold mt-2">About Expectations and Next Steps:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>"What are the next steps in the interview process?"</li>
              <li>"Is there anything else I can provide to help you with your decision?"</li>
              <li>"When can I expect to hear back?"</li>
              <li>(If appropriate and not covered) "What is the typical career path for someone in this role?"</li>
            </ul>
            
            <h4 className="font-semibold mt-2">Deeper Dive Questions (if appropriate):</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>"I read about [specific company project/initiative/value]. Can you tell me more about how this role might contribute to that?"</li>
              <li>"What are some of the current industry trends that are impacting the company?"</li>
              <li>"How does the company foster innovation and new ideas?"</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold">Questions to Avoid</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Anything easily found online:</strong> Shows a lack of research (e.g., "What does your company do?").</li>
                <li><strong>Salary and benefits (too early):</strong> Unless the interviewer brings it up first, save this for later stages, typically when an offer is being discussed.</li>
                <li><strong>"Do I have the job?":</strong> Puts the interviewer on the spot.</li>
                <li><strong>Negative questions:</strong> Avoid questions that sound like you're looking for problems (e.g., "What are the worst parts about working here?"). Frame inquiries about challenges constructively.</li>
                <li><strong>Personal questions:</strong> Keep it professional.</li>
                <li><strong>No questions at all:</strong> This can signal a lack of interest or preparation.</li>
            </ul>
          </section>
          <p>
            Listen carefully during the interview, as some of your prepared questions might be answered. If so, acknowledge that and perhaps ask a follow-up question or move to another prepared question. Having 3-5 good questions ready is a solid strategy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
