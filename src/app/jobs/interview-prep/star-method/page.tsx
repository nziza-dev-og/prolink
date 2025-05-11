
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Star } from "lucide-react";
import Link from "next/link";

export default function StarMethodPage() {
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
            <Star className="mr-3 h-7 w-7 text-primary fill-primary" />
            The STAR Method for Behavioral Questions
          </CardTitle>
          <CardDescription>
            Structure your answers effectively to showcase your skills and experiences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm max-w-none">
          <p>
            Behavioral interview questions are designed to assess how you've handled specific situations in the past, as past performance is often a good indicator of future behavior. The STAR method is a structured way to respond to these questions, ensuring your answers are clear, concise, and impactful.
          </p>

          <section>
            <h3 className="text-xl font-semibold">What Does STAR Stand For?</h3>
            <ul className="list-none pl-0 space-y-2">
              <li><strong>S - Situation:</strong> Describe the context. What was the situation or challenge you faced?</li>
              <li><strong>T - Task:</strong> What was your specific role or responsibility in that situation? What was the goal?</li>
              <li><strong>A - Action:</strong> What specific steps did you take to address the situation or accomplish the task?</li>
              <li><strong>R - Result:</strong> What was the outcome of your actions? Quantify your achievements whenever possible. What did you learn?</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold">Why Use the STAR Method?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Provides Structure:</strong> Helps you organize your thoughts and deliver a coherent story.</li>
              <li><strong>Ensures Completeness:</strong> Makes sure you cover all the key aspects of your experience.</li>
              <li><strong>Demonstrates Skills:</strong> Allows you to clearly illustrate your skills and abilities through real-life examples.</li>
              <li><strong>Keeps You Focused:</strong> Prevents rambling and helps you stay on topic.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold">How to Apply the STAR Method</h3>
            <p>Let's break down an example. Suppose the interviewer asks: "Tell me about a time you had to work under a tight deadline."</p>

            <h4 className="font-semibold mt-2">Situation:</h4>
            <p className="italic text-muted-foreground">
              "In my previous role as a Project Coordinator at Alpha Corp, we were tasked with launching a new client onboarding portal. Due to an unexpected shift in market demands, the original project timeline of three months was suddenly compressed to just six weeks."
            </p>

            <h4 className="font-semibold mt-2">Task:</h4>
            <p className="italic text-muted-foreground">
              "My main responsibility was to re-evaluate the project plan, coordinate with the development and content teams, and ensure we could still deliver a high-quality portal within the new, aggressive deadline without compromising essential features."
            </p>

            <h4 className="font-semibold mt-2">Action:</h4>
            <p className="italic text-muted-foreground">
              "First, I organized an emergency meeting with all stakeholders to identify the absolute critical path and MVP features. We decided to use an agile approach, breaking down tasks into smaller, manageable sprints. I implemented daily stand-up meetings to track progress and quickly address any roadblocks. I also negotiated with the content team to prioritize essential materials and worked closely with developers to streamline testing phases. I took on some extra tasks myself, like user acceptance testing, to help move things along."
            </p>

            <h4 className="font-semibold mt-2">Result:</h4>
            <p className="italic text-muted-foreground">
              "As a result of these focused efforts and improved coordination, we successfully launched the client onboarding portal by the revised deadline. The launch was smooth, and initial client feedback was very positive, with a 15% increase in onboarding completion rates within the first month. This experience taught me the importance of clear communication, prioritization, and adaptability in high-pressure situations."
            </p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold">Tips for Using STAR Effectively</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Prepare Examples:</strong> Before the interview, brainstorm common behavioral questions (e.g., teamwork, problem-solving, leadership, failure) and prepare specific examples using the STAR format.</li>
                <li><strong>Be Specific:</strong> Vague answers are less impactful. Provide details about what *you* did.</li>
                <li><strong>Quantify Results:</strong> Use numbers and data to demonstrate the impact of your actions whenever possible (e.g., "increased sales by 10%", "reduced errors by 5%").</li>
                <li><strong>Focus on Your Role:</strong> Even if it was a team effort, highlight your individual contributions. Use "I" statements.</li>
                <li><strong>Be Honest:</strong> Don't exaggerate or make up stories. Authenticity is key.</li>
                <li><strong>Keep it Concise:</strong> While detailed, aim for an answer that is around 2-3 minutes. Practice helps with timing.</li>
                <li><strong>Tailor to the Role:</strong> Choose examples that showcase skills relevant to the job you're interviewing for.</li>
            </ul>
          </section>
          <p>
            Mastering the STAR method can significantly improve your performance in behavioral interviews, allowing you to present your experiences in a compelling and professional manner.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
