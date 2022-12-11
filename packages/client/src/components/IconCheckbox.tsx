import * as React from "react";
import classes from "../classes";
import "./IconCheckbox.css";
import { CheckCircle, Circle } from "./icons";

const IconCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { disabledTitle?: string }> = ({
  disabledTitle,
  ...props
}) => (
  <div
    className={classes("icon-checkbox", { disabled: props.disabled })}
    title={props.disabled ? disabledTitle : undefined}
  >
    <label onClick={e => e.stopPropagation()}>
      <input {...props} type="checkbox" />
      <Circle className="unchecked" />
      <CheckCircle className="checked" />
    </label>
  </div>
);

export default IconCheckbox;
