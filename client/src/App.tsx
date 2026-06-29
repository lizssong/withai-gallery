import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import ArtworkViewerPage from "./pages/ArtworkViewerPage";
import EpiloguePage from "./pages/EpiloguePage";
import MyPage from "./pages/MyPage";
import AdminPage from "./pages/AdminPage";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/artists" component={ArtistsPage} />
      <Route path="/artists/:id/artwork/:artworkId" component={ArtworkViewerPage} />
      <Route path="/artists/:id" component={ArtistDetailPage} />
      <Route path="/epilogue" component={EpiloguePage} />
      <Route path="/my" component={MyPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
