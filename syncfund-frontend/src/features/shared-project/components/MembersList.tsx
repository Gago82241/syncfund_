import type { UserResponse } from '../../../types/api';

export function MembersList({ members, adminId }: { members: UserResponse[]; adminId: number }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {members.map((m) => (
        <li
          key={m.id}
          style={{
            padding: '0.5rem 0',
            fontSize: '0.9375rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{m.name}</span>
          {m.id === adminId && (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>Administrador</span>
          )}
        </li>
      ))}
    </ul>
  );
}
