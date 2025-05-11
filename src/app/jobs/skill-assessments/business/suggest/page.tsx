
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Lightbulb, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { createAssessmentSuggestion } from '@/lib/assessment-suggestion-service';

const businessCategories = [
  "Project Management",
  "Digital Marketing",
  "Finance & Accounting",
  "Sales & Negotiation",
  "Business Communication",
  "Data Analysis",
  "Leadership & Management",
  "Entrepreneurship",
  "Human Resources",
  "Customer Service",
  "Other",
] as const;

const suggestionFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(150),
  category: z.enum(businessCategories, { required_error: "Please select a category."}),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(1000),
  keywords: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
  exampleQuestions: z.string().optional().max(2000, "Example questions are too long."),
});

type SuggestionFormValues = z.infer<typeof suggestionFormSchema>;

export default function SuggestBusinessAssessmentPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      title: '',
      category: undefined,
      description: '',
      keywords: [],
      exampleQuestions: '',
    },
  });

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  const onSubmit: SubmitHandler<SuggestionFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to suggest an assessment.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createAssessmentSuggestion({
        suggesterId: currentUser.uid,
        suggesterName: `${currentUser.firstName} ${currentUser.lastName}`, // Store name for easier display
        title: data.title,
        category: data.category,
        description: data.description,
        keywords: data.keywords,
        exampleQuestions: data.exampleQuestions,
      });
      toast({ title: "Suggestion Submitted", description: "Thank you! Your assessment suggestion has been received and will be reviewed." });
      form.reset(); // Reset form after successful submission
      router.push('/jobs/skill-assessments/business');
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast({ title: "Error", description: "Failed to submit suggestion. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loadingAuth || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <Button variant="outline" size="sm" className="mb-4 w-fit" asChild>
            <Link href="/jobs/skill-assessments/business">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Business Assessments
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="text-2xl">Suggest a Business Skill Assessment</CardTitle>
                <CardDescription>Help us expand our library by suggesting a new assessment. Your input is valuable!</CardDescription>
            </div>
           </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Proposed Assessment Title</Label>
              <Input id="title" {...form.register('title')} disabled={isSubmitting} placeholder="e.g., Advanced Negotiation Tactics" />
              {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
            </div>

            <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                    onValueChange={(value) => form.setValue('category', value as SuggestionFormValues["category"])} 
                    defaultValue={form.getValues('category')}
                    disabled={isSubmitting}
                >
                    <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category for the assessment" />
                    </SelectTrigger>
                    <SelectContent>
                    {businessCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                {...form.register('description')} 
                rows={4} 
                disabled={isSubmitting}
                placeholder="Briefly describe what this assessment would cover and why it's useful."
              />
              {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
            </div>

            <div>
              <Label htmlFor="keywords">Relevant Keywords (comma-separated, optional)</Label>
              <Input id="keywords" placeholder="e.g., B2B Sales, Closing Deals, Contract Negotiation" {...form.register('keywords')} disabled={isSubmitting} />
              {form.formState.errors.keywords && <p className="text-sm text-destructive mt-1">{form.formState.errors.keywords.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="exampleQuestions">Example Questions (optional)</Label>
              <Textarea 
                id="exampleQuestions" 
                {...form.register('exampleQuestions')} 
                rows={5} 
                disabled={isSubmitting}
                placeholder="Suggest a few sample questions (e.g., multiple choice, scenario-based) to illustrate the assessment's content. This helps our review team understand your vision."
              />
              {form.formState.errors.exampleQuestions && <p className="text-sm text-destructive mt-1">{form.formState.errors.exampleQuestions.message}</p>}
            </div>

            <div className="text-xs text-muted-foreground">
                <p><strong>Note:</strong> All suggestions will be reviewed by our team. We appreciate your contribution to making ProLink's skill assessments more comprehensive!</p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Suggestion
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
