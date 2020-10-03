import React, { ReactElement, ChangeEvent, useState } from "react";
import Fuse from "fuse.js";
import { FuseItem } from "../SearchBox/types";
import styles from "../GroupMemberListPicker/SearchGroupMember.module.scss";

type Props<T extends FuseItem> = {
  readonly fuse: Fuse<T>;
  readonly placeholder?: string;
  readonly inputClassname: string;
};

type State<T> = {
  readonly searchInput: string;
  readonly searchResults: readonly T[];
};

const GroupMemberSearchBox = <T extends FuseItem>({
  placeholder,
  fuse,
  inputClassname,
}: Props<T>): ReactElement => {
  const [{ searchInput, searchResults }, setState] = useState<State<T>>({
    searchInput: "",
    searchResults: [],
  });

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const input = event.currentTarget.value;
    if (input.length > 1) {
      const newResults = fuse.search(input).map((result) => result.item) as T[];
      setState({ searchInput: input, searchResults: newResults });
    } else {
      setState({ searchInput: input, searchResults: [] });
    }
  };

  return (
    <div className={styles.MemberSearchBox}>
      <input
        type="text"
        placeholder={placeholder}
        className={inputClassname}
        value={searchInput}
        onChange={onSearchChange}
      />
      <div>
        {searchResults.map((item) => (
          <li>{item.value}</li>
        ))}
      </div>
    </div>
  );
};

export default GroupMemberSearchBox;
