import { FunctionalComponent, render } from "preact";
import { Suspense, lazy } from "preact/compat";
import "./index.css";
import "./index.scss";
import Snippet from "./Snippet";
import TableOfContents from "./TableOfContents";

const LazyLoadingError: FunctionalComponent<{ name: string }> = ({ name }) => <div>Cannot load {name}</div>;

render(<TableOfContents />, document.getElementById("TableOfContents")!);

const addExample = async (snippetName: string) => {
  const sourceCode = await import(`./snippets/snippet-${snippetName}.tsx?raw`).then(
    (module: { default: string }) => module.default
  );

  const element = document.getElementById(snippetName);
  if (!element) {
    console.error(`Can't find element with id "${snippetName}"`);
    return;
  }
  const Component = lazy<FunctionalComponent>(() =>
    import(`./snippets/snippet-${snippetName}.tsx`).catch(() => ({
      default: () => <LazyLoadingError name={snippetName} />,
    }))
  );

  render(
    <Suspense fallback={<div>loading...</div>}>
      <Snippet source={sourceCode}>
        <Component />
      </Snippet>
    </Suspense>,
    element
  );
};

addExample("GenericsSelect");
