import React from 'react';
import { Trash2 } from 'lucide-react';

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
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800 space-y-3">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={question.question}
            onChange={(e) =>
              updateQuestion(sectionId, question.id, { question: e.target.value })
            }
            placeholder="Enter your question"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />

          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) =>
                  updateQuestion(sectionId, question.id, { required: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Required</span>
            </label>

            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium">
              {question.type.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <button
          onClick={() => deleteQuestion(sectionId, question.id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Options for multiple choice */}
      {(question.type === 'single-choice' || question.type === 'multi-choice') && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</label>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) =>
                  updateOption(sectionId, question.id, index, e.target.value)
                }
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              {question.options.length > 1 && (
                <button
                  onClick={() => deleteOption(sectionId, question.id, index)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
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

      {/* Numeric input ranges */}
      {question.type === 'numeric' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Range:</label>
            <input
              type="number"
              value={question.minRange}
              onChange={(e) =>
                updateQuestion(sectionId, question.id, { minRange: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Range:</label>
            <input
              type="number"
              value={question.maxRange}
              onChange={(e) =>
                updateQuestion(sectionId, question.id, { maxRange: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {/* Text inputs max length */}
      {(question.type === 'short-text' || question.type === 'long-text') && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Length:</label>
          <input
            type="number"
            value={question.maxLength}
            onChange={(e) =>
              updateQuestion(sectionId, question.id, { maxLength: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionBuilder;
