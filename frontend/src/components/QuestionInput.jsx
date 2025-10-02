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

export default QuestionInput;