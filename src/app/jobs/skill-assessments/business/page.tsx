
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Briefcase, Lightbulb, CheckCircle, TrendingUp, DollarSign, LineChart, Users as UsersIcon, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import React from "react";

interface Assessment {
  id: string;
  name: string;
  description: string;
  category: 'Project Management' | 'Digital Marketing' | 'Finance & Accounting' | 'Sales & Negotiation' | 'Business Communication' | 'Data Analysis';
  status: 'Available' | 'Coming Soon';
  icon: React.ReactNode;
}

const availableAssessments: Assessment[] = [
  { 
    id: "pm_fundamentals", 
    name: "Project Management Fundamentals", 
    description: "Test your understanding of core project management principles, methodologies, and lifecycle.",
    category: "Project Management",
    status: "Available", 
    icon: <CheckCircle className="h-5 w-5 text-green-500" /> 
  },
  { 
    id: "digital_marketing_strategy", 
    name: "Digital Marketing Strategy", 
    description: "Assess your knowledge of digital marketing channels, campaign planning, and performance analysis.",
    category: "Digital Marketing",
    status: "Coming Soon", 
    icon: <TrendingUp className="h-5 w-5 text-yellow-500" /> 
  },
  { 
    id: "financial_accounting_basics", 
    name: "Financial Accounting Basics", 
    description: "Validate your grasp of fundamental accounting concepts, financial statements, and reporting.",
    category: "Finance & Accounting",
    status: "Coming Soon", 
    icon: <DollarSign className="h-5 w-5 text-yellow-500" /> 
  },
  { 
    id: "effective_sales_techniques", 
    name: "Effective Sales Techniques", 
    description: "Showcase your skills in sales processes, negotiation, and customer relationship management.",
    category: "Sales & Negotiation",
    status: "Coming Soon", 
    icon: <UsersIcon className="h-5 w-5 text-yellow-500" /> 
  },
  { 
    id: "business_comm_skills", 
    name: "Business Communication Skills", 
    description: "Test your proficiency in written and verbal communication in a professional business context.",
    category: "Business Communication",
    status: "Available", 
    icon: <CheckCircle className="h-5 w-5 text-green-500" /> 
  },
  { 
    id: "data_analysis_for_business", 
    name: "Data Analysis for Business Decisions", 
    description: "Assess your ability to interpret data, identify trends, and derive actionable insights for business.",
    category: "Data Analysis",
    status: "Coming Soon", 
    icon: <LineChart className="h-5 w-5 text-yellow-500" /> 
  },
];

const assessmentCategories: Assessment['category'][] = [
    "Project Management",
    "Digital Marketing",
    "Finance & Accounting",
    "Sales & Negotiation",
    "Business Communication",
    "Data Analysis",
];


export default function BusinessSkillsAssessmentPage() {
  const { toast } = useToast();

  const handleStartAssessment = (assessmentName: string) => {
    toast({
      title: "Assessment Starting",
      description: `The "${assessmentName}" assessment will begin shortly. (This feature is currently a placeholder).`,
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
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
        <CardContent className="p-6 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              Validate your business acumen and soft skills with our range of business-focused assessments. These tests are designed to help you prove your capabilities in key areas crucial for success in various professional roles. Successful completion can enhance your profile and appeal to employers looking for well-rounded candidates.
            </p>
          </section>

          {assessmentCategories.map(category => {
            const categoryAssessments = availableAssessments.filter(asm => asm.category === category);
            if (categoryAssessments.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryAssessments.map((assessment) => (
                    <Card key={assessment.id} className="hover:shadow-md transition-shadow flex flex-col">
                      <CardHeader className="flex flex-row items-start justify-between space-x-2 pb-2">
                        <div>
                          <CardTitle className="text-lg font-medium">{assessment.name}</CardTitle>
                          <p className={`text-xs mt-1 ${assessment.status === "Available" ? "text-green-600" : "text-yellow-600"}`}>
                            Status: {assessment.status}
                          </p>
                        </div>
                        {assessment.icon}
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">{assessment.description}</p>
                      </CardContent>
                      <CardFooter>
                         <Button 
                          variant={assessment.status === "Available" ? "default" : "outline"} 
                          size="sm" 
                          className="w-full"
                          onClick={assessment.status === "Available" ? () => handleStartAssessment(assessment.name) : undefined}
                          disabled={assessment.status !== "Available"}
                          aria-label={assessment.status === "Available" ? `Start ${assessment.name} assessment` : `${assessment.name} assessment coming soon`}
                        >
                          {assessment.status === "Available" ? "Start Assessment" : "Coming Soon"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
          
          <section className="mt-12 border-t pt-8 bg-secondary/50 p-6 rounded-lg">
             <div className="flex items-center justify-center space-x-3 mb-3">
                <Lightbulb className="h-8 w-8 text-yellow-500" />
                <h2 className="text-xl font-semibold text-center">Expanding Our Business Offerings!</h2>
            </div>
            <p className="text-center text-muted-foreground">
              We are actively developing more assessments to cover a broad spectrum of business skills, including advanced strategic planning, leadership styles, negotiation tactics, and more. Keep an eye on this space for new opportunities to validate your business expertise.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
