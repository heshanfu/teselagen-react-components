const chance = new Chance();

const schema = {
  model: "material",
  fields: [
    {
      path: "notDisplayedField",
      isHidden: true,
      type: "string",
      displayName: "Not Displayed"
    },
    { path: "hungerLevel", type: "string" },
    { path: "type", type: "lookup", displayName: "Special Type" },
    { path: "isShared", type: "boolean", displayName: "Is Shared?" },
    {
      path: "name",
      type: "string",
      displayName: "Name",
      render: (value /* record, index */) => {
        return (
          <span
            style={{
              color: Math.random() > 0.5 ? "green" : "red"
            }}
          >
            {value}
          </span>
        );
      },
      renderTitleInner: (
        <span>
          <Icon icon="search-around" /> Name
        </span>
      )
    },
    { path: "createdAt", type: "timestamp", displayName: "Date Created" },
    { path: "updatedAt", type: "timestamp", displayName: "Last Edited" },
    {
      type: "lookup",
      displayName: "User Status",
      path: "user.status.name"
    },
    {
      sortDisabled: true,
      path: "user.lastName",
      type: "string",
      displayName: "Added By"
    }
  ]
};

class DataTableDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderUnconnectedTable: false,
      urlConnected: true,
      onlyOneFilter: false,
      inDialog: false,
      withSelectedEntities: false,
      ...JSON.parse(localStorage.tableWrapperState || "{}")
    };
    this.closeDialog = this.closeDialog.bind(this);
  }

  componentDidUpdate() {
    localStorage.tableWrapperState = JSON.stringify(this.state);
  }

  UNSAFE_componentWillMount() {
    //tnr: the following code allows the DataTable test to set defaults on the demo (which is used in the testing)
    this.setState(this.props);
  }

  closeDialog() {
    this.setState({
      inDialog: false
    });
  }

  render() {
    let ConnectedTable = withTableParams({
      //tnrtodo: this should be set up as an enhancer instead
      formName: "example 1", //this should be a unique name
      schema,
      defaults: {
        order: ["isShared"], //default sort specified here!
        pageSize: 5
      },
      urlConnected: this.state.urlConnected,
      onlyOneFilter: this.state.onlyOneFilter,
      withSelectedEntities: this.state.withSelectedEntities
    })(DataTableInstance);
    ConnectedTable = withRouter(ConnectedTable);

    return (
      <ApolloProvider client={client} store={store}>
        <div>
          <Router>
            <div>
              <h3>Demo specific options:</h3>
              <br />
              {renderToggle(
                this,
                "renderUnconnectedTable",
                "Render the table without the withTableParams wrapper." +
                  " It's just a simple disconnected react component. You'll" +
                  " need to handle paging/sort/filters yourself. Try hitting" +
                  " isInfinite to see something actually show up with it"
              )}
              {renderToggle(this, "inDialog", "Render the table in a dialog")}
              <h3>withTableParams options:</h3>
              <br />
              {renderToggle(
                this,
                "urlConnected",
                "Turn off urlConnected if you don't want the url to be updated by the table"
              )}
              {renderToggle(
                this,
                "onlyOneFilter",
                "Setting this true makes the table only keep 1 filter/search term in memory instead of allowing multiple"
              )}
              {renderToggle(
                this,
                "withSelectedEntities",
                "Setting this true makes the table pass the selectedEntities"
              )}
              <br />
              {this.state.inDialog ? (
                <Dialog
                  onClose={this.closeDialog}
                  title="Table inside a dialog"
                  isOpen={this.state.inDialog}
                >
                  <div className={Classes.DIALOG_BODY}>
                    <ConnectedTable />
                  </div>
                </Dialog>
              ) : this.state.renderUnconnectedTable ? (
                <DataTableInstance
                  {...{
                    tableParams: {
                      formName: "example 1", //this should be a unique name
                      schema,
                      urlConnected: this.state.urlConnected,
                      onlyOneFilter: this.state.onlyOneFilter
                    }
                  }}
                />
              ) : (
                <ConnectedTable />
              )}
              <br />
            </div>
          </Router>
        </div>
      </ApolloProvider>
    );
  }
}

const generateFakeRows = num => {
  return times(num).map(function(a, index) {
    return {
      id: index,
      notDisplayedField: chance.name(),
      name: chance.name(),
      isShared: chance.pickone([true, false]),
      user: {
        lastName: chance.name(),
        status: {
          name: chance.pickone(["pending", "added", "confirmed"])
        }
      },
      type: "denicolaType",
      addedBy: chance.name(),
      updatedAt: chance.date(),
      createdAt: chance.date()
    };
  });
};

const defaultNumOfEntities = 60;

class DataTableInstance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      additionalFilters: false,
      isSimple: false,
      isCopyable: false,
      noSelect: false,
      withTitle: true,
      isViewable: true,
      withSearch: true,
      withPaging: true,
      noDeselectAll: false,
      expandAllByDefault: false,
      withExpandAndCollapseAllButton: false,
      selectAllByDefault: false,
      withFilter: true,
      withSort: true,
      withSubComponent: true,
      noHeader: false,
      noFooter: false,
      noPadding: false,
      noFullscreenButton: false,
      hideDisplayOptionsIcon: false,
      withDisplayOptions: true,
      isInfinite: false,
      isSingleSelect: false,
      maxHeight: false,
      isLoading: false,
      disabled: false,
      compact: false,
      hidePageSizeWhenPossible: false,
      hideSelectedCount: false,
      showCount: false,
      doNotShowEmptyRows: false,
      withCheckboxes: true,
      numOfEntities: 60,
      selectedIds: undefined,
      alwaysRerender: false,
      entities: generateFakeRows(defaultNumOfEntities),
      ...JSON.parse(localStorage.tableState || "{}")
    };
    this.changeNumEntities = this.changeNumEntities.bind(this);
    this.changeSelectedRecords = this.changeSelectedRecords.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  componentDidUpdate() {
    localStorage.tableState = JSON.stringify(this.state);
  }

  changeNumEntities(e) {
    const numOfEntities = parseInt(e.target.value, 10);
    this.setState({
      numOfEntities,
      entities: generateFakeRows(numOfEntities)
    });
  }

  changeSelectedRecords(e) {
    const val = e.target.value;
    const selectedIds = (val.indexOf(",") > -1
      ? val.split(",").map(num => parseInt(num, 10))
      : [parseInt(val, 10)]
    ).filter(val => !isNaN(val));
    this.setState({
      selectedIds
    });
  }

  onRefresh() {
    alert("clicked refresh!");
  }

  render() {
    const { numOfEntities, entities, selectedIds } = this.state;
    const { tableParams, selectedEntities } = this.props;
    const { page, pageSize, isTableParamsConnected } = tableParams;
    let entitiesToPass = [];
    if (this.state.isInfinite || !isTableParamsConnected) {
      entitiesToPass = entities;
    } else {
      for (let i = (page - 1) * pageSize; i < page * pageSize; i++) {
        entities[i] && entitiesToPass.push(entities[i]);
      }
    }
    const additionalFilters = this.state.additionalFilters && [
      {
        filterOn: "notDisplayed", //remember this needs to be the camel cased display name
        selectedFilter: "Contains",
        filterValue: "aj"
      }
    ];
    return (
      <div>
        <h3>Table Level Options</h3>
        <br />
        {renderToggle(
          this,
          "additionalFilters",
          "Filters can be added by passing an additionalFilters prop. You can even filter on non-displayed fields"
        )}
        Set number of entities:{" "}
        <input
          type="number"
          value={numOfEntities}
          onChange={this.changeNumEntities}
        />
        <br />
        Select records by ids (a single number or numbers separated by ","):{" "}
        <input onChange={this.changeSelectedRecords} />
        {renderToggle(
          this,
          "isSimple",
          ` This sets: 
        noHeader: true,
        noFooter: true,
        noFullscreenButton: true,
        noPadding: true,
        hidePageSizeWhenPossible: true,
        isInfinite: true,
        hideSelectedCount: true,        
        withTitle: false,
        withSearch: false,
        withPaging: false,
        withExpandAndCollapseAllButton: false,
        expandAllByDefault: false,
        selectAllByDefault: false,
        withFilter: false,
        isCopyable: false,
        by default, but they are all 
        individually overridable (which 
          is why nothing changes when this is toggled here)
        `
        )}
        {renderToggle(this, "withTitle")}
        {renderToggle(this, "noSelect")}
        {renderToggle(this, "withSubComponent")}
        {renderToggle(this, "withSearch")}
        {renderToggle(
          this,
          "isViewable",
          "Make sure withCheckboxes is off when using this"
        )}
        {renderToggle(
          this,
          "hideDisplayOptionsIcon",
          "use this in conjunction with withDisplayOptions=true to have display options but not allow the user to see or edit them"
        )}
        {renderToggle(this, "withDisplayOptions")}
        {renderToggle(this, "withPaging")}
        {renderToggle(
          this,
          "noDeselectAll",
          "Prevent the table from being fully deselected. Useful when you want at least 1 entity selected"
        )}
        {renderToggle(this, "withExpandAndCollapseAllButton")}
        {renderToggle(this, "expandAllByDefault")}
        {renderToggle(this, "selectAllByDefault")}
        {renderToggle(this, "withFilter")}
        {renderToggle(this, "withSort")}
        {renderToggle(this, "noHeader")}
        {renderToggle(this, "noFooter")}
        {renderToggle(this, "noFullscreenButton")}
        {renderToggle(this, "noPadding")}
        {renderToggle(this, "isInfinite")}
        {renderToggle(this, "isLoading")}
        {renderToggle(this, "disabled")}
        {renderToggle(this, "hidePageSizeWhenPossible")}
        {renderToggle(this, "doNotShowEmptyRows")}
        {renderToggle(this, "withCheckboxes")}
        {renderToggle(this, "isSingleSelect")}
        {renderToggle(this, "hideSelectedCount")}
        {renderToggle(this, "showCount")}
        {renderToggle(this, "compact")}
        {renderToggle(this, "isCopyable")}
        {renderToggle(
          this,
          "maxHeight",
          "By default every table has a max height of 800px. Setting this true changes it to 200px"
        )}
        <Button onClick={() => {
          tableParams.selectRecords([1,2,3])
        }}>
          Select ids 1, 2, 3 (uses tableParams.selectRecords(id) method)
        </Button>
        <br></br>
        {selectedEntities && (
          <div>
            The following records are selected (pass withSelectedEntities: true
            to withTableParams):
            <div
              style={{
                height: 40,
                maxHeight: 40,
                maxWidth: 800,
                overflow: "auto"
              }}
            >
              {selectedEntities
                .map(record => `${record.id}: ${record.name}`)
                .join(", ")}
            </div>
          </div>
        )}
        PagingTool used outside of the datatable:
        <PagingTool
          {...tableParams}
          entities={entitiesToPass}
          entityCount={entities.length}
          onRefresh={this.onRefresh}
        />
        --------------
        <div className={"wrappingdiv"}>
          <DataTable
            {...tableParams}
            entities={entitiesToPass}
            entityCount={entities.length}
            onDoubleClick={function() {
              console.log("double clicked");
            }}
            topLeftItems={<Button>I'm in topLeftItems</Button>}
            SubComponent={this.state.withSubComponent ? SubComp : null}
            cellRenderer={{
              isShared: value => {
                return (
                  <span
                    style={{
                      color: value ? "green" : "red"
                    }}
                  >
                    {value ? "True" : "False"} <button>click me</button>
                  </span>
                );
              }
            }}
            additionalFilters={additionalFilters}
            title={"Demo table"}
            contextMenu={
              function(/*{ selectedRecords, history }*/) {
                return [
                  <MenuItem
                    key="menuItem1"
                    onClick={function() {
                      console.log("I got clicked!");
                    }}
                    text={"Menu text here"}
                  />,
                  <MenuItem
                    key="menuItem2"
                    onClick={function() {
                      console.log("I also got clicked!");
                    }}
                    text={"Some more"}
                  />
                ];
              }
            }
            isViewable={this.state.isViewable}
            withTitle={this.state.withTitle}
            noSelect={this.state.noSelect}
            isSimple={this.state.isSimple}
            withSearch={this.state.withSearch}
            withExpandAndCollapseAllButton={
              this.state.withExpandAndCollapseAllButton
            }
            expandAllByDefault={this.state.expandAllByDefault}
            selectAllByDefault={this.state.selectAllByDefault}
            withPaging={this.state.withPaging}
            noDeselectAll={this.state.noDeselectAll}
            withFilter={this.state.withFilter}
            withSort={this.state.withSort}
            noFullscreenButton={this.state.noFullscreenButton}
            noPadding={this.state.noPadding}
            noHeader={this.state.noHeader}
            noFooter={this.state.noFooter}
            withDisplayOptions={this.state.withDisplayOptions}
            hideDisplayOptionsIcon={this.state.hideDisplayOptionsIcon}
            isInfinite={this.state.isInfinite}
            isLoading={this.state.isLoading}
            disabled={this.state.disabled}
            compact={this.state.compact}
            hidePageSizeWhenPossible={this.state.hidePageSizeWhenPossible}
            doNotShowEmptyRows={this.state.doNotShowEmptyRows}
            withCheckboxes={this.state.withCheckboxes}
            isSingleSelect={this.state.isSingleSelect}
            hideSelectedCount={this.state.hideSelectedCount}
            showCount={this.state.showCount}
            isCopyable={this.state.isCopyable}
            {...(this.state.maxHeight
              ? {
                  maxHeight: "200px"
                }
              : {})}
            onRefresh={this.onRefresh}
            // history={history}
            onSingleRowSelect={noop}
            onDeselect={noop}
            onMultiRowSelect={noop}
            selectedIds={selectedIds}
          />
        </div>
        <br />
        <br />
      </div>
    );
  }
}

function noop() {}

function SubComp(row) {
  return (
    <div style={{ margin: 10 }}>
      {" "}
      !!Row Index: {row.index}
      {/* <DataTable
        formName={"something"}
        entities={[]}
        schema={{
          fields: [
            {
              path: "something"
            }
          ]
        }}
      /> */}
    </div>
  );
}

render(<DataTableDemo />);
