import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  GraduationCap,
  Play,
  Clock,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  Lock,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Network,
  Bot,
  Settings,
  RefreshCw,
  AlertCircle,
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
  iconName: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string | null;
  iconName: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Network,
  Shield,
  Bot,
  Zap,
  Settings,
  Star,
  Award,
  GraduationCap,
  TrendingUp,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || BookOpen;
};

interface LearningPath {
  name: string;
  courses: number;
  duration: string;
  progress: number;
}

interface TrainingData {
  courses: Course[];
  achievements: Achievement[];
  learningPaths: LearningPath[];
}

export default function TrainingMaterials() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");

  const { data: trainingData, isLoading, error, refetch } = useQuery<TrainingData>({
    queryKey: ["/api/admin/training"],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return apiRequest("POST", `/api/admin/training/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/training"] });
      toast({
        title: t("adminTraining.enrolled"),
        description: t("adminTraining.enrolledDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminTraining.error"),
        description: t("adminTraining.enrollError"),
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ courseId, moduleId }: { courseId: string; moduleId: string }) => {
      return apiRequest("POST", `/api/admin/training/courses/${courseId}/modules/${moduleId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/training"] });
      toast({
        title: t("adminTraining.moduleCompleted"),
        description: t("adminTraining.moduleCompletedDesc"),
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminTraining.refreshed"),
      description: t("adminTraining.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const courses: Course[] = trainingData?.courses || [
    { id: "1", title: t("adminTraining.courses.fundamentals.title"), description: t("adminTraining.courses.fundamentals.desc"), category: t("adminTraining.categories.gettingStarted"), duration: "2h 30m", modules: 8, completedModules: 8, level: "beginner", enrolled: 245, rating: 4.8, iconName: "BookOpen" },
    { id: "2", title: t("adminTraining.courses.network.title"), description: t("adminTraining.courses.network.desc"), category: t("adminTraining.categories.network"), duration: "4h 15m", modules: 12, completedModules: 7, level: "intermediate", enrolled: 189, rating: 4.9, iconName: "Network" },
    { id: "3", title: t("adminTraining.courses.security.title"), description: t("adminTraining.courses.security.desc"), category: t("adminTraining.categories.security"), duration: "3h 45m", modules: 10, completedModules: 3, level: "advanced", enrolled: 156, rating: 4.7, iconName: "Shield" },
    { id: "4", title: t("adminTraining.courses.ai.title"), description: t("adminTraining.courses.ai.desc"), category: t("adminTraining.categories.ai"), duration: "3h 00m", modules: 8, completedModules: 0, level: "intermediate", enrolled: 134, rating: 4.6, iconName: "Bot" },
    { id: "5", title: t("adminTraining.courses.emergency.title"), description: t("adminTraining.courses.emergency.desc"), category: t("adminTraining.categories.operations"), duration: "2h 00m", modules: 6, completedModules: 0, level: "advanced", enrolled: 98, rating: 4.9, iconName: "Zap" },
    { id: "6", title: t("adminTraining.courses.config.title"), description: t("adminTraining.courses.config.desc"), category: t("adminTraining.categories.settings"), duration: "2h 45m", modules: 7, completedModules: 4, level: "intermediate", enrolled: 112, rating: 4.5, iconName: "Settings" },
  ];

  const achievements: Achievement[] = trainingData?.achievements || [
    { id: "1", title: t("adminTraining.achievements.firstSteps.title"), description: t("adminTraining.achievements.firstSteps.desc"), earnedDate: "2024-11-15", iconName: "Star" },
    { id: "2", title: t("adminTraining.achievements.quickLearner.title"), description: t("adminTraining.achievements.quickLearner.desc"), earnedDate: "2024-11-28", iconName: "Zap" },
    { id: "3", title: t("adminTraining.achievements.securityExpert.title"), description: t("adminTraining.achievements.securityExpert.desc"), earnedDate: null, iconName: "Shield" },
    { id: "4", title: t("adminTraining.achievements.networkMaster.title"), description: t("adminTraining.achievements.networkMaster.desc"), earnedDate: null, iconName: "Network" },
    { id: "5", title: t("adminTraining.achievements.aiSpecialist.title"), description: t("adminTraining.achievements.aiSpecialist.desc"), earnedDate: null, iconName: "Bot" },
    { id: "6", title: t("adminTraining.achievements.completionist.title"), description: t("adminTraining.achievements.completionist.desc"), earnedDate: null, iconName: "Award" },
  ];

  const learningPaths: LearningPath[] = trainingData?.learningPaths || [
    { name: t("adminTraining.paths.newAdmin"), courses: 3, duration: "8h", progress: 100 },
    { name: t("adminTraining.paths.security"), courses: 4, duration: "12h", progress: 45 },
    { name: t("adminTraining.paths.network"), courses: 5, duration: "15h", progress: 30 },
    { name: t("adminTraining.paths.ai"), courses: 3, duration: "9h", progress: 0 },
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "beginner": return <Badge className="bg-green-500">{t("adminTraining.levels.beginner")}</Badge>;
      case "intermediate": return <Badge className="bg-yellow-500">{t("adminTraining.levels.intermediate")}</Badge>;
      case "advanced": return <Badge className="bg-red-500">{t("adminTraining.levels.advanced")}</Badge>;
      default: return <Badge>{level}</Badge>;
    }
  };

  const totalCompleted = courses.filter(c => c.completedModules === c.modules).length;
  const inProgress = courses.filter(c => c.completedModules > 0 && c.completedModules < c.modules).length;
  const totalCertificates = achievements.filter(a => a.earnedDate).length;

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminTraining.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminTraining.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-training">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminTraining.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="training-materials-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-training-title">
              <GraduationCap className="h-8 w-8" />
              {t("adminTraining.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-training-description">
              {t("adminTraining.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-training">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminTraining.refresh")}
            </Button>
            <Button variant="outline" data-testid="button-my-progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("adminTraining.myProgress")}
            </Button>
            <Button data-testid="button-certifications">
              <Award className="h-4 w-4 mr-2" />
              {t("adminTraining.certifications")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-completed">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTraining.stats.completed")}</p>
                  <p className="text-2xl font-bold" data-testid="text-completed-count">{totalCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-in-progress">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Play className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTraining.stats.inProgress")}</p>
                  <p className="text-2xl font-bold" data-testid="text-in-progress-count">{inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-achievements">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTraining.stats.achievements")}</p>
                  <p className="text-2xl font-bold" data-testid="text-achievements-count">{totalCertificates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-learning-time">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTraining.stats.learningTime")}</p>
                  <p className="text-2xl font-bold" data-testid="text-learning-time">18h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-training">
            <TabsTrigger value="courses" data-testid="tab-courses">{t("adminTraining.tabs.courses")}</TabsTrigger>
            <TabsTrigger value="paths" data-testid="tab-paths">{t("adminTraining.tabs.paths")}</TabsTrigger>
            <TabsTrigger value="achievements" data-testid="tab-achievements">{t("adminTraining.tabs.achievements")}</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card data-testid="card-continue-learning">
              <CardHeader>
                <CardTitle>{t("adminTraining.continueLearning")}</CardTitle>
                <CardDescription>{t("adminTraining.continueLearningDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.filter(c => c.completedModules > 0 && c.completedModules < c.modules).map((course, index) => {
                    const CourseIcon = getIcon(course.iconName);
                    return (
                    <div key={course.id} className="p-4 border rounded-lg hover-elevate" data-testid={`continue-course-${index}`}>
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CourseIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{course.completedModules}/{course.modules} {t("adminTraining.modules")}</span>
                              <span>{Math.round((course.completedModules / course.modules) * 100)}%</span>
                            </div>
                            <Progress value={(course.completedModules / course.modules) * 100} />
                          </div>
                          <Button size="sm" className="mt-3" data-testid={`button-continue-${index}`}>
                            <Play className="h-3 w-3 mr-1" />
                            {t("adminTraining.continue")}
                          </Button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-all-courses">
              <CardHeader>
                <CardTitle>{t("adminTraining.allCourses")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course, index) => {
                    const CourseIcon = getIcon(course.iconName);
                    return (
                    <div key={course.id} className="border rounded-lg overflow-hidden hover-elevate" data-testid={`course-card-${index}`}>
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <CourseIcon className="h-12 w-12 text-primary" />
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
                            {course.modules} {t("adminTraining.modules")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrolled}
                          </span>
                        </div>
                        {course.completedModules === course.modules ? (
                          <Button variant="outline" size="sm" className="w-full mt-4" data-testid={`button-completed-${index}`}>
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            {t("adminTraining.completed")}
                          </Button>
                        ) : course.completedModules > 0 ? (
                          <Button size="sm" className="w-full mt-4" data-testid={`button-course-continue-${index}`}>
                            <Play className="h-3 w-3 mr-1" />
                            {t("adminTraining.continue")}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-4"
                            onClick={() => enrollMutation.mutate(course.id)}
                            disabled={enrollMutation.isPending}
                            data-testid={`button-enroll-${index}`}
                          >
                            {t("adminTraining.startCourse")}
                          </Button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <Card data-testid="card-learning-paths">
              <CardHeader>
                <CardTitle>{t("adminTraining.learningPaths")}</CardTitle>
                <CardDescription>{t("adminTraining.learningPathsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPaths.map((path, i) => (
                    <div key={i} className="p-4 border rounded-lg" data-testid={`learning-path-${i}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{path.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {path.courses} {t("adminTraining.courses")} • {path.duration} {t("adminTraining.total")}
                          </p>
                        </div>
                        {path.progress === 100 ? (
                          <Badge className="bg-green-500">{t("adminTraining.completed")}</Badge>
                        ) : path.progress > 0 ? (
                          <Badge variant="secondary">{path.progress}%</Badge>
                        ) : (
                          <Button size="sm" data-testid={`button-start-path-${i}`}>{t("adminTraining.startPath")}</Button>
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
            <Card data-testid="card-achievements-list">
              <CardHeader>
                <CardTitle>{t("adminTraining.yourAchievements")}</CardTitle>
                <CardDescription>{t("adminTraining.achievementsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {achievements.map((achievement, index) => {
                    const AchievementIcon = getIcon(achievement.iconName);
                    return (
                    <div
                      key={achievement.id}
                      className={`p-4 border rounded-lg text-center ${
                        achievement.earnedDate ? "" : "opacity-50"
                      }`}
                      data-testid={`achievement-${index}`}
                    >
                      <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center ${
                        achievement.earnedDate ? "bg-primary/10" : "bg-muted"
                      }`}>
                        {achievement.earnedDate ? (
                          <AchievementIcon className="h-8 w-8 text-primary" />
                        ) : (
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm mt-3">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      {achievement.earnedDate && (
                        <p className="text-xs text-green-500 mt-2">{t("adminTraining.earned")} {achievement.earnedDate}</p>
                      )}
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
