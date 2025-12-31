import React from 'react';

const Navigation = ({ currentStep, goToStep, grades, specialization }) => {
  const steps = [
    { number: 1, title: 'Years 1-2', description: 'Common Modules' },
    { number: 2, title: 'Specialization', description: 'Choose Your Path' },
    { number: 3, title: 'Years 3-4', description: 'Specialization Modules' },
    { number: 4, title: 'Results', description: 'View GPA' }
  ];

  // Calculate completion status
  const getStepStatus = (stepNumber) => {
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'completed';
    return 'upcoming';
  };

  const getStepCompletion = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        const gradedYear1 = grades.filter(g => g.year === 1 && g.grade).length;
        const gradedYear2 = grades.filter(g => g.year === 2 && g.grade).length;
        return { graded: gradedYear1 + gradedYear2, text: 'modules graded' };
      case 2:
        return { graded: specialization ? 1 : 0, text: 'selected' };
      case 3:
        const gradedYear3 = grades.filter(g => g.year === 3 && g.grade).length;
        const gradedYear4 = grades.filter(g => g.year === 4 && g.grade).length;
        return { graded: gradedYear3 + gradedYear4, text: 'modules graded' };
      default:
        return { graded: 0, text: '' };
    }
  };

  return (
    <div className="stepper">
      <div className="stepper-track">
        <div
          className="stepper-progress"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <div className="stepper-nodes">
        {steps.map((step) => {
          const status = getStepStatus(step.number);
          const completion = getStepCompletion(step.number);

          return (
            <div key={step.number} className="stepper-node">
              <button
                onClick={() => goToStep(step.number)}
                disabled={status === 'upcoming'}
                className={`stepper-dot ${status}`}
              >
                {status === 'completed' ? '✓' : step.number}
                {completion.graded > 0 && status !== 'completed' && (
                  <span className="stepper-dot__badge">{completion.graded}</span>
                )}
              </button>
              <div className="stepper-copy">
                <span className="title">{step.title}</span>
                <span className="subtitle">{step.description}</span>
                {completion.graded > 0 && (
                  <span className="meta">
                    {completion.graded} {completion.text}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;