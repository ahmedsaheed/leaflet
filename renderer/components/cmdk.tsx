import { COMMANDPALLETEOPENIcon, COMMANDPALLETESELECTIcon, DOCXIcon, PDFIcon } from "./icons";
import CommandPalette, { filterItems, getItemIndex } from "react-cmdk";

import path from "path";


export function CMDK ({
    onFileSelect, 
    onNewFile, 
    onCreatingFolder,
    files,
    pandocAvailable,
    name,
    onDocxConversion,
    onPdfConversion,
    search,
    setSearch,
    setClick,
    menuOpen,
    page


}){

const filteredItems = items(
    onFileSelect, 
    onNewFile, 
    onCreatingFolder,
    files,
    pandocAvailable,
    name,
    onDocxConversion,
    onPdfConversion,
    search
)


return (
    <CommandPalette
                        onChangeSearch={setSearch}
                        onChangeOpen={setClick}
                        search={search}
                        isOpen={menuOpen}
                        page={page}
                        placeholder="Select a command..."
                        footer={
                          <div
                            style={{
                              fontSize: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              userSelect: "none",
                            }}
                          >
                            <div
                              style={{
                                marginLeft: "2em",
                                display: "flex",
                                alignItems: "center",
                                paddingTop: "5px",
                                paddingBottom: "5px",
                              }}
                            >
                              <span
                                style={{ marginRight: "2em", color: "#888888" }}
                              >
                                <COMMANDPALLETESELECTIcon />
                                &nbsp;Select
                              </span>

                              <span style={{ color: "#888888" }}>
                                <COMMANDPALLETEOPENIcon />
                                &nbsp;Open
                              </span>
                            </div>
                          </div>
                        }
                      >
                        <CommandPalette.Page id="root">
                          {filteredItems.length ? (
                            filteredItems.map((list) => (
                              <CommandPalette.List
                                key={list.id}
                                heading={list.heading}
                              >
                                {list.items.map(({ id, ...rest }) => (
                                  <CommandPalette.ListItem
                                    showType={true}
                                    key={id}
                                    index={getItemIndex(filteredItems, id)}
                                    {...rest}
                                  />
                                ))}
                              </CommandPalette.List>
                            ))
                          ) : (
                            <CommandPalette.FreeSearchAction />
                          )}
                        </CommandPalette.Page>

                      </CommandPalette>
    )




}


const capitalize = (s: string) => {
    if (typeof s !== "string") return "";
    const words = s.split(" ");

    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1) + " ";
    }
    words.join(" ");

    return words;
  };

function items(
    onFileSelect: (file:any) => any, 
    onNewFile: () => any,
    onCreatingFolder: () => any,
    files: any,
    pandocAvailable: Boolean,
    name: string,
    onDocxConversion: () => any,
    onPdfConversion: () => any,
    search: string

){

    const filteredItems = filterItems(
        [
          {
            heading: "General",
            id: "general",
            items: [
              {
                id: "new",
                children: "New File",
                icon: "NewspaperIcon",
                showType: false,
                onClick: () => {onNewFile()},
              },
              {
                id: "folder",
                children: "New Folder",
                icon: "FolderOpenIcon",
                showType: false,
                onClick: () => {onCreatingFolder()}
              },
              {
                id: "export",
                showType: false,
                disabled: pandocAvailable ? false : true,
                children: `Export ${
                  name.endsWith(".md")
                    ? name.charAt(0).toUpperCase() + name.slice(1, -3)
                    : name.charAt(0).toUpperCase() + name.slice(1)
                } to PDF`,
                icon: () => <PDFIcon />,
                onClick: () => {onPdfConversion},
            
              },
              {
                disabled: pandocAvailable ? false : true,
                id: "export",
                showType: false,
                children: `Export ${
                  name.endsWith(".md")
                    ? name.charAt(0).toUpperCase() + name.slice(1, -3)
                    : name.charAt(0).toUpperCase() + name.slice(1)
                } to Docx`,
                icon: () => <DOCXIcon />,
                onClick: () => {onDocxConversion},
              },
            ],
          },
          {
            heading: "Files",
            id: "files",
            // @ts-ignore
            items: [
              ...files.map((file) => ({
                id: file.name,
                showType: false,
                //children: file.name,
                children: (
                  <p>
                    {file.name} —{" "}
                    <span style={{ fontSize: "12px", color: "#888888" }}>
                      {capitalize(
                        path.basename(path.dirname(file.path)).toLowerCase()
                      )}
                    </span>
                  </p>
                ),
                icon: "DocumentTextIcon",
                onClick: () => {onFileSelect(file)},
                
              })),
            ],
          },
          {
            heading: "Help",
            id: "advanced",
            items: [
              {
                id: "help",
                showType: false,
                children: "Help & Documentation",
                icon: "QuestionMarkCircleIcon",
                onClick: (event) => {
                  event.preventDefault();
                  open("https://github.com/ahmedsaheed/Leaflet");
                },
              },
              {
                id: "keys",
                showType: false,
                children: "Keyboard Shortcuts",
                icon: "KeyIcon",
                onClick: (event) => {
                  event.preventDefault();
                  open(
                    "https://github.com/ahmedsaheed/Leaflet#shortcuts-and-controls"
                  );
                },
              },
            ],
          },
        ],
        search
      );
    
      return filteredItems;
}
