import {
  DOCXIcon,
  PDFIcon,
} from "./icons";
import CommandPalette, { filterItems, getItemIndex, } from "react-cmdk";
import { shell } from "electron";
import path from "path";
import {Cmdkfooter}  from "./cmdk-footer";
export function CMDK({
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
  page,
  value
}) {
  const filteredItems = items(
    onFileSelect,
    onNewFile,
    onCreatingFolder,
    files,
    pandocAvailable,
    name,
    onDocxConversion,
    onPdfConversion,
    search,
    value
  );

  return (
    <CommandPalette
      onChangeSearch={setSearch}
      onChangeOpen={setClick}
      search={search}
      isOpen={menuOpen}
      page={page}
      placeholder="Select a command..."
      footer={

      <Cmdkfooter />
      }
    >
      <CommandPalette.Page id="root">
        {filteredItems.length ? (
          filteredItems.map((list) => (
            <CommandPalette.List key={list.id} heading={list.heading}>
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
  );
}

const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  const words = s.split(" "); 

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substring(1) + " ";
  }
  words.join(" ");

  return words;
};

type FileType ={
    name: string;
    path: string;
}

function items(
  onFileSelect: (file: any) => any,
  onNewFile: () => any,
  onCreatingFolder: () => any,
  files: Array<FileType>,
  pandocAvailable: Boolean,
  name: string,
  onDocxConversion: (value:string, name:string) => void,
  onPdfConversion: (value: string, name: string) => void,
  search: string,
  value: string
) {


function mapItems (files: Array<FileType>) {
  return  [...files.map((file) => ({
            id: file.name,
            showType: false,
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
            onClick: () => {
              onFileSelect(file);
            },
          }))]
}
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
            onClick: () => {
              onNewFile();
            },
          },
          {
            id: "folder",
            children: "New Folder",
            icon: "FolderOpenIcon",
            showType: false,
            onClick: () => {
              onCreatingFolder();
            },
          },
          {
            id: "export",
            showType: false,
            disabled: pandocAvailable ? false : true,

            children: `Export current file to pdf`,
            icon: () => <PDFIcon />,
            onClick: () => {
              onPdfConversion(value, name);
            },
          },
          {
            disabled: pandocAvailable ? false : true,
            id: "export",
            showType: false,
            children: `Export current file to docx`,
            icon: () => <DOCXIcon />,
            onClick: () => {
              onDocxConversion(value, name)
            },
          },
        ],
      },
      {
        heading: "Files",
        id: "files",
        //@ts-ignore
        items: mapItems(files),
      },
      {
        heading: "Help",
        id: "advanced",
        items: [
         
          {
            id: "keys",
            showType: false,
            children: "Keyboard Shortcuts",
            icon: "KeyIcon",
            onClick: (event: React.MouseEvent<HTMLElement>) => {
              event.preventDefault();
              shell.openExternal(
                "https://github.com/ahmedsaheed/Leaflet#shortcuts-and-controls"
              );
            },
          },
         {
            id: "help",
            showType: false,
            children: "Help & Documentation",
            icon: "QuestionMarkCircleIcon",
            onClick: (event: React.MouseEvent<HTMLElement>) => {
              event.preventDefault();
              shell.openExternal("https://github.com/ahmedsaheed/Leaflet");
            },
          },
        ],
      },
    ],
    search
  );

  return filteredItems;
}
