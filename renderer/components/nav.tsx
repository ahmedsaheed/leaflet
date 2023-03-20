import { AnimatePresence, motion } from "framer-motion";
import { HOMEIcon } from "./icons";
type Props = {
  open: boolean;
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
  setClick: () => void;
  click: boolean;
};
export const Nav = (prop: Props) => {
  return (
    <nav
      id="menu"
      className="drag custom-border z-40 flex flex-col justify-between border-r-[0.5px] bg-transparent pt-10"
    >
      <div className="flex flex-col overflow-y-hidden">
        <ul className="flex w-20 shrink-0 flex-col items-center justify-end bg-transparent px-5 pt-1 pb-px space-y-2.5">
          <li className="aspect-w-1 aspect-h-1 w-full">
            <span className="flex flex-col items-center justify-center rounded-full outline-none transition-all focus:outline-none sm:duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500">
              <HOMEIcon />
            </span>
          </li>
        </ul>
        <ul className="no-scrollbar flex w-20 grow flex-col items-center space-y-4 overflow-y-scroll bg-transparent py-4 px-5">
          <li className="aspect-w-1 aspect-h-1 w-full">
            <span
              onClick={
                !prop.open ? prop.handleDrawerOpen : prop.handleDrawerClose
              }
              className=" cursor-pointer flex flex-col items-center justify-center rounded-full transition-all duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500"
              aria-current="page"
            >
              <svg
                style={{ transform: "rotate(346deg)" }}
                className="w-10 h-8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={0.1}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 28 28"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.809 5.242a1.25 1.25 0 00-1.531.884L6.042 18.2a1.25 1.25 0 00.884 1.53l9.66 2.59a1.25 1.25 0 001.53-.885l3.236-12.074a1.25 1.25 0 00-.884-1.53l-9.66-2.589zm-2.98.496a2.75 2.75 0 013.368-1.945l9.66 2.588A2.75 2.75 0 0122.8 9.75l-3.236 12.074a2.75 2.75 0 01-3.368 1.945L6.538 21.18a2.75 2.75 0 01-1.944-3.368L7.829 5.738z"
                  fill="white"
                ></path>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.518 8.27a.75.75 0 01.919-.53l7.241 1.94a.75.75 0 01-.388 1.449l-7.242-1.94a.75.75 0 01-.53-.919zM9.677 11.41a.75.75 0 01.918-.531l7.242 1.94a.75.75 0 11-.388 1.45l-7.242-1.941a.75.75 0 01-.53-.919zM8.836 14.549a.75.75 0 01.918-.53l4.83 1.293a.75.75 0 11-.388 1.45l-4.83-1.295a.75.75 0 01-.53-.918z"
                  fill="white"
                ></path>
              </svg>
            </span>
          </li>

          <div className="custom-border mx-auto h-px w-3/4 flex-shrink-0 grow-0 border-b-[0.5px]" />
          {!prop.open && (
            <AnimatePresence>
              <motion.li
                className="aspect-w-1 aspect-h-1 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span
                  onClick={prop.setClick}
                  className="cursor-pointer flex flex-col items-center justify-center rounded-full transition-all duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500"
                >
                  <svg
                    className="h-[1.25rem] w-[1.25rem] font-medium text-palette-900 transition-all duration-300 active:text-palette-500 smarthover:hover:text-palette-500"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-width="2"
                      d="M21 21l-3.64-3.64m0 0c1.62-1.63 2.63-3.88 2.63-6.37 0-4.98-4.03-9-9-9 -4.98 0-9 4.02-9 9 0 4.97 4.02 9 9 9 2.48 0 4.73-1.01 6.36-2.64Z"
                    ></path>
                  </svg>
                </span>
              </motion.li>
            </AnimatePresence>
          )}
        </ul>
      </div>
      <ul className="flex w-20 flex-col items-center space-y-5 bg-transparent px-5 pb-5">
        <li className="aspect-w-1 aspect-h-1 relative w-full">
          <div
            className="absolute top-[50%] left-[50%] h-[115%] w-[115%] -translate-y-[50%] -translate-x-[50%] rounded-full"
            style={{
              background:
                "conic-gradient(var(--theme-primary-300) 0%, var(--theme-palette-0) 15%)",
            }}
          />
          <div className="absolute top-[50%] left-[50%] h-[115%] w-[115%] -translate-y-[50%] -translate-x-[50%] rounded-full bg-primary-400 opacity-5" />
          <span className="flex flex-col items-center justify-center rounded-full transition-all duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500">
            <svg
              className="w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                strokeLinecap="round"
                strokeWidth={2}
                stroke="currentColor"
                fill="none"
                strokeLinejoin="round"
              >
                <path d="M12 4c-.7 0-1.39-.27-1.82-.82l-.46-.59C9.1 1.79 8 1.58 7.13 2.08l-1.31.75c-.87.5-1.23 1.56-.86 2.48l.27.68c.26.64.14 1.37-.21 1.97v0c-.35.6-.93 1.07-1.62 1.16l-.74.09c-1 .13-1.73.98-1.73 1.98v1.5c0 1 .73 1.84 1.72 1.98l.73.09c.69.09 1.26.56 1.61 1.16v0c.34.6.46 1.32.2 1.97l-.28.68c-.38.92-.02 1.98.85 2.48l1.3.75c.86.5 1.96.28 2.58-.51l.45-.59c.42-.56 1.11-.82 1.81-.82v0 0c.69 0 1.38.26 1.81.81l.45.58c.61.79 1.71 1 2.58.5l1.3-.76c.86-.51 1.22-1.57.85-2.49l-.28-.69c-.27-.65-.15-1.38.2-1.98v0c.34-.61.92-1.08 1.61-1.17l.73-.1c.99-.14 1.72-.99 1.72-1.99v-1.51c0-1.01-.74-1.85-1.73-1.99l-.74-.1c-.7-.1-1.27-.57-1.62-1.17v0c-.35-.61-.47-1.33-.21-1.98l.27-.69c.37-.93.01-1.99-.86-2.49l-1.31-.76c-.87-.51-1.97-.29-2.59.5l-.46.58c-.43.55-1.12.81-1.82.81v0 0Z" />
                <path d="M15 12c0 1.65-1.35 3-3 3 -1.66 0-3-1.35-3-3 0-1.66 1.34-3 3-3 1.65 0 3 1.34 3 3Z" />
              </g>
            </svg>
          </span>
        </li>
        <div className="custom-border mx-auto h-px w-3/4 border-t-[0.5px]" />
        <li className="aspect-w-1 aspect-h-1 w-full">
          <a
            className="flex flex-col items-center justify-center rounded-full outline-none transition-all focus:outline-none sm:duration-300 bg-palette-0 text-palette-600 smarthover:hover:text-primary-500"
            href="/dashboard/settings"
          >
            <svg
              className="w-6"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                strokeLinecap="round"
                strokeWidth={2}
                stroke="currentColor"
                fill="none"
                strokeLinejoin="round"
              >
                <path d="M4 18.8C4 16.149 6.14 14 8.8 14h6.4c2.65 0 4.8 2.14 4.8 4.8v0c0 1.76-1.44 3.2-3.2 3.2H7.2C5.43 22 4 20.56 4 18.8v0Z" />
                <path d="M16 6c0 2.2-1.8 4-4 4 -2.21 0-4-1.8-4-4 0-2.21 1.79-4 4-4 2.2 0 4 1.79 4 4Z" />
              </g>
            </svg>
          </a>
        </li>
      </ul>
    </nav>
  );
};
