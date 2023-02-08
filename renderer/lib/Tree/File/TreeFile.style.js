import styled from "styled-components";
export const StyledFile = styled.div`
  flex-wrap: nowrap;
  display: flex;
  align-items: center;
  font-weight: normal;
  padding-left: 15px;
  /* padding-left: ${(p) => p.theme.indent}px; */
  @media (prefers-color-scheme: dark) {
  .isActive{
    background-color: rgb(255, 255, 255, 0.075);
    border-radius: 4px;
    color: white;
  }
}
@media (prefers-color-scheme: light) {

.isActive{
    background-color: rgb(0, 0, 0, 0.075);
    border-radius: 4px;
    color: black;
  }
}

`;
