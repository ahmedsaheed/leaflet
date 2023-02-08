import styled from "styled-components";

export const StyledFolder = styled.section`
  margin-top:2px;
  padding-left: ${(p) => p.theme.indent}px;
  .tree__file {
    padding-left: 10px;
  }
`;
