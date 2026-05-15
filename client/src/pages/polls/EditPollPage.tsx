import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { QuestionBuilder } from '../../components/polls/QuestionBuilder';
import { pollsApi } from '../../api/polls.api';
import { analyticsApi } from '../../api/analytics.api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export const editPollSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  isAnonymous: z.boolean().default(false),
  expiresAt: z.string(),
  questions: z.array(z.object({
    text: z.string().min(1, 'Question text is required').max(500).trim(),
    isRequired: z.boolean().default(false),
    order: z.number().int(),
    options: z.array(z.object({
      text: z.string().min(1, 'Option text is required').max(200).trim(),
      order: z.number().int(),
    }))
    .min(4, 'Each question must have exactly 4 options')
    .max(4, 'Each question must have exactly 4 options'),
  })).min(1, 'At least 1 question required'),
});

export type EditPollFormValues = z.infer<typeof editPollSchema>;

const EditPollPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['poll-edit', id],
    queryFn: () => analyticsApi.get(id!),
    enabled: !!id,
  });

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<EditPollFormValues>({
    resolver: zodResolver(editPollSchema) as any,
  });

  useEffect(() => {
    if (data?.data?.analytics) {
      const poll = data.data.analytics;
      const formQuestions = poll.questions.map(q => ({
        text: q.text,
        isRequired: q.isRequired,
        order: 0,
        options: q.options.map((o, idx) => ({ text: o.text, order: idx }))
      }));
      
      reset({
        title: poll.pollTitle,
        description: '',
        isAnonymous: false,
        expiresAt: new Date().toISOString().slice(0, 16),
        questions: formQuestions
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: EditPollFormValues) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await pollsApi.update(id, values);
      navigate(`/polls/${id}/analytics`);
    } catch (err) {
      console.error(err);
      alert('Failed to update poll.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-4">
          <h2 className="font-display text-2xl text-charcoal">Failed to load poll.</h2>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-muted hover:text-charcoal transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-4xl text-charcoal">Edit Poll</h1>
          </div>
          <Button onClick={handleSubmit(onSubmit)} loading={isSaving}>
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          <div className="card space-y-6">
            <Input
              label="Poll Title"
              {...register('title')}
              error={errors.title?.message}
            />
            <div className="flex flex-col gap-1.5">
              <label className="label">Description (Optional)</label>
              <textarea
                {...register('description')}
                rows={4}
                className="input-field min-h-[120px] resize-none"
              />
            </div>
            <Input
              label="Expires At"
              type="datetime-local"
              {...register('expiresAt')}
              error={errors.expiresAt?.message}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-2xl text-charcoal">Questions</h2>
              <p className="label">Structure</p>
            </div>
            <QuestionBuilder control={control} register={register} errors={errors} />
          </div>

          <div className="flex justify-between pt-8 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default EditPollPage;
