import React, { Component } from "react"
import styled, { keyframes } from "styled-components"
import PropTypes from "prop-types"
import SortArrowIcon from "./sort_arrow.png"
import SearchBar from "./searchbar"
/*
  File: summarytable.jsx
  Props: tableData : Should be JSON data that will be used for the table
*/
// this is used for the object id in map functions
const IdKeymap = {
  keyID : "id"
}
class SummaryTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchInputValue: "",
      tableData: undefined,
      rowData: undefined,
      tableHeaders: null,
      tableRows: null,
      sortReversed: false,
      currentSortingQuery: "",
    }
    this.filteredData = this.filteredData.bind(this)
    this.setSortListByQuery = this.setSortListByQuery.bind(this)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.jsonDataSorter = this.jsonDataSorter.bind(this)

    this.refreshUITableRows = this.refreshUITableRows.bind(this)
    this.refreshUITableHeader = this.refreshUITableHeader.bind(this)
    this.getJSXRowsFromData = this.getJSXRowsFromData.bind(this)
    this.getJSXHeaderFromData = this.getJSXHeaderFromData.bind(this)
    this.generateTableHeaders = this.generateTableHeaders.bind(this)
    this.generateTableRow = this.generateTableRow.bind(this)

    this.getRandomInt = this.getRandomInt.bind(this)
    
  }
  componentDidMount() {
    let dataToDraw = this.props.tableData
    if (dataToDraw !== null && dataToDraw !== undefined) {
      let jsxRows = this.getJSXRowsFromData(dataToDraw)
      let jsxHeader = this.getJSXHeaderFromData(dataToDraw)
      this.setState({
        tableData: dataToDraw,
        tableHeaders: jsxHeader,
        tableRows: jsxRows,
      })
    }
  }
  componentDidUpdate(prevState) {
    if (
      prevState.tableData !== this.props.tableData &&
      (this.props.tableData !== undefined && this.props.tableData !== null)
    ) {
      // So here we have two sets. One is going to be filtered.
      var newDataToBeSet = this.props.tableData

      this.setState(
        {
          tableData: newDataToBeSet,
        },
        () => {
          if (this.state.currentSortingQuery !== "") {
            /*
                 This algorithm is smart. It handles the search for us as well. 
                 It also refreshes the rows for us! Meaning we don't need 
                 to do it ourselves. The dumb part is we must reverse the state variable
                 "sortreversed". 
                 TODO: Decouple direction from state.
            */
            this.setState(
              {
                sortReversed: !prevState.sortReversed,
              },
              () => {
                this.setSortListByQuery(
                  this.state.currentSortingQuery,
                  this.state.tableData
                )
              }
            )
          } else if (this.state.searchInputValue !== "") {
            /*
             This means we ONLY have a search query. Even less work. But we  
             have to refresh this list ourselves.
            */
            let queryResults = this.filteredData(
              this.state.searchInputValue,
              this.state.tableData
            )
            this.refreshUITableRows(queryResults)
          } else {
            /*
             This means we can just set the Table rows without thinking about much.
            */
            this.refreshUITableRows(this.state.tableData)
          }
          this.refreshUITableHeader(this.state.tableData)
        }
      )
    } else if (
      (this.props.tableData === null || this.props.tableData === undefined) &&
      prevState.tableData !== null
    ) {
      this.setState({
        tableData: null,
        tableHeaders: null,
        tableRows: null,
      })
    }
  }

  /*
    function: handleSearchInput(e)
    Sets the value of the current search query in the state. Then 
    we refresh the rows using the resulting data from the query.
  */
  handleSearchInput(e){
    try {
      if (
        e !== undefined &&
        (this.state.tableData !== null && this.state.tableData !== undefined)
      ) {
        let queryResults = this.filteredData(
          e.target.value,
          this.state.tableData
        )
        this.setState(
          {
            searchInputValue: e.target.value,
          },
          () => {
            this.refreshUITableRows(queryResults)
            this.refreshUITableHeader(this.state.tableData)
          }
        )
      } else {
        this.setState({
          searchInputValue: e.target.value,
        })
      }
    } catch (e) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        console.log(e)
      }
    }
  }
  /*
    function: refreshUITableRows(jsonData)
    Sets the rows displayed in the UI to some newly generated rows. Those rows
    are set in the state.
  */
  refreshUITableRows(jsonData){
    try {
      let refreshedRows = this.getJSXRowsFromData(jsonData)
      this.setState({
        tableRows: refreshedRows,
      })
    } catch (e) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        console.log(e)
      }
    }
  }
  refreshUITableHeader(jsonData){
    try {
      let refreshedHeader = this.getJSXHeaderFromData(jsonData)
      this.setState({
        tableHeaders: refreshedHeader,
      })
    } catch (e) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        console.log(e)
      }
    }
  }
  /*
    function: setSortListByQuery(query , jsonData)
    Using the query provided, we sort the provided json to the state. Then we 
    refresh the rows using the new state.
  */
  setSortListByQuery(query, jsonData){
    var sortedData = this.jsonDataSorter(query, jsonData)
    var currentReverseValue = false
    if (query === this.state.currentSortingQuery) {
      currentReverseValue = !this.state.sortReversed
    } else {
      currentReverseValue = false
    }
    if (currentReverseValue === true) {
      sortedData.reverse()
    }

    this.setState(
      {
        tableData: sortedData,
        currentSortingQuery: query,
        sortReversed: currentReverseValue,
      },
      () => {
        if (this.state.searchInputValue !== "") {
          // This means there is a search query we have to account for.
          let queryResults = this.filteredData(
            this.state.searchInputValue,
            this.state.tableData
          )
          this.refreshUITableRows(queryResults)
        } else {
          this.refreshUITableRows(this.state.tableData)
        }
        this.refreshUITableHeader(this.state.tableData)
      }
    )
  }

  /*
      function:  jsonDataSorter(keyName, jsonData)
      Returns sorted json data using a keyword.
    */
  jsonDataSorter(keyName, jsonData){
    let dataToBeSorted = jsonData
    dataToBeSorted.sort((a, b) => {
      // We need to check to see if this data is null or undefined just in case.
      let aVal = a[keyName]
      let bVal = b[keyName]
      if (typeof aVal === "undefined" || aVal === null) {
        aVal = ""
      }
      if (typeof bVal === "undefined" || bVal === null) {
        bVal = ""
      }
      if(typeof(aVal)==="number"){
        aVal = aVal.toString()
      }
      if(typeof(bVal)==="number"){
        bVal = bVal.toString()
      }

      return aVal.localeCompare(bVal)
    })

    return dataToBeSorted
  }
  /*
    function : filteredData(query, jsonData) 
    Returns the results of a query from jsonData. It is not case sensitive.
  */
  filteredData(query, jsonData){
    //Get the First Item, they should all have the same data contents.
    let arrayOfRows = []
    for (var i = 0; i < jsonData.length; i++) {
      var currentJsonObject = jsonData[i]
      //Get the keys for the object.
      var jsonKeys = Object.keys(currentJsonObject)
      let values = []
      var resultFound = false
      for (var j = 0; j < jsonKeys.length; j++) {
        let keyName = jsonKeys[j]
        let foundValue = currentJsonObject[keyName]
        // we Actually need to check to verify this item is not null or undefined
        if (foundValue === null || typeof foundValue === "undefined") {
          foundValue = ""
        }
        // Check if it is a number
        if(typeof(foundValue)==="number"){
          foundValue = foundValue.toString()

        }
        values.push(foundValue)
        try{
          if (
            foundValue.includes(query) ||
            foundValue.toLowerCase().includes(query)
          ) {
            resultFound = true
          }
        }catch(e){
          if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
            console.log(
              "Error Generating Table Header: Item was not a string or number."
            )
          }
        }
        
      }
      if (resultFound === true) {
        arrayOfRows.push(jsonData[i])
      }
    }
    //This is the filtered Data.
    return arrayOfRows
  }
  /******************************************************************************************/
  /*
    The functions in this block pertain exclusively to JSX object generation 
    for the rows and the headers. They should not pertain to sorting or filtering.
    Those responsibilities are handed to the functions above.  
  */
  /*
    Returns JSX Header objects from any jsonData give. Does not sort. 
  */
  getJSXHeaderFromData(jsonData){
    let tableTitles = Object.keys(jsonData[0])
    let tableHeaderGenerated = this.generateTableHeaders(tableTitles)
    return <thead>{tableHeaderGenerated}</thead>
  }
  /*
    Returns JSX row objects from any jsonData given. Does not sort.
  */
  getJSXRowsFromData(jsonData) {
    // Now lets make some rows of data. This is the parsing process.
    let keyPosition = -1
    //Get the First Item, they should all have the same data contents.
    let arrayOfRows = []
    for (var i = 0; i < jsonData.length; i++) {
      var currentJsonObject = jsonData[i]
      var jsonKeys = Object.keys(currentJsonObject)
      
      let values = []
      for (var j = 0; j < jsonKeys.length; j++) {
        let keyName = jsonKeys[j]
        if(keyName===IdKeymap.keyID){
          keyPosition = j
        }
        let foundValue = currentJsonObject[keyName]
        values.push(foundValue)
      }
      arrayOfRows.push(values)
    }
    let tableRowsGenerated = arrayOfRows.map((rowData) => {
      let keyID = rowData[keyPosition]
      if(typeof(keyID)==="undefined"){
        // Create a random number if its somehow undefined
        keyID = this.getRandomInt(999)+"-"+this.getRandomInt(999)
      }
    
      /*
        Generates a whole bunch of rows
      */
      return (
        <SummaryRow key={ keyID }>{this.generateTableRow(rowData)}</SummaryRow>
      )
    })

    return tableRowsGenerated
  }
  /*
    Generates a singular data meant to be inserted into a table row. Checks to see if the data 
    is a number or a string. We give a unique auto generated from two random integers.
  */
  generateTableRow(dataArray){
    let items = dataArray.map((name, id) => {
      if (typeof name === "string" || typeof name === "number") {
       
        return (
          <SummaryDataItem
            key={id}
          >
            {name}
          </SummaryDataItem>
        )
      } else {
        return (
          <SummaryDataItem
            key={
             id
            }
          >
            {" "}
          </SummaryDataItem>
        )
      }
    })
    return items
  }

  /*
    Takes in an array that can be displayed easily to the user. It should be a 
    string or number.
  */
  generateTableHeaders(headersArray){
    let Headers = headersArray.map(headerName => {
      if (typeof headerName === "string" || typeof headerName === "number") {
        return (
          <SummaryHeader
            onClick={() => {
              this.setSortListByQuery(headerName, this.state.tableData)
            }}
            key={headerName}
          >
            <RowCenteredFlex>
              {headerName}
              <ArrowImageDiv>
                <ArrowImage
                  className={
                    !this.state.sortReversed &&
                    this.state.currentSortingQuery === headerName
                      ? "selected"
                      : ""
                  }
                  src={SortArrowIcon}
                />
            
                <ArrowImage
                  className={
                    this.state.sortReversed &&
                    this.state.currentSortingQuery === headerName
                      ? "selected reversed"
                      : "reversed"
                  }
                  src={SortArrowIcon}
                />
              </ArrowImageDiv>
            </RowCenteredFlex>
          </SummaryHeader>
        )
      } else {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
          console.log(
            "Error Generating Table Header: Item was not a string or number."
          )
        }
        return <SummaryHeader> </SummaryHeader>
      }
    })
    return <SummaryRow>{Headers}</SummaryRow>
  }
  /************************************************************************************/

  /*
    Generates a random int from 0-max
  */
  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max))
  }
  render() {
    try {
      return (
        <Container>
          <div style={{ margin: "20px 0" }}>
            <SearchBar
              placeholder="Search Here"
              onChange={this.handleSearchInput}
              value={this.state.searchInputValue}
            />
          </div>

          <SummaryContainerTable cellspacing="0" cellpadding="0">
            {this.state.tableHeaders}
            <SummaryTableBody>{this.state.tableRows}</SummaryTableBody>
          </SummaryContainerTable>
          {this.props.isLoading ? <LoadingRow>Loading...</LoadingRow> : null}
        </Container>
      )
    } catch (e) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        console.log(e)
      }
      return null
    }
  }
}
export default SummaryTable
/***************** Props Types ********************** */
SummaryTable.defaultProps = {
  isLoading: false,
  tableData: null,
}
SummaryTable.propTypes = {
  isLoading: PropTypes.bool,
  tableData: PropTypes.array,
}

/*************************************** */

const SwipeAnimation = keyframes`
0%{

    
background-position: -100vw 0px;
}

100%{
background-position: 70vw 0px;

}
`

const SummaryContainerTable = styled.table`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  /* Create Separate Rows to make them fancy. */
  border-collapse: collapse;
  border: 0px solid black;
  position: relative;
  /* set the background color to transparent */
  background-color: transparent;
  max-width: 100%;
  border-radius: 3px;
  /* Adjust the width and layout of the table */
  table-layout: fixed;
  white-space: nowrap;
  margin: 0px auto;
  @media screen and (max-width: 768px) {
    table-layout: fixed;
    border-collapse: collapse;
    margin: 0px auto;
  }
`

const ArrowImageDiv = styled.div`
  width: 7px;
  height:auto;
  margin-left:4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  z-index: 2;
  position: relative;
  @media screen and (max-width: 768px) {
  }
`
const ArrowImage = styled.img`
  width: 100%;
  height:auto;
  opacity: 0.2;

  height: auto;
  &.reversed {
    transform: rotate(180deg);
  }
  &.selected {
    opacity: 1;
  }
`
const RowCenteredFlex = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
`
const SummaryTableBody = styled.tbody`
  background: transparent;
`
const Container = styled.div`
  position: relative;
  display: flex;
  padding: 0;
  align-content: center;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  max-width: 100%;
`

const SummaryHeader = styled.th`
  background: white;
  border: none;
  font-weight:500;
  color: #a4adbd;
  cursor: pointer;
  &:first-child {
  }
  @media screen and (max-width: 768px) {
    font-size: 14px;
    overflow: hidden;
  }
`
const SummaryRow = styled.tr`
  background-color: white;
  color: black;
  width: 100%;

  border: 3px solid rgba(239, 239, 239, 1);
  font-weight: 300;
  @media screen and (max-width: 768px) {
    box-shadow: none;
  }
`
const SummaryDataItem = styled.td`
  font-size: 14px;
  text-align: center;
  overflow: scroll;
  font-weight:400;

  white-space: nowrap;
  @media screen and (max-width: 768px) {
    padding: 8px 0;
    font-size: 14px;
    overflow: auto;
    word-break: break-all;
  }
`
const LoadingRow = styled.div`
  border: 3px solid rgba(239, 239, 239, 1);
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  animation: ${SwipeAnimation} 2s normal ease-in-out;
  animation-delay: 0.5s;
  animation-iteration-count: infinite;
  overflow: hidden;
  border-radius: 0em;
  background: -webkit-gradient(
    linear,
    left top,
    right top,
    from(rgba(181, 181, 181, 0)),
    color-stop(30%, rgba(181, 181, 181, 0)),
    color-stop(45%, rgba(250, 250, 250, 1)),
    color-stop(50%, rgba(250, 250, 250, 1)),
    color-stop(55%, rgba(250, 250, 250, 1)),
    color-stop(70%, rgba(181, 181, 181, 0)),
    to(rgba(181, 181, 181, 0))
  );

  background: -webkit-linear-gradient(
    left,
    rgba(181, 181, 181, 0) 0%,
    rgba(181, 181, 181, 0) 30%,
    rgba(250, 250, 250, 1) 45%,
    rgba(250, 250, 250, 1) 50%,
    rgba(250, 250, 250, 1) 55%,
    rgba(181, 181, 181, 0) 70%,
    rgba(181, 181, 181, 0) 100%
  );

  background: -o-linear-gradient(
    left,
    rgba(181, 181, 181, 0) 0%,
    rgba(181, 181, 181, 0) 30%,
    rgba(250, 250, 250, 1) 45%,
    rgba(250, 250, 250, 1) 50%,
    rgba(250, 250, 250, 1) 55%,
    rgba(181, 181, 181, 0) 70%,
    rgba(181, 181, 181, 0) 100%
  );

  background: linear-gradient(
    to right,
    rgba(181, 181, 181, 0) 0%,
    rgba(181, 181, 181, 0) 30%,
    rgba(250, 250, 250, 1) 45%,
    rgba(250, 250, 250, 1) 50%,
    rgba(250, 250, 250, 1) 55%,
    rgba(181, 181, 181, 0) 70%,
    rgba(181, 181, 181, 0) 100%
  ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  background-color: rgba(181, 181, 181, 0.2);
  opacity: 1;
  background-size: contain;
  background-repeat: no-repeat;
  background-origin: border-box;
  color: transparent;
  pointer-events: none;
`
