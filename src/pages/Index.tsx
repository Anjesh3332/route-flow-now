import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return <Dashboard />;
};

export default Index;
