import * as React from "react";
import "./IconCheckbox.css";
import { CheckCircle, Circle } from "./icons";

const IconCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = props => (
  <div style={{ width: "1em" }}>
    <label className="icon-checkbox" onClick={e => e.stopPropagation()}>
      <input {...props} type="checkbox" />
      <Circle className="unchecked" />
      <CheckCircle className="checked" />
    </label>
  </div>
);

export default IconCheckbox;
