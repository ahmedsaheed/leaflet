export const TopBar = (click: boolean,fileTreeIsOpen: boolean) => {
  return (
        <div
          className="topBar"
          style={{
            position: "fixed",
            width: "100%",
            height: "40px",
            zIndex: click ? 0 : 100,
          }}
        >
          <div
            className="topBarLeft"
            style={{
              width: "17.5em",
              height: "40px",

              display: fileTreeIsOpen ? "block" : "none",
            }}
          >
          </div>
        </div>


  )
};
