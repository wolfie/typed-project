import * as React from "react";
import classes from "../classes";
import "./IconButton.css";

const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = props => (
  <button
    className={classes("icon-button", props.className)}
    {...props}
    onClick={e => {
      e.preventDefault();
      props.onClick?.(e);
    }}
  />
);

export default IconButton;
