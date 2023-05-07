import styled from "styled-components";

export const StyledTree = styled.div`
  line-height: 1.75;
  z-index: 1;

  .tree__input {
    width: auto;
  }
`;


export const StyledNameWrapper = styled.div`
  @media (prefers-color-scheme: dark) {
  :hover{
    background-color: rgb(255, 255, 255, 0.075);
    border-radius: 4px;
    color: white;
  }}
  @media (prefers-color-scheme: light) {
    :hover{
      background-color: rgb(0, 0, 0, 0.075);
      border-radius: 4px;
      color: black;
  }
  }
  width: 80%;
  margin-top: 2px;

`

export const ActionsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
  

  .actions {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-between;
    opacity: 0;
    pointer-events: none;
    transition: 0.2s;

    > svg {
      cursor: pointer;
      margin-left: 10px;
      transform: scale(1);
      transition: 0.2s;

      :hover {
        transform: scale(1.1);
      }
    }
  }

  &:hover .actions {
    opacity: 1;
    pointer-events: all;
    transition: 0.2s;
  }
`;

export const StyledName = styled.div`
  background-color: #fff;
    font-size: 14.5px;
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
    display: inline;
    width: 90%;
    white-space: nowrap;
    text-overflow: ellipsis;
    outline: none;
    display: flex;
    align-items: center;
    cursor: pointer;
  @media (prefers-color-scheme: dark) {
    background-color: #000000;
    color: #e5e5e5 !important;
    :hover{
      background-color: rgb(255, 255, 255, 0.075);
      border-radius: 4px;
      color: white;
  }
  }

  @media (prefers-color-scheme: light) {
    :hover{
      background-color: rgb(0, 0, 0, 0.075);
      border-radius: 4px;
      color: black;
  }
  }

 
`;

export const Collapse = styled.div`
  height: max-content;
  max-height: ${p => (p.isOpen ? "800px" : "0px")};
  overflow: hidden;
  transition: 0.3s ease-in-out;
`;

export const VerticalLine = styled.section`
  position: relative;
  :before {
    content: "";
    display: block;
    position: absolute;
    top: -0px; /* just to hide 1px peek */
    left: 4px;
    width: 0;
    height: 100%;
    z-index: -1;
  @media (prefers-color-scheme: dark) {
    border-left: 1px solid rgba(255, 255, 255, 0.12);
  }
  @media (prefers-color-scheme: light) {
    border-left: 1px solid rgba(0,0,0, 0.12);
  }
  }
`;
