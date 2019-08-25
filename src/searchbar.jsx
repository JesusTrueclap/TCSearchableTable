import React, { Component } from "react"
import styled from "styled-components"
import searchIcon from './search_icon.svg'

class SearchBar extends Component {
    constructor(props) {
      super(props)
      this.state = {
      isFocused:false,
    }
}
componentDidMount() {}
componentWillUnmount() {}


render() {
    try {
      return (
          <BarContainer className={this.state.isFocused? "isFocused" : ""}>
          <SearchIcon
           width="32px"
           height="auto"
            src={searchIcon}
          />
           <UserSearchInput 
           onFocus={()=>{this.setState({isFocused:true})}}
           onBlur={()=>{this.setState({isFocused:false})}}
           {...this.props}></UserSearchInput>
          </BarContainer>
     
      ) 
    } catch (e) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        console.log(e)
      }
      return null
    }
  }
}
export default SearchBar
const UserSearchInput = styled.input`
width:100%;
font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
outline:none;
background:transparent;
border:none;
overflow:hidden;
`
const BarContainer = styled.div`
display:flex;
flex-direction:row;
justify-content:center;
align-content:center;
align-items:center;
padding: 8px 10px 8px;
width:100%;
border-radius:4px;
background:rgb(232, 240, 254);
border:1px solid   rgb(223, 225, 229);
transition: all 0.2s ease-out;
&.isFocused{
  border-color: rgb(31, 109, 255) !important;
  box-shadow: rgb(31, 109, 255) 0px 0px 0px 1px !important;
}
`
const SearchIcon = styled.img`

`