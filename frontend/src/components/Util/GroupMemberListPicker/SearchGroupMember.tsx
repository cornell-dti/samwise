import React, { ReactElement, ChangeEvent, useState } from 'react';
import { SamwiseUserProfile } from 'common/types/store-types';
import styles from './SearchGroupMember.module.scss';

type Props = {
  readonly members: SamwiseUserProfile[];
  readonly onMemberChange: (member: SamwiseUserProfile | undefined) => void;
};

type State = {
  readonly searchInput: string;
  readonly searchResults: readonly SamwiseUserProfile[];
};

export default function SearchGroupMember({ members, onMemberChange }: Props): ReactElement | null {
  const [{ searchInput, searchResults }, setState] = useState<State>({
    searchInput: '',
    searchResults: members,
  });

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const input = event.currentTarget.value;
    const newResults = members.filter((member) => member.name.toLowerCase().match(input));
    setState({ searchInput: input, searchResults: newResults });
  };

  if (members === null) {
    return null;
  }

  return (
    <div className={styles.MemberSearchBox}>
      <input
        type="text"
        placeholder="assign to"
        className={styles.SearchInput}
        value={searchInput}
        onChange={onSearchChange}
      />
      <div>
        {searchResults.map((user) => (
          <li>
            <input onClick={() => onMemberChange(user)} type="checkbox" />
            {user.name}
          </li>
        ))}
      </div>
    </div>
  );
}
