import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { QuestionBuilder } from '../../components/polls/QuestionBuilder';
import { pollsApi } from '../../api/polls.api';
import { Check, ArrowRight, ArrowLeft, Send, Users, Eye, AlertCircle } from 'lucide-react';

export const createPollSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  isAnonymous: z.boolean().default(false),
  expiresAt: z.string().datetime().refine((val) => new Date(val) > new Date(), {
    message: 'Expiry must be in the future',
  }),
  questions: z.array(z.object({
    text: z.string().min(1, 'Question text is required').max(500).trim(),
    isRequired: z.boolean().default(false),
    order: z.number().int(),
    options: z.array(z.object({
      text: z.string().min(1, 'Option text is required').max(200).trim(),
      order: z.number().int(),
    }))
    .min(4, 'Each question must have exactly 4 options')
    .max(4, 'Each question must have exactly 4 options')
    .superRefine((opts, ctx) => {
      opts.forEach((opt, i) => {
        if (!opt.text.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Option ${i + 1} cannot be empty`,
            path: [i, 'text'],
          });
        }
      });
    }),
  }))
  .min(1, 'Add at least one question')
  .superRefine((questions, ctx) => {
    questions.forEach((q, qIdx) => {
      const texts = q.options.map(o => o.text.trim().toLowerCase());
      const duplicates = texts.filter((item, index) => texts.indexOf(item) !== index);
      if (duplicates.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Options within a question must be unique',
          path: [qIdx, 'options'],
        });
      }
    });
  }),
});

export type CreatePollFormValues = z.infer<typeof createPollSchema>;

const CreatePollPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema) as any,
    mode: 'all',
    defaultValues: {
      isAnonymous: false,
      questions: [
        {
          text: '',
          isRequired: false,
          order: 0,
          options: [
            { text: '', order: 0 },
            { text: '', order: 1 },
            { text: '', order: 2 },
            { text: '', order: 3 },
          ],
        },
      ],
    },
  });

  const onSubmit = async (data: CreatePollFormValues) => {
    setIsLoading(true);
    try {
      const response = await pollsApi.create(data);
      if (response.data.success) {
        navigate(`/dashboard`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create poll. Please check all fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentValues = watch();

  const isStep2Invalid = currentValues.questions.length === 0 || currentValues.questions.some(q => 
    !q.text.trim() || q.options.some(o => !o.text.trim())
  );

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Header */}
        <div className="mb-12 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-4xl text-charcoal">Create Poll</h1>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-10 h-1 bg-border transition-all duration-500 ${step >= s ? 'bg-crimson' : ''}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-8 border-b border-border pb-4 overflow-x-auto">
            <button 
              type="button"
              onClick={() => setStep(1)}
              className={`text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors ${step === 1 ? 'text-crimson' : 'text-muted'}`}
            >
              01 — Details
            </button>
            <button 
              type="button"
              onClick={() => step > 1 && setStep(2)}
              className={`text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors ${step === 2 ? 'text-crimson' : 'text-muted'} ${step < 2 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              02 — Questions
            </button>
            <button 
              type="button"
              onClick={() => step > 2 && setStep(3)}
              className={`text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors ${step === 3 ? 'text-crimson' : 'text-muted'} ${step < 3 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              03 — Review
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {/* Step 1: Poll Details */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-6">
                <Input
                  label="Poll Title"
                  placeholder="e.g., Annual Design Direction 2025"
                  {...register('title')}
                  error={errors.title?.message}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="label">Description (Optional)</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Provide context for your participants..."
                    className="input-field min-h-[120px] resize-none"
                  />
                  {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Expires At"
                  type="datetime-local"
                  {...register('expiresAt')}
                  error={errors.expiresAt?.message}
                />
                
                <div className="space-y-3">
                  <label className="label">Settings</label>
                  <div className="card flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-muted" />
                      <span className="text-xs font-semibold uppercase tracking-widest">Anonymous Responses</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register('isAnonymous')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-crimson"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <Button 
                  type="button" 
                  onClick={() => setStep(2)}
                  disabled={!currentValues.title?.trim() || !currentValues.expiresAt}
                >
                  Continue to Questions <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              <QuestionBuilder 
                control={control} 
                register={register} 
                errors={errors} 
              />

              {errors.questions?.message && (
                <p className="text-sm text-crimson font-medium mt-4">{errors.questions.message}</p>
              )}
              
              <div className="flex justify-between pt-8 items-center">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex flex-col items-end gap-2">
                  <Button 
                    type="button" 
                    onClick={() => setStep(3)}
                    disabled={isStep2Invalid}
                    title={isStep2Invalid ? "Fix errors above" : ""}
                  >
                    Review Poll <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {isStep2Invalid && (
                    <span className="text-[10px] text-crimson uppercase tracking-widest font-bold">Fix errors above</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-12 animate-fade-up">
              <div className="card border-crimson/20 bg-crimson/[0.02] space-y-6">
                <div className="flex items-center gap-4 text-crimson mb-4">
                  <Eye className="w-5 h-5" />
                  <p className="label text-crimson">Review & Finalize</p>
                </div>
                
                <div className="space-y-2">
                  <h2 className="font-display text-3xl text-charcoal">{currentValues.title}</h2>
                  {currentValues.description && (
                    <p className="text-muted text-sm italic">"{currentValues.description}"</p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                  <div className="space-y-1">
                    <p className="label opacity-50">Questions</p>
                    <p className="text-sm font-bold">{currentValues.questions.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="label opacity-50">Mode</p>
                    <p className="text-sm font-bold uppercase tracking-widest">
                      {currentValues.isAnonymous ? 'Anonymous' : 'Identified'}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="label opacity-50">Closes</p>
                    <p className="text-sm font-bold">
                      {new Date(currentValues.expiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="label">Question Preview</p>
                {currentValues.questions.map((q, i) => {
                  const hasEmptyOption = q.options.some(o => !o.text.trim());
                  return (
                    <div key={i} className={`card border-border space-y-4 ${hasEmptyOption ? 'border-crimson bg-crimson/[0.01]' : ''}`}>
                      <div className="flex justify-between">
                        <h4 className="font-display text-xl text-charcoal">
                          {i + 1}. {q.text.trim() || <span className="text-crimson italic">Empty Question</span>}
                        </h4>
                        {q.isRequired && <Check className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((o, oi) => {
                          const isBlank = !o.text.trim();
                          return (
                            <div key={oi} className={`px-4 py-3 border text-xs uppercase tracking-widest font-bold flex items-center justify-between ${isBlank ? 'border-crimson text-crimson bg-crimson/5' : 'border-border bg-border/10 text-charcoal'}`}>
                              <span>{o.text.trim() || `Option ${oi + 1}`}</span>
                              {isBlank && <AlertCircle className="w-3.5 h-3.5" />}
                            </div>
                          );
                        })}
                      </div>
                      {hasEmptyOption && (
                        <p className="text-[10px] text-crimson uppercase tracking-widest font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Empty option — go back and fix
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-8 border-t border-border">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Edit
                </Button>
                <Button 
                  type="submit" 
                  loading={isLoading} 
                  size="lg"
                  disabled={isStep2Invalid}
                >
                  Launch Poll <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </PageWrapper>
  );
};

export default CreatePollPage;
