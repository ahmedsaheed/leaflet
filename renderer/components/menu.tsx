import "react-cmdk/dist/cmdk.css";
import CommandPalette, { filterItems, getItemIndex } from "react-cmdk";
import { useEffect, useState } from "react";
import React from "react";
import {ipcRenderer} from "electron";


export default function Menu(){


  type file = {
    path: string;
    name: string;
    body: string;
    structure: { [key: string]: any };
  };

  const [page, setPage] = useState<"root" | "projects">("root");
  const [open, setOpen] = useState<boolean>(true);
  const [files, setFiles] = useState<{ [key: string]: any }>([]);
  const [search, setSearch] = useState("");
  const [click, setClick] = useState<boolean>(false);
  // const [items, setItems] = useState<{[key: string]: any}>([]);

  useEffect(() => {

    ipcRenderer.invoke("getTheFile").then((files = []) => {
    console.log(files)
    setFiles(files);
     console.log("ietrm", files);
    });
    document.addEventListener("keydown", detectKeydown, true)
  }, [])

function detectKeydown(e: KeyboardEvent) {
  if (e.metaKey && e.key === "k") {
    e.preventDefault();
    e.stopPropagation();
     console.log("iT2", files);
    setClick(!click);
  } else if (e.key === "Escape") {
    setClick(false)
  }
}
 

  const filteredItems = filterItems(
      [
      {
        heading: "Files",
        id: "files",
        items: [
            files.map((files) => {
                return {
                    id: files.name,
                    children: files.name,
                    label: files.name,
                    onClick: () => {
                        console.log(files.name)
                    }
                }
            })
        ]

        
      },
      {
        heading: "Route",
        id: "home",
        items: [
          {
            id: "home",
            children: "Home",
            icon: "HomeIcon",
            href: "/",
          },
          {
            id: "books",
            children: "Books",
            icon: "BookOpenIcon",
            href: "/books",
          },
          {
            id: "writing",
            children: "Writings",
            icon: "DocumentTextIcon",
            href: "/second-brain",
          },
          {
            id: "projects",
            children: "Projects",
            icon: "CollectionIcon",
            href: "/projects",
          },
          {
            id: "photos",
            children: "Camera Roll",
            icon: "PhotographIcon",
            href: "/photos",
          },
        ],
      },
      // {
      //   heading: "General",
      //   id: "general",
      //   items: [
      //     {
      //       id: "theme",
      //       children: theme == "light" ? "Dark Mode" : "Light Mode",
      //       icon: theme === "dark" ? "LightBulbIcon" : "MoonIcon",
      //       // onClick: () => {toggleDarkMode()},
      //     },

      //   ],

      // },
      {
        heading: "Connect",
        id: "advanced",
        items: [
          {
            id: "github",
            children: "Github",
            href: "https://github.com/ahmedsaheed",
          },
          {
            id: "curious",
            children: "Curios",
            href: "https://curius.app/ahmed-saheed",
          },
          
          {
            id: "rss",
            children: "RSS",
            icon: "RssIcon",
            href: "/rss/feed.xml",
          },
          {
            id: "Email",
            children: "Email",
            icon: "InboxIcon",
            href: "mailto:ahmedsaheed2@outlook.com"
          },
          
        ],
      },
    ],
    search
  );

  return (
 <div style={{paddingLeft: "10px"}} className="menu" role="button" onClick={() => setClick(true)}>
        Utilities
{click && (
<CommandPalette
onChangeSearch={setSearch}
onChangeOpen={setClick}
search={search}
isOpen={open}
page={page}
>
<CommandPalette.Page id="root">
  {filteredItems.length ? (
    filteredItems.map((list) => (
      <CommandPalette.List key={list.id} heading={list.heading}>
        {list.items.map(({ id, ...rest }) => (
          <CommandPalette.ListItem
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

<CommandPalette.Page id="projects">
  {/* Projects page */}
</CommandPalette.Page>
</CommandPalette>

)
}

    </div>
  )
}
