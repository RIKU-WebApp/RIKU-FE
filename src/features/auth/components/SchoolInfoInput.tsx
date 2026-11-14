import { ChevronDown } from 'lucide-react';
import SignupStep from './SignupStep';
import { majorsByCollege } from '@features/auth/majorsByCollege';
import useSchoolInfoInputData from '@features/auth/hooks/useSchoolInfoInputData';

export default function SchoolInfoInput() {
  const {
    college,
    major,
    suggestions,
    needsConfirmation,
    gotoNextScreenValid,
    handleChangeCollege,
    handleChangeMajor,
    handleSubmitSchoolInfo,
  } = useSchoolInfoInputData();
  return (
    <SignupStep
      title="학교 정보를 입력해 주세요."
      onSubmit={handleSubmitSchoolInfo}
      disabled={!gotoNextScreenValid}
      action={needsConfirmation ? '입력한 학과명으로 계속' : '다음'}
    >
      <div className="relative">
        <select
          aria-label="단과대학"
          value={college}
          onChange={handleChangeCollege}
          className="h-11 w-full appearance-none rounded-md border border-gray-300 bg-white pl-4 pr-10"
        >
          <option value="">단과대학 선택</option>
          {[...Object.keys(majorsByCollege), '언어교육원', 'KU자율전공학부', '대학원'].map(
            (name) => (
              <option key={name} value={name}>
                {name}
              </option>
            )
          )}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>
      {college && college !== 'KU자율전공학부' && (
        <>
          <div className="relative">
            <input
              aria-label="학과 또는 학부"
              list={suggestions.length ? 'signup-major-list' : undefined}
              enterKeyHint="next"
              maxLength={255}
              value={major}
              onChange={handleChangeMajor}
              placeholder="학과 또는 학부"
              aria-describedby={needsConfirmation ? 'major-error' : undefined}
              className="h-11 w-full rounded-md border border-gray-300 pl-4 pr-3 [&::-webkit-calendar-picker-indicator]:opacity-0"
            />
            {suggestions.length > 0 && (
              <ChevronDown
                aria-hidden="true"
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            )}
          </div>
          <datalist id="signup-major-list">
            {suggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {needsConfirmation && (
            <p id="major-error" role="alert" className="text-sm text-red-700">
              선택한 단과대학의 학과 목록에서 찾을 수 없습니다.
            </p>
          )}
        </>
      )}
    </SignupStep>
  );
}
