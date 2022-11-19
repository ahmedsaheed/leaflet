import { BOLDIcon, ITALICIcon, LINKIcon, CODEIcon } from "./icons";
import { BOLD, ITALIC, LINK, ADDCODE } from "../lib/util";
import { QUICKBUTTONS } from "./quickies";

export const EditorUtils = ({ view }) => {
  return <HandleUtils view={view} />;
};

const HandleUtils = ({ view }) => {
  return (
    <div
      className="flex"
      style={{
        width: "100%",
        maxWidth: "17.5em",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    <QUICKBUTTONS 
        view={view}
        title={"Add Bold"}
        icon={<BOLDIcon/>}
        onclick={() => BOLD(view)}
        />


    <QUICKBUTTONS 
        view={view}
        title={"Add Italic"}
        icon={<ITALICIcon/>}
        onclick={() => ITALIC(view)}
        />

    <QUICKBUTTONS 
        view={view}
        title={"Add Code"}
        icon={<LINKIcon/>}
        onclick={() => LINK(view)}
        />
      
    <QUICKBUTTONS 
        view={view}
        title={"Add Link"}
        icon={<CODEIcon/>}
        onclick={() => ADDCODE(view)}
        />
    </div>
  );
};
