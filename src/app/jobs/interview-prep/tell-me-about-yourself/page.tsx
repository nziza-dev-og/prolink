
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function TellMeAboutYourselfPage() {
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
            <HelpCircle className="mr-3 h-7 w-7 text-primary" />
            Answering "Tell Me About Yourself?"
          </CardTitle>
          <CardDescription>
            Craft a concise and compelling narrative that highlights your relevant skills and experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm max-w-none">
          <p>
            The question "Tell me about yourself?" is often one of the first questions you'll hear in an interview. It's a common icebreaker, but it's also a crucial opportunity to make a strong first impression and set the tone for the rest of the conversation.
          </p>

          <section>
            <h3 className="text-xl font-semibold">Why Interviewers Ask This</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>To ease into the interview and get a sense of your communication style.</li>
              <li>To understand your background and how it relates to the role.</li>
              <li>To see how you perceive your own strengths and career trajectory.</li>
              <li>To gauge your professionalism and confidence.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold">How to Structure Your Answer</h3>
            <p>
              A good approach is to follow a "Present-Past-Future" model or a "Relevant Skills & Experience" model. Aim for an answer that is about 1-2 minutes long.
            </p>
            <h4 className="font-semibold mt-2">1. Present:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Start with your current role or most recent significant experience.</li>
              <li>Briefly describe your key responsibilities and one or two major accomplishments.</li>
              <li>Tailor this to be relevant to the job you're interviewing for.</li>
            </ul>
            <p className="italic text-muted-foreground">
              Example: "Currently, I'm a Senior Software Engineer at Tech Solutions, where I specialize in developing and maintaining scalable front-end applications using React and TypeScript. In my recent project, I led a team to redesign our main dashboard, which resulted in a 20% improvement in user engagement."
            </p>

            <h4 className="font-semibold mt-2">2. Past:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Briefly mention previous experiences that have equipped you with relevant skills for this role.</li>
              <li>Focus on experiences that demonstrate your growth and capabilities.</li>
              <li>Avoid a chronological recital of your entire resume. Pick highlights.</li>
            </ul>
            <p className="italic text-muted-foreground">
              Example: "Before Tech Solutions, I worked at Innovate Startups, where I honed my skills in agile development and full-stack development, contributing to the launch of two successful products from ideation to deployment."
            </p>

            <h4 className="font-semibold mt-2">3. Future:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Connect your past and present to your future aspirations, specifically why you are interested in *this* role and *this* company.</li>
              <li>Show enthusiasm and how this position aligns with your career goals.</li>
            </ul>
            <p className="italic text-muted-foreground">
              Example: "I'm really excited about this opportunity at [Company Name] because [mention something specific about the role or company, e.g., your innovative approach to X, the chance to work on Y project]. I'm looking to leverage my expertise in front-end development and leadership to contribute to a forward-thinking team like yours."
            </p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold">Tips for a Great Answer</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Be concise:</strong> Aim for 1-2 minutes. Practice to ensure you're not rambling.</li>
                <li><strong>Be relevant:</strong> Tailor your answer to the specific job and company. Highlight skills and experiences mentioned in the job description.</li>
                <li><strong>Be positive and confident:</strong> Showcase your enthusiasm and belief in your abilities.</li>
                <li><strong>Be professional:</strong> Avoid overly personal details unless they are directly relevant to your professional journey.</li>
                <li><strong>Practice, don't memorize:</strong> Your answer should sound natural, not like a rehearsed script.</li>
                <li><strong>End with a connection:</strong> Conclude by tying your story back to the role you're applying for.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold">What to Avoid</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Reciting your entire resume.</li>
              <li>Sharing overly personal or irrelevant information.</li>
              <li>Speaking negatively about past employers or colleagues.</li>
              <li>Being too vague or too boastful.</li>
              <li>Asking "What do you want to know?" – this shows a lack of preparation.</li>
            </ul>
          </section>
          <p>
            By preparing a thoughtful and well-structured response to "Tell me about yourself?", you can start your interview on a strong note and effectively showcase why you're a great fit for the role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
