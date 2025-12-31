import React, { useState } from 'react';
import { GRADE_OPTIONS, GRADE_COLORS } from '../utils/constants';

const Year3_4 = ({
  specialization,
  specializationModules,
  grades,
  updateGrade,
  getCurrentGrade,
  prevStep,
  nextStep
}) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');

  // Calculate stats
  const calculateYearStats = (year) => {
    const modules = year === 3 ? specializationModules.year3 : specializationModules.year4;
    const gradedModules = modules.filter(module => getCurrentGrade(module.moduleCode));
    
    const totalCredits = modules.reduce((sum, m) => sum + m.credits, 0);
    const gradedCredits = gradedModules.reduce((sum, m) => sum + m.credits, 0);
    
    return {
      total: modules.length,
      graded: gradedModules.length,
      totalCredits,
      gradedCredits,
      completion: modules.length > 0 ? (gradedModules.length / modules.length) * 100 : 0
    };
  };

  const year3Stats = calculateYearStats(3);
  const year4Stats = calculateYearStats(4);

  // Filter modules
  const filterModules = (modules) => {
    return modules.filter(module => {
      const matchesSearch = search === '' || 
        module.moduleCode.toLowerCase().includes(search.toLowerCase()) ||
        module.moduleName.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredYear3 = selectedYear === 'all' || selectedYear === '3' ? filterModules(specializationModules.year3) : [];
  const filteredYear4 = selectedYear === 'all' || selectedYear === '4' ? filterModules(specializationModules.year4) : [];

  if (!specialization) {
    return (
      <div className="empty-state">
        <p>Please select a specialization first.</p>
        <button onClick={prevStep} className="btn-primary">
          ← Go Back to Select Specialization
        </button>
      </div>
    );
  }

  return (
    <div className="module-section">
      <div className="section-heading">
        <h2>Years 3 &amp; 4 · {specialization.name}</h2>
        <p>
          Grade each specialization module. {specializationModules.year3.length + specializationModules.year4.length} modules pending.
        </p>
      </div>

      <div className="progress-grid">
        <div className="progress-card year-three">
          <div className="progress-card__header">
            <h3>Year 3 Progress</h3>
            <p>{year3Stats.graded}/{year3Stats.total} modules</p>
          </div>
          <div className="progress-card__metrics">
            <span>{year3Stats.gradedCredits}/{year3Stats.totalCredits} credits</span>
            <span>{year3Stats.completion.toFixed(0)}% complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${year3Stats.completion}%` }} />
          </div>
        </div>

        <div className="progress-card year-four">
          <div className="progress-card__header">
            <h3>Year 4 Progress</h3>
            <p>{year4Stats.graded}/{year4Stats.total} modules</p>
          </div>
          <div className="progress-card__metrics">
            <span>{year4Stats.gradedCredits}/{year4Stats.totalCredits} credits</span>
            <span>{year4Stats.completion.toFixed(0)}% complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${year4Stats.completion}%` }} />
          </div>
        </div>
      </div>

      <div className="filter-panel">
        <input
          type="text"
          placeholder="Search specialization modules"
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
          <option value="3">Year 3 Only</option>
          <option value="4">Year 4 Only</option>
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

      {/* Modules List */}
      <div className="module-groups">
        {/* Year 3 Modules */}
        {(selectedYear === 'all' || selectedYear === '3') && (
          <div className="animate-slide-up">
            <div className="module-group__meta">
              <h3>Year 3 Modules {filteredYear3.length > 0 && `(${filteredYear3.length})`}</h3>
              <span>{specializationModules.year3.length} total modules</span>
            </div>
            
            {filteredYear3.length === 0 ? (
              <div className="empty-state">
                No Year 3 modules found matching your search.
              </div>
            ) : (
              <div className="module-grid">
                {filteredYear3.map((module) => {
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
                        <span className="chip info">{module.credits} credits</span>
                      </div>
                      
                      <select
                        value={currentGrade}
                        onChange={(e) => updateGrade(module.moduleCode, e.target.value, {
                          ...module,
                          year: 3
                        })}
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
            )}
          </div>
        )}

        {/* Year 4 Modules */}
        {(selectedYear === 'all' || selectedYear === '4') && (
          <div className="animate-slide-up">
            <div className="module-group__meta">
              <h3>Year 4 Modules {filteredYear4.length > 0 && `(${filteredYear4.length})`}</h3>
              <span>{specializationModules.year4.length} total modules</span>
            </div>
            
            {filteredYear4.length === 0 ? (
              <div className="empty-state">
                No Year 4 modules found matching your search.
              </div>
            ) : (
              <div className="module-grid">
                {filteredYear4.map((module) => {
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
                        <span className="chip accent">{module.credits} credits</span>
                      </div>
                      
                      <select
                        value={currentGrade}
                        onChange={(e) => updateGrade(module.moduleCode, e.target.value, {
                          ...module,
                          year: 4
                        })}
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
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="section-footer split">
        <button onClick={prevStep} className="btn-secondary">
          ← Change Specialization
        </button>
        <button onClick={nextStep} className="btn-primary" disabled={loading}>
          {loading ? 'Calculating…' : 'Calculate GPA →'}
        </button>
      </div>

      <div className="tip-card">
        <h4>💡 Tips</h4>
        <ul>
          <li>Only graded modules count toward your GPA.</li>
          <li>Leave modules empty if you have not completed them yet.</li>
          <li>You can revisit any step without losing progress.</li>
        </ul>
      </div>
    </div>
  );
};

export default Year3_4;