import React from "react";
import { InputGroup, Button, Classes } from "@blueprintjs/core";
import { onEnterHelper } from "../utils/handlerHelpers";

const SearchBar = ({ reduxFormSearchInput, setSearchTerm, maybeSpinner }) => {
  return (
    <InputGroup
      className={"pt-round datatable-search-input"}
      placeholder="Search..."
      {...reduxFormSearchInput.input}
      {...onEnterHelper(() => {
        setSearchTerm(reduxFormSearchInput.input.value);
      })}
      rightElement={
        maybeSpinner || (
          <Button
            className={Classes.MINIMAL}
            iconName={"pt-icon-search"}
            onClick={() => {
              setSearchTerm(reduxFormSearchInput.input.value);
            }}
          />
        )
      }
    />
  );
};

export default SearchBar;