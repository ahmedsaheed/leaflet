import path from 'path';

export const TopBar = ({parentDir, name}) => {
  return (
  <div
    style={{
      padding: "5px 12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <p style={{ margin: "0" }}>
      {path.basename(path.dirname(parentDir))}{" "}
      <span style={{ color: "grey" }}>/</span> {name.replace(/\.md$/, "")}{" "}
    </p>
  </div>
  )
};
