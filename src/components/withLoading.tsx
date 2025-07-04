'use client';

import React, { useState, useEffect } from 'react';

export default function withLoading(Component: React.ComponentType) {
  return function WithLoadingWrapper(props: any) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000); // You can adjust the delay

      return () => clearTimeout(timer);
    }, []);

    if (loading) {
      return <div className="text-center p-10">Loading...</div>;
    }

    return <Component {...props} />;
  };
}
