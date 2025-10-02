import React, { useState } from 'react';
import { Send } from 'lucide-react';
import QuestionInput from './QuestionInput';

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
      <div className={`${isBuilderMode ? 'w-1/2' : 'w-full'} bg-gray-50 dark:bg-gray-900 flex items-center justify-center`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No questions to preview</p>
          <p className="text-sm mt-1">Add sections and questions to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isBuilderMode ? 'w-1/2' : 'w-full'} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {isBuilderMode ? 'Assessment Preview' : 'Complete Your Assessment'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isBuilderMode ? 'Form preview of your assessment' : 'Please answer all questions carefully'}
        </p>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {visibleQuestions.map((question, index) => {
            const error = validateResponse(question);
            const showSectionHeader = index === 0 || visibleQuestions[index - 1]?.sectionId !== question.sectionId;

            return (
              <div key={question.id}>
                {showSectionHeader && question.sectionTitle && (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b-2 border-blue-500 pb-2">
                      {question.sectionTitle}
                    </h3>
                  </div>
                )}
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                  <label className="block text-lg font-medium text-gray-900 dark:text-gray-100">
                    {question.question || 'Untitled Question'}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  <QuestionInput
                    question={question}
                    value={responses[question.id]}
                    onChange={(value) => handleResponse(question.id, value)}
                  />

                  {error && responses[question.id] !== undefined && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Submit Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
              <div
                className={`mt-4 p-3 rounded text-center font-medium ${
                  submitMessage.includes('Error') || submitMessage.includes('complete')
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                }`}
              >
                {submitMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPane;
