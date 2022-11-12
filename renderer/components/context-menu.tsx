import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  DotFilledIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import {BINIcon , RENAMEIcon, MOVEIcon, MARKDOWNIcon } from "./icons";
const ContextMenuDemo = ({ nameToDisplay, handleDelete }) => {
  const [bookmarksChecked, setBookmarksChecked] = React.useState(true);
  const [isRenaming, setIsRenaming] = React.useState(false);
  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger className="ContextMenuTrigger">
          <p
            style={{
              marginLeft: "0.7em",
              display: "inline",
              width: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              outline: "none",
            }}
          >
            <MARKDOWNIcon />
            &nbsp;
            {nameToDisplay}
          </p>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="ContextMenuContent">
            <ContextMenu.Item className="ContextMenuItem"
                onClick={handleDelete}
            >
             Delete<div className="RightSlot"><BINIcon/></div>
            </ContextMenu.Item>
            <ContextMenu.Item className="ContextMenuItem"
                onClick={() => setIsRenaming(true)}
            >
            Rename
              <div className="RightSlot"><RENAMEIcon/></div>
            </ContextMenu.Item>
            <ContextMenu.Item className="ContextMenuItem">
              Move to <div className="RightSlot"><MOVEIcon/></div>
            </ContextMenu.Item>

            <ContextMenu.Separator className="ContextMenuSeparator" />
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className="ContextMenuSubTrigger">
                Export 
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent
                  className="ContextMenuSubContent"
                  sideOffset={2}
                  alignOffset={-5}
                >
                  <ContextMenu.Item className="ContextMenuItem">
                    Export to PDF <div className="RightSlot">⌘+S</div>
                  </ContextMenu.Item>
                  <ContextMenu.Item className="ContextMenuItem">
                   Export to DOCX 
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>

            <ContextMenu.Separator className="ContextMenuSeparator" />
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </>
  );
};

export default ContextMenuDemo;
