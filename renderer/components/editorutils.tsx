import { BOLDIcon, ITALICIcon, LINKIcon, CODEIcon } from "./icons";
import { BOLD, ITALIC, LINK, ADDCODE, TABLE, STRIKETHROUGH, ADDYAML } from "../lib/util";
import { QUICKBUTTONS } from "./quickies";

export const EditorUtils = ({ view }) => {
  return <HandleUtils view={view} />;
};

const HandleUtils = ({ view }) => {
  return (
    <div
      style={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "12px",
      }}
    >
      <div
        style={{
          display: "inline",
          borderRight: "1px solid grey",
          marginRight: "15px",
        }}
      ></div>
      <QUICKBUTTONS
        view={view}
        title={"Add Bold"}
        icon={<strong>Bold</strong>}
        onclick={() => BOLD(view)}
      />

      <QUICKBUTTONS
        view={view}
        title={"Add Italic"}
        icon={<em>Italic</em>}
        onclick={() => ITALIC(view)}
      />

      <QUICKBUTTONS
        view={view}
        title={"Add Code"}
        icon={<strike>Strikethrough</strike>}
        onclick={() => STRIKETHROUGH(view)}
      />

      {/* Create a vertical divider*/}
      <div
        style={{
          display: "inline",
          borderRight: "1px solid grey",
          marginRight: "15px",
        }}
      ></div>

      <QUICKBUTTONS
        view={view}
        title={"Add Code"}
        icon={"Link"}
        onclick={() => LINK(view)}
      />

      <QUICKBUTTONS
        view={view}
        title={"Add Link"}
        icon={"Code"}
        onclick={() => ADDCODE(view)}
      />

      <QUICKBUTTONS
        view={view}
        title={"Add Table"}
        icon={"Table"}
        onclick={() => TABLE(view)}
      />

      <QUICKBUTTONS
        view={view}
        title={"Add Footnote"}
        icon={"Footnote"}
        onclick={() => ADDCODE(view)}
      />


      <QUICKBUTTONS
        view={view}
        title={"Add Metadata"}
        icon={"Metadata"}
        onclick={() => ADDYAML(view)}
      />
    </div>
  );
};
