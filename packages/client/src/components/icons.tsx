import * as React from "react";

const BaseIcon: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & { icon: string }
> = ({ icon, className, ...props }) => (
  <span {...props} className={`material-symbols-outlined ${className ?? ""}`}>
    {icon}
  </span>
);

export const CheckCircle: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
> = props => <BaseIcon icon="check_circle" {...props} />;

export const Circle: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
> = props => <BaseIcon icon="circle" {...props} />;

export const Delete: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
> = props => <BaseIcon icon="delete" {...props} />;
