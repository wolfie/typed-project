import { cloneElement, FunctionComponent, h, toChildArray, VNode } from "preact";
import { createStarryNight } from "@wooorm/starry-night";
import tsx from "@wooorm/starry-night/lang/source.tsx";
import styles from "./Snippet.module.scss";
import "./Snippet.highlight.scss";
import { toH } from "hast-to-hyperscript";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

const Snippet: FunctionComponent<{ source: string }> = ({ source, children }) => {
  const [codeChildren, setCodeChildren] = useState(<code></code>);
  const [log, setLog] = useState<any[][]>([]);

  useEffect(() => {
    createStarryNight([tsx]).then(starryNight => {
      const scope = starryNight.flagToScope("tsx");
      if (!scope) {
        console.error("can't scope to typescript");
        return;
      }
      const root = starryNight.highlight(source.trim(), scope);
      const codeChildren = toH(h, root);
      codeChildren.type = "code";
      setCodeChildren(codeChildren);
    });
  }, []);

  const handleLog = useCallback<typeof console.log>((...args) => {
    console.log(...args);
    setLog(log => [...log, args]);
  }, []);

  const childrenWithLog = useMemo(
    () =>
      toChildArray(children).map(child =>
        typeof child !== "string" && typeof child !== "number" ? cloneElement(child, { log: handleLog }) : child
      ),
    [children]
  );

  const logOutput = useMemo(() => [...log].reverse().map(logline => logline.join(" ") + "\n"), [log]);

  return (
    <div class={styles.snippet}>
      <pre class="snippet-code">{codeChildren}</pre>
      {childrenWithLog}
      <div>
        <button onClick={() => setLog([])}>clear log</button>
        <div class={styles.log}>{logOutput}</div>
      </div>
    </div>
  );
};

export default Snippet;
