import * as t from "io-ts";
import { decode } from "typed-project-common/dist/io-ts-utils";

const getValue = (e: HTMLInputElement | HTMLTextAreaElement) =>
  e instanceof HTMLTextAreaElement
    ? e.value
    : ["radio", "checkbox"].includes(e.getAttribute("type") as any)
    ? e.checked
    : e.value;

const getFormValues = <PROPS extends { [key: string]: t.StringC | t.BooleanC }>(
  e: React.FormEvent,
  props: PROPS
): t.TypeOf<t.TypeC<PROPS>> =>
  decode(
    t.type(props),
    Object.fromEntries(
      [...e.currentTarget.querySelectorAll("*[name]")]
        .filter((el): el is HTMLInputElement | HTMLTextAreaElement => ["INPUT", "TEXTAREA"].includes(el.tagName))
        .map(el => [el.getAttribute("name")!, getValue(el)] as const)
    )
  );

export default getFormValues;
