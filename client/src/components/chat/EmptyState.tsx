import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--text-primary)]">
          What are you working on?
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
          Ask a question, explore an idea, or start something new.
        </p>
      </div>
    </div>
  );
};
