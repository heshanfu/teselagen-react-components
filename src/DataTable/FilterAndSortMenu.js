//@flow
import { DateInput, DateRangeInput } from "@blueprintjs/datetime";
import moment from "moment";
import { camelCase } from "lodash";
import classNames from "classnames";
import getMomentFormatter from "../utils/getMomentFormatter";
import { onEnterHelper } from "../utils/handlerHelpers";
import React from "react";
import type {
  TableDataTypes
  // SchemaForField,
  // QueryParams,
  // Paging,
} from "../flow_types";
import {
  Menu,
  Intent,
  MenuDivider,
  InputGroup,
  Classes
} from "@blueprintjs/core";
import DialogFooter from "../DialogFooter";
import "./style.css";
import "../toastr";

export default class FilterAndSortMenu extends React.Component {
  constructor(props) {
    super(props);
    const selectedFilter = camelCase(getFilterMenuItems(props.dataType)[0]);
    this.state = {
      selectedFilter,
      filterValue: ""
    };
  }
  props: {
    dataType: TableDataTypes,
    schemaForField: Object,
    filterOn: string,
    addFilters: Function,
    removeSingleFilter: Function
  };
  handleFilterChange = (selectedFilter: string) => {
    this.setState({ selectedFilter: camelCase(selectedFilter) });
  };
  handleFilterValueChange = (filterValue: string): void => {
    this.setState({ filterValue });
  };
  handleFilterSubmit = () => {
    const { filterValue, selectedFilter } = this.state;
    const { togglePopover } = this.props;
    const ccSelectedFilter = camelCase(selectedFilter);
    let filterValToUse = filterValue;
    if (ccSelectedFilter === "true" || ccSelectedFilter === "false") {
      //manually set the filterValue because none is set when type=boolean
      filterValToUse = ccSelectedFilter;
    }
    const { filterOn, addFilters, removeSingleFilter } = this.props;
    if (!filterValToUse) {
      return removeSingleFilter(filterOn);
    }
    addFilters([
      {
        filterOn,
        selectedFilter: ccSelectedFilter,
        filterValue: filterValToUse
      }
    ]);
    togglePopover();
  };
  UNSAFE_componentWillMount() {
    if (this.props.currentFilter) {
      this.setState({
        ...this.props.currentFilter
      });
    }
  }
  // handleSubmit(event) {
  //   alert('A name was submitted: ' + this.state.value);
  //   event.preventDefault();
  // }

  render() {
    const { selectedFilter, filterValue } = this.state;
    const { dataType, currentFilter, removeSingleFilter } = this.props;
    const {
      handleFilterChange,
      handleFilterValueChange,
      handleFilterSubmit
    } = this;
    const filterTypesDictionary = {
      none: "",
      startsWith: "text",
      endsWith: "text",
      contains: "text",
      isExactly: "text",
      inList: "text",
      true: "boolean",
      false: "boolean",
      dateIs: "date",
      isBetween: "dateRange",
      isBefore: "date",
      isAfter: "date",
      greaterThan: "number",
      lessThan: "number",
      inRange: "numberRange",
      equalTo: "number"
    };
    const filterMenuItems = getFilterMenuItems(dataType);
    const ccSelectedFilter = camelCase(selectedFilter);
    const requiresValue = ccSelectedFilter && ccSelectedFilter !== "none";

    return (
      <Menu className={"data-table-header-menu"}>
        <div className={"custom-menu-item"}>
          <div className={classNames(Classes.SELECT, Classes.FILL)}>
            <select
              onChange={function(e) {
                const ccSelectedFilter = camelCase(e.target.value);
                handleFilterChange(ccSelectedFilter);
              }}
              value={ccSelectedFilter}
            >
              {filterMenuItems.map(function(menuItem, index) {
                return (
                  <option key={index} value={camelCase(menuItem)}>
                    {menuItem}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className={"custom-menu-item"}>
          <FilterInput
            dataType={dataType}
            requiresValue={requiresValue}
            handleFilterSubmit={handleFilterSubmit}
            filterValue={filterValue}
            handleFilterValueChange={handleFilterValueChange}
            filterType={filterTypesDictionary[camelCase(selectedFilter)]}
          />
        </div>
        <MenuDivider />
        <DialogFooter
          secondaryClassName={Classes.POPOVER_DISMISS}
          onClick={() => {
            handleFilterSubmit();
          }}
          intent={Intent.SUCCESS}
          text="Filter"
          secondaryText={"Clear"}
          secondaryAction={() => {
            currentFilter && removeSingleFilter(currentFilter.filterOn);
          }}
        />
      </Menu>
    );
  }
}

class FilterInput extends React.Component {
  render() {
    const {
      handleFilterValueChange,
      handleFilterSubmit,
      filterValue,
      filterType
    } = this.props;
    //Options: Text, Single number (before, after, equals), 2 numbers (range),
    //Single Date (before, after, on), 2 dates (range)
    let inputGroup: JSX.Element = <div />;
    switch (filterType) {
      case "text":
        inputGroup = (
          <div className={"custom-menu-item"}>
            <InputGroup
              placeholder="Value"
              onChange={function(e) {
                handleFilterValueChange(e.target.value);
              }}
              {...onEnterHelper(handleFilterSubmit)}
              value={filterValue}
            />
          </div>
        );
        break;
      case "number":
        inputGroup = (
          <div className={"custom-menu-item"}>
            <InputGroup
              placeholder="Value"
              onChange={function(e) {
                handleFilterValueChange(e.target.value);
              }}
              {...onEnterHelper(handleFilterSubmit)}
              value={filterValue}
              type={"number"}
            />
          </div>
        );
        break;
      case "numberRange":
        inputGroup = (
          <div className={"custom-menu-item"}>
            <InputGroup
              placeholder="Value"
              onChange={function(e) {
                handleFilterValueChange([e.target.value, filterValue[1]]);
              }}
              {...onEnterHelper(handleFilterSubmit)}
              value={filterValue && filterValue[0]}
              type={"number"}
            />
            <InputGroup
              placeholder="Value"
              onChange={function(e) {
                handleFilterValueChange([filterValue[0], e.target.value]);
              }}
              {...onEnterHelper(handleFilterSubmit)}
              value={filterValue && filterValue[1]}
              type={"number"}
            />
          </div>
        );
        break;
      case "date":
        inputGroup = (
          <div className={"custom-menu-item"}>
            <DateInput
              value={filterValue ? moment(filterValue).toDate() : undefined}
              {...getMomentFormatter("MM/DD/YYYY")}
              minDate={moment(0).toDate()}
              maxDate={moment(9999999999999).toDate()}
              onChange={selectedDates => {
                handleFilterValueChange(selectedDates);
              }}
            />
          </div>
        );
        break;
      case "dateRange":
        const filterValueToUse =
          filterValue && filterValue.split && filterValue.split(".");
        inputGroup = (
          <div className={"custom-menu-item"}>
            <DateRangeInput
              value={
                filterValueToUse && filterValueToUse[0] && filterValueToUse[1]
                  ? [
                      new Date(filterValueToUse[0]),
                      new Date(filterValueToUse[1])
                    ]
                  : undefined
              }
              {...getMomentFormatter("MM/DD/YYYY")}
              minDate={moment(0).toDate()}
              maxDate={moment(99999999999999).toDate()}
              onChange={selectedDates => {
                if (selectedDates[0] && selectedDates[1]) {
                  handleFilterValueChange(selectedDates);
                }
              }}
            />
          </div>
        );
        break;
      default:
      // to do
    }
    return inputGroup;
  }
}

function getFilterMenuItems(dataType) {
  let filterMenuItems = [];
  if (dataType === "string") {
    filterMenuItems = [
      "Contains",
      "Starts with",
      "Ends with",
      "Is exactly",
      "In List"
    ];
  } else if (dataType === "lookup") {
    filterMenuItems = ["Contains", "Starts with", "Ends with", "Is exactly"];
  } else if (dataType === "boolean") {
    filterMenuItems = ["True", "False"];
  } else if (dataType === "number") {
    // else if (dataType === "lookup") {
    //   filterMenuItems = ["None"];
    // }
    filterMenuItems = [
      "Greater than",
      "Less than",
      "In range",
      "Equal to",
      "In List"
    ];
  } else if (dataType === "timestamp") {
    filterMenuItems = ["Is between", "Is before", "Is after"];
  }
  return filterMenuItems;
}
