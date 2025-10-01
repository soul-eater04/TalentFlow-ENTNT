import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, GripVertical, Save, Send } from 'lucide-react';

const Assessment = () => {
  const [sections, setSections] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [jobId, setJobId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('jobId') || window.location.pathname.split('/').pop();
    setJobId(id);
  }, []);

  const questionTypes = [
    { value: 'single-choice', label: 'Single Choice' },
    { value: 'multi-choice', label: 'Multiple Choice' },
    { value: 'short-text', label: 'Short Text' },
    { value: 'long-text', label: 'Long Text' },
    { value: 'numeric', label: 'Numeric Range' },
    { value: 'file-upload', label: 'File Upload' }
  ];

  const addSection = () => {
    setSections([...sections, {
      id: Date.now(),
      title: '',
      questions: []
    }]);
  };

  const updateSection = (sectionId, title) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, title } : s
    ));
  };

  const deleteSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const addQuestion = (sectionId, type) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newQuestion = {
          id: Date.now(),
          type,
          question: '',
          required: false,
          options: type === 'single-choice' || type === 'multi-choice' ? [''] : [],
          minRange: type === 'numeric' ? 0 : undefined,
          maxRange: type === 'numeric' ? 100 : undefined,
          maxLength: type === 'short-text' ? 100 : type === 'long-text' ? 500 : undefined
        };
        return { ...s, questions: [...s.questions, newQuestion] };
      }
      return s;
    }));
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: s.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return s;
    }));
  };

  const deleteQuestion = (sectionId, questionId) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: s.questions.filter(q => q.id !== questionId)
        };
      }
      return s;
    }));
  };

  const addOption = (sectionId, questionId) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: s.questions.map(q => {
            if (q.id === questionId) {
              return { ...q, options: [...q.options, ''] };
            }
            return q;
          })
        };
      }
      return s;
    }));
  };

  const updateOption = (sectionId, questionId, optionIndex, value) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: s.questions.map(q => {
            if (q.id === questionId) {
              const newOptions = [...q.options];
              newOptions[optionIndex] = value;
              return { ...q, options: newOptions };
            }
            return q;
          })
        };
      }
      return s;
    }));
  };

  const deleteOption = (sectionId, questionId, optionIndex) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: s.questions.map(q => {
            if (q.id === questionId) {
              return { ...q, options: q.options.filter((_, i) => i !== optionIndex) };
            }
            return q;
          })
        };
      }
      return s;
    }));
  };

  const getAllQuestions = () => {
    const allQuestions = [];
    sections.forEach(section => {
      section.questions.forEach(question => {
        allQuestions.push({ ...question, sectionTitle: section.title, sectionId: section.id });
      });
    });
    return allQuestions;
  };

  const getVisibleQuestions = () => {
    return getAllQuestions();
  };

  const handleResponse = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
    setAnsweredQuestions(new Set([...answeredQuestions, questionId]));
  };

  const validateResponse = (question) => {
    const response = responses[question.id];
    
    if (question.required && (!response || response === '' || (Array.isArray(response) && response.length === 0))) {
      return 'This field is required';
    }

    if (question.type === 'numeric' && response !== undefined && response !== '') {
      const num = Number(response);
      if (isNaN(num)) return 'Must be a number';
      if (question.minRange !== undefined && num < question.minRange) {
        return `Must be at least ${question.minRange}`;
      }
      if (question.maxRange !== undefined && num > question.maxRange) {
        return `Must be at most ${question.maxRange}`;
      }
    }

    if ((question.type === 'short-text' || question.type === 'long-text') && response) {
      if (question.maxLength && response.length > question.maxLength) {
        return `Maximum ${question.maxLength} characters allowed`;
      }
    }

    return null;
  };

  const saveAssessment = async () => {
    if (!jobId) {
      setSaveMessage('Error: Job ID not found');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const assessmentStructure = {
        sections: sections.map(section => ({
          title: section.title,
          questions: section.questions.map(question => ({
            id: question.id,
            type: question.type,
            question: question.question,
            required: question.required,
            options: question.options || [],
            minRange: question.minRange,
            maxRange: question.maxRange,
            maxLength: question.maxLength
          }))
        }))
      };

      const response = await fetch(`/api/assessments/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentStructure)
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      setSaveMessage('Assessment saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AssessmentBuilder 
        sections={sections}
        addSection={addSection}
        updateSection={updateSection}
        deleteSection={deleteSection}
        addQuestion={addQuestion}
        updateQuestion={updateQuestion}
        deleteQuestion={deleteQuestion}
        addOption={addOption}
        updateOption={updateOption}
        deleteOption={deleteOption}
        questionTypes={questionTypes}
        saveAssessment={saveAssessment}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />
      <PreviewPane 
        sections={sections}
        responses={responses}
        handleResponse={handleResponse}
        validateResponse={validateResponse}
        getVisibleQuestions={getVisibleQuestions}
        jobId={jobId}
        isBuilderMode={true}
      />
    </div>
  );
};

const AssessmentBuilder = ({ 
  sections, 
  addSection, 
  updateSection, 
  deleteSection,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
  questionTypes,
  saveAssessment,
  isSaving,
  saveMessage
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-white">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Assessment Builder</h2>
            <p className="text-sm text-gray-600 mt-1">Create sections and questions for your assessment</p>
          </div>
          <button
            onClick={saveAssessment}
            disabled={isSaving || sections.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
        {saveMessage && (
          <div className={`mt-3 p-2 rounded text-sm ${saveMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {saveMessage}
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-4">
        <button
          onClick={addSection}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Add New Section
        </button>

        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <GripVertical size={20} className="text-gray-400" />
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, e.target.value)}
                placeholder="Section Title"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => deleteSection(section.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {section.questions.map((question) => (
                <QuestionBuilder
                  key={question.id}
                  question={question}
                  sectionId={section.id}
                  updateQuestion={updateQuestion}
                  deleteQuestion={deleteQuestion}
                  addOption={addOption}
                  updateOption={updateOption}
                  deleteOption={deleteOption}
                />
              ))}

              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === section.id ? null : section.id)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  <Plus size={18} />
                  Add Question
                  <ChevronDown size={18} />
                </button>
                
                {openDropdown === section.id && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    {questionTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => {
                          addQuestion(section.id, type.value);
                          setOpenDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No sections yet</p>
            <p className="text-sm mt-1">Start by adding a section above</p>
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionBuilder = ({
  question,
  sectionId,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption
}) => {
  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={question.question}
            onChange={(e) => updateQuestion(sectionId, question.id, { question: e.target.value })}
            placeholder="Enter your question"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Required</span>
            </label>
            
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {question.type.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => deleteQuestion(sectionId, question.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {(question.type === 'single-choice' || question.type === 'multi-choice') && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Options:</label>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(sectionId, question.id, index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {question.options.length > 1 && (
                <button
                  onClick={() => deleteOption(sectionId, question.id, index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addOption(sectionId, question.id)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Option
          </button>
        </div>
      )}

      {question.type === 'numeric' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Min Range:</label>
            <input
              type="number"
              value={question.minRange}
              onChange={(e) => updateQuestion(sectionId, question.id, { minRange: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Max Range:</label>
            <input
              type="number"
              value={question.maxRange}
              onChange={(e) => updateQuestion(sectionId, question.id, { maxRange: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {(question.type === 'short-text' || question.type === 'long-text') && (
        <div>
          <label className="text-sm font-medium text-gray-700">Max Length:</label>
          <input
            type="number"
            value={question.maxLength}
            onChange={(e) => updateQuestion(sectionId, question.id, { maxLength: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
};

const PreviewPane = ({ 
  sections,
  responses, 
  handleResponse, 
  validateResponse,
  getVisibleQuestions,
  jobId,
  assessmentId,
  isBuilderMode = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
  const visibleQuestions = getVisibleQuestions();

  const handleSubmit = async () => {
    if (!jobId) {
      setSubmitMessage('Error: Job ID not found');
      return;
    }

    const errors = [];
    visibleQuestions.forEach(question => {
      const error = validateResponse(question);
      if (error) {
        errors.push(`${question.question}: ${error}`);
      }
    });

    if (errors.length > 0) {
      setSubmitMessage('Please complete all required fields');
      setTimeout(() => setSubmitMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const submissionData = {
        ...(assessmentId && { assessmentId }),
        responses: Object.keys(responses).map(questionId => ({
          questionId,
          answer: responses[questionId]
        })),
        submittedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/assessment/${jobId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      setSubmitMessage('Assessment submitted successfully!');
    } catch (error) {
      setSubmitMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (visibleQuestions.length === 0) {
    return (
      <div className={`${isBuilderMode ? 'w-1/2' : 'w-full'} bg-gray-50 flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No questions to preview</p>
          <p className="text-sm mt-1">Add sections and questions to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isBuilderMode ? 'w-1/2' : 'w-full'} bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col`}>
      <div className="p-6 border-b border-gray-200 bg-white shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">
          {isBuilderMode ? 'Assessment Preview' : 'Complete Your Assessment'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isBuilderMode ? 'Form preview of your assessment' : 'Please answer all questions carefully'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {visibleQuestions.map((question, index) => {
            const error = validateResponse(question);
            const showSectionHeader = index === 0 || visibleQuestions[index - 1]?.sectionId !== question.sectionId;

            return (
              <div key={question.id}>
                {showSectionHeader && question.sectionTitle && (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">
                      {question.sectionTitle}
                    </h3>
                  </div>
                )}
                
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <label className="block text-lg font-medium text-gray-900">
                    {question.question || 'Untitled Question'}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  <QuestionInput
                    question={question}
                    value={responses[question.id]}
                    onChange={(value) => handleResponse(question.id, value)}
                  />

                  {error && responses[question.id] !== undefined && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>
            );
          })}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold text-lg"
              >
                <Send size={20} />
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </div>
            {submitMessage && (
              <div className={`mt-4 p-3 rounded text-center font-medium ${submitMessage.includes('Error') || submitMessage.includes('complete') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {submitMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionInput = ({ question, value, onChange, disabled }) => {
  switch (question.type) {
    case 'single-choice':
      return (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'multi-choice':
      return (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                value={option}
                checked={Array.isArray(value) && value.includes(option)}
                onChange={(e) => {
                  const current = Array.isArray(value) ? value : [];
                  if (e.target.checked) {
                    onChange([...current, option]);
                  } else {
                    onChange(current.filter(v => v !== option));
                  }
                }}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'short-text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={question.maxLength}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          placeholder="Your answer..."
        />
      );

    case 'long-text':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={question.maxLength}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          placeholder="Your answer..."
        />
      );

    case 'numeric':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          min={question.minRange}
          max={question.maxRange}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          placeholder={`Enter a number (${question.minRange} - ${question.maxRange})`}
        />
      );

    case 'file-upload':
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <input
            type="file"
            onChange={(e) => onChange(e.target.files[0]?.name || '')}
            disabled={disabled}
            className="hidden"
            id={`file-${question.id}`}
          />
          <label
            htmlFor={`file-${question.id}`}
            className="cursor-pointer text-blue-600 hover:text-blue-700"
          >
            {value ? value : 'Click to upload file'}
          </label>
        </div>
      );

    default:
      return null;
  }
};

const AssessmentTest = () => {
  const [sections, setSections] = useState([]);
  const [responses, setResponses] = useState({});
  const [jobId, setJobId] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    setAssessmentId(pathParts[2]);
    setJobId(pathParts[3]);
  }, []);

  useEffect(() => {
    if (jobId && assessmentId) {
      fetchAssessment();
    }
  }, [jobId, assessmentId]);

  const fetchAssessment = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/assessments/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assessments');
      }
      const data = await response.json();
      const matchingAssessment = data.find(a => a.id === assessmentId);
      if (matchingAssessment) {
        setSections(matchingAssessment.sections);
      } else {
        setErrorMessage('Assessment not found');
      }
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllQuestions = () => {
    const allQuestions = [];
    sections.forEach(section => {
      section.questions.forEach(question => {
        allQuestions.push({ ...question, sectionTitle: section.title, sectionId: section.id });
      });
    });
    return allQuestions;
  };

  const getVisibleQuestions = () => {
    return getAllQuestions();
  };

  const handleResponse = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const validateResponse = (question) => {
    const response = responses[question.id];
    
    if (question.required && (!response || response === '' || (Array.isArray(response) && response.length === 0))) {
      return 'This field is required';
    }

    if (question.type === 'numeric' && response !== undefined && response !== '') {
      const num = Number(response);
      if (isNaN(num)) return 'Must be a number';
      if (question.minRange !== undefined && num < question.minRange) {
        return `Must be at least ${question.minRange}`;
      }
      if (question.maxRange !== undefined && num > question.maxRange) {
        return `Must be at most ${question.maxRange}`;
      }
    }

    if ((question.type === 'short-text' || question.type === 'long-text') && response) {
      if (question.maxLength && response.length > question.maxLength) {
        return `Maximum ${question.maxLength} characters allowed`;
      }
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading assessment...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PreviewPane 
        sections={sections}
        responses={responses}
        handleResponse={handleResponse}
        validateResponse={validateResponse}
        getVisibleQuestions={getVisibleQuestions}
        jobId={jobId}
        assessmentId={assessmentId}
        isBuilderMode={false}
      />
    </div>
  );
};

export { Assessment, AssessmentTest };