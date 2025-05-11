
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Users, FileText, BarChart3, Download } from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart as ReLineChart, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Bar, BarChart as ReBarChart } from "recharts";


const lineChartConfig = {
  value: { label: "Value", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const barChartConfig = {
  count: { label: "Count", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const mockLineData = [
  { date: "2024-01", value: Math.floor(Math.random() * 100) + 50 },
  { date: "2024-02", value: Math.floor(Math.random() * 100) + 70 },
  { date: "2024-03", value: Math.floor(Math.random() * 100) + 90 },
  { date: "2024-04", value: Math.floor(Math.random() * 100) + 120 },
  { date: "2024-05", value: Math.floor(Math.random() * 100) + 150 },
  { date: "2024-06", value: Math.floor(Math.random() * 100) + 130 },
];

const mockBarData = [
  { name: "Posts", count: Math.floor(Math.random() * 200) + 50 },
  { name: "Articles", count: Math.floor(Math.random() * 100) + 20 },
  { name: "Events", count: Math.floor(Math.random() * 50) + 10 },
  { name: "Comments", count: Math.floor(Math.random() * 500) + 100 },
];

const PlaceholderChart = ({ title, type = 'line' }: { title: string, type?: 'line' | 'bar' }) => (
  <Card className="shadow-md">
    <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
    <CardContent className="h-72 -ml-4">
      {type === 'line' ? (
        <ChartContainer config={lineChartConfig} className="w-full h-full">
          <ResponsiveContainer>
            <ReLineChart data={mockLineData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
              <ReTooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
              <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={true} />
            </ReLineChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <ChartContainer config={barChartConfig} className="w-full h-full">
          <ResponsiveContainer>
            <ReBarChart data={mockBarData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
              <ReTooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </ReBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </CardContent>
  </Card>
);

const PlaceholderTable = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
  <Card className="shadow-md">
    <CardHeader>
        <CardTitle className="text-lg flex items-center">
            <Icon className="mr-2 h-5 w-5 text-primary" />
            {title}
        </CardTitle>
    </CardHeader>
    <CardContent className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
      Data Table Placeholder
    </CardContent>
  </Card>
);


export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
      </div>
      <CardDescription>Visual trends of key metrics and platform performance. (All data is placeholder)</CardDescription>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlaceholderChart title="User Growth Trend" type="line" />
        <PlaceholderChart title="Post Engagement Trend" type="line"/>
        <PlaceholderChart title="Content Type Performance" type="bar"/>
        <PlaceholderChart title="Active Users (DAU/MAU)" type="bar"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PlaceholderTable title="Top Performing Posts" icon={FileText} />
        <PlaceholderTable title="Top Performing Articles" icon={FileText} />
        <PlaceholderTable title="Most Active Users" icon={Users}/>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Reporting Tools</CardTitle>
            <CardDescription>Generate and download platform reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <Button variant="outline" disabled><Download className="mr-2 h-4 w-4"/>Generate User Report (Soon)</Button>
            <Button variant="outline" disabled className="ml-2"><Download className="mr-2 h-4 w-4"/>Generate Content Report (Soon)</Button>
            <p className="text-sm text-muted-foreground pt-2">Custom reporting features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
