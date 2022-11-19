export const QUICKBUTTONS = ({view, title, icon, onclick}) => {
    return (
        <button
        disabled={!view}
        className="quickAction"
        aria-label={title}
        title={title}
        onClick={onclick}
        style={{
            border: "1px solid transparent",
            padding: "1px",
            marginRight: "1em",
            cursor: "default",
            borderRadius: "4px",
        }}
        >
        <div>
            {icon}
        </div>
        </button>
    );
}
