import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap,
  Play,
  Clock,
  Users,
  Award,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  Lock,
  Star,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Network,
  Bot,
  Settings,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  modules: number;
  completedModules: number;
  level: "beginner" | "intermediate" | "advanced";
  enrolled: number;
  rating: number;
  icon: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string | null;
  icon: any;
}

export default function TrainingMaterials() {
  const [activeTab, setActiveTab] = useState("courses");

  const courses: Course[] = [
    { id: "1", title: "Admin Portal Fundamentals", description: "Learn the basics of navigating and using the admin portal", category: "Getting Started", duration: "2h 30m", modules: 8, completedModules: 8, level: "beginner", enrolled: 245, rating: 4.8, icon: BookOpen },
    { id: "2", title: "Network Management Mastery", description: "Advanced techniques for managing nodes and validators", category: "Network", duration: "4h 15m", modules: 12, completedModules: 7, level: "intermediate", enrolled: 189, rating: 4.9, icon: Network },
    { id: "3", title: "Security Operations", description: "Security best practices and incident response", category: "Security", duration: "3h 45m", modules: 10, completedModules: 3, level: "advanced", enrolled: 156, rating: 4.7, icon: Shield },
    { id: "4", title: "AI System Configuration", description: "Configure and optimize Triple-Band AI", category: "AI", duration: "3h 00m", modules: 8, completedModules: 0, level: "intermediate", enrolled: 134, rating: 4.6, icon: Bot },
    { id: "5", title: "Emergency Response Training", description: "Handling critical incidents and emergencies", category: "Operations", duration: "2h 00m", modules: 6, completedModules: 0, level: "advanced", enrolled: 98, rating: 4.9, icon: Zap },
    { id: "6", title: "System Configuration Deep Dive", description: "Advanced system settings and customization", category: "Settings", duration: "2h 45m", modules: 7, completedModules: 4, level: "intermediate", enrolled: 112, rating: 4.5, icon: Settings },
  ];

  const achievements: Achievement[] = [
    { id: "1", title: "First Steps", description: "Complete your first course", earnedDate: "2024-11-15", icon: Star },
    { id: "2", title: "Quick Learner", description: "Complete 3 courses", earnedDate: "2024-11-28", icon: Zap },
    { id: "3", title: "Security Expert", description: "Complete all security courses", earnedDate: null, icon: Shield },
    { id: "4", title: "Network Master", description: "Complete all network courses", earnedDate: null, icon: Network },
    { id: "5", title: "AI Specialist", description: "Complete all AI courses", earnedDate: null, icon: Bot },
    { id: "6", title: "Completionist", description: "Complete all available courses", earnedDate: null, icon: Award },
  ];

  const learningPaths = [
    { name: "New Admin Onboarding", courses: 3, duration: "8h", progress: 100 },
    { name: "Security Specialist", courses: 4, duration: "12h", progress: 45 },
    { name: "Network Operations", courses: 5, duration: "15h", progress: 30 },
    { name: "AI Operations", courses: 3, duration: "9h", progress: 0 },
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "beginner": return <Badge className="bg-green-500">Beginner</Badge>;
      case "intermediate": return <Badge className="bg-yellow-500">Intermediate</Badge>;
      case "advanced": return <Badge className="bg-red-500">Advanced</Badge>;
      default: return <Badge>{level}</Badge>;
    }
  };

  const totalCompleted = courses.filter(c => c.completedModules === c.modules).length;
  const inProgress = courses.filter(c => c.completedModules > 0 && c.completedModules < c.modules).length;
  const totalCertificates = achievements.filter(a => a.earnedDate).length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              Training Materials
            </h1>
            <p className="text-muted-foreground">Courses, certifications, and learning resources</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-my-progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              My Progress
            </Button>
            <Button data-testid="button-certifications">
              <Award className="h-4 w-4 mr-2" />
              Certifications
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{totalCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Play className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">{totalCertificates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Learning Time</p>
                  <p className="text-2xl font-bold">18h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.filter(c => c.completedModules > 0 && c.completedModules < c.modules).map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg hover-elevate">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <course.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{course.completedModules}/{course.modules} modules</span>
                              <span>{Math.round((course.completedModules / course.modules) * 100)}%</span>
                            </div>
                            <Progress value={(course.completedModules / course.modules) * 100} />
                          </div>
                          <Button size="sm" className="mt-3">
                            <Play className="h-3 w-3 mr-1" />
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border rounded-lg overflow-hidden hover-elevate">
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <course.icon className="h-12 w-12 text-primary" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          {getLevelBadge(course.level)}
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {course.rating}
                          </div>
                        </div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.modules} modules
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrolled}
                          </span>
                        </div>
                        {course.completedModules === course.modules ? (
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            Completed
                          </Button>
                        ) : course.completedModules > 0 ? (
                          <Button size="sm" className="w-full mt-4">
                            <Play className="h-3 w-3 mr-1" />
                            Continue
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            Start Course
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Paths</CardTitle>
                <CardDescription>Structured course sequences for specific roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPaths.map((path, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{path.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {path.courses} courses • {path.duration} total
                          </p>
                        </div>
                        {path.progress === 100 ? (
                          <Badge className="bg-green-500">Completed</Badge>
                        ) : path.progress > 0 ? (
                          <Badge variant="secondary">{path.progress}%</Badge>
                        ) : (
                          <Button size="sm">Start Path</Button>
                        )}
                      </div>
                      <Progress value={path.progress} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Badges and certifications earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 border rounded-lg text-center ${
                        achievement.earnedDate ? "" : "opacity-50"
                      }`}
                    >
                      <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center ${
                        achievement.earnedDate ? "bg-primary/10" : "bg-muted"
                      }`}>
                        {achievement.earnedDate ? (
                          <achievement.icon className="h-8 w-8 text-primary" />
                        ) : (
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm mt-3">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      {achievement.earnedDate && (
                        <p className="text-xs text-green-500 mt-2">Earned {achievement.earnedDate}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
