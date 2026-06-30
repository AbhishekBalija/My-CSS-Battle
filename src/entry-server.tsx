import { renderToString } from "react-dom/server";
import App from "./App";

export function render(url: string) {
  return renderToString(<App url={url} />);
}
