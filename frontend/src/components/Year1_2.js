import React, { useState, useEffect } from 'react';
import { getCommonModules } from '../services/api';
import { GRADE_OPTIONS, GRADE_COLORS } from '../utils/constants';

const Year1_2 = ({ grades, updateGrade, getCurrentGrade, nextStep }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommonModules();
      setModules(data);
    } catch (err) {
      console.error('Failed to load modules:', err);
      setError('Failed to load modules. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter modules based on search and year
  const filteredModules = modules.filter(module => {
    const matchesSearch = search === '' || 
      module.moduleCode.toLowerCase().includes(search.toLowerCase()) ||
      module.moduleName.toLowerCase().includes(search.toLowerCase());
    const matchesYear = selectedYear === 'all' || module.year.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  // Group modules by year and semester
  const groupedModules = filteredModules.reduce((acc, module) => {
    const key = `Year ${module.year} - Semester ${module.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(module);
    return acc;
  }, {});

  // Calculate stats
  const calculateStats = (year) => {
    const yearModules = modules.filter(m => m.year === year);
    const gradedModules = yearModules.filter(m => getCurrentGrade(m.moduleCode));
    
    const totalCredits = yearModules.reduce((sum, m) => sum + m.credits, 0);
    const gradedCredits = gradedModules.reduce((sum, m) => sum + m.credits, 0);
    
    return {
      total: yearModules.length,
      graded: gradedModules.length,
      totalCredits,
      gradedCredits,
      completion: yearModules.length > 0 ? (gradedModules.length / yearModules.length) * 100 : 0
    };
  };

  const year1Stats = calculateStats(1);
  const year2Stats = calculateStats(2);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner spinner--md"></div>
        <p>Loading common modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={loadModules} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="module-section">
      <div className="section-heading">
        <h2>Years 1 &amp; 2 · Common Modules</h2>
        <p>Select grades for every shared module in the foundation years.</p>
      </div>

      <div className="progress-grid">
        <div className="progress-card year-one">
          <div className="progress-card__header">
            <h3>Year 1 Progress</h3>
            <p>{year1Stats.graded}/{year1Stats.total} modules</p>
          </div>
          <div className="progress-card__metrics">
            <span>{year1Stats.gradedCredits}/{year1Stats.totalCredits} credits</span>
            <span>{year1Stats.completion.toFixed(0)}% complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${year1Stats.completion}%` }} />
          </div>
        </div>

        <div className="progress-card year-two">
          <div className="progress-card__header">
            <h3>Year 2 Progress</h3>
            <p>{year2Stats.graded}/{year2Stats.total} modules</p>
          </div>
          <div className="progress-card__metrics">
            <span>{year2Stats.gradedCredits}/{year2Stats.totalCredits} credits</span>
            <span>{year2Stats.completion.toFixed(0)}% complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${year2Stats.completion}%` }} />
          </div>
        </div>
      </div>

      <div className="filter-panel">
        <input
          type="text"
          placeholder="Search modules by code or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Years</option>
          <option value="1">Year 1 Only</option>
          <option value="2">Year 2 Only</option>
        </select>
        <button
          onClick={() => {
            setSearch('');
            setSelectedYear('all');
          }}
          className="pill-button"
        >
          Clear
        </button>
      </div>

      {Object.keys(groupedModules).length === 0 ? (
        <div className="empty-state">No modules match your filters.</div>
      ) : (
        <div className="module-groups">
          {Object.entries(groupedModules).map(([groupName, groupModules]) => (
            <div key={groupName} className="module-group animate-slide-up">
              <div className="module-group__title">{groupName}</div>
              <div className="module-grid">
                {groupModules.map((module) => {
                  const currentGrade = getCurrentGrade(module.moduleCode);

                  return (
                    <div
                      key={module.moduleCode}
                      className={`module-card ${currentGrade ? 'is-selected' : ''}`}
                    >
                      <div className="module-card__header">
                        <div>
                          <span className="code">{module.moduleCode}</span>
                          <p>{module.moduleName}</p>
                        </div>
                        <span className="chip neutral">{module.credits} credits</span>
                      </div>

                      <select
                        value={currentGrade}
                        onChange={(e) => updateGrade(module.moduleCode, e.target.value, module)}
                        className="grade-select"
                      >
                        <option value="">Select Grade</option>
                        {GRADE_OPTIONS.map((grade) => (
                          <option key={grade.value} value={grade.value}>
                            {grade.label}
                          </option>
                        ))}
                      </select>

                      {currentGrade && (
                        <div className="module-card__footer">
                          <span className={`chip ${GRADE_COLORS[currentGrade]}`}>
                            Grade {currentGrade}
                          </span>
                          <span className="points">
                            {GRADE_OPTIONS.find(g => g.value === currentGrade)?.points.toFixed(1)} pts
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-footer">
        <button onClick={nextStep} className="btn-primary btn-block">
          Continue to Specialization →
        </button>
        <p className="footnote">
          {modules.length} modules loaded · {grades.filter(g => g.year <= 2 && g.grade).length} graded
        </p>
      </div>
    </div>
  );
};

export default Year1_2;