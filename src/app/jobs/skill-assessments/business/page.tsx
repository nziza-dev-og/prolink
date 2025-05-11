
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Briefcase, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function BusinessSkillsAssessmentPage() {
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
            <Briefcase className="mr-3 h-7 w-7 text-primary" />
            Business Skill Assessments
          </CardTitle>
          <CardDescription>
            Demonstrate your proficiency in project management, marketing, sales, finance, and other business-related skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold">Available Business Assessments</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              This section will list available business skill assessments. Examples might include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-5">
              <li>Project Management Fundamentals</li>
              <li>Digital Marketing Strategy</li>
              <li>Financial Accounting Basics</li>
              <li>Sales Techniques</li>
              <li>Business Communication</li>
              <li>Data Analysis for Business</li>
            </ul>
          </section>

          <div className="text-center mt-10 border-t pt-6">
            <p className="text-md font-semibold text-muted-foreground mb-2 flex items-center justify-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                Feature Under Development
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Specific business skill assessments are currently under construction. Please check back soon for updates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
