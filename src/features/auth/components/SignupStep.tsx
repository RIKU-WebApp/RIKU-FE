import { type FormEventHandler, type ReactNode } from 'react';
import { useCreateAccountData } from '@features/auth/hooks/useCreateAccountData';

interface Props {
  title: string;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  disabled: boolean;
  action?: string;
}

export default function SignupStep({
  title,
  children,
  onSubmit,
  disabled,
  action = '다음',
}: Props) {
  const { errorMessage } = useCreateAccountData();
  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col pt-12">
      <h1 className="mb-8 text-2xl font-bold">{title}</h1>
      <div className="space-y-3">
        {children}
        {errorMessage && (
          <p role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
        )}
      </div>
      <div className="mt-auto pt-8">
        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-md bg-kuDarkGreen py-3 text-white disabled:bg-gray-100 disabled:text-gray-500"
        >
          {action}
        </button>
      </div>
    </form>
  );
}
