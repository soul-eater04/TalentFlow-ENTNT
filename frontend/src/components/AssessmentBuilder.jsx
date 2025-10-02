import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, Save } from 'lucide-react';
import QuestionBuilder from './QuestionBuilder';

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
    <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Assessment Builder</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create sections and questions for your assessment
            </p>
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
          <div
            className={`mt-3 p-2 rounded text-sm ${
              saveMessage.includes('Error')
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            }`}
          >
            {saveMessage}
          </div>
        )}
      </div>
      
      {/* Body */}
      <div className="p-6 space-y-4">
        <button
          onClick={addSection}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Add New Section
        </button>

        {sections.map((section) => (
          <div
            key={section.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center gap-3">
              <GripVertical size={20} className="text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, e.target.value)}
                placeholder="Section Title"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={() => deleteSection(section.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
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

              {/* Add Question Dropdown */}
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
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    {questionTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => {
                          addQuestion(section.id, type.value);
                          setOpenDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md text-gray-800 dark:text-gray-100"
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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No sections yet</p>
            <p className="text-sm mt-1">Start by adding a section above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentBuilder;
