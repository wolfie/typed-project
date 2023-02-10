import { FunctionComponent } from "preact";

const buildHierarchy = (acc: (HTMLHeadingElement | HTMLHeadingElement[])[], el: HTMLHeadingElement) => {
  if (el.tagName === "H2") {
    acc.push(el);
  } else {
    const prevEntry = acc[acc.length - 1];
    if (Array.isArray(prevEntry)) prevEntry.push(el);
    else acc.push([el]);
  }
  return acc;
};

const Link = ({ e }: { e: HTMLHeadingElement }) => (
  <li>
    <a href={`#${e.id}`}>{e.textContent}</a>
  </li>
);

const TableOfContents: FunctionComponent = () => {
  const hierarchy = [...document.querySelectorAll<HTMLHeadingElement>("h2,h3")].reduce(buildHierarchy, []);
  return (
    <ul>
      {hierarchy.map(headingOrHeadings =>
        Array.isArray(headingOrHeadings) ? (
          <ul>
            {headingOrHeadings.map(heading => (
              <Link e={heading} />
            ))}
          </ul>
        ) : (
          <Link e={headingOrHeadings} />
        )
      )}
    </ul>
  );
};

export default TableOfContents;
