import React, { useState, useEffect } from 'react';
import AssessmentBuilder from './AssessmentBuilder';
import PreviewPane from './PreviewPane';

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