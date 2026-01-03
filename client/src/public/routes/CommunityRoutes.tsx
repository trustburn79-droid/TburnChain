import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const NewsBlog = lazy(() => import("../pages/community/NewsBlog"));
const NewsDetail = lazy(() => import("../pages/community/NewsDetail"));
const Events = lazy(() => import("../pages/community/Events"));
const EventDetail = lazy(() => import("../pages/community/EventDetail"));
const CommunityHub = lazy(() => import("../pages/community/CommunityHub"));
const PostDetail = lazy(() => import("../pages/community/PostDetail"));

export default function CommunityRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/community/news/:slug">{(params) => <NewsDetail key={params.slug} />}</Route>
        <Route path="/community/news" component={NewsBlog} />
        <Route path="/community/events/:id">{(params) => <EventDetail key={params.id} />}</Route>
        <Route path="/community/events" component={Events} />
        <Route path="/community/hub/post/:id">{(params) => <PostDetail key={params.id} />}</Route>
        <Route path="/community/hub" component={CommunityHub} />
        <Route component={NewsBlog} />
      </Switch>
    </Suspense>
  );
}
