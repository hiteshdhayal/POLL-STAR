import React from 'react';
import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input';
import type { CreatePollFormValues } from '../../pages/polls/CreatePollPage';

interface QuestionBuilderProps {
  control: Control<CreatePollFormValues>;
  register: UseFormRegister<CreatePollFormValues>;
  errors: FieldErrors<CreatePollFormValues>;
}

interface OptionInputProps {
  questionIndex: number;
  optionIndex: number;
  register: UseFormRegister<CreatePollFormValues>;
  errors: FieldErrors<CreatePollFormValues>;
}

const OptionInput: React.FC<OptionInputProps> = ({
  questionIndex,
  optionIndex,
  register,
  errors,
}) => {
  const error = errors?.questions?.[questionIndex]?.options?.[optionIndex]?.text?.message;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-muted w-4">{optionIndex + 1}.</span>
        <div className="flex-1">
          <input
            {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
            placeholder={`Enter option ${optionIndex + 1}...`}
            className={`w-full border bg-transparent px-3 py-2 text-sm text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-all ${error ? 'border-crimson bg-crimson/[0.02]' : 'border-border'}`}
          />
        </div>
      </div>
      {error && (
        <p className="text-[10px] text-crimson font-bold uppercase tracking-wider pl-6 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({ control, register, errors }) => {
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

  return (
    <div className="space-y-8">
      {questionFields.map((question, qIndex) => (
        <QuestionCard
          key={question.id}
          qIndex={qIndex}
          control={control}
          register={register}
          errors={errors}
          onRemove={() => removeQuestion(qIndex)}
          canRemove={questionFields.length > 1}
        />
      ))}

      <button
        type="button"
        onClick={() =>
          appendQuestion({
            text: '',
            isRequired: false,
            order: questionFields.length,
            options: [
              { text: '', order: 0 },
              { text: '', order: 1 },
              { text: '', order: 2 },
              { text: '', order: 3 },
            ],
          })
        }
        className="w-full border-2 border-dashed border-border hover:border-crimson py-8 text-xs tracking-[0.2em] uppercase text-muted hover:text-crimson transition-all flex items-center justify-center gap-2 bg-charcoal/[0.01]"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </button>
    </div>
  );
};

interface QuestionCardProps {
  qIndex: number;
  control: Control<CreatePollFormValues>;
  register: UseFormRegister<CreatePollFormValues>;
  errors: FieldErrors<CreatePollFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  qIndex, register, errors, onRemove, canRemove,
}) => {
  const questionErrors = errors?.questions?.[qIndex];
  // Accessing error message for array level
  const optionsError = (errors?.questions?.[qIndex] as any)?.options?.message;

  return (
    <div className={`card border space-y-6 relative transition-all ${questionErrors ? 'border-crimson/30 shadow-[0_8px_32px_rgba(196,30,58,0.05)]' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <GripVertical className="w-4 h-4 text-muted flex-shrink-0 mt-8" />
          <div className="flex-1">
            <Input
              label={`Question ${qIndex + 1}`}
              {...register(`questions.${qIndex}.text`)}
              placeholder="Ask your question..."
              error={questionErrors?.text?.message}
            />
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-8 p-2 text-muted hover:text-crimson transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Required toggle */}
      <div className="flex items-center gap-3 pl-7">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              {...register(`questions.${qIndex}.isRequired`)}
              className="peer sr-only"
            />
            <div className="w-4 h-4 border border-border peer-checked:bg-crimson peer-checked:border-crimson transition-all" />
            <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <span className="text-[10px] text-muted uppercase tracking-widest font-bold group-hover:text-charcoal transition-colors">Mark as Required</span>
        </label>
      </div>

      {/* Options */}
      <div className="pl-7 space-y-4">
        <div className="flex items-center justify-between">
          <p className="label !mb-0 text-charcoal opacity-40">Options (Fixed 4)</p>
          {optionsError && (
            <p className="text-[10px] text-crimson font-bold uppercase tracking-widest">{optionsError}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {[0, 1, 2, 3].map((oi) => (
            <OptionInput
              key={oi}
              questionIndex={qIndex}
              optionIndex={oi}
              register={register}
              errors={errors}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Check: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
