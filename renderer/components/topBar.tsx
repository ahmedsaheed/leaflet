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
            className={`topBarLeft ${fileTreeIsOpen ? "visible" : "closing"}`}
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



export const TopBarII = (click: boolean,fileTreeIsOpen: boolean) => {
  return (
        <div
          className="topBar"
          style={{
            position: "fixed",
            width: "100%",
            height: "40px",
            zIndex: click ? 0 : 100,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            style={{
               flex:fileTreeIsOpen ? "0 0 38%" :  "0 0 50%" 
            }}
        >
          </div>
          <div

            style={{
               flex: "0 0 50%",
               backgroundColor: "#101010 !important"
            }}
          >
          </div>
        </div>


  )
};
