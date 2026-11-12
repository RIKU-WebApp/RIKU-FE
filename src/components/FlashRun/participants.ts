import type EditableAttendanceList from './EditableAttendanceList';

interface LegacyParticipant {
  id: number;
  name: string;
  profileImage?: string | null;
  isPresent: boolean;
}

export type AttendanceUser = React.ComponentProps<typeof EditableAttendanceList>['users'][number];

export const normalizeParticipants = (participants: (LegacyParticipant | AttendanceUser)[]): AttendanceUser[] =>
  participants.map((participant) =>
    'userId' in participant
      ? participant
      : {
          userId: participant.id,
          userName: participant.name,
          userProfileImg: participant.profileImage,
          status: participant.isPresent ? 'ATTENDED' : 'PENDING',
        }
  );
