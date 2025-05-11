
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Briefcase, Lightbulb, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

const availableAssessments = [
  { id: "pm_fundamentals", name: "Project Management Fundamentals", status: "Available", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  { id: "digital_marketing", name: "Digital Marketing Strategy", status: "Coming Soon", icon: <TrendingUp className="h-5 w-5 text-yellow-500" /> },
  { id: "financial_accounting", name: "Financial Accounting Basics", status: "Coming Soon", icon: <TrendingUp className="h-5 w-5 text-yellow-500" /> },
  { id: "sales_techniques", name: "Effective Sales Techniques", status: "Coming Soon", icon: <TrendingUp className="h-5 w-5 text-yellow-500" /> },
  { id: "business_comm", name: "Business Communication Skills", status: "Available", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
];


export default function BusinessSkillsAssessmentPage() {
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
            <Briefcase className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Business Skill Assessments</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Demonstrate your proficiency in project management, marketing, sales, finance, and other business-related skills.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Validate your business acumen and soft skills with our range of business-focused assessments. These tests are designed to help you prove your capabilities in key areas crucial for success in various professional roles. Successful completion can enhance your profile and appeal to employers looking for well-rounded candidates.
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
                        disabled={assessment.status !== "Available"}
                      >
                        {assessment.status === "Available" ? "Start Assessment" : "Coming Soon"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No business assessments are currently listed. Please check back later.</p>
            )}
          </section>

          <section className="mt-10 border-t pt-6 bg-secondary/50 p-6 rounded-lg">
             <div className="flex items-center justify-center space-x-3 mb-3">
                <Lightbulb className="h-8 w-8 text-yellow-500" />
                <h2 className="text-xl font-semibold text-center">Expanding Our Business Offerings!</h2>
            </div>
            <p className="text-center text-muted-foreground">
              We are actively developing more assessments to cover a broad spectrum of business skills, including data analysis for business, leadership styles, negotiation tactics, and more. Keep an eye on this space for new opportunities to validate your business expertise.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
