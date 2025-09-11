import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { MainLayout } from "@/components/layout/MainLayout";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return <MainLayout />;
};

export default Index;
