"use client";
import React from "react";

export default function usePageLoading() {
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    window.addEventListener('page-loading-start', handleStart);
    window.addEventListener('page-loading-stop', handleStop);
    return () => {
      window.removeEventListener('page-loading-start', handleStart);
      window.removeEventListener('page-loading-stop', handleStop);
    };
  }, []);

  return loading;
}
