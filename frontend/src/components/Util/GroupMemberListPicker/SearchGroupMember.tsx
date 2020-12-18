import React, { ReactElement, ChangeEvent, SyntheticEvent, useState } from 'react';
import { SamwiseUserProfile } from 'common/types/store-types';
import styles from './SearchGroupMember.module.scss';

type Props = {
  readonly members: readonly SamwiseUserProfile[];
  readonly onMemberChange: (member: readonly SamwiseUserProfile[] | undefined) => void;
  readonly resetTask: () => void;
};

type State = {
  readonly searchInput: string;
  readonly searchResults: readonly SamwiseUserProfile[];
  readonly selectedMembers: readonly SamwiseUserProfile[];
};

export default function SearchGroupMember({
  members,
  onMemberChange,
  resetTask,
}: Props): ReactElement | null {
  const [{ searchInput, searchResults, selectedMembers }, setState] = useState<State>({
    searchInput: '',
    searchResults: members,
    selectedMembers: [],
  });

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const input = event.currentTarget.value;
    const newResults = members.filter((member) =>
      member.name.toLowerCase().match(input.toLowerCase())
    );
    setState({ searchInput: input, searchResults: newResults, selectedMembers });
  };

  const handleCheck = (member: SamwiseUserProfile | undefined): void => {
    if (!member) return;
    let newSelectedMembers;
    if (selectedMembers.includes(member)) {
      // remove member from selectedMembers
      newSelectedMembers = selectedMembers.filter((m) => m.email !== member.email);
    } else {
      // add member to selectedMembers
      newSelectedMembers = selectedMembers.concat(member);
    }
    setState({ searchInput, searchResults, selectedMembers: newSelectedMembers });
  };

  const assignSelectedMembers = () => (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Prevent passing an empty list to onMemberChange
    if (!selectedMembers || selectedMembers.length === 0) {
      onMemberChange(undefined);
    } else {
      onMemberChange(selectedMembers);
    }
  };

  const clearSelection = () => (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setState({ searchInput: '', searchResults: members, selectedMembers: [] });
    resetTask();
  };

  const isChecked = (member: SamwiseUserProfile | undefined): boolean => {
    if (!member || !selectedMembers.includes(member)) return false;
    return true;
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
      <div className={styles.MemberSearchResults}>
        {searchResults.map((user) => (
          <li className={styles.MemberCheckbox} key={user.email}>
            <label htmlFor={user.email}>
              <input
                type="checkbox"
                checked={isChecked(user)}
                onChange={() => handleCheck(user)}
                id={user.email}
              />
              <span>{user.name}</span>
            </label>
          </li>
        ))}
      </div>
      <div className={styles.FormOptions}>
        <button type="submit" onClick={clearSelection()} className={styles.FormButton}>
          cancel
        </button>
        <button type="submit" onClick={assignSelectedMembers()} className={styles.FormButton}>
          DONE
        </button>
      </div>
    </div>
  );
}
