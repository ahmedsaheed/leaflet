import { getBG, TAGIcon, MATERIALIcon, CLOCKIcon } from "./icons";

type IncomingProps = {
  [key: string]: any;
};

const checkIfIncomingIsObject = (incoming: IncomingProps) => {
  return typeof incoming != undefined 
};

export const METATAGS = ({ incoming }) => {
if (!checkIfIncomingIsObject(incoming) || incoming === undefined) return null;
  return incoming ? (
    <div style={{ display: "flex" }}>
      <div
        style={{
          alignItems: "center",
          padding: "0px 6px 10px",
          color: "#888888",
          display: "flex",
          width: "130px",
          flex: "0 0 auto",
        }}
      >
        <TAGIcon />
        &nbsp;Tags&nbsp;
      </div>
      <div
        style={{
          display: "flex",
          flex: "1 1 auto",
          alignItems: "center",
          minWidth: "0",
          paddingBottom: "10px",
        }}
      >
        <span
          style={{
            width: "100%",
            color: "#888888",
            whiteSpace: "nowrap",
            overflowX: "scroll",
          }}
        >
          {incoming?.map((tag) => (
            <code
              style={{
                borderRadius: "4px",
                marginRight: "1em",
                display: "inline",
                overflow: "hidden",
                color: "#000",
                backgroundColor: getBG(),
              }}
            >
              {tag?.toLowerCase()}
            </code>
          ))}
        </span>
      </div>
    </div>
  ) : null;
};

export const METAMATERIAL = ({ incoming }) => {
  
  if (!checkIfIncomingIsObject(incoming) || incoming === undefined) return null;
  return incoming ? (
    <div style={{ display: "flex" }}>
      <div
        style={{
          alignItems: "center",
          padding: "0px 6px 10px",
          color: "#888888",
          display: "flex",
          width: "130px",
          flex: "0 0 auto",
        }}
      >
        <MATERIALIcon />
        &nbsp;Materials&nbsp;
      </div>
      <div
        style={{
          flex: "1 1 auto",
          alignItems: "center",
          minWidth: "0",
          paddingBottom: "10px",
        }}
      >
        <span
          style={{
            width: "100%",
            color: "#888888",
            whiteSpace: "nowrap",
            overflowX: "scroll",
          }}
        >
          {incoming?.map((materials) =>
            Object.entries(materials).map(([key, value]) =>
              //TODO: Look for a better way to do this
              value?.toString().startsWith("http") && key != value ? (
                <code
                  style={{
                    borderRadius: "4px",
                    marginRight: "1em",
                    display: "inline",
                    overflow: "hidden",
                    color: "#000",
                    backgroundColor: getBG(),
                  }}
                >
                  <a
                    target="_blank"
                    style={{ textDecoration: "none", border: "none" }}
                    href={value.toString()}
                  >
                    {key.toLowerCase()}
                  </a>
                </code>
              ) : null
            )
          )}
        </span>
      </div>
    </div>
  ) : null;
};

export const METADATE = ({ incoming }) => {
  if (incoming === undefined) {
    return null;
  }
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          alignItems: "center",
          padding: "0px 6px 10px",
          color: "#888888",
          display: "flex",
          width: "130px",
          flex: "0 0 auto",
        }}
      >
        <CLOCKIcon />
        &nbsp;Created&nbsp;{" "}
      </div>
      <div
        style={{
          display: "flex",
          flex: "1 1 auto",
          alignItems: "center",
          minWidth: "0",
          paddingBottom: "10px",
        }}
      >
        <span style={{ color: "#888888" }}>{incoming}</span>
      </div>
    </div>
  );
};
